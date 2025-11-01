import { Link } from 'react-router-dom';
import GlossaryCard from '@components/GlossaryCard';
import ScenarioStepper from '@components/ScenarioStepper';
import ConceptGraph from '@components/ConceptGraph';
import { glossaryData } from '@data/glossary';
import { scenariosData } from '@data/scenarios';
import { useContentSearch } from '@hooks/useContentSearch';
import './HomePage.css';

export default function HomePage() {
  const { searchQuery, setSearchQuery, filteredItems } = useContentSearch(
    glossaryData,
    ['term', 'termEn', 'definition']
  );

  return (
    <div className="home-page">
      <header className="home-page__header">
        <div className="container">
          <h1 className="home-page__title">DAO, DTO, Entity 패턴 가이드</h1>
          <p className="home-page__description">
            계층화된 아키텍처에서 데이터가 어떻게 이동하고 변환되는지 이해하세요
          </p>
          <nav className="home-page__nav" aria-label="주요 네비게이션">
            <Link to="/download" className="home-page__nav-link">
              📥 참고 자료 다운로드
            </Link>
          </nav>
        </div>
      </header>

      <main className="home-page__main">
        <div className="container">
          <section className="home-page__section">
            <h2 className="home-page__section-title">계층 구조 이해하기</h2>
            <ConceptGraph />
          </section>

          <section className="home-page__section">
            <h2 className="home-page__section-title">시나리오로 배우기</h2>
            <div className="home-page__scenarios">
              {scenariosData.map((scenario) => (
                <ScenarioStepper key={scenario.id} scenario={scenario} />
              ))}
            </div>
          </section>

          <section className="home-page__section">
            <h2 className="home-page__section-title">용어 사전</h2>
            <div className="home-page__search">
              <input
                type="search"
                placeholder="용어 검색... (예: DAO, Entity, Repository)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="home-page__search-input"
                aria-label="용어 검색"
              />
              {searchQuery && (
                <p className="home-page__search-results">
                  {filteredItems.length}개의 결과를 찾았습니다
                </p>
              )}
            </div>
            <div className="home-page__glossary">
              {filteredItems.map((entry, idx) => (
                <GlossaryCard key={idx} entry={entry} />
              ))}
              {filteredItems.length === 0 && searchQuery && (
                <p className="home-page__no-results">
                  검색 결과가 없습니다. 다른 검색어를 시도해보세요.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="home-page__footer">
        <div className="container">
          <p>
            학습 자료는{' '}
            <a
              href="https://gmlwjd9405.github.io/2018/12/25/difference-dao-dto-entity.html"
              target="_blank"
              rel="noopener noreferrer"
            >
              이 블로그 글
            </a>
            을 참고하여 제작되었습니다.
          </p>
        </div>
      </footer>
    </div>
  );
}
