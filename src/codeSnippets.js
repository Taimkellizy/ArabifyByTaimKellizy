export const CODE_SNIPPETS = {
    structure: `/* Bad ❌ */
<div class="header">...</div>
<div class="nav">...</div>

/* Good ✅ */
<header>...</header>
<nav>...</nav>`,

    images: `/* Good ✅ */
<img src="logo.png" alt="Arabify Logo" />

/* Good ✅ */ (decorative)
<img src="shape.png" alt="" />`,

    logicalProperties: `.card {
  margin-inline-start: 20px; /* Left in EN, Right in AR */
  padding-inline-end: 15px;
  text-align: start;
}`,

    remUnits: `h1 {
  font-size: 2rem; /* Scales relative to user */
}`,

    scrollBehavior: `html {
  scroll-behavior: smooth;
}`,

    langDir: `/* For English */
<html lang="en" dir="ltr">

/* For Arabic */
<html lang="ar" dir="rtl">

 /* If you're using React, you can use the 'useEffect' hook to set the language and direction dynamically.*/`,

    metaTags: `<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="Site description..." />
<meta name="keywords" content="keyword1, keyword2, keyword3" />
<meta name="author" content="Your Name" />`,

    textAlign: `/* Bad ❌ */
p {
  text-align: left; /* Forces Arabic to wrong side */
}

/* Good ✅ */
p {
  text-align: start; /* Left in EN, Right in AR */
}`
};
