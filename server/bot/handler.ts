import { config } from '../config.ts';
import { analyzeGrant, askAi, draftProposal, findGrants, findRfps, type Grant, type Rfp } from '../ai.ts';
import { draftAcademic, draftBusinessPlan, draftPatent, searchPriorArt } from '../writing.ts';
import { Messenger, escapeHtml, httpLink, type InlineButton } from './api.ts';
import { REPORTS, t, type Lang } from './i18n.ts';
import {
  academicSectionKeyboard,
  bizSectionKeyboard,
  cancelKeyboard,
  mainKeyboard,
  matchButton,
  patentSectionKeyboard,
  roleKeyboard,
  sectionKeyboard,
} from './menus.ts';
import { publishDigest } from './publisher.ts';
import { formatHfCatalog } from '../hf.ts';
import {
  createGroup,
  ensureInviteGroup,
  findGroupByCode,
  getGroup,
  getUser,
  groupMembers,
  isRole,
  joinByCode,
  leaveGroup,
  setRole,
  type Role,
} from '../store.ts';


type Step =
  | 'idle'
  | 'grant_query'
  | 'rfp_query'
  | 'proposal_title'
  | 'proposal_overview'
  | 'proposal_section'
  | 'analyze_url'
  | 'analyze_keywords'
  | 'ask_ai'
  | 'patent_idea'
  | 'patent_section'
  | 'academic_title'
  | 'academic_overview'
  | 'academic_section'
  | 'biz_title'
  | 'biz_overview'
  | 'biz_section'
  | 'hf_filter'
  | 'group_title';

type Session = {
  lang: Lang;
  step: Step;
  title?: string;
  overview?: string;
  url?: string;
  grants: Grant[];
  rfps: Rfp[];
};

const sessions = new Map<string, Session>();

function keyOf(platform: string, chatId: string | number) {
  return `${platform}:${chatId}`;
}

function session(platform: string, chatId: string | number): Session {
  const key = keyOf(platform, chatId);
  let s = sessions.get(key);
  if (!s) {
    s = { lang: config.defaultLang, step: 'idle', grants: [], rfps: [] };
    sessions.set(key, s);
  }
  return s;
}

function isAdmin(userId?: number | string) {
  if (!config.adminIds.length) return true;
  return config.adminIds.includes(String(userId || ''));
}

