import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, '..');

function loadDotEnv() {
  for (const name of ['.env.local', '.env']) {
    const file = path.join(ROOT, name);
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

loadDotEnv();

function splitIds(raw: string | undefined): string[] {
  return (raw || '')
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export const config = {
  port: Number(process.env.BOT_PORT || process.env.PORT || 8787),
  publicUrl: process.env.PUBLIC_URL || '',
  geminiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || '',
  siteUrl: process.env.SITE_URL || 'https://findexpert.ir',
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN || '',
    username: process.env.TELEGRAM_BOT_USERNAME || '',
    channels: splitIds(process.env.TELEGRAM_CHANNEL_IDS || process.env.TELEGRAM_CHANNEL_ID),
  },
  bale: {
    token: process.env.BALE_BOT_TOKEN || '',
    username: process.env.BALE_BOT_USERNAME || '',
    channels: splitIds(process.env.BALE_CHANNEL_IDS || process.env.BALE_CHANNEL_ID),
  },
  adminIds: splitIds(process.env.BOT_ADMIN_IDS),
  postIntervalMinutes: Number(process.env.CHANNEL_POST_INTERVAL_MINUTES || 360),
  channelTopic: process.env.CHANNEL_TOPIC || 'environmental grants, university-industry collaboration, green tech, climate, Iran and global funding',
  defaultLang: (process.env.BOT_DEFAULT_LANG === 'en' ? 'en' : 'fa') as 'fa' | 'en',
};

export function telegramLink() {
  const u = config.telegram.username.replace(/^@/, '');
  return u ? `https://t.me/${u}` : 'https://t.me/BotFather';
}

export function baleLink() {
  const u = config.bale.username.replace(/^@/, '');
  return u ? `https://ble.ir/${u}` : 'https://ble.ir';
}
