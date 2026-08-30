import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ROOT } from './config.ts';

export const ROLES = ['family', 'medic'] as const;
export type Role = (typeof ROLES)[number];

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export type StoredUser = {
  id: string;
  platform: string;
  role?: Role;
  lang?: 'fa' | 'en';
  displayName?: string;
  invitedBy?: string;
  groupId?: string;
  updatedAt: string;
};

export type StoredGroup = {
  id: string;
  code: string;
  ownerId: string;
  role: Role;
  title: string;
  members: string[];
  createdAt: string;
};

type Db = {
  users: Record<string, StoredUser>;
  groups: Record<string, StoredGroup>;
};

const FILE = path.join(ROOT, 'server', 'data', 'community.json');

function empty(): Db {
  return { users: {}, groups: {} };
}

function load(): Db {
  try {
    if (!fs.existsSync(FILE)) return empty();
    const db = { ...empty(), ...JSON.parse(fs.readFileSync(FILE, 'utf8')) } as Db;
    for (const u of Object.values(db.users)) {
      if (u.role && !isRole(u.role)) delete u.role;
    }
    for (const g of Object.values(db.groups)) {
      if (!isRole(g.role)) g.role = 'family';
    }
    return db;
  } catch {
    return empty();
  }
}

function save(db: Db) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmp, FILE);
}

function code(n = 8) {
  return crypto.randomBytes(8).toString('base64url').replace(/[^a-zA-Z0-9]/g, '').slice(0, n);
}

export function userKey(platform: string, id: string | number) {
  return `${platform}:${id}`;
}

export function getUser(platform: string, id: string | number): StoredUser | undefined {
  return load().users[userKey(platform, id)];
}

export function upsertUser(
  platform: string,
  id: string | number,
  patch: Partial<StoredUser>,
): StoredUser {
  const db = load();
  const key = userKey(platform, id);
  const prev = db.users[key] || {
    id: String(id),
    platform,
    updatedAt: new Date().toISOString(),
  };
  const next: StoredUser = { ...prev, ...patch, id: String(id), platform, updatedAt: new Date().toISOString() };
  db.users[key] = next;
  save(db);
  return next;
}

export function setRole(platform: string, id: string | number, role: Role, displayName?: string) {
  return upsertUser(platform, id, { role, displayName: displayName || getUser(platform, id)?.displayName });
}

export function ensureInviteGroup(opts: {
  platform: string;
  ownerId: string | number;
  role: Role;
  displayName?: string;
}): StoredGroup {
  const db = load();
  const ownerKey = userKey(opts.platform, opts.ownerId);
  const owner = db.users[ownerKey];
  if (owner?.groupId && db.groups[owner.groupId]?.ownerId === ownerKey) {
    const g = db.groups[owner.groupId];
    g.role = opts.role;
    db.groups[g.id] = g;
    save(db);
    return g;
  }
  return createGroup({
    platform: opts.platform,
    ownerId: opts.ownerId,
    role: opts.role,
    title: `${opts.displayName || 'group'} · ${opts.role}`,
    displayName: opts.displayName,
  });
}

export function createGroup(opts: {
  platform: string;
  ownerId: string | number;
  role: Role;
  title: string;
  displayName?: string;
}): StoredGroup {
  const db = load();
  const ownerKey = userKey(opts.platform, opts.ownerId);
  const owner = db.users[ownerKey] || {
    id: String(opts.ownerId),
    platform: opts.platform,
    updatedAt: new Date().toISOString(),
  };
  const group: StoredGroup = {
    id: crypto.randomUUID(),
    code: code(8),
    ownerId: ownerKey,
    role: opts.role,
    title: opts.title.slice(0, 80),
    members: [ownerKey],
    createdAt: new Date().toISOString(),
  };
  owner.role = opts.role;
  owner.groupId = group.id;
  owner.displayName = opts.displayName || owner.displayName;
  owner.updatedAt = new Date().toISOString();
  db.users[ownerKey] = owner;
  db.groups[group.id] = group;
  save(db);
  return group;
}

export function findGroupByCode(codeValue: string): StoredGroup | undefined {
  const db = load();
  return Object.values(db.groups).find((g) => g.code === codeValue);
}

export function getGroup(id: string): StoredGroup | undefined {
  return load().groups[id];
}

export function joinByCode(
  platform: string,
  id: string | number,
  codeValue: string,
  displayName?: string,
): { group: StoredGroup; role: Role } | null {
  const db = load();
  const group = Object.values(db.groups).find((g) => g.code === codeValue);
  if (!group) return null;
  const key = userKey(platform, id);
  const user = db.users[key] || {
    id: String(id),
    platform,
    updatedAt: new Date().toISOString(),
  };
  user.role = group.role;
  user.groupId = group.id;
  user.invitedBy = group.ownerId;
  user.displayName = displayName || user.displayName;
  user.updatedAt = new Date().toISOString();
  if (!group.members.includes(key)) group.members.push(key);
  db.users[key] = user;
  db.groups[group.id] = group;
  save(db);
  return { group, role: group.role };
}

export function leaveGroup(platform: string, id: string | number) {
  const db = load();
  const key = userKey(platform, id);
  const user = db.users[key];
  if (!user?.groupId) return;
  const group = db.groups[user.groupId];
  if (group) {
    group.members = group.members.filter((m) => m !== key);
    db.groups[group.id] = group;
  }
  user.groupId = undefined;
  user.updatedAt = new Date().toISOString();
  db.users[key] = user;
  save(db);
}

export function groupMembers(group: StoredGroup): StoredUser[] {
  const db = load();
  return group.members.map((k) => db.users[k]).filter(Boolean);
}

export function stats() {
  const db = load();
  const roles: Record<string, number> = { family: 0, medic: 0 };
  for (const u of Object.values(db.users)) {
    if (u.role) roles[u.role] = (roles[u.role] || 0) + 1;
  }
  return { users: Object.keys(db.users).length, groups: Object.keys(db.groups).length, roles };
}