function grantText(g: Grant, lang: Lang, i: number) {
  const link = httpLink(g.link);
  return [
    `<b>${i}. ${escapeHtml(g.title || t(lang, 'grantCard'))}</b>`,
    g.organization ? `🏢 ${escapeHtml(g.organization)}` : '',
    g.deadline ? `⏰ ${escapeHtml(g.deadline)}` : '',
    g.fundingAmount ? `💰 ${escapeHtml(g.fundingAmount)}` : '',
    g.eligibility ? `✅ ${escapeHtml(g.eligibility)}` : '',
    g.summary ? `\n${escapeHtml(g.summary)}` : '',
    link ? `\n🔗 ${escapeHtml(link)}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function rfpText(r: Rfp, lang: Lang, i: number) {
  const link = httpLink(r.link);
  return [
    `<b>${i}. ${escapeHtml(r.title || t(lang, 'rfpCard'))}</b>`,
    r.issuingOrganization ? `🏢 ${escapeHtml(r.issuingOrganization)}` : '',
    r.deadline ? `⏰ ${escapeHtml(r.deadline)}` : '',
    r.eligibility ? `✅ ${escapeHtml(r.eligibility)}` : '',
    r.summary ? `\n${escapeHtml(r.summary)}` : '',
    link ? `\n🔗 ${escapeHtml(link)}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function grantButtons(g: Grant, lang: Lang, i: number): InlineButton[] {
  const row: InlineButton[] = [];
  const link = httpLink(g.link);
  if (link) row.push({ text: t(lang, 'open'), url: link });
  row.push({ text: t(lang, 'adopt'), callback_data: `adopt:${i}` });
  return row;
}

async function showMenu(bot: Messenger, chatId: string | number, s: Session, extra = '') {
  s.step = 'idle';
  await bot.send({
    chatId,
    text: extra ? `${extra}\n\n${t(s.lang, 'choose')}` : `${t(s.lang, 'start')}\n\n${t(s.lang, 'choose')}`,
    parseMode: 'HTML',
    replyKeyboard: mainKeyboard(s.lang),
  });
}

async function withStatus(bot: Messenger, chatId: string | number, lang: Lang, statusKey: string, work: () => Promise<void>) {
  await bot.sendChatAction(chatId);
  await bot.send({ chatId, text: t(lang, statusKey) });
  await work();
}

export async function handleUpdate(bot: Messenger, update: any) {
  if (update.callback_query) {
    await handleCallback(bot, update.callback_query);
    return;
  }
  const message = update.message;
  if (!message?.chat) return;
  const chatId = message.chat.id;
  const userId = message.from?.id;
  const text = String(message.text || '').trim();
  if (!text) return;
  const s = session(bot.platform, chatId);

  const fromName = String(message.from?.first_name || message.from?.username || '').slice(0, 40);

  if (text.startsWith('/start')) {
    const payload = text.split(/\s+/)[1] || '';
    const extra = applyStartPayload(bot, chatId, s, payload, fromName);
    await showMenu(bot, chatId, s, extra || undefined);
    return;
  }
  if (text.startsWith('/role') || text.startsWith('/field')) {
    await sendCommunity(bot, chatId, s, fromName);
    return;
  }
  if (text.startsWith('/invite')) {
    await sendInvite(bot, chatId, s, fromName);
    return;
  }
  if (text.startsWith('/group')) {
    const rest = text.replace(/^\/group(@\w+)?\s*/i, '').trim();
    if (rest) {
      await makeGroup(bot, chatId, s, rest, fromName);
    } else {
      s.step = 'group_title';
      await bot.send({ chatId, text: t(s.lang, 'groupAsk'), replyKeyboard: cancelKeyboard(s.lang) });
    }
    return;
  }
  if (text.startsWith('/help')) {
    await bot.send({ chatId, text: t(s.lang, 'help'), replyKeyboard: mainKeyboard(s.lang) });
    return;
  }
  if (text.startsWith('/lang')) {
    s.lang = s.lang === 'fa' ? 'en' : 'fa';
    await showMenu(bot, chatId, s, t(s.lang, 'langSet'));
    return;
  }
  if (text.startsWith('/digest') || text.startsWith('/publish')) {
    if (!isAdmin(userId)) {
      await bot.send({ chatId, text: t(s.lang, 'notAdmin') });
      return;
    }
    await bot.send({ chatId, text: t(s.lang, 'searching') });
    try {
      await publishDigest();
      await bot.send({ chatId, text: t(s.lang, 'published') });
    } catch (err: any) {
      await bot.send({ chatId, text: `${t(s.lang, 'error')}\n${escapeHtml(err?.message || '')}`, parseMode: 'HTML' });
    }
    return;
  }

  const action = matchButton(s.lang, text);
  if (action === 'cancel') {
    await showMenu(bot, chatId, s, t(s.lang, 'cancelled'));
    return;
  }
  if (action === 'lang') {
    s.lang = s.lang === 'fa' ? 'en' : 'fa';
    await showMenu(bot, chatId, s, t(s.lang, 'langSet'));
    return;
  }
  if (action === 'grant') {
    s.step = 'grant_query';
    await bot.send({ chatId, text: t(s.lang, 'grantAsk'), replyKeyboard: cancelKeyboard(s.lang) });
    return;
  }
  if (action === 'rfp') {
    s.step = 'rfp_query';
    await bot.send({ chatId, text: t(s.lang, 'rfpAsk'), replyKeyboard: cancelKeyboard(s.lang) });
    return;
  }
  if (action === 'proposal') {
    s.step = 'proposal_title';
    s.title = s.overview = undefined;
    await bot.send({ chatId, text: t(s.lang, 'proposalTitle'), replyKeyboard: cancelKeyboard(s.lang) });
    return;
  }
  if (action === 'analyze') {
    s.step = 'analyze_url';
    s.url = undefined;
    await bot.send({ chatId, text: t(s.lang, 'analyzeUrl'), replyKeyboard: cancelKeyboard(s.lang) });
    return;
  }
  if (action === 'ask') {
    s.step = 'ask_ai';
    await bot.send({ chatId, text: t(s.lang, 'askAsk'), replyKeyboard: cancelKeyboard(s.lang) });
    return;
  }
  if (action === 'patent') {
    s.step = 'patent_idea';
    s.overview = undefined;
    await bot.send({ chatId, text: t(s.lang, 'patentAsk'), replyKeyboard: cancelKeyboard(s.lang) });
    return;
  }
  if (action === 'academic') {
    s.step = 'academic_title';
    s.title = s.overview = undefined;
    await bot.send({ chatId, text: t(s.lang, 'academicTitle'), replyKeyboard: cancelKeyboard(s.lang) });
    return;
  }
  if (action === 'biz') {
    s.step = 'biz_title';
    s.title = s.overview = undefined;
    await bot.send({ chatId, text: t(s.lang, 'bizTitle'), replyKeyboard: cancelKeyboard(s.lang) });
    return;
  }
  if (action === 'hf') {
    s.step = 'hf_filter';
    const catalog = `${t(s.lang, 'hfAsk')}\n\n${formatHfCatalog(s.lang)}`;
    for (const chunk of clipChunks(catalog, 3500)) {
      await bot.send({
        chatId,
        text: chunk,
        parseMode: 'HTML',
        replyKeyboard: cancelKeyboard(s.lang),
      });
    }
    return;
  }
  if (action === 'community') {
    await sendCommunity(bot, chatId, s, fromName);
    return;
  }
  if (action === 'invite') {
    await sendInvite(bot, chatId, s, fromName);
    return;
  }
  if (action === 'group') {
    s.step = 'group_title';
    await bot.send({ chatId, text: t(s.lang, 'groupAsk'), replyKeyboard: cancelKeyboard(s.lang) });
    return;
  }
  if (action === 'reports') {
    await sendReports(bot, chatId, s);
    return;
  }
  if (action === 'about') {
    await bot.send({
      chatId,
      text: `${t(s.lang, 'about')}\n\n🌐 ${config.siteUrl}`,
      replyKeyboard: mainKeyboard(s.lang),
    });
    return;
  }

  try {
    if (s.step === 'grant_query') {
      await runGrantSearch(bot, chatId, s, text);
      return;
    }
    if (s.step === 'rfp_query') {
      await runRfpSearch(bot, chatId, s, text);
      return;
    }
    if (s.step === 'proposal_title') {
      s.title = text;
      s.step = 'proposal_overview';
      await bot.send({ chatId, text: t(s.lang, 'proposalOverview') });
      return;
    }
    if (s.step === 'proposal_overview') {
      s.overview = text;
      s.step = 'proposal_section';
      await bot.send({
        chatId,
        text: t(s.lang, 'proposalSection'),
        inlineKeyboard: sectionKeyboard(s.lang),
      });
      return;
    }
    if (s.step === 'analyze_url') {
      s.url = text;
      s.step = 'analyze_keywords';
      await bot.send({ chatId, text: t(s.lang, 'analyzeKeywords') });
      return;
    }
    if (s.step === 'analyze_keywords') {
      const keywords = text === '-' ? '' : text;
      await runAnalyze(bot, chatId, s, s.url || '', keywords);
      return;
    }
    if (s.step === 'ask_ai') {
      await runAsk(bot, chatId, s, text);
      return;
    }
    if (s.step === 'patent_idea') {
      s.overview = text;
      s.step = 'patent_section';
      await bot.send({
        chatId,
        text: t(s.lang, 'patentSection'),
        inlineKeyboard: patentSectionKeyboard(s.lang),
      });
      return;
    }
    if (s.step === 'academic_title') {
      s.title = text;
      s.step = 'academic_overview';
      await bot.send({ chatId, text: t(s.lang, 'academicOverview') });
      return;
    }
    if (s.step === 'academic_overview') {
      s.overview = text;
      s.step = 'academic_section';
      await bot.send({
        chatId,
        text: t(s.lang, 'academicSection'),
        inlineKeyboard: academicSectionKeyboard(s.lang),
      });
      return;
    }
    if (s.step === 'biz_title') {
      s.title = text;
      s.step = 'biz_overview';
      await bot.send({ chatId, text: t(s.lang, 'bizOverview') });
      return;
    }
    if (s.step === 'biz_overview') {
      s.overview = text;
      s.step = 'biz_section';
      await bot.send({
        chatId,
        text: t(s.lang, 'bizSection'),
        inlineKeyboard: bizSectionKeyboard(s.lang),
      });
      return;
    }
    if (s.step === 'hf_filter') {
      s.step = 'idle';
      await bot.send({
        chatId,
        text: formatHfCatalog(s.lang, text),
        parseMode: 'HTML',
        replyKeyboard: mainKeyboard(s.lang),
      });
      return;
    }
    if (s.step === 'group_title') {
      await makeGroup(bot, chatId, s, text, fromName);
      return;
    }
  } catch (err: any) {
    console.error(err);
    const msg = String(err?.message || '').includes('GEMINI_API_KEY') ? t(s.lang, 'noKey') : t(s.lang, 'error');
    s.step = 'idle';
    await bot.send({ chatId, text: msg, replyKeyboard: mainKeyboard(s.lang) });
    return;
  }

  await showMenu(bot, chatId, s);
}

async function handleCallback(bot: Messenger, cq: any) {
  const chatId = cq.message?.chat?.id || cq.from?.id;
  const data = String(cq.data || '');
  const s = session(bot.platform, chatId);
  await bot.answerCallback(cq.id);

  if (data.startsWith('sec:')) {
    const section = data.slice(4);
    await withStatus(bot, chatId, s.lang, 'drafting', async () => {
      const draft = await draftProposal({
        section,
        title: s.title || '',
        overview: s.overview || '',
        lang: s.lang,
      });
      s.step = 'idle';
      await bot.send({
        chatId,
        text: clipChunks(draft)[0],
        replyKeyboard: mainKeyboard(s.lang),
      });
    });
    return;
  }

  if (data.startsWith('adopt:')) {
    const idx = Number(data.slice(6));
    const grant = s.grants[idx];
    if (!grant) return;
    const url = httpLink(grant.link);
    if (!url) {
      await bot.send({ chatId, text: t(s.lang, 'empty') });
      return;
    }
    await runAnalyze(bot, chatId, s, url, grant.title || '');
    return;
  }

  if (data.startsWith('pat:')) {
    const section = data.slice(4);
    const idea = s.overview || '';
    await withStatus(bot, chatId, s.lang, 'drafting', async () => {
      if (section === 'prior_art') {
        const hits = await searchPriorArt(idea, s.lang);
        s.step = 'idle';
        const text = hits.length
          ? hits
              .map((h, i) => `${i + 1}. ${h.title || ''} ${h.patentNumber || ''}\n${h.noveltyTip || ''}\n${h.link || ''}`)
              .join('\n\n')
          : t(s.lang, 'empty');
        await bot.send({ chatId, text, replyKeyboard: mainKeyboard(s.lang) });
        return;
      }
      const draft = await draftPatent({ idea, section, lang: s.lang });
      s.step = 'idle';
      await bot.send({ chatId, text: clipChunks(draft)[0], replyKeyboard: mainKeyboard(s.lang) });
    });
    return;
  }

  if (data.startsWith('acad:')) {
    const section = data.slice(5);
    await withStatus(bot, chatId, s.lang, 'drafting', async () => {
      const draft = await draftAcademic({
        title: s.title || '',
        overview: s.overview || '',
        section,
        style: 'IEEE',
        latex: false,
        lang: s.lang,
      });
      s.step = 'idle';
      await bot.send({ chatId, text: clipChunks(draft)[0], replyKeyboard: mainKeyboard(s.lang) });
    });
    return;
  }

  if (data.startsWith('role:')) {
    const role = data.slice(5);
    if (!isRole(role)) return;
    const name = String(cq.from?.first_name || '').slice(0, 40);
    setRole(bot.platform, cq.from?.id || chatId, role, name);
    await bot.send({
      chatId,
      text: `${t(s.lang, 'roleSet')} ${roleLabel(s.lang, role)}\n${t(s.lang, 'communityDisclaimer')}`,
      replyKeyboard: mainKeyboard(s.lang),
    });
    return;
  }
  if (data === 'inv:new') {
    await sendInvite(bot, chatId, s, String(cq.from?.first_name || ''));
    return;
  }
  if (data === 'grp:new') {
    s.step = 'group_title';
    await bot.send({ chatId, text: t(s.lang, 'groupAsk'), replyKeyboard: cancelKeyboard(s.lang) });
    return;
  }
  if (data === 'grp:show') {
    await sendMyGroup(bot, chatId, s);
    return;
  }
  if (data === 'grp:leave') {
    leaveGroup(bot.platform, cq.from?.id || chatId);
    await bot.send({ chatId, text: t(s.lang, 'groupLeft'), replyKeyboard: mainKeyboard(s.lang) });
    return;
  }

  if (data.startsWith('biz:')) {
    const section = data.slice(4);
    await withStatus(bot, chatId, s.lang, 'drafting', async () => {
      const draft = await draftBusinessPlan({
        title: s.title || '',
        overview: s.overview || '',
        section,
        lang: s.lang,
      });
      s.step = 'idle';
      await bot.send({ chatId, text: clipChunks(draft)[0], replyKeyboard: mainKeyboard(s.lang) });
    });
  }
}

async function runGrantSearch(bot: Messenger, chatId: string | number, s: Session, query: string) {
  await withStatus(bot, chatId, s.lang, 'searching', async () => {
    const grants = await findGrants(query, s.lang);
    s.grants = grants;
    s.step = 'idle';
    if (!grants.length) {
      await bot.send({ chatId, text: t(s.lang, 'empty'), replyKeyboard: mainKeyboard(s.lang) });
      return;
    }
    for (let i = 0; i < grants.length; i++) {
      await bot.send({
        chatId,
        text: grantText(grants[i], s.lang, i + 1),
        parseMode: 'HTML',
        inlineKeyboard: [grantButtons(grants[i], s.lang, i)],
      });
    }
    await bot.send({ chatId, text: t(s.lang, 'choose'), replyKeyboard: mainKeyboard(s.lang) });
  });
}

async function runRfpSearch(bot: Messenger, chatId: string | number, s: Session, query: string) {
  await withStatus(bot, chatId, s.lang, 'searching', async () => {
    const rfps = await findRfps(query, s.lang);
    s.rfps = rfps;
    s.step = 'idle';
    if (!rfps.length) {
      await bot.send({ chatId, text: t(s.lang, 'empty'), replyKeyboard: mainKeyboard(s.lang) });
      return;
    }
    for (let i = 0; i < rfps.length; i++) {
      const link = httpLink(rfps[i].link);
      await bot.send({
        chatId,
        text: rfpText(rfps[i], s.lang, i + 1),
        parseMode: 'HTML',
        inlineKeyboard: link ? [[{ text: t(s.lang, 'open'), url: link }]] : undefined,
      });
    }
    await bot.send({ chatId, text: t(s.lang, 'choose'), replyKeyboard: mainKeyboard(s.lang) });
  });
}

async function runAnalyze(bot: Messenger, chatId: string | number, s: Session, url: string, keywords: string) {
  await withStatus(bot, chatId, s.lang, 'analyzing', async () => {
    const analysis = await analyzeGrant(url, keywords, s.lang);
    s.step = 'idle';
    for (const chunk of clipChunks(analysis)) {
      await bot.send({ chatId, text: chunk, replyKeyboard: mainKeyboard(s.lang) });
    }
  });
}

async function runAsk(bot: Messenger, chatId: string | number, s: Session, question: string) {
  await withStatus(bot, chatId, s.lang, 'thinking', async () => {
    const answer = await askAi(question, s.lang);
    s.step = 'idle';
    for (const chunk of clipChunks(answer)) {
      await bot.send({ chatId, text: chunk, replyKeyboard: mainKeyboard(s.lang) });
    }
  });
}

async function sendReports(bot: Messenger, chatId: string | number, s: Session) {
  const rows: InlineButton[][] = REPORTS.map((r) => [
    { text: `${t(s.lang, r.key)} · Doc`, url: r.doc },
    { text: 'Slides', url: r.slides },
  ]);
  await bot.send({
    chatId,
    text: t(s.lang, 'reports'),
    inlineKeyboard: rows,
    replyKeyboard: mainKeyboard(s.lang),
  });
}


function roleLabel(lang: Lang, role: Role) {
  if (role === 'medic') return t(lang, 'roleMedic');
  return t(lang, 'roleFamily');
}

function inviteUrl(groupCode: string) {
  const u = (config.telegram.username || 'FindExperts_bot').replace(/^@/, '');
  return `https://t.me/${u}?start=g${groupCode}`;
}

function applyStartPayload(
  bot: Messenger,
  chatId: string | number,
  s: Session,
  payload: string,
  fromName: string,
): string {
  if (!payload) return '';
  const asRole = payload.replace(/^role_?/i, '');
  if (isRole(payload) || isRole(asRole)) {
    const role = (isRole(payload) ? payload : asRole) as Role;
    setRole(bot.platform, chatId, role, fromName);
    return `${t(s.lang, 'roleSet')} ${roleLabel(s.lang, role)}`;
  }
  const raw = payload.replace(/^g_?/i, '');
  const joined = joinByCode(bot.platform, chatId, raw, fromName);
  if (!joined) return t(s.lang, 'badInvite');
  return `${t(s.lang, 'joinedGroup')}\n${escapeHtml(joined.group.title)} · ${roleLabel(s.lang, joined.role)}\n${t(s.lang, 'communityDisclaimer')}`;
}

async function sendCommunity(bot: Messenger, chatId: string | number, s: Session, fromName: string) {
  const u = getUser(bot.platform, chatId);
  const current = u?.role ? roleLabel(s.lang, u.role) : '—';
  await bot.send({
    chatId,
    text: `${t(s.lang, 'communityAsk')}\n\n${current}\n${t(s.lang, 'communityDisclaimer')}`,
    inlineKeyboard: roleKeyboard(s.lang),
    replyKeyboard: mainKeyboard(s.lang),
  });
  void fromName;
}

async function sendInvite(bot: Messenger, chatId: string | number, s: Session, fromName: string) {
  const u = getUser(bot.platform, chatId);
  if (!u?.role) {
    await bot.send({
      chatId,
      text: t(s.lang, 'roleNeed'),
      inlineKeyboard: roleKeyboard(s.lang),
    });
    return;
  }
  const group = ensureInviteGroup({
    platform: bot.platform,
    ownerId: chatId,
    role: u.role,
    displayName: fromName,
  });
  await bot.send({
    chatId,
    text: `${t(s.lang, 'inviteText')}\n${roleLabel(s.lang, group.role)}\n\n${inviteUrl(group.code)}`,
    replyKeyboard: mainKeyboard(s.lang),
  });
}

async function makeGroup(bot: Messenger, chatId: string | number, s: Session, title: string, fromName: string) {
  const u = getUser(bot.platform, chatId);
  if (!u?.role) {
    s.step = 'idle';
    await bot.send({
      chatId,
      text: t(s.lang, 'roleNeed'),
      inlineKeyboard: roleKeyboard(s.lang),
      replyKeyboard: mainKeyboard(s.lang),
    });
    return;
  }
  const group = createGroup({
    platform: bot.platform,
    ownerId: chatId,
    role: u.role,
    title,
    displayName: fromName,
  });
  s.step = 'idle';
  await bot.send({
    chatId,
    text: `${t(s.lang, 'groupMade')}\n<b>${escapeHtml(group.title)}</b> · ${roleLabel(s.lang, group.role)}\n${inviteUrl(group.code)}`,
    parseMode: 'HTML',
    replyKeyboard: mainKeyboard(s.lang),
  });
}

async function sendMyGroup(bot: Messenger, chatId: string | number, s: Session) {
  const u = getUser(bot.platform, chatId);
  const group = u?.groupId ? getGroup(u.groupId) : undefined;
  if (!group) {
    await bot.send({ chatId, text: t(s.lang, 'groupNone'), inlineKeyboard: roleKeyboard(s.lang) });
    return;
  }
  const names = groupMembers(group)
    .map((m) => escapeHtml(m.displayName || '·'))
    .slice(0, 30)
    .join(', ');
  await bot.send({
    chatId,
    text: `<b>${escapeHtml(group.title)}</b>\n${roleLabel(s.lang, group.role)}\n${inviteUrl(group.code)}\n${names || '—'}`,
    parseMode: 'HTML',
    replyKeyboard: mainKeyboard(s.lang),
  });
}

function clipChunks(text: string, max = 3500) {
  const clean = text.trim() || '—';
  if (clean.length <= max) return [clean];
  const parts: string[] = [];
  let rest = clean;
  while (rest.length) {
    parts.push(rest.slice(0, max));
    rest = rest.slice(max);
  }
  return parts.slice(0, 4);
}

export { grantText, rfpText };
