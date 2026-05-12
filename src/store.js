const {
  STAGES,
  PIPELINE_STAGES,
  TERMINAL_STAGES,
  STAGE_SEQUENCE,
  TASK_PRIORITIES,
  validateTaskInput,
  nextPipelineStage,
} = require("./models");

class DataStore {
  constructor(seedData) {
    this.tasks = seedData.tasks;
    this.runs = seedData.runs;
    this.events = seedData.events;
    this.agents = seedData.agents;
    this.prs = seedData.prs;
    this.knowledgeArtifacts = seedData.knowledgeArtifacts;
  }

  _nextId(prefix, rows) {
    const max = rows.reduce((acc, row) => {
      const match = String(row.id || "").match(new RegExp(`^${prefix}-(\\d+)$`));
      if (!match) {
        return acc;
      }
      return Math.max(acc, Number(match[1]));
    }, 0);
    return `${prefix}-${max + 1}`;
  }

  _sortByDate(items, field) {
    return [...items].sort(
      (a, b) => new Date(a[field]).getTime() - new Date(b[field]).getTime(),
    );
  }

  _buildTaskLookup() {
    return new Map(this.tasks.map((task) => [task.id, task]));
  }

  listTasks() {
    return this._sortByDate(this.tasks, "createdAt");
  }

  getTask(taskId) {
    return this.tasks.find((task) => task.id === taskId) || null;
  }

  listRuns(taskId = null) {
    const rows = taskId
      ? this.runs.filter((run) => run.taskId === taskId)
      : this.runs;
    return this._sortByDate(rows, "startedAt");
  }

  listEvents(taskId = null) {
    const rows = taskId
      ? this.events.filter((event) => event.taskId === taskId)
      : this.events;
    return this._sortByDate(rows, "timestamp");
  }

  listAgents() {
    return [...this.agents].sort((a, b) => a.name.localeCompare(b.name));
  }

  listPRs() {
    return this._sortByDate(this.prs, "createdAt").reverse();
  }

  listKnowledgeArtifacts() {
    return [...this.knowledgeArtifacts];
  }

  addKnowledgeArtifacts(artifacts) {
    if (!Array.isArray(artifacts)) {
      throw new Error("artifacts must be an array");
    }

    const created = [];
    for (const artifact of artifacts) {
      const existing = this.knowledgeArtifacts.find((row) => row.id === artifact.id);
      if (existing) {
        created.push(existing);
        continue;
      }

      const row = {
        id: artifact.id || this._nextId("PAPER", this.knowledgeArtifacts),
        title: artifact.title || "Untitled artifact",
        summary: artifact.summary || "",
        tags: Array.isArray(artifact.tags) ? artifact.tags : [],
        confidence: Number(artifact.confidence ?? 0.7),
        linkedTasks: Array.isArray(artifact.linkedTasks) ? artifact.linkedTasks : [],
        linkedModules: Array.isArray(artifact.linkedModules) ? artifact.linkedModules : [],
        source: artifact.source || "mock",
        collectedAt: artifact.collectedAt || new Date().toISOString(),
      };

      this.knowledgeArtifacts.push(row);
      created.push(row);
    }

    return created;
  }

  getPipelineBoard() {
    const columns = PIPELINE_STAGES.map((stage) => ({
      stage,
      tasks: [],
    }));

    const byStage = new Map(columns.map((col) => [col.stage, col.tasks]));

    for (const task of this.tasks) {
      if (byStage.has(task.stage)) {
        byStage.get(task.stage).push(task);
      }
    }

    return {
      columns,
      queued: this.tasks.filter((task) => task.stage === "queued"),
      done: this.tasks.filter((task) => task.stage === "done"),
      failed: this.tasks.filter((task) => task.stage === "failed"),
    };
  }

  getDashboardSummary() {
    const stageCounts = Object.fromEntries(STAGES.map((stage) => [stage, 0]));
    const statusCounts = {
      active: 0,
      blocked: 0,
      completed: 0,
      failed: 0,
      queued: 0,
    };

    for (const task of this.tasks) {
      stageCounts[task.stage] += 1;
      if (statusCounts[task.status] !== undefined) {
        statusCounts[task.status] += 1;
      }
    }

    const activeRuns = this.runs.filter((run) => run.status === "running").length;
    const failedRuns = this.runs.filter((run) => run.status === "failed").length;

    const avgHealth = this.agents.length
      ? this.agents.reduce((acc, cur) => acc + cur.healthScore, 0) / this.agents.length
      : 0;

    const avgSuccessRate = this.agents.length
      ? this.agents.reduce((acc, cur) => acc + cur.successRate, 0) / this.agents.length
      : 0;

    const metrics = {
      papersIngested: this.knowledgeArtifacts.length,
      tasksCreated: this.tasks.length,
      prsOpened: this.prs.filter((pr) => pr.status !== "merged").length,
      prsMerged: this.prs.filter((pr) => pr.status === "merged").length,
    };

    const alerts = [];
    for (const task of this.tasks) {
      if (task.stage === "review" && task.status === "blocked") {
        alerts.push({
          type: "approval",
          taskId: task.id,
          message: `${task.id} is blocked in review and needs intervention.`,
        });
      }
      if (task.stage === "ship" && task.status === "active") {
        alerts.push({
          type: "approval",
          taskId: task.id,
          message: `${task.id} is waiting for user approval to ship.`,
        });
      }
    }

    return {
      stageCounts,
      statusCounts,
      activeRuns,
      failedRuns,
      avgHealthScore: Number(avgHealth.toFixed(3)),
      avgSuccessRate: Number(avgSuccessRate.toFixed(3)),
      metrics,
      alerts,
    };
  }

  getTaskTimeline(taskId) {
    const task = this.getTask(taskId);
    if (!task) {
      return null;
    }

    const runs = this.listRuns(taskId);
    const events = this.listEvents(taskId);

    return {
      task,
      runs,
      events,
    };
  }

  _validateStageTransition(currentStage, nextStage) {
    if (!STAGES.includes(nextStage)) {
      throw new Error(`Invalid stage: ${nextStage}`);
    }

    if (currentStage === nextStage) {
      return;
    }

    if (TERMINAL_STAGES.includes(currentStage)) {
      throw new Error(`Cannot move task from terminal stage ${currentStage}`);
    }

    const expectedNext = STAGE_SEQUENCE[currentStage];
    if (nextStage !== expectedNext && !TERMINAL_STAGES.includes(nextStage)) {
      throw new Error(`Invalid transition ${currentStage} -> ${nextStage}`);
    }
  }

  updateTaskStage(taskId, nextStage, actor = "Hermes") {
    const task = this.getTask(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    this._validateStageTransition(task.stage, nextStage);

    const previousStage = task.stage;
    task.stage = nextStage;
    task.updatedAt = new Date().toISOString();
    task.status = TERMINAL_STAGES.includes(nextStage)
      ? nextStage === "done"
        ? "completed"
        : "failed"
      : "active";
    task.ownerAgent = actor;

    const event = {
      id: this._nextId("EVT", this.events),
      taskId: task.id,
      runId: null,
      timestamp: new Date().toISOString(),
      stage: nextStage,
      type: "info",
      severity: "low",
      message: `Task moved from ${previousStage} to ${nextStage} by ${actor}`,
      relatedFiles: [],
      relatedTests: [],
    };

    this.events.push(event);

    return task;
  }

  createTask(payload) {
    const stage = payload.stage || "queued";
    const priority = payload.priority || "medium";

    if (!TASK_PRIORITIES.includes(priority)) {
      throw new Error(`Invalid priority: ${priority}`);
    }

    const task = {
      id: payload.id || this._nextId("TASK", this.tasks),
      title: payload.title,
      origin: payload.origin || "manual",
      stage,
      status: stage === "queued" ? "queued" : "active",
      priority,
      relatedModules: payload.relatedModules || [],
      linkedResearch: payload.linkedResearch || [],
      acceptanceCriteria: payload.acceptanceCriteria || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerAgent: payload.ownerAgent || "Hermes",
    };

    validateTaskInput(task);

    this.tasks.push(task);
    return task;
  }

  createTasksFromArtifacts(artifacts, options = {}) {
    if (!Array.isArray(artifacts)) {
      throw new Error("artifacts must be an array");
    }

    const created = [];
    for (const artifact of artifacts) {
      const task = this.createTask({
        title: options.titlePrefix
          ? `${options.titlePrefix} ${artifact.title}`
          : `Research follow-up: ${artifact.title}`,
        origin: artifact.id || "artifact:unknown",
        stage: "queued",
        priority: options.priority || "medium",
        relatedModules: artifact.linkedModules || [],
        linkedResearch: [artifact.id],
        acceptanceCriteria: [
          "Spec includes objective, scope, and non-goals",
          "Plan is split into atomic tasks with verification steps",
        ],
        ownerAgent: options.ownerAgent || "Hermes",
      });

      if (!artifact.linkedTasks) {
        artifact.linkedTasks = [];
      }
      artifact.linkedTasks.push(task.id);
      created.push(task);
    }

    return created;
  }

  addPR(payload) {
    const pr = {
      id: payload.id || this._nextId("PR", this.prs),
      repository: payload.repository || "team/agent-ops",
      branch: payload.branch || "agent/unknown",
      title: payload.title || "Untitled PR",
      status: payload.status || "open",
      createdAt: payload.createdAt || new Date().toISOString(),
      mergedAt: payload.mergedAt || null,
      associatedRuns: Array.isArray(payload.associatedRuns) ? payload.associatedRuns : [],
      taskIds: Array.isArray(payload.taskIds) ? payload.taskIds : [],
      summary: payload.summary || "",
      authorAgent: payload.authorAgent || "Codex",
    };

    this.prs.push(pr);
    return pr;
  }

  simulateTick() {
    const candidates = this.tasks.filter(
      (task) => !TERMINAL_STAGES.includes(task.stage),
    );

    if (candidates.length === 0) {
      return { moved: false, message: "No movable tasks" };
    }

    candidates.sort((a, b) => {
      const p = {
        urgent: 4,
        high: 3,
        medium: 2,
        low: 1,
      };
      return p[b.priority] - p[a.priority];
    });

    const task = candidates[0];
    const next = nextPipelineStage(task.stage);
    if (!next) {
      task.stage = "done";
      task.status = "completed";
      task.updatedAt = new Date().toISOString();
      return { moved: true, task };
    }

    this.updateTaskStage(task.id, next, "Hermes");
    return { moved: true, task: this.getTask(task.id) };
  }
}

module.exports = {
  DataStore,
};
