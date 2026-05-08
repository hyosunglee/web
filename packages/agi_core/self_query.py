"""Self-query engine for internal reflection."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List


@dataclass
class SelfQueryEngine:
    """Generate and process introspective questions."""

    uncertainty_threshold: float = 0.5

    def generate_questions(self, state_info: Dict[str, float]) -> List[str]:
        questions: List[str] = []
        prediction_error = state_info.get("prediction_error", 0.0)
        uncertainty = state_info.get("uncertainty", 0.0)
        memory_novelty = state_info.get("memory_novelty", 0.0)
        if prediction_error > 0.3:
            questions.append("예측 오차가 큰 원인은 무엇인가?")
        if uncertainty > self.uncertainty_threshold:
            questions.append("불확실성을 줄이기 위해 어떤 정보를 더 수집해야 하는가?")
        if memory_novelty < 0.2:
            questions.append("최근 경험에서 새롭게 일반화할 개념은 무엇인가?")
        if not questions:
            questions.append("현재 내부 상태를 더 안정적으로 유지하려면 무엇을 조정해야 하는가?")
        return questions

    def process_question(self, question: str, context: Dict[str, Any]) -> str:
        if "예측 오차" in question:
            value = context.get("prediction_error", 0.0)
            return f"최근 예측 오차는 {value:.3f}이며, 세계 모델 업데이트 비율 조정이 필요합니다."
        if "불확실성" in question:
            uncertainty = context.get("uncertainty", 0.0)
            return f"불확실성({uncertainty:.3f}) 감소를 위해 상위 2개 시나리오 롤아웃을 추가 실행합니다."
        if "일반화" in question:
            tags = context.get("recent_tags", ["행동", "결과"])
            joined = ", ".join(tags[:3])
            return f"핵심 개념 후보는 {joined} 입니다."
        stability = context.get("state_norm", 0.0)
        return f"상태 안정도 지표는 {stability:.3f}이며 drift_scale 재조정이 권장됩니다."
