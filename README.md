<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# FindExpert.ir ecoAI — Environmental Assistant

AI-powered helper for university–industry collaboration: grant search, RFP discovery, proposal / patent / academic / business-plan drafting, grant analysis, and short video generation.

Related modules (prompt contracts from [Green Hope](https://github.com/Websites-by-AI/green-hope-fire-jugle-pages); wildfire/FIRMS/Sentinel-2 as **research context** from [SatelliteVu hackathon](https://github.com/Websites-by-AI/Wildfires-SatelliteVu-AWS-Disaster-Response-Hackathon) — models are not vendored into this Node app):

- Patent draft + prior-art search
- Academic paper / research proposal (IEEE, Nature, Springer, MDPI; optional LaTeX)
- Green / دانش‌بنیان business plan

Originally exported from [Google AI Studio](https://ai.studio/apps/drive/1qV3vsr0rn2TSIm4kP0trJ5Tvt_S2waZS). This checkout is patched so it runs locally with Vite instead of only inside AI Studio.

## Run locally

**Prerequisites:** Node.js 18+

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add a Gemini API key (either method works):

   - Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY=...`
   - Or paste the key in the header of the running app and click **Save**

   Get a key at https://aistudio.google.com/apikey

3. Start the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000

## What was broken (and fixed)

- Vite blocked preview hosts (`server.allowedHosts`)
- `index.html` loaded `index.tsx` twice and requested a missing `/index.css`
- Import map fought Vite’s module resolution
- No API key locally (`process.env.API_KEY` was `undefined`; `window.aistudio` only exists in AI Studio)
- Accordion `max-height` clipped search results
- Grant URL field was `readonly`, so “Adopt Grant” could not be used by itself
- Grant/RFP results were interpolated unsanitized (`innerHTML` XSS)
- PDF export overflowed the page on long text
- Grant/RFP search used JSON schema without web grounding, so results were often invented

## Telegram & Bale bots

The same site modules run as a **Telegram** bot and a **[Bale](https://ble.ir)** bot (`https://tapi.bale.ai`, Telegram-compatible).

Reply keyboard:

| Button | Module |
| --- | --- |
| Grant finder | Environmental grant search |
| RFP finder | Calls for proposals |
| Proposal draft | Section-by-section writing |
| Analyze grant | URL summary |
| Ask AI | Custom search |
| Project reports | Document / slide links |

Inline buttons open source URLs and “Analyze this grant”. Admins can run `/digest` to push a roundup to channels. A scheduler posts automatically every `CHANNEL_POST_INTERVAL_MINUTES` (default 6 hours).

1. Create bots: Telegram [@BotFather](https://t.me/BotFather), Bale [@botfather](https://ble.ir/botfather)
2. Add each bot as **admin** of your channel
3. Fill `.env.local` (see `.env.example`)
4. Start bots:

   ```bash
   npm install
   npm run dev:bots
   ```

   Or site + bots together: `npm run dev:all`

5. Open `/admin` on port 8787 (or via the Vite proxy) to check status and **post now**

Without tokens the bot server still starts; menus and channel posting activate once tokens and channel IDs are set.

## Notes

- Video generation needs a key that can call Veo (`veo-3.1-fast-generate-preview`). A standard Gemini key may not have that quota.
- Default language is Persian (`fa`); switch to English in the header.
