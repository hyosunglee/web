const STAGES = [
  "queued",
  "spec",
  "plan",
  "build",
  "test",
  "review",
  "ship",
  "done",
  "failed",
];

const PIPELINE_STAGES = ["spec", "plan", "build", "test", "review", "ship"];
const TERMINAL_STAGES = ["done", "failed"];

const STAGE_SEQUENCE = {
  queued: "spec",
  spec: "plan",
  plan: "build",
  build: "test",
  test: "review",
  review: "ship",
  ship: "done",
};

const TASK_PRIORITIES = ["low", "medium", "high", "urgent"];
const RUN_STATUSES = ["queued", "running", "success", "failed", "cancelled"];
const AGENT_STATUSES = ["idle", "running", "degraded", "offline"];

function assertInSet(value, set, fieldName) {
  if (!set.includes(value)) {
    throw new Error(`Invalid ${fieldName}: ${value}`);
  }
}

function validateTaskInput(task) {
  assertInSet(task.stage, STAGES, "task.stage");
  assertInSet(task.priority, TASK_PRIORITIES, "task.priority");
}

function nextPipelineStage(stage) {
  return STAGE_SEQUENCE[stage] ?? null;
}

module.exports = {
  STAGES,
  PIPELINE_STAGES,
  TERMINAL_STAGES,
  STAGE_SEQUENCE,
  TASK_PRIORITIES,
  RUN_STATUSES,
  AGENT_STATUSES,
  validateTaskInput,
  nextPipelineStage,
};
