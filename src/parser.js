const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "into",
  "through",
  "agent",
  "agents",
  "based",
  "using",
  "multi",
  "system",
  "study",
]);

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function extractTags(text, max = 5) {
  const counts = new Map();
  const tokens = String(text || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4 && !STOPWORDS.has(token));

  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([token]) => token);
}

function normalizePaper(rawPaper, source = "mock") {
  const title = rawPaper.title || "Untitled research artifact";
  const summary = rawPaper.summary || rawPaper.abstract || "No summary provided.";
  const rawId = rawPaper.id || rawPaper.paperId || rawPaper.doi || title;
  const id = `${source.toUpperCase()}-${slugify(rawId) || Date.now()}`;
  const tags = rawPaper.tags && rawPaper.tags.length
    ? rawPaper.tags.map((tag) => String(tag).toLowerCase())
    : extractTags(`${title} ${summary}`);

  let confidence = Number(rawPaper.confidence ?? 0.78);
  if (!Number.isFinite(confidence)) {
    confidence = 0.78;
  }
  confidence = Math.max(0, Math.min(1, confidence));

  return {
    id,
    title,
    summary,
    tags,
    confidence: Number(confidence.toFixed(3)),
    linkedTasks: [],
    linkedModules: rawPaper.linkedModules || [],
    source,
    collectedAt: new Date().toISOString(),
  };
}

module.exports = {
  extractTags,
  normalizePaper,
};
