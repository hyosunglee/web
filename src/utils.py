"""Utility functions for HS system thinking analysis program."""

from __future__ import annotations


def validate_topic(topic: str, minimum_length: int = 2) -> str:
    """Validate and normalize the user-provided topic.

    Args:
        topic: Raw topic input from a user.
        minimum_length: Minimum length of a stripped topic.

    Returns:
        A stripped topic string.

    Raises:
        ValueError: If the topic is empty or shorter than the required length.
        TypeError: If topic is not a string.
    """
    if not isinstance(topic, str):
        raise TypeError("topic must be a string")

    normalized: str = topic.strip()
    if len(normalized) < minimum_length:
        raise ValueError("topic must be at least 2 characters long")

    return normalized


def text_length(text: str) -> int:
    """Return the character length of a string.

    Args:
        text: Any text content.

    Returns:
        Character length.
    """
    return len(text)
