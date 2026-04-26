import tempfile

from src.memory import Episode, EpisodicMemory, InMemoryStore, SemanticMemory, WorkingMemory


def test_working_memory_fifo_behavior() -> None:
    memory = WorkingMemory(capacity=2)
    memory.add("a")
    memory.add("b")
    memory.add("c")
    assert memory.items() == ["b", "c"]


def test_episodic_memory_search_and_retrieve() -> None:
    memory = EpisodicMemory(capacity=3)
    memory.add_episode(Episode(timestamp=1.0, payload={"tag": "x"}))
    memory.add_episode(Episode(timestamp=2.0, payload={"tag": "y"}))

    assert memory.retrieve_by_index(0).payload["tag"] == "x"
    assert len(memory.search(lambda e: e.payload["tag"] == "y")) == 1


def test_semantic_memory_save_load_and_store_plugin() -> None:
    store = InMemoryStore()
    memory = SemanticMemory(store=store)
    memory.set("k", 10)

    assert store.load("k") == 10
    assert memory.get("k") == 10

    with tempfile.NamedTemporaryFile(suffix=".json") as tf:
        memory.save(tf.name)
        restored = SemanticMemory()
        restored.load(tf.name)
        assert restored.get("k") == 10
