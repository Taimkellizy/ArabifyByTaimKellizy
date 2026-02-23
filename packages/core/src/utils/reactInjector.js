import { parse } from "@babel/parser";

// Helper to manually traverse AST since we might not have @babel/traverse
const traverse = (node, visitor) => {
  if (!node || typeof node !== "object") return;

  if (visitor[node.type]) {
    visitor[node.type](node);
  }

  for (const key in node) {
    if (key === "loc" || key === "start" || key === "end" || key === "comments")
      continue;
    const child = node[key];
    if (Array.isArray(child)) {
      child.forEach((c) => traverse(c, visitor));
    } else if (child && typeof child === "object") {
      traverse(child, visitor);
    }
  }
};

const detectIndentation = (code) => {
  const lines = code.split("\n");
  for (const line of lines) {
    // Find first line with indentation at start
    // We ignore lines that start with * (comments) or are empty
    if (
      !line.trim() ||
      line.trim().startsWith("*") ||
      line.trim().startsWith("//")
    )
      continue;

    const match = line.match(/^(\s+)\S/);
    if (match) {
      const indent = match[1];
      // If it's a multiple of 4, prefer 4. If multiple of 2 but not 4, prefer 2.
      // But usually we just want to know the *unit*.
      // Simple heuristic: check if 2 spaces or 4 spaces are used.
      if (indent.includes("\t")) return "\t";
      if (indent.length % 4 === 0 && indent.length > 0) return "    ";
      if (indent.length % 2 === 0 && indent.length > 0) return "  ";
    }
  }
  return "  "; // Default to 2 spaces
};

