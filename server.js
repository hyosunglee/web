const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const { DataStore } = require("./src/store");
const { makeSeedData } = require("./src/seed");
const { PaperCollector, collectAndParse } = require("./src/collector");
const { normalizePaper } = require("./src/parser");
const { GitHubIntegration } = require("./src/github");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT || 4173);
const PUBLIC_DIR = path.join(__dirname, "public");

const store = new DataStore(makeSeedData());
const collector = new PaperCollector();
const github = new GitHubIntegration({
  mode: process.env.GITHUB_MODE || "mock",
  token: process.env.GITHUB_TOKEN || null,
  defaultRepository: process.env.GITHUB_REPOSITORY || "team/agent-ops",
});

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body);
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(message);
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".png":
      return "image/png";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf-8")));
      } catch (err) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function serveStatic(req, res, pathname) {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const normalized = path.normalize(requested).replace(/^([.][.][/\\])+/, "");
  const fullPath = path.join(PUBLIC_DIR, normalized);

  if (!fullPath.startsWith(PUBLIC_DIR)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      if (pathname !== "/" && pathname !== "/index.html") {
        fs.readFile(path.join(PUBLIC_DIR, "index.html"), (fallbackErr, fallbackData) => {
          if (fallbackErr) {
            sendText(res, 404, "Not Found");
            return;
          }
          res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8",
          });
          res.end(fallbackData);
        });
        return;
      }
      sendText(res, 404, "Not Found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": contentTypeFor(fullPath),
    });
    res.end(data);
  });
}

async function handleApi(req, res, url) {
  const pathname = url.pathname;
  const segments = pathname.split("/").filter(Boolean);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return true;
  }

  try {
    if (req.method === "GET" && pathname === "/api/health") {
      sendJson(res, 200, {
        status: "ok",
        service: "agent-ops-visualization",
        now: new Date().toISOString(),
      });
      return true;
    }

    if (req.method === "GET" && pathname === "/api/dashboard") {
      sendJson(res, 200, store.getDashboardSummary());
      return true;
    }

    if (req.method === "GET" && pathname === "/api/pipeline") {
      sendJson(res, 200, store.getPipelineBoard());
      return true;
    }

    if (req.method === "GET" && pathname === "/api/tasks") {
      sendJson(res, 200, store.listTasks());
      return true;
    }

    if (req.method === "POST" && pathname === "/api/tasks") {
      const body = await parseBody(req);
      if (!body.title || typeof body.title !== "string") {
        sendJson(res, 400, { error: "title is required" });
        return true;
      }
      const created = store.createTask(body);
      sendJson(res, 201, created);
      return true;
    }

    if (req.method === "GET" && pathname === "/api/runs") {
      const taskId = url.searchParams.get("taskId");
      sendJson(res, 200, store.listRuns(taskId));
      return true;
    }

    if (req.method === "GET" && pathname === "/api/events") {
      const taskId = url.searchParams.get("taskId");
      sendJson(res, 200, store.listEvents(taskId));
      return true;
    }

    if (req.method === "GET" && pathname === "/api/agents") {
      sendJson(res, 200, store.listAgents());
      return true;
    }

    if (req.method === "GET" && pathname === "/api/prs") {
      sendJson(res, 200, store.listPRs());
      return true;
    }

    if (req.method === "POST" && pathname === "/api/prs") {
      const body = await parseBody(req);
      if (!body.taskId) {
        sendJson(res, 400, { error: "taskId is required" });
        return true;
      }

      const task = store.getTask(body.taskId);
      if (!task) {
        sendJson(res, 404, { error: "task not found" });
        return true;
      }

      const created = await github.createPRFromTask({
        task,
        repository: body.repository,
        actor: body.actor || "Codex",
        summary: body.summary || null,
      });

      const pr = store.addPR(created);
      sendJson(res, 201, pr);
      return true;
    }

    if (req.method === "GET" && pathname === "/api/knowledge-artifacts") {
      sendJson(res, 200, store.listKnowledgeArtifacts());
      return true;
    }

    if (req.method === "POST" && pathname === "/api/ingest/papers") {
      const body = await parseBody(req);
      const source = body.source || "mock";
      const query = body.query || "";
      const limit = body.limit || 3;
      const createTasks = body.createTasks !== false;

      const artifacts = await collectAndParse({
        collector,
        source,
        query,
        limit,
        parser: normalizePaper,
      });
      const storedArtifacts = store.addKnowledgeArtifacts(artifacts);
      const tasks = createTasks
        ? store.createTasksFromArtifacts(storedArtifacts, {
            priority: body.taskPriority || "medium",
            ownerAgent: body.ownerAgent || "Hermes",
            titlePrefix: body.taskTitlePrefix || null,
          })
        : [];

      sendJson(res, 201, {
        source,
        query,
        ingestedCount: storedArtifacts.length,
        createdTasks: tasks.length,
        artifacts: storedArtifacts,
        tasks,
      });
      return true;
    }

    if (req.method === "POST" && pathname === "/api/simulate/tick") {
      sendJson(res, 200, store.simulateTick());
      return true;
    }

    if (segments[0] === "api" && segments[1] === "tasks" && segments[2]) {
      const taskId = segments[2];

      if (req.method === "GET" && segments.length === 3) {
        const task = store.getTask(taskId);
        if (!task) {
          sendJson(res, 404, { error: "task not found" });
          return true;
        }
        sendJson(res, 200, task);
        return true;
      }

      if (req.method === "GET" && segments[3] === "timeline") {
        const timeline = store.getTaskTimeline(taskId);
        if (!timeline) {
          sendJson(res, 404, { error: "task not found" });
          return true;
        }
        sendJson(res, 200, timeline);
        return true;
      }

      if (req.method === "PATCH" && segments[3] === "stage") {
        const body = await parseBody(req);
        if (!body.stage) {
          sendJson(res, 400, { error: "stage is required" });
          return true;
        }
        const updated = store.updateTaskStage(taskId, body.stage, body.actor || "Hermes");
        sendJson(res, 200, updated);
        return true;
      }
    }

    return false;
  } catch (err) {
    sendJson(res, 400, { error: err.message });
    return true;
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const handled = await handleApi(req, res, url);

  if (handled) {
    return;
  }

  if (req.method !== "GET") {
    sendText(res, 405, "Method Not Allowed");
    return;
  }

  serveStatic(req, res, url.pathname);
});

server.listen(PORT, HOST, () => {
  console.log(`Agent Ops Visualization server running at http://${HOST}:${PORT}`);
});
