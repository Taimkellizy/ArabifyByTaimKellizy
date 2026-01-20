const { parse } = require('@babel/parser');

// Mock text object
const text = {
    errtypeStructure: "Structure",
    msgMissingHeader: "Missing Header",
    msgMissingFooter: "Missing Footer",
    errtypeAlt: "Alt Text",
    msgMissingAlt: (n) => `Missing Alt ${n}`,
    errtypeAccessibility: "Accessibility",
    errtypeRTL: "RTL",
    msgAvoidTextAlign: "Avoid text-align",
    msgAvoidFloat: "Avoid float"
};

// Babel-based analyzeJSX logic
const analyzeJSX = (codeString, text) => {
    let score = 100;
    let warnings = [];

    let ast;
    try {
        ast = parse(codeString, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript', 'classProperties', 'dynamicImport', 'exportDefaultFrom', 'exportNamespaceFrom', 'modules', 'objectRestSpread']
        });
    } catch (e) {
        console.error("JSX Parse Error:", e);
        return { score: 0, warnings: [{ type: "Syntax Error", msg: "Could not parse file.", blogID: 0 }] };
    }

    const traverse = (node, visitor) => {
        if (!node || typeof node !== 'object') return;
        if (visitor[node.type]) visitor[node.type](node);
        for (const key in node) {
            if (key === 'loc' || key === 'start' || key === 'end' || key === 'comments') continue;
            const child = node[key];
            if (Array.isArray(child)) child.forEach(c => traverse(c, visitor));
            else if (child && typeof child === 'object') traverse(child, visitor);
        }
    };

    let hasHeader = false;
    let hasFooter = false;
    let hasMain = false;
    let hasBody = false;

    const visitor = {
        ObjectExpression: (node) => {
            node.properties.forEach(prop => {
                if (!prop.key) return;
                const keyName = prop.key.name || prop.key.value;

                // 1. Check for Physical Properties (Keys)
                const physicalProps = [
                    'marginLeft', 'marginRight', 'paddingLeft', 'paddingRight',
                    'left', 'right',
                    'borderLeft', 'borderRight', 'borderLeftWidth', 'borderRightWidth',
                    'borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'
                ];

                if (physicalProps.includes(keyName)) {
                    score -= 5;
                    warnings.push({ type: text.errtypeRTL, msg: `Avoid physical property '${keyName}'. Use logical properties (e.g., marginInlineStart).`, blogID: 3 });
                }

                // 2. Check Values (textAlign, float)
                // Handle TSAsExpression (e.g. 'left' as const)
                let valueNode = prop.value;
                if (valueNode && valueNode.type === 'TSAsExpression') {
                    valueNode = valueNode.expression;
                }

                if (keyName === 'textAlign' || keyName === 'text-align') {
                    if (valueNode && (valueNode.value === 'left' || valueNode.value === 'right')) {
                        score -= 5;
                        warnings.push({ type: text.errtypeRTL, msg: text.msgAvoidTextAlign, blogID: 3 });
                    }
                }
                if (keyName === 'float') {
                    if (valueNode && (valueNode.value === 'left' || valueNode.value === 'right')) {
                        score -= 5;
                        warnings.push({ type: text.errtypeRTL, msg: text.msgAvoidFloat, blogID: 3 });
                    }
                }

                // 3. Check borderRadius shorthand (4 values)
                if (keyName === 'borderRadius') {
                    if (valueNode && valueNode.type === 'StringLiteral') {
                        const parts = valueNode.value.trim().split(/\s+/);
                        if (parts.length === 4) { // 4 values are direction sensitive (top-left, top-right, bottom-right, bottom-left)
                            score -= 5;
                            warnings.push({ type: text.errtypeRTL, msg: "Avoid 4-value borderRadius shorthand. It is direction-sensitive.", blogID: 3 });
                        }
                    }
                }
            });
        },

        JSXOpeningElement: (node) => {
            const name = getJSXName(node.name);
            if (name === 'header') hasHeader = true;
            if (name === 'footer') hasFooter = true;
            if (name === 'main') hasMain = true;
            if (name === 'body') hasBody = true;

            if (name === 'img') {
                const altAttr = node.attributes.find(attr => attr.type === 'JSXAttribute' && attr.name.name === 'alt');
                if (!altAttr) {
                    score -= 5;
                    warnings.push({ type: text.errtypeAlt, msg: text.msgMissingAlt("?"), blogID: 2 });
                }
            }

            if (name === 'button') {
                const hasLabel = node.attributes.some(attr =>
                    attr.type === 'JSXAttribute' && (attr.name.name === 'aria-label' || attr.name.name === 'title')
                );
                if (node.selfClosing && !hasLabel) {
                    score -= 5;
                    warnings.push({ type: text.errtypeAccessibility, msg: "Empty button found without aria-label.", blogID: 2 });
                }
            }

            const classAttr = node.attributes.find(attr => attr.type === 'JSXAttribute' && (attr.name.name === 'className' || attr.name.name === 'class'));
            if (classAttr && classAttr.value) {
                if (classAttr.value.type === 'StringLiteral') {
                    checkClassName(classAttr.value.value, warnings, text);
                } else if (classAttr.value.type === 'JSXExpressionContainer' && classAttr.value.expression.type === 'StringLiteral') {
                    checkClassName(classAttr.value.expression.value, warnings, text);
                }
            }
        }
    };

    traverse(ast, visitor);

    if (hasMain || hasBody) {
        if (!hasHeader) { score -= 10; warnings.push({ type: text.errtypeStructure, msg: text.msgMissingHeader, blogID: 1 }); }
        if (!hasFooter) { score -= 10; warnings.push({ type: text.errtypeStructure, msg: text.msgMissingFooter, blogID: 1 }); }
    }

    score = Math.max(0, score);
    return { score, warnings };
};

