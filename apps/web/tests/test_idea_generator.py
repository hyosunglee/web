"""Tests for creative idea generator."""

from packages.agi_core.analysis_engine import AnalysisEngine
from packages.agi_core.idea_generator import IdeaGenerator


def test_generate_ideas_count_is_at_least_ten() -> None:
    """Idea generator should create ten or more ideas."""
    engine = AnalysisEngine()
    methods = engine.select_methods("미래형 공공의료 서비스")
    analysis = engine.generate_analysis("미래형 공공의료 서비스", methods)

    generator = IdeaGenerator()
    ideas = generator.generate_ideas(analysis, methods)

    assert len(ideas) >= 10


def test_each_idea_has_minimum_length() -> None:
    """Every generated idea must be over 300 characters."""
    engine = AnalysisEngine()
    methods = engine.select_methods("지역 기반 순환경제")
    analysis = engine.generate_analysis("지역 기반 순환경제", methods)

    generator = IdeaGenerator()
    ideas = generator.generate_ideas(analysis, methods)

    assert all(len(idea) >= 300 for idea in ideas)
