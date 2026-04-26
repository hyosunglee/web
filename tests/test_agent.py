from src.agent import AGIAgent


def test_agent_runs_without_external_input() -> None:
    agent = AGIAgent(seed=3)
    result = agent.step(external_input=None, timestamp=1.0)

    assert "intrinsic_reward" in result
    assert len(agent.working_memory.items()) == 1
    assert len(agent.episodic_memory.items()) == 1


def test_agent_run_multiple_steps() -> None:
    agent = AGIAgent(seed=3)
    results = agent.run(steps=5)

    assert len(results) == 5
    assert len(agent.episodic_memory.items()) == 5
