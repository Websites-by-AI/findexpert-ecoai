export async function onRequestGet(context) {
  const db = context.env.DB;
  if (!db) {
    return Response.json({ ok: true, host: 'cloudflare-pages', db: 'not-bound', users: 0, groups: 0 });
  }
  const users = await db.prepare('SELECT COUNT(*) AS n FROM users').first();
  const groups = await db.prepare('SELECT COUNT(*) AS n FROM groups').first();
  return Response.json({
    ok: true,
    host: 'cloudflare-pages',
    db: 'd1',
    users: users?.n || 0,
    groups: groups?.n || 0,
  });
}
