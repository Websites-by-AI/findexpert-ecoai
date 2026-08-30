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

export async function onRequestGet(context) {
  const db = await loadDb(context.env.COMMUNITY);
  const body = JSON.stringify(
    {
      kind: 'findexpert-community',
      savedAt: new Date().toISOString(),
      host: 'cloudflare-kv',
      ...db,
    },
    null,
    2
  );
  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="community-backup.json"',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
