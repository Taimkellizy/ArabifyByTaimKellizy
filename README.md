# Meridian

![Meridian Hero Banner Placeholder](assets/Meridian_Full_Logo_GitHub_banner_no_bg_white.png)

> **Note:** A full, comprehensive documentation website is currently in development and will be available prior to the official release at [meridian.dev](https://meridian.dev). This README serves as a technical overview and development guide.

Meridian is a comprehensive internationalization automation tool that transforms any React application into a global-ready product with a single command. Unlike traditional i18n libraries that require manual setup and configuration, Meridian handles the entire migration process: CSS modernization, string extraction, translation, i18next setup, and ongoing prevention through linter integration.

## Key Features

- **One-Command Setup**: `meridian init` handles the entire i18n process for you.
- **CSS Modernization**: Automatically detects and replaces physical CSS properties (e.g., `margin-left`) with logical ones (e.g., `margin-inline-start`).
- **Semantic String Extraction**: Uses Babel to scan JSX and automatically extract hardcoded strings to dynamic translation structures.
- **Auto-Translation Engine**: Deep integration with Google Translate, DeepL, and LibreTranslate APIs for instant, context-aware translations.
- **Prevention via Linters (Coming Soon)**: Custom ESLint and Stylelint plugins to prevent future localization bugs will be available post-release.

## Tech Stack

- **Language**: JavaScript / Node.js
- **Architecture**: Monorepo (using `npm workspaces`)
- **Parsers**: PostCSS (CSS architecture), Babel (JSX AST processing)
- **Translators**: Third-party APIs (Google, DeepL, LibreTranslate)
- **Target Integrations**: `i18next`, `react-i18next`

## Prerequisites

- Node.js 18 or higher
- npm 9+ (using workspaces capabilities)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/meridian.git
cd meridian
```

### 2. Install Dependencies

Since Meridian is managed as an npm workspaces monorepo, a top-level install will link the `@meridian/cli` and `@meridian/core` packages locally.

```bash
npm install
```

### 3. Environment Setup

For auto-translation, you need to provide the relevant API keys. Copy the example environment file for the CLI:

```bash
cp packages/cli/.env.example packages/cli/.env
```

Configure your translation endpoints:

| Variable                  | Description                        | Example                           |
| ------------------------- | ---------------------------------- | --------------------------------- |
| `MERIDIAN_GOOGLE_API_KEY` | Google Translate API Key           | `AIzaSyB...`                      |
| `MERIDIAN_DEEPL_AUTH_KEY` | DeepL Authentication Key           | `e9b...`                          |
| `MERIDIAN_LIBRE_ENDPOINT` | Custom LibreTranslate endpoint URL | `http://localhost:5000/translate` |

### 4. Running the CLI Locally

During development, you can invoke the CLI from the root using `npm` or simply run the CLI node script directly against example React applications:

```bash
node packages/cli/bin/meridian.js init --path ../examples/my-react-app
```

![CLI Init Command Execution Output](assets/cli-init-output-example.png)

## Architecture

Meridian is built using a modern Monorepo structure to decouple CLI logic from language-agnostic parsers and linter plugins.

### Directory Structure

```text
meridian/
├── packages/
│   ├── cli/                    # Main CLI application (`meridian`)
│   │   ├── commands/           # Specific terminal commands (init, extract, etc.)
│   │   ├── utils/              # Installers & config management components
│   │   └── templates/          # Boilerplates for injecting `i18next` and Button UI
│   ├── core/                   # Shared parsers and logic
│   │   ├── parsers/            # PostCSS, JSX (Babel), and TypeScript AST walkers
│   │   ├── detectors/          # Heuristic engines for finding physical properties
│   │   └── fixers/             # Replacers mapping physical -> logical properties
│   ├── eslint-plugin/          # (Coming Soon) ESLint Plugin for real-time prevention
│   ├── stylelint-plugin/       # (Coming Soon) Stylelint Plugin avoiding future broken CSS layouts
│   └── translator/             # API connectors connecting to Google/DeepL/Libre
├── examples/                   # Sandboxed React repos to test Meridian against
└── package.json                # Root package with workspace configurations
```

### Request Lifecycle (The `init` Flow)

1. **User runs `meridian init`**: CLI collects targets (languages, endpoints) via interactive prompt.
2. **PostCSS Modernizer**: `core/parsers/cssParser` walks CSS AST, translating `left`/`right` rules to `inline-start`/`inline-end` while preserving file formats.
3. **i18next Scaffold**: CLI installs dependencies (`i18next`, `react-i18next`) and injects the `i18n.js` root configuration template into the target React app.
4. **Babel String Extractor**: Walks the AST of the target project, detecting textual nodes, substituting them with `t('key')` tokens, and generating a hierarchical `en/translation.json` structure.
5. **Auto-translator Pipeline**: Iterates over extracted JSON structures, forwarding payload chunks to the requested Translator Provider, waiting iteratively if rate-limit constraints surface.
6. **Linter Installation (Coming Soon)**: CLI drops `.eslintrc.js` enhancements to integrate linting rules.
7. **Report**: Success statistics display in the console.

### Key Components

**CSS Modernization Tracker**

- Replaces physical CSS attributes securely without guessing context by determining if it's applied inside a legitimate stylistic container.
- Fully supports shorthand replacements (4-value and 2-value margins and paddings).

**Intelligent React Injector**

- Places dynamic components (like the `<LanguageSwitcher />`) within `<nav />` lists smartly.
- Recognizes application indent spacing and adapts to it.

![Language Switcher in Action](assets/language-switcher-demo.png)

## Environment Variables

### Translation Overrides

Meridian CLI can optionally read its setup using a localized `.meridianrc.json` inside the target implementation app:

```json
{
  "languages": ["en", "ar", "es"],
  "translation": {
    "provider": "google",
    "apiKey": "${MERIDIAN_GOOGLE_API_KEY}"
  },
  "linters": {
    "eslint": true,
    "stylelint": true,
    "severity": "warn"
  }
}
```

## Available Scripts

| Command                              | Description                                         |
| ------------------------------------ | --------------------------------------------------- |
| `npm run test`                       | Runs all tests recursively in workspaces            |
| `meridian init`                      | Runs the entire automation suite interactively      |
| `meridian fix-css <path>`            | Scans and corrects CSS logically in isolation       |
| `meridian extract <path>`            | Extracts strings from JSX into translation objects  |
| `meridian translate --languages ...` | Takes generated translations and calls API Services |
| `meridian add-button --position ...` | Injects the frontend structural language toggle     |

## Testing

Meridian takes AST mutation seriously. Each package has its own extensive test suite. To test the entire workspace context:

```bash
# Run all tests across workspaces
npm test
```

### Writing Tests

Tests are localized inside each respective workspace component's `__tests__` directory, simulating AST manipulation results.

Example structure:

```text
packages/core/__tests__/
  cssFixer.test.js
  babelExtractor.test.js
```

## Deployment (Publishing)

Meridian is deployed as standard npm packages (`@meridian/cli`, `@meridian/core`, etc.).

1. **Versioning**: Use [Lerna](https://lerna.js.org/) or npm version to bump workspace packages synchronously.
2. **Publish**:

```bash
npm publish --workspaces --access public
```

## Troubleshooting

### String Extraction Misses Variables

**Error:** Some strings appear ignored or incorrectly wrapped.
**Solution:** Ensure you aren't passing highly complex functional evaluations inside strings. Extract to a variable first, or review JSX syntax.

### Auto-Translation Rate Limit

**Error:** API responses with status 429 Too Many Requests.
**Solution:** The translation utility handles batch delays automatically. However, if using the Google Translate or DeepL free tiers, refer to the dashboard limitations. Wait a few hours before executing `meridian translate --update`.

![Troubleshooting Pipeline Errors](assets/troubleshooting-errors.png)
