import fs from 'fs';
import path from 'path';
import { ROOT } from './config.ts';

export type HfModule = {
  id: string;
  kind: 'model' | 'dataset' | 'space';
  part: 'rag' | 'writer' | 'database' | 'space';
  mapsTo: string[];
  hub: string;
  url: string;
  title_en: string;
  title_fa: string;
  blurb_en: string;
  blurb_fa: string;
};

export type HfCatalog = {
  embedder: string;
  note: string;
  modules: HfModule[];
};

let cached: HfCatalog | null = null;

export function loadHfCatalog(): HfCatalog {
  if (cached) return cached;
  const file = path.join(ROOT, 'public', 'hf-catalog.json');
  cached = JSON.parse(fs.readFileSync(file, 'utf8')) as HfCatalog;
  return cached;
}

export function formatHfCatalog(lang: 'fa' | 'en', filter?: string): string {
  const cat = loadHfCatalog();
  const fa = lang === 'fa';
  const want = (filter || '').toLowerCase();
  const items = cat.modules.filter((m) => {
    if (!want) return true;
    const blob = `${m.id} ${m.hub} ${m.part} ${m.kind} ${m.mapsTo.join(' ')} ${m.title_en} ${m.title_fa} ${m.blurb_en} ${m.blurb_fa}`.toLowerCase();
    return blob.includes(want);
  });
  const parts: Record<string, string> = fa
    ? { rag: '۱. بازیابی (RAG)', writer: '۲. نگارش / LoRA', database: '۳. داده', space: '۴. اسپیس' }
    : { rag: '1. RAG', writer: '2. Writer / LoRA', database: '3. Dataset', space: '4. Space' };
    const lines = [
    fa
      ? '🤗 ماژول‌های Hugging Face مرتبط با FindExpert (فقط لینک — در ربات بار نمی‌شوند):'
      : '🤗 Hugging Face modules for FindExpert (links only — not loaded in the bot):',
    '',
  ];
  for (const part of ['rag', 'writer', 'database', 'space'] as const) {
    const group = items.filter((m) => m.part === part);
    if (!group.length) continue;
    lines.push(`<b>${parts[part]}</b>`);
    for (const m of group) {
      const title = escapeHtml(fa ? m.title_fa : m.title_en);
      const blurb = escapeHtml(fa ? m.blurb_fa : m.blurb_en);
      lines.push(`• ${title}\n${blurb}\n${escapeHtml(m.url)}`);
    }
    lines.push('');
  }
  if (items.length === 0) {
    lines.push(fa ? 'موردی با این فیلتر پیدا نشد.' : 'No modules matched that filter.');
  }
  return lines.join('\n').trim();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
