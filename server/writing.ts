import { GoogleGenAI } from '@google/genai';
import { config } from './config.ts';

export type PriorArt = {
  title: string;
  patentNumber: string;
  similarity: string;
  noveltyTip: string;
  link: string;
};

function requireKey() {
  if (!config.geminiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({ apiKey: config.geminiKey });
}

function parseJsonPayload(text: string | undefined): any {
  if (!text) throw new Error('Empty AI response');
  const cleaned = text.replace(/```(?:json)?/gi, '```').trim();
  const fenced = cleaned.match(/```([\s\S]*?)```/);
  const raw = (fenced ? fenced[1] : cleaned).trim();
  const start = raw.search(/[\[{]/);
  return JSON.parse(start >= 0 ? raw.slice(start) : raw);
}

function asArray(parsed: any, keys: string[]): any[] {
  if (Array.isArray(parsed)) return parsed;
  for (const key of keys) {
    if (Array.isArray(parsed?.[key])) return parsed[key];
  }
  return [];
}

const langName = (lang: 'fa' | 'en') => (lang === 'fa' ? 'Persian' : 'English');

const WILDFIRE_HINT =
  'When the idea involves fire, drought, forests, drones, IoT sensors, or satellite monitoring, connect it to NASA FIRMS / Sentinel-2 wildfire context and university–industry disaster-response R&D (not as a runnable ML model).';

export async function draftPatent(input: {
  idea: string;
  section: string;
  lang: 'fa' | 'en';
}): Promise<string> {
  const ai = requireKey();
  const prompt = `You are a patent drafting assistant for FindExpert.ir ecoAI (university–industry / green-tech).
Draft the "${input.section}" of a patent application from this invention idea:
${input.idea}

Cover (as relevant to the requested section): technical field, background/problem, solution, novelty vs prior art, independent and dependent claims, brief description of drawings (if useful).
${WILDFIRE_HINT}
Write in ${langName(input.lang)}. Professional, structured, ready to paste into a filing draft. Use short headings. No preamble. This is not legal advice.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text || '';
}

export async function searchPriorArt(idea: string, lang: 'fa' | 'en' = 'fa'): Promise<PriorArt[]> {
  const ai = requireKey();
  const prompt = `Search the web for real patents / prior art related to this invention idea.
Return ONLY a JSON array of objects with keys: title, patentNumber, similarity (0-100 or short phrase), noveltyTip, link.
Prefer Google Patents / USPTO / EPO / WIPO URLs. Language of text fields: ${langName(lang)}.
Idea: ${idea}
Limit to 5 high-quality results.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return asArray(parseJsonPayload(response.text), ['patents', 'results', 'priorArt']);
}

export async function draftAcademic(input: {
  title: string;
  overview: string;
  section: string;
  style: string;
  latex: boolean;
  lang: 'fa' | 'en';
}): Promise<string> {
  const ai = requireKey();
  const prompt = `You are an academic writing assistant for FindExpert.ir ecoAI.
Draft the "${input.section}" of a research paper or academic proposal.
Title: ${input.title}
Overview / notes: ${input.overview}
Target venue style: ${input.style || 'IEEE'}
${input.latex ? 'Output LaTeX (article class, ready to compile).' : 'Use markdown headings. No LaTeX unless asked.'}
${WILDFIRE_HINT}
If the topic is wildfire / satellite / disaster response, you may cite NASA FIRMS, Sentinel-2, and fire-spread prediction as research context.
Write in ${langName(input.lang)}. Formal academic tone. No preamble.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text || '';
}

export async function draftBusinessPlan(input: {
  title: string;
  overview: string;
  section: string;
  lang: 'fa' | 'en';
}): Promise<string> {
  const ai = requireKey();
  const prompt = `You are a business-plan writer for FindExpert.ir ecoAI (green / environmental / دانش‌بنیان / university spin-outs).
Draft the "${input.section}" of a business plan.
Venture title: ${input.title}
Overview: ${input.overview}

If drafting a full plan, include: executive summary, problem, solution, market, competition, operations, go-to-market, team, financials (assumptions), funding ask, risks, sustainability.
${WILDFIRE_HINT}
Write in ${langName(input.lang)}. Practical, investor-ready. Short headings. No preamble.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text || '';
}
