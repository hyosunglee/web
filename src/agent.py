"""Integrated AGI agent with continuous internal activity loop."""

from __future__ import annotations

from dataclasses import dataclass, field
import math
import random
from typing import Dict, List, Optional

if __package__ in (None, ""):
    import sys
    from pathlib import Path

    sys.path.append(str(Path(__file__).resolve().parent.parent))

from src.memory import Episode, EpisodicMemory, SemanticMemory, WorkingMemory
from src.reward_generator import RewardGenerator
from src.self_query import SelfQueryEngine
from src.state_updater import StateUpdater
from src.world_model import WorldModel


@dataclass
class AGIAgent:
    """Composable AGI prototype that runs continuous internal updates."""

    state_dim: int = 8
    action_dim: int = 4
    obs_dim: int = 6
    working_capacity: int = 16
    episodic_capacity: int = 256
    seed: int | None = 7

    working_memory: WorkingMemory = field(init=False)
    episodic_memory: EpisodicMemory = field(init=False)
    semantic_memory: SemanticMemory = field(init=False)
    state_updater: StateUpdater = field(init=False)
    world_model: WorldModel = field(init=False)
    self_query: SelfQueryEngine = field(init=False)
    reward_generator: RewardGenerator = field(init=False)
    latent_state: List[float] = field(init=False)

    def __post_init__(self) -> None:
        self.working_memory = WorkingMemory(self.working_capacity)
        self.episodic_memory = EpisodicMemory(self.episodic_capacity)
        self.semantic_memory = SemanticMemory()
        self.state_updater = StateUpdater(state_dim=self.state_dim, input_dim=self.obs_dim, seed=self.seed)
        self.world_model = WorldModel(latent_dim=self.state_dim, action_dim=self.action_dim, obs_dim=self.obs_dim, seed=self.seed)
        self.self_query = SelfQueryEngine()
        self.reward_generator = RewardGenerator()
        self.latent_state = [0.0] * self.state_dim
        self._rng = random.Random(self.seed)

    def _policy(self, latent: List[float]) -> List[float]:
        action = [math.tanh(x) for x in latent[: self.action_dim]]
        while len(action) < self.action_dim:
            action.append(0.0)
        return action

    def step(self, external_input: Optional[List[float]] = None, timestamp: float = 0.0) -> Dict[str, float | List[str]]:
        self.latent_state = self.state_updater.update(self.latent_state, external_input)

        action = self._policy(self.latent_state)
        next_latent, obs_pred, reward_pred = self.world_model.predict(self.latent_state, action)

        prediction_error = sum(abs(a - b) for a, b in zip(next_latent, self.latent_state)) / len(self.latent_state)
        mean_obs = sum(obs_pred) / len(obs_pred)
        uncertainty = (sum((x - mean_obs) ** 2 for x in obs_pred) / len(obs_pred)) ** 0.5
        memory_novelty = 1.0 / (1.0 + len(self.episodic_memory.items()))

        state_info = {
            "prediction_error": prediction_error,
            "uncertainty": uncertainty,
            "memory_novelty": memory_novelty,
        }
        questions = self.self_query.generate_questions(state_info)
        state_norm = (sum(v * v for v in self.latent_state)) ** 0.5
        answers = [self.self_query.process_question(q, {**state_info, "state_norm": state_norm}) for q in questions]

        metrics = {
            "prediction_accuracy": 1.0 - prediction_error,
            "consistency": 1.0 - min(uncertainty, 1.0),
            "uncertainty_reduction": max(0.0, 1.0 - uncertainty),
        }
        intrinsic_reward = self.reward_generator.compute_reward(metrics)

        self.working_memory.add(
            {
                "state": list(self.latent_state),
                "obs_prediction": list(obs_pred),
                "questions": questions,
                "answers": answers,
            }
        )
        self.episodic_memory.add_episode(
            Episode(
                timestamp=timestamp,
                payload={
                    "prediction_error": prediction_error,
                    "reward_pred": reward_pred,
                    "intrinsic_reward": intrinsic_reward,
                },
            )
        )
        self.semantic_memory.set("latest_intrinsic_reward", intrinsic_reward)

        self.latent_state = next_latent
        return {
            "prediction_error": prediction_error,
            "uncertainty": uncertainty,
            "intrinsic_reward": intrinsic_reward,
            "questions": questions,
        }

    def run(self, steps: int = 10) -> List[Dict[str, float | List[str]]]:
        results: List[Dict[str, float | List[str]]] = []
        for t in range(steps):
            external = None
            if self._rng.random() < 0.25:
                external = [self._rng.gauss(0.0, 1.0) for _ in range(self.obs_dim)]
            results.append(self.step(external_input=external, timestamp=float(t)))
        return results


if __name__ == "__main__":
    agent = AGIAgent()
    for i, info in enumerate(agent.run(steps=20), start=1):
        print(f"[step={i}] reward={info['intrinsic_reward']:.3f} error={info['prediction_error']:.3f}")
