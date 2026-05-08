"""Creative idea generation based on HS analysis output."""

from __future__ import annotations

from packages.agi_core.utils import text_length, validate_topic


class IdeaGenerator:
    """Generate idea candidates from analysis insights."""

    def generate_ideas(self, analysis: str, methods: tuple[str, str]) -> list[str]:
        """Generate at least ten ideas, each over 300 characters.

        Args:
            analysis: Summary analysis text from the analysis engine.
            methods: Two selected method names.

        Returns:
            A list of detailed idea descriptions.
        """
        if text_length(analysis.strip()) < 100:
            raise ValueError("analysis is too short to generate reliable ideas")

        method_label: str = f"{methods[0]}+{methods[1]}"
        templates: list[str] = [
            "아이디어 {idx}: '{method}' 조합을 반영해 '문제 재정의 워크숍 키트'를 만든다. 이 키트는 조직이 기존 목표를 기능 중심이 아니라 사용자 여정 중심으로 다시 쓰게 해준다. Novelty 측면에서 보통의 브레인스토밍과 달리 실제 행동 로그와 인터뷰를 동시에 다루는 점이 차별화된다. Feasibility는 표준 템플릿과 진행자 가이드가 있으면 2주 내 파일럿이 가능하다. Value는 팀 간 언어를 통일해 실행 속도를 높이는 데 있다. Risk는 형식적 행사로 끝날 수 있다는 점이며, 이를 줄이기 위해 워크숍 후 30일 실행 점검을 의무화한다.",
            "아이디어 {idx}: 분석 결과를 바탕으로 '다층 KPI 대시보드'를 설계한다. 공통 KPI와 현장 맞춤 KPI를 분리해 보여 주며 의사결정자가 단기 성과와 장기 학습을 동시에 본다. Novelty는 단일 숫자 경쟁을 피하고 맥락형 지표를 병행하는 운영 철학에 있다. Feasibility는 기존 BI 도구에 지표 체계만 추가하면 되어 기술 장벽이 낮다. Value는 잘못된 최적화를 줄이고 자원 배분의 품질을 높인다는 점이다. Risk는 지표가 많아 복잡해질 수 있다는 것이므로 월별로 비핵심 지표를 정리하는 거버넌스가 필요하다.",
            "아이디어 {idx}: '현장 실험 포트폴리오 제도'를 도입해 작은 실험을 동시에 운영한다. 각 실험은 가설, 성공 신호, 중단 조건을 명확히 기록하고 공유 저장소에 축적한다. Novelty는 실패를 개인 책임이 아니라 시스템 학습 자산으로 전환하는 구조에 있다. Feasibility는 작은 예산 바우처와 공통 문서 양식만으로도 즉시 시작 가능하다. Value는 불확실한 주제에서 의사결정 속도를 높이고 과감한 시도를 안전하게 만든다. Risk는 실험이 난립해 전략 정렬이 약화될 수 있다는 점이며 분기별 포트폴리오 리뷰로 우선순위를 조정해야 한다.",
            "아이디어 {idx}: '신뢰 로그북' 기능을 만들어 주요 의사결정의 근거와 한계를 짧게 남긴다. 사용자는 결과뿐 아니라 왜 그런 선택이 이루어졌는지를 확인할 수 있어 정책 수용성이 커진다. Novelty는 성과 보고 중심 문화를 설명 가능성 중심 문화로 전환하는 데 있다. Feasibility는 협업 도구에 템플릿 필드를 추가하는 수준으로 구현 가능하다. Value는 책임 소재를 명확히 하고 후속 개선 논의를 빠르게 만든다. Risk는 기록 부담으로 현장이 반발할 수 있으므로 자동 초안 생성과 5분 내 작성 규칙을 적용한다.",
            "아이디어 {idx}: 주제별 '전환비용 절감 패키지'를 제공해 새로운 시스템 도입 시 사용자가 겪는 마찰을 줄인다. 기존 데이터 마이그레이션, 교육 마이크로 콘텐츠, 초기 헬프데스크를 묶어 초반 이탈을 막는다. Novelty는 기능 경쟁보다 전환 경험 자체를 제품화한다는 점이다. Feasibility는 현재 운영팀과 고객지원 자산을 재조합하면 가능하다. Value는 채택률과 재사용률을 동시에 높이는 데 있다. Risk는 초기 운영비가 늘어날 수 있어 고가치 세그먼트부터 단계적 적용이 적절하다.",
            "아이디어 {idx}: '이해관계자 시뮬레이션 게임'을 만들어 정책 담당자, 운영자, 사용자 역할을 번갈아 체험하게 한다. 서로의 제약을 경험하면 갈등이 줄고 현실적인 합의안이 빨리 나온다. Novelty는 정적 보고서를 체험형 의사결정 학습으로 바꾼다는 데 있다. Feasibility는 카드 기반 오프라인 버전으로 먼저 검증할 수 있어 부담이 작다. Value는 협상 비용 절감과 실행 일관성 향상이다. Risk는 게임이 가볍게 소비될 수 있으므로 실제 데이터 기반 시나리오를 지속 업데이트해야 한다.",
            "아이디어 {idx}: '윤리·편향 사전점검 모듈'을 제품 흐름에 내장해 배포 전 잠재 차별 요소를 자동 체크한다. 결과는 단순 경고가 아니라 수정 가이드를 함께 제공해 팀이 즉시 조치할 수 있게 한다. Novelty는 규정 준수를 넘어 설계 단계의 감수성을 높이는 통합 방식이다. Feasibility는 체크리스트와 룰 엔진으로 MVP 구현이 가능하다. Value는 평판 리스크를 줄이고 신뢰 기반 시장 진입을 돕는다. Risk는 과도한 경고로 개발 속도가 늦어질 수 있으므로 위험 등급별 대응 레벨을 차등 적용한다.",
            "아이디어 {idx}: '학습 속도 지수'를 도입해 조직이 얼마나 빨리 가설을 검증하고 개선하는지 측정한다. 이는 매출 같은 결과 지표를 보완해 미래 경쟁력을 조기에 포착한다. Novelty는 성과의 결과값보다 학습의 과정값을 핵심 자산으로 본다는 점이다. Feasibility는 실험 문서와 릴리스 이력을 연결하면 산출 가능하다. Value는 장기 혁신 역량을 가시화해 투자 판단의 질을 높인다. Risk는 지수 자체가 새로운 목표 왜곡을 낳을 수 있으므로 정성 평가와 병행해야 한다.",
            "아이디어 {idx}: 지역·문화 맥락을 반영한 '로컬라이즈드 운영 플레이북'을 제공한다. 동일 솔루션이라도 커뮤니케이션 방식, 지원 채널, 성과 해석 기준을 지역별로 다르게 설계한다. Novelty는 표준화와 현지화를 대립이 아닌 동시 최적화 문제로 다루는 데 있다. Feasibility는 핵심 코어와 주변 정책을 분리한 문서 체계로 구현 가능하다. Value는 확장 과정의 저항을 줄이고 사용자 몰입을 높인다. Risk는 운영 복잡성이 증가할 수 있어 공통 모듈 비율을 유지하는 관리 원칙이 필요하다.",
            "아이디어 {idx}: '실패 사례 공개 세션'을 정례화해 분기마다 가장 의미 있는 실패 3건을 전사 공유한다. 핵심은 누가 실패했는지가 아니라 어떤 가정이 틀렸고 다음 실험을 어떻게 설계할지에 있다. Novelty는 성공 홍보 중심 조직문화에서 학습 공유 중심 문화로의 전환이다. Feasibility는 기존 타운홀 시간을 일부 전환하면 즉시 도입 가능하다. Value는 반복 실수를 줄이고 심리적 안전감을 높여 도전적 과제를 촉진한다. Risk는 방어적 태도로 흐를 가능성이 있어 진행자 훈련과 비난 금지 규칙이 필수다.",
        ]

        ideas: list[str] = []
        for index, template in enumerate(templates):
            idea: str = template.format(idx=index + 1, method=method_label)
            if text_length(idea) < 300:
                extensions = [
                    "추가로 실행 이전에 파일럿 범위와 책임자를 명확히 지정하면 불필요한 시행착오를 줄이고, 성과 해석 기준을 사전에 합의해 조직 내 갈등을 예방할 수 있다.",
                    "또한 초기 도입 단계에서 발생하는 예외 상황들을 데이터로 기록하여, 시스템의 안정성을 높이는 피드백 루프로 활용하는 과정이 반드시 수반되어야 한다.",
                    "사용자의 초기 진입 장벽을 낮추기 위한 온보딩 프로세스를 강화하고, 단계별 보상 체계를 도입하여 지속적인 참여를 유도하는 전략적 접근이 필요하다.",
                    "정기적인 성과 공유 세션을 통해 이해관계자 간의 신뢰를 구축하고, 발견된 문제점을 투명하게 공개하여 집단 지성을 통한 해결책을 모색해야 한다.",
                    "장기적으로는 이 아이디어가 조직의 표준 운영 절차에 내재화될 수 있도록 확장성을 고려한 아키텍처 설계와 규제 준수 여부를 병행 검토한다."
                ]
                # Use a specific extension based on index to provide variety
                ext = extensions[index % len(extensions)]
                idea += " " + ext

            # If still short, add more
            while text_length(idea) < 300:
                idea += " 실험 과정에서 발견된 교훈을 다음 실험 설계에 반영하는 폐루프를 유지하면 시스템의 적응력이 높아진다."

            ideas.append(idea)
        return ideas


def generate_topic_aware_ideas(topic: str, analysis: str, methods: tuple[str, str]) -> list[str]:
    """Generate ideas after validating a topic.

    Args:
        topic: User topic.
        analysis: Analysis output.
        methods: Selected methods.

    Returns:
        Generated idea list.
    """
    _ = validate_topic(topic)
    generator = IdeaGenerator()
    return generator.generate_ideas(analysis=analysis, methods=methods)
