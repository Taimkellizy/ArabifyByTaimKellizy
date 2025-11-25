# 🌐 Arabify (عَرِّب)

**Arabify** scans HTML & CSS files and scores how well a page is “Arabified”. It checks AR-SEO signals, RTL layout, accessibility (alt, labels, ARIA), and basic performance heuristics — then returns a 0–100 score, a categorized breakdown, copyable fixes, and a patched preview(Only for CSS). All processing runs client-side (no server, free, hackathon-ready).

## ✨ Usage (simple steps)
Upload your HTML/CSS → click **Scan** → get a score + issues → download fixed version(Only for CSS).

## 🛠️ Tech stack
- Frontend: plain React with components from [**React Bits**](https://reactbits.dev), [**GSAP**](https://gsap.com), and icons from [**FontAwesome**](https://fontawesome.com/).
- No server required (MVP).  
- License: MIT

## 📖 Scoring model
- Categories & weights for HTML:
  - Semantic Tags => header, nav, footer — (-20 points each -60 points max)
  - SEO => meta tags — (-5 points each -25 points max)
  - Accessibility => alt attribute — (-10 pints once)
  - Language => lang attribute — (-5 points once)
- 

- Categoreis & weights for CSS:
  - Scroll behaiver => if "scroll-behavior: smooth;" is missing — (-10 points once)
  - RTL => any fixed right/left — (-5 points for every match no max)
  - Units => any fixed units like px — (-5 points once)
- 
## Notes: 
    1. there is no negative score.
    2. auto-fix is only availabe for CSS but not for the Units because they are relative to a lot of parameters.


## 📐 How it works (high level)
    1. User uploads HTML and CSS files, or pastes them into textareas.  
    2. App parses the HTML with `DOMParser`, inspects markup and CSS heuristics, and runs a set of deterministic checks.  
    3. App suggests fixes (full fixed version), and offers naive auto-fixes that are safe to preview (e.g., add `lang="ar"`, add `dir="rtl"`, convert `margin-left` → `margin-inline-start`).
    4. Results are showen with links for blog sections to learn how to fix them if not auto-fix supported.

## ⭕ Limitations (clear & exact)
- **HTML & React:** The app works with static HTML files. It can also help with React projects — copy the JSX/HTML snippet you want checked into a separate file (or paste it into the app), run the scan and apply fixes, then paste the fixed JSX/HTML back into your React file. This is manual but works fine for component-level fixes.  
- **Images:** The scanner does **not** analyze image content, so images are not a problem.  
- **Heuristics:** The checks are heuristic and conservative. They may sometimes flag items that are actually fine. Auto-fixes are safe and reversible, but always double-check the suggested changes before applying them to production.

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
    This downloads React, GSAP, and FontAwesome.
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
├── analyzeCSS.js   # Algorithm for processing the CSS
├── analyzeHTML.js  # ALgorithm for processing the HTML
├── CodeWindow.css  # Styles for CodeWindow.js
├── CodeWindow.js   # Custom component for code preview
├── content.js      # Dictionary for English/Arabic text
├── split_text.js   # Custom GSAP animation component
└── index.js        # Entry point