

import { GoogleGenAI } from "@google/genai";
import { jsPDF } from "jspdf";
import * as docx from "docx";
import { initWritingModules } from "./writing-modules";
import { initChatWidget } from "./chat-widget";
import { initHfCatalog } from "./hf-catalog-ui";

// --- Type Declarations ---
// FIX: Replaced inline type for `window.aistudio` with a named `AIStudio` interface
// to resolve a TypeScript declaration conflict, as indicated by the error message.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

// --- Translation Data ---
const translations = {
  en: {
    // Meta
    pageTitle: "FindExpert.ir | The Bridge Between University and Industry",

    // Header
    brandName: "FindExpert.ir",

    // Hero
    heroTitle: "Strengthening the University-Industry Link",
    heroSubtitle: "The weak link between university and industry in Iran is a major challenge. Research shows only 7% of faculty members participate in industrial projects. It's time to bridge this gap with tools like FindExpert.ir.",
    heroCta: "View Project Reports",

    // Content Section
    analysisTitle: "Analysis of the Current Situation",
    analysisPoint1: "<strong>Limited Participation:</strong> Only about 5,843 out of 86,000 faculty members are active in industrial projects.",
    analysisPoint2: "<strong>Need for Technology:</strong> Platforms like FindExpert.ir can strengthen university-industry collaboration by reducing bureaucracy and increasing transparency.",
    analysisPoint3: "<strong>Potential Impacts:</strong> These tools can significantly help in commercializing research and growing the knowledge-based economy.",
    
    comparisonTitle: "Global Comparison",
    tableHeaderCountry: "Country/Region",
    tableHeaderParticipation: "University Participation in Industrial Projects (%)",
    tableHeaderInitiatives: "Key Initiatives",
    tableHeaderImpacts: "Observed Impacts",
    
    countryIran: "<strong>Iran</strong>",
    iranParticipation: "7% (faculty members)",
    iranInitiatives: "21-article parliamentary plan, TAP plan",
    iranImpacts: "Increase in contracts from 11,212 to 11,568 in one year",

    countryUK: "<strong>UK</strong>",
    ukParticipation: "30-40% (R&D collaboration)",
    ukInitiatives: "IN-PART",
    ukImpacts: "Up to 6.8% increase in regional innovations",

    countryUSA: "<strong>USA</strong>",
    usaParticipation: "+50% (industrial research and startups)",
    usaInitiatives: "ScienceExchange, Halo",
    usaImpacts: "Rapid technology commercialization",

    countryFinland: "<strong>Finland</strong>",
    finlandParticipation: "+60% (researchers active in industry)",
    finlandInitiatives: "Government incentives",
    finlandImpacts: "Sustainable industrial growth with 10x more researchers",

    ctaTitle: "Call to Action 🚀",
    ctaText: "The government and parliament must quickly support FindExpert.ir to act as a bridge, connecting university and industry and accelerating innovation! What do you think?",

    // Reports Section
    reportsSectionTitle: "Project Reports & Documents",
    reportCard1Title: "Game Theory Analysis",
    linkDocument: "Document",
    linkSlides: "Slides",
    reportCard2Title: "Business Plan",
    reportCard3Title: "Pitch Deck",
    reportCard4Title: "Project Proposal",

    // Tools Section
    toolsSectionTitle: "Helper Tools",
    accordion1Title: "Grant Proposal Assistant",
    tool1FormTitle: "Draft a New Grant Proposal",
    formLabelDocType: "Proposal Section to Draft",
    docTypeOption1: "Full Proposal Draft",
    docTypeOption2: "Project Summary / Abstract",
    docTypeOption3: "Statement of Need",
    docTypeOption4: "Project Goals & Objectives",
    docTypeOption5: "Methodology / Project Plan",
    docTypeOption6: "Budget Narrative",
    formLabelTopic: "Project Title",
    formLabelDescription: "Project Overview",
    formLabelDueDate: "Due Date (Optional)",
    formLabelPriority: "Priority",
    priorityOption1: "Normal",
    priorityOption2: "High",
    priorityOption3: "Urgent",
    generateButton: "Draft Section",
    clearButton: "Clear",

    accordion2Title: "Grant Finder",
    tool2FormTitle: "Find Environmental Grants",
    tool2FormSubtitle: "Describe your project to find relevant funding opportunities.",
    grantFormLabelTopic: "Project Area / Topic",
    grantFormLabelDescription: "Project Description",
    grantFormLabelFilters: "Filters (Optional)",
    grantFormLabelMinFunding: "Min. Funding",
    grantFormLabelEligibility: "Eligibility",
    grantFormLabelGeoFocus: "Geographic Focus",
    grantFormLabelCountry: "Country",
    grantFormPlaceholderCountry: "e.g., Canada, Global",
    findGrantsButton: "Find Grants",
    exportPdfButton: "Export as PDF",
    exportDocxButton: "Export as DOCX",
    exportCsvButton: "Export as CSV",
    exportJsonButton: "Export as JSON",
    
    accordion3Title: "RFP Finder",
    tool3FormTitle: "Find Calls for Proposals (RFPs)",
    tool3FormSubtitle: "Describe your expertise to find relevant collaboration opportunities.",
    rfpFormLabelTopic: "Expertise / Project Area",
    rfpFormPlaceholderTopic: "e.g., AI in Healthcare, Materials Science",
    rfpFormLabelDescription: "Project Description",
    rfpFormPlaceholderDescription: "Briefly describe your research, capabilities, or project idea.",
    rfpFormLabelOrgType: "Organization Type",
    rfpFormPlaceholderOrgType: "e.g., Government, Private Sector",
    findRfpsButton: "Find RFPs",

    accordion4Title: "Can't Find It? Ask Our AI",
    tool4FormTitle: "Custom AI Search",
    tool4FormSubtitle: "If you can't find the specific tool you need, describe your request here, and our AI assistant will search for an answer.",
    customFormLabelTopic: "Your Question / Request",
    customFormPlaceholderTopic: "e.g., Find incubators for green tech startups in Europe",
    findCustomButton: "Get Answer",

    accordion5Title: "Adopt Grant & Summarize",
    adoptToolFormTitle: "Analyze a Grant Opportunity",
    adoptToolFormSubtitle: "An AI assistant will analyze the grant's webpage and related documents to provide a detailed summary.",
    adoptFormLabelUrl: "Grant URL",
    adoptFormLabelKeywords: "Topic Keywords",
    adoptButton: "Analyze Grant",
    adoptButtonOnCard: "Adopt & Summarize",

    accordion6Title: "AI Video Generator",
    videoToolFormTitle: "Create a Video from a Scenario",
    videoToolFormSubtitle: "Describe the scenes for your video. The AI will generate a short video (approx. 1 minute) with subtitles based on your description.",
    videoFormLabelScenario: "Video Scenario",
    videoFormPlaceholderScenario: "e.g.,\nScene 1: A drone shot flying over a lush, green forest.\nScene 2: A close-up of a colorful parrot on a branch.\nScene 3: A waterfall cascading down rocks.",
    generateVideoButton: "Generate Video",
    downloadVideoButton: "Download Video",

    botsSectionTitle: "Telegram & Bale bots",
    botsSectionIntro: "Use the same FindExpert.ir tools in Telegram and Bale. Reply menus for grants, RFPs, proposals, patents, academic writing, business plans — plus automatic channel posts.",
    telegramBotTitle: "Telegram bot",
    telegramBotText: "Reply keyboard and inline buttons open the same FindExpert.ir modules.",
    telegramBotCta: "Open in Telegram",
    openSiteChat: "Chat window on this page",
    baleBotTitle: "Bale bot",
    baleBotText: "The same bot on Bale messenger (Telegram-compatible API: tapi.bale.ai).",
    baleBotCta: "Open in Bale",
    botMenuTitle: "Menu & buttons",
    botMenu1: "Grant finder",
    botMenu2: "RFP finder",
    botMenu3: "Proposal draft",
    botMenu4: "Analyze grant",
    botMenu5: "Ask AI",
    botMenu6: "Project reports",
    botMenu7: "Automatic channel posts",
    botMenu8: "Patent draft & prior art",
    botMenu9: "Academic paper / proposal",
    botMenu10: "Green business plan",
    botMenu11: "Hugging Face catalog",

    relatedSectionTitle: "Related modules",
    relatedSectionIntro: "Grant, patent, academic, and business-plan writers run on this site and the bots. Satellite wildfire spread is a research/patent topic — heavy ML models are not executed here.",
    relatedGreenTitle: "Green Hope — grants, patents, papers",
    relatedGreenText: "Patent drafting, academic hub, grant finder, and دانش‌بنیان patterns come from the Green Hope project.",
    relatedFireTitle: "SatelliteVu — wildfire spread",
    relatedFireText: "AWS disaster-response hackathon using NASA FIRMS and Sentinel-2: a topic for papers, IoT/drone patent claims, and disaster-response grants.",
    relatedToolsTitle: "New tools on FindExpert",
    relatedToolsText: "Patent draft + prior-art search, academic sections (IEEE / Nature / Springer / MDPI), green business plans — also on Telegram and Bale.",
    relatedHfTitle: "Hugging Face — module links",
    relatedHfText: "Models and Spaces are not run on this site. The catalog below is the same list as the Telegram button and the bottom chat chip.",
    hfSectionTitle: "Hugging Face modules",
    hfSectionIntro: "Four parts: RAG, writer, dataset, Space. Links are static on Cloudflare Pages — no iframes, no model weights.",

    accordionPatentTitle: "Patent draft & prior art",
    patentFormTitle: "Draft a patent from an idea",
    patentFormSubtitle: "Describe the invention. The assistant drafts filing sections and can search public prior art. Not legal advice.",
    patentFormLabelSection: "Section",
    patentOptFull: "Full draft",
    patentOptSummary: "Summary / abstract",
    patentOptProblem: "Problem",
    patentOptSolution: "Solution",
    patentOptNovelty: "Novelty",
    patentOptClaims: "Claims",
    patentFormLabelIdea: "Invention idea",
    patentFormPlaceholderIdea: "e.g. IoT + drone early-warning for Zagros wildfires using FIRMS hotspots",
    patentDraftButton: "Draft patent",
    priorArtButton: "Search prior art",
    placeholderPatent: "Patent draft and prior-art hits will appear here.",

    accordionAcademicTitle: "Academic paper & proposal",
    academicFormTitle: "Academic paper / proposal",
    academicFormSubtitle: "Write IEEE / Nature / Springer / MDPI sections. Wildfire, FIRMS, and Sentinel-2 can be used as research context.",
    academicFormLabelSection: "Section",
    academicOptProposal: "Research proposal",
    academicOptAbstract: "Abstract",
    academicOptIntro: "Introduction",
    academicOptMethod: "Methodology",
    academicOptResults: "Results",
    academicOptDiscussion: "Discussion",
    academicOptConclusion: "Conclusion",
    academicOptRefs: "References",
    academicOptFull: "Full paper sketch",
    academicFormLabelStyle: "Venue style",
    academicFormLabelTitle: "Title",
    academicFormPlaceholderTitle: "e.g. Next-day wildfire spread from Sentinel-2 and FIRMS",
    academicFormLabelOverview: "Overview / notes",
    academicFormPlaceholderOverview: "Hypothesis, data, methods, expected contribution…",
    academicFormLabelLatex: "Output LaTeX",
    academicDraftButton: "Draft section",
    placeholderAcademic: "Academic draft will appear here.",

    accordionBizTitle: "Green business plan",
    bizFormTitle: "Green / دانش‌بنیان business plan",
    bizFormSubtitle: "Investor-ready sections for environmental and university spin-outs.",
    bizFormLabelSection: "Section",
    bizOptFull: "Full plan",
    bizOptExec: "Executive summary",
    bizOptMarket: "Market analysis",
    bizOptOps: "Operations",
    bizOptFinance: "Financials",
    bizOptTeam: "Team",
    bizFormLabelTitle: "Venture title",
    bizFormPlaceholderTitle: "e.g. Community wildfire-sensor network for Iranian forests",
    bizFormLabelOverview: "Overview",
    bizFormPlaceholderOverview: "Problem, product, customers, revenue model…",
    bizDraftButton: "Draft plan",
    placeholderBiz: "Business-plan draft will appear here.",

    sourcesTitle: "Sources:",
    saveApiKey: "Save",
    apiKeyPlaceholder: "Gemini API Key",
    apiKeySaved: "API key saved",
    apiKeyMissing: "Add a Gemini API key to use the tools",
    apiKeyReady: "API key ready",

    // Footer
    footerText: "&copy; 2025 FindExpert.ir - All rights reserved.",

    // JS-generated text
    placeholderGenerator: "Your generated grant proposal section will appear here. Select a section, provide a project title, and a brief overview to get started.",
    placeholderGrant: "Your grant search results will appear here. Describe your project and add filters to find funding opportunities.",
    placeholderRfp: "Your RFP search results will appear here. Describe your expertise and add filters to find relevant calls for proposals.",
    placeholderCustom: "Your answer from our AI assistant will appear here.",
    placeholderAdopt: "Your detailed grant analysis will appear here. Adopt a grant from the 'Grant Finder' to begin.",
    placeholderVideo: "Your generated video will appear here. Write a scenario to get started.",
    copyButton: "Copy",
    copiedButton: "Copied!",
    errorTopicDesc: "Please provide both a project title and an overview.",
    errorServiceUnavailable: "AI service is not available. Cannot generate document.",
    errorGrantServiceUnavailable: "AI service is not available. Cannot find grants.",
    errorRfpServiceUnavailable: "AI service is not available. Cannot find RFPs.",
    errorCustomServiceUnavailable: "AI service is not available. Cannot perform search.",
    errorAdoptServiceUnavailable: "AI service is not available. Cannot analyze grant.",
    errorVideoServiceUnavailable: "AI service is not available. Cannot generate video.",
    errorGrantTopicDesc: "Please provide a project topic or description to search for grants.",
    errorRfpTopicDesc: "Please provide an expertise area or description to search for RFPs.",
    errorCustomTopicDesc: "Please enter a question or topic to search for.",
    errorAdoptUrl: "Please provide a grant URL to analyze.",
    errorVideoScenario: "Please provide a scenario for the video.",
    errorSafety: "Content Safety Error: Your request was blocked because the prompt or response was deemed unsafe. Please modify your prompt to be more respectful and avoid potentially sensitive topics.",
    errorRecitation: "Recitation Error: The response was blocked to prevent the recitation of copyrighted material. Please try a different prompt.",
    errorStopped: (reason) => `Failed to generate document. The process was stopped for ${reason}. Please try modifying your prompt.`,
    errorUnexpected: "An unexpected error occurred. Please try again later.",
    errorParse: "Failed to parse the AI's response. The data format was unexpected.",
    errorApiKey: "API Key Error: The provided API key is not valid. Please check your configuration.",
    errorQuota: "Quota Exceeded: You have exceeded your API quota. Please check your usage and billing details, or wait for your quota to reset.",
    errorNetwork: "Network Error: Could not connect to the AI service. Please check your internet connection and firewall settings, then try again.",
    errorApi: (message) => `API Error: ${message}`,
    videoLoading1: "Initializing video generation...",
    videoLoading2: "AI is composing the scenes... This may take a few minutes.",
    videoLoading3: "Rendering video frames, please wait.",
    videoLoading4: "Finalizing the video, almost there!",
  },
  fa: {
    // Meta
    pageTitle: "FindExpert.ir | پل ارتباطی دانشگاه و صنعت",

    // Header
    brandName: "FindExpert.ir",

    // Hero
    heroTitle: "تقویت ارتباط دانشگاه و صنعت",
    heroSubtitle: "ارتباط ضعیف دانشگاه و صنعت در ایران یک چالش بزرگ است. تحقیقات نشان می‌دهد فقط ۷٪ از اعضای هیئت علمی در پروژه‌های صنعتی مشارکت دارند. وقت آن است که با ابزارهایی مثل FindExpert.ir این شکاف را پر کنیم.",
    heroCta: "مشاهده گزارشات پروژه",

    // Content Section
    analysisTitle: "تحلیل وضعیت کنونی",
    analysisPoint1: "<strong>مشارکت محدود:</strong> تنها حدود ۵,۸۴۳ نفر از ۸۶,۰۰۰ عضو هیئت علمی در پروژه‌های صنعتی فعال هستند.",
    analysisPoint2: "<strong>نیاز به فناوری:</strong> پلتفرم‌هایی مثل FindExpert.ir می‌توانند با کاهش بروکراسی و افزایش شفافیت، همکاری بین دانشگاه و صنعت را تقویت کنند.",
    analysisPoint3: "<strong>تأثیرات بالقوه:</strong> این ابزارها می‌توانند به تجاری‌سازی پژوهش و رشد اقتصاد دانش‌بنیان کمک شایانی کنند.",
    
    comparisonTitle: "مقایسه جهانی",
    tableHeaderCountry: "کشور/منطقة",
    tableHeaderParticipation: "درصد مشارکت دانشگاه در پروژه‌های صنعتی",
    tableHeaderInitiatives: "طرح‌های کلیدی",
    tableHeaderImpacts: "تأثیرات مشاهده‌شده",

    countryIran: "<strong>ایران</strong>",
    iranParticipation: "۷٪ (اعضای هیئت علمی)",
    iranInitiatives: "طرح ۲۱ ماده‌ای مجلس، طرح تاپ",
    iranImpacts: "افزایش قراردادها از ۱۱,۲۱۲ به ۱۱,۵۶۸ در یک سال",

    countryUK: "<strong>انگلستان</strong>",
    ukParticipation: "۳۰-۴۰٪ (همکاری در R&D)",
    ukInitiatives: "IN-PART",
    ukImpacts: "افزایش نوآوری‌های منطقه‌ای تا ۶.۸٪",

    countryUSA: "<strong>آمریکا</strong>",
    usaParticipation: "+۵۰٪ (پژوهش‌های صنعتی و استارتاپ‌ها)",
    usaInitiatives: "ScienceExchange، Halo",
    usaImpacts: "تجاری‌سازی سریع فناوری",

    countryFinland: "<strong>فنلاند</strong>",
    finlandParticipation: "+۶۰٪ (پژوهشگران فعال در صنعت)",
    finlandInitiatives: "مشوق‌های دولتی",
    finlandImpacts: "رشد پایدار صنعتی با ۱۰ برابر پژوهشگر",

    ctaTitle: "فراخوان به اقدام 🚀",
    ctaText: "دولت و مجلس باید سریع‌تر از FindExpert.ir حمایت کنند تا مثل یک پل، دانشگاه و صنعت را به هم متصل کرده و نوآوری را شتاب بخشد! نظر شما چیست؟",

    // Reports Section
    reportsSectionTitle: "گزارشات و اسناد پروژه",
    reportCard1Title: "تحلیل نظریه بازی‌ها",
    linkDocument: "سند",
    linkSlides: "اسلاید",
    reportCard2Title: "طرح کسب و کار (Business Plan)",
    reportCard3Title: "ارائه سرمایه‌گذار (Pitch Deck)",
    reportCard4Title: "پروپوزال پروژه",

    botsSectionTitle: "ربات تلگرام و بله",
    botsSectionIntro: "همان ابزارهای FindExpert.ir را در تلگرام و بله استفاده کنید. منوی دکمه‌ای برای گرنت، فراخوان، پروپوزال و پرسش از هوش مصنوعی — به‌علاوه ارسال خودکار فرصت‌ها به کانال.",
    telegramBotTitle: "ربات تلگرام",
    telegramBotText: "منوی پایین صفحه و دکمه‌های شیشه‌ای همان ماژول‌های سایت را باز می‌کنند.",
    telegramBotCta: "باز کردن در تلگرام",
    openSiteChat: "پنجره چت در همین صفحه",
    baleBotTitle: "ربات بله",
    baleBotText: "همان ربات روی پیام‌رسان بله (API سازگار با تلگرام: tapi.bale.ai).",
    baleBotCta: "باز کردن در بله",
    botMenuTitle: "منو و دکمه‌ها",
    botMenu1: "یابنده گرنت",
    botMenu2: "فراخوان‌یاب (RFP)",
    botMenu3: "پیش‌نویس پروپوزال",
    botMenu4: "تحلیل گرنت",
    botMenu5: "پرسش از هوش مصنوعی",
    botMenu6: "گزارش‌های پروژه",
    botMenu7: "ارسال خودکار به کانال",
    botMenu8: "پیش‌نویس پتنت و prior art",
    botMenu9: "مقاله / پروپوزال علمی",
    botMenu10: "طرح کسب‌وکار سبز",
    botMenu11: "کاتالوگ Hugging Face",

    relatedSectionTitle: "ماژول‌های مرتبط",
    relatedSectionIntro: "گرنت، پتنت، مقاله علمی و طرح کسب‌وکار روی همین سایت و ربات‌ها در دسترس است. پیش‌بینی گسترش آتش از تصاویر ماهواره‌ای به‌عنوان موضوع پژوهش و ادعاهای اختراع استفاده می‌شود — مدل‌های سنگین ML در این اپ اجرا نمی‌شوند.",
    relatedGreenTitle: "Green Hope — گرنت، پتنت، مقاله",
    relatedGreenText: "الگوی نگارش پتنت، هاب مقالات دانشگاهی، یابنده گرنت و طرح دانش‌بنیان از پروژه Green Hope استخراج شده است.",
    relatedFireTitle: "SatelliteVu — گسترش آتش‌سوزی",
    relatedFireText: "Hackathon پاسخ به بلایا با NASA FIRMS و Sentinel-2: موضوع مناسب برای پروپوزال علمی، ادعاهای پتنت IoT/پهپاد، و گرنت‌های disaster-response.",
    relatedToolsTitle: "ابزارهای جدید در FindExpert",
    relatedToolsText: "پیش‌نویس پتنت + جستجوی prior art، نگارش بخش‌های مقاله (IEEE / Nature / Springer / MDPI)، طرح کسب‌وکار سبز، و همان‌ها در منوی تلگرام و بله.",
    relatedHfTitle: "Hugging Face — لینک ماژول‌ها",
    relatedHfText: "مدل‌ها و اسپیس‌ها در این سایت اجرا نمی‌شوند. کاتالوگ همان دکمهٔ تلگرام و چیپ پنجره چت پایین صفحه است.",
    hfSectionTitle: "ماژول‌های Hugging Face",
    hfSectionIntro: "چهار بخش: RAG، نگارش، داده، اسپیس. لینک‌ها روی Cloudflare Pages ایستا هستند — بدون iframe و بدون وزن مدل.",

    accordionPatentTitle: "پیش‌نویس پتنت و prior art",
    patentFormTitle: "پیش‌نویس پتنت از روی ایده",
    patentFormSubtitle: "اختراع را توصیف کنید. دستیار بخش‌های پرونده را می‌نویسد و می‌تواند prior art عمومی را جستجو کند. مشاوره حقوقی نیست.",
    patentFormLabelSection: "بخش",
    patentOptFull: "پیش‌نویس کامل",
    patentOptSummary: "خلاصه / چکیده",
    patentOptProblem: "مسئله",
    patentOptSolution: "راه‌حل",
    patentOptNovelty: "نوآوری",
    patentOptClaims: "ادعاها",
    patentFormLabelIdea: "ایده اختراع",
    patentFormPlaceholderIdea: "مثال: هشدار زودهنگام حریق زاگرس با IoT، پهپاد و نقاط داغ FIRMS",
    patentDraftButton: "پیش‌نویس پتنت",
    priorArtButton: "جستجوی prior art",
    placeholderPatent: "پیش‌نویس پتنت و نتایج prior art اینجا نمایش داده می‌شود.",

    accordionAcademicTitle: "نگارش مقاله و پروپوزال علمی",
    academicFormTitle: "مقاله / پروپوزال علمی",
    academicFormSubtitle: "بخش‌های IEEE / Nature / Springer / MDPI. حریق، FIRMS و Sentinel-2 می‌توانند زمینه پژوهش باشند.",
    academicFormLabelSection: "بخش",
    academicOptProposal: "پروپوزال پژوهشی",
    academicOptAbstract: "چکیده",
    academicOptIntro: "مقدمه",
    academicOptMethod: "روش‌شناسی",
    academicOptResults: "نتایج",
    academicOptDiscussion: "بحث",
    academicOptConclusion: "نتیجه‌گیری",
    academicOptRefs: "منابع",
    academicOptFull: "طرح کلی مقاله کامل",
    academicFormLabelStyle: "سبک نشریه",
    academicFormLabelTitle: "عنوان",
    academicFormPlaceholderTitle: "مثال: پیش‌بینی گسترش آتش روز بعد با Sentinel-2 و FIRMS",
    academicFormLabelOverview: "شرح / یادداشت",
    academicFormPlaceholderOverview: "فرضیه، داده، روش، سهم علمی مورد انتظار…",
    academicFormLabelLatex: "خروجی LaTeX",
    academicDraftButton: "پیش‌نویس بخش",
    placeholderAcademic: "پیش‌نویس علمی اینجا نمایش داده می‌شود.",

    accordionBizTitle: "طرح کسب‌وکار سبز",
    bizFormTitle: "طرح کسب‌وکار سبز / دانش‌بنیان",
    bizFormSubtitle: "بخش‌های آماده سرمایه‌گذار برای اسپین‌اوت دانشگاهی و پروژه‌های محیط‌زیستی.",
    bizFormLabelSection: "بخش",
    bizOptFull: "طرح کامل",
    bizOptExec: "خلاصه اجرایی",
    bizOptMarket: "تحلیل بازار",
    bizOptOps: "عملیات",
    bizOptFinance: "مالی",
    bizOptTeam: "تیم",
    bizFormLabelTitle: "عنوان کسب‌وکار",
    bizFormPlaceholderTitle: "مثال: شبکه حسگر حریق جنگل‌های ایران",
    bizFormLabelOverview: "شرح کلی",
    bizFormPlaceholderOverview: "مسئله، محصول، مشتری، مدل درآمد…",
    bizDraftButton: "پیش‌نویس طرح",
    placeholderBiz: "پیش‌نویس طرح کسب‌وکار اینجا نمایش داده می‌شود.",
    
    // Tools Section
    toolsSectionTitle: "ابزارهای کمکی",
    accordion1Title: "دستیار پروپوزال کمک هزینه",
    tool1FormTitle: "پیش‌نویس پروپوزال جدید",
    formLabelDocType: "بخش پروپوزال برای پیش‌نویس",
    docTypeOption1: "پیش‌نویس کامل پروپوزال",
    docTypeOption2: "خلاصه پروژه / چکیده",
    docTypeOption3: "بیان نیاز",
    docTypeOption4: "اهداف و مقاصد پروژه",
    docTypeOption5: "متدولوژی / طرح پروژه",
    docTypeOption6: "روایت بودجه",
    formLabelTopic: "عنوان پروژه",
    formLabelDescription: "شرح کلی پروژه",
    formLabelDueDate: "تاریخ تحویل (اختیاری)",
    formLabelPriority: "اولویت",
    priorityOption1: "عادی",
    priorityOption2: "بالا",
    priorityOption3: "فوری",
    generateButton: "ایجاد پیش‌نویس",
    clearButton: "پاک کردن",

    accordion2Title: "یابنده کمک هزینه",
    tool2FormTitle: "یافتن کمک‌هزینه‌های زیست‌محیطی",
    tool2FormSubtitle: "پروژه خود را برای یافتن فرصت‌های مالی مرتبط توصیف کنید.",
    grantFormLabelTopic: "حوزه / موضوع پروژه",
    grantFormLabelDescription: "توضیحات پروژه",
    grantFormLabelFilters: "فیلترها (اختیاری)",
    grantFormLabelMinFunding: "حداقل بودجه",
    grantFormLabelEligibility: "شرایط واجد شرایط بودن",
    grantFormLabelGeoFocus: "تمرکز جغرافیایی",
    grantFormLabelCountry: "کشور",
    grantFormPlaceholderCountry: "مثال: کانادا، جهانی",
    findGrantsButton: "یافتن کمک هزینه",
    exportPdfButton: "خروجی PDF",
    exportDocxButton: "خروجی DOCX",
    exportCsvButton: "خروجی CSV",
    exportJsonButton: "خروجی JSON",

    accordion3Title: "فراخوان یاب",
    tool3FormTitle: "یافتن فراخوان‌های همکاری (RFP)",
    tool3FormSubtitle: "تخصص یا ایده پروژه خود را برای یافتن فرصت‌های همکاری مرتبط توصیف کنید.",
    rfpFormLabelTopic: "حوزه تخصص / موضوع پروژه",
    rfpFormPlaceholderTopic: "مثال: هوش مصنوعی در سلامت، علم مواد",
    rfpFormLabelDescription: "توضیحات پروژه",
    rfpFormPlaceholderDescription: "تحقیق، توانمندی‌ها یا ایده پروژه خود را به طور خلاصه شرح دهید.",
    rfpFormLabelOrgType: "نوع سازمان",
    rfpFormPlaceholderOrgType: "مثال: دولتی، بخش خصوصی",
    findRfpsButton: "یافتن فراخوان‌ها",

    accordion4Title: "پیدا نکردید؟ از هوش مصنوعی بپرسید",
    tool4FormTitle: "جستجوی سفارشی با هوش مصنوعی",
    tool4FormSubtitle: "اگر ابزار مورد نظر خود را پیدا نکردید، درخواست خود را اینجا شرح دهید تا دستیار هوش مصنوعی ما پاسخی برای آن بیابد.",
    customFormLabelTopic: "سوال / درخواست شما",
    customFormPlaceholderTopic: "مثال: انکوباتورهای استارتاپ‌های فناوری سبز در اروپا را پیدا کن",
    findCustomButton: "دریافت پاسخ",

    accordion5Title: "پذیرش گرنت و خلاصه‌سازی",
    adoptToolFormTitle: "تحلیل یک فرصت گرنت",
    adoptToolFormSubtitle: "دستیار هوش مصنوعی صفحه وب گرنت و اسناد مرتبط را برای ارائه خلاصه‌ای دقیق تحلیل می‌کند.",
    adoptFormLabelUrl: "آدرس URL گرنت",
    adoptFormLabelKeywords: "کلمات کلیدی موضوع",
    adoptButton: "تحلیل گرنت",
    adoptButtonOnCard: "پذیرش و خلاصه‌سازی",

    accordion6Title: "تولید کننده ویدیو با هوش مصنوعی",
    videoToolFormTitle: "ساخت ویدیو از روی سناریو",
    videoToolFormSubtitle: "صحنه‌های ویدیوی خود را توصیف کنید. هوش مصنوعی یک ویدیوی کوتاه (حدود ۱ دقیقه) با زیرنویس بر اساس توضیحات شما ایجاد می‌کند.",
    videoFormLabelScenario: "سناریوی ویدیو",
    videoFormPlaceholderScenario: "مثال:\nصحنه ۱: نمای هوایی از یک جنگل سرسبز و انبوه.\nصحنه ۲: نمای نزدیک از یک طوطی رنگارنگ روی شاخه.\nصحنه ۳: یک آبشار که از روی صخره‌ها به پایین می‌ریزد.",
    generateVideoButton: "تولید ویدیو",
    downloadVideoButton: "دانلود ویدیو",

    sourcesTitle: "منابع:",
    saveApiKey: "ذخیره",
    apiKeyPlaceholder: "کلید Gemini API",
    apiKeySaved: "کلید API ذخیره شد",
    apiKeyMissing: "برای استفاده از ابزارها کلید Gemini را وارد کنید",
    apiKeyReady: "کلید API آماده است",

    // Footer
    footerText: "&copy; ۲۰۲۵ FindExpert.ir - کلیه حقوق محفوظ است.",

    // JS-generated text
    placeholderGenerator: "بخش پیش‌نویس پروپوزال شما در اینجا ظاهر می‌شود. برای شروع، یک بخش را انتخاب کنید، عنوان پروژه و شرح کلی آن را ارائه دهید.",
    placeholderGrant: "نتایج جستجوی کمک هزینه شما در اینجا ظاهر می‌شود. پروژه خود را توصیف کنید و فیلترها را برای یافتن فرصت‌های مالی اضافه کنید.",
    placeholderRfp: "نتایج جستجوی فراخوان شما در اینجا ظاهر می‌شود. تخصص خود را توصیف کرده و برای یافتن فراخوان‌های مرتبط، فیلترها را اضافه کنید.",
    placeholderCustom: "پاسخ دستیار هوش مصنوعی ما در اینجا نمایش داده خواهد شد.",
    placeholderAdopt: "تحلیل دقیق گرنت شما در اینجا ظاهر می‌شود. برای شروع، یک گرنت را از «یابنده کمک هزینه» انتخاب کنید.",
    placeholderVideo: "ویدیوی تولید شده شما در اینجا نمایش داده خواهد شد. برای شروع یک سناریو بنویسید.",
    copyButton: "کپی",
    copiedButton: "کپی شد!",
    errorTopicDesc: "لطفاً هم عنوان پروژه و هم شرح کلی آن را ارائه دهید.",
    errorServiceUnavailable: "سرویس هوش مصنوعی در دسترس نیست. امکان تولید سند وجود ندارد.",
    errorGrantServiceUnavailable: "سرویس هوش مصنوعی در دسترس نیست. امکان یافتن کمک هزینه وجود ندارد.",
    errorRfpServiceUnavailable: "سرویس هوش مصنوعی در دسترس نیست. امکان یافتن فراخوان وجود ندارد.",
    errorCustomServiceUnavailable: "سرویس هوش مصنوعی در دسترس نیست. امکان جستجو وجود ندارد.",
    errorAdoptServiceUnavailable: "سرویس هوش مصنوعی در دسترس نیست. امکان تحلیل گرنت وجود ندارد.",
    errorVideoServiceUnavailable: "سرویس هوش مصنوعی در دسترس نیست. امکان تولید ویدیو وجود ندارد.",
    errorGrantTopicDesc: "لطفاً برای جستجوی کمک هزینه، موضوع یا توضیحات پروژه را ارائه دهید.",
    errorRfpTopicDesc: "لطفاً برای جستجوی فراخوان، حوزه تخصص یا توضیحات را ارائه دهید.",
    errorCustomTopicDesc: "لطفاً برای جستجو، یک سوال یا موضوع وارد کنید.",
    errorAdoptUrl: "لطفاً برای تحلیل، آدرس URL گرنت را وا؆ت را وارد کنید.",
    errorVideoScenario: "لطفاً یک سناریو برای ویدیو ارائه دهید.",
    errorSafety: "خطای ایمنی محتوا: درخواست شما مسدود شد زیرا پیام یا پاسخ، ناامن تشخیص داده شد. لطفاً پیام خود را اصلاح کنید تا محترمانه‌تر باشد و از موضوعات حساس خودداری کنید.",
    errorRecitation: "خطای تکرار: پاسخ برای جلوگیری از تکرار مطالب دارای حق چاپ مسدود شد. لطفاً درخواست دیگری را امتحان کنید.",
    errorStopped: (reason) => `تولید سند ناموفق بود. فرآیند به دلیل ${reason} متوقف شد. لطفاً درخواست خود را اصلاح کنید.`,
    errorUnexpected: "یک خطای غیرمنتظره رخ داد. لطفاً بعداً دوباره امتحان کنید.",
    errorParse: "تجزیه پاسخ هوش مصنوعی ناموفق بود. فرمت داده غیرمنتظره بود.",
    errorApiKey: "خطای کلید API: کلید API ارائه شده معتبر نیست. لطفاً پیکربندی خود را بررسی کنید.",
    errorQuota: "سهمیه تمام شد: شما از سهمیه API خود فراتر رفته‌اید. لطفاً مصرف و جزئیات صورتحساب خود را بررسی کنید یا منتظر بمانید تا سهمیه شما بازنشانی شود.",
    errorNetwork: "خطای شبکه: امکان اتصال به سرویس هوش مصنوعی وجود ندارد. لطفاً اتصال اینترنت و تنظیمات فایروال خود را بررسی کرده و دوباره تلاش کنید.",
    errorApi: (message) => `خطای API: ${message}`,
    videoLoading1: "در حال آماده‌سازی برای تولید ویدیو...",
    videoLoading2: "هوش مصنوعی در حال ترکیب صحنه‌ها است... این فرآیند ممکن است چند دقیقه طول بکشد.",
    videoLoading3: "در حال رندر فریم‌های ویدیو، لطفاً منتظر بمانید.",
    videoLoading4: "در حال نهایی‌سازی ویدیو، تقریباً تمام شد!",
  }
};
let currentLang: 'en' | 'fa' = 'fa';