export const injectProvider = (code) => {
  let ast;
  try {
    ast = parse(code, {
      sourceType: "module",
      plugins: [
        "jsx",
        "typescript",
        "classProperties",
        "dynamicImport",
        "exportDefaultFrom",
        "exportNamespaceFrom",
      ],
    });
  } catch (e) {
    console.error("Parse Error in injectProvider:", e);
    return code;
  }

  let lastImportEnd = 0;
  let foundImport = false;
  
  // Robustness flags
  let hasContextImport = false;
  let hasReactImport = false; // specifically useContext
  let hasHook = false;
  let hasProviderWrapper = false;

  let exportDefaultNode = null;
  let exportDefaultDeclarationType = null; // 'Identifier', 'FunctionDeclaration', 'ClassDeclaration', 'CallExpression'
  let exportName = "App"; // Default assumption
  let componentFunctionNode = null; // The actual function node of the component
  let potentialComponents = {}; // Map name -> node
  let importedNames = new Set(); // Track imported names


  traverse(ast, {
    ImportDeclaration: (node) => {
      foundImport = true;
      if (node.end > lastImportEnd) lastImportEnd = node.end;
      
      const source = node.source.value;
      if (source.includes("LanguageContext")) {
          hasContextImport = true;
      }
      if (source === 'react') {
          if (node.specifiers.some(s => s.local.name === 'useContext')) {
              hasReactImport = true;
          }
      }
      // Track all imported names
      if (node.specifiers) {
          node.specifiers.forEach(s => {
              if (s.local && s.local.name) {
                  importedNames.add(s.local.name);
              }
          });
      }
    },
    ExportDefaultDeclaration: (node) => {
      exportDefaultNode = node;
      exportDefaultDeclarationType = node.declaration.type;
      
      if (node.declaration.type === "Identifier") {
        exportName = node.declaration.name;
      } else if (
        node.declaration.type === "FunctionDeclaration" ||
        node.declaration.type === "ClassDeclaration"
      ) {
        if (node.declaration.id) {
          exportName = node.declaration.id.name;
        }
        componentFunctionNode = node.declaration;
      }
    },
    FunctionDeclaration: (node) => {
        if (node.id) {
            potentialComponents[node.id.name] = node;
        }
    },
    ArrowFunctionExpression: (node) => {
         // Anonymous arrows hard to track unless assigned
    },
    VariableDeclarator: (node) => {
        if (node.id.type === 'Identifier' && (node.init.type === 'ArrowFunctionExpression' || node.init.type === 'FunctionExpression')) {
             potentialComponents[node.id.name] = node.init;
        }
    },
    JSXOpeningElement: (node) => {
      if (node.name.name === "LanguageProvider") {
        hasProviderWrapper = true;
      }
    },
    CallExpression: (node) => {
        if (node.callee.name === 'useContext' && node.arguments.length > 0 && node.arguments[0].name === 'LanguageContext') {
            hasHook = true;
        }
    }
  });

  // Resolve component function if not found (e.g. export default App; where App defined earlier)
  if (!componentFunctionNode && exportDefaultDeclarationType === 'Identifier' && potentialComponents[exportName]) {
      componentFunctionNode = potentialComponents[exportName];
  }
  
  // Fallback: If still not found (e.g. export is wrapped), try finding 'App'
  if (!componentFunctionNode && potentialComponents['App']) {
      componentFunctionNode = potentialComponents['App'];
  }

  // Double check removed: AST traversal handles real code, ignoring comments.


  if (hasContextImport && hasHook && hasProviderWrapper) return code; // Fully injected
  if (!exportDefaultNode) return code; // No export default found, cannot wrap

  // --- EXECUTE INJECTION ---

  let newCode = code;
  let offset = 0;

  // 1. Inject Imports
  // We need to inject: 
  // - import { useContext } from 'react'; (if not present)
  // - import { LanguageProvider, LanguageContext } from './contexts/LanguageContext';
  
  let importsToAdd = "";
  if (!hasContextImport) {
      importsToAdd += "import { LanguageProvider, LanguageContext } from './contexts/LanguageContext';\n";
  }
  if (!hasReactImport) {
      // Check if react is imported at all?
      // Simplification: Just add `import { useContext } from 'react';`. 
      // It's valid to have duplicate imports from same module in JS/TS.
      // But purely for cleanliness we might want to check.
      // For robustness, let's just add it if missing hook.
      if (!code.includes("import { useContext } from 'react'")) {
           importsToAdd += "import { useContext } from 'react';\n";
      }
  }

  if (importsToAdd) {
      if (foundImport) {
        newCode = newCode.slice(0, lastImportEnd) + "\n" + importsToAdd + newCode.slice(lastImportEnd);
      } else {
        newCode = importsToAdd + '\n' + newCode;
      }
      
      // Update offset for next steps
      offset = newCode.length - code.length;
  }
  
  // 2. Inject Hook into Component Body
  if (!hasHook) {
      if (componentFunctionNode && componentFunctionNode.body.type === 'BlockStatement') {
          const bodyStart = componentFunctionNode.body.start + offset + 1; // +1 for '{'
          
          // Check for collision in the function body
          let collisionDetected = false;
          let textDeclarationToRemove = null;

          // Check params (Identifier and Destructuring)
          if (componentFunctionNode.params) {
               if (componentFunctionNode.params.some(p => p.type === 'Identifier' && p.name === 'text')) collisionDetected = true;
               if (componentFunctionNode.params.some(p => p.type === 'ObjectPattern' && p.properties && p.properties.some(prop => prop.key.name === 'text'))) collisionDetected = true;
          }

          // Check for top-level imports named 'text'
          if (!collisionDetected && importedNames.has('text')) {
               collisionDetected = true;
          }


          // Helper to recursively finding declarations in body
          const checkCollisionAndStaticInit = (node) => {
             if (!node) return;
             if (node.type === 'VariableDeclarator' && node.id.name === 'text') {
                 // Check if init is content.something
                 if (node.init && node.init.type === 'MemberExpression' && node.init.object.name === 'content') {
                     textDeclarationToRemove = node;
                     // Do NOT mark collision, because we will remove it.
                 } else {
                     collisionDetected = true;
                 }
             }
             
             // Traverse children
             for (const key in node) {
                 if (key === 'loc' || key === 'start' || key === 'end') continue;
                 const child = node[key];
                 if (Array.isArray(child)) child.forEach(checkCollisionAndStaticInit);
                 else if (typeof child === 'object') checkCollisionAndStaticInit(child);
             }
          };
          
          checkCollisionAndStaticInit(componentFunctionNode.body);

          // Remove static declaration if found
          if (textDeclarationToRemove) {
              // We need to remove the whole VariableDeclaration statement usually?
              // textDeclarationToRemove is the Declarator. Parent is Declaration.
              // AST traversal doesn't give parent link easily here without full traverse.
              // Robust hack: finding the range in newCode and removing line?
              // Better: use start/end of the node (Declarator) + "const " or "let " before it? 
              // Actually, simplified: invalidating the range of the declaration.
              // But wait, if we remove it, we must ensure newCode indexes stay valid.
              // We are using `offset` method.
              
              // Let's assume the declaration is `const text = content.en;` or similar.
              // We can find the "VariableDeclaration" containing this declarator.
              // Since we don't have parent, we can look at the source location.
              
              // We'll define the range to remove.
              // NOTE: This simple traverser logic above passed 'node' directly.
              // To handle removal safely we need to identify the Statement.
              // Let's re-scan body statements.
              
              const bodyStmts = componentFunctionNode.body.body;
              if (Array.isArray(bodyStmts)) {
                  for (const stmt of bodyStmts) {
                      if (stmt.type === 'VariableDeclaration') {
                          const decl = stmt.declarations.find(d => d.id.name === 'text' && d.init && d.init.type === 'MemberExpression' && d.init.object.name === 'content');
                          if (decl) {
                              // Found the statement `const text = content.en;`
                              const start = stmt.start + offset;
                              const end = stmt.end + offset;
                              
                              // Check if there are other declarations? `const a=1, text=content.en;` -> rare/bad practice here.
                              // Assuming single line for simplicity/robustness for this specific hackathon case.
                              
                              newCode = newCode.slice(0, start) + newCode.slice(end);
                              
                              // If followed by semicolon/newline, might want to clean up, but JS tolerates extra newlines.
                              // Adjust offset for subsequent injections
                              offset -= (end - start);
                              
                              // We removed the collision source!
                              collisionDetected = false; 
                              break;
                          }
                      }
                  }
              }
          }
          
          const varName = collisionDetected ? 'arabifyContextvalue' : 'text';
          const destructuring = collisionDetected ? 'text: arabifyContextvalue' : 'text';
          
          const hookCode = `\n  const { ${destructuring} } = useContext(LanguageContext);\n  if (!${varName}) return null;\n`;
          
          newCode = newCode.slice(0, bodyStart) + hookCode + newCode.slice(bodyStart);
          offset += hookCode.length;
      } 
      // Handle Arrow Function with Implicit Return (e.g. () => <div>)
      else if (componentFunctionNode && componentFunctionNode.body.type === 'JSXElement') {
          // Implicit return has no scope for variables usually, unless params.
           let collisionDetected = false;
           if (componentFunctionNode.params && componentFunctionNode.params.some(p => p.type === 'Identifier' && p.name === 'text')) {
                 collisionDetected = true;
           }
           // Also check destructured params: ({ text }) => ...
           if (componentFunctionNode.params && componentFunctionNode.params.some(p => p.type === 'ObjectPattern' && p.properties && p.properties.some(prop => prop.key.name === 'text'))) {
                 collisionDetected = true;
           }

          // Need to convert to block
          const bodyStart = componentFunctionNode.body.start + offset;
          const bodyEnd = componentFunctionNode.body.end + offset;
          
          const varName = collisionDetected ? 'arabifyContextvalue' : 'text';
          const destructuring = collisionDetected ? 'text: arabifyContextvalue' : 'text';

          const originalBody = newCode.slice(bodyStart, bodyEnd);
          const hookCode = `{\n  const { ${destructuring} } = useContext(LanguageContext);\n  if (!${varName}) return null;\n  return `;
          const closeBlock = ";\n}";
          
          newCode = newCode.slice(0, bodyStart) + hookCode + originalBody + closeBlock + newCode.slice(bodyEnd);
          offset += (hookCode.length + closeBlock.length);
      }
  }

  // 3. Modify Export (Wrap with Provider)
  if (!hasProviderWrapper) {
      // Find export position in newCode (simplest robust way after edits)
      const exportDefaultRegex = /export\s+default\s+/g;
      let match;
      let lastMatch;
      while ((match = exportDefaultRegex.exec(newCode)) !== null) {
          lastMatch = match;
      }
      
      if (lastMatch) {
          const exportPos = lastMatch.index;
          
          if (exportDefaultDeclarationType === "Identifier") {
                 // export default App;
                 // replace from exportPos to end of statement (semicolon or newline)
                 const endOfExport = newCode.indexOf(';', exportPos);
                 const exportStatement = newCode.slice(exportPos, endOfExport !== -1 ? endOfExport + 1 : undefined);
                 
                 const newExportCode = `
export default (props) => (
  <LanguageProvider>
    <${exportName} {...props} />
  </LanguageProvider>
);`;
                newCode = newCode.replace(exportStatement.trim(), newExportCode.trim());
          }
          else if (exportDefaultDeclarationType === "FunctionDeclaration" || exportDefaultDeclarationType === "ClassDeclaration") {
              // export default function App() { ... }
              // Remove "export default " prefix
              
              const codeBefore = newCode.slice(0, exportPos);
              // Careful: ensure we only remove "export default "
              const remainder = newCode.slice(exportPos).replace(/^export\s+default\s+/, '');
              
              const wrapper = `
    
const ${exportName}WithLang = (props) => (
  <LanguageProvider>
    <${exportName} {...props} />
  </LanguageProvider>
);
    
export default ${exportName}WithLang;`;
    
              newCode = codeBefore + remainder + wrapper;
          }
      }
  }

  return newCode;
};

