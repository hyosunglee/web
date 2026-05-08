"""Tests for analysis engine module."""

from packages.agi_core.analysis_engine import AnalysisEngine


def test_select_methods_returns_two_methods() -> None:
    """Engine should always return exactly two methods."""
    engine = AnalysisEngine()
    methods = engine.select_methods("AI 기반 교육 플랫폼")
    assert len(methods) == 2


def test_generate_analysis_has_minimum_length() -> None:
    """Generated analysis should satisfy minimum length requirement."""
    engine = AnalysisEngine()
    methods = engine.select_methods("탄소중립 도시 전환")
    analysis = engine.generate_analysis("탄소중립 도시 전환", methods)
    assert len(analysis) >= 1500
