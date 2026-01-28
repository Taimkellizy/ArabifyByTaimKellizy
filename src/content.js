import React from "react";
import { CODE_SNIPPETS } from "./codeSnippets";

export const content = {
  en: {
    blog: "BLOG",
    contact: "CONTACT",
    toggleBtn: "AR",
    heroText: "RTL and Arabic SEO, simplified.",
    heropar: "Instant scans for RTL, AR-SEO, fonts, and accessibility. Fix hints + live preview.",
    herobtn1: "Try Now",
    herobtn2: "View Source",
    downloadFixed: "Download Fixed Code",
    analyzeBtn: "Analyze Code",
    score: "Score:",
    copyrights: "© 2025 Arabify. Open Source (MIT License).",
    upFile: "Upload File",
    fileUped: "File Uploaded (Change?)",
    analyzing: "Analyzing...",
    downloadZip: "Download Project (Zip)",
    noIssues: "No issues found!",
    howToFix: "How to fix?",
    uploadFiles: "Upload File(s)",
    uploadFolder: "Upload Folder",
    upload: "Upload",
    files: "Files",

    // Wizard
    wizardTitle: "Analysis Configuration",
    modeSelect: "Select Analysis Mode",
    modeScan: "Quick Scan (Report Only)",
    modeFix: "Auto-Fix CSS & Scan",
    modeMultiLang: "Multi-Language Setup & Checks",
    configFiles: "Project Configuration",
    mainJs: "Main React Entry File (e.g. App.js)",
    mainHtml: "Main HTML File (e.g. index.html)",
    startBtn: "Start Analysis",
    projectType: "Project Type",
    typeReact: "React.js",
    typeVanilla: "Vanilla (HTML/CSS/JS)",
    cancelBtn: "Cancel",

    // Error Types
    errtypeStructure: "HTML Structure",
    errPreSemantic: "We couldn't find a",
    errPostSemantic: "tag in the entire project.",
    errtypeAlt: "Accessibility",
    errtypeMeta: "SEO & Meta Tags",
    errtypeLanguage: "Language Configuration",
    errtypeRTL: "RTL Styling",
    errtypeResponsiveness: "Responsiveness",

    // --- HTML WARNINGS (Using JSX for styling) ---
    msgMissingHeader: <>We couldn't find a <span className="en-code">&lt;header&gt;</span> tag. Consider replacing <span className="en-code">&lt;div className='header'&gt;</span> with <span className="en-code">&lt;header&gt;</span>.</>,
    msgMissingNav: <>We couldn't find a <span className="en-code">&lt;nav&gt;</span> tag. Consider replacing <span className="en-code">&lt;div className='nav'&gt;</span> with <span className="en-code">&lt;nav&gt;</span>.</>,
    msgMissingFooter: <>We couldn't find a <span className="en-code">&lt;footer&gt;</span> tag. Consider adding one for better structure.</>,
    msgMissingMain: <>We couldn't find a <span className="en-code">&lt;main&gt;</span> tag. Consider wrapping your main content in <span className="en-code">&lt;main&gt;</span>.</>,

    // FUNCTION: Dynamic ID
    msgMissingAlt: (id) => <>Image <span className="en-code">#{id}</span> is missing an 'alt' attribute.</>,

    msgMissingMetaCharset: <>Missing <span className="en-code">&lt;meta charset='utf-8'&gt;</span> tag for proper character encoding.</>,
    msgMissingMetaViewport: <>Missing <span className="en-code">&lt;meta name='viewport'...&gt;</span> tag for responsive design.</>,
    msgMissingMetaDescription: <>Missing <span className="en-code">&lt;meta name='description'...&gt;</span> tag for SEO.</>,
    msgMissingMetaKeywords: <>Missing <span className="en-code">&lt;meta name='keywords'...&gt;</span> tag for SEO.</>,
    msgMissingMetaAuthor: <>Missing <span className="en-code">&lt;meta name='author'...&gt;</span> tag for SEO.</>,
    msgMissingLangAttribute: <>The <span className="en-code">&lt;html&gt;</span> tag is missing a <span className="en-code">lang</span> attribute.</>,
    msgMissingDirAttribute: <>The <span className="en-code">&lt;html&gt;</span> tag is missing a <span className="en-code">dir</span> attribute.</>,
    msgAvoidTextAlign: <>Avoid <span className="en-code">text-align: left/right</span>. Use <span className="en-code">start/end</span> for RTL support.</>,
    msgAvoidFloat: <>Avoid <span className="en-code">float: left/right</span>. Use CSS Grid or Flexbox for layout.</>,
    msgParseError: "Could not parse file. Please check for syntax errors.",
    msgEmptyButton: "Empty button found without aria-label.",
    msgAvoidPhysicalProp: (key) => <>Avoid physical property <span className="en-code">'{key}'</span>. Use logical properties (e.g., marginInlineStart).</>,
    msgAvoidBorderRadiusShorthand: "Avoid 4-value borderRadius shorthand. It is direction-sensitive.",
    msgAvoidTextLeftRightClass: "Avoid 'text-left'/'text-right'. Use logical alignment.",
    msgAvoidPhysicalMarginPaddingClass: "Avoid physical margin/padding (ml-, mr-). Use logical properties (ms-, me-).",
    msgMissingLangLogic: "Main App file seems to be missing Language Context or dynamic direction logic.",

    // --- CSS WARNINGS ---
    fixScroll: <>Added <span className="en-code">scroll-behavior: smooth</span> to html for better user experience.</>,
    fixMarginLeft: <>Replaced <span className="en-code">margin-left</span> with <span className="en-code">margin-inline-start</span> to automatically flip spacing in RTL mode.</>,
    fixMarginRight: <>Replaced <span className="en-code">margin-right</span> with <span className="en-code">margin-inline-end</span> to automatically flip spacing in RTL mode.</>,
    fixPaddingLeft: <>Replaced <span className="en-code">padding-left</span> with <span className="en-code">padding-inline-start</span> to support RTL.</>,
    fixPaddingRight: <>Replaced <span className="en-code">padding-right</span> with <span className="en-code">padding-inline-end</span> to support RTL.</>,
    fixTextAlign: <>Replaced <span className="en-code">text-align: left/right</span> with <span className="en-code">start/end</span> so text aligns correctly in Arabic.</>,
    warnPx: <>Found fixed <span className="en-code">px</span> values larger than 10px. Use <span className="en-code">rem</span> for fonts and spacing.</>,
    fixBorderLeft: <>Replaced <span className="en-code">border-left</span> with <span className="en-code">border-inline-start</span>.</>,
    fixBorderRight: <>Replaced <span className="en-code">border-right</span> with <span className="en-code">border-inline-end</span>.</>,
    fixBorderTopLeftRadius: <>Fixed <span className="en-code">border-top-left-radius</span> to logical <span className="en-code">border-start-start-radius</span>.</>,
    fixBorderTopRightRadius: <>Fixed <span className="en-code">border-top-right-radius</span> to logical <span className="en-code">border-start-end-radius</span>.</>,
    fixBorderBottomRightRadius: <>Fixed <span className="en-code">border-bottom-right-radius</span> to logical <span className="en-code">border-end-end-radius</span>.</>,
    fixBorderBottomLeftRadius: <>Fixed <span className="en-code">border-bottom-left-radius</span> to logical <span className="en-code">border-end-start-radius</span>.</>,
    fixBorderRadiusShorthand: <>Converted physical <span className="en-code">border-radius</span> shorthand to logical properties.</>,
    fixLeftPosition: <>Fixed absolute positioning <span className="en-code">left</span> to <span className="en-code">inset-inline-start</span>.</>,
    fixRightPosition: <>Fixed absolute positioning <span className="en-code">right</span> to <span className="en-code">inset-inline-end</span>.</>,

    // New Blog Specific Labels
    blogSubtitle: "Your comprehensive guide to Accessibility, RTL support, and Modern CSS.",
    blogFixLabel: "💡 The Fix:",
    videoWatch: "Watch:",

    // The Blog Data
    blogPosts: [
      {
        id: 1,
        title: "1. Structure and Semantics",
        desc: "Using generic <div> tags for everything makes your website a 'black box' to screen readers. Assistive technologies rely on Landmarks to navigate.",
        fix: "Replace generic divs with standard HTML5 tags.",
        code: CODE_SNIPPETS.structure,
        language: "html",
        videoUrl: "https://www.youtube.com/watch?v=vAAzdi1xuUY",
        videoTitle: "Why headings and landmarks are so important"
      },
      {
        id: 2,
        title: "2. Images and Alt Text",
        desc: "When an image is missing the 'alt' attribute, screen readers read the file name (e.g., IMG_5922.jpg). Search engines can't 'see' your images without it.",
        fix: "Always add a descriptive alt attribute. If decorative, use an empty string.",
        code: CODE_SNIPPETS.images,
        language: "html",
        videoUrl: "https://youtu.be/JP2VkfYF5HU?si=-ZD5xE142ZG8ClGn&t=166",
        videoTitle: "Why you should start using ARIA Attributes in HTML"
      },
      {
        id: 3,
        title: "3. CSS Logical Properties",
        desc: "Traditionally we used Left and Right. This breaks layouts in Arabic because margins don't flip automatically.",
        fix: "We use 'Start' and 'End'. The browser automatically flips them based on the document direction.",
        code: CODE_SNIPPETS.logicalProperties,
        language: "css",
        videoUrl: "https://www.youtube.com/watch?v=wPvXHiHHSgY",
        videoTitle: "Everything you need to know about CSS Logical Properties"
      },
      {
        id: 4,
        title: "4. Pixels (px) vs. REM",
        desc: "Pixels are absolute. If a visually impaired user increases their browser font size, px-based text won't scale.",
        fix: "Use 'rem'. 1rem equals the user's default browser font size and scales automatically.",
        code: CODE_SNIPPETS.remUnits,
        language: "css",
        videoUrl: "https://www.youtube.com/watch?v=okw-whFWGEo",
        videoTitle: "Stop using pixels in your CSS! How and why to use REM and EM."
      },
      {
        id: 5,
        title: "5. HTML Language and Direction",
        desc: "Without a 'lang' attribute, screen readers will read Arabic with an English accent (unintelligible). Without 'dir=rtl', the browser assumes Left-to-Right layout, breaking the reading order.",
        fix: "Always declare the language and direction on the HTML tag.",
        code: CODE_SNIPPETS.langDir,
        language: "html",
        videoUrl: "https://www.youtube.com/watch?v=cOmehxAU_4s",
        videoTitle: "How I do an accessibility check"
      },
      {
        id: 6,
        title: "6. Essential Meta Tags",
        desc: "Meta tags are invisible to users but critical for browsers and bots. Missing the 'viewport' tag causes your site to look tiny on mobile phones. Missing 'description' hurts your SEO.",
        fix: "Include standard meta tags in your <head>.",
        code: CODE_SNIPPETS.metaTags,
        language: "html",
        videoUrl: "https://www.youtube.com/watch?v=WecWWZifXB4",
        videoTitle: "Learn HTML Meta-Tags in 4 Minutes!"
      },
      {
        id: 7,
        title: "7. Text Alignment",
        desc: "Forcing 'text-align: left' on an Arabic paragraph makes it look ragged and hard to read. Arabic is read from Right to Left.",
        fix: "Avoid 'left' or 'right'. Use 'start' and 'end' to let the browser decide based on the language.",
        code: CODE_SNIPPETS.textAlign,
        language: "css",
        videoUrl: "https://www.youtube.com/watch?v=wPvXHiHHSgY",
        videoTitle: "Everything you need to know about CSS Logical Properties"
      }
    ]
  },

  ar: {
    blog: "مدونة",
    contact: "تواصل معنا",
    toggleBtn: "EN",
    heroText: "ظبط محركات البحث و التعريب بشكل مبسط.",
    heropar: "فحوصات فورية لمحركات البحث، الخطوط، وسهولة الوصول. نصائح للإصلاح + معاينة مباشرة.",
    herobtn1: "جرب فحص سريع",
    herobtn2: "عرض المصدر",
    downloadFixed: "تحميل الكود المصحح",
    analyzeBtn: "تحليل الكود",
    score: "النقاط:",
    copyrights: "© 2025 عَرِّب. مفتوح المصدر (رخصة MIT).",
    upFile: "رفع ملف",
    fileUped: "تم رفع الملف (تغيير؟)",
    analyzing: "جاري التحليل...",
    downloadZip: "تحميل المشروع (Zip)",
    noIssues: "لم يتم العثور على مشاكل!",
    howToFix: "كيف أصلحه؟",
    uploadFiles: "رفع ملفات",
    uploadFolder: "رفع مجلد",
    upload: "رفع",
    files: "ملفات",

    // Wizard
    wizardTitle: "إعدادات التحليل",
    modeSelect: "اختر وضع التحليل",
    modeScan: "فحص سريع (تقرير فقط)",
    modeFix: "إصلاح تلقائي للـ CSS وفحص",
    modeMultiLang: "إعداد وتدقيق تعدد اللغات",
    configFiles: "إعدادات المشروع",
    mainJs: "ملف React الرئيسي (مثل App.js)",
    mainHtml: "ملف HTML الرئيسي (مثل index.html)",
    startBtn: "ابـدأ التحليل",
    projectType: "نوع المشروع",
    typeReact: "React.js",
    typeVanilla: "إعتيادي (HTML/CSS/JS)",
    cancelBtn: "إلغاء",

    errtypeStructure: "هيكلية الصفحة",
    errPreSemantic: "لم نتمكن من العثور على وسم",
    errPostSemantic: "في المشروع بالكامل.",
    errtypeAlt: "سهولة الوصول",
    errtypeMeta: "تحسين محركات البحث (SEO)",
    errtypeLanguage: "إعدادات اللغة",
    errtypeRTL: "دعم العربية (RTL)",
    errtypeResponsiveness: "التجاوب",

    // --- HTML WARNINGS (Arabic with Fixed English Direction) ---
    msgMissingHeader: <>لم نتمكن من العثور على وسم <span className="en-code">&lt;header&gt;</span>. فكر في استبدال <span className="en-code">&lt;div className='header'&gt;</span> بـ <span className="en-code">&lt;header&gt;</span>.</>,
    msgMissingNav: <>لم نتمكن من العثور على وسم <span className="en-code">&lt;nav&gt;</span>. فكر في استبدال <span className="en-code">&lt;div className='nav'&gt;</span> بـ <span className="en-code">&lt;nav&gt;</span>.</>,
    msgMissingFooter: <>لم نتمكن من العثور على وسم <span className="en-code">&lt;footer&gt;</span>. فكر في إضافة واحد لتحسين الهيكلية.</>,
    msgMissingMain: <>لم نتمكن من العثور على وسم <span className="en-code">&lt;main&gt;</span>. فكر في تغليف المحتوى الرئيسي بـ <span className="en-code">&lt;main&gt;</span>.</>,

    // FUNCTION
    msgMissingAlt: (id) => <>الصورة رقم <span className="en-code">#{id}</span> تفتقد وسم <span className="en-code">alt</span>.</>,

    msgMissingMetaCharset: <>يفتقد وسم <span className="en-code">&lt;meta charset='utf-8'&gt;</span> لترميز الأحرف بشكل صحيح.</>,
    msgMissingMetaViewport: <>يفتقد وسم <span className="en-code">&lt;meta name='viewport'...&gt;</span> لتصميم متجاوب.</>,
    msgMissingMetaDescription: <>يفتقد وسم <span className="en-code">&lt;meta name='description'...&gt;</span> لضبط محركات البحث.</>,
    msgMissingMetaKeywords: <>يفتقد وسم <span className="en-code">&lt;meta name='keywords'...&gt;</span> لضبط محركات البحث.</>,
    msgMissingMetaAuthor: <>يفتقد وسم <span className="en-code">&lt;meta name='author'...&gt;</span> لضبط محركات البحث.</>,
    msgMissingLangAttribute: <>وسم <span className="en-code">&lt;html&gt;</span> يفتقد وسم <span className="en-code">lang</span>.</>,
    msgMissingDirAttribute: <>وسم <span className="en-code">&lt;html&gt;</span> يفتقد وسم <span className="en-code">dir</span>.</>,
    msgAvoidTextAlign: <>تجنب استخدام <span className="en-code">text-align: left/right</span>. استخدم <span className="en-code">start/end</span> لدعم العربية.</>,
    msgAvoidFloat: <>تجنب استخدام <span className="en-code">float: left/right</span>. استخدم CSS Grid أو Flexbox للتخطيط.</>,
    msgParseError: "لم نتمكن من تحليل الملف. يرجى التحقق من وجود أخطاء في بناء الجملة.",
    msgEmptyButton: "تم العثور على زر فارغ بدون تسمية (aria-label).",
    msgAvoidPhysicalProp: (key) => <>تجنب الخاصية المادية <span className="en-code">'{key}'</span>. استخدم الخصائص المنطقية (مثل marginInlineStart).</>,
    msgAvoidBorderRadiusShorthand: "تجنب اختصار borderRadius بـ 4 قيم. إنه حساس للاتجاه.",
    msgAvoidTextLeftRightClass: "تجنب 'text-left'/'text-right'. استخدم المحاذاة المنطقية.",
    msgAvoidPhysicalMarginPaddingClass: "تجنب هوامش/حواشي مادية (ml-, mr-). استخدم خصائص منطقية (ms-, me-).",
    msgMissingLangLogic: "يبدو أن ملف التطبيق الرئيسي يفتقد سياق اللغة أو منطق الاتجاه الديناميكي.",

    // --- CSS WARNINGS ---
    fixScroll: <>تم إضافة <span className="en-code">scroll-behavior: smooth</span> لتحسين تجربة التمرير.</>,
    fixMarginLeft: <>تم استبدال <span className="en-code">margin-left</span> بـ <span className="en-code">margin-inline-start</span> لقلب المسافات تلقائياً في العربية.</>,
    fixMarginRight: <>تم استبدال <span className="en-code">margin-right</span> بـ <span className="en-code">margin-inline-end</span> لقلب المسافات تلقائياً في العربية.</>,
    fixPaddingLeft: <>تم استبدال <span className="en-code">padding-left</span> بـ <span className="en-code">padding-inline-start</span> لدعم الاتجاهين.</>,
    fixPaddingRight: <>تم استبدال <span className="en-code">padding-right</span> بـ <span className="en-code">padding-inline-end</span> لدعم الاتجاهين.</>,
    fixTextAlign: <>تم استبدال <span className="en-code">text-align</span> بـ <span className="en-code">start/end</span> لضمان محاذاة النص بشكل صحيح.</>,
    warnPx: <>تم العثور على قيم <span className="en-code">px</span> أكبر من 10px. استخدم <span className="en-code">rem</span> للخطوط والمسافات.</>,
    fixBorderLeft: <>تم استبدال <span className="en-code">border-left</span> بـ <span className="en-code">border-inline-start</span>.</>,
    fixBorderRight: <>تم استبدال <span className="en-code">border-right</span> بـ <span className="en-code">border-inline-end</span>.</>,
    fixBorderTopLeftRadius: <>تم إصلاح <span className="en-code">border-top-left-radius</span> إلى <span className="en-code">border-start-start-radius</span> المنطقي.</>,
    fixBorderTopRightRadius: <>تم إصلاح <span className="en-code">border-top-right-radius</span> إلى <span className="en-code">border-start-end-radius</span> المنطقي.</>,
    fixBorderBottomRightRadius: <>تم إصلاح <span className="en-code">border-bottom-right-radius</span> إلى <span className="en-code">border-end-end-radius</span> المنطقي.</>,
    fixBorderBottomLeftRadius: <>تم إصلاح <span className="en-code">border-bottom-left-radius</span> إلى <span className="en-code">border-end-start-radius</span> المنطقي.</>,
    fixBorderRadiusShorthand: <>تم تحويل اختصار <span className="en-code">border-radius</span> المادي إلى خصائص منطقية.</>,
    fixLeftPosition: <>تم إصلاح التموضع المطلق <span className="en-code">left</span> إلى <span className="en-code">inset-inline-start</span>.</>,
    fixRightPosition: <>تم إصلاح التموضع المطلق <span className="en-code">right</span> إلى <span className="en-code">inset-inline-end</span>.</>,

    // New Blog Specific Labels
    blogSubtitle: "دليلك الشامل لتحسين تجربة المستخدم، دعم العربية، وسهولة الوصول.",
    blogFixLabel: "💡 الحل:",
    videoWatch: "شاهد الشرح:",

    // The Blog Data
    blogPosts: [
      {
        id: 1,
        title: "1. الهيكلية والدلالات (HTML Semantics)",
        desc: "استخدام وسوم <div> العامة لكل شيء يجعل موقعك صندوقاً أسود لقارئات الشاشة. تعتمد أدوات المساعدة على المعالم للتنقل.",
        fix: "استبدل الـ divs العامة بوسوم HTML5 القياسية.",
        code: CODE_SNIPPETS.structure,
        language: "html",
        videoUrl: "https://www.youtube.com/watch?v=vAAzdi1xuUY",
        videoTitle: "لماذا الهيكلية والدلالات مهمة"
      },
      {
        id: 2,
        title: "2. الصور والنص البديل (Alt Text)",
        desc: "عندما تفتقد الصورة لوسم alt، تقرأ قارئات الشاشة اسم الملف، وهو أمر مزعج. محركات البحث أيضاً لا تستطيع 'رؤية' الصور.",
        fix: "أضف دائماً وصفاً للصورة. إذا كانت الصورة للزينة فقط، اترك الوصف فارغاً.",
        code: CODE_SNIPPETS.images,
        language: "html",
        videoUrl: "https://youtu.be/JP2VkfYF5HU?si=-ZD5xE142ZG8ClGn&t=166",
        videoTitle: "لماذا يجب عليك البدء في استخدام سمات ARIA في HTML"
      },
      {
        id: 3,
        title: "3. الخصائص المنطقية (Logical Properties)",
        desc: "استخدام اليمين واليسار (Physical) يكسر التصميم عند تحويل الموقع للعربية لأن الهوامش لا تنقلب.",
        fix: "نستخدم 'البداية' (Start) و 'النهاية' (End). المتصفح سيقوم بقلبها تلقائياً.",
        code: CODE_SNIPPETS.logicalProperties,
        language: "css",
        videoUrl: "https://www.youtube.com/watch?v=wPvXHiHHSgY",
        videoTitle: "كل ما تحتاج إلى معرفته حول خصائص CSS المنطقية"
      },
      {
        id: 4,
        title: "4. الوحدات النسبية (Rem vs Px)",
        desc: "وحدات البكسل ثابتة. إذا قام المستخدم بتكبير حجم الخط، النصوص المكتوبة بالـ px لن تتغير.",
        fix: "استخدم rem. حيث 1rem يساوي حجم خط المتصفح الافتراضي ويتغير بتغير الإعدادات.",
        code: CODE_SNIPPETS.remUnits,
        language: "css",
        videoUrl: "https://www.youtube.com/watch?v=okw-whFWGEo",
        videoTitle: "توقف عن استخدام البكسلات في CSS! كيف ولماذا تستخدم REM وEM؟"
      },
      {
        id: 5,
        title: "5. سمات اللغة والاتجاه (Lang & Dir)",
        desc: "بدون سمة اللغة (lang)، ستقرأ قارئات الشاشة النص العربي بلهجة إنجليزية (غير مفهوم). وبدون سمة الاتجاه (dir)، سيفترض المتصفح تخطيطاً من اليسار لليمين.",
        fix: "أضف دائماً سمات اللغة والاتجاه في وسم HTML الرئيسي.",
        code: CODE_SNIPPETS.langDir,
        language: "html",
        videoUrl: "https://www.youtube.com/watch?v=cOmehxAU_4s",
        videoTitle: "كيف أقوم بإجراء فحص إمكانية الوصول"
      },
      {
        id: 6,
        title: "6. وسوم الميتا (Meta Tags)",
        desc: "وسوم الميتا غير مرئية للمستخدمين ولكنها حاسمة للمتصفحات. غياب وسم 'viewport' يجعل موقعك يبدو صغيراً جداً على الهواتف. وغياب 'description' يضر بظهورك في جوجل.",
        fix: "أضف وسوم الميتا القياسية في الـ <head>.",
        code: CODE_SNIPPETS.metaTags,
        language: "html",
        videoUrl: "https://www.youtube.com/watch?v=WecWWZifXB4",
        videoTitle: "تعلم علامات HTML التعريفية في 4 دقائق!"
      },
      {
        id: 7,
        title: "7. محاذاة النصوص (Text Align)",
        desc: "إجبار النص على 'text-align: left' في الفقرات العربية يجعل القراءة صعبة وشكل النص غير متناسق.",
        fix: "تجنب استخدام 'left' أو 'right'. استخدم 'start' و 'end' ليقوم المتصفح بتحديد الجهة حسب اللغة.",
        code: CODE_SNIPPETS.textAlign,
        language: "css",
        videoUrl: "https://www.youtube.com/watch?v=wPvXHiHHSgY",
        videoTitle: "كل ما تحتاج إلى معرفته حول خصائص CSS المنطقية"
      }
    ],

  }
};