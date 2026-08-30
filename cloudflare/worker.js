/**
 * Cloudflare Worker host for @FindExperts_bot
 * Stays up when the Arena/Node "gate" stops. Uses KV as the community database.
 *
 * Secrets: TELEGRAM_BOT_TOKEN, TELEGRAM_BOT_USERNAME
 * Optional: GEMINI_API_KEY, BACKEND_URL (Node 8787 if still online)
 * KV: COMMUNITY
 *
 * Deploy: npx wrangler deploy --config wrangler.bot.toml
 * Then: setWebhook https://<worker>.workers.dev/webhook/telegram
 */

const ROLES = ['family', 'medic'];

function tgApi(token, method, body) {
  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => r.json());
}

function clip(text, max = 3900) {
  const s = String(text || '');
  return s.length <= max ? s : `${s.slice(0, max - 16)}\n…`;
}

async function send(token, chatId, text, extra = {}) {
  const payload = { chat_id: chatId, text: clip(text), ...extra };
  return tgApi(token, 'sendMessage', payload);
}

const mainKb = {
  keyboard: [
    [{ text: '🌱 یابنده گرنت' }, { text: '📋 فراخوان‌یاب' }],
    [{ text: '✍️ پیش‌نویس پروپوزال' }, { text: '🔍 تحلیل گرنت' }],
    [{ text: '💡 پیش‌نویس پتنت' }, { text: '🎓 مقاله / پروپوزال علمی' }],
    [{ text: '📊 طرح کسب‌وکار' }, { text: '❓ از هوش مصنوعی بپرس' }],
    [{ text: '🤗 Hugging Face' }, { text: '📄 گزارش‌های پروژه' }],
    [{ text: '👥 نقش و گروه' }, { text: '🔗 لینک دعوت' }],
    [{ text: 'ℹ️ درباره' }, { text: '🇬🇧 English' }],
  ],
  resize_keyboard: true,
};

const roleKb = {
  inline_keyboard: [
    [
      { text: '👨‍👩‍👧‍👦 خانواده', callback_data: 'role:family' },
      { text: '🩺 درمانگر / پزشک', callback_data: 'role:medic' },
    ],
    [
      { text: '🔗 لینک دعوت', callback_data: 'inv:new' },
      { text: '➕ ساخت گروه', callback_data: 'grp:new' },
    ],
  ],
};

async function loadDb(kv) {
  if (!kv) return { users: {}, groups: {} };
  const raw = await kv.get('db');
  if (!raw) return { users: {}, groups: {} };
  try {
    return JSON.parse(raw);
  } catch {
    return { users: {}, groups: {} };
  }
}

async function saveDb(kv, db) {
  if (!kv) return;
  await kv.put('db', JSON.stringify(db));
}

function code() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const token = env.TELEGRAM_BOT_TOKEN || '';
    const username = (env.TELEGRAM_BOT_USERNAME || 'FindExperts_bot').replace(/^@/, '');

    if (url.pathname === '/health' || url.pathname === '/') {
      return Response.json({
        ok: true,
        host: url.host,
        gate: 'cloudflare-worker',
        telegram: Boolean(token),
        kv: Boolean(env.COMMUNITY),
        backend: env.BACKEND_URL || null,
      });
    }

    if (url.pathname === '/webhook/telegram' && request.method === 'POST') {
      const update = await request.json().catch(() => ({}));
      try {
        await handleUpdate(update, env, token, username);
      } catch (err) {
        console.error('webhook', err);
      }
      return new Response('ok');
    }

    if (url.pathname === '/set-webhook' && request.method === 'POST') {
      if (!token) return Response.json({ error: 'no token' }, { status: 500 });
      const hook = `${url.origin}/webhook/telegram`;
      const result = await tgApi(token, 'setWebhook', {
        url: hook,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: false,
      });
      return Response.json({ hook, result });
    }

    return new Response('FindExpert bot worker', { status: 404 });
  },
};

