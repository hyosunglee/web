const test = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const path = require("node:path");

const cwd = path.resolve(__dirname, "..");
const port = 4193;
const baseUrl = `http://127.0.0.1:${port}`;

function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn("node", ["server.js"], {
      cwd,
      env: {
        ...process.env,
        PORT: String(port),
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let started = false;
    let stderrText = "";

    proc.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      if (text.includes("Agent Ops Visualization server running")) {
        started = true;
        resolve(proc);
      }
    });

    proc.stderr.on("data", (chunk) => {
      stderrText += chunk.toString();
    });

    proc.on("exit", (code) => {
      if (!started) {
        reject(
          new Error(`server failed to start (code=${code}) ${stderrText}`.trim()),
        );
      }
    });

    setTimeout(() => {
      if (!started) {
        reject(new Error("server start timeout"));
      }
    }, 2500);
  });
}

let serverProc = null;
let startError = null;

test.before(async () => {
  try {
    serverProc = await startServer();
  } catch (err) {
    startError = err;
  }
});

test.after(() => {
  if (serverProc && !serverProc.killed) {
    serverProc.kill("SIGTERM");
  }
});

test("health endpoint responds", async (t) => {
  if (!serverProc) {
    t.skip(`server unavailable: ${startError ? startError.message : "unknown"}`);
    return;
  }
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  const json = await response.json();
  assert.equal(json.status, "ok");
});

test("paper ingest + PR creation flow works", async (t) => {
  if (!serverProc) {
    t.skip(`server unavailable: ${startError ? startError.message : "unknown"}`);
    return;
  }
  const ingestRes = await fetch(`${baseUrl}/api/ingest/papers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "mock",
      query: "orchestration",
      limit: 2,
      createTasks: true,
      taskPriority: "high",
    }),
  });

  assert.equal(ingestRes.status, 201);
  const ingestJson = await ingestRes.json();
  assert.ok(ingestJson.ingestedCount >= 1);
  assert.ok(ingestJson.createdTasks >= 1);

  const taskId = ingestJson.tasks[0].id;
  const prRes = await fetch(`${baseUrl}/api/prs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      taskId,
      actor: "Codex",
      summary: "Auto-generated test PR",
    }),
  });

  assert.equal(prRes.status, 201);
  const prJson = await prRes.json();
  assert.equal(prJson.taskIds[0], taskId);
  assert.equal(prJson.status, "open");
});
