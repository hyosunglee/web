"""State update module for maintaining continuous internal activity."""

from __future__ import annotations

from dataclasses import dataclass
import math
import random
from typing import List, Optional


@dataclass
class StateUpdater:
    """RNN-like deterministic + stochastic state updater."""

    state_dim: int = 8
    input_dim: int = 8
    drift_scale: float = 0.01
    seed: Optional[int] = None

    def __post_init__(self) -> None:
        if self.state_dim <= 0 or self.input_dim <= 0:
            raise ValueError("state_dim and input_dim must be positive")
        self.rng = random.Random(self.seed)
        self.w_h = [[self.rng.gauss(0.0, 0.2) for _ in range(self.state_dim)] for _ in range(self.state_dim)]
        self.w_x = [[self.rng.gauss(0.0, 0.2) for _ in range(self.input_dim)] for _ in range(self.state_dim)]

    def _mat_vec(self, matrix: List[List[float]], vector: List[float]) -> List[float]:
        return [sum(m * v for m, v in zip(row, vector)) for row in matrix]

    def update(self, prev_state: List[float], input_vector: Optional[List[float]] = None) -> List[float]:
        if len(prev_state) != self.state_dim:
            raise ValueError("prev_state shape mismatch")

        if input_vector is None:
            x_term = [0.0] * self.state_dim
            noise_scale = self.drift_scale
        else:
            if len(input_vector) != self.input_dim:
                raise ValueError("input_vector shape mismatch")
            x_term = self._mat_vec(self.w_x, input_vector)
            noise_scale = self.drift_scale * 0.25

        h_term = self._mat_vec(self.w_h, prev_state)
        return [math.tanh(h + x + self.rng.gauss(0.0, noise_scale)) for h, x in zip(h_term, x_term)]
