"""CLI and orchestration entry point for HS analysis program."""

from __future__ import annotations

from argparse import ArgumentParser
from typing import Any

from packages.agi_core.analysis_engine import AnalysisEngine
from packages.agi_core.idea_generator import generate_topic_aware_ideas
from packages.agi_core.utils import validate_topic


def run(topic: str) -> dict[str, Any]:
    """Run complete HS analysis and idea generation workflow.

    Args:
        topic: Topic string entered by a user.

    Returns:
        Dictionary containing selected methods, analysis and idea list.
    """
    normalized: str = validate_topic(topic)
    engine = AnalysisEngine()
    methods: tuple[str, str] = engine.select_methods(normalized)
    analysis: str = engine.generate_analysis(normalized, methods)
    ideas: list[str] = generate_topic_aware_ideas(normalized, analysis, methods)

    return {
        "topic": normalized,
        "methods": methods,
        "analysis": analysis,
        "ideas": ideas,
    }


def _build_parser() -> ArgumentParser:
    """Build command-line parser."""
    parser = ArgumentParser(description="HS 시스템 사고법 분석 프로그램")
    parser.add_argument("topic", type=str, help="분석할 주제")
    return parser


def main() -> None:
    """Execute CLI workflow and print formatted output."""
    parser = _build_parser()
    args = parser.parse_args()
    result = run(args.topic)

    print(f"[주제] {result['topic']}")
    print(f"[선택 사고법] {result['methods'][0]}, {result['methods'][1]}")
    print("\n[분석 결과]\n")
    print(result["analysis"])
    print("\n[창의적 아이디어]\n")
    for index, idea in enumerate(result["ideas"], start=1):
        print(f"{index}. {idea}\n")


if __name__ == "__main__":
    main()
