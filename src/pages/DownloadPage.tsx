import { Link } from 'react-router-dom';
import './DownloadPage.css';

export default function DownloadPage() {
  return (
    <div className="download-page">
      <header className="download-page__header">
        <div className="container">
          <Link to="/" className="download-page__back-link">
            ← 홈으로 돌아가기
          </Link>
          <h1 className="download-page__title">참고 자료 다운로드</h1>
        </div>
      </header>

      <main className="download-page__main">
        <div className="container">
          <section className="download-page__section">
            <div className="download-page__card">
              <div className="download-page__card-icon">📄</div>
              <h2 className="download-page__card-title">DAO, DTO, Entity 완벽 가이드</h2>
              <p className="download-page__card-description">
                이 웹사이트의 모든 내용을 정리한 PDF 문서입니다. 오프라인에서도 학습할 수 있도록
                다운로드하여 보관하세요.
              </p>
              <div className="download-page__card-details">
                <span className="download-page__detail-item">
                  <strong>포함 내용:</strong>
                </span>
                <ul className="download-page__detail-list">
                  <li>계층 구조 다이어그램</li>
                  <li>전체 용어 사전</li>
                  <li>상세 시나리오 설명</li>
                  <li>코드 예제</li>
                  <li>모범 사례 및 팁</li>
                </ul>
              </div>
              <a
                href="/dao-dto-reference.pdf"
                download
                className="download-page__button"
                aria-label="PDF 참고 자료 다운로드"
              >
                📥 PDF 다운로드
              </a>
            </div>
          </section>

          <section className="download-page__section">
            <h2 className="download-page__section-title">추가 학습 자료</h2>
            <div className="download-page__resources">
              <article className="download-page__resource">
                <h3 className="download-page__resource-title">원본 블로그 글</h3>
                <p className="download-page__resource-description">
                  이 가이드의 기반이 된 상세한 블로그 글을 읽어보세요.
                </p>
                <a
                  href="https://gmlwjd9405.github.io/2018/12/25/difference-dao-dto-entity.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-page__resource-link"
                >
                  블로그 방문하기 →
                </a>
              </article>

              <article className="download-page__resource">
                <h3 className="download-page__resource-title">Spring Data JPA 공식 문서</h3>
                <p className="download-page__resource-description">
                  Repository 패턴에 대해 더 알아보고 싶다면 공식 문서를 참고하세요.
                </p>
                <a
                  href="https://spring.io/projects/spring-data-jpa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-page__resource-link"
                >
                  문서 보기 →
                </a>
              </article>

              <article className="download-page__resource">
                <h3 className="download-page__resource-title">JPA 영속성 컨텍스트 이해하기</h3>
                <p className="download-page__resource-description">
                  Entity의 생명주기와 영속성 컨텍스트에 대한 심화 학습 자료입니다.
                </p>
                <a
                  href="https://docs.oracle.com/javaee/7/tutorial/persistence-intro.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="download-page__resource-link"
                >
                  자료 보기 →
                </a>
              </article>
            </div>
          </section>

          <section className="download-page__section">
            <div className="download-page__info-box">
              <h2 className="download-page__info-title">💡 학습 팁</h2>
              <ul className="download-page__info-list">
                <li>각 계층의 역할과 책임을 명확히 구분하여 이해하세요.</li>
                <li>실제 프로젝트에 적용하면서 패턴의 장점을 체감해보세요.</li>
                <li>DTO를 사용하여 계층 간 결합도를 낮추는 연습을 하세요.</li>
                <li>Entity는 비즈니스 로직을 포함할 수 있지만, 계층 간 전달용으로는 사용하지 마세요.</li>
                <li>테스트 코드 작성 시 각 계층을 독립적으로 테스트할 수 있어야 합니다.</li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      <footer className="download-page__footer">
        <div className="container">
          <p>궁금한 점이 있으시면 언제든지 질문해주세요!</p>
        </div>
      </footer>
    </div>
  );
}
