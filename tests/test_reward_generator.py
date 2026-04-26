from src.reward_generator import RewardGenerator


def test_compute_reward_weighted_sum() -> None:
    rg = RewardGenerator(weights={"a": 0.5, "b": 0.5})
    reward = rg.compute_reward({"a": 0.2, "b": 0.6})
    assert reward == 0.4
