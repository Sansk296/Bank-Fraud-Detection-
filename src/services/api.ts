/**
 * BFS – Bank Fraud Shield
 * Frontend API Service Layer
 */

const BASE_URL = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('bfs_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg) as any;
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

export const api = {
  // Authentication
  async register(data: { name: string; email: string; phone: string; password: string; confirmPassword: string }) {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<any>(res);
  },

  async login(data: { email: string; password: string }) {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<any>(res);
  },

  async logout() {
    try {
      await fetch(`${BASE_URL}/logout`, { method: 'POST', headers: getAuthHeaders() });
    } catch {
      // ignore
    }
    localStorage.removeItem('bfs_auth_token');
    localStorage.removeItem('bfs_user');
  },

  async getProfile() {
    const res = await fetch(`${BASE_URL}/users/profile`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  // Customer Accounts & Transactions
  async getAccounts() {
    const res = await fetch(`${BASE_URL}/accounts`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  async getTransactions() {
    const res = await fetch(`${BASE_URL}/transactions`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  async transferMoney(data: {
    senderAccountId?: number;
    receiverAccountNumber: string;
    amount: number;
    location: string;
    description?: string;
  }) {
    const res = await fetch(`${BASE_URL}/transactions/transfer`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<any>(res);
  },

  async getCustomerAlerts() {
    const res = await fetch(`${BASE_URL}/fraud-alerts`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  // Admin APIs
  async getAdminStats() {
    const res = await fetch(`${BASE_URL}/admin/stats`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  async getAdminUsers() {
    const res = await fetch(`${BASE_URL}/admin/users`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  async unlockUser(userId: number) {
    const res = await fetch(`${BASE_URL}/admin/users/${userId}/unlock`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse<any>(res);
  },

  async getAdminTransactions() {
    const res = await fetch(`${BASE_URL}/admin/transactions`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  async getAdminFraudAlerts() {
    const res = await fetch(`${BASE_URL}/admin/fraud-alerts`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  async getAdminInvestigation(alertId: number) {
    const res = await fetch(`${BASE_URL}/admin/investigations/${alertId}`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  async approveAlert(alertId: number) {
    const res = await fetch(`${BASE_URL}/admin/fraud-alerts/${alertId}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse<any>(res);
  },

  async rejectAlert(alertId: number) {
    const res = await fetch(`${BASE_URL}/admin/fraud-alerts/${alertId}/reject`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse<any>(res);
  },

  async getAdminLoginHistory() {
    const res = await fetch(`${BASE_URL}/admin/login-history`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  async submitIncidentAction(incidentId: number, action: 'Approve' | 'Reject' | 'Mark as Resolved' | 'Keep Under Review', remarks?: string) {
    const res = await fetch(`${BASE_URL}/admin/incidents/${incidentId}/action`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action, remarks })
    });
    return handleResponse<any>(res);
  },

  async getSecurityEvents() {
    const res = await fetch(`${BASE_URL}/admin/security-events`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  // Fraud Simulation Endpoints
  async simulateFailedLogin(email?: string) {
    const res = await fetch(`${BASE_URL}/admin/simulate/failed-login`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email })
    });
    return handleResponse<any>(res);
  },

  async simulateHighValue() {
    const res = await fetch(`${BASE_URL}/admin/simulate/high-value`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<any>(res);
  },

  async simulateRapidTransactions() {
    const res = await fetch(`${BASE_URL}/admin/simulate/rapid-transactions`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<any>(res);
  },

  async simulateImpossibleTravel() {
    const res = await fetch(`${BASE_URL}/admin/simulate/impossible-travel`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<any>(res);
  },

  // Customer Care & Support Tickets
  async getSupportTickets() {
    const res = await fetch(`${BASE_URL}/support/tickets`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  async getSupportTicketDetail(ticketId: number) {
    const res = await fetch(`${BASE_URL}/support/tickets/${ticketId}`, { headers: getAuthHeaders() });
    return handleResponse<any>(res);
  },

  async createSupportTicket(data: { subject: string; category?: string; priority?: string; message: string }) {
    const res = await fetch(`${BASE_URL}/support/tickets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<any>(res);
  },

  async replySupportTicket(ticketId: number, message: string) {
    const res = await fetch(`${BASE_URL}/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ message })
    });
    return handleResponse<any>(res);
  },

  async updateSupportTicketStatus(ticketId: number, status: string) {
    const res = await fetch(`${BASE_URL}/support/tickets/${ticketId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse<any>(res);
  }
};