const getJSXName = (node) => {
    if (node.type === 'JSXIdentifier') return node.name;
    if (node.type === 'JSXMemberExpression') return `${getJSXName(node.object)}.${getJSXName(node.property)}`;
    return '';
};

const checkClassName = (className, warnings, text) => {
    if (!className) return;
    if (/\btext-left\b/.test(className) || /\btext-right\b/.test(className)) {
        warnings.push({ type: text.errtypeRTL, msg: "Avoid 'text-left'/'text-right'. Use logical alignment.", blogID: 3 });
    }
    if (/\b(ml-|mr-|pl-|pr-)\d+/.test(className)) {
        warnings.push({ type: text.errtypeRTL, msg: "Avoid physical margin/padding (ml-, mr-). Use logical properties (ms-, me-).", blogID: 3 });
    }
};

// Test Content from src/JSXtest2026 4.tsx
const testContent = `
import React, { useState } from 'react';

// Test 1: TypeScript Interface (Names should NOT be changed)
interface StyleProps {
  marginLeft?: string;
  paddingRight?: number;
}

const ArabifyTestComponent: React.FC<StyleProps> = ({ marginLeft, paddingRight }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Test 2: Dynamic Style Object
  // Your script needs to find 'marginRight' and change it to 'marginInlineEnd'
  const dynamicContainer = {
    marginRight: isOpen ? '20px' : '0px',
    paddingLeft: '10px',
    textAlign: 'left' as const, // Should become 'start'
  };

  return (
    <div style={dynamicContainer}>
      {/* Test 3: Inline Style Objects (The most common use case) */}
      <header 
        style={{ 
          display: 'flex', 
          paddingRight: '2rem', 
          borderLeft: '1px solid black' 
        }}
      >
        <h1 className="title">React Arabify Test</h1>
      </header>

      {/* Test 4: Physical Properties as Strings in Text (Should NOT change) */}
      <section>
        <p>This paragraph mentions marginLeft and margin-left. Do not touch them!</p>
      </section>

      {/* Test 5: Complex Shorthands in JSX */}
      <button
        style={{
          borderRadius: '10px 0 0 10px', // Top-Left, Top-Right, Bottom-Right, Bottom-Left
          borderRightWidth: '5px',
          position: 'absolute',
          left: '20px'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        Toggle Margin
      </button>

      {/* Test 6: Template Literals inside Style */}
      <footer style={{ paddingLeft: \`\${10 + 5}px\` }}>
        Footer Content
      </footer>
    </div>
  );
};

export default ArabifyTestComponent;
`;

const result = analyzeJSX(testContent, text);
console.log(JSON.stringify(result, null, 2));
