import { formatHfPlain, loadHfCatalogClient } from './hf-catalog-ui';

const API_KEY_STORAGE = 'GEMINI_API_KEY';

type Lang = 'fa' | 'en';
type Mode = 'ask' | 'grant' | 'rfp' | 'patent' | 'academic' | 'biz' | 'hf';

const copy = {
  fa: {
    title: 'ربات FindExpert',
    subtitle: '@FindExperts_bot',
    open: 'چت با ربات',
    close: 'بستن',
    telegram: 'تلگرام',
    placeholder: 'پیام خود را بنویسید…',
    send: 'ارسال',
    hello:
      'سلام 👋 من ربات FindExpert.ir هستم — همان منوی تلگرام، اینجا در یک پنجره.\nیک دکمه را بزنید یا سوال بپرسید.',
    thinking: 'در حال پاسخ…',
    needKey: 'برای پاسخ هوش مصنوعی، کلید Gemini را در بالای صفحه ذخیره کنید — یا در تلگرام ادامه دهید.',
    error: 'خطایی رخ داد. دوباره تلاش کنید یا در تلگرام باز کنید.',
    grant: '🌱 گرنت',
    rfp: '📋 فراخوان',
    patent: '💡 پتنت',
    academic: '🎓 مقاله',
    biz: '📊 کسب‌وکار',
    hf: '🤗 هاگینگ‌فیس',
    ask: '❓ بپرس',
    grantHint: 'موضوع پروژه را بنویسید تا گرنت پیدا شود.',
    rfpHint: 'تخصص یا ایده را بنویسید تا فراخوان پیدا شود.',
    patentHint: 'ایده اختراع را بنویسید (مسئله + راه‌حل).',
    academicHint: 'عنوان و ایده پژوهش را در یک پیام بنویسید.',
    bizHint: 'عنوان و مدل کسب‌وکار سبز را بنویسید.',
    hfHint: 'کاتالوگ Hugging Face (لینک). موضوع را بنویسید تا فیلتر شود.',
  },
  en: {
    title: 'FindExpert bot',
    subtitle: '@FindExperts_bot',
    open: 'Chat with the bot',
    close: 'Close',
    telegram: 'Telegram',
    placeholder: 'Type a message…',
    send: 'Send',
    hello:
      'Hi 👋 I’m the FindExpert.ir bot — the same Telegram menu, in this window.\nTap a button or ask a question.',
    thinking: 'Thinking…',
    needKey: 'Save a Gemini key in the header to get AI replies — or continue in Telegram.',
    error: 'Something went wrong. Try again or open Telegram.',
    grant: '🌱 Grant',
    rfp: '📋 RFP',
    patent: '💡 Patent',
    academic: '🎓 Academic',
    biz: '📊 Business',
    hf: '🤗 Hugging Face',
    ask: '❓ Ask',
    grantHint: 'Send a project topic to find grants.',
    rfpHint: 'Send your expertise or idea to find RFPs.',
    patentHint: 'Describe the invention (problem + solution).',
    academicHint: 'Send the paper title and research idea in one message.',
    bizHint: 'Send the green venture title and model.',
    hfHint: 'Hugging Face catalog (links). Send a topic to filter.',
  },
};

function lang(): Lang {
  return document.body.classList.contains('lang-en') ? 'en' : 'fa';
}

