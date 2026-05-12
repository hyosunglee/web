/**
 * seed.js - Bootstrap initial data
 */

import store from './store.js';
import { toKnowledgeArtifact } from './parser.js';

export async function seed() {
  console.log('Seeding initial data...');

  const sampleTasks = [
    { id: 't1', title: 'Research LLM Safety', stage: 'research', status: 'active' },
    { id: 't2', title: 'Analyze Agent Behavior', stage: 'analyze', status: 'pending' },
    { id: 't3', title: 'Ship PR #123', stage: 'ship', status: 'completed' }
  ];

  for (const task of sampleTasks) {
    await store.addTask(task);
  }

  const sampleArtifacts = [
    toKnowledgeArtifact('mock', { id: 'm1', title: 'Self-Improving Agents', summary: 'Paper about recursive self-improvement.', tags: ['AGI', 'Safety'] }),
    toKnowledgeArtifact('arxiv', { id: 'ax1', title: 'Language Models are Few-Shot Learners', summary: 'GPT-3 paper.', link: 'https://arxiv.org/abs/2005.14165' })
  ];

  for (const art of sampleArtifacts) {
    await store.addArtifact(art);
  }

  console.log('Seed completed.');
}

import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed();
}

export default seed;