// --- DOM Element Selectors ---

// Generator Elements
const form = document.getElementById('doc-form') as HTMLFormElement;
const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
const reportContainer = document.getElementById('generated-report') as HTMLDivElement;
const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement;
const errorDisplay = document.getElementById('errorDisplay') as HTMLDivElement;
const documentTypeInput = document.getElementById('documentType') as HTMLSelectElement;
const topicInput = document.getElementById('topic') as HTMLInputElement;
const customInstructionsInput = document.getElementById('customInstructions') as HTMLTextAreaElement;
const dueDateInput = document.getElementById('dueDate') as HTMLInputElement;
const priorityLevelInput = document.getElementById('priorityLevel') as HTMLSelectElement;

// Grant Finder Elements
const grantForm = document.getElementById('grant-form') as HTMLFormElement;
const findGrantsSubmitBtn = document.getElementById('findGrantsSubmitBtn') as HTMLButtonElement;
const clearGrantsBtn = document.getElementById('clearGrantsBtn') as HTMLButtonElement;
const grantTopicInput = document.getElementById('grantTopic') as HTMLInputElement;
const grantDescriptionInput = document.getElementById('grantDescription') as HTMLTextAreaElement;
const grantFundingAmountInput = document.getElementById('grantFundingAmount') as HTMLInputElement;
const grantEligibilityInput = document.getElementById('grantEligibility') as HTMLInputElement;
const grantGeographicFocusInput = document.getElementById('grantGeographicFocus') as HTMLInputElement;
const grantCountryInput = document.getElementById('grantCountry') as HTMLInputElement;
const grantFinderErrorDisplay = document.getElementById('grantFinderErrorDisplay') as HTMLDivElement;
const grantReportContainer = document.getElementById('grant-report-container') as HTMLDivElement;
const grantFinderSourcesWrapper = document.getElementById('grantFinderSourcesWrapper') as HTMLDivElement;
const grantFinderSources = document.getElementById('grantFinderSources') as HTMLUListElement;
const grantExportButtons = document.getElementById('grantExportButtons') as HTMLDivElement;
const exportPdfBtn = document.getElementById('exportPdfBtn') as HTMLButtonElement;
const exportDocxBtn = document.getElementById('exportDocxBtn') as HTMLButtonElement;
const exportCsvBtn = document.getElementById('exportCsvBtn') as HTMLButtonElement;
const exportJsonBtn = document.getElementById('exportJsonBtn') as HTMLButtonElement;

