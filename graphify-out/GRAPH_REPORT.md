# Graph Report - .  (2026-04-28)

## Corpus Check
- Corpus is ~41,939 words - fits in a single context window. You may not need a graph.

## Summary
- 247 nodes · 247 edges · 50 communities detected
- Extraction: 77% EXTRACTED · 23% INFERRED · 0% AMBIGUOUS · INFERRED: 58 edges (avg confidence: 0.79)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Core Analysis Pipeline|Core Analysis Pipeline]]
- [[_COMMUNITY_React Injection System|React Injection System]]
- [[_COMMUNITY_Translation Service|Translation Service]]
- [[_COMMUNITY_Website UI Components|Website UI Components]]
- [[_COMMUNITY_CLI Modification Pipeline|CLI Modification Pipeline]]
- [[_COMMUNITY_HTML Analysis|HTML Analysis]]
- [[_COMMUNITY_JSX Analysis|JSX Analysis]]
- [[_COMMUNITY_Data File Scanner|Data File Scanner]]
- [[_COMMUNITY_i18n Extraction|i18n Extraction]]
- [[_COMMUNITY_Masonry Gallery|Masonry Gallery]]
- [[_COMMUNITY_CLI Core|CLI Core]]
- [[_COMMUNITY_Translation Providers|Translation Providers]]
- [[_COMMUNITY_i18n Utilities|i18n Utilities]]
- [[_COMMUNITY_Hero Section|Hero Section]]
- [[_COMMUNITY_CLI Entry Point|CLI Entry Point]]
- [[_COMMUNITY_RTL Detection|RTL Detection]]
- [[_COMMUNITY_Google Provider|Google Provider]]
- [[_COMMUNITY_Libre Provider|Libre Provider]]
- [[_COMMUNITY_Mock Adapter|Mock Adapter]]
- [[_COMMUNITY_React Injectors|React Injectors]]
- [[_COMMUNITY_Config Manager|Config Manager]]
- [[_COMMUNITY_DeepL Provider|DeepL Provider]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]

## God Nodes (most connected - your core abstractions)
1. `runModifications()` - 14 edges
2. `analyzeJSX()` - 9 edges
3. `analyzeHTML - HTML Analyzer` - 9 edges
4. `Main App Component` - 8 edges
5. `Masonry Gallery Component` - 8 edges
6. `analyzeHTML()` - 7 edges
7. `handleInjections()` - 7 edges
8. `injectProvider()` - 7 edges
9. `GSAP ScrollTrigger Animation` - 7 edges
10. `analyzeJSX - JSX/React Analyzer` - 7 edges

## Surprising Connections (you probably didn't know these)
- `runModifications()` --calls--> `generateI18nConfig()`  [INFERRED]
  meridian-suite\packages\cli\utils\runner.js → meridian-suite\packages\cli\templates\i18n-generator.js
- `runModifications()` --calls--> `injectI18nImport()`  [INFERRED]
  meridian-suite\packages\cli\utils\runner.js → meridian-suite\packages\cli\utils\ast-injector.js
- `runModifications()` --calls--> `installI18nDependencies()`  [INFERRED]
  meridian-suite\packages\cli\utils\runner.js → meridian-suite\packages\cli\utils\installer.js
- `runModifications()` --calls--> `scanDataFiles()`  [INFERRED]
  meridian-suite\packages\cli\utils\runner.js → meridian-suite\packages\cli\utils\scanDataFiles.js
- `runModifications()` --calls--> `promoteDataFileKeys()`  [INFERRED]
  meridian-suite\packages\cli\utils\runner.js → meridian-suite\packages\cli\utils\scanDataFiles.js

