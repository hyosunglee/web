# Continuous-Activity AGI Prototype

지속적인 내부 활동성(Continuous Internal Activity)을 갖춘 AGI 프로토타입입니다.

## Setup

```bash
pip install -r requirements.txt
```

## Run Existing Prototype

```bash
python src/agent.py
```

## Run HS 시스템 사고법 분석 프로그램

```bash
# PYTHONPATH를 설정하거나 -m 옵션을 사용하여 실행합니다.
export PYTHONPATH=$PYTHONPATH:.
python src/main.py "분석할 주제"

# 또는
python -m src.main "분석할 주제"
```

출력에는 다음이 포함됩니다.
- 주제에 맞춰 선택된 사고법 2가지
- 1,500자 이상 분석 요약
- 300자 이상 아이디어 10개 이상

## Test

```bash
pytest
```
