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
  async importProducts(data: { supplierUrl: string; supplierName?: string; category?: string; brand?: string }) {
    return apiFetch('/api/import-products', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async bulkCreateProducts(products: any[]) {
    return apiFetch('/api/products/bulk', {
      method: 'POST',
      body: JSON.stringify({ products })
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
  async getCustomers() {
    return apiFetch('/api/customers');
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

  // Settings
  async getSettings() {
    return apiFetch('/api/settings');
  },
  async updateSettings(data: {
    siteName?: string;
    logoUrl?: string;
    whatsappNumber?: string;
    currency?: string;
    deliveryFee?: string;
    supportEmail?: string;
    exchangeRates?: Record<string, number>;
    shippingPercentage?: number;
    handlingPercentage?: number;
    riskBufferPercentage?: number;
    profitPercentage?: number;
    fixedFeeETB?: number;
    roundingRule?: string;
    recalculateMode?: 'future' | 'draft' | 'all' | 'selected';
    selectedProductIds?: number[];
  }) {
    return apiFetch('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  async bulkRecalculatePrices(mode: 'all' | 'draft' | 'selected', productIds?: number[]) {
    return apiFetch('/api/pricing/recalculate', {
      method: 'POST',
      body: JSON.stringify({ mode, productIds })
    });
  },

  // Analytics
  async getAnalytics() {
    return apiFetch('/api/analytics');
  },

  // Purchase Queue
  async getPurchaseTasks() {
    return apiFetch('/api/purchase-tasks');
  },
  async createPurchaseTask(data: { orderId: number; productSku: string; productName: string; quantity: number; selectedSize?: string; selectedColor?: string; supplierId?: string; supplierPriceAED?: number; notes?: string }) {
    return apiFetch('/api/purchase-tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  async updatePurchaseTaskStatus(id: number, data: { purchaseStatus?: string; notes?: string; supplierId?: string; supplierPriceAED?: number }) {
    return apiFetch(`/api/purchase-tasks/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },
  async bulkUpdatePurchaseTasksStatus(ids: number[], purchaseStatus: string) {
    return apiFetch('/api/purchase-tasks/bulk-status', {
      method: 'PUT',
      body: JSON.stringify({ ids, purchaseStatus })
    });
  },
  async bulkDeletePurchaseTasks(ids: number[]) {
    return apiFetch('/api/purchase-tasks/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids })
    });
  },

  // Universal Import Engine helpers
  async getImportHistory() {
    return apiFetch('/api/import-jobs');
  },
  async getImportJobItems(jobId: number) {
    return apiFetch(`/api/import-jobs/${jobId}/items`);
  },
  async createImportJob(jobData: any) {
    return apiFetch('/api/import-jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
  },
  async deleteImportJob(id: number) {
    return apiFetch(`/api/import-jobs/${id}`, {
      method: 'DELETE'
    });
  },
  async getImportTemplates() {
    return apiFetch('/api/import-templates');
  },
  async saveImportTemplate(name: string, mapping: any) {
    return apiFetch('/api/import-templates', {
      method: 'POST',
      body: JSON.stringify({ name, mapping })
    });
  },
  async deleteImportTemplate(id: number) {
    return apiFetch(`/api/import-templates/${id}`, {
      method: 'DELETE'
    });
  },

  // Catalog Classification System APIs
  async getSuppliers() {
    return apiFetch('/api/suppliers');
  },
  async createSupplier(name: string) {
    return apiFetch('/api/suppliers', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
  },
  async updateSupplier(id: number, data: { name?: string; isArchived?: boolean }) {
    return apiFetch(`/api/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async getBrands() {
    return apiFetch('/api/brands');
  },
  async createBrand(name: string) {
    return apiFetch('/api/brands', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
  },
  async updateBrand(id: number, data: { name?: string; isArchived?: boolean }) {
    return apiFetch(`/api/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async getDepartments() {
    return apiFetch('/api/departments');
  },
  async createDepartment(name: string) {
    return apiFetch('/api/departments', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
  },
  async updateDepartment(id: number, data: { name?: string; isArchived?: boolean }) {
    return apiFetch(`/api/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async getCategories() {
    return apiFetch('/api/categories');
  },
  async createCategory(name: string) {
    return apiFetch('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
  },
  async updateCategory(id: number, data: { name?: string; isArchived?: boolean }) {
    return apiFetch(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async getSubcategories(categoryId?: number) {
    const query = categoryId ? `?categoryId=${categoryId}` : '';
    return apiFetch(`/api/subcategories${query}`);
  },
  async createSubcategory(name: string, categoryId: number) {
    return apiFetch('/api/subcategories', {
      method: 'POST',
      body: JSON.stringify({ name, categoryId })
    });
  },
  async updateSubcategory(id: number, data: { name?: string; categoryId?: number; isArchived?: boolean }) {
    return apiFetch(`/api/subcategories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async getSupplierPreset(supplier: string) {
    return apiFetch(`/api/import-templates/supplier/${encodeURIComponent(supplier)}`);
  },
  async saveSupplierPreset(supplier: string, preset: any) {
    return apiFetch(`/api/import-templates/supplier/${encodeURIComponent(supplier)}`, {
      method: 'POST',
      body: JSON.stringify({ preset })
    });
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
