const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:6500/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  listProducts: () => request('/products'),
  createProduct: (data: FormData) =>
    fetch(`${API_BASE}/products`, { method: 'POST', body: data, credentials: 'include' }).then(async (res) => {
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Upload failed');
      return res.json();
    }),
  createQuoteRequest: (payload: any) =>
    request('/quotes', { method: 'POST', body: JSON.stringify(payload) }),
  listQuoteRequests: () => request('/quotes'),
  getWhatsAppSettings: () => request('/settings/whatsapp'),
  updateWhatsAppSettings: (payload: { phoneNumber: string; messageTemplate: string }) =>
    request('/settings/whatsapp', { method: 'PUT', body: JSON.stringify(payload) }),
};
