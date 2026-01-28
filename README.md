<a name="top"></a>
[![Arabify Banner](assets/Arabify-banner.png)](https://arabify-by-taim-kellizy.vercel.app)

<!-- Badges -->

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.3.0-blue.svg)](https://github.com/Taimkellizy/ArabifyByTaimKellizy)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=flat&logo=vercel&logoColor=white)](https://arabify-by-taim-kellizy.vercel.app)

**Arabify (عَرِّب)** scans HTML & CSS files and scores how well a page is “Arabified”. It checks AR-SEO signals, RTL layout, accessibility (alt, labels, ARIA), and basic performance heuristics — then returns a 0–100 score, a categorized breakdown, copyable fixes, and a patched preview (Only for CSS). All processing runs client-side.

<!-- Social Share -->

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=social&logo=linkedin)](https://www.linkedin.com/in/taimkellizy/)

---

## Table of Contents

- [About](#-about)
- [What's New](#-whats-new)
- [Scoring Model](#-scoring-model)
- [How it works](#-how-to-works)
- [Limitations](#-limitations)
- [Online Demo](#-online-demo)
- [How to Build](#-how-to-build)
- [Project Structure](#-project-structure)
- [License](#-license)
- [Contacts](#-contacts)

## 🚀 About

**Arabify** is designed to help developers ensure their web pages are fully optimized for Arabic users. It goes beyond simple RTL checks by analyzing deep architectural patterns in your HTML and CSS.

### 🛠️ Tech stack

- **Frontend**: Plain React with components from [**React Bits**](https://reactbits.dev), [**GSAP**](https://gsap.com), and icons from [**FontAwesome**](https://fontawesome.com/).
- **CSS Processing**: [**PostCSS**](https://postcss.org/) for robust parsing and analysis of CSS files.
- **Syntax Highlighting**: [**react-syntax-highlighter**](https://github.com/react-syntax-highlighter/react-syntax-highlighter) (Prism) for code previews.
- **No server required**: Runs entirely in the browser (MVP).

## ✨ What's New

### Version 0.3.0

> [!TIP]
> This release focuses on **Code Injection Intelligence**, **CSS Modernization**, and **RTL Stability**.

#### ⚡ New Features & Improvements

- **Smart React Injection Engine**:
  - **Dynamic Indentation**: Automatically detects and respects existing 2-space or 4-space indentation options.
  - **Smart Placement**: Intelligently places the `LanguageToggle` inside list items (`<li>`) if a list is detected within the `<nav>`.
  - **Duplication Prevention**: Safely ignores `<header>` if a `Navbar` is present and performs robust AST checks to prevent double-injection.
- **Modernized CSS & RTL**:
  - Refactored core styling to use **Logical Properties** (e.g., `margin-inline-start` instead of `margin-left`) for perfect LTR/RTL flipping.
  - Migrated hardcoded pixel values to `rem` units for full responsiveness.
  - Replaced legacy `float` layouts with modern **Flexbox** implementations.
- **Enhanced Reliability**:
  - Comprehensive unit test coverage for the injection logic (indentation, placement, duplication).
  - Fixed edge cases in JSX analysis for layout structure detection.

![Analysis Example](assets/warnings-example.png)

## 📖 Scoring Model

We use a weighted scoring system to evaluate your page:

### HTML Checks

- **Semantic Tags**: `header`, `nav`, `footer` (-20 points each, max -60)
- **SEO**: Meta tags (-5 points each, max -25)
- **Accessibility**: `alt` attribute (-10 points once)
- **Language**: `lang`, `dir` attributes (-5 points each once)

### CSS Checks

- **RTL Logic**: Checks for physical properties that should be logical:
  - Margins/Paddings (left/right → inline-start/end)
  - Borders (left/right → inline-start/end)
  - Text Align (left/right → start/end)
  - Border Radius (-5 points for every match)
  - Positioning (left/right → inset-inline-start/end)
- **Units**: Any fixed units like `px` (-5 points once)

> **Note:** There is no negative score (min 0). Auto-fix is available for CSS properties but not for Units.

## 📐 How it works

1.  **Upload/Paste**: User uploads HTML/CSS files or pastes code.
2.  **Parse**: App parses HTML with `DOMParser` and CSS with `PostCSS`.
3.  **Analyze & Fix**: App suggests fixes and offers naive auto-fixes (e.g., converting `margin-left` → `margin-inline-start`, exploding `border-radius`).
4.  **Learn**: Results link to educational blog sections.

![Blog Example](assets/blog-section1-example.png)

## ⭕ Limitations

- **Images**: Does not analyze image content.
- **Heuristics**: Checks are conservative. Always double-check suggested auto-fixes.

## 🌐 Online Demo

Try it out here: [**arabify-by-taim-kellizy.vercel.app**](https://arabify-by-taim-kellizy.vercel.app)

## 📝 How to Build

### Prerequisites

- **Node.js** installed.

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/Taimkellizy/ArabifyByTaimKellizy.git
    cd arabifybytaimkellizy
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Start the development server**

    ```bash
    npm start
    ```

4.  **Running Tests**
    ```bash
    npm test
    ```

## 📂 Project Structure

```text
src/
├── App.js          # Main application logic & Language state
├── components/     # Reusable UI & Logic components
│   ├── analyzeCSS.js   # Algorithm for processing CSS (PostCSS)
│   ├── analyzeHTML.js  # Algorithm for processing HTML
│   ├── analyzeJSX.js   # Algorithm for processing JSX/TSX
│   └── ...
├── pages/          # Route pages
│   ├── Home.js         # Main landing & tool page
│   └── Blog.js         # Educational content page
└── content.js      # Dictionary for English/Arabic text
```

## 🤝 Feedback and Contributions

Your input is crucial for our continuous improvement. Whether you have feedback on features, bugs, or suggestions, we're eager to hear from you.

## 📃 License

Distributed under the **MIT License**.

## 🗨️ Contacts

- **Email**: [taimkellizy@gmail.com](mailto:taimkellizy@gmail.com)
- **LinkedIn**: [Taim Kellizy](https://www.linkedin.com/in/taimkellizy/)

[Back to top](#top)