// Adopt Grant Elements
const adoptForm = document.getElementById('adopt-form') as HTMLFormElement;
const analyzeGrantBtn = document.getElementById('analyzeGrantBtn') as HTMLButtonElement;
const clearAdoptBtn = document.getElementById('clearAdoptBtn') as HTMLButtonElement;
const adoptUrlInput = document.getElementById('adoptUrl') as HTMLInputElement;
const adoptKeywordsInput = document.getElementById('adoptKeywords') as HTMLInputElement;
const adoptFinderErrorDisplay = document.getElementById('adoptFinderErrorDisplay') as HTMLDivElement;
const adoptReportContainer = document.getElementById('adopt-report-container') as HTMLDivElement;
const adoptFinderSourcesWrapper = document.getElementById('adoptFinderSourcesWrapper') as HTMLDivElement;
const adoptFinderSources = document.getElementById('adoptFinderSources') as HTMLUListElement;
const adoptExportButtons = document.getElementById('adoptExportButtons') as HTMLDivElement;
const exportAdoptPdfBtn = document.getElementById('exportAdoptPdfBtn') as HTMLButtonElement;
const exportAdoptDocxBtn = document.getElementById('exportAdoptDocxBtn') as HTMLButtonElement;

// RFP Finder Elements
const rfpForm = document.getElementById('rfp-form') as HTMLFormElement;
const findRfpsSubmitBtn = document.getElementById('findRfpsSubmitBtn') as HTMLButtonElement;
const clearRfpsBtn = document.getElementById('clearRfpsBtn') as HTMLButtonElement;
const rfpTopicInput = document.getElementById('rfpTopic') as HTMLInputElement;
const rfpDescriptionInput = document.getElementById('rfpDescription') as HTMLTextAreaElement;
const rfpOrgTypeInput = document.getElementById('rfpOrgType') as HTMLInputElement;
const rfpEligibilityInput = document.getElementById('rfpEligibility') as HTMLInputElement;
const rfpGeographicFocusInput = document.getElementById('rfpGeographicFocus') as HTMLInputElement;
const rfpCountryInput = document.getElementById('rfpCountry') as HTMLInputElement;
const rfpFinderErrorDisplay = document.getElementById('rfpFinderErrorDisplay') as HTMLDivElement;
const rfpReportContainer = document.getElementById('rfp-report-container') as HTMLDivElement;
const rfpFinderSourcesWrapper = document.getElementById('rfpFinderSourcesWrapper') as HTMLDivElement;
const rfpFinderSources = document.getElementById('rfpFinderSources') as HTMLUListElement;
const rfpExportButtons = document.getElementById('rfpExportButtons') as HTMLDivElement;
const exportRfpPdfBtn = document.getElementById('exportRfpPdfBtn') as HTMLButtonElement;
const exportRfpDocxBtn = document.getElementById('exportRfpDocxBtn') as HTMLButtonElement;
const exportRfpCsvBtn = document.getElementById('exportRfpCsvBtn') as HTMLButtonElement;
const exportRfpJsonBtn = document.getElementById('exportRfpJsonBtn') as HTMLButtonElement;

