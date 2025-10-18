

import { GoogleGenAI, Type } from "@google/genai";
import { jsPDF } from "jspdf";
import * as docx from "docx";

// --- Type Declarations ---
// FIX: Replaced inline type for `window.aistudio` with a named `AIStudio` interface
// to resolve a TypeScript declaration conflict, as indicated by the error message.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    // FIX: Add readonly modifier to resolve TypeScript declaration conflict.
    readonly aistudio: AIStudio;
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

    sourcesTitle: "Sources:",

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
    errorAdoptUrl: "لطفاً برای تحلیل، آدرس URL گرنت را وارد کنید.",
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
let currentGrantText = '';
let currentRfpText = '';
let currentAdoptedGrantText = '';
let currentGrantData: any[] = [];
let currentRfpData: any[] = [];
let currentCustomText = '';
let currentVideoUrl: string | null = null;

// --- AI Response Schemas ---
const grantSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "The title of the grant." },
            organization: { type: Type.STRING, description: "The name of the funding organization." },
            deadline: { type: Type.STRING, description: "The application deadline. (e.g., 'YYYY-MM-DD' or 'Ongoing')" },
            fundingAmount: { type: Type.STRING, description: "The amount of funding available." },
            eligibility: { type: Type.STRING, description: "Key eligibility requirements." },
            summary: { type: Type.STRING, description: "A brief summary of the grant." },
            link: { type: Type.STRING, description: "A direct URL to the grant page, if available." }
        },
        required: ["title", "organization", "deadline", "summary"]
    }
};

const rfpSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "The title of the Request for Proposal." },
            issuingOrganization: { type: Type.STRING, description: "The name of the organization issuing the RFP." },
            deadline: { type: Type.STRING, description: "The submission deadline. (e.g., 'YYYY-MM-DD')" },
            summary: { type: Type.STRING, description: "A brief summary of the RFP." },
            eligibility: { type: Type.STRING, description: "Key eligibility requirements." },
            link: { type: Type.STRING, description: "A direct URL to the RFP page, if available." }
        },
        required: ["title", "issuingOrganization", "deadline", "summary"]
    }
};

const getPlaceholderHTML = (key: string) => `<div class="placeholder-text">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
    <span>${translations[currentLang][key]}</span>
</div>`;

// --- UI & Utility Functions ---

function setLoading(button: HTMLButtonElement, isLoading: boolean, key: string) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `<div class="spinner"></div>`;
    } else {
        button.disabled = false;
        button.innerHTML = `<span data-key="${key}">${translations[currentLang][key] || ''}</span>`;
    }
}

function showError(displayElement: HTMLElement, errorKey: string, ...args: any[]) {
    const messageFn = translations[currentLang][errorKey];
    displayElement.textContent = typeof messageFn === 'function' ? messageFn(...args) : messageFn;
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
        if (key && translations[currentLang][key]) {
            element.innerHTML = translations[currentLang][key];
        }
    });

    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-key-placeholder]').forEach(element => {
        const key = element.getAttribute('data-key-placeholder');
        if (key && translations[currentLang][key]) {
            element.placeholder = translations[currentLang][key];
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

    document.querySelectorAll('.lang-switcher button').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
    });
}

