const { normalizePaper } = require("./parser");

const MOCK_SOURCES = {
  mock: [
    {
      id: "m1",
      title: "Agentic Retrieval Planning for Code Changes",
      summary:
        "Introduces an iterative retrieval-plan loop for software modification tasks with lower failure rates.",
      tags: ["retrieval", "planning", "code-agents"],
      confidence: 0.88,
      linkedModules: ["backend/research_parser", "backend/task_generator"],
    },
    {
      id: "m2",
      title: "Cost-aware Orchestration Policies in Multi-Agent Engineering",
      summary:
        "Proposes policies that trade off quality, latency, and token cost across specialist coding agents.",
      tags: ["orchestration", "cost", "latency"],
      confidence: 0.85,
      linkedModules: ["backend/orchestrator", "dashboard/metrics"],
    },
    {
      id: "m3",
      title: "Traceability Graphs for Research-to-PR Lifecycle",
      summary:
        "Shows how provenance graphs improve reviewer understanding from research signals to merged pull requests.",
      tags: ["traceability", "knowledge-graph", "review"],
      confidence: 0.83,
      linkedModules: ["backend/graph_api", "frontend/knowledge_flow"],
    },
  ],
  arxiv: [
    {
      id: "arxiv:2605.11111",
      title: "Autonomous Spec-to-Ship Pipelines with Agent Feedback",
      summary: "Evaluates closed-loop delivery pipelines with automated review and retry policies.",
      confidence: 0.81,
      linkedModules: ["backend/orchestrator", "backend/retry_policy"],
    },
    {
      id: "arxiv:2605.22222",
      title: "Benchmarking Multi-Agent Code Review Systems",
      summary: "Benchmarks security and quality outcomes of AI-assisted code review agents.",
      confidence: 0.79,
      linkedModules: ["backend/review_agent", "github/integration"],
    },
  ],
  openalex: [
    {
      id: "openalex:W99887766",
      title: "Knowledge Transfer Across AI Development Agents",
      summary: "Studies transfer of intermediate artifacts across specialist AI developer roles.",
      confidence: 0.8,
      linkedModules: ["backend/task_generator", "frontend/pipeline_board"],
    },
  ],
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withBackoff(fn, options = {}) {
  const attempts = options.attempts ?? 3;
  const baseMs = options.baseMs ?? 40;
  let lastError = null;

  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await sleep(baseMs * (2 ** i));
      }
    }
  }

  throw lastError || new Error("collector failed");
}

class PaperCollector {
  constructor(sourceData = MOCK_SOURCES) {
    this.sourceData = sourceData;
  }

  async collect({ source = "mock", query = "", limit = 3 } = {}) {
    const rows = this.sourceData[source];
    if (!rows) {
      throw new Error(`Unsupported source: ${source}`);
    }

    const q = String(query || "").trim().toLowerCase();
    const filtered = q
      ? rows.filter((row) => `${row.title} ${row.summary}`.toLowerCase().includes(q))
      : rows;

    return filtered.slice(0, Math.max(1, Number(limit) || 3));
  }
}

async function collectAndParse({
  collector,
  source = "mock",
  query = "",
  limit = 3,
  parser = normalizePaper,
} = {}) {
  if (!collector) {
    throw new Error("collector instance is required");
  }

  const papers = await withBackoff(
    () => collector.collect({ source, query, limit }),
    { attempts: 3, baseMs: 30 },
  );

  return papers.map((paper) => parser(paper, source));
}

module.exports = {
  PaperCollector,
  collectAndParse,
  withBackoff,
};
