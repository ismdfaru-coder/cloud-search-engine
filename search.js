import fs from "node:fs";
import path from "node:path";

// Very simple tokenizer
function tokenize(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

// Field boosts
const BOOST_TITLE = 3.0;
const BOOST_KEYWORDS = 2.0;
const BOOST_CONTENT = 1.0;

function scoreDoc(doc, queryTokens) {
  const titleTokens = tokenize(doc.title);
  const kwTokens = tokenize((doc.keywords || []).join(" "));
  const contentTokens = tokenize(doc.content);

  const tfTitle = new Map(), tfKw = new Map(), tfContent = new Map();
  for (const t of titleTokens) tfTitle.set(t, (tfTitle.get(t) || 0) + 1);
  for (const t of kwTokens) tfKw.set(t, (tfKw.get(t) || 0) + 1);
  for (const t of contentTokens) tfContent.set(t, (tfContent.get(t) || 0) + 1);

  let score = 0;
  for (const qt of queryTokens) {
    score += (tfTitle.get(qt) || 0) * BOOST_TITLE;
    score += (tfKw.get(qt) || 0) * BOOST_KEYWORDS;
    score += (tfContent.get(qt) || 0) * BOOST_CONTENT;
  }
  return score;
}

function makeSnippet(content, queryTokens, maxLen = 200) {
  const text = (content || "").replace(/\s+/g, " ").trim();
  let idx = -1;
  for (const qt of queryTokens) {
    const i = text.toLowerCase().indexOf(qt.toLowerCase());
    if (i !== -1) { idx = i; break; }
  }
  if (idx === -1) idx = 0;
  const start = Math.max(0, idx - 50);
  const end = Math.min(text.length, start + maxLen);
  return text.slice(start, end) + (end < text.length ? "…" : "");
}

export default function handler(req, res) {
  try {
    const q = (req.query.q || "").toString().trim();
    const dataPath = path.join(process.cwd(), "public", "index.json");
    const raw = fs.readFileSync(dataPath, "utf8");
    const docs = JSON.parse(raw);

    if (!q) return res.status(200).json({ results: [] });

    const queryTokens = tokenize(q);
    const scored = docs.map((doc) => ({
      ...doc,
      _score: scoreDoc(doc, queryTokens),
    }));

    scored.sort((a, b) => b._score - a._score);
    const results = scored
      .filter((d) => d._score > 0)
      .slice(0, 25)
      .map((d) => ({
        title: d.title,
        url: d.url,
        snippet: makeSnippet(d.content, queryTokens),
        score: d._score,
      }));

    res.status(200).json({ results });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Search failed" });
  }
}
