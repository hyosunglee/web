/**
 * collector.js - Research source adapters
 */

class BaseCollector {
  async fetch(query) {
    throw new Error('Not implemented');
  }
}

class ArxivCollector extends BaseCollector {
  async fetch(query) {
    // Mocking arXiv API
    console.log(`[ArxivCollector] Fetching for: ${query}`);
    return [
      { id: 'arxiv:1', title: 'Attention is All You Need', summary: 'Vaswani et al.', link: 'https://arxiv.org/abs/1706.03762' }
    ];
  }
}

class OpenAlexCollector extends BaseCollector {
  async fetch(query) {
    // Mocking OpenAlex API
    console.log(`[OpenAlexCollector] Fetching for: ${query}`);
    return [
      { id: 'oa:1', display_name: 'Deep Residual Learning for Image Recognition', abstract: 'He et al.' }
    ];
  }
}

class MockCollector extends BaseCollector {
  async fetch(query) {
    return [
      { id: 'mock:1', title: 'A Survey of Large Language Models', summary: 'A comprehensive review...', tags: ['LLM', 'AI'] }
    ];
  }
}

export const collectors = {
  arxiv: new ArxivCollector(),
  openalex: new OpenAlexCollector(),
  mock: new MockCollector()
};

/**
 * Retry policy with simple backoff
 */
export async function withRetry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    console.warn(`Retrying... (${retries} left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1, delay * 2);
  }
}

export default {
  collectors,
  withRetry
};
