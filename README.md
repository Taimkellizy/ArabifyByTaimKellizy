# 🌐 Arabify (عَرِّب)

**Arabify** scans HTML & CSS files and scores how well a page is “Arabified”. It checks AR-SEO signals, RTL layout, Arabic-friendly fonts & typography, accessibility (alt, labels, ARIA), and basic performance heuristics — then returns a 0–100 score, a categorized breakdown, copyable fixes, and a patched preview. All processing runs client-side (no server, free, hackathon-ready).

## ✨ Usage (simple steps)
Upload your HTML/CSS → click **Scan** → get a score + issues → preview auto-fixes → download fixed version.

## 🛠️ Tech stack
- Frontend: plain React with components from [**React Bits**](https://reactbits.dev), [**GSAP**](https://gsap.com), and icons from [**FontAwesome**](https://fontawesome.com/).
- No server required (MVP).  
- License: MIT

## 📖 Scoring model
- Categories & weights:
  - AR-SEO — 30%  
  - RTL / Layout — 30%  
  - Accessibility — 25%  
  - Typography — 15% 
- Each category has a small set of checks (pass = 1, partial = 0.5). Category score = (passed / total) * 100. Final score = weighted sum (0–100).

## 📐 How it works (high level)
    1. User uploads HTML and CSS files, or pastes them into textareas.  
    2. App parses the HTML with `DOMParser`, inspects markup and CSS heuristics, and runs a set of deterministic checks.  
    3. App suggests fixes (short snippets you can copy), and offers naive auto-fixes that are safe to preview (e.g., add `lang="ar"`, add `dir="rtl"`, convert `margin-left` → `margin-inline-start`).  
    4. Patched HTML/CSS rendered inside a sandboxed iframe for before/after comparison.  
    5. Results exported as JSON for reporting.

## ⭕ Limitations (clear & exact)
- **HTML & React:** The app works with static HTML files. It can also help with React projects — copy the JSX/HTML snippet you want checked into a separate file (or paste it into the app), run the scan and apply fixes, then paste the fixed JSX/HTML back into your React file. This is manual but works fine for component-level fixes.  
- **Images & fonts:** The scanner does **not** analyze image content, so images are not a problem. For fonts, ranking is simple: we check against a small "bad fonts" list (fonts that break Arabic readability). If a font is *not* on the bad list, it's treated as acceptable. The app flags only fonts known to cause readability issues.  
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
├── CodeWindow.css  # Styles for CodeWindow.js
├── CodeWindow.js   # Custom component for code preview
├── content.js      # Dictionary for English/Arabic text
├── split_text.js   # Custom GSAP animation component
└── index.js        # Entry point