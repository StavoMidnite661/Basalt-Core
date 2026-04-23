const API_BASE = '/api';
class ApiClient {
  private token: string | null = localStorage.getItem('sovrcor_token');
  setToken(token: string | null) {
    this.token = token;
    if (token) localStorage.setItem('sovrcor_token', token);
    else localStorage.removeItem('sovrcor_token');
  }
  getToken() { return this.token; }
  async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = { 'Content-Type': 'application/json', ...(this.token ? { 'Authorization': `Bearer ${this.token}` } : {}) };
    const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (response.status === 401) this.setToken(null);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'API_ERROR' }));
      return { error: error.error, status: response.status };
    }
    return response.json();
  }
  async login(credentials: any) {
    const data = await this.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
    if (data.error) throw new Error(data.error);
    this.setToken(data.token);
    return data;
  }
  async getAccounts() { return this.request('/ledger/accounts'); }
  async getTransfers() { return this.request('/ledger/transfers'); }
  async createTransfer(transfer: any) {
    const data = await this.request('/ledger/transfers', { method: 'POST', body: JSON.stringify(transfer) });
    if (data.error) throw new Error(data.error);
    return data;
  }
  async getAuditLogs() { return this.request('/ledger/audit'); }
  async submitProof(proof: any) {
    const data = await this.request('/performance/proofs', { method: 'POST', body: JSON.stringify(proof) });
    if (data.error) throw new Error(data.error);
    return data;
  }
}
export const api = new ApiClient();