// Custom Finder Elements
const customForm = document.getElementById('custom-form') as HTMLFormElement;
const findCustomSubmitBtn = document.getElementById('findCustomSubmitBtn') as HTMLButtonElement;
const clearCustomBtn = document.getElementById('clearCustomBtn') as HTMLButtonElement;
const customTopicInput = document.getElementById('customTopic') as HTMLTextAreaElement;
const customFinderErrorDisplay = document.getElementById('customFinderErrorDisplay') as HTMLDivElement;
const customReportContainer = document.getElementById('custom-report-container') as HTMLDivElement;
const customFinderSourcesWrapper = document.getElementById('customFinderSourcesWrapper') as HTMLDivElement;
const customFinderSources = document.getElementById('customFinderSources') as HTMLUListElement;

// Video Generator Elements
const videoForm = document.getElementById('video-form') as HTMLFormElement;
const generateVideoBtn = document.getElementById('generateVideoBtn') as HTMLButtonElement;
const clearVideoBtn = document.getElementById('clearVideoBtn') as HTMLButtonElement;
const videoScenarioInput = document.getElementById('videoScenario') as HTMLTextAreaElement;
const videoReportContainer = document.getElementById('video-report-container') as HTMLDivElement;
const videoFinderErrorDisplay = document.getElementById('videoFinderErrorDisplay') as HTMLDivElement;
const videoLoadingStatus = document.getElementById('video-loading-status') as HTMLDivElement;
const videoLoadingMessage = document.getElementById('video-loading-message') as HTMLParagraphElement;
const downloadVideoBtn = document.getElementById('downloadVideoBtn') as HTMLAnchorElement;


