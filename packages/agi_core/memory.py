"""Memory module for continuous-activity AGI prototype."""

from __future__ import annotations

from collections import deque
from dataclasses import dataclass
import json
from pathlib import Path
from typing import Any, Callable, Deque, Dict, List, Optional, Protocol


class BaseMemoryStore(Protocol):
    """Protocol for pluggable memory backends."""

    def save(self, key: str, value: Any) -> None:
        """Persist a key-value pair."""

    def load(self, key: str) -> Any:
        """Load a value by key."""


class WorkingMemory:
    """FIFO memory with fixed capacity for short-term context."""

    def __init__(self, capacity: int = 16) -> None:
        """Initialize working memory.

        Args:
            capacity: Maximum number of items retained.
        """
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self.capacity = capacity
        self._buffer: Deque[Any] = deque(maxlen=capacity)

    def add(self, item: Any) -> None:
        """Append an item, evicting oldest entry if full."""
        self._buffer.append(item)

    def items(self) -> List[Any]:
        """Return current items in insertion order."""
        return list(self._buffer)


@dataclass(frozen=True)
class Episode:
    """Single episodic memory entry."""

    timestamp: float
    payload: Dict[str, Any]


class EpisodicMemory:
    """Time-ordered episodic memory store."""

    def __init__(self, capacity: int = 256) -> None:
        """Initialize episodic memory.

        Args:
            capacity: Maximum episode count retained.
        """
        if capacity <= 0:
            raise ValueError("capacity must be positive")
        self._episodes: Deque[Episode] = deque(maxlen=capacity)

    def add_episode(self, episode: Episode) -> None:
        """Add a new episode in chronological sequence."""
        self._episodes.append(episode)

    def retrieve_by_index(self, index: int) -> Episode:
        """Get episode by zero-based index."""
        return list(self._episodes)[index]

    def search(self, predicate: Callable[[Episode], bool]) -> List[Episode]:
        """Return all episodes matching predicate."""
        return [episode for episode in self._episodes if predicate(episode)]

    def items(self) -> List[Episode]:
        """Return all episodic entries."""
        return list(self._episodes)


class SemanticMemory:
    """Long-term semantic key-value memory with persistence hooks."""

    def __init__(self, store: Optional[BaseMemoryStore] = None) -> None:
        """Initialize semantic memory.

        Args:
            store: Optional pluggable backend.
        """
        self._knowledge: Dict[str, Any] = {}
        self._store = store

    def set(self, key: str, value: Any) -> None:
        """Set semantic value and persist if backend is configured."""
        self._knowledge[key] = value
        if self._store is not None:
            self._store.save(key, value)

    def get(self, key: str, default: Any = None) -> Any:
        """Read semantic value with optional fallback."""
        if key in self._knowledge:
            return self._knowledge[key]
        if self._store is not None:
            loaded = self._store.load(key)
            if loaded is not None:
                self._knowledge[key] = loaded
                return loaded
        return default

    def save(self, path: str | Path) -> None:
        """Serialize semantic memory to JSON file."""
        with Path(path).open("w", encoding="utf-8") as f:
            json.dump(self._knowledge, f, ensure_ascii=False, indent=2)

    def load(self, path: str | Path) -> None:
        """Load semantic memory from JSON file."""
        with Path(path).open("r", encoding="utf-8") as f:
            data = json.load(f)
        self._knowledge.update(data)


class InMemoryStore:
    """Simple in-process store useful for testing plugins."""

    def __init__(self) -> None:
        """Initialize backing dictionary."""
        self._data: Dict[str, Any] = {}

    def save(self, key: str, value: Any) -> None:
        """Store key-value pair."""
        self._data[key] = value

    def load(self, key: str) -> Any:
        """Retrieve value or None."""
        return self._data.get(key)
