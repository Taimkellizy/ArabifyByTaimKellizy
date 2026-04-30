# Graph Report - C:\Users\taimk\Desktop\Hackthon project 1\meridian-suite  (2026-04-30)

## Corpus Check
- 68 files · ~58,430 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 187 nodes · 197 edges · 35 communities detected
- Extraction: 73% EXTRACTED · 27% INFERRED · 0% AMBIGUOUS · INFERRED: 53 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
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

## God Nodes (most connected - your core abstractions)
1. `runModifications()` - 14 edges
2. `injectProvider()` - 12 edges
3. `analyzeJSX()` - 9 edges
4. `injectToggle()` - 9 edges
5. `analyzeHTML()` - 7 edges
6. `handleInjections()` - 7 edges
7. `extractAndTransformJSX()` - 7 edges
8. `scanDataFiles()` - 6 edges
9. `runSync()` - 5 edges
10. `applyPenalty()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `generateI18nConfig()` --calls--> `runModifications()`  [INFERRED]
  C:\Users\taimk\Desktop\Hackthon project 1\meridian-suite\packages\cli\templates\i18n-generator.js → C:\Users\taimk\Desktop\Hackthon project 1\meridian-suite\packages\cli\utils\runner.js
- `injectI18nImport()` --calls--> `runModifications()`  [INFERRED]
  C:\Users\taimk\Desktop\Hackthon project 1\meridian-suite\packages\cli\utils\ast-injector.js → C:\Users\taimk\Desktop\Hackthon project 1\meridian-suite\packages\cli\utils\runner.js
- `installI18nDependencies()` --calls--> `runModifications()`  [INFERRED]
  C:\Users\taimk\Desktop\Hackthon project 1\meridian-suite\packages\cli\utils\installer.js → C:\Users\taimk\Desktop\Hackthon project 1\meridian-suite\packages\cli\utils\runner.js
- `runModifications()` --calls--> `scanDataFiles()`  [INFERRED]
  C:\Users\taimk\Desktop\Hackthon project 1\meridian-suite\packages\cli\utils\runner.js → C:\Users\taimk\Desktop\Hackthon project 1\meridian-suite\packages\cli\utils\scanDataFiles.js
- `runModifications()` --calls--> `promoteDataFileKeys()`  [INFERRED]
  C:\Users\taimk\Desktop\Hackthon project 1\meridian-suite\packages\cli\utils\runner.js → C:\Users\taimk\Desktop\Hackthon project 1\meridian-suite\packages\cli\utils\scanDataFiles.js

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

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (20): applyEdits(), analyzeProviderScope(), analyzeExportDefault(), analyzeToggleTarget(), generateProviderWrapperEdit(), generateToggleInsertEdit(), injectToggleNode(), wrapExportWithProvider() (+12 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (8): analyzeHTML(), detectA11y(), detectMeta(), detectStructure(), handleInjections(), parseHTML(), applyPenalty(), injectVanillaLogic()

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (7): TranslatorService, extractStringsFromJs(), runSync(), walkJson(), runTest(), TranslationProvider, runTranslations()

### Community 3 - "Community 3"
Cohesion: 0.16
Nodes (9): analyzeCSS(), injectI18nImport(), generateI18nConfig(), installI18nDependencies(), getContextTemplate(), getI18nContextTemplate(), getToggleTemplate(), runModifications() (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.14
Nodes (6): analyzeJSX(), detectA11yVisitor(), detectRTLVisitor(), fixStylesVisitor(), parseCode(), traverseAST()

### Community 5 - "Community 5"
Cohesion: 0.19
Nodes (8): buildExtractVisitor(), extractAndTransformJSX(), findHookInsertionPoint(), findLastImportEnd(), getReactComponentAncestor(), injectHook(), injectImportStatements(), isReactComponent()

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (9): classifyString(), collectValues(), findDataFiles(), getAllFiles(), parseJsFile(), parseJsonFile(), promoteDataFileKeys(), scanDataFiles() (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.25
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 0.5
Nodes (2): Hero(), useMousePosition()

### Community 9 - "Community 9"
Cohesion: 0.5
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 0.5
Nodes (2): detectRTLAndFix(), applyFixes()

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (1): GoogleProvider

### Community 12 - "Community 12"
Cohesion: 0.5
Nodes (1): LibreProvider

### Community 13 - "Community 13"
Cohesion: 0.5
Nodes (1): MockTranslationAdapter

### Community 14 - "Community 14"
Cohesion: 0.67
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 0.67
Nodes (1): DeepLProvider

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
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

## Knowledge Gaps
- **Thin community `Community 17`** (2 nodes): `App()`, `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `CodeExample.jsx`, `CodeExample()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `Comparison.jsx`, `Comparison()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (2 nodes): `CtaSection.jsx`, `CtaSection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `Solution.jsx`, `Solution()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `TerminalDemo.jsx`, `TerminalDemo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `TopNav.jsx`, `TopNav()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `WorkflowFilmstrip.jsx`, `WorkflowFilmstrip()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `fileScanner.js`, `scanFiles()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (2 nodes): `scoreCalculator.js`, `calculateProjectScore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `hashKey.js`, `generateKey()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `index.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `constants.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `injection.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `scoreCalculator.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `runModifications()` connect `Community 3` to `Community 2`, `Community 4`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.237) - this node is a cross-community bridge._
- **Why does `analyzeJSX()` connect `Community 4` to `Community 1`, `Community 3`?**
  _High betweenness centrality (0.173) - this node is a cross-community bridge._
- **Why does `handleInjections()` connect `Community 1` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `runModifications()` (e.g. with `installI18nDependencies()` and `generateI18nConfig()`) actually correct?**
  _`runModifications()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 10 inferred relationships involving `injectProvider()` (e.g. with `handleInjections()` and `analyzeProviderScope()`) actually correct?**
  _`injectProvider()` has 10 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `analyzeJSX()` (e.g. with `runModifications()` and `parseCode()`) actually correct?**
  _`analyzeJSX()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `injectToggle()` (e.g. with `handleInjections()` and `generateToggleImportEdits()`) actually correct?**
  _`injectToggle()` has 7 INFERRED edges - model-reasoned connections that need verification._