# Meridian

<div align="center">
  <img src="assets/Meridian Full Logo GitHub banner.png" alt="Meridian Hero Banner Placeholder" width="80%" />

  <br />

  <a href="https://github.com/Taimkellizy/meridian-suite">
    <img src="https://img.shields.io/badge/meridian-v1.0.0-blue.svg?style=flat-square" alt="Meridian Version" />
  </a>
  <a href="https://meridian-suite.vercel.app/">
    <img src="https://img.shields.io/badge/vercel-deployed-black?style=flat-square&logo=vercel" alt="Vercel" />
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT" />
  </a>

  <br />
  <br />

  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="NodeJS" />
  <img src="https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" alt="Turborepo" />
  <img src="https://img.shields.io/badge/Babel-F9DC3E?style=for-the-badge&logo=babel&logoColor=black" alt="Babel" />
  <img src="https://img.shields.io/badge/PostCSS-DD3A0A?style=for-the-badge&logo=postcss&logoColor=white" alt="PostCSS" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
</div>

> **Note:** A full, comprehensive documentation website is currently in development and will be available prior to the official release at [meridian-suite.vercel.app](https://meridian-suite.vercel.app/). This README serves as a technical overview and development guide.

Meridian is a comprehensive internationalization automation tool that transforms any React application into a global-ready product with a single command. Unlike traditional i18n libraries that require manual setup and configuration, Meridian handles the entire migration process: CSS modernization, string extraction, translation, i18next setup, and ongoing prevention through linter integration.

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Contributing, Testing, and Deployment](#contributing-testing-and-deployment)

## Key Features

- **One-Command Setup**: `meridian init` handles the entire i18n process for you.
- **CSS Modernization**: Automatically detects and replaces physical CSS properties (e.g., `margin-left`) with logical ones (e.g., `margin-inline-start`).
- **Semantic String Extraction**: Uses Babel to scan JSX and automatically extract hardcoded strings to dynamic translation structures.
- **Auto-Translation Engine**: Deep integration with Google Translate, DeepL, and LibreTranslate APIs. Adds new languages on the fly via CLI and dynamically scales UI components.
- **Intelligent Component Injection**: Target specific DOM elements by HTML tag (`nav`, `header`, `custom`) or HTML ID (`#main-nav`), with granular append/prepend controls.
- **Prevention via Linters (Coming Soon)**: Custom ESLint and Stylelint plugins to prevent future localization bugs will be available post-release.

## Tech Stack

- **Language**: JavaScript / Node.js
- **Architecture**: Monorepo (using `Turborepo` & `npm workspaces`)
- **Parsers**: PostCSS (CSS architecture), Babel (JSX AST processing)
- **Translators**: Third-party APIs (Google, DeepL, LibreTranslate)
- **Target Integrations**: `i18next`, `react-i18next`
- **Landing Page & Docs**: React, Tailwind CSS, GSAP (ScrollTrigger & Core for high-performance animations)

## Prerequisites

- Node.js 18 or higher
- npm 9+ (using workspaces capabilities)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Taimkellizy/meridian-suite.git
cd meridian-suite
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
meridian-suite/
├── apps/
│   ├── web/                    # Interactive marketing landing page & Documentation (React + GSAP)
│   └── examples/               # Sandboxed React repos to test Meridian against
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
├── package.json                # Root package with workspace configurations
└── turbo.json                  # Turborepo orchestrated pipelines
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

- Features granular DOM injection controls: Target components explicitly by HTML Tag (e.g. `nav`, `aside`, `custom`), or target exact elements by HTML ID.
- Supports both `Append` and `Prepend` injection modes for flawless structural alignment.
- Dynamically generates the UI footprint: Renders simple buttons for 2 languages, but securely auto-scales to native `<select>` dropdown menus when 3 or more languages are requested.
- Recognizes application indent spacing and adapts to it.

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
  "languageSwitcher": {
    "position": {
      "tag": "nav",
      "floating": false,
      "id": "main-navigation",
      "insertMode": "append"
    },
    "customClass": "my-translator-btn",
    "showFlags": true
  },
  "linters": {
    "eslint": true,
    "stylelint": true,
    "severity": "warn"
  }
}
```

## Available Scripts

| Command                              | Description                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| `npm run build`                      | Turborepo cached build cycle across all workspaces                                 |
| `npm run lint`                       | Turborepo orchestrated linting                                                     |
| `npm run dev`                        | Start continuous Turborepo local dev workflow                                      |
| `npm run test`                       | Runs all tests recursively in workspaces                                           |
| `meridian init`                      | Runs the entire automation suite interactively                                     |
| `meridian fix-css <path>`            | Scans and corrects CSS logically in isolation                                      |
| `meridian extract <path>`            | Extracts strings from JSX into translation objects                                 |
| `meridian translate [languages...]`  | Translates files, updates `i18n.js` config, and regenerates UI pickers dynamically |
| `meridian add-button --position ...` | Injects the frontend structural language toggle                                    |

## Contributing, Testing, and Deployment

Want to contribute to Meridian? We'd love your help!

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct, the local development setup, how to run tests, and instructions for publishing via Changesets. If you're experiencing development or usage errors, the guide also includes a dedicated **Troubleshooting** section.