async function handleUpdate(update, env, token, username) {
  if (update.callback_query) {
    const cq = update.callback_query;
    const chatId = cq.message?.chat?.id || cq.from?.id;
    const data = String(cq.data || '');
    await tgApi(token, 'answerCallbackQuery', { callback_query_id: cq.id });
    if (data.startsWith('role:')) {
      const role = data.slice(5);
      if (!ROLES.includes(role)) return;
      await setRole(env, `telegram:${cq.from.id}`, role, cq.from.first_name);
      await send(token, chatId, `نقش ذخیره شد: ${role}\nلینک دعوت همین نقش را به خاطر می‌سپارد.`, {
        reply_markup: mainKb,
      });
      return;
    }
    if (data === 'inv:new') {
      await sendInvite(env, token, username, chatId, cq.from);
      return;
    }
    if (data === 'grp:new') {
      await send(token, chatId, 'یک نام برای گروه بفرستید، یا /group نام');
      return;
    }
    return;
  }

  const message = update.message;
  if (!message?.chat || !message.text) return;
  const chatId = message.chat.id;
  const text = String(message.text).trim();
  const from = message.from || {};
  const key = `telegram:${from.id || chatId}`;

  if (text.startsWith('/start')) {
    const payload = text.split(/\s+/)[1] || '';
    let extra = 'سلام 👋 FindExpert.ir ecoAI — روی Cloudflare روشن است (حتی اگر سرور محلی خاموش باشد).';
    if (payload) {
      const joined = await joinCode(env, key, payload.replace(/^g_?/i, ''), from.first_name);
      extra = joined
        ? `با نقش ${joined.role} وارد گروه «${joined.title}» شدید.`
        : ROLES.includes(payload)
          ? ((await setRole(env, key, payload, from.first_name)), `نقش: ${payload}`)
          : extra;
    }
    await send(token, chatId, extra + '\nاز منو انتخاب کنید.', { reply_markup: mainKb });
    return;
  }

  if (text.startsWith('/role') || text.includes('نقش و گروه')) {
    await send(token, chatId, 'نقش: خانواده یا درمانگر. لینک دعوت همین نقش را نگه می‌دارد. /role برای تغییر.', {
      reply_markup: roleKb,
    });
    return;
  }

  if (text.startsWith('/invite') || text.includes('لینک دعوت')) {
    await sendInvite(env, token, username, chatId, from);
    return;
  }

  if (text.startsWith('/group')) {
    const title = text.replace(/^\/group\s*/i, '').trim() || `${from.first_name || 'group'}`;
    const db = await loadDb(env.COMMUNITY);
    const u = db.users[key];
    if (!u?.role) {
      await send(token, chatId, 'اول نقش را انتخاب کنید.', { reply_markup: roleKb });
      return;
    }
    const g = {
      id: crypto.randomUUID(),
      code: code(),
      ownerId: key,
      role: u.role,
      title: title.slice(0, 80),
      members: [key],
    };
    db.groups[g.id] = g;
    u.groupId = g.id;
    db.users[key] = u;
    await saveDb(env.COMMUNITY, db);
    await send(token, chatId, `گروه ساخته شد.\nhttps://t.me/${username}?start=g${g.code}`, {
      reply_markup: mainKb,
    });
    return;
  }

  if (env.BACKEND_URL) {
    try {
      const res = await fetch(`${env.BACKEND_URL.replace(/\/$/, '')}/webhook/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      if (res.ok) return;
    } catch (err) {
      console.error('backend down', err);
    }
  }

  await send(
    token,
    chatId,
    'ابزار گرنت/پروپوزال روی سرور Gemini است و الان خاموش است. نقش و دعوت روی Cloudflare کار می‌کند. /role /invite',
    { reply_markup: mainKb },
  );
}

async function setRole(env, key, role, name) {
  const db = await loadDb(env.COMMUNITY);
  db.users[key] = {
    ...(db.users[key] || {}),
    id: key,
    role,
    displayName: name,
    updatedAt: new Date().toISOString(),
  };
  await saveDb(env.COMMUNITY, db);
}

async function sendInvite(env, token, username, chatId, from) {
  const key = `telegram:${from.id || chatId}`;
  const db = await loadDb(env.COMMUNITY);
  const u = db.users[key];
  if (!u?.role) {
    await send(token, chatId, 'اول نقش را انتخاب کنید.', { reply_markup: roleKb });
    return;
  }
  let g = Object.values(db.groups).find((x) => x.ownerId === key);
  if (!g) {
    g = {
      id: crypto.randomUUID(),
      code: code(),
      ownerId: key,
      role: u.role,
      title: `${from.first_name || 'group'} · ${u.role}`,
      members: [key],
    };
    db.groups[g.id] = g;
    u.groupId = g.id;
    db.users[key] = u;
    await saveDb(env.COMMUNITY, db);
  }
  await send(
    token,
    chatId,
    `لینک دعوت (نقش ${g.role} در دیتابیس Cloudflare KV ذخیره است):\nhttps://t.me/${username}?start=g${g.code}`,
  );
}

async function joinCode(env, key, raw, name) {
  const db = await loadDb(env.COMMUNITY);
  const g = Object.values(db.groups).find((x) => x.code === raw);
  if (!g) return null;
  db.users[key] = {
    ...(db.users[key] || {}),
    id: key,
    role: g.role,
    groupId: g.id,
    displayName: name,
    invitedBy: g.ownerId,
    updatedAt: new Date().toISOString(),
  };
  if (!g.members.includes(key)) g.members.push(key);
  db.groups[g.id] = g;
  await saveDb(env.COMMUNITY, db);
  return g;
}
