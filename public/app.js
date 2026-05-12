const state = {
  tasks: [],
  selectedTaskId: null,
};

const metricTemplate = document.getElementById("metricTemplate");
const metricsGrid = document.getElementById("metricsGrid");
const pipelineBoard = document.getElementById("pipelineBoard");
const taskSelector = document.getElementById("taskSelector");
const timelineMeta = document.getElementById("timelineMeta");
const timelineList = document.getElementById("timelineList");
const agentList = document.getElementById("agentList");
const prTableBody = document.getElementById("prTableBody");
const alertsBox = document.getElementById("alerts");
const lastUpdated = document.getElementById("lastUpdated");
const refreshBtn = document.getElementById("refreshBtn");
const ingestBtn = document.getElementById("ingestBtn");
const createPrBtn = document.getElementById("createPrBtn");
const tickBtn = document.getElementById("tickBtn");

const stageLabels = {
  queued: "Queued",
  spec: "Spec",
  plan: "Plan",
  build: "Build",
  test: "Test",
  review: "Review",
  ship: "Ship",
  done: "Done",
  failed: "Failed",
};

function formatDate(value) {
  return new Date(value).toLocaleString("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

async function fetchJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${response.status}`);
  }
  return response.json();
}

function createMetricCard(label, value) {
  const node = metricTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector(".metric-label").textContent = label;
  node.querySelector(".metric-value").textContent = value;
  return node;
}

function renderDashboard(summary) {
  metricsGrid.innerHTML = "";
  const cards = [
    ["Active Runs", summary.activeRuns],
    ["Failed Runs", summary.failedRuns],
    ["Avg Agent Health", `${Math.round(summary.avgHealthScore * 100)}%`],
    ["Avg Success Rate", `${Math.round(summary.avgSuccessRate * 100)}%`],
    ["Papers", summary.metrics.papersIngested],
    ["Tasks", summary.metrics.tasksCreated],
    ["PR Open", summary.metrics.prsOpened],
    ["PR Merged", summary.metrics.prsMerged],
  ];

  for (const [label, value] of cards) {
    metricsGrid.append(createMetricCard(label, value));
  }

  alertsBox.innerHTML = "";
  if (summary.alerts.length === 0) {
    const safe = document.createElement("p");
    safe.className = "muted";
    safe.textContent = "현재 개입이 필요한 알림이 없습니다.";
    alertsBox.append(safe);
    return;
  }

  for (const alert of summary.alerts) {
    const el = document.createElement("article");
    el.className = "alert";
    el.textContent = alert.message;
    alertsBox.append(el);
  }
}

function taskCard(task) {
  const card = document.createElement("article");
  card.className = "task-card";
  card.dataset.taskId = task.id;
  card.innerHTML = `
    <p class="task-title">${task.id}</p>
    <p>${task.title}</p>
    <div class="task-meta">
      <span class="priority ${task.priority}">${task.priority}</span>
      <span>${task.ownerAgent}</span>
    </div>
  `;
  card.addEventListener("click", () => {
    taskSelector.value = task.id;
    state.selectedTaskId = task.id;
    loadTimeline(task.id).catch(handleError);
  });
  return card;
}

function renderPipeline(pipeline) {
  pipelineBoard.innerHTML = "";

  for (const col of pipeline.columns) {
    const column = document.createElement("section");
    column.className = "column";

    const header = document.createElement("h3");
    header.textContent = `${stageLabels[col.stage]} (${col.tasks.length})`;
    column.append(header);

    if (col.tasks.length === 0) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "No tasks";
      column.append(empty);
    } else {
      for (const task of col.tasks) {
        column.append(taskCard(task));
      }
    }

    pipelineBoard.append(column);
  }
}

function renderTaskSelector(tasks) {
  taskSelector.innerHTML = "";

  for (const task of tasks) {
    const option = document.createElement("option");
    option.value = task.id;
    option.textContent = `${task.id} · ${task.title}`;
    taskSelector.append(option);
  }

  if (!state.selectedTaskId || !tasks.find((task) => task.id === state.selectedTaskId)) {
    state.selectedTaskId = tasks[0]?.id || null;
  }

  if (state.selectedTaskId) {
    taskSelector.value = state.selectedTaskId;
  }
}

function renderTimeline(timeline) {
  const { task, runs, events } = timeline;

  timelineMeta.innerHTML = `
    <strong>${task.title}</strong><br />
    Stage: ${stageLabels[task.stage] || task.stage} · Status: ${task.status} · Owner: ${task.ownerAgent}
  `;

  timelineList.innerHTML = "";
  const merged = [
    ...runs.map((run) => ({
      kind: "run",
      at: run.startedAt,
      badge: run.status,
      title: `${run.agentName} run (${run.stage})`,
      body: run.logSummary,
      detail: `cost $${run.costUsd} · tokens ${run.tokenUsage}`,
    })),
    ...events.map((event) => ({
      kind: "event",
      at: event.timestamp,
      badge: event.type,
      title: `${event.stage} ${event.type}`,
      body: event.message,
      detail: `${event.severity} severity`,
    })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  if (merged.length === 0) {
    const none = document.createElement("li");
    none.className = "timeline-item";
    none.textContent = "Timeline data is empty.";
    timelineList.append(none);
    return;
  }

  for (const item of merged) {
    const li = document.createElement("li");
    li.className = "timeline-item";
    li.innerHTML = `
      <div class="timeline-head">
        <strong>${item.title}</strong>
        <span class="badge ${item.badge}">${item.badge}</span>
      </div>
      <p>${item.body}</p>
      <p class="muted">${formatDate(item.at)} · ${item.detail}</p>
    `;
    timelineList.append(li);
  }
}

function renderAgents(agents) {
  agentList.innerHTML = "";

  for (const agent of agents) {
    const li = document.createElement("li");
    li.className = "agent-item";
    li.innerHTML = `
      <div class="timeline-head">
        <strong>${agent.name}</strong>
        <span class="status-chip ${agent.status}">${agent.status}</span>
      </div>
      <p class="muted">health ${Math.round(agent.healthScore * 100)}% · success ${Math.round(agent.successRate * 100)}%</p>
      <p class="muted">load ${agent.currentLoad} · last active ${formatDate(agent.lastActiveAt)}</p>
    `;
    agentList.append(li);
  }
}

function renderPRs(prs) {
  prTableBody.innerHTML = "";

  for (const pr of prs) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${pr.id}</td>
      <td>${pr.repository}</td>
      <td>${pr.title}</td>
      <td><span class="status-chip">${pr.status}</span></td>
      <td>${pr.taskIds.join(", ")}</td>
      <td>${formatDate(pr.createdAt)}</td>
    `;
    prTableBody.append(tr);
  }
}

async function loadTimeline(taskId) {
  if (!taskId) {
    timelineMeta.textContent = "Task not selected";
    timelineList.innerHTML = "";
    return;
  }
  const timeline = await fetchJson(`/api/tasks/${taskId}/timeline`);
  renderTimeline(timeline);
}

function handleError(err) {
  const message = err instanceof Error ? err.message : String(err);
  alertsBox.innerHTML = `<article class="alert">${message}</article>`;
}

async function refreshAll() {
  const [summary, pipeline, tasks, agents, prs] = await Promise.all([
    fetchJson("/api/dashboard"),
    fetchJson("/api/pipeline"),
    fetchJson("/api/tasks"),
    fetchJson("/api/agents"),
    fetchJson("/api/prs"),
  ]);

  state.tasks = tasks;

  renderDashboard(summary);
  renderPipeline(pipeline);
  renderTaskSelector(tasks);
  renderAgents(agents);
  renderPRs(prs);

  if (state.selectedTaskId) {
    await loadTimeline(state.selectedTaskId);
  }

  lastUpdated.textContent = `updated: ${new Date().toLocaleTimeString("ko-KR")}`;
}

async function simulateTick() {
  await fetchJson("/api/simulate/tick", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  await refreshAll();
}

async function ingestPapers() {
  await fetchJson("/api/ingest/papers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "mock",
      query: "",
      limit: 2,
      createTasks: true,
      taskPriority: "high",
      ownerAgent: "Hermes",
    }),
  });
  await refreshAll();
}

async function createPRForSelectedTask() {
  if (!state.selectedTaskId) {
    throw new Error("먼저 태스크를 선택해 주세요.");
  }

  await fetchJson("/api/prs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      taskId: state.selectedTaskId,
      actor: "Codex",
    }),
  });
  await refreshAll();
}

refreshBtn.addEventListener("click", () => refreshAll().catch(handleError));
ingestBtn.addEventListener("click", () => ingestPapers().catch(handleError));
createPrBtn.addEventListener("click", () => createPRForSelectedTask().catch(handleError));
tickBtn.addEventListener("click", () => simulateTick().catch(handleError));
taskSelector.addEventListener("change", () => {
  state.selectedTaskId = taskSelector.value;
  loadTimeline(taskSelector.value).catch(handleError);
});

refreshAll().catch(handleError);
setInterval(() => refreshAll().catch(handleError), 20000);
