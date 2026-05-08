"""Tests for orchestration entry point."""

from apps.web.main import run


def test_run_returns_expected_structure() -> None:
    """run should return all required output fields."""
    result = run("지속가능한 스마트시티 데이터 전략")

    assert set(result.keys()) == {"topic", "methods", "analysis", "ideas"}
    assert isinstance(result["methods"], tuple)
    assert len(result["methods"]) == 2
    assert isinstance(result["analysis"], str)
    assert isinstance(result["ideas"], list)
    assert len(result["ideas"]) >= 10
