import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { baleLink, config, telegramLink } from './config.ts';
import { analyzeGrant, askAi, draftProposal, findGrants, findRfps } from './ai.ts';
import { draftAcademic, draftBusinessPlan, draftPatent, searchPriorArt } from './writing.ts';
import { Messenger } from './bot/api.ts';
import { handleUpdate } from './bot/handler.ts';
import { attachPublishers, publishDigest, startScheduler } from './bot/publisher.ts';
import { formatHfCatalog, loadHfCatalog } from './hf.ts';
import { stats as communityStats } from './store.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (_req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

const bots: { telegram?: Messenger; bale?: Messenger } = {};

if (config.telegram.token) bots.telegram = new Messenger('telegram', config.telegram.token);
if (config.bale.token) bots.bale = new Messenger('bale', config.bale.token);
attachPublishers(bots);

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    host: 'node-local',
    gate: config.publicUrl ? 'webhook' : 'long-poll',
    publicUrl: config.publicUrl || null,
    telegram: Boolean(bots.telegram),
    bale: Boolean(bots.bale),
    gemini: Boolean(config.geminiKey),
    telegramChannels: config.telegram.channels.length,
    baleChannels: config.bale.channels.length,
    intervalMin: config.postIntervalMinutes,
    db: 'server/data/community.json',
  });
});

app.get('/api/bots', (_req, res) => {
  res.json({
    telegram: {
      enabled: Boolean(bots.telegram),
      username: config.telegram.username,
      link: config.telegram.username ? telegramLink() : null,
      channels: config.telegram.channels.length,
    },
    bale: {
      enabled: Boolean(bots.bale),
      username: config.bale.username,
      link: config.bale.username ? baleLink() : null,
      channels: config.bale.channels.length,
    },
    gemini: Boolean(config.geminiKey),
  });
});

app.get('/api/community', (_req, res) => {
  res.json(communityStats());
});

app.get('/api/hf', (req, res) => {
  try {
    const lang = req.query.lang === 'en' ? 'en' : 'fa';
    const q = String(req.query.q || '').trim();
    res.json({
      ...loadHfCatalog(),
      text: formatHfCatalog(lang, q),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'failed' });
  }
});

app.post('/api/grants', async (req, res) => {
  try {
    const q = String(req.body?.query || '').trim();
    const lang = req.body?.lang === 'en' ? 'en' : 'fa';
    if (!q) return res.status(400).json({ error: 'query required' });
    res.json({ results: await findGrants(q, lang) });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'failed' });
  }
});

app.post('/api/rfps', async (req, res) => {
  try {
    const q = String(req.body?.query || '').trim();
    const lang = req.body?.lang === 'en' ? 'en' : 'fa';
    if (!q) return res.status(400).json({ error: 'query required' });
    res.json({ results: await findRfps(q, lang) });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'failed' });
  }
});

app.post('/api/proposal', async (req, res) => {
  try {
    res.json({
      text: await draftProposal({
        section: String(req.body?.section || 'full_proposal'),
        title: String(req.body?.title || ''),
        overview: String(req.body?.overview || ''),
        lang: req.body?.lang === 'en' ? 'en' : 'fa',
      }),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'failed' });
  }
});

app.post('/api/analyze', async (req, res) => {
  try {
    const url = String(req.body?.url || '').trim();
    if (!url) return res.status(400).json({ error: 'url required' });
    res.json({
      text: await analyzeGrant(url, String(req.body?.keywords || ''), req.body?.lang === 'en' ? 'en' : 'fa'),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'failed' });
  }
});

app.post('/api/ask', async (req, res) => {
  try {
    const q = String(req.body?.query || req.body?.question || '').trim();
    if (!q) return res.status(400).json({ error: 'query required' });
    res.json({ text: await askAi(q, req.body?.lang === 'en' ? 'en' : 'fa') });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'failed' });
  }
});

app.post('/api/patent', async (req, res) => {
  try {
    const idea = String(req.body?.idea || '').trim();
    if (!idea) return res.status(400).json({ error: 'idea required' });
    res.json({
      text: await draftPatent({
        idea,
        section: String(req.body?.section || 'full_draft'),
        lang: req.body?.lang === 'en' ? 'en' : 'fa',
      }),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'failed' });
  }
});

app.post('/api/prior-art', async (req, res) => {
  try {
    const idea = String(req.body?.idea || '').trim();
    if (!idea) return res.status(400).json({ error: 'idea required' });
    res.json({ results: await searchPriorArt(idea, req.body?.lang === 'en' ? 'en' : 'fa') });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'failed' });
  }
});

app.post('/api/academic', async (req, res) => {
  try {
    const title = String(req.body?.title || '').trim();
    const overview = String(req.body?.overview || '').trim();
    if (!title || !overview) return res.status(400).json({ error: 'title and overview required' });
    res.json({
      text: await draftAcademic({
        title,
        overview,
        section: String(req.body?.section || 'research_proposal'),
        style: String(req.body?.style || 'IEEE'),
        latex: Boolean(req.body?.latex),
        lang: req.body?.lang === 'en' ? 'en' : 'fa',
      }),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'failed' });
  }
});

app.post('/api/business-plan', async (req, res) => {
  try {
    const title = String(req.body?.title || '').trim();
    const overview = String(req.body?.overview || '').trim();
    if (!title || !overview) return res.status(400).json({ error: 'title and overview required' });
    res.json({
      text: await draftBusinessPlan({
        title,
        overview,
        section: String(req.body?.section || 'full_plan'),
        lang: req.body?.lang === 'en' ? 'en' : 'fa',
      }),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'failed' });
  }
});

app.post('/api/publish', async (_req, res) => {
  try {
    res.json(await publishDigest());
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'failed' });
  }
});

app.post('/webhook/telegram', async (req, res) => {
  res.sendStatus(200);
  if (bots.telegram) {
    try {
      await handleUpdate(bots.telegram, req.body);
    } catch (err) {
      console.error('[telegram webhook]', err);
    }
  }
});

app.post('/webhook/bale', async (req, res) => {
  res.sendStatus(200);
  if (bots.bale) {
    try {
      await handleUpdate(bots.bale, req.body);
    } catch (err) {
      console.error('[bale webhook]', err);
    }
  }
});

app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.use('/admin-static', express.static(path.join(__dirname, 'public')));

app.listen(config.port, '0.0.0.0', () => {
  console.log(`FindExpert bots listening on 0.0.0.0:${config.port}`);
  console.log(`Telegram: ${bots.telegram ? 'token set' : 'disabled'} | Bale: ${bots.bale ? 'token set' : 'disabled'}`);
  if (!config.publicUrl) {
    bots.telegram?.startPolling((u) => handleUpdate(bots.telegram!, u));
    bots.bale?.startPolling((u) => handleUpdate(bots.bale!, u));
    if (bots.telegram || bots.bale) {
      console.log('Long-polling started. Bot STOPS when this host/process stops. Set PUBLIC_URL (Cloudflare Worker) for webhook.');
    }
  } else {
    const hook = `${config.publicUrl.replace(/\/$/, '')}/webhook/telegram`;
    console.log(`Webhook mode: ${hook}`);
    bots.telegram
      ?.call('setWebhook', { url: hook, allowed_updates: ['message', 'callback_query'] })
      .then(() => console.log('Telegram setWebhook ok'))
      .catch((err) => console.error('Telegram setWebhook failed', err));
    if (bots.bale) {
      console.log(`Set Bale webhook to ${config.publicUrl}/webhook/bale`);
    }
  }
  if ((config.telegram.channels.length || config.bale.channels.length) && config.geminiKey) {
    startScheduler();
  }
});