export const injectToggle = (code, targetPos = "nav") => {
  let ast;
  try {
    ast = parse(code, {
      sourceType: "module",
      plugins: [
        "jsx",
        "typescript",
        "classProperties",
        "dynamicImport",
        "exportDefaultFrom",
        "exportNamespaceFrom",
      ],
    });
  } catch (e) {
    console.error("Parse Error in injectToggle:", e);
    return code;
  }

  let lastImportEnd = 0;
  let foundImport = false;
  let targetNode = null; 
  let targetList = null; 
  let alreadyInjected = false;

  traverse(ast, {
    ImportDeclaration: (node) => {
      foundImport = true;
      if (node.end > lastImportEnd) lastImportEnd = node.end;
      if (node.source.value.includes("LanguageToggle")) {
        alreadyInjected = true;
      }
    },
    JSXElement: (node) => {
      const name = node.openingElement.name.name;
      if (name === targetPos) {
        targetNode = node;
        // Look for ul/ol in children
        node.children.forEach((child) => {
          if (
            child.type === "JSXElement" &&
            (child.openingElement.name.name === "ul" ||
             child.openingElement.name.name === "ol")
          ) {
            targetList = child;
          }
        });
      }
      if (name === "LanguageToggle") {
        alreadyInjected = true;
      }
    },
  });

  if (alreadyInjected) return code;

  // Prioritize List inside the targeted node, then the Node itself
  const insertionNode = targetList || targetNode;

  // Fallback to Header if the target wasn't found at all
  let headerNode = null;
  if (!insertionNode && targetPos !== "header") {
    traverse(ast, {
      JSXElement: (node) => {
        const name = node.openingElement.name.name;
        if (name === "header") {
          headerNode = node;
        }
      },
    });
  }

  const finalTarget = insertionNode || headerNode;
  if (!finalTarget) return code;

  // --- EXECUTE INJECTION ---

  // 1. Inject Import
  let injectedImport =
    "import LanguageToggle from './components/LanguageToggle';\n";
  let newCode = code;

  if (foundImport) {
    newCode =
      newCode.slice(0, lastImportEnd) +
      "\n" +
      injectedImport +
      newCode.slice(lastImportEnd);
  } else {
    newCode = injectedImport + newCode;
  }

  const offset = newCode.length - code.length;

  // 2. Inject Toggle Button
  if (finalTarget.closingElement) {
    const insertPos = finalTarget.closingElement.start + offset;

    // Detect indentation of the closing tag line
    const codeBeforeClose = newCode.slice(0, insertPos);
    const lastNewLine = codeBeforeClose.lastIndexOf("\n");
    let indent = "";
    if (lastNewLine !== -1) {
      const lastLineStr = codeBeforeClose.slice(lastNewLine + 1);
      const match = lastLineStr.match(/^\s*/);
      indent = match ? match[0] : "";
    }

    const step = detectIndentation(code);

    let toggleCode;
    if (targetList) {
      // If inside list, wrap in <li>
      toggleCode = `${step}<li><LanguageToggle /></li>\n${indent}`;
    } else {
      // Fallback for raw nav
      toggleCode = `${step}<LanguageToggle />\n${indent}`;
    }

    newCode =
      newCode.slice(0, insertPos) + toggleCode + newCode.slice(insertPos);
  }

  return newCode;
};
