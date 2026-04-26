"""Intrinsic reward generator for continuous AGI activity."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Dict


@dataclass
class RewardGenerator:
    """Compute intrinsic reward from weighted metrics."""

    weights: Dict[str, float] = field(
        default_factory=lambda: {
            "prediction_accuracy": 0.5,
            "consistency": 0.3,
            "uncertainty_reduction": 0.2,
        }
    )

    def compute_reward(self, metrics: Dict[str, float]) -> float:
        """Return weighted sum of intrinsic motivation metrics."""
        reward = 0.0
        for key, weight in self.weights.items():
            reward += weight * float(metrics.get(key, 0.0))
        return float(reward)