const LOCAL_STORAGE_KEY = 'ecoAiTaskDetails';
const API_KEY_STORAGE = 'GEMINI_API_KEY';
let currentGrantText = '';
let currentRfpText = '';
let currentAdoptedGrantText = '';
let currentGrantData: any[] = [];
let currentRfpData: any[] = [];
let currentCustomText = '';
let currentVideoUrl: string | null = null;

function t(key: string, ...args: any[]): string {
    const value = (translations[currentLang] as any)[key];
    if (typeof value === 'function') return value(...args);
    return value ?? key;
}

function getApiKey(): string {
    const fromEnv = String(process.env.API_KEY || process.env.GEMINI_API_KEY || '').trim();
    if (fromEnv) return fromEnv;
    try {
        return (localStorage.getItem(API_KEY_STORAGE) || '').trim();
    } catch {
        return '';
    }
}

function requireApiKey(): string {
    const key = getApiKey();
    if (!key) throw new Error('API key not valid.');
    return key;
}

function createAiClient() {
    return new GoogleGenAI({ apiKey: requireApiKey() });
}

function escapeHtml(value: unknown): string {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function parseJsonPayload(text: string | undefined): any {
    if (!text) throw new Error('Empty AI response');
    const cleaned = text.replace(/```(?:json)?/gi, '```').trim();
    const fenced = cleaned.match(/```([\s\S]*?)```/);
    const raw = (fenced ? fenced[1] : cleaned).trim();
    const start = raw.search(/[\[{]/);
    const jsonText = start >= 0 ? raw.slice(start) : raw;
    return JSON.parse(jsonText);
}

function updateApiKeyStatus() {
    const status = document.getElementById('apiKeyStatus');
    const input = document.getElementById('apiKeyInput') as HTMLInputElement | null;
    if (!status) return;
    if (getApiKey()) {
        status.textContent = t('apiKeyReady');
        status.className = 'api-key-status ok';
        if (input && !input.value) input.placeholder = '••••••••';
    } else {
        status.textContent = t('apiKeyMissing');
        status.className = 'api-key-status missing';
    }
}

function exportTextPdf(title: string, body: string, fileName: string) {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(title, 10, 12);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(body || '', 180);
    let y = 22;
    for (const line of lines) {
        if (y > 280) {
            doc.addPage();
            y = 15;
        }
        doc.text(line, 10, y);
        y += 6;
    }
    doc.save(fileName);
}

const getPlaceholderHTML = (key: string) => `<div class="placeholder-text">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
    <span>${escapeHtml(t(key))}</span>
</div>`;

// --- UI & Utility Functions ---

function setLoading(button: HTMLButtonElement, isLoading: boolean, key: string) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `<div class="spinner"></div>`;
    } else {
        button.disabled = false;
        button.innerHTML = `<span data-key="${key}">${escapeHtml(t(key))}</span>`;
    }
}

function showError(displayElement: HTMLElement, errorKey: string, ...args: any[]) {
    displayElement.textContent = t(errorKey, ...args);
    displayElement.style.display = 'block';
}

function hideError(displayElement: HTMLElement) {
    displayElement.textContent = '';
    displayElement.style.display = 'none';
}

function updateUIForLanguage() {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'fa' ? 'rtl' : 'ltr';
    document.body.className = `lang-${currentLang}`;

    document.querySelectorAll('[data-key]').forEach(element => {
        const key = element.getAttribute('data-key');
        if (key && (translations[currentLang] as any)[key]) {
            element.innerHTML = t(key);
        }
    });

    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-key-placeholder]').forEach(element => {
        const key = element.getAttribute('data-key-placeholder');
        if (key && (translations[currentLang] as any)[key]) {
            element.placeholder = t(key);
        }
    });
    
    // Reset placeholders for output containers if they are empty
    if (reportContainer.querySelector('.placeholder-text') || reportContainer.textContent === '') {
        reportContainer.innerHTML = getPlaceholderHTML('placeholderGenerator');
    }
    if (grantReportContainer.querySelector('.placeholder-text') || grantReportContainer.textContent === '') {
        grantReportContainer.innerHTML = getPlaceholderHTML('placeholderGrant');
    }
    if (rfpReportContainer.querySelector('.placeholder-text') || rfpReportContainer.textContent === '') {
        rfpReportContainer.innerHTML = getPlaceholderHTML('placeholderRfp');
    }
    if (customReportContainer.querySelector('.placeholder-text') || customReportContainer.textContent === '') {
        customReportContainer.innerHTML = getPlaceholderHTML('placeholderCustom');
    }
    if (adoptReportContainer.querySelector('.placeholder-text') || adoptReportContainer.textContent === '') {
        adoptReportContainer.innerHTML = getPlaceholderHTML('placeholderAdopt');
    }
    if (videoReportContainer.querySelector('.placeholder-text') || videoReportContainer.innerHTML === '') {
        videoReportContainer.innerHTML = getPlaceholderHTML('placeholderVideo');
    }

    document.querySelectorAll('.lang-switcher button[data-lang]').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
    });
    updateApiKeyStatus();
}

