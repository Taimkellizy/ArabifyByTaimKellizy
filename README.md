# 🌐 Arabify (عَرِّب) v1.0.0

**Arabify** scans HTML & CSS files and scores how well a page is “Arabified”. It checks AR-SEO signals, RTL layout, accessibility (alt, labels, ARIA), and basic performance heuristics — then returns a 0–100 score, a categorized breakdown, copyable fixes, and a patched preview (Only for CSS). All processing runs client-side (no server, free, hackathon-ready).

## 🎉 New Features in v1.0.0
- **JSX/TSX Support**: Now supports analyzing React components (`.jsx`, `.tsx`, `.js`) directly!
- **Enhanced RTL Analysis**:
  - Detects physical properties in JS style objects (e.g., `marginLeft`, `paddingRight`).
  - Identifies direction-sensitive `borderRadius` shorthands (4 values).
  - Checks for hardcoded `textAlign` and `float` values, including TypeScript `as const`.
  - Flags physical margin/padding utility classes (e.g., `ml-4`, `pr-2`).
- **Full Arabic Localization**: The entire interface and all error messages are now fully translated into Arabic.
- **Enhanced Analysis**: Improved detection of physical CSS properties that need to be logical for RTL support.
- **Flexible Uploads**: Support for single files, multiple files, and entire folders.
- **Download Options**: Download fixed code as individual files or as a complete ZIP archive.
- **Improved UI**: Better formatting for code snippets and property names.

## ✨ Usage (simple steps)
Upload your HTML/CSS → click **Scan** → get a score + issues → download fixed version (Only for CSS).

## 🛠️ Tech stack
- Frontend: plain React with components from [**React Bits**](https://reactbits.dev), [**GSAP**](https://gsap.com), and icons from [**FontAwesome**](https://fontawesome.com/).
- CSS Processing: [**PostCSS**](https://postcss.org/) for robust parsing and analysis of CSS files.
- Syntax Highlighting: [**react-syntax-highlighter**](https://github.com/react-syntax-highlighter/react-syntax-highlighter) (Prism) for code previews.
- No server required (MVP).  
- License: MIT

## 📖 Scoring model
- Categories & weights for HTML:
  - Semantic Tags => header, nav, footer — (-20 points each -60 points max)
  - SEO => meta tags — (-5 points each -25 points max)
  - Accessibility => alt attribute — (-10 points once)
  - Language => lang, dir attributes — (-5 points each once)

- Categories & weights for CSS:
  - RTL => Checks for physical properties that should be logical:
    - Margins (left/right -> inline-start/end)
    - Paddings (left/right -> inline-start/end)
    - Borders (left/right -> inline-start/end)
    - Text Align (left/right -> start/end)
    - Border Radius (top-left/etc -> start-start/etc) — (-5 points for every match no max)
    - Positioning (left/right -> inset-inline-start/end)
  - Units => any fixed units like px — (-5 points once)

> **Notes:** 1. There is no negative score. 2. Auto-fix is only available for CSS but not for the Units because they are relative to a lot of parameters.


## 📐 How it works (high level)
    1. User uploads HTML and CSS files, or pastes them into textareas.  
    2. App parses the HTML with `DOMParser` and CSS with `PostCSS` to inspect markup and heuristics.  
    3. App suggests fixes (full fixed version), and offers naive auto-fixes that are safe to preview (e.g., add `lang="ar"`, add `dir="rtl"`, convert `margin-left` → `margin-inline-start`, and "explodes" shorthand `border-radius: 8px 0 0 8px` into 4 logical lines).
    4. Results are shown with links for blog sections to learn how to fix them if not auto-fix supported.

## ⭕ Limitations (clear & exact)
- **HTML & React**: The app works with static HTML files and now supports **React components** (`.jsx`, `.tsx`) directly. You can upload them or paste the code to get an analysis of your component's structure and styling.  
- **Images:** The scanner does **not** analyze image content, so images are not a problem.  
- **Heuristics:** The checks are heuristic and conservative. They may sometimes flag items that are actually fine. Auto-fixes are safe and reversible, but always double-check the suggested changes before applying them to production.

> **Note:** You don't need to follow all the fixes shown because they are meant for a full UI page in HTML. For React, you may put each one in its own component, and you may only include the meta tags to the main `index.html` (which doesn't have any semantic elements because they are in the JS files).

## 🌐 Online Demo
You can use an online demo on Vercel at this link: [arabify-by-taim-kellizy.vercel.app](https://arabify-by-taim-kellizy.vercel.app)

## 🚀 Getting Started

Follow these steps to run the project locally on your machine.

### Prerequisites
Make sure you have **Node.js** installed.

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Taimkellizy/ArabifyByTaimKellizy.git
    ```

2.  **Navigate to the project folder**
    ```bash
    cd arabifybytaimkellizy
    ```

3.  **Install dependencies** (Important!)
    This downloads React, GSAP, FontAwesome, and PostCSS.
    ```bash
    npm install
    ```

4.  **Start the development server**
    ```bash
    npm start
    ```

The app will automatically open in your browser at `http://localhost:3000`.

## 📂 Project Structure

```text
src/
├── App.js          # Main application logic & Language state
├── App.css         # Global styles & Responsive rules
├── components/     # Reusable UI & Logic components
│   ├── analyzeCSS.js   # Algorithm for processing the CSS (using PostCSS)
│   ├── analyzeHTML.js  # Algorithm for processing the HTML
│   ├── analyzeJSX.js   # Algorithm for processing JSX/TSX (using Babel)
│   ├── CodeWindow.js   # Custom component for code preview
│   ├── CodeWindow.css  # Styles for CodeWindow.js
│   ├── Header.js       # Header component
│   ├── Footer.js       # Footer component
│   └── split_text.js   # Custom GSAP animation component
├── pages/          # Route pages
│   ├── Home.js         # Main landing & tool page
│   └── Blog.js         # Educational content page
├── content.js      # Dictionary for English/Arabic text
├── codeSnippets.js # Shared code examples for Blog
└── index.js        # Entry point