# 지속 활동성 AGI 프로토타입 설계서

본 문서는 Codex 및 Jules와 같은 코드 작성 에이전트를 활용하여 **지속적인 내부 활동성(Continuous Internal Activity)**을 갖춘 AGI 프로토타입을 구현하기 위한 설계 지침을 정리한다. 핵심 목표는 예측 가능한 내부 세계모델, 다층 메모리 체계, 자기 질문 루프를 결합해 외부 입력이 없어도 상태가 계속 진화하는 에이전트를 실험적으로 구현하는 것이다.

## 1. 목적과 배경

- 최신 연구는 AGI가 환경을 예측하는 세계모델과 장·단기 메모리 계층을 필수적으로 갖춰야 함을 강조한다.
- 본 설계는 이러한 가설을 검증하기 위해 Python 3.10 이상과 NumPy, PyTorch(JAX 대체 가능) 기반으로 실행 가능한 프로토타입을 정의한다.
- Codex/Jules와 같은 에이전트가 모듈을 병렬 개발·검증할 수 있도록 리포지토리 구조와 작업 흐름을 명시한다.

## 2. 프로젝트 구조 및 기술 스택

| 영역 | 지침 |
| --- | --- |
| 언어 | Python 3.10+, 필요 시 JAX 지원 |
| 필수 라이브러리 | `numpy`, `torch`(또는 `jax`), `pytest` |
| 선택 라이브러리 | `gymnasium`, `dm_env`, 외부 vector store |
| 기본 폴더 | `src/`, `tests/`, `docs/`, `AGENTS.md`, `README.md` |
| 실행 진입점 | `python src/agent.py` |

### 권장 디렉터리 레이아웃

```
src/
  memory.py
  state_updater.py
  world_model.py
  self_query.py
  reward_generator.py
  agent.py
  __init__.py (선택)
tests/
  test_memory.py
  test_state_updater.py
  test_world_model.py
  test_agent_loop.py
```

## 3. 모듈별 세부 설계

### 3.1 Memory Module (`memory.py`)

- **WorkingMemory**: FIFO 큐 구조, 용량 초과 시 가장 오래된 항목 제거. 시퀀스 길이 제한 인자로 설정.
- **EpisodicMemory**: 시간 순 정렬된 `deque` 또는 경량 DB(SQLite) 기반 저장소. `add_episode`, `retrieve_by_index`, `search(predicate)` 메서드 포함.
- **SemanticMemory**: 키-값 딕셔너리. 직렬화/외부 저장소 연동을 위한 `save`·`load` 훅 제공.
- **외부 메모리 추상화**: `BaseMemoryStore` 프로토콜을 정의해 vector store나 파일 백엔드를 플러그인 형태로 연결.

### 3.2 State Updater (`state_updater.py`)

- PyTorch `nn.GRU` 또는 `nn.LSTM`으로 내부 상태를 갱신.
- `StateUpdater.update(prev_state, input)`는 은닉 상태와 외부 입력을 결합하고, 입력이 없을 경우 소규모 가우시안 노이즈를 주입해 활동성을 유지.
- 상태 드리프트 파라미터(`drift_scale`)를 노출해 실험적으로 조정.

### 3.3 World Model (`world_model.py`)

- Dreamer 계열 세계모델을 단순화한 잠재 공간 전이 모델.
- `predict(latent_state, action)`은 다음 잠재 상태, 관측 예측, 보상 추정치를 반환.
- `imagine_rollout(policy, horizon)`은 현재 잠재 상태에서 정책을 적용해 가상 시나리오를 생성, 자기 질문 및 보상 계산에 활용.

### 3.4 Self Query Engine (`self_query.py`)

- `generate_questions(state_info)`는 최근 예측 오차, 메모리 빈도, 불확실도 등 지표를 분석해 한국어 질문 목록을 생성.
- `process_question(question, context)`는 연관 메모리를 조회하거나 world model rollout을 재실행해 내부적으로 답변을 산출.

### 3.5 Reward Generator (`reward_generator.py`)

- 외부 보상 부재 시에도 학습을 촉진하도록 예측 정확도, 세계모델 일관성, 불확실성 감소 등을 가중 합산.
- `compute_reward(metrics)`는 메트릭 딕셔너리를 받아 스칼라 내적 보상을 출력하고, 각 항목의 가중치는 설정 파일이나 semantic memory에서 로드.

### 3.6 AGI Agent (`agent.py`)

- 모든 모듈을 조합한 지속 루프를 구현.
- 루프 단계: `state_updater.update` → `world_model.predict` → `self_query.generate_questions` → `reward_generator.compute`.
- 외부 입력 큐를 감시하다가 데이터가 없으면 내부 롤아웃과 자기 질문을 계속 수행해 **지속 활동성**을 보장.

## 4. 테스트 및 검증 전략

1. **단위 테스트**: 각 모듈별 `pytest` 스위트를 작성해 FIFO 동작, 상태 갱신, 보상 계산을 검증.
2. **통합 테스트**: `agent.py`의 루프를 제한된 스텝으로 실행해 외부 입력이 없어도 상태가 갱신되는지 확인.
3. **성능 로그**: 예측 오차, 내부 보상, 질문 빈도를 주기적으로 로깅해 장기 추세를 관찰.

## 5. Codex를 위한 AGENTS 지침

AGENTS.md에는 다음 항목을 포함하는 것이 좋다.

1. 프로젝트 개요 및 모듈 역할.
2. PEP 8 + 타입 힌트 + docstring 규칙.
3. `pip install -r requirements.txt` 설치 절차.
4. `pytest` 실행 의무.
5. `python src/agent.py` 실행법.
6. PR 메시지에는 변경 모듈, 기능 요약, 테스트 결과, 성능 변화 기록을 포함.

## 6. Jules 활용 워크플로

1. GitHub 리포지토리에 Jules 앱 설치 후 작업 브랜치 생성.
2. 모듈 단위로 `jules` 라벨 이슈 작성(예: `memory.py 구현`).
3. Jules가 제안하는 계획 및 수정 파일 목록 검토·승인.
4. 작업 결과 diff 및 로그 확인 후 피드백 제공.
5. 테스트 통과를 확인한 뒤 PR 병합, 이후 반복.

## 7. 추가 고려 사항

- **모델 불확실성**: 인간 수준의 의식·자율성을 보장하지 않으므로 반복 개선 필요.
- **리소스 제약**: world model 학습은 GPU/메모리 요구량이 높으므로 사용 환경을 사전 확인.
- **안전성**: 실험 환경에서만 실행하고 외부 시스템과 직접 연동하지 않는다.
- **라이선스**: 모든 외부 라이브러리와 생성 코드의 라이선스를 준수.

## 8. 결론

위 설계서는 지속 활동성 AGI 프로토타입을 구성하기 위한 모듈, 테스트 전략, Codex/Jules 연동 지침을 통합한다. 각 모듈의 성능을 계량화해 반복적으로 개선하고, 에이전트별 가이드를 AGENTS.md와 GitHub 워크플로에 반영하면 개발 효율을 크게 높일 수 있다.
