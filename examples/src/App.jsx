import { useTranslation } from "react-i18next";import LanguageToggle from "./components/LanguageToggle";
import { LanguageProvider, LanguageContext } from "./contexts/LanguageContext";
import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';
import heroImg from './assets/hero.png';
import './App.css';
const AppWithLang = (props) => <LanguageProvider><App {...props} /></LanguageProvider>;
function App() {const { t } = useTranslation();
  const [count, setCount] = useState(0);
  return <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt={t("React logo")} />
          <img src={viteLogo} className="vite" alt={t("Vite logo")} />
        </div>
        <div>
          <h1>{t("Get started")}</h1>
          <p>{" " + t("Edit") + " "}
          <code>{t("src/App.jsx")}</code>{" " + t("and save to test") + " "}<code>{t("HMR")}</code>
          </p>
        </div>
        <button className="counter" onClick={() => setCount((count) => count + 1)}>{" " + t("Count is {{count}}", { count }) + " "}


      </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>{t("Documentation")}</h2>
          <p>{t("Your questions, answered")}</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />{" " + t("Explore Vite") + " "}

            </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />{" " + t("Learn more") + " "}

            </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>{t("Connect with us")}</h2>
          <p>{t("Join the Vite community")}</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  
                  <use href="/icons.svg#github-icon"></use>
                </svg>{" " + t("GitHub") + " "}

            </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  
                  <use href="/icons.svg#discord-icon"></use>
                </svg>{" " + t("Discord") + " "}

            </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  
                  <use href="/icons.svg#x-icon"></use>
                </svg>{" " + t("X.com") + " "}

            </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>{" " + t("Bluesky") + " "}

            </a>
            </li>
          </ul>
        </div>
      </section>
      <footer>
        <p>{t("\xA9 2023 Vite. All rights reserved.")}</p>
      <LanguageToggle /></footer>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>;
}
export default AppWithLang;