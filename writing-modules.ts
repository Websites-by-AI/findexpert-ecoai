import { GoogleGenAI } from '@google/genai';

const API_KEY_STORAGE = 'GEMINI_API_KEY';

const WILDFIRE_HINT =
  'When the idea involves fire, drought, forests, drones, IoT sensors, or satellite monitoring, connect it to NASA FIRMS / Sentinel-2 wildfire context and university–industry disaster-response R&D (not as a runnable ML model).';

function getLang(): 'en' | 'fa' {
  return document.body.classList.contains('lang-en') ? 'en' : 'fa';
}

function t(key: string): string {
  const el = document.querySelector(`[data-key="${key}"]`);
  if (el && el.textContent) return el.textContent;
  return key;
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

function createAiClient() {
  const key = getApiKey();
  if (!key) throw new Error('API key not valid.');
  return new GoogleGenAI({ apiKey: key });
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
  return JSON.parse(start >= 0 ? raw.slice(start) : raw);
}

function placeholder(key: string) {
  return `<div class="placeholder-text">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
    <span>${escapeHtml(document.querySelector(`[data-key="${key}"]`)?.textContent || t(key))}</span>
  </div>`;
}

function setLoading(button: HTMLButtonElement, isLoading: boolean, key: string) {
  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `<div class="spinner"></div>`;
  } else {
    button.disabled = false;
    const label = document.querySelector(`[data-key="${key}"]`)?.textContent || key;
    button.innerHTML = `<span data-key="${key}">${escapeHtml(label)}</span>`;
  }
}

function showError(el: HTMLElement, message: string) {
  el.textContent = message;
  el.style.display = 'block';
}

function hideError(el: HTMLElement) {
  el.textContent = '';
  el.style.display = 'none';
}

function handleApiError(e: unknown, el: HTMLElement) {
  const message = e instanceof Error ? e.message : String(e || '');
  if (message.includes('API key')) showError(el, 'API Key Error: add a Gemini key in the header.');
  else if (message.toLowerCase().includes('quota') || message.includes('429')) showError(el, 'Quota exceeded.');
  else if (message.includes('JSON') || message.includes('parse') || message.includes('Empty AI'))
    showError(el, 'Failed to parse the AI response.');
  else showError(el, message || 'AI service is not available.');
}

function langName() {
  return getLang() === 'fa' ? 'Persian' : 'English';
}

export function initWritingModules() {
  const patentForm = document.getElementById('patent-form') as HTMLFormElement | null;
  if (!patentForm) return;

  const patentIdea = document.getElementById('patentIdea') as HTMLTextAreaElement;
  const patentSection = document.getElementById('patentSection') as HTMLSelectElement;
  const patentSubmitBtn = document.getElementById('patentSubmitBtn') as HTMLButtonElement;
  const priorArtBtn = document.getElementById('priorArtBtn') as HTMLButtonElement;
  const clearPatentBtn = document.getElementById('clearPatentBtn') as HTMLButtonElement;
  const patentError = document.getElementById('patentErrorDisplay') as HTMLDivElement;
  const patentReport = document.getElementById('patent-report-container') as HTMLDivElement;

  const academicForm = document.getElementById('academic-form') as HTMLFormElement;
  const academicTitle = document.getElementById('academicTitle') as HTMLInputElement;
  const academicOverview = document.getElementById('academicOverview') as HTMLTextAreaElement;
  const academicSection = document.getElementById('academicSection') as HTMLSelectElement;
  const academicStyle = document.getElementById('academicStyle') as HTMLSelectElement;
  const academicLatex = document.getElementById('academicLatex') as HTMLInputElement;
  const academicSubmitBtn = document.getElementById('academicSubmitBtn') as HTMLButtonElement;
  const clearAcademicBtn = document.getElementById('clearAcademicBtn') as HTMLButtonElement;
  const academicError = document.getElementById('academicErrorDisplay') as HTMLDivElement;
  const academicReport = document.getElementById('academic-report-container') as HTMLDivElement;

  const bizForm = document.getElementById('biz-form') as HTMLFormElement;
  const bizTitle = document.getElementById('bizTitle') as HTMLInputElement;
  const bizOverview = document.getElementById('bizOverview') as HTMLTextAreaElement;
  const bizSection = document.getElementById('bizSection') as HTMLSelectElement;
  const bizSubmitBtn = document.getElementById('bizSubmitBtn') as HTMLButtonElement;
  const clearBizBtn = document.getElementById('clearBizBtn') as HTMLButtonElement;
  const bizError = document.getElementById('bizErrorDisplay') as HTMLDivElement;
  const bizReport = document.getElementById('biz-report-container') as HTMLDivElement;

  const resetPlaceholders = () => {
    if (patentReport.querySelector('.placeholder-text') || !patentReport.textContent?.trim()) {
      patentReport.innerHTML = placeholder('placeholderPatent');
    }
    if (academicReport.querySelector('.placeholder-text') || !academicReport.textContent?.trim()) {
      academicReport.innerHTML = placeholder('placeholderAcademic');
    }
    if (bizReport.querySelector('.placeholder-text') || !bizReport.textContent?.trim()) {
      bizReport.innerHTML = placeholder('placeholderBiz');
    }
  };
  resetPlaceholders();
  document.querySelectorAll('.lang-switcher button[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => setTimeout(resetPlaceholders, 0));
  });

  patentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(patentError);
    if (!patentIdea.value.trim()) {
      showError(patentError, getLang() === 'fa' ? 'ایده اختراع را بنویسید.' : 'Please describe the invention idea.');
      return;
    }
    setLoading(patentSubmitBtn, true, 'patentDraftButton');
    patentReport.innerHTML = `<div class="spinner-large"></div>`;
    const section = patentSection.options[patentSection.selectedIndex].text;
    const prompt = `You are a patent drafting assistant for FindExpert.ir ecoAI (university–industry / green-tech).
Draft the "${section}" of a patent application from this invention idea:
${patentIdea.value}
Cover (as relevant): technical field, background/problem, solution, novelty vs prior art, independent and dependent claims.
${WILDFIRE_HINT}
Write in ${langName()}. Professional, structured. Short headings. No preamble. This is not legal advice.`;
    try {
      const ai = createAiClient();
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      patentReport.textContent = response.text || '';
    } catch (err) {
      handleApiError(err, patentError);
      patentReport.innerHTML = placeholder('placeholderPatent');
    } finally {
      setLoading(patentSubmitBtn, false, 'patentDraftButton');
    }
  });

  priorArtBtn.addEventListener('click', async () => {
    hideError(patentError);
    if (!patentIdea.value.trim()) {
      showError(patentError, getLang() === 'fa' ? 'ایده اختراع را بنویسید.' : 'Please describe the invention idea.');
      return;
    }
    setLoading(priorArtBtn, true, 'priorArtButton');
    patentReport.innerHTML = `<div class="spinner-large"></div>`;
    const prompt = `Search the web for real patents / prior art related to this invention idea.
Return ONLY a JSON array of objects with keys: title, patentNumber, similarity, noveltyTip, link.
Prefer Google Patents / USPTO / EPO / WIPO URLs. Language of text fields: ${langName()}.
Idea: ${patentIdea.value}
Limit to 5 high-quality results.`;
    try {
      const ai = createAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] },
      });
      const parsed = parseJsonPayload(response.text);
      const data = Array.isArray(parsed) ? parsed : parsed.patents || parsed.results || parsed.priorArt || [];
      if (!data.length) {
        patentReport.innerHTML = placeholder('placeholderPatent');
        return;
      }
      patentReport.innerHTML = data
        .map((p: any) => {
          const safeLink = /^https?:\/\//i.test(String(p.link || '')) ? String(p.link) : '';
          return `<div class="result-card">
            <h3>${escapeHtml(p.title || 'N/A')}</h3>
            <p class="organization">${escapeHtml(p.patentNumber || '')}</p>
            <p class="summary">${escapeHtml(p.noveltyTip || p.similarity || '')}</p>
            ${safeLink ? `<a href="${escapeHtml(safeLink)}" target="_blank" rel="noopener noreferrer" class="result-link">View</a>` : ''}
          </div>`;
        })
        .join('');
    } catch (err) {
      handleApiError(err, patentError);
      patentReport.innerHTML = placeholder('placeholderPatent');
    } finally {
      setLoading(priorArtBtn, false, 'priorArtButton');
    }
  });

  clearPatentBtn.addEventListener('click', () => {
    patentForm.reset();
    hideError(patentError);
    patentReport.innerHTML = placeholder('placeholderPatent');
  });

  academicForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(academicError);
    if (!academicTitle.value.trim() || !academicOverview.value.trim()) {
      showError(
        academicError,
        getLang() === 'fa' ? 'عنوان و شرح پژوهش را وارد کنید.' : 'Please provide a title and overview.'
      );
      return;
    }
    setLoading(academicSubmitBtn, true, 'academicDraftButton');
    academicReport.innerHTML = `<div class="spinner-large"></div>`;
    const section = academicSection.options[academicSection.selectedIndex].text;
    const style = academicStyle.value;
    const latex = academicLatex.checked;
    const prompt = `You are an academic writing assistant for FindExpert.ir ecoAI.
Draft the "${section}" of a research paper or academic proposal.
Title: ${academicTitle.value}
Overview / notes: ${academicOverview.value}
Target venue style: ${style}
${latex ? 'Output LaTeX (article class, ready to compile).' : 'Use markdown headings. No LaTeX unless asked.'}
${WILDFIRE_HINT}
If the topic is wildfire / satellite / disaster response, you may cite NASA FIRMS, Sentinel-2, and fire-spread prediction as research context.
Write in ${langName()}. Formal academic tone. No preamble.`;
    try {
      const ai = createAiClient();
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      academicReport.textContent = response.text || '';
    } catch (err) {
      handleApiError(err, academicError);
      academicReport.innerHTML = placeholder('placeholderAcademic');
    } finally {
      setLoading(academicSubmitBtn, false, 'academicDraftButton');
    }
  });

  clearAcademicBtn.addEventListener('click', () => {
    academicForm.reset();
    hideError(academicError);
    academicReport.innerHTML = placeholder('placeholderAcademic');
  });

  bizForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(bizError);
    if (!bizTitle.value.trim() || !bizOverview.value.trim()) {
      showError(
        bizError,
        getLang() === 'fa' ? 'عنوان و شرح طرح را وارد کنید.' : 'Please provide a title and overview.'
      );
      return;
    }
    setLoading(bizSubmitBtn, true, 'bizDraftButton');
    bizReport.innerHTML = `<div class="spinner-large"></div>`;
    const section = bizSection.options[bizSection.selectedIndex].text;
    const prompt = `You are a business-plan writer for FindExpert.ir ecoAI (green / environmental / دانش‌بنیان / university spin-outs).
Draft the "${section}" of a business plan.
Venture title: ${bizTitle.value}
Overview: ${bizOverview.value}
If drafting a full plan, include: executive summary, problem, solution, market, competition, operations, go-to-market, team, financials (assumptions), funding ask, risks, sustainability.
${WILDFIRE_HINT}
Write in ${langName()}. Practical, investor-ready. Short headings. No preamble.`;
    try {
      const ai = createAiClient();
      const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
      bizReport.textContent = response.text || '';
    } catch (err) {
      handleApiError(err, bizError);
      bizReport.innerHTML = placeholder('placeholderBiz');
    } finally {
      setLoading(bizSubmitBtn, false, 'bizDraftButton');
    }
  });

  clearBizBtn.addEventListener('click', () => {
    bizForm.reset();
    hideError(bizError);
    bizReport.innerHTML = placeholder('placeholderBiz');
  });
}
