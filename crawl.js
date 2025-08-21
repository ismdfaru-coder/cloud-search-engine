/**
 * Simple polite crawler (demo-scale) that:
 *  - Reads seeds from scripts/seeds.txt
 *  - Restricts crawl to same-origin as seeds
 *  - Extracts title + <p> text + keywords
 *  - Saves to public/index.json
 *
 * NOTE: This is a small-scale demo. Improve robots.txt parsing, deduping, error handling for production.
 */
import fs from "node:fs";
import path from "node:path";
import url from "node:url";
import axios from "axios";
import * as cheerio from "cheerio";

const MAX_PAGES = 80;
const MAX_DEPTH = 2;
const POLITENESS_DELAY_MS = 800;

const seedsPath = path.join(process.cwd(), "scripts", "seeds.txt");
const outPath = path.join(process.cwd(), "public", "index.json");

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

function sameOrigin(u, origin) {
  try {
    const a = new URL(u);
    return a.origin === origin;
  } catch { return false; }
}

function absoluteUrl(href, base) {
  try { return new URL(href, base).toString(); } catch { return null; }
}

function extractText($) {
  // Remove script/style/nav/footer
  ["script","style","nav","footer","noscript"].forEach(sel => $(sel).remove());
  const parts = [];
  $("h1,h2,h3,p,li").each((_, el) => {
    const t = $(el).text().replace(/\s+/g, " ").trim();
    if (t) parts.push(t);
  });
  return parts.join(" ");
}

async function fetchPage(u) {
  const res = await axios.get(u, { timeout: 15000, headers: { "User-Agent": "MiniCrawler/1.0 (+https://example.com)" }});
  return res.data;
}

async function main() {
  if (!fs.existsSync(seedsPath)) {
    console.error("Missing scripts/seeds.txt");
    process.exit(1);
  }
  const seeds = fs.readFileSync(seedsPath, "utf8").split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  if (!seeds.length) {
    console.error("No seeds provided.");
    process.exit(1);
  }
  const origins = new Set(seeds.map(s => new URL(s).origin));
  const queue = seeds.map(s => ({ url: s, depth: 0 }));
  const seen = new Set();
  const docs = [];

  while (queue.length && docs.length < MAX_PAGES) {
    const { url: cur, depth } = queue.shift();
    if (seen.has(cur)) continue;
    seen.add(cur);

    try {
      const html = await fetchPage(cur);
      const $ = cheerio.load(html);
      const title = $("title").first().text().trim() || cur;
      const content = extractText($).slice(0, 100000); // cap
      const keywords = ($('meta[name="keywords"]').attr("content") || "").split(",").map(s => s.trim()).filter(Boolean);

      docs.push({ url: cur, title, content, keywords });

      if (depth < MAX_DEPTH) {
        const links = [];
        $("a[href]").each((_, el) => {
          const href = $(el).attr("href");
          const abs = absoluteUrl(href, cur);
          if (abs) links.push(abs);
        });
        // Enqueue same-origin links only
        for (const l of links) {
          const o = new URL(l).origin;
          if (origins.has(o) && !seen.has(l)) queue.push({ url: l, depth: depth + 1 });
        }
      }

      console.log(`[OK] ${cur} (depth ${depth})`);
    } catch (e) {
      console.log(`[ERR] ${cur}: ${e?.message || e}`);
    }
    await sleep(POLITENESS_DELAY_MS);
  }

  fs.writeFileSync(outPath, JSON.stringify(docs, null, 2));
  console.log(`Wrote ${docs.length} docs → ${outPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
