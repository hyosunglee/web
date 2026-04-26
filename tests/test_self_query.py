from src.self_query import SelfQueryEngine


def test_generate_questions_from_metrics() -> None:
    engine = SelfQueryEngine(uncertainty_threshold=0.4)
    questions = engine.generate_questions(
        {"prediction_error": 0.5, "uncertainty": 0.6, "memory_novelty": 0.1}
    )
    assert len(questions) >= 2


def test_process_question_returns_text() -> None:
    engine = SelfQueryEngine()
    answer = engine.process_question("예측 오차가 큰 원인은 무엇인가?", {"prediction_error": 0.2})
    assert "0.200" in answer