## Hyperedges (group relationships)
- **Meridian Website UI Composition** — app, hero, solution, masonry_gallery, workflow_filmstrip, comparison, code_example, cta_section, topnav [EXTRACTED 1.00]
- **GSAP ScrollTrigger Animation Pattern** — hero, solution, masonry_gallery, workflow_filmstrip, comparison, code_example, cta_section [EXTRACTED 1.00]
- **CLI Modification Pipeline** — meridian_cli, config_manager, modification_runner, ast_injector, i18n_generator, dependency_installer [EXTRACTED 1.00]
- **** — analyzeCSS, cssDetectRTL, cssFixStyles, cssScoring [INFERRED]
- **** — analyzeHTML, htmlParse, htmlDetectStructure, htmlDetectMeta, htmlDetectA11y, htmlInjectLang [INFERRED]
- **** — analyzeJSX, jsxDetectRTL, jsxFixStyles, jsxInjectLang, jsxDetectA11y [INFERRED]
- **** — TranslationProvider, DeepLProvider, GoogleProvider, LibreProvider, MockTranslationAdapter [INFERRED]
- **** — extractJSX, injectTranslation, hashKey, i18nExtractTransform [INFERRED]
- **** — reactInjector, detectScope, vanillaInjector, reactGenerators, i18nExtractTransform [INFERRED]

## Communities

### Community 0 - "Core Analysis Pipeline"
Cohesion: 0.14
Nodes (21): analyzeCSS - CSS RTL Analyzer, analyzeHTML - HTML Analyzer, analyzeJSX - JSX/React Analyzer, constants - RTL Property Mappings, coreIndex - Core Package Exports, cssDetectRTL - CSS RTL Detection, cssFixStyles - CSS Style Fixer, cssScoring - CSS Penalty Scoring (+13 more)

### Community 1 - "React Injection System"
Cohesion: 0.14
Nodes (12): analyzeProviderScope(), injectToggleNode(), wrapExportWithProvider(), injectContextHook(), getRelativeImport(), injectProviderImports(), injectToggleImports(), handleInjections() (+4 more)

### Community 2 - "Translation Service"
Cohesion: 0.13
Nodes (7): TranslatorService, extractStringsFromJs(), runSync(), walkJson(), runTest(), TranslationProvider, runTranslations()

### Community 3 - "Website UI Components"
Cohesion: 0.17
Nodes (17): Main App Component, AST Extraction Visual, Code Example Section, Comparison Section, CTA Section Component, GSAP ScrollTrigger Animation, Hero Section, Language Matrix Visual (+9 more)

### Community 4 - "CLI Modification Pipeline"
Cohesion: 0.16
Nodes (9): analyzeCSS(), injectI18nImport(), generateI18nConfig(), installI18nDependencies(), getContextTemplate(), getI18nContextTemplate(), getToggleTemplate(), runModifications() (+1 more)

### Community 5 - "HTML Analysis"
Cohesion: 0.14
Nodes (6): analyzeHTML(), detectA11y(), detectMeta(), detectStructure(), parseHTML(), applyPenalty()

### Community 6 - "JSX Analysis"
Cohesion: 0.14
Nodes (6): analyzeJSX(), detectA11yVisitor(), detectRTLVisitor(), fixStylesVisitor(), parseCode(), traverseAST()

### Community 7 - "Data File Scanner"
Cohesion: 0.29
Nodes (9): classifyString(), collectValues(), findDataFiles(), getAllFiles(), parseJsFile(), parseJsonFile(), promoteDataFileKeys(), scanDataFiles() (+1 more)

### Community 8 - "i18n Extraction"
Cohesion: 0.24
Nodes (6): buildExtractVisitor(), extractAndTransformJSX(), getReactComponentAncestor(), injectHook(), injectImportStatements(), isReactComponent()

### Community 9 - "Masonry Gallery"
Cohesion: 0.25
Nodes (0): 

### Community 10 - "CLI Core"
Cohesion: 0.33
Nodes (7): AST Injector, Configuration Manager, Dependency Installer, I18n Config Generator, Meridian CLI, Modification Runner, Terminal Demo Component

### Community 11 - "Translation Providers"
Cohesion: 0.33
Nodes (6): DeepLProvider, GoogleProvider, LibreProvider, MockTranslationAdapter, TranslationProvider (Abstract Base), TranslatorService