function handleApiError(e: any, errorDisplayElement: HTMLElement, serviceErrorKey: string) {
    console.error(e);
    const message = (e instanceof Error ? e.message : String(e || ''));
    if (message.includes('API key not valid') || message.includes('API_KEY_INVALID') || message.includes('API key')) {
        showError(errorDisplayElement, 'errorApiKey');
    } else if (message.includes('429') || message.toLowerCase().includes('quota') || message.includes('RESOURCE_EXHAUSTED')) {
        showError(errorDisplayElement, 'errorQuota');
    } else if (message.includes('[VertexAI.FinishReason] RECITATION') || message.includes('RECITATION')) {
        showError(errorDisplayElement, 'errorRecitation');
    } else if (message.includes('[VertexAI.FinishReason] SAFETY') || message.includes('SAFETY')) {
        showError(errorDisplayElement, 'errorSafety');
    } else if (message.includes('[VertexAI.FinishReason]')) {
        const reason = message.split(']')[1]?.trim() || 'unknown';
        showError(errorDisplayElement, 'errorStopped', reason);
    } else if (message.toLowerCase().includes('network') || message.includes('Failed to fetch')) {
        showError(errorDisplayElement, 'errorNetwork');
    } else if (message.includes('JSON') || message.includes('parse') || message.includes('Empty AI')) {
        showError(errorDisplayElement, 'errorParse');
    } else {
        showError(errorDisplayElement, serviceErrorKey);
    }
}

function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function arrayToCsv(data: any[]): string {
    if (data.length === 0) return "";
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
        const values = headers.map(header => {
            const val = row[header] === null || row[header] === undefined ? '' : row[header];
            const escaped = ('' + val).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
}


// --- Tool Handlers ---

// Grant Proposal Assistant
async function handleGenerate(e: Event) {
    e.preventDefault();
    hideError(errorDisplay);
    if (!topicInput.value || !customInstructionsInput.value) {
        showError(errorDisplay, 'errorTopicDesc');
        return;
    }
    
    setLoading(generateBtn, true, 'generateButton');
    reportContainer.innerHTML = `<div class="spinner-large"></div>`;
    copyBtn.style.display = 'none';

    const documentType = documentTypeInput.options[documentTypeInput.selectedIndex].text;
    const prompt = `Draft a "${documentType}" for a grant proposal.
        Project Title: ${topicInput.value}
        Overview: ${customInstructionsInput.value}
        ${dueDateInput.value ? `Due Date: ${dueDateInput.value}` : ''}
        ${priorityLevelInput.value ? `Priority: ${priorityLevelInput.value}` : ''}
        The response should be well-structured, professional, and ready to be used in a formal document. Use markdown for formatting.`;

    try {
        const ai = createAiClient();
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        reportContainer.textContent = response.text || '';
        copyBtn.style.display = 'block';
        copyBtn.textContent = t('copyButton');
    } catch (e) {
        handleApiError(e, errorDisplay, 'errorServiceUnavailable');
        reportContainer.innerHTML = getPlaceholderHTML('placeholderGenerator');
    } finally {
        setLoading(generateBtn, false, 'generateButton');
    }
}

// Grant Finder
function renderGrantResults(data: any[]) {
    currentGrantData = data;
    if (!data || data.length === 0) {
        grantReportContainer.innerHTML = getPlaceholderHTML('placeholderGrant');
        grantExportButtons.style.display = 'none';
        return;
    }
    grantReportContainer.innerHTML = data.map(grant => {
        const safeLink = /^https?:\/\//i.test(String(grant.link || '')) ? String(grant.link) : '';
        return `
        <div class="result-card">
            <h3>${escapeHtml(grant.title || 'N/A')}</h3>
            <p class="organization">${escapeHtml(grant.organization || 'N/A')}</p>
            <p class="summary">${escapeHtml(grant.summary || 'N/A')}</p>
            <div class="details-grid">
                <div class="detail-item"><span class="detail-label">Deadline:</span> <span class="detail-value deadline">${escapeHtml(grant.deadline || 'N/A')}</span></div>
                <div class="detail-item"><span class="detail-label">Funding:</span> <span class="detail-value amount">${escapeHtml(grant.fundingAmount || 'N/A')}</span></div>
                <div class="detail-item"><span class="detail-label">Eligibility:</span> <span class="detail-value">${escapeHtml(grant.eligibility || 'N/A')}</span></div>
            </div>
            ${safeLink ? `<a href="${escapeHtml(safeLink)}" target="_blank" rel="noopener noreferrer" class="result-link">View Grant</a>` : ''}
            ${safeLink ? `<button class="adopt-button" data-url="${escapeHtml(safeLink)}" data-title="${escapeHtml(grant.title || '')}" data-key="adoptButtonOnCard">${escapeHtml(t('adoptButtonOnCard'))}</button>` : ''}
        </div>`;
    }).join('');
    currentGrantText = grantReportContainer.innerText;
    grantExportButtons.style.display = 'grid';
    document.querySelectorAll('.adopt-button').forEach(button => button.addEventListener('click', handleAdoptButtonClick as EventListener));
}

async function handleFindGrants(e: Event) {
    e.preventDefault();
    hideError(grantFinderErrorDisplay);
    if (!grantTopicInput.value && !grantDescriptionInput.value) {
        showError(grantFinderErrorDisplay, 'errorGrantTopicDesc');
        return;
    }

    setLoading(findGrantsSubmitBtn, true, 'findGrantsButton');
    grantReportContainer.innerHTML = `<div class="spinner-large"></div>`;
    grantExportButtons.style.display = 'none';
    grantFinderSourcesWrapper.style.display = 'none';
    
    let prompt = `Find current, real environmental grant opportunities using web search. Return ONLY a JSON array of objects with keys: title, organization, deadline, fundingAmount, eligibility, summary, link.
    Prefer real URLs. Language: ${currentLang === 'fa' ? 'Persian' : 'English'}.
    Project Topic/Area: ${grantTopicInput.value}
    Project Description: ${grantDescriptionInput.value}`;
    if (grantFundingAmountInput.value) prompt += `\nMinimum Funding: ${grantFundingAmountInput.value}`;
    if (grantEligibilityInput.value) prompt += `\nEligibility Requirements: ${grantEligibilityInput.value}`;
    if (grantGeographicFocusInput.value) prompt += `\nGeographic Focus: ${grantGeographicFocusInput.value}`;
    if (grantCountryInput.value) prompt += `\nCountry: ${grantCountryInput.value}`;

    try {
        const ai = createAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] },
        });
        const parsed = parseJsonPayload(response.text);
        renderGrantResults(Array.isArray(parsed) ? parsed : (parsed.grants || parsed.results || []));
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks?.length) {
            grantFinderSources.innerHTML = chunks.filter((c: any) => c.web?.uri).map((c: any) =>
                `<li><a href="${escapeHtml(c.web.uri)}" target="_blank" rel="noopener noreferrer">${escapeHtml(c.web.title || c.web.uri)}</a></li>`
            ).join('');
            grantFinderSourcesWrapper.style.display = 'block';
        }
    } catch (e) {
        handleApiError(e, grantFinderErrorDisplay, 'errorGrantServiceUnavailable');
        grantReportContainer.innerHTML = getPlaceholderHTML('placeholderGrant');
    } finally {
        setLoading(findGrantsSubmitBtn, false, 'findGrantsButton');
    }
}

