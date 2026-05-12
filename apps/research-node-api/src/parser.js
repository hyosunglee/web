/**
 * parser.js - Standardize research artifacts
 */

function parseArxiv(data) {
  return {
    id: data.id,
    title: data.title,
    summary: data.summary,
    tags: ['arXiv'],
    confidence: 0.95,
    source: 'arxiv',
    metadata: { link: data.link }
  };
}

function parseOpenAlex(data) {
  return {
    id: data.id,
    title: data.display_name,
    summary: data.abstract,
    tags: ['OpenAlex'],
    confidence: 0.85,
    source: 'openalex',
    metadata: {}
  };
}

function parseMock(data) {
  return {
    id: data.id,
    title: data.title,
    summary: data.summary,
    tags: data.tags || ['Mock'],
    confidence: 1.0,
    source: 'mock',
    metadata: {}
  };
}

/**
 * Standardizes any input into KnowledgeArtifact
 */
export function toKnowledgeArtifact(source, data) {
  switch (source) {
    case 'arxiv': return parseArxiv(data);
    case 'openalex': return parseOpenAlex(data);
    case 'mock': return parseMock(data);
    default:
      throw new Error(`Unknown source: ${source}`);
  }
}
