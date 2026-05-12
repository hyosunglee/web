# Agent Operation Visualization MVP

`준비 사항 목록.pdf`의 설계를 기반으로 만든 실행 가능한 MVP입니다.

## 구현 범위 (MVP)
- Home Dashboard
- Pipeline Board
- Task Timeline
- PR List
- Agent 상태 패널

## 기술 구성
- Backend: Node.js 표준 모듈(`http`, `fs`) 기반 REST API
- Frontend: Vanilla JS + CSS (의존성 없음)
- Data: In-memory seed data (`Task`, `Run`, `Event`, `Agent`, `PR`, `KnowledgeArtifact`)

## 실행 방법
```bash
node server.js
```

서버 주소:
- `http://127.0.0.1:4173`

## 주요 API
- `GET /api/dashboard`
- `GET /api/pipeline`
- `GET /api/tasks`
- `GET /api/tasks/:id/timeline`
- `GET /api/agents`
- `GET /api/prs`
- `POST /api/prs` (task 기반 mock PR 생성)
- `POST /api/ingest/papers` (mock/arxiv/openalex 수집 + 파싱 + 태스크 생성)
- `POST /api/simulate/tick`
- `POST /api/tasks`
- `PATCH /api/tasks/:id/stage`

## 테스트
의존성 없이 Node 내장 테스트 러너로 실행합니다.

```bash
node --test tests/store.test.js tests/api.test.js
```

포트 제한 환경에서는 `tests/api.test.js`가 자동으로 skip 될 수 있습니다.

## 환경 변수
- `PORT` (기본 `4173`)
- `GITHUB_MODE` (`mock` 또는 `real`, 기본 `mock`)
- `GITHUB_TOKEN` (`GITHUB_MODE=real`일 때 필요)
- `GITHUB_REPOSITORY` (기본 `team/agent-ops`)

## 설계 대응 관계
- Pipeline lifecycle: `queued → spec → plan → build → test → review → ship → done/failed`
- Core entities: `Task`, `Run`, `Event`, `Agent`, `PR`, `KnowledgeArtifact`
- User role: 승인자(approval) 중심으로 알림/상태 가시화

## 다음 확장 권장
- DB 영속화 (PostgreSQL)
- 실제 GitHub API 연동
- 연구 수집기(arXiv/OpenAlex) 연동
- Agent Ecosystem / Knowledge Flow 고급 시각화 추가
