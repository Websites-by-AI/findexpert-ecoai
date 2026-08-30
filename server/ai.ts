import { GoogleGenAI } from '@google/genai';
import { config } from './config.ts';

export type Grant = {
  title: string;
  organization: string;
  deadline: string;
  fundingAmount: string;
  eligibility: string;
  summary: string;
  link: string;
};

export type Rfp = {
  title: string;
  issuingOrganization: string;
  deadline: string;
  eligibility: string;
  summary: string;
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

export async function findGrants(query: string, lang: 'fa' | 'en' = 'fa'): Promise<Grant[]> {
  const ai = requireKey();
  const prompt = `Find current, real environmental / university-industry grant opportunities using web search.
Return ONLY a JSON array of objects with keys: title, organization, deadline, fundingAmount, eligibility, summary, link.
Prefer real URLs. Language: ${lang === 'fa' ? 'Persian' : 'English'}.
Query: ${query}
Limit to 5 high-quality results.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return asArray(parseJsonPayload(response.text), ['grants', 'results']);
}

export async function findRfps(query: string, lang: 'fa' | 'en' = 'fa'): Promise<Rfp[]> {
  const ai = requireKey();
  const prompt = `Find current, real Requests for Proposals (RFPs) / collaboration calls using web search.
Return ONLY a JSON array of objects with keys: title, issuingOrganization, deadline, summary, eligibility, link.
Prefer real URLs. Language: ${lang === 'fa' ? 'Persian' : 'English'}.
Query: ${query}
Limit to 5 high-quality results.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return asArray(parseJsonPayload(response.text), ['rfps', 'results']);
}

export async function draftProposal(input: {
  section: string;
  title: string;
  overview: string;
  lang: 'fa' | 'en';
}): Promise<string> {
  const ai = requireKey();
  const prompt = `Draft a "${input.section}" for a grant proposal.
Project Title: ${input.title}
Overview: ${input.overview}
Write in ${input.lang === 'fa' ? 'Persian' : 'English'}.
Professional, structured, ready for a formal document. Use short headings. No preamble.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text || '';
}

export async function analyzeGrant(url: string, keywords: string, lang: 'fa' | 'en'): Promise<string> {
  const ai = requireKey();
  const prompt = `Analyze the grant opportunity from the URL: ${url}
Focus on relevance to: "${keywords || 'environmental / university-industry collaboration'}".
Language: ${lang === 'fa' ? 'Persian' : 'English'}.
Cover: Overview, Funding, Key dates, Eligibility, Application requirements, Alignment. Keep it concise for a messenger chat.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return response.text || '';
}

export async function askAi(question: string, lang: 'fa' | 'en'): Promise<string> {
  const ai = requireKey();
  const prompt = `You are FindExpert.ir ecoAI, an assistant for university-industry collaboration, environmental grants, and RFPs in Iran and globally.
Answer in ${lang === 'fa' ? 'Persian' : 'English'}. Be practical and concise for a chat bot.
Question: ${question}`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] },
  });
  return response.text || '';
}

export async function channelDigest(topic: string, lang: 'fa' | 'en' = 'fa'): Promise<{ grants: Grant[]; rfps: Rfp[] }> {
  const [grants, rfps] = await Promise.all([
    findGrants(topic, lang).catch(() => [] as Grant[]),
    findRfps(topic, lang).catch(() => [] as Rfp[]),
  ]);
  return { grants: grants.slice(0, 4), rfps: rfps.slice(0, 3) };
}
