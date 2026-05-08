# Monorepo Overview

이 저장소는 실행 가능한 앱(`apps/`)과 공유 라이브러리(`packages/`)를 분리한 모노레포입니다.

## Directory Layout

- `apps/web` — 기존 AGI 프로토타입 실행 엔트리 및 테스트
- `apps/api` — FastAPI 기반 API 서버
- `apps/paper_assistant` — 논문 수집/루프 실행 앱
- `apps/active_agent` — active monitoring agent
- `packages/agi_core` — 공유 AGI 코어 모듈
- `docs` — 아키텍처/마이그레이션/작업 지침
- `tests/integration` — 크로스 앱 통합 테스트 자리

## Standard Run Commands

| App | Command |
|---|---|
| web prototype | `python -m apps.web.main "분석할 주제"` |
| AGI agent loop | `python -m packages.agi_core.agent` |
| API server | `python apps/api/main.py` |
| paper assistant loop | `python apps/paper_assistant/main.py` |
| active agent | `python apps/active_agent/src/main.py` |

## Standard Test Commands

| Scope | Command |
|---|---|
| web + agi_core unit tests | `pytest apps/web/tests` |
| integration (placeholder) | `pytest tests/integration` |

## Dependency Files

- `requirements.txt` (repo-level minimal tooling)
- `apps/api/requirements.txt`
- `apps/paper_assistant/requirements.txt`
- `apps/active_agent/src/requirements.txt`

상세 충돌/중복 의존성은 `docs/dependency_todo.md`를 참고하세요.
