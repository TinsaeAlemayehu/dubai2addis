import { auth } from './firebase.ts';

// Get current user ID token
export async function getAuthHeader() {
  const localToken = localStorage.getItem('local_auth_token');
  if (localToken) {
    return { 'Authorization': `Bearer ${localToken}` };
  }
  const user = auth.currentUser;
  if (!user) return {};
  try {
    const token = await user.getIdToken();
    return { 'Authorization': `Bearer ${token}` };
  } catch (err) {
    return {};
  }
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = await getAuthHeader();
  
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...options.headers,
    }
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Typed API Requests
export const apiClient = {
  // Products
  async getProducts(params: Record<string, string> = {}) {
    const query = new URLSearchParams(params).toString();
    return apiFetch(`/api/products?${query}`);
  },
  async getProduct(id: string | number) {
    return apiFetch(`/api/products/${id}`);
  },
  async createProduct(data: any) {
    return apiFetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async updateProduct(id: number, data: any) {
    return apiFetch(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  async deleteProduct(id: number) {
    return apiFetch(`/api/products/${id}`, {
      method: 'DELETE'
    });
  },

  // Orders
  async getOrders() {
    return apiFetch('/api/orders');
  },
  async createOrder(data: any) {
    return apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async updateOrderStatus(id: number, status: string) {
    return apiFetch(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  },

  // Users & Roles
  async getProfile() {
    return apiFetch('/api/users/profile');
  },
  async updateProfile(data: any) {
    return apiFetch('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  async updateWishlist(wishlist: string[]) {
    return apiFetch('/api/users/wishlist', {
      method: 'PUT',
      body: JSON.stringify({ wishlist })
    });
  },
  async getUsers() {
    return apiFetch('/api/users');
  },
  async updateUserRole(id: number, role: string) {
    return apiFetch(`/api/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  },

  // Banners
  async getBanners() {
    return apiFetch('/api/banners');
  },
  async createBanner(data: any) {
    return apiFetch('/api/banners', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Analytics
  async getAnalytics() {
    return apiFetch('/api/analytics');
  },

  // Auth Operations
  async login(data: { email: string; password?: string }) {
    return apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async register(data: { email: string; password?: string; name?: string; phone?: string; whatsapp?: string; address?: string; city?: string }) {
    return apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