// RFP Finder
function renderRfpResults(data: any[]) {
    currentRfpData = data;
    if (!data || data.length === 0) {
        rfpReportContainer.innerHTML = getPlaceholderHTML('placeholderRfp');
        rfpExportButtons.style.display = 'none';
        return;
    }
    rfpReportContainer.innerHTML = data.map(rfp => {
        const safeLink = /^https?:\/\//i.test(String(rfp.link || '')) ? String(rfp.link) : '';
        return `
        <div class="result-card">
            <h3>${escapeHtml(rfp.title || 'N/A')}</h3>
            <p class="organization">${escapeHtml(rfp.issuingOrganization || 'N/A')}</p>
            <p class="summary">${escapeHtml(rfp.summary || 'N/A')}</p>
            <div class="details-grid">
                 <div class="detail-item"><span class="detail-label">Deadline:</span> <span class="detail-value deadline">${escapeHtml(rfp.deadline || 'N/A')}</span></div>
                 <div class="detail-item"><span class="detail-label">Eligibility:</span> <span class="detail-value">${escapeHtml(rfp.eligibility || 'N/A')}</span></div>
            </div>
            ${safeLink ? `<a href="${escapeHtml(safeLink)}" target="_blank" rel="noopener noreferrer" class="result-link">View RFP</a>` : ''}
        </div>`;
    }).join('');
    currentRfpText = rfpReportContainer.innerText;
    rfpExportButtons.style.display = 'grid';
}

async function handleFindRfps(e: Event) {
    e.preventDefault();
    hideError(rfpFinderErrorDisplay);
    if (!rfpTopicInput.value && !rfpDescriptionInput.value) {
        showError(rfpFinderErrorDisplay, 'errorRfpTopicDesc');
        return;
    }

    setLoading(findRfpsSubmitBtn, true, 'findRfpsButton');
    rfpReportContainer.innerHTML = `<div class="spinner-large"></div>`;
    rfpExportButtons.style.display = 'none';
    rfpFinderSourcesWrapper.style.display = 'none';

    let prompt = `Find current, real Requests for Proposals (RFPs) using web search. Return ONLY a JSON array of objects with keys: title, issuingOrganization, deadline, summary, eligibility, link.
    Prefer real URLs. Language: ${currentLang === 'fa' ? 'Persian' : 'English'}.
    Expertise/Area: ${rfpTopicInput.value}
    Description: ${rfpDescriptionInput.value}`;
    if (rfpOrgTypeInput.value) prompt += `\nOrganization Type: ${rfpOrgTypeInput.value}`;
    if (rfpEligibilityInput.value) prompt += `\nEligibility: ${rfpEligibilityInput.value}`;
    if (rfpGeographicFocusInput.value) prompt += `\nGeographic Focus: ${rfpGeographicFocusInput.value}`;
    if (rfpCountryInput.value) prompt += `\nCountry: ${rfpCountryInput.value}`;

    try {
        const ai = createAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] },
        });
        const parsed = parseJsonPayload(response.text);
        renderRfpResults(Array.isArray(parsed) ? parsed : (parsed.rfps || parsed.results || []));
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks?.length) {
            rfpFinderSources.innerHTML = chunks.filter((c: any) => c.web?.uri).map((c: any) =>
                `<li><a href="${escapeHtml(c.web.uri)}" target="_blank" rel="noopener noreferrer">${escapeHtml(c.web.title || c.web.uri)}</a></li>`
            ).join('');
            rfpFinderSourcesWrapper.style.display = 'block';
        }
    } catch (e) {
        handleApiError(e, rfpFinderErrorDisplay, 'errorRfpServiceUnavailable');
        rfpReportContainer.innerHTML = getPlaceholderHTML('placeholderRfp');
    } finally {
        setLoading(findRfpsSubmitBtn, false, 'findRfpsButton');
    }
}


// Adopt Grant
function handleAdoptButtonClick(event: MouseEvent) {
    const button = event.target as HTMLButtonElement;
    const url = button.dataset.url;
    const title = button.dataset.title;
    if (url) {
        adoptUrlInput.value = url;
        adoptKeywordsInput.value = title || '';
        const adoptAccordion = adoptForm.closest('.tool-accordion');
        if (adoptAccordion && !adoptAccordion.classList.contains('active')) {
            (adoptAccordion.querySelector('.accordion-header') as HTMLElement)?.click();
        }
        adoptUrlInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

async function handleAnalyzeGrant(e: Event) {
    e.preventDefault();
    hideError(adoptFinderErrorDisplay);
    if (!adoptUrlInput.value) {
        showError(adoptFinderErrorDisplay, 'errorAdoptUrl');
        return;
    }

    setLoading(analyzeGrantBtn, true, 'adoptButton');
    adoptReportContainer.innerHTML = `<div class="spinner-large"></div>`;
    adoptExportButtons.style.display = 'none';
    adoptFinderSourcesWrapper.style.display = 'none';

    const prompt = `Analyze the grant opportunity from the URL: ${adoptUrlInput.value}.
    Focus on relevance to these keywords: "${adoptKeywordsInput.value}".
    Provide a detailed summary covering: Grant Overview, Funding Details, Key Dates, Eligibility Criteria, Application Requirements, and Alignment Analysis. Use markdown.`;

    try {
        const ai = createAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        });

        currentAdoptedGrantText = response.text || '';
        adoptReportContainer.textContent = currentAdoptedGrantText;
        adoptExportButtons.style.display = 'grid';

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks?.length) {
            adoptFinderSources.innerHTML = chunks.filter((c: any) => c.web?.uri).map((c: any) =>
                `<li><a href="${escapeHtml(c.web.uri)}" target="_blank" rel="noopener noreferrer">${escapeHtml(c.web.title || c.web.uri)}</a></li>`
            ).join('');
            adoptFinderSourcesWrapper.style.display = 'block';
        }
    } catch (e) {
        handleApiError(e, adoptFinderErrorDisplay, 'errorAdoptServiceUnavailable');
        adoptReportContainer.innerHTML = getPlaceholderHTML('placeholderAdopt');
    } finally {
        setLoading(analyzeGrantBtn, false, 'adoptButton');
    }
}

// Custom AI Search
async function handleCustomSearch(e: Event) {
    e.preventDefault();
    hideError(customFinderErrorDisplay);
    if (!customTopicInput.value) {
        showError(customFinderErrorDisplay, 'errorCustomTopicDesc');
        return;
    }

    setLoading(findCustomSubmitBtn, true, 'findCustomButton');
    customReportContainer.innerHTML = `<div class="spinner-large"></div>`;
    customFinderSourcesWrapper.style.display = 'none';

    try {
        const ai = createAiClient();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: customTopicInput.value,
            config: { tools: [{ googleSearch: {} }] }
        });

        currentCustomText = response.text || '';
        customReportContainer.textContent = currentCustomText;

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks?.length) {
            customFinderSources.innerHTML = chunks.filter((c: any) => c.web?.uri).map((c: any) =>
                `<li><a href="${escapeHtml(c.web.uri)}" target="_blank" rel="noopener noreferrer">${escapeHtml(c.web.title || c.web.uri)}</a></li>`
            ).join('');
            customFinderSourcesWrapper.style.display = 'block';
        }
    } catch (e) {
        handleApiError(e, customFinderErrorDisplay, 'errorCustomServiceUnavailable');
        customReportContainer.innerHTML = getPlaceholderHTML('placeholderCustom');
    } finally {
        setLoading(findCustomSubmitBtn, false, 'findCustomButton');
    }
}

// AI Video Generator
async function handleGenerateVideo(e: Event) {
    e.preventDefault();
    hideError(videoFinderErrorDisplay);
    if (!videoScenarioInput.value) {
        showError(videoFinderErrorDisplay, 'errorVideoScenario');
        return;
    }

    setLoading(generateVideoBtn, true, 'generateVideoButton');
    videoReportContainer.innerHTML = '';
    videoLoadingStatus.style.display = 'block';
    downloadVideoBtn.style.display = 'none';
    currentVideoUrl = null;

    try {
        if (window.aistudio) {
            try {
                if (!(await window.aistudio.hasSelectedApiKey())) {
                    await window.aistudio.openSelectKey();
                }
            } catch (studioErr) {
                console.warn('AI Studio key selector unavailable', studioErr);
            }
        }

        const apiKey = requireApiKey();
        const ai = new GoogleGenAI({ apiKey });

        videoLoadingMessage.textContent = t('videoLoading1');
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: videoScenarioInput.value,
            config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
        });
        
        videoLoadingMessage.textContent = t('videoLoading2');
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation });
            videoLoadingMessage.textContent = t('videoLoading3');
        }

        videoLoadingMessage.textContent = t('videoLoading4');
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (downloadLink) {
            const separator = downloadLink.includes('?') ? '&' : '?';
            const videoResponse = await fetch(`${downloadLink}${separator}key=${encodeURIComponent(apiKey)}`);
            if (!videoResponse.ok) throw new Error('Failed to fetch generated video.');
            const videoBlob = await videoResponse.blob();
            currentVideoUrl = URL.createObjectURL(videoBlob);
            
            const videoElement = document.createElement('video');
            videoElement.src = currentVideoUrl;
            videoElement.controls = true;
            videoElement.style.width = '100%';
            videoReportContainer.innerHTML = '';
            videoReportContainer.appendChild(videoElement);
            
            downloadVideoBtn.href = currentVideoUrl;
            downloadVideoBtn.style.display = 'flex';
        } else {
            throw new Error("Video generation did not return a valid link.");
        }

    } catch (e: any) {
        const message = e instanceof Error ? e.message : String(e || '');
        if (message.includes('Requested entity was not found')) {
            if (window.aistudio?.openSelectKey) {
                await window.aistudio.openSelectKey();
            }
            showError(videoFinderErrorDisplay, 'errorApiKey');
        } else {
            handleApiError(e, videoFinderErrorDisplay, 'errorVideoServiceUnavailable');
        }
        videoReportContainer.innerHTML = getPlaceholderHTML('placeholderVideo');
    } finally {
        setLoading(generateVideoBtn, false, 'generateVideoButton');
        videoLoadingStatus.style.display = 'none';
    }
}


// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // Accordion Logic — CSS handles max-height so dynamic results are not clipped
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const accordion = header.parentElement as HTMLElement;
            const isOpen = accordion.classList.contains('active');
            document.querySelectorAll('.tool-accordion.active').forEach(actAcc => {
                actAcc.classList.remove('active');
            });
            if (!isOpen) accordion.classList.add('active');
        });
    });

    // Language Switcher
    document.querySelectorAll('.lang-switcher button[data-lang]').forEach(button => {
        button.addEventListener('click', () => {
            currentLang = button.getAttribute('data-lang') as 'en' | 'fa';
            updateUIForLanguage();
        });
    });

    const apiKeyInput = document.getElementById('apiKeyInput') as HTMLInputElement | null;
    const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    const persistApiKey = () => {
        const value = apiKeyInput?.value.trim() || '';
        if (value) {
            localStorage.setItem(API_KEY_STORAGE, value);
            if (apiKeyInput) apiKeyInput.value = '';
        } else {
            localStorage.removeItem(API_KEY_STORAGE);
        }
        updateApiKeyStatus();
        const status = document.getElementById('apiKeyStatus');
        if (status && value) status.textContent = t('apiKeySaved');
    };
    saveApiKeyBtn?.addEventListener('click', persistApiKey);
    apiKeyInput?.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            persistApiKey();
        }
    });

    // --- Event Listeners ---
    form.addEventListener('submit', handleGenerate);
    grantForm.addEventListener('submit', handleFindGrants);
    rfpForm.addEventListener('submit', handleFindRfps);
    customForm.addEventListener('submit', handleCustomSearch);
    adoptForm.addEventListener('submit', handleAnalyzeGrant);
    videoForm.addEventListener('submit', handleGenerateVideo);

    // Clear Buttons
    clearBtn.addEventListener('click', () => {
        form.reset();
        reportContainer.innerHTML = getPlaceholderHTML('placeholderGenerator');
        hideError(errorDisplay);
        copyBtn.style.display = 'none';
    });
    clearGrantsBtn.addEventListener('click', () => {
        grantForm.reset();
        grantReportContainer.innerHTML = getPlaceholderHTML('placeholderGrant');
        grantExportButtons.style.display = 'none';
        hideError(grantFinderErrorDisplay);
        grantFinderSourcesWrapper.style.display = 'none';
        currentGrantData = [];
    });
    clearRfpsBtn.addEventListener('click', () => {
        rfpForm.reset();
        rfpReportContainer.innerHTML = getPlaceholderHTML('placeholderRfp');
        rfpExportButtons.style.display = 'none';
        hideError(rfpFinderErrorDisplay);
        rfpFinderSourcesWrapper.style.display = 'none';
        currentRfpData = [];
    });
     clearCustomBtn.addEventListener('click', () => {
        customForm.reset();
        customReportContainer.innerHTML = getPlaceholderHTML('placeholderCustom');
        hideError(customFinderErrorDisplay);
        customFinderSourcesWrapper.style.display = 'none';
    });
    clearAdoptBtn.addEventListener('click', () => {
        adoptForm.reset();
        adoptReportContainer.innerHTML = getPlaceholderHTML('placeholderAdopt');
        adoptExportButtons.style.display = 'none';
        hideError(adoptFinderErrorDisplay);
        adoptFinderSourcesWrapper.style.display = 'none';
    });
    clearVideoBtn.addEventListener('click', () => {
        videoForm.reset();
        videoReportContainer.innerHTML = getPlaceholderHTML('placeholderVideo');
        hideError(videoFinderErrorDisplay);
        downloadVideoBtn.style.display = 'none';
        currentVideoUrl = null;
    });

    // Copy Button
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(reportContainer.textContent || '');
        copyBtn.textContent = t('copiedButton');
        setTimeout(() => { copyBtn.textContent = t('copyButton'); }, 2000);
    });
    
    // --- Export Listeners ---
    // Grant Exports
    exportPdfBtn.addEventListener('click', () => {
        exportTextPdf("Grant Opportunities", currentGrantText, "grants.pdf");
    });
    exportDocxBtn.addEventListener('click', async () => {
        const paragraphs = currentGrantData.map(g => new docx.Paragraph({ children: [ new docx.TextRun({ text: g.title, bold: true, size: 28 }), new docx.TextRun({ text: `Organization: ${g.organization}`, break: 1 }), new docx.TextRun({ text: `Summary: ${g.summary}`, break: 1 })], spacing: { after: 200 } }));
        const doc = new docx.Document({ sections: [{ children: paragraphs }] });
        downloadBlob(await docx.Packer.toBlob(doc), "grants.docx");
    });
    exportCsvBtn.addEventListener('click', () => downloadBlob(new Blob([arrayToCsv(currentGrantData)], { type: 'text/csv' }), 'grants.csv'));
    exportJsonBtn.addEventListener('click', () => downloadBlob(new Blob([JSON.stringify(currentGrantData, null, 2)], { type: 'application/json' }), 'grants.json'));
    
    // RFP Exports
    exportRfpPdfBtn.addEventListener('click', () => {
        exportTextPdf("RFP Opportunities", currentRfpText, "rfps.pdf");
    });
    exportRfpDocxBtn.addEventListener('click', async () => {
        const paragraphs = currentRfpData.map(r => new docx.Paragraph({ children: [ new docx.TextRun({ text: r.title, bold: true, size: 28 }), new docx.TextRun({ text: `Organization: ${r.issuingOrganization}`, break: 1 }), new docx.TextRun({ text: `Summary: ${r.summary}`, break: 1 })], spacing: { after: 200 } }));
        const doc = new docx.Document({ sections: [{ children: paragraphs }] });
        downloadBlob(await docx.Packer.toBlob(doc), "rfps.docx");
    });
    exportRfpCsvBtn.addEventListener('click', () => downloadBlob(new Blob([arrayToCsv(currentRfpData)], { type: 'text/csv' }), 'rfps.csv'));
    exportRfpJsonBtn.addEventListener('click', () => downloadBlob(new Blob([JSON.stringify(currentRfpData, null, 2)], { type: 'application/json' }), 'rfps.json'));

    // Adopted Grant Exports
    exportAdoptPdfBtn.addEventListener('click', () => {
        exportTextPdf("Grant Analysis", currentAdoptedGrantText, "grant-analysis.pdf");
    });
    exportAdoptDocxBtn.addEventListener('click', async () => {
        const doc = new docx.Document({ sections: [{ children: [new docx.Paragraph(currentAdoptedGrantText)] }] });
        downloadBlob(await docx.Packer.toBlob(doc), "grant-analysis.docx");
    });
    
    // Hero CTA button smooth scroll
    const ctaButton = document.querySelector('.hero .cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = (e.currentTarget as HTMLAnchorElement).getAttribute('href')?.substring(1);
            if (targetId) {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    // --- Initial Setup ---
    updateUIForLanguage();

    initWritingModules();
    initChatWidget();
    initHfCatalog();

    fetch('/api/bots')
        .then((r) => r.json())
        .then((info) => {
            const tg = document.getElementById('telegramBotLink') as HTMLAnchorElement | null;
            const bale = document.getElementById('baleBotLink') as HTMLAnchorElement | null;
            if (tg && info.telegram?.link) tg.href = info.telegram.link;
            if (bale && info.bale?.link) bale.href = info.bale.link;
        })
        .catch(() => { /* bot server may be offline */ });
});;