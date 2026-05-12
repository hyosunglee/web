class GitHubIntegration {
  constructor(options = {}) {
    this.mode = options.mode || "mock";
    this.token = options.token || null;
    this.defaultRepository = options.defaultRepository || "team/agent-ops";
    this.prs = new Map();
  }

  _requireTokenIfRealMode() {
    if (this.mode === "real" && !this.token) {
      throw new Error("GITHUB_TOKEN is required when GITHUB_MODE=real");
    }
  }

  _buildBranchName(taskId) {
    return `agent/${String(taskId || "task").toLowerCase()}-${Date.now()}`;
  }

  async createBranch({ repository, branchName }) {
    this._requireTokenIfRealMode();

    if (this.mode === "real") {
      throw new Error("Real GitHub mode is not implemented in this environment");
    }

    return {
      repository: repository || this.defaultRepository,
      branchName,
      createdAt: new Date().toISOString(),
    };
  }

  async createCommit({ repository, branchName, message }) {
    this._requireTokenIfRealMode();

    if (this.mode === "real") {
      throw new Error("Real GitHub mode is not implemented in this environment");
    }

    return {
      repository: repository || this.defaultRepository,
      branchName,
      message,
      commitSha: `mock-${Math.floor(Math.random() * 1e12).toString(16)}`,
      createdAt: new Date().toISOString(),
    };
  }

  async createPR({ repository, branchName, title, body, taskId, authorAgent = "Codex" }) {
    this._requireTokenIfRealMode();

    if (this.mode === "real") {
      throw new Error("Real GitHub mode is not implemented in this environment");
    }

    const id = `PR-${Math.floor(Math.random() * 900 + 100)}`;
    const pr = {
      id,
      repository: repository || this.defaultRepository,
      branch: branchName,
      title,
      status: "open",
      createdAt: new Date().toISOString(),
      mergedAt: null,
      associatedRuns: [],
      taskIds: taskId ? [taskId] : [],
      summary: body,
      authorAgent,
    };

    this.prs.set(id, pr);
    return pr;
  }

  async getPR(prId) {
    return this.prs.get(prId) || null;
  }

  async createPRFromTask({ task, repository, actor = "Codex", summary = null }) {
    if (!task) {
      throw new Error("task is required");
    }

    const branchName = this._buildBranchName(task.id);
    await this.createBranch({ repository, branchName });
    await this.createCommit({
      repository,
      branchName,
      message: `feat: ${task.title}`,
    });

    const body =
      summary ||
      `Auto-generated PR for ${task.id}\n\nStage: ${task.stage}\nOrigin: ${task.origin}\nOwner: ${task.ownerAgent}`;

    return this.createPR({
      repository,
      branchName,
      title: `feat: ${task.title}`,
      body,
      taskId: task.id,
      authorAgent: actor,
    });
  }
}

module.exports = {
  GitHubIntegration,
};