function t(key: keyof typeof copy.fa) {
  return copy[lang()][key];
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getApiKey() {
  const fromEnv = String(process.env.API_KEY || process.env.GEMINI_API_KEY || '').trim();
  if (fromEnv) return fromEnv;
  try {
    return (localStorage.getItem(API_KEY_STORAGE) || '').trim();
  } catch {
    return '';
  }
}

async function postJson(url: string, body: Record<string, unknown>) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

function formatList(items: any[], kind: 'grant' | 'rfp') {
  if (!items?.length) return lang() === 'fa' ? 'نتیجه‌ای پیدا نشد.' : 'No results.';
  return items
    .slice(0, 5)
    .map((item, i) => {
      const title = item.title || '';
      const org = item.organization || item.issuingOrganization || '';
      const extra = [item.deadline, item.fundingAmount].filter(Boolean).join(' · ');
      const link = /^https?:\/\//i.test(String(item.link || '')) ? item.link : '';
      return `${i + 1}. ${title}${org ? `\n${org}` : ''}${extra ? `\n${extra}` : ''}${
        item.summary ? `\n${item.summary}` : ''
      }${link ? `\n${link}` : ''}`;
    })
    .join('\n\n');
}

export function initChatWidget() {
  if (document.getElementById('eco-chat')) return;

  const root = document.createElement('div');
  root.id = 'eco-chat';
  root.innerHTML = `
    <button type="button" class="eco-chat-fab" id="ecoChatFab" aria-label="Open bot">
      <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
    </button>
    <div class="eco-chat-window" id="ecoChatWindow" hidden>
      <div class="eco-chat-head">
        <div>
          <strong id="ecoChatTitle"></strong>
          <span id="ecoChatSub"></span>
        </div>
        <div class="eco-chat-head-actions">
          <a id="ecoChatTelegram" href="https://t.me/FindExperts_bot" target="_blank" rel="noopener"></a>
          <button type="button" id="ecoChatClose" aria-label="Close">×</button>
        </div>
      </div>
      <div class="eco-chat-log" id="ecoChatLog"></div>
      <div class="eco-chat-chips" id="ecoChatChips"></div>
      <form class="eco-chat-form" id="ecoChatForm">
        <input id="ecoChatInput" autocomplete="off" />
        <button type="submit" id="ecoChatSend"></button>
      </form>
    </div>
  `;
  document.body.appendChild(root);

  const fab = document.getElementById('ecoChatFab') as HTMLButtonElement;
  const win = document.getElementById('ecoChatWindow') as HTMLDivElement;
  const log = document.getElementById('ecoChatLog') as HTMLDivElement;
  const chips = document.getElementById('ecoChatChips') as HTMLDivElement;
  const form = document.getElementById('ecoChatForm') as HTMLFormElement;
  const input = document.getElementById('ecoChatInput') as HTMLInputElement;
  const sendBtn = document.getElementById('ecoChatSend') as HTMLButtonElement;
  const closeBtn = document.getElementById('ecoChatClose') as HTMLButtonElement;
  const titleEl = document.getElementById('ecoChatTitle') as HTMLElement;
  const subEl = document.getElementById('ecoChatSub') as HTMLElement;
  const tg = document.getElementById('ecoChatTelegram') as HTMLAnchorElement;

  let mode: Mode = 'ask';
  let greeted = false;

  function addMsg(text: string, who: 'bot' | 'user') {
    const div = document.createElement('div');
    div.className = `eco-chat-msg ${who}`;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }

  function paint() {
    titleEl.textContent = t('title');
    subEl.textContent = t('subtitle');
    tg.textContent = t('telegram');
    closeBtn.setAttribute('aria-label', t('close'));
    fab.setAttribute('aria-label', t('open'));
    input.placeholder = t('placeholder');
    sendBtn.textContent = t('send');
    chips.innerHTML = '';
    const buttons: { mode: Mode; label: keyof typeof copy.fa }[] = [
      { mode: 'grant', label: 'grant' },
      { mode: 'rfp', label: 'rfp' },
      { mode: 'patent', label: 'patent' },
      { mode: 'academic', label: 'academic' },
      { mode: 'biz', label: 'biz' },
      { mode: 'hf', label: 'hf' },
      { mode: 'ask', label: 'ask' },
    ];
    for (const b of buttons) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = mode === b.mode ? 'active' : '';
      btn.textContent = t(b.label);
      btn.addEventListener('click', () => {
        mode = b.mode;
        paint();
        const hints: Record<Mode, keyof typeof copy.fa> = {
          ask: 'hello',
          grant: 'grantHint',
          rfp: 'rfpHint',
          patent: 'patentHint',
          academic: 'academicHint',
          biz: 'bizHint',
          hf: 'hfHint',
        };
        if (b.mode !== 'ask') addMsg(t(hints[b.mode]), 'bot');
        if (b.mode === 'hf') {
          loadHfCatalogClient()
            .then((cat) => addMsg(formatHfPlain(cat, lang()), 'bot'))
            .catch(() => addMsg(t('error'), 'bot'));
        }
      });
      chips.appendChild(btn);
    }
  }

  function open() {
    win.hidden = false;
    fab.hidden = true;
    paint();
    if (!greeted) {
      addMsg(t('hello'), 'bot');
      greeted = true;
    }
    input.focus();
  }

  function close() {
    win.hidden = true;
    fab.hidden = false;
  }

  async function reply(text: string) {
    addMsg(text, 'user');
    addMsg(t('thinking'), 'bot');
    const pending = log.lastElementChild as HTMLElement;
    const currentLang = lang();
    try {
      let out = '';
      if (mode === 'grant') {
        const data = await postJson('/api/grants', { query: text, lang: currentLang });
        out = formatList(data.results || [], 'grant');
      } else if (mode === 'rfp') {
        const data = await postJson('/api/rfps', { query: text, lang: currentLang });
        out = formatList(data.results || [], 'rfp');
      } else if (mode === 'patent') {
        const data = await postJson('/api/patent', { idea: text, section: 'full_draft', lang: currentLang });
        out = data.text || '';
      } else if (mode === 'academic') {
        const data = await postJson('/api/academic', {
          title: text.slice(0, 120),
          overview: text,
          section: 'research_proposal',
          style: 'IEEE',
          lang: currentLang,
        });
        out = data.text || '';
      } else if (mode === 'biz') {
        const data = await postJson('/api/business-plan', {
          title: text.slice(0, 120),
          overview: text,
          section: 'full_plan',
          lang: currentLang,
        });
        out = data.text || '';
      } else {
        const data = await postJson('/api/ask', { query: text, lang: currentLang });
        out = data.text || '';
      }
      pending.textContent = out || t('error');
    } catch (err: any) {
      const msg = String(err?.message || '');
      if (msg.includes('GEMINI_API_KEY') || (!getApiKey() && msg)) pending.textContent = t('needKey');
      else pending.textContent = t('error');
    }
    log.scrollTop = log.scrollHeight;
  }

  fab.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  document.getElementById('openSiteChatBtn')?.addEventListener('click', open);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    reply(text);
  });
  document.querySelectorAll('.lang-switcher button[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => setTimeout(paint, 0));
  });

  fetch('/api/bots')
    .then((r) => r.json())
    .then((info) => {
      if (info.telegram?.link) {
        tg.href = info.telegram.link;
        const pageLink = document.getElementById('telegramBotLink') as HTMLAnchorElement | null;
        if (pageLink) pageLink.href = info.telegram.link;
      }
    })
    .catch(() => {});

  paint();
}