### Community 12 - "i18n Utilities"
Cohesion: 0.4
Nodes (6): extractJSX (JSX String Extraction), hashKey (Translation Key Generation), i18nExtractTransform (Pipeline), injectTranslation (Hook Injection), parseCode (Babel Parser Wrapper), traverseAST (Babel Traverse Wrapper)

### Community 13 - "Hero Section"
Cohesion: 0.5
Nodes (2): Hero(), useMousePosition()

### Community 14 - "CLI Entry Point"
Cohesion: 0.5
Nodes (0): 

### Community 15 - "RTL Detection"
Cohesion: 0.5
Nodes (2): detectRTLAndFix(), applyFixes()

### Community 16 - "Google Provider"
Cohesion: 0.5
Nodes (1): GoogleProvider

### Community 17 - "Libre Provider"
Cohesion: 0.5
Nodes (1): LibreProvider

### Community 18 - "Mock Adapter"
Cohesion: 0.5
Nodes (1): MockTranslationAdapter

### Community 19 - "React Injectors"
Cohesion: 0.5
Nodes (4): detectScope (React Scope Analysis), reactGenerators (React i18n Template Generation), reactInjector (React Provider/Toggle Injection), vanillaInjector (HTML Language Toggle)

### Community 20 - "Config Manager"
Cohesion: 0.67
Nodes (0): 

### Community 21 - "DeepL Provider"
Cohesion: 0.67
Nodes (1): DeepLProvider

### Community 22 - "Community 22"
Cohesion: 0.67
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (2): Meridian AST Injection Method, Traditional Boilerplate i18n

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (2): detokenizeString Utility, tokenizeString Utility

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (2): scoreCalculator (Weighted Score Calculation), scoring (JSX Code Quality Penalties)

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (1): Gallery Component

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (1): Image Component

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (1): Navigation Component

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (1): fileScanner (File System Scanner)

## Knowledge Gaps
- **36 isolated node(s):** `Gallery Component`, `Image Component`, `Navigation Component`, `Top Navigation Component`, `Use Mouse Position Hook` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 23`** (2 nodes): `Gallery()`, `gallery.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `navigation.jsx`, `Navigation()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `App()`, `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (2 nodes): `CodeExample()`, `CodeExample.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `Comparison()`, `Comparison.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `CtaSection()`, `CtaSection.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (2 nodes): `Solution.jsx`, `Solution()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (2 nodes): `TerminalDemo.jsx`, `TerminalDemo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (2 nodes): `TopNav.jsx`, `TopNav()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (2 nodes): `WorkflowFilmstrip.jsx`, `WorkflowFilmstrip()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (2 nodes): `scanFiles()`, `fileScanner.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (2 nodes): `scoreCalculator.js`, `calculateProjectScore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (2 nodes): `generateKey()`, `hashKey.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (2 nodes): `Meridian AST Injection Method`, `Traditional Boilerplate i18n`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (2 nodes): `detokenizeString Utility`, `tokenizeString Utility`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (2 nodes): `scoreCalculator (Weighted Score Calculation)`, `scoring (JSX Code Quality Penalties)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `index.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `constants.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `injection.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `scoreCalculator.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `Gallery Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `Image Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `Navigation Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (1 nodes): `fileScanner (File System Scanner)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `runModifications()` connect `CLI Modification Pipeline` to `i18n Extraction`, `Translation Service`, `JSX Analysis`, `Data File Scanner`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **Why does `analyzeJSX()` connect `JSX Analysis` to `React Injection System`, `CLI Modification Pipeline`, `HTML Analysis`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Why does `handleInjections()` connect `React Injection System` to `HTML Analysis`, `JSX Analysis`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `runModifications()` (e.g. with `installI18nDependencies()` and `generateI18nConfig()`) actually correct?**
  _`runModifications()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `analyzeJSX()` (e.g. with `runModifications()` and `parseCode()`) actually correct?**
  _`analyzeJSX()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `analyzeHTML - HTML Analyzer` (e.g. with `cssScoring - CSS Penalty Scoring` and `analyzeCSS - CSS RTL Analyzer`) actually correct?**
  _`analyzeHTML - HTML Analyzer` has 3 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Gallery Component`, `Image Component`, `Navigation Component` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._