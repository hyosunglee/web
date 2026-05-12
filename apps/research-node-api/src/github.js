/**
 * github.js - GitHub client abstraction
 */

export class GitHubClient {
  constructor(token) {
    this.token = token;
    this.isMock = !token || token === 'mock-token';
  }

  async createBranch(repo, branchName) {
    console.log(`[GitHub] Creating branch ${branchName} in ${repo}`);
    if (this.isMock) return { success: true, branch: branchName };
    // Actual implementation would use octokit
    throw new Error('NOT_IMPLEMENTED');
  }

  async createCommit(repo, branch, message, files) {
    console.log(`[GitHub] Creating commit in ${branch}: ${message}`);
    if (this.isMock) return { success: true, sha: 'mock-sha' };
    throw new Error('NOT_IMPLEMENTED');
  }

  async createPR(repo, head, base, title, body) {
    console.log(`[GitHub] Creating PR: ${title}`);
    if (this.isMock) {
      return {
        success: true,
        number: Math.floor(Math.random() * 1000),
        url: `https://github.com/${repo}/pull/mock`
      };
    }
    throw new Error('NOT_IMPLEMENTED');
  }

  async getPR(repo, number) {
    if (this.isMock) return { number, status: 'open', title: 'Mock PR' };
    throw new Error('NOT_IMPLEMENTED');
  }
}

export const client = new GitHubClient(process.env.GITHUB_TOKEN || 'mock-token');

export default {
  GitHubClient,
  client
};
