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
  createAvailabilityRequest: (payload: any) =>
    request('/requests', { method: 'POST', body: JSON.stringify(payload) }),
  vendorRequests: () => request('/requests/vendor'),
  requestsByPhone: (phone: string) => request(`/requests/by-phone/${encodeURIComponent(phone)}`),
  quoteRequest: (id: string, quotedTotal: number, sellerNote?: string) =>
    request(`/requests/${id}/quote`, { method: 'PATCH', body: JSON.stringify({ quotedTotal, sellerNote }) }),
  updateRequestStatus: (id: string, status: string) =>
    request(`/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  createOrder: (requestId: string) => request('/orders', { method: 'POST', body: JSON.stringify({ requestId }) }),
  payOrderInstapay: (orderId: string) => request(`/orders/${orderId}/pay/instapay`, { method: 'POST' }),
  vendorOrders: () => request('/orders/vendor'),
};
