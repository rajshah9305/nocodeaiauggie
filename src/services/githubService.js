/**
 * GitHub Integration Service
 * Handles saving and loading code from GitHub
 */

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Save code to GitHub Gist
 * Requires GitHub token
 */
export const saveToGitHubGist = async (code, filename = 'app.html', description = 'Generated with RAJ AI APP Builder', token) => {
  if (!token) {
    throw new Error('GitHub token is required');
  }

  if (!code) {
    throw new Error('Code is required');
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/gists`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        public: true,
        files: {
          [filename]: {
            content: code,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      url: data.html_url,
      rawUrl: data.files[filename].raw_url,
    };
  } catch (error) {
    throw new Error(`Failed to save to GitHub: ${error.message}`);
  }
};

/**
 * Load code from GitHub Gist
 */
export const loadFromGitHubGist = async (gistId) => {
  if (!gistId) {
    throw new Error('Gist ID is required');
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/gists/${gistId}`);

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    const files = data.files;
    const firstFile = Object.values(files)[0];

    return {
      code: firstFile.content,
      filename: firstFile.filename,
      description: data.description,
      url: data.html_url,
    };
  } catch (error) {
    throw new Error(`Failed to load from GitHub: ${error.message}`);
  }
};

/**
 * Create a shareable GitHub link
 */
export const createShareableLink = (gistId) => {
  return `${window.location.origin}?gist=${gistId}`;
};

/**
 * Parse GitHub Gist ID from URL
 */
export const parseGistIdFromUrl = (url) => {
  const match = url.match(/gist\.github\.com\/[^/]*\/([a-f0-9]+)/);
  return match ? match[1] : null;
};

/**
 * Save to GitHub Repository
 * Requires GitHub token and repository info
 */
export const saveToGitHubRepository = async (
  code,
  filename,
  message,
  token,
  owner,
  repo,
  branch = 'main'
) => {
  if (!token || !owner || !repo) {
    throw new Error('GitHub token, owner, and repo are required');
  }

  try {
    // Get current file SHA if it exists
    let sha = null;
    try {
      const getResponse = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${filename}?ref=${branch}`,
        {
          headers: {
            'Authorization': `token ${token}`,
          },
        }
      );

      if (getResponse.ok) {
        const data = await getResponse.json();
        sha = data.sha;
      }
    } catch {
      // File doesn't exist yet, that's fine
    }

    // Create or update file
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${filename}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          content: btoa(code), // Base64 encode
          branch,
          ...(sha && { sha }),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      url: data.content.html_url,
      sha: data.content.sha,
    };
  } catch (error) {
    throw new Error(`Failed to save to GitHub repository: ${error.message}`);
  }
};

/**
 * Load from GitHub Repository
 */
export const loadFromGitHubRepository = async (owner, repo, filename, branch = 'main') => {
  if (!owner || !repo || !filename) {
    throw new Error('Owner, repo, and filename are required');
  }

  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${filename}?ref=${branch}`
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    const code = atob(data.content); // Base64 decode

    return {
      code,
      sha: data.sha,
      url: data.html_url,
    };
  } catch (error) {
    throw new Error(`Failed to load from GitHub repository: ${error.message}`);
  }
};

/**
 * Get user's GitHub repositories
 */
export const getUserRepositories = async (token) => {
  if (!token) {
    throw new Error('GitHub token is required');
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/user/repos?per_page=100`, {
      headers: {
        'Authorization': `token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.map((repo) => ({
      name: repo.name,
      owner: repo.owner.login,
      url: repo.html_url,
      description: repo.description,
    }));
  } catch (error) {
    throw new Error(`Failed to fetch repositories: ${error.message}`);
  }
};

/**
 * Validate GitHub token
 */
export const validateGitHubToken = async (token) => {
  if (!token) {
    throw new Error('GitHub token is required');
  }

  try {
    const response = await fetch(`${GITHUB_API_BASE}/user`, {
      headers: {
        'Authorization': `token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Invalid GitHub token');
    }

    const data = await response.json();
    return {
      valid: true,
      username: data.login,
      name: data.name,
    };
  } catch (error) {
    throw new Error(`Failed to validate GitHub token: ${error.message}`);
  }
};

