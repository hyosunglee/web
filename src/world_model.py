"""Latent-space world model for AGI prototype."""

from __future__ import annotations

from dataclasses import dataclass
import math
import random
from typing import Callable, Dict, List, Tuple


@dataclass
class WorldModel:
    """Simple latent transition and decoder model."""

    latent_dim: int = 8
    action_dim: int = 4
    obs_dim: int = 6
    seed: int | None = None

    def __post_init__(self) -> None:
        rng = random.Random(self.seed)
        self._w_latent = [[rng.gauss(0.0, 0.15) for _ in range(self.latent_dim)] for _ in range(self.latent_dim)]
        self._w_action = [[rng.gauss(0.0, 0.15) for _ in range(self.action_dim)] for _ in range(self.latent_dim)]
        self._w_obs = [[rng.gauss(0.0, 0.2) for _ in range(self.latent_dim)] for _ in range(self.obs_dim)]
        self._w_reward = [rng.gauss(0.0, 0.1) for _ in range(self.latent_dim)]

    def _mat_vec(self, matrix: List[List[float]], vector: List[float]) -> List[float]:
        return [sum(m * v for m, v in zip(row, vector)) for row in matrix]

    def predict(self, latent_state: List[float], action: List[float]) -> Tuple[List[float], List[float], float]:
        if len(latent_state) != self.latent_dim:
            raise ValueError("latent_state shape mismatch")
        if len(action) != self.action_dim:
            raise ValueError("action shape mismatch")

        latent_term = self._mat_vec(self._w_latent, latent_state)
        action_term = self._mat_vec(self._w_action, action)
        next_latent = [math.tanh(a + b) for a, b in zip(latent_term, action_term)]
        obs_pred = self._mat_vec(self._w_obs, next_latent)
        reward_pred = math.tanh(sum(w * x for w, x in zip(self._w_reward, next_latent)))
        return next_latent, obs_pred, reward_pred

    def imagine_rollout(
        self,
        start_latent: List[float],
        policy: Callable[[List[float]], List[float]],
        horizon: int = 5,
    ) -> List[Dict[str, List[float] | float]]:
        latent = list(start_latent)
        rollout: List[Dict[str, List[float] | float]] = []
        for _ in range(horizon):
            action = policy(latent)
            latent, obs, reward = self.predict(latent, action)
            rollout.append({"latent": latent, "observation": obs, "reward": reward, "action": action})
        return rollout
