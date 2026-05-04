# Graph Report - C:\Users\taimk\Desktop\Hackthon project 1\meridian-suite  (2026-05-04)

## Corpus Check
- 73 files · ~72,310 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 256 nodes · 343 edges · 39 communities detected
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 67 edges (avg confidence: 0.8)
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
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]

## God Nodes (most connected - your core abstractions)
1. `runModifications()` - 18 edges
2. `injectProvider()` - 13 edges
3. `isMemberExpressionLike()` - 11 edges
4. `analyzeJSX()` - 9 edges
5. `injectToggle()` - 9 edges
6. `injectTailwindLogical()` - 9 edges
7. `applyEdits()` - 9 edges
8. `handleTextRun()` - 9 edges
9. `analyzeHTML()` - 7 edges
10. `handleInjections()` - 7 edges

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
Cohesion: 0.14
Nodes (28): addStringLiteralEdit(), addTranslationEdit(), buildTextReplacement(), collectTextRun(), extractMemberInfo(), findNearestArrowFunction(), findTranslatableFieldInExpression(), findTranslatableMember() (+20 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (22): analyzeProviderScope(), analyzeAppRouterLayout(), analyzeExportDefault(), analyzeToggleTarget(), generateProviderWrapperEdit(), generateToggleInsertEdit(), injectToggleNode(), wrapExportWithProvider() (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (15): analyzeCSS(), injectI18nImport(), atomicWriteFile(), findIndexHtml(), injectDirToHtml(), generateI18nConfig(), installI18nDependencies(), getContextTemplate() (+7 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (7): TranslatorService, extractStringsFromJs(), runSync(), walkJson(), runTest(), TranslationProvider, runTranslations()

### Community 4 - "Community 4"
Cohesion: 0.24
Nodes (14): applyEdits(), atomicWriteFile(), ensureV2LogicalVariants(), findCssEntryPath(), findCssPluginInsertionPoint(), findObjectProperty(), findPluginsArray(), findRootConfigObject() (+6 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (6): analyzeHTML(), detectA11y(), detectMeta(), detectStructure(), parseHTML(), applyPenalty()

### Community 6 - "Community 6"
Cohesion: 0.14
Nodes (6): analyzeJSX(), detectA11yVisitor(), detectRTLVisitor(), fixStylesVisitor(), parseCode(), traverseAST()

### Community 7 - "Community 7"
Cohesion: 0.29
Nodes (9): classifyString(), collectValues(), findDataFiles(), getAllFiles(), parseJsFile(), parseJsonFile(), promoteDataFileKeys(), scanDataFiles() (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.24
Nodes (8): atomicWriteFile(), parseJsxSource(), rewriteClassNameValue(), rewriteClassToken(), rewriteStringLiteralNode(), rewriteTailwindClasses(), rewriteTemplateLiteralClassName(), splitSupportedVariants()

### Community 9 - "Community 9"
Cohesion: 0.27
Nodes (7): buildExtractVisitor(), extractAndTransformJSX(), findHookInsertionPoint(), findLastImportEnd(), getReactComponentAncestor(), injectImportStatements(), isReactComponent()

### Community 10 - "Community 10"
Cohesion: 0.25
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 0.6
Nodes (5): atomicWriteFile(), computeRelativeImport(), findLastImportEnd(), injectDirAttribute(), parseSource()

### Community 12 - "Community 12"
Cohesion: 0.5
Nodes (2): Hero(), useMousePosition()

### Community 13 - "Community 13"
Cohesion: 0.5
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 0.5
Nodes (2): detectRTLAndFix(), applyFixes()

### Community 15 - "Community 15"
Cohesion: 0.5
Nodes (1): GoogleProvider

### Community 16 - "Community 16"
Cohesion: 0.5
Nodes (1): LibreProvider

### Community 17 - "Community 17"
Cohesion: 0.5
Nodes (1): MockTranslationAdapter

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (1): DeepLProvider

### Community 20 - "Community 20"
Cohesion: 0.67
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

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 21`** (2 nodes): `App()`, `App.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `CodeExample.jsx`, `CodeExample()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `Comparison.jsx`, `Comparison()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `CtaSection.jsx`, `CtaSection()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `Solution.jsx`, `Solution()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (2 nodes): `TerminalDemo.jsx`, `TerminalDemo()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `TopNav.jsx`, `TopNav()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `WorkflowFilmstrip.jsx`, `WorkflowFilmstrip()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (2 nodes): `fileScanner.js`, `scanFiles()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (2 nodes): `scoreCalculator.js`, `calculateProjectScore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `test-logical.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `vite.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `index.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `constants.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `injection.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `scoreCalculator.test.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `runModifications()` connect `Community 2` to `Community 3`, `Community 4`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 11`?**
  _High betweenness centrality (0.319) - this node is a cross-community bridge._
- **Why does `extractAndTransformJSX()` connect `Community 9` to `Community 2`, `Community 4`?**
  _High betweenness centrality (0.202) - this node is a cross-community bridge._
- **Why does `buildExtractVisitor()` connect `Community 9` to `Community 0`?**
  _High betweenness centrality (0.147) - this node is a cross-community bridge._
- **Are the 16 inferred relationships involving `runModifications()` (e.g. with `installI18nDependencies()` and `generateI18nConfig()`) actually correct?**
  _`runModifications()` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 11 inferred relationships involving `injectProvider()` (e.g. with `handleInjections()` and `analyzeProviderScope()`) actually correct?**
  _`injectProvider()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `analyzeJSX()` (e.g. with `runModifications()` and `parseCode()`) actually correct?**
  _`analyzeJSX()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `injectToggle()` (e.g. with `handleInjections()` and `generateToggleImportEdits()`) actually correct?**
  _`injectToggle()` has 7 INFERRED edges - model-reasoned connections that need verification._