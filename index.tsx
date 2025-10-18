import { GoogleGenAI, Type } from "@google/genai";
import { jsPDF } from "jspdf";
import * as docx from "docx";

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
let currentLang = 'fa';

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
let ai;
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


const getPlaceholderHTML = (key) => `<div class="placeholder-text">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 1