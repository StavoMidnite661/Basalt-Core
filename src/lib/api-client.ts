import { randomUUID, createHash } from 'crypto';

const API_BASE = '/api';

class ApiClient {
  private token: string | null = localStorage.getItem('sovrcor_token');

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('sovrcor_token', token);
    } else {
      localStorage.removeItem('sovrcor_token');
    }
  }

  getToken() {
    return this.token;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    // Determine the base URL. In development, we use relative /api (proxied).
    // In some environments, we might need a full URL if proxying fails.
    const baseUrl = '';

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}),
      ...((options.headers as any) || {}),
    };

    const response = await fetch(`${baseUrl}${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
       // Auto logout on unauthorized
       this.setToken(null);
       // window.location.reload(); // Removing reload to prevent loops if we can handle errors
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'UNKNOWN_ERROR' }));
      return { error: error.error || 'API_ERROR', status: response.status };
    }

    return response.json();
  }

  // Auth
  async login(credentials: any) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.error) throw new Error(data.error);
    this.setToken(data.token);
    return data;
  }

  // Ledger
  async getAccounts() {
    return this.request('/ledger/accounts');
  }

  async getTransfers() {
    return this.request('/ledger/transfers');
  }

  async createTransfer(transfer: any) {
    const data = await this.request('/ledger/transfers', {
      method: 'POST',
      body: JSON.stringify(transfer),
    });
    if (data.error) throw new Error(data.error);
    return data;
  }

  async getAuditLogs() {
    return this.request('/ledger/audit');
  }

  // Performance
  async submitProof(proof: any) {
    const data = await this.request('/performance/proofs', {
      method: 'POST',
      body: JSON.stringify(proof),
    });
    if (data.error) throw new Error(data.error);
    return data;
  }

  async getProofs() {
    return this.request('/performance/proofs');
  }
}

export const api = new ApiClient();
