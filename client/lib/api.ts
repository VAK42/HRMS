const apiBase = '/api';
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('hrmsToken');
  }
  return null;
};
export const setToken = (token: string): void => {
  localStorage.setItem('hrmsToken', token);
};
export const removeToken = (): void => {
  localStorage.removeItem('hrmsToken');
};
export const apiRequest = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };
  const response = await fetch(`${apiBase}${endpoint}`, { ...options, headers });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Lỗi Hệ Thống');
  }
  return data;
};
export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: unknown) => apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) => apiRequest<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
  download: async (endpoint: string, filename: string) => {
    const token = getToken();
    const response = await fetch(`${apiBase}${endpoint}`, {
      headers: { ...(token && { Authorization: `Bearer ${token}` }) }
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Lỗi Tải File');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }
};