import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api.ts';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  Truck, 
  Check, 
  AlertTriangle,
  UserCheck, 
  Settings, 
  X,
  PieChart,
  BarChart,
  LayoutDashboard,
  Megaphone
} from 'lucide-react';

interface AdminDashboardProps {
  user: any;
  onClose: () => void;
  onRefreshProducts: () => void;
}

export default function AdminDashboard({ user, onClose, onRefreshProducts }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'orders' | 'users' | 'banners'>('analytics');
  
  // Analytics State
  const [analytics, setAnalytics] = useState<any>(null);
  
  // Products Management State
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
  // Orders Management State
  const [ordersList, setOrdersList] = useState<any[]>([]);
  
  // User Management State (Super Admin Only)
  const [usersList, setUsersList] = useState<any[]>([]);
  
  // Banners Management State
  const [bannersList, setBannersList] = useState<any[]>([]);
  const [newBannerImg, setNewBannerImg] = useState('');
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');

  // Form state for creating/editing product
  const [prodForm, setProdForm] = useState({
    id: null,
    sku: '',
    name: '',
    description: '',
    category: 'dresses',
    subcategory: '',
    brand: '',
    priceETB: '',
    originalPriceETB: '',
    sizes: 'XS, S, M, L, XL',
    colors: [
      { name: 'Classic Black', hex: '#111111' },
      { name: 'Satin Gold', hex: '#d4af37' }
    ],
    images: '',
    isFeatured: false,
    isNewArrival: false,
    quantityAvailable: '10',
    lowStockAlertThreshold: '3'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch initial data
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'analytics') {
        const data = await apiClient.getAnalytics();
        setAnalytics(data);
      } else if (activeTab === 'products') {
        const data = await apiClient.getProducts();
        setProducts(data);
      } else if (activeTab === 'orders') {
        const data = await apiClient.getOrders();
        setOrdersList(data);
      } else if (activeTab === 'users' && user?.role === 'SUPER_ADMIN') {
        const data = await apiClient.getUsers();
        setUsersList(data);
      } else if (activeTab === 'banners') {
        const data = await apiClient.getBanners();
        setBannersList(data);
      }
    } catch (err: any) {
      console.error(err);
      setMessage(`Error loading data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const payload = {
        ...prodForm,
        priceETB: parseInt(prodForm.priceETB),
        originalPriceETB: prodForm.originalPriceETB ? parseInt(prodForm.originalPriceETB) : null,
        sizes: prodForm.sizes.split(',').map(s => s.trim()).filter(Boolean),
        colors: prodForm.colors,
        images: prodForm.images.split('\n').map(i => i.trim()).filter(Boolean),
        quantityAvailable: parseInt(prodForm.quantityAvailable),
        lowStockAlertThreshold: parseInt(prodForm.lowStockAlertThreshold)
      };

      if (editingProduct) {
        await apiClient.updateProduct(editingProduct.id, payload);
        setMessage('Product updated successfully!');
      } else {
        await apiClient.createProduct(payload);
        setMessage('Product created successfully!');
      }

      setIsAddingProduct(false);
      setEditingProduct(null);
      loadData();
      onRefreshProducts();
    } catch (err: any) {
      setMessage(`Error saving product: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product from the master catalog?')) return;
    try {
      await apiClient.deleteProduct(id);
      setMessage('Product deleted successfully');
      loadData();
      onRefreshProducts();
    } catch (err: any) {
      setMessage(`Error deleting product: ${err.message}`);
    }
  };

  const handleOrderStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await apiClient.updateOrderStatus(orderId, newStatus);
      setMessage('Order status updated successfully');
      loadData();
    } catch (err: any) {
      setMessage(`Error updating order: ${err.message}`);
    }
  };

  const handleUserRoleUpdate = async (userId: number, newRole: string) => {
    try {
      await apiClient.updateUserRole(userId, newRole);
      setMessage('User role updated successfully');
      loadData();
    } catch (err: any) {
      setMessage(`Error updating user role: ${err.message}`);
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerImg) return;
    try {
      await apiClient.createBanner({
        title: newBannerTitle,
        subtitle: newBannerSubtitle,
        imageUrl: newBannerImg,
        link: '#catalog',
        active: true
      });
      setNewBannerImg('');
      setNewBannerTitle('');
      setNewBannerSubtitle('');
      setMessage('New homepage banner added successfully');
      loadData();
    } catch (err: any) {
      setMessage(`Error creating banner: ${err.message}`);
    }
  };

  const handleEditProductClick = (p: any) => {
    setEditingProduct(p);
    setProdForm({
      id: p.id,
      sku: p.sku || '',
      name: p.name || '',
      description: p.description || '',
      category: p.category || 'dresses',
      subcategory: p.subcategory || '',
      brand: p.brand || '',
      priceETB: p.priceETB?.toString() || '',
      originalPriceETB: p.originalPriceETB?.toString() || '',
      sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : '',
      colors: Array.isArray(p.colors) ? p.colors : [],
      images: Array.isArray(p.images) ? p.images.join('\n') : '',
      isFeatured: !!p.isFeatured,
      isNewArrival: !!p.isNewArrival,
      quantityAvailable: p.quantityAvailable?.toString() || '10',
      lowStockAlertThreshold: p.lowStockAlertThreshold?.toString() || '3'
    });
    setIsAddingProduct(true);
  };

  const handleNewProductClick = () => {
    setEditingProduct(null);
    setProdForm({
      id: null,
      sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      name: '',
      description: '',
      category: 'dresses',
      subcategory: '',
      brand: 'Dubai Import',
      priceETB: '',
      originalPriceETB: '',
      sizes: 'XS, S, M, L, XL',
      colors: [
        { name: 'Classic Black', hex: '#111111' },
        { name: 'Satin Gold', hex: '#d4af37' }
      ],
      images: '',
      isFeatured: false,
      isNewArrival: true,
      quantityAvailable: '10',
      lowStockAlertThreshold: '3'
    });
    setIsAddingProduct(true);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 overflow-y-auto flex items-center justify-center p-4 md:p-8">
      <div className="bg-white w-full max-w-7xl rounded-md border border-neutral-100 shadow-2xl flex flex-col min-h-[85vh] max-h-[92vh] overflow-hidden font-sans">
        
        {/* Shopify-style Admin Header bar */}
        <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <LayoutDashboard className="h-5 w-5 text-[#D4AF37]" strokeWidth={2.5} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans font-black tracking-widest text-[#D4AF37] uppercase text-[10px]">Dubai2Addis</span>
                <span className="bg-white/10 text-white text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded-none uppercase">
                  {user?.role} PANEL
                </span>
              </div>
              <h1 className="text-sm font-bold text-neutral-200">Shopify Master Store Workspace</h1>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-all hover:rotate-90 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dashboard Workspace Grid */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Dashboard Left Side Sidebar (Shopify Style) */}
          <div className="w-64 bg-neutral-50 border-r border-neutral-200 p-4 shrink-0 flex flex-col justify-between hidden md:flex">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider block px-3 mb-2">MANAGEMENT HUB</span>
              
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-sm transition-all ${activeTab === 'analytics' ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-200/50 hover:text-black'}`}
              >
                <TrendingUp className="h-4 w-4 shrink-0" />
                <span>Shopify Analytics</span>
              </button>

              <button 
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-sm transition-all ${activeTab === 'products' ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-200/50 hover:text-black'}`}
              >
                <Package className="h-4 w-4 shrink-0" />
                <span>Master Catalog</span>
              </button>

              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-sm transition-all ${activeTab === 'orders' ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-200/50 hover:text-black'}`}
              >
                <ShoppingBag className="h-4 w-4 shrink-0" />
                <span>Order Deliveries</span>
              </button>

              {user?.role === 'SUPER_ADMIN' && (
                <button 
                  onClick={() => setActiveTab('users')}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-sm transition-all ${activeTab === 'users' ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-200/50 hover:text-black'}`}
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <span>Roles & staff</span>
                </button>
              )}

              <button 
                onClick={() => setActiveTab('banners')}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-sm transition-all ${activeTab === 'banners' ? 'bg-black text-white' : 'text-neutral-600 hover:bg-neutral-200/50 hover:text-black'}`}
              >
                <Megaphone className="h-4 w-4 shrink-0" />
                <span>Homestead Campaigns</span>
              </button>
            </div>

            {/* Admin Profile Foot Block */}
            <div className="border-t border-neutral-200 pt-4 p-2 text-[10px] space-y-1">
              <p className="font-extrabold text-[#D4AF37] tracking-wider uppercase">Active Operator</p>
              <p className="font-bold text-neutral-800 line-clamp-1">{user?.email}</p>
              <p className="text-neutral-400 capitalize">{user?.role} level access</p>
            </div>
          </div>

          {/* Right Main Content Panel */}
          <div className="flex-1 p-6 overflow-y-auto bg-neutral-100 flex flex-col">
            
            {/* Alert Messages Banner */}
            {message && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 mb-5 font-bold text-xs rounded-none flex items-center justify-between">
                <span>{message}</span>
                <button onClick={() => setMessage('')} className="text-emerald-500 hover:text-black">Dismiss</button>
              </div>
            )}

            {/* Mobile Tab Selectors */}
            <div className="flex md:hidden gap-1 mb-4 overflow-x-auto pb-2 border-b border-neutral-200 shrink-0">
              <button onClick={() => setActiveTab('analytics')} className={`px-3 py-1.5 text-[9px] uppercase tracking-wide font-black border ${activeTab === 'analytics' ? 'bg-black text-white border-black' : 'bg-white text-neutral-600 border-neutral-200'}`}>Stats</button>
              <button onClick={() => setActiveTab('products')} className={`px-3 py-1.5 text-[9px] uppercase tracking-wide font-black border ${activeTab === 'products' ? 'bg-black text-white border-black' : 'bg-white text-neutral-600 border-neutral-200'}`}>Catalog</button>
              <button onClick={() => setActiveTab('orders')} className={`px-3 py-1.5 text-[9px] uppercase tracking-wide font-black border ${activeTab === 'orders' ? 'bg-black text-white border-black' : 'bg-white text-neutral-600 border-neutral-200'}`}>Orders</button>
              {user?.role === 'SUPER_ADMIN' && <button onClick={() => setActiveTab('users')} className={`px-3 py-1.5 text-[9px] uppercase tracking-wide font-black border ${activeTab === 'users' ? 'bg-black text-white border-black' : 'bg-white text-neutral-600 border-neutral-200'}`}>Roles</button>}
              <button onClick={() => setActiveTab('banners')} className={`px-3 py-1.5 text-[9px] uppercase tracking-wide font-black border ${activeTab === 'banners' ? 'bg-black text-white border-black' : 'bg-white text-neutral-600 border-neutral-200'}`}>Banners</button>
            </div>

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <div className="h-8 w-8 border-t-2 border-black rounded-full animate-spin"></div>
                <span className="font-bold text-neutral-400 text-xs mt-3 uppercase tracking-widest">Polling Database...</span>
              </div>
            )}

            {!loading && (
              <>
                {/* TAB 1: ANALYTICS DASHBOARD */}
                {activeTab === 'analytics' && analytics && (
                  <div className="space-y-6">
                    {/* Metrics Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      <div className="bg-white p-5 border border-dashed border-neutral-200 block">
                        <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block">Total Sales Revenue</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-black text-emerald-800 font-sans">
                            {analytics.totalRevenue.toLocaleString()}
                          </span>
                          <span className="text-xs text-neutral-400 font-bold">ETB</span>
                        </div>
                        <span className="text-[9px] text-[#D4AF37] font-bold block mt-1">From Delivered Handoffs</span>
                      </div>

                      <div className="bg-white p-5 border border-dashed border-neutral-200 block">
                        <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block">Pending Order Pipeline</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-black text-neutral-900 font-sans">
                            {analytics.estimatedPendingRevenue.toLocaleString()}
                          </span>
                          <span className="text-xs text-neutral-400 font-bold">ETB</span>
                        </div>
                        <span className="text-[9px] text-neutral-500 font-bold block mt-1">From {analytics.ordersCount - analytics.completedOrdersCount} active requests</span>
                      </div>

                      <div className="bg-white p-5 border border-dashed border-neutral-200 block">
                        <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block">Customer Base</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-2xl font-black text-indigo-700 font-sans">
                            {analytics.customerCount}
                          </span>
                          <span className="text-xs text-neutral-400 font-bold">Registered</span>
                        </div>
                        <span className="text-[9px] text-neutral-500 font-bold block mt-1">Growth: +10% this week</span>
                      </div>

                      <div className="bg-white p-5 border border-dashed border-neutral-200 block">
                        <span className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest block">Stock Alert Monitors</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-2xl font-black font-sans ${analytics.lowStockAlerts > 0 ? 'text-rose-600 animate-pulse' : 'text-neutral-500'}`}>
                            {analytics.lowStockAlerts}
                          </span>
                          {analytics.lowStockAlerts > 0 && <AlertTriangle className="h-4 w-4 text-rose-500 animate-bounce" />}
                        </div>
                        <span className="text-[9px] text-neutral-500 font-bold block mt-1">Below critical threshold</span>
                      </div>

                    </div>

                    {/* Low Stock alerts block */}
                    {analytics.lowStockAlerts > 0 && (
                      <div className="bg-rose-50 border border-rose-100 p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-wide text-rose-800">
                          <AlertTriangle className="h-4 w-4 animate-pulse shrink-0" />
                          <span>LOW STOCK WARNING: Sourcing Action Advised</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-1">
                          {analytics.lowStockItems.map((it: any) => (
                            <div key={it.id} className="bg-white p-2.5 border border-rose-200/50 text-[10px] flex justify-between items-center text-rose-950 font-mono">
                              <span className="font-bold truncate max-w-[150px]">{it.name}</span>
                              <span className="bg-rose-100 px-1.5 py-0.5 font-bold">Qty: {it.qty}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Charts & Best Sellers mockup and database data combo */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Best Sellers */}
                      <div className="bg-white p-5 border border-neutral-200 rounded-none lg:col-span-2">
                        <span className="text-[11px] font-black text-black tracking-widest uppercase block border-b border-neutral-100 pb-2 mb-3">
                          🏆 EXPORT HIGHLIGHTS: BEST SELLING PRODUCTS
                        </span>
                        
                        {analytics.bestSellers.length === 0 ? (
                          <p className="text-xs text-neutral-400 text-center py-8">No order logs registered yet for best sellers.</p>
                        ) : (
                          <div className="space-y-3">
                            {analytics.bestSellers.map((it: any, index: number) => (
                              <div key={index} className="flex items-center justify-between text-xs font-sans pb-2.5 border-b border-neutral-150">
                                <div className="flex items-center gap-3">
                                  <span className="font-extrabold text-neutral-300 w-4 font-mono text-center">#{index + 1}</span>
                                  <span className="font-bold text-neutral-800 truncate max-w-[280px]">{it.name}</span>
                                </div>
                                <div className="flex items-center gap-6">
                                  <span className="text-neutral-400 text-[10px] font-bold uppercase">{it.count} Sourced</span>
                                  <span className="font-black text-emerald-800 font-mono">{it.revenue.toLocaleString()} ETB</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Currency / MultiCountry Config Info */}
                      <div className="bg-white p-5 border border-neutral-200 rounded-none space-y-4">
                        <span className="text-[11px] font-black text-black tracking-widest uppercase block border-b border-neutral-100 pb-2">
                          🌍 MULTI-COUNTRY CONFIG (FUTURE STACK)
                        </span>

                        <div className="space-y-3 text-[11px]">
                          <div>
                            <span className="font-black text-neutral-800 uppercase block">Active Region</span>
                            <div className="bg-emerald-50 text-emerald-800 p-2 font-bold mt-1 text-[10px] flex items-center justify-between">
                              <span>ETHIOPIA (Addis Abba hub)</span>
                              <span className="bg-emerald-250/20 px-1 py-0.5 rounded-none font-mono text-[9px]">ACTIVE</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-1 grid-rows-1">
                            <div className="bg-neutral-50 border border-neutral-200 p-2 text-center text-neutral-500 font-bold block opacity-60">
                              <span>KENYA</span>
                              <span className="block text-[8px] mt-0.5 font-normal">KES - Pending</span>
                            </div>
                            <div className="bg-neutral-50 border border-neutral-200 p-2 text-center text-neutral-500 font-bold block opacity-60">
                              <span>UGANDA</span>
                              <span className="block text-[8px] mt-0.5 font-normal">UGX - Pending</span>
                            </div>
                            <div className="bg-neutral-50 border border-neutral-200 p-2 text-center text-neutral-500 font-bold block opacity-60">
                              <span>RWANDA</span>
                              <span className="block text-[8px] mt-0.5 font-normal">RWF - Pending</span>
                            </div>
                          </div>

                          <div className="bg-neutral-50 p-2.5 border border-neutral-200 text-neutral-600 block leading-relaxed font-sans text-[10px]">
                            <span className="font-extrabold text-black uppercase block mb-0.5">Future Payments Interface:</span>
                            Telebirr / Chapa SDK hooks are prepared inside the API gateways to ensure modular enablement.
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>
                )}

                {/* TAB 2: MASTER CATALOG */}
                {activeTab === 'products' && (
                  <div className="bg-white p-5 border border-neutral-200 rounded-none">
                    
                    {/* Add Product Modal/Form or table */}
                    {isAddingProduct ? (
                      <div className="space-y-5">
                        <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                          <h2 className="font-black text-sm uppercase tracking-wider text-black">
                            {editingProduct ? '📝 EDIT CATALOG PRODUCT' : '✨ ADD NEW SOURCED ITEM'}
                          </h2>
                          <button onClick={() => setIsAddingProduct(false)} className="text-neutral-400 hover:text-black font-extrabold text-[10px] uppercase">Cancel Form</button>
                        </div>

                        <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                          
                          <div className="space-y-1 block">
                            <label className="font-bold text-neutral-700 uppercase text-[10px]">Master SKU Code *</label>
                            <input 
                              type="text" 
                              className="w-full bg-white p-2 border border-neutral-200" 
                              required 
                              value={prodForm.sku}
                              onChange={e => setProdForm({...prodForm, sku: e.target.value})}
                            />
                          </div>

                          <div className="space-y-1 block">
                            <label className="font-bold text-neutral-700 uppercase text-[10px]">Product Name *</label>
                            <input 
                              type="text" 
                              className="w-full bg-white p-2 border border-neutral-200" 
                              required 
                              value={prodForm.name}
                              onChange={e => setProdForm({...prodForm, name: e.target.value})}
                            />
                          </div>

                          <div className="space-y-1 block">
                            <label className="font-bold text-neutral-700 uppercase text-[10px]">Brand Supplier</label>
                            <input 
                              type="text" 
                              className="w-full bg-white p-2 border border-neutral-200" 
                              value={prodForm.brand}
                              onChange={e => setProdForm({...prodForm, brand: e.target.value})}
                            />
                          </div>

                          <div className="space-y-1 block">
                            <label className="font-bold text-neutral-700 uppercase text-[10px]">Parent Category *</label>
                            <select 
                              className="w-full bg-white p-2 border border-neutral-200"
                              value={prodForm.category}
                              onChange={e => setProdForm({...prodForm, category: e.target.value})}
                            >
                              <option value="dresses">Dresses</option>
                              <option value="abayas">Abayas</option>
                              <option value="handbags">Handbags</option>
                              <option value="shoes">Shoes</option>
                              <option value="beauty">Beauty</option>
                              <option value="jewelry">Jewelry</option>
                              <option value="watches">Watches</option>
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1 block">
                              <label className="font-bold text-neutral-700 uppercase text-[10px]">Price in ETB *</label>
                              <input 
                                type="number" 
                                className="w-full bg-white p-2 border border-neutral-200" 
                                required
                                value={prodForm.priceETB}
                                onChange={e => setProdForm({...prodForm, priceETB: e.target.value})}
                              />
                            </div>
                            <div className="space-y-1 block">
                              <label className="font-bold text-neutral-700 uppercase text-[10px]">Compare Mall Price (ETB)</label>
                              <input 
                                type="number" 
                                className="w-full bg-white p-2 border border-neutral-200" 
                                value={prodForm.originalPriceETB}
                                onChange={e => setProdForm({...prodForm, originalPriceETB: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1 block">
                              <label className="font-bold text-neutral-700 uppercase text-[10px]">Sourcing Quantity *</label>
                              <input 
                                type="number" 
                                className="w-full bg-white p-2 border border-neutral-200" 
                                required
                                value={prodForm.quantityAvailable}
                                onChange={e => setProdForm({...prodForm, quantityAvailable: e.target.value})}
                              />
                            </div>
                            <div className="space-y-1 block">
                              <label className="font-bold text-neutral-700 uppercase text-[10px]">Low stock alert limit</label>
                              <input 
                                type="number" 
                                className="w-full bg-white p-2 border border-neutral-200" 
                                required
                                value={prodForm.lowStockAlertThreshold}
                                onChange={e => setProdForm({...prodForm, lowStockAlertThreshold: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="space-y-1 block md:col-span-2">
                            <label className="font-bold text-neutral-700 uppercase text-[10px]">Sizes (Separate with Commas)</label>
                            <input 
                              type="text" 
                              className="w-full bg-white p-2 border border-neutral-200" 
                              value={prodForm.sizes}
                              onChange={e => setProdForm({...prodForm, sizes: e.target.value})}
                            />
                          </div>

                          <div className="space-y-1 block md:col-span-2">
                            <label className="font-bold text-neutral-700 uppercase text-[10px]">Image URLs (one URL per line)</label>
                            <textarea 
                              rows={3}
                              className="w-full bg-white p-2 border border-neutral-200 font-mono text-[10px]" 
                              placeholder="https://images.unsplash.com/..."
                              value={prodForm.images}
                              onChange={e => setProdForm({...prodForm, images: e.target.value})}
                            />
                          </div>

                          <div className="space-y-1 block md:col-span-2">
                            <label className="font-bold text-neutral-700 uppercase text-[10px]">Product Copy Description</label>
                            <textarea 
                              rows={3}
                              className="w-full bg-white p-2 border border-neutral-200" 
                              value={prodForm.description}
                              onChange={e => setProdForm({...prodForm, description: e.target.value})}
                            />
                          </div>

                          {/* Featured toggles */}
                          <div className="flex gap-6 py-2 md:col-span-2 select-none">
                            <label className="flex items-center gap-2 cursor-pointer font-bold">
                              <input 
                                type="checkbox" 
                                checked={prodForm.isFeatured} 
                                onChange={e => setProdForm({...prodForm, isFeatured: e.target.checked})}
                              />
                              <span className="uppercase text-[10px]">FEATURE ON HOMEPAGE</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer font-bold">
                              <input 
                                type="checkbox" 
                                checked={prodForm.isNewArrival} 
                                onChange={e => setProdForm({...prodForm, isNewArrival: e.target.checked})}
                              />
                              <span className="uppercase text-[10px]">MARK AS NEW ARRIVAL</span>
                            </label>
                          </div>

                          <div className="md:col-span-2 flex justify-end gap-3 pt-3 border-t border-neutral-100">
                            <button 
                              type="button" 
                              onClick={() => setIsAddingProduct(false)}
                              className="border border-neutral-200 px-4 py-2 font-bold hover:bg-neutral-50"
                            >
                              Abort
                            </button>
                            <button 
                              type="submit" 
                              className="bg-black hover:bg-[#D4AF37] text-white hover:text-black px-6 py-2 font-bold uppercase tracking-widest transition-all"
                            >
                              Save Master Catalog Entry
                            </button>
                          </div>

                        </form>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-neutral-900 text-white p-4">
                          <span className="text-[10px] uppercase font-black tracking-widest text-[#D4AF37]">MASTER DATABASE PRODUCTS CATALOG</span>
                          <button 
                            onClick={handleNewProductClick}
                            className="bg-white text-black hover:bg-[#D4AF37] font-bold px-3 py-1.5 text-[10px] uppercase flex items-center gap-1 leading-none rounded-none"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add Sourced Product</span>
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs font-sans">
                            <thead>
                              <tr className="border-b border-neutral-200 text-neutral-400 capitalize font-extrabold uppercase text-[10px]">
                                <th className="py-2.5 px-3">Item details</th>
                                <th className="py-2.5 px-3">SKU</th>
                                <th className="py-2.5 px-3">Stock Available</th>
                                <th className="py-2.5 px-3">Price</th>
                                <th className="py-2.5 px-3 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {products.map((p) => (
                                <tr key={p.id} className="hover:bg-neutral-50/50">
                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-3">
                                      <img src={p.images?.[0] || 'https://placehold.co/40'} alt="" className="h-9 w-9 object-cover border border-neutral-200 rounded-none shrink-0" />
                                      <div>
                                        <h4 className="font-bold text-neutral-900">{p.name}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <span className="text-[8px] bg-neutral-100 text-neutral-500 font-bold px-1.5 uppercase">{p.category}</span>
                                          {p.isFeatured && <span className="text-[8px] bg-[#D4AF37]/10 text-[#a58117] font-bold px-1.5">Featured</span>}
                                          {p.isNewArrival && <span className="text-[8px] bg-blue-50 text-blue-800 font-bold px-1.5">New</span>}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 font-mono text-[10px] font-bold text-neutral-500">{p.sku}</td>
                                  <td className="py-3 px-3">
                                    <span className={`font-black font-mono text-[11px] ${p.quantityAvailable <= p.lowStockAlertThreshold ? 'text-red-600 font-extrabold' : 'text-neutral-700'}`}>
                                      {p.quantityAvailable} units
                                    </span>
                                    {p.quantityAvailable <= p.lowStockAlertThreshold && (
                                      <span className="block text-[8px] text-red-500 font-bold uppercase mt-0.5">LOW STOCK</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 font-mono font-black text-neutral-950 text-[11px]">{p.priceETB.toLocaleString()} ETB</td>
                                  <td className="py-3 px-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button 
                                        onClick={() => handleEditProductClick(p)}
                                        className="border border-neutral-200 text-neutral-600 hover:text-black py-1 px-2 text-[10px] font-bold flex items-center gap-1"
                                      >
                                        <Edit3 className="h-3 w-3" />
                                        <span>Edit</span>
                                      </button>
                                      {user?.role === 'SUPER_ADMIN' && (
                                        <button 
                                          onClick={() => handleDeleteProduct(p.id)}
                                          className="border border-red-250 text-red-600 hover:bg-rose-50 py-1 px-2 text-[10px] font-bold flex items-center gap-1"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                          <span>Delete</span>
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* TAB 3: ORDER INTEGRATIONS & DELIVERIES */}
                {activeTab === 'orders' && (
                  <div className="bg-white p-5 border border-neutral-200 rounded-none">
                    <span className="text-[11px] font-black text-black tracking-widest uppercase block border-b border-neutral-100 pb-2 mb-4">
                      📦 LIVE ORDER TRAFFIC & STATUS WORKFLOWS
                    </span>

                    {ordersList.length === 0 ? (
                      <p className="text-xs text-neutral-400 text-center py-12">No sourcing orders placed yet. Add items to bag to place custom requests!</p>
                    ) : (
                      <div className="space-y-4">
                        {ordersList.map((or) => (
                          <div key={or.id} className="border border-neutral-200 p-4 font-sans text-xs flex flex-col md:flex-row justify-between gap-4">
                            
                            {/* Left part order details */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="bg-black text-white px-2 py-0.5 rounded-none font-bold font-mono">ORDER #{or.id}</span>
                                <span className="text-neutral-400 font-mono text-[10px]">{new Date(or.createdAt).toLocaleString()}</span>
                              </div>

                              <div className="space-y-0.5 text-neutral-600">
                                <div><span className="font-bold text-black text-[11px]">Customer:</span> {or.customerName}</div>
                                <div><span className="font-bold text-black text-[11px]">Contacts:</span> Phone: {or.customerPhone} {or.customerWhatsapp && `| WhatsApp: ${or.customerWhatsapp}`}</div>
                                <div><span className="font-bold text-black text-[11px]">Handoff Hub:</span> {or.shippingAddress}, {or.shippingCity} ({or.country})</div>
                              </div>

                              {/* Items list detail block */}
                              <div className="pt-2">
                                <span className="font-black text-[9px] uppercase tracking-wider text-neutral-400 block mb-1">Purchased Sourced Articles</span>
                                <div className="space-y-1">
                                  {Array.isArray(or.items) && or.items.map((it: any, i: number) => (
                                    <div key={i} className="bg-neutral-50 p-2 border border-neutral-150 flex items-center justify-between text-[10px]">
                                      <span>
                                        {i + 1}. <strong className="font-sans text-black">{it.product?.name}</strong> (Size: {it.selectedSize} | Color: {it.selectedColor?.name})
                                      </span>
                                      <span className="font-black font-mono text-neutral-700">{it.quantity} x {it.priceETB?.toLocaleString()} ETB</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Right Status Workflow Updates */}
                            <div className="md:text-right flex flex-col justify-between items-start md:items-end gap-2 shrink-0 md:w-64">
                              <div>
                                <span className="text-[10px] text-neutral-400 uppercase font-bold block">Estimated Total Sourced</span>
                                <span className="text-sm font-black text-emerald-800 font-mono block mt-0.5">{or.totalAmountETB.toLocaleString()} ETB</span>
                              </div>

                              <div className="w-full space-y-1 block">
                                <label className="text-[9px] text-neutral-400 uppercase font-black block">Status Progression Controller</label>
                                <select 
                                  value={or.status} 
                                  onChange={e => handleOrderStatusUpdate(or.id, e.target.value)}
                                  className="w-full bg-white p-2 border border-black font-bold text-[10px] uppercase rounded-none cursor-pointer"
                                >
                                  <option value="Pending">Pending Validation</option>
                                  <option value="Deposit Pending">Deposit Pending (50% Required)</option>
                                  <option value="Deposit Received">Deposit Received (50% Confirmed)</option>
                                  <option value="Purchased in Dubai">Purchased in Dubai outlets</option>
                                  <option value="Shipped">Dispatched airfreight</option>
                                  <option value="Arrived in Ethiopia">Arrived in Ethiopia (Addis hub)</option>
                                  <option value="Out for Delivery">Out for Delivery in Addis</option>
                                  <option value="Delivered">Delivered & Remaining 50% paid</option>
                                  <option value="Cancelled">Cancelled request</option>
                                </select>
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                )}

                {/* TAB 4: ROLES MANAGEMENT (SUPER ADMIN OVERLAY) */}
                {activeTab === 'users' && user?.role === 'SUPER_ADMIN' && (
                  <div className="bg-white p-5 border border-neutral-200 rounded-none">
                    <span className="text-[11px] font-black text-black tracking-widest uppercase block border-b border-neutral-100 pb-2 mb-4">
                      ⚙️ ROLES-BASED AUTH & AUTHORIZATIONS LIST (Admin Only)
                    </span>

                    <table className="w-full text-left text-xs font-sans">
                      <thead>
                        <tr className="border-b border-neutral-200 text-neutral-400 font-extrabold uppercase text-[10px]">
                          <th className="py-2.5 px-3">Identity / Contact</th>
                          <th className="py-2.5 px-3">Role Authorization</th>
                          <th className="py-2.5 px-3">Hub Address</th>
                          <th className="py-2.5 px-3 text-right">Alter privileges</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {usersList.map((usr) => (
                          <tr key={usr.id} className="hover:bg-neutral-50/50">
                            <td className="py-3 px-3">
                              <div className="font-bold text-neutral-950">{usr.name || 'Anonymous User'}</div>
                              <div className="text-neutral-400 text-[10px] font-mono">{usr.email}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded-none uppercase ${usr.role === 'SUPER_ADMIN' ? 'bg-[#D4AF37]/10 text-gold-800' : usr.role === 'STAFF' ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}>
                                {usr.role}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-neutral-500 font-bold text-[11px]">
                              {usr.city ? `${usr.city}, Ethiopia` : 'No address provided'}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <select 
                                value={usr.role} 
                                onChange={e => handleUserRoleUpdate(usr.id, e.target.value)}
                                className="bg-white border rounded-none border-neutral-250 p-1 text-[10px] font-bold"
                              >
                                <option value="CUSTOMER">Make Customer</option>
                                <option value="STAFF">Make Staff</option>
                                <option value="SUPER_ADMIN">Make Super Admin</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* TAB 5: HOMESTEAD CAMPAIGNS BANNERS */}
                {activeTab === 'banners' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    <div className="bg-white p-5 border border-neutral-200 rounded-none md:col-span-1 space-y-4">
                      <span className="text-[11px] font-black text-black tracking-widest uppercase block border-b border-neutral-100 pb-2">
                        📣 ADD HOMEPAGE PROMOTIONS
                      </span>

                      <form onSubmit={handleAddBanner} className="space-y-3.5 text-xs font-sans">
                        <div className="space-y-1 block">
                          <label className="font-bold text-neutral-700 uppercase text-[10px]">Title Banner</label>
                          <input type="text" required placeholder="THE ROYAL COLLECTION" className="w-full bg-white p-2 border border-neutral-250" value={newBannerTitle} onChange={e => setNewBannerTitle(e.target.value)} />
                        </div>
                        <div className="space-y-1 block">
                          <label className="font-bold text-neutral-700 uppercase text-[10px]">Subtitle Banner</label>
                          <input type="text" placeholder="IMPORTED FROM THE EXQUISITE DUBAI PLAZA" className="w-full bg-white p-2 border border-neutral-250" value={newBannerSubtitle} onChange={e => setNewBannerSubtitle(e.target.value)} />
                        </div>
                        <div className="space-y-1 block">
                          <label className="font-bold text-neutral-700 uppercase text-[10px]">Image URL</label>
                          <input type="url" required placeholder="https://images.unsplash.com/..." className="w-full bg-white p-2 border border-neutral-250 font-mono text-[10px]" value={newBannerImg} onChange={e => setNewBannerImg(e.target.value)} />
                        </div>

                        <button type="submit" className="w-full bg-black hover:bg-[#D4AF37] hover:text-black py-2.5 font-sans font-black uppercase text-[10px] tracking-wider text-white">
                          Publish Promo Campaign Banner
                        </button>
                      </form>
                    </div>

                    <div className="bg-white p-5 border border-neutral-200 rounded-none md:col-span-2">
                      <span className="text-[11px] font-black text-black tracking-widest uppercase block border-b border-neutral-100 pb-2 mb-4">
                        🏡 CURRENTLY PUBLISHED CAMPAIGNS ({bannersList.length})
                      </span>

                      <div className="space-y-3">
                        {bannersList.map((b) => (
                          <div key={b.id} className="relative h-24 w-full overflow-hidden border border-neutral-200 flex items-center justify-between p-4">
                            <img src={b.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 z-0" />
                            <div className="absolute inset-0 bg-black/40 z-1" />
                            <div className="relative z-10 text-white space-y-0.5">
                              <h4 className="font-bold text-sm tracking-wide text-white">{b.title}</h4>
                              <p className="text-[10px] text-[#D4AF37] font-black uppercase tracking-wider">{b.subtitle}</p>
                            </div>
                            <span className="relative z-10 bg-emerald-500/10 text-emerald-400 border border-emerald-400 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">ACTIVE</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
