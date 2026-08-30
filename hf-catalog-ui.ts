type HfModule = {
  id: string;
  kind: string;
  part: string;
  mapsTo: string[];
  hub: string;
  url: string;
  title_en: string;
  title_fa: string;
  blurb_en: string;
  blurb_fa: string;
};

type HfCatalog = { embedder: string; note: string; modules: HfModule[] };

function lang(): 'fa' | 'en' {
  return document.body.classList.contains('lang-en') ? 'en' : 'fa';
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatHfPlain(cat: HfCatalog, current: 'fa' | 'en', filter = '') {
  const want = filter.toLowerCase().trim();
  const items = cat.modules.filter((m) => {
    if (!want) return true;
    const blob = `${m.id} ${m.hub} ${m.part} ${m.kind} ${m.mapsTo.join(' ')} ${m.title_en} ${m.title_fa} ${m.blurb_en} ${m.blurb_fa}`.toLowerCase();
    return blob.includes(want);
  });
  const fa = current === 'fa';
  const parts: Record<string, string> = fa
    ? { rag: '۱. بازیابی (RAG)', writer: '۲. نگارش / LoRA', database: '۳. داده', space: '۴. اسپیس' }
    : { rag: '1. RAG', writer: '2. Writer / LoRA', database: '3. Dataset', space: '4. Space' };
  const lines = [
    fa
      ? '🤗 ماژول‌های Hugging Face (فقط لینک — مدل در این پنجره بار نمی‌شود):'
      : '🤗 Hugging Face modules (links only — nothing is loaded here):',
    '',
  ];
  for (const part of ['rag', 'writer', 'database', 'space']) {
    const group = items.filter((m) => m.part === part);
    if (!group.length) continue;
    lines.push(parts[part]);
    for (const m of group) {
      lines.push(`• ${fa ? m.title_fa : m.title_en}\n${fa ? m.blurb_fa : m.blurb_en}\n${m.url}`);
    }
    lines.push('');
  }
  if (!items.length) lines.push(fa ? 'موردی پیدا نشد.' : 'No modules matched.');
  return lines.join('\n').trim();
}

export async function loadHfCatalogClient(): Promise<HfCatalog> {
  const res = await fetch('/hf-catalog.json');
  if (!res.ok) throw new Error('catalog');
  return res.json();
}

export function initHfCatalog() {
  const root = document.getElementById('hfCatalog');
  if (!root) return;

  const paint = (cat: HfCatalog) => {
    const fa = lang() === 'fa';
    root.innerHTML = cat.modules
      .map((m) => {
        const title = fa ? m.title_fa : m.title_en;
        const blurb = fa ? m.blurb_fa : m.blurb_en;
        return `<div class="content-card related-card">
          <h3>${escapeHtml(title)}</h3>
          <p>${escapeHtml(blurb)}</p>
          <p><a href="${escapeHtml(m.url)}" target="_blank" rel="noopener">${escapeHtml(m.hub)}</a></p>
        </div>`;
      })
      .join('');
  };

  loadHfCatalogClient()
    .then((cat) => {
      paint(cat);
      document.querySelectorAll('.lang-switcher button[data-lang]').forEach((btn) => {
        btn.addEventListener('click', () => setTimeout(() => paint(cat), 0));
      });
    })
    .catch(() => {
      root.innerHTML = `<p>${lang() === 'fa' ? 'کاتالوگ بار نشد.' : 'Catalog failed to load.'}</p>`;
    });
}
