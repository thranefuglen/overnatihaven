import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { logger } from '../config/logger';

const ALLOWED_GITHUB_USERS = ['thranefuglen'];

export class GitHubOAuthService {
  /**
   * Build GitHub authorization URL with signed CSRF state parameter
   */
  getAuthorizationUrl(): string {
    const nonce = crypto.randomBytes(16).toString('hex');
    const options: SignOptions = { expiresIn: '10m' as any };
    const state = jwt.sign({ nonce, type: 'oauth_state' }, config.jwtSecret, options);

    const params = new URLSearchParams({
      client_id: config.github.clientId,
      redirect_uri: config.github.callbackUrl,
      scope: 'read:user',
      state,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Validate CSRF state parameter from OAuth callback
   */
  validateState(state: string): boolean {
    try {
      const decoded = jwt.verify(state, config.jwtSecret) as any;
      return decoded.type === 'oauth_state';
    } catch {
      return false;
    }
  }

  /**
   * Exchange OAuth authorization code for GitHub access token
   */
  async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
        redirect_uri: config.github.callbackUrl,
      }),
    });

    const data = await response.json() as any;

    if (data.error || !data.access_token) {
      logger.error('GitHub token exchange failed', { error: data.error });
      throw new Error('Failed to exchange code for token');
    }

    return data.access_token;
  }

  /**
   * Fetch GitHub username for the given access token
   */
  async getGitHubUser(accessToken: string): Promise<string> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'overnatihaven',
      },
    });

    const data = await response.json() as any;

    if (!data.login) {
      throw new Error('Failed to get GitHub user info');
    }

    return data.login;
  }

  /**
   * Check if a GitHub username is on the allow list
   */
  isAllowedUser(username: string): boolean {
    return ALLOWED_GITHUB_USERS.includes(username);
  }
}

export const githubOAuthService = new GitHubOAuthService();
