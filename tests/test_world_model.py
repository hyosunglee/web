from src.world_model import WorldModel


def test_world_model_predict_shapes() -> None:
    model = WorldModel(latent_dim=5, action_dim=2, obs_dim=3, seed=1)
    latent = [0.0] * 5
    action = [1.0] * 2

    nxt, obs, reward = model.predict(latent, action)
    assert len(nxt) == 5
    assert len(obs) == 3
    assert isinstance(reward, float)


def test_world_model_imagine_rollout_horizon() -> None:
    model = WorldModel(latent_dim=5, action_dim=2, obs_dim=3, seed=1)
    latent = [0.0] * 5

    def policy(x: list[float]) -> list[float]:
        return [max(-1.0, min(1.0, v)) for v in x[:2]]

    rollout = model.imagine_rollout(latent, policy, horizon=4)
    assert len(rollout) == 4
