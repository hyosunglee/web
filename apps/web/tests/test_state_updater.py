from packages.agi_core.state_updater import StateUpdater


def test_state_updater_updates_without_input() -> None:
    updater = StateUpdater(state_dim=4, input_dim=3, seed=1)
    prev = [0.0, 0.0, 0.0, 0.0]
    nxt = updater.update(prev)

    assert len(nxt) == 4
    assert nxt != prev


def test_state_updater_updates_with_input() -> None:
    updater = StateUpdater(state_dim=4, input_dim=3, seed=1)
    prev = [1.0, 1.0, 1.0, 1.0]
    inp = [0.1, -0.2, 0.3]

    nxt = updater.update(prev, inp)
    assert len(nxt) == 4
