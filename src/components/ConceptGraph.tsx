import { useState } from 'react';
import './ConceptGraph.css';

interface ConceptNode {
  id: string;
  label: string;
  labelEn: string;
  description: string;
}

const nodes: ConceptNode[] = [
  {
    id: 'controller',
    label: 'Controller',
    labelEn: 'Presentation Layer',
    description: 'HTTP 요청을 받아 적절한 응답을 반환합니다. DTO를 사용하여 데이터를 주고받습니다.'
  },
  {
    id: 'dto',
    label: 'DTO',
    labelEn: 'Data Transfer Object',
    description: '계층 간 데이터 전송을 위한 객체입니다. View와 Controller, Controller와 Service 간 데이터를 전달합니다.'
  },
  {
    id: 'service',
    label: 'Service',
    labelEn: 'Business Logic Layer',
    description: '비즈니스 로직을 처리합니다. Entity와 DTO 간의 변환을 수행하고 DAO/Repository를 호출합니다.'
  },
  {
    id: 'entity',
    label: 'Entity',
    labelEn: 'Domain Model',
    description: '데이터베이스 테이블과 매핑되는 객체입니다. 영속성을 가지며 JPA가 관리합니다.'
  },
  {
    id: 'dao',
    label: 'DAO/Repository',
    labelEn: 'Data Access Layer',
    description: '데이터베이스에 접근하여 CRUD 작업을 수행합니다. Entity를 사용합니다.'
  },
  {
    id: 'database',
    label: 'Database',
    labelEn: 'Persistence',
    description: '실제 데이터가 저장되는 곳입니다. 테이블, 컬럼, 관계 등으로 구성됩니다.'
  }
];

export default function ConceptGraph() {
  const [selectedNode, setSelectedNode] = useState<ConceptNode | null>(null);

  return (
    <div className="concept-graph">
      <header className="concept-graph__header">
        <h3 className="concept-graph__title">계층 간 관계도</h3>
        <p className="concept-graph__subtitle">각 계층을 클릭하여 자세한 설명을 확인하세요</p>
      </header>

      <div className="concept-graph__container">
        <svg className="concept-graph__svg" viewBox="0 0 600 700" aria-label="DAO, DTO, Entity 관계도">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="var(--color-primary)" />
            </marker>
          </defs>

          <g className="concept-graph__connections">
            <line x1="300" y1="80" x2="300" y2="140" stroke="var(--color-primary)" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="300" y1="200" x2="300" y2="260" stroke="var(--color-primary)" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="300" y1="320" x2="300" y2="380" stroke="var(--color-primary)" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="300" y1="440" x2="300" y2="500" stroke="var(--color-primary)" strokeWidth="2" markerEnd="url(#arrowhead)" />
            <line x1="300" y1="560" x2="300" y2="620" stroke="var(--color-primary)" strokeWidth="2" markerEnd="url(#arrowhead)" />

            <line x1="400" y1="170" x2="400" y2="290" stroke="var(--color-secondary)" strokeWidth="2" strokeDasharray="5,5" />
            <line x1="200" y1="290" x2="200" y2="410" stroke="var(--color-secondary)" strokeWidth="2" strokeDasharray="5,5" />
          </g>

          {/* Controller */}
          <g
            className={`concept-graph__node ${selectedNode?.id === 'controller' ? 'concept-graph__node--active' : ''}`}
            onClick={() => setSelectedNode(nodes[0])}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && setSelectedNode(nodes[0])}
          >
            <rect x="200" y="20" width="200" height="60" rx="8" />
            <text x="300" y="45" textAnchor="middle" className="concept-graph__node-label">
              Controller
            </text>
            <text x="300" y="65" textAnchor="middle" className="concept-graph__node-sublabel">
              Presentation
            </text>
          </g>

          {/* DTO */}
          <g
            className={`concept-graph__node ${selectedNode?.id === 'dto' ? 'concept-graph__node--active' : ''}`}
            onClick={() => setSelectedNode(nodes[1])}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && setSelectedNode(nodes[1])}
          >
            <rect x="200" y="140" width="200" height="60" rx="8" />
            <text x="300" y="165" textAnchor="middle" className="concept-graph__node-label">
              DTO
            </text>
            <text x="300" y="185" textAnchor="middle" className="concept-graph__node-sublabel">
              Data Transfer
            </text>
          </g>

          {/* Service */}
          <g
            className={`concept-graph__node ${selectedNode?.id === 'service' ? 'concept-graph__node--active' : ''}`}
            onClick={() => setSelectedNode(nodes[2])}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && setSelectedNode(nodes[2])}
          >
            <rect x="200" y="260" width="200" height="60" rx="8" />
            <text x="300" y="285" textAnchor="middle" className="concept-graph__node-label">
              Service
            </text>
            <text x="300" y="305" textAnchor="middle" className="concept-graph__node-sublabel">
              Business Logic
            </text>
          </g>

          {/* Entity */}
          <g
            className={`concept-graph__node ${selectedNode?.id === 'entity' ? 'concept-graph__node--active' : ''}`}
            onClick={() => setSelectedNode(nodes[3])}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && setSelectedNode(nodes[3])}
          >
            <rect x="200" y="380" width="200" height="60" rx="8" />
            <text x="300" y="405" textAnchor="middle" className="concept-graph__node-label">
              Entity
            </text>
            <text x="300" y="425" textAnchor="middle" className="concept-graph__node-sublabel">
              Domain Model
            </text>
          </g>

          {/* DAO/Repository */}
          <g
            className={`concept-graph__node ${selectedNode?.id === 'dao' ? 'concept-graph__node--active' : ''}`}
            onClick={() => setSelectedNode(nodes[4])}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && setSelectedNode(nodes[4])}
          >
            <rect x="200" y="500" width="200" height="60" rx="8" />
            <text x="300" y="525" textAnchor="middle" className="concept-graph__node-label">
              DAO/Repository
            </text>
            <text x="300" y="545" textAnchor="middle" className="concept-graph__node-sublabel">
              Data Access
            </text>
          </g>

          {/* Database */}
          <g
            className={`concept-graph__node ${selectedNode?.id === 'database' ? 'concept-graph__node--active' : ''}`}
            onClick={() => setSelectedNode(nodes[5])}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && setSelectedNode(nodes[5])}
          >
            <rect x="200" y="620" width="200" height="60" rx="8" />
            <text x="300" y="645" textAnchor="middle" className="concept-graph__node-label">
              Database
            </text>
            <text x="300" y="665" textAnchor="middle" className="concept-graph__node-sublabel">
              Persistence
            </text>
          </g>
        </svg>

        {selectedNode && (
          <aside className="concept-graph__info" role="complementary">
            <div className="concept-graph__info-header">
              <h4 className="concept-graph__info-title">{selectedNode.label}</h4>
              <span className="concept-graph__info-subtitle">{selectedNode.labelEn}</span>
            </div>
            <p className="concept-graph__info-description">{selectedNode.description}</p>
            <button
              onClick={() => setSelectedNode(null)}
              className="concept-graph__info-close"
              aria-label="설명 닫기"
            >
              닫기
            </button>
          </aside>
        )}
      </div>
    </div>
  );
}
