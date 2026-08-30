import { config, baleLink, telegramLink } from '../config.ts';
import { channelDigest, type Grant, type Rfp } from '../ai.ts';
import { escapeHtml, httpLink, Messenger } from './api.ts';
import { t, type Lang } from './i18n.ts';

let telegram: Messenger | null = null;
let bale: Messenger | null = null;

export function attachPublishers(bots: { telegram?: Messenger; bale?: Messenger }) {
  telegram = bots.telegram || null;
  bale = bots.bale || null;
}

function itemLine(title: string, org: string, deadline: string, link: string, i: number) {
  const url = httpLink(link);
  const head = `<b>${i}. ${escapeHtml(title)}</b>`;
  const meta = [org && `🏢 ${escapeHtml(org)}`, deadline && `⏰ ${escapeHtml(deadline)}`].filter(Boolean).join(' · ');
  return [head, meta, url ? `🔗 ${escapeHtml(url)}` : ''].filter(Boolean).join('\n');
}

export function formatDigest(lang: Lang, grants: Grant[], rfps: Rfp[]) {
  const date = new Date().toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-GB');
  const parts = [`${t(lang, 'digestTitle')}\n📅 ${date}`];

  if (grants.length) {
    parts.push(`\n<b>${t(lang, 'digestGrants')}</b>`);
    grants.forEach((g, i) => {
      parts.push(itemLine(g.title, g.organization, g.deadline, g.link, i + 1));
    });
  }
  if (rfps.length) {
    parts.push(`\n<b>${t(lang, 'digestRfps')}</b>`);
    rfps.forEach((r, i) => {
      parts.push(itemLine(r.title, r.issuingOrganization, r.deadline, r.link, i + 1));
    });
  }
  if (!grants.length && !rfps.length) {
    parts.push(`\n${t(lang, 'digestEmpty')}`);
  }

  const bots: string[] = [];
  if (config.telegram.username) bots.push(`Telegram: ${telegramLink()}`);
  if (config.bale.username) bots.push(`Bale: ${baleLink()}`);
  parts.push(`\n${t(lang, 'digestFooter')}`);
  if (bots.length) parts.push(bots.join('\n'));
  parts.push(`🌐 ${config.siteUrl}`);
  return parts.join('\n\n').replace(/\n{3,}/g, '\n\n');
}

export async function publishDigest(lang: Lang = config.defaultLang) {
  const { grants, rfps } = await channelDigest(config.channelTopic, lang);
  const text = formatDigest(lang, grants, rfps);
  const results: { platform: string; chatId: string; ok: boolean; error?: string }[] = [];

  const jobs: { bot: Messenger; channels: string[] }[] = [];
  if (telegram && config.telegram.channels.length) jobs.push({ bot: telegram, channels: config.telegram.channels });
  if (bale && config.bale.channels.length) jobs.push({ bot: bale, channels: config.bale.channels });

  if (!jobs.length) {
    throw new Error('No channel IDs configured (TELEGRAM_CHANNEL_IDS / BALE_CHANNEL_IDS).');
  }

  for (const job of jobs) {
    for (const chatId of job.channels) {
      try {
        await job.bot.send({ chatId, text, parseMode: 'HTML' });
        results.push({ platform: job.bot.platform, chatId, ok: true });
      } catch (err: any) {
        results.push({ platform: job.bot.platform, chatId, ok: false, error: err?.message || String(err) });
      }
    }
  }
  return { text, results, grants: grants.length, rfps: rfps.length };
}

export function startScheduler() {
  const ms = Math.max(30, config.postIntervalMinutes) * 60 * 1000;
  console.log(`[publisher] interval ${config.postIntervalMinutes} min`);
  setInterval(() => {
    publishDigest().then(
      (r) => console.log('[publisher] posted', r.results),
      (err) => console.error('[publisher]', err),
    );
  }, ms);
}
