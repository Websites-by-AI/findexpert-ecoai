function emptyDb() {
  return { users: {}, groups: {} };
}

async function loadDb(kv) {
  if (!kv) return emptyDb();
  const raw = await kv.get('db');
  if (!raw) return emptyDb();
  try {
    const db = JSON.parse(raw);
    return { users: db.users || {}, groups: db.groups || {} };
  } catch {
    return emptyDb();
  }
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const kv = context.env.COMMUNITY;
  const db = await loadDb(kv);
  const users = Object.keys(db.users).length;
  const groups = Object.keys(db.groups).length;
  const payload = {
    ok: true,
    host: 'cloudflare-pages',
    db: kv ? 'kv' : 'not-bound',
    durable: Boolean(kv),
    backup: '/api/community/backup',
    users,
    groups,
    roles: ['family', 'medic'],
  };
  if (url.searchParams.get('full') === '1') payload.data = db;
  return Response.json(payload, {
    headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' },
  });
}