function handleApiError(e: any, errorDisplayElement: HTMLElement, serviceErrorKey: string) {
    console.error(e);
    let message = e.message || '';
    if (message.includes('API key not valid')) {
        showError(errorDisplayElement, 'errorApiKey');
    } else if (message.includes('429')) {
        showError(errorDisplayElement, 'errorQuota');
    } else if (message.includes('[VertexAI.FinishReason] RECITATION')) {
        showError(errorDisplayElement, 'errorRecitation');
    } else if (message.includes('[VertexAI.FinishReason] SAFETY')) {
        showError(errorDisplayElement, 'errorSafety');
    } else if (message.includes('[VertexAI.FinishReason]')) {
        const reason = message.split(']')[1]?.trim() || 'unknown';
        showError(errorDisplayElement, 'errorStopped', reason);
    } else if (message.includes('network error')) {
        showError(errorDisplayElement, 'errorNetwork');
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
        if (!process.env.API_KEY) throw new Error('API key not valid.');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        reportContainer.textContent = response.text;
        copyBtn.style.display = 'block';
        copyBtn.textContent = translations[currentLang].copyButton;
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
    grantReportContainer.innerHTML = data.map(grant => `
        <div class="result-card">
            <h3>${grant.title || 'N/A'}</h3>
            <p class="organization">${grant.organization || 'N/A'}</p>
            <p class="summary">${grant.summary || 'N/A'}</p>
            <div class="details-grid">
                <div class="detail-item"><span class="detail-label">Deadline:</span> <span class="detail-value deadline">${grant.deadline || 'N/A'}</span></div>
                <div class="detail-item"><span class="detail-label">Funding:</span> <span class="detail-value amount">${grant.fundingAmount || 'N/A'}</span></div>
                <div class="detail-item"><span class="detail-label">Eligibility:</span> <span class="detail-value">${grant.eligibility || 'N/A'}</span></div>
            </div>
            ${grant.link ? `<a href="${grant.link}" target="_blank" class="result-link">View Grant</a>` : ''}
            ${grant.link ? `<button class="adopt-button" data-url="${grant.link}" data-title="${grant.title || ''}" data-key="adoptButtonOnCard">${translations[currentLang].adoptButtonOnCard}</button>` : ''}
        </div>`).join('');
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
    
    let prompt = `Find environmental grant opportunities based on the following criteria. Respond in JSON format according to the provided schema.
    Project Topic/Area: ${grantTopicInput.value}
    Project Description: ${grantDescriptionInput.value}`;
    if (grantFundingAmountInput.value) prompt += `\nMinimum Funding: ${grantFundingAmountInput.value}`;
    if (grantEligibilityInput.value) prompt += `\nEligibility Requirements: ${grantEligibilityInput.value}`;
    if (grantGeographicFocusInput.value) prompt += `\nGeographic Focus: ${grantGeographicFocusInput.value}`;
    if (grantCountryInput.value) prompt += `\nCountry: ${grantCountryInput.value}`;

    try {
        if (!process.env.API_KEY) throw new Error('API key not valid.');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: grantSchema },
        });
        renderGrantResults(JSON.parse(response.text.trim()));
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
    rfpReportContainer.innerHTML = data.map(rfp => `
        <div class="result-card">
            <h3>${rfp.title || 'N/A'}</h3>
            <p class="organization">${rfp.issuingOrganization || 'N/A'}</p>
            <p class="summary">${rfp.summary || 'N/A'}</p>
            <div class="details-grid">
                 <div class="detail-item"><span class="detail-label">Deadline:</span> <span class="detail-value deadline">${rfp.deadline || 'N/A'}</span></div>
                 <div class="detail-item"><span class="detail-label">Eligibility:</span> <span class="detail-value">${rfp.eligibility || 'N/A'}</span></div>
            </div>
            ${rfp.link ? `<a href="${rfp.link}" target="_blank" class="result-link">View RFP</a>` : ''}
        </div>`).join('');
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

    let prompt = `Find Requests for Proposals (RFPs) based on the following criteria. Respond in JSON format according to the provided schema.
    Expertise/Area: ${rfpTopicInput.value}
    Description: ${rfpDescriptionInput.value}`;
    if (rfpOrgTypeInput.value) prompt += `\nOrganization Type: ${rfpOrgTypeInput.value}`;
    if (rfpEligibilityInput.value) prompt += `\nEligibility: ${rfpEligibilityInput.value}`;
    if (rfpGeographicFocusInput.value) prompt += `\nGeographic Focus: ${rfpGeographicFocusInput.value}`;
    if (rfpCountryInput.value) prompt += `\nCountry: ${rfpCountryInput.value}`;

    try {
        if (!process.env.API_KEY) throw new Error('API key not valid.');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: rfpSchema },
        });
        renderRfpResults(JSON.parse(response.text.trim()));
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
        if (!process.env.API_KEY) throw new Error('API key not valid.');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { tools: [{ googleSearch: {} }] }
        });

        currentAdoptedGrantText = response.text;
        adoptReportContainer.textContent = currentAdoptedGrantText;
        adoptExportButtons.style.display = 'grid';

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks?.length) {
            adoptFinderSources.innerHTML = chunks.filter(c => c.web?.uri).map(c => 
                `<li><a href="${c.web.uri}" target="_blank">${c.web.title || c.web.uri}</a></li>`
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
        if (!process.env.API_KEY) throw new Error('API key not valid.');
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: customTopicInput.value,
            config: { tools: [{ googleSearch: {} }] }
        });

        currentCustomText = response.text;
        customReportContainer.textContent = currentCustomText;

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks?.length) {
            customFinderSources.innerHTML = chunks.filter(c => c.web?.uri).map(c =>
                `<li><a href="${c.web.uri}" target="_blank">${c.web.title || c.web.uri}</a></li>`
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
        if (!window.aistudio || !(await window.aistudio.hasSelectedApiKey())) {
            await window.aistudio.openSelectKey();
        }
        // Re-init with selected key
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 

        videoLoadingMessage.textContent = translations[currentLang].videoLoading1;
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: videoScenarioInput.value,
            config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
        });
        
        videoLoadingMessage.textContent = translations[currentLang].videoLoading2;
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation });
            videoLoadingMessage.textContent = translations[currentLang].videoLoading3;
        }

        videoLoadingMessage.textContent = translations[currentLang].videoLoading4;
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (downloadLink) {
            const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
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

    } catch (e) {
        if (e.message?.includes('Requested entity was not found')) {
            await window.aistudio.openSelectKey();
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
    // Accordion Logic
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const accordion = header.parentElement as HTMLElement;
            const content = header.nextElementSibling as HTMLElement;
            
            if (accordion.classList.contains('active')) {
                accordion.classList.remove('active');
                content.style.maxHeight = '0';
            } else {
                document.querySelectorAll('.tool-accordion.active').forEach(actAcc => {
                    actAcc.classList.remove('active');
                    (actAcc.querySelector('.accordion-content') as HTMLElement).style.maxHeight = '0';
                });
                accordion.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // Language Switcher
    document.querySelectorAll('.lang-switcher button').forEach(button => {
        button.addEventListener('click', () => {
            currentLang = button.getAttribute('data-lang') as 'en' | 'fa';
            updateUIForLanguage();
        });
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
        copyBtn.textContent = translations[currentLang].copiedButton;
        setTimeout(() => { copyBtn.textContent = translations[currentLang].copyButton; }, 2000);
    });
    
    // --- Export Listeners ---
    // Grant Exports
    exportPdfBtn.addEventListener('click', () => {
        const doc = new jsPDF();
        doc.text("Grant Opportunities", 10, 10);
        doc.text(currentGrantText, 10, 20);
        doc.save("grants.pdf");
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
        const doc = new jsPDF();
        doc.text("RFP Opportunities", 10, 10);
        doc.text(currentRfpText, 10, 20);
        doc.save("rfps.pdf");
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
        const doc = new jsPDF();
        doc.text("Grant Analysis", 10, 10);
        doc.text(currentAdoptedGrantText, 10, 20, { maxWidth: 180 });
        doc.save("grant-analysis.pdf");
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
});