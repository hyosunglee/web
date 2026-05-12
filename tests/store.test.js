const test = require("node:test");
const assert = require("node:assert/strict");

const { DataStore } = require("../src/store");
const { makeSeedData } = require("../src/seed");

function makeStore() {
  return new DataStore(makeSeedData());
}

test("allows valid stage transition", () => {
  const store = makeStore();
  const before = store.getTask("TASK-1001");
  assert.equal(before.stage, "spec");

  const updated = store.updateTaskStage("TASK-1001", "plan", "Hermes");
  assert.equal(updated.stage, "plan");
  assert.equal(updated.status, "active");

  const timeline = store.getTaskTimeline("TASK-1001");
  assert.ok(timeline.events.some((evt) => evt.message.includes("spec to plan")));
});

test("rejects invalid stage transition", () => {
  const store = makeStore();
  assert.throws(
    () => store.updateTaskStage("TASK-1001", "build", "Hermes"),
    /Invalid transition spec -> build/,
  );
});

test("blocks transition from terminal stage", () => {
  const store = makeStore();
  assert.equal(store.getTask("TASK-1005").stage, "failed");

  assert.throws(
    () => store.updateTaskStage("TASK-1005", "spec", "Hermes"),
    /Cannot move task from terminal stage failed/,
  );
});

test("ingested artifacts can generate tasks with linkage", () => {
  const store = makeStore();
  const artifacts = store.addKnowledgeArtifacts([
    {
      id: "PAPER-9000",
      title: "Planning with Multi-Agent Constraints",
      summary: "A study on constrained plan decomposition",
      tags: ["planning", "constraints"],
      confidence: 0.82,
      linkedModules: ["backend/task_generator"],
      linkedTasks: [],
    },
  ]);

  const createdTasks = store.createTasksFromArtifacts(artifacts, {
    priority: "high",
    ownerAgent: "Hermes",
  });

  assert.equal(createdTasks.length, 1);
  assert.equal(createdTasks[0].stage, "queued");
  assert.deepEqual(createdTasks[0].linkedResearch, ["PAPER-9000"]);
  assert.ok(artifacts[0].linkedTasks.includes(createdTasks[0].id));
});

test("can append PR records", () => {
  const store = makeStore();
  const created = store.addPR({
    repository: "team/agent-ops",
    branch: "agent/task-123",
    title: "feat: sample",
    taskIds: ["TASK-1001"],
    summary: "sample pr",
  });

  assert.ok(created.id.startsWith("PR-"));
  assert.equal(created.status, "open");
  assert.ok(store.listPRs().some((pr) => pr.id === created.id));
});
