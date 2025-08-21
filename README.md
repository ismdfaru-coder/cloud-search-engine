# Search Engine Starter (Crawler + Next.js)

A minimal, production-ready starter to launch a small crawling search engine (Google-style UI).

## Features
- Node.js crawler (`scripts/crawl.js`) with axios + cheerio
- Builds `public/index.json` (title, url, content, keywords)
- Next.js API route `/api/search` with simple scoring (title/content + field boosts)
- Fast client search UI with clean, centered layout
- Easy deploy to Vercel/Netlify (no external services)
- Start niche (whitelist seeds), then expand

## Quick Start (Local)

```bash
# 1) Install
npm i

# 2) (Optional) Edit seeds in scripts/seeds.txt
# 3) Crawl whitelisted pages (polite, small-scale)
npm run crawl

# 4) Run dev server
npm run dev
# open http://localhost:3000
```

## Deploy (Live in minutes)

### Vercel (recommended)
1. Create a new Git repo and push this folder.
2. Go to https://vercel.com/new → import your repo.
3. Use defaults. Vercel auto-detects Next.js.
4. Click **Deploy** → You get a live URL.

### Netlify (alternative)
1. New site from Git.
2. Build command: `npm run build`
3. Publish directory: `.next` (Netlify adapter works automatically for Next 14)
   - If needed, use Netlify Next.js plugin.

## How it Works

- `scripts/crawl.js`: Crawls a small whitelist from `scripts/seeds.txt` (respecting same-origin, basic robots, delays).
- Saves normalized text to `public/index.json`.
- `/api/search`: Loads `public/index.json`, scores title + content using keyword frequency and simple boosts.
- `pages/index.jsx`: Search UI (search bar, results list).

## Notes / Limits
- This is a **small-scale** starter to prove the concept.
- Be polite + lawful: obey robots.txt; do not crawl sites that forbid it.
- To scale: add queue/persistence, sitemap parsing, robots.txt parser, dedup, multi-worker, and better ranking (BM25/PageRank).

## Config
- `scripts/seeds.txt` → starting URLs (one per line).
- `scripts/crawl.js` → tune `MAX_PAGES`, `MAX_DEPTH`, `POLITENESS_DELAY_MS`.
- `public/index.json` → your current index.

## License
Apache-2.0
