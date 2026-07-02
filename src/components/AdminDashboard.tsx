import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../lib/api.ts';
import UniversalImportEngine from './UniversalImportEngine';
import ClassificationManager from './ClassificationManager';
import { 
  Sliders,
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
  LayoutDashboard,
  Megaphone,
  DownloadCloud,
  Copy,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  FileDown,
  RotateCcw,
  Sparkles,
  Globe,
  RefreshCw,
  SlidersHorizontal,
  Eye,
  EyeOff,
  ClipboardList
} from 'lucide-react';

interface AdminDashboardProps {
  user: any;
  onClose: () => void;
  onRefreshProducts: () => void;
}

export default function AdminDashboard({ user, onClose, onRefreshProducts }: AdminDashboardProps) {
  // Tabs: dashboard, products, import, orders, customers, settings, purchaseQueue, classifications
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'import' | 'orders' | 'customers' | 'settings' | 'purchaseQueue' | 'classifications'>('dashboard');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Database classifications list for forms
  const [dbSuppliers, setDbSuppliers] = useState<any[]>([]);
  const [dbBrands, setDbBrands] = useState<any[]>([]);
  const [dbDepartments, setDbDepartments] = useState<any[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbSubcategories, setDbSubcategories] = useState<any[]>([]);

  // Sourcing data states
  const [products, setProducts] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Search & Filter state for Products
  const [prodSearch, setProdSearch] = useState('');
  const [prodCatFilter, setProdCatFilter] = useState('All');
  const [prodBrandFilter, setProdBrandFilter] = useState('All');
  const [prodStatusFilter, setProdStatusFilter] = useState('All');
  const [prodPage, setProdPage] = useState(1);
  const prodsPerPage = 10;

  // Selected products for bulk actions
  const [selectedProdIds, setSelectedProdIds] = useState<number[]>([]);

  // Product Editor Drawer State
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productPreview, setProductPreview] = useState<any | null>(null);

  // Form State for Products
  const [prodForm, setProdForm] = useState({
    sku: '',
    name: '',
    description: '',
    category: 'dresses',
    subcategory: '',
    brand: '',
    priceETB: '',
    originalPriceETB: '',
    sizes: 'S, M, L, XL',
    colors: [
      { name: 'Classic Black', hex: '#111111' },
      { name: 'Satin Gold', hex: '#d4af37' }
    ],
    images: '',
    isFeatured: false,
    isNewArrival: false,
    quantityAvailable: '10',
    lowStockAlertThreshold: '3',
    status: 'Published',
    supplierId: '',
    brandId: '',
    departmentId: '',
    categoryId: '',
    subcategoryId: ''
  });

  // Importer Page States
  const [importUrl, setImportUrl] = useState('');
  const [importSupplier, setImportSupplier] = useState('');
  const [importCategory, setImportCategory] = useState('dresses');
  const [importBrand, setImportBrand] = useState('');
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importStep, setImportStep] = useState('');
  const [importLogs, setImportLogs] = useState<string[]>([]);
  const [importedStagingList, setImportedStagingList] = useState<any[]>([]);
  const [selectedImportedIds, setSelectedImportedIds] = useState<string[]>([]);

  // Settings Page Form States
  const [settingsForm, setSettingsForm] = useState({
    websiteName: 'AddisDubai',
    logoUrl: '',
    whatsappNumber: '+971552734073',
    currency: 'ETB',
    deliveryFee: '200',
    contactEmail: 'info@addisdubai.com'
  });

  // Order Search & Filter State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  // Customer Search State
  const [customerSearch, setCustomerSearch] = useState('');

  // Purchase Queue State Variables
  const [purchaseTasks, setPurchaseTasks] = useState<any[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);
  const [purchaseFilter, setPurchaseFilter] = useState<string>('ALL');
  const [purchaseSearch, setPurchaseSearch] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTaskForm, setEditTaskForm] = useState({
    purchaseStatus: 'TO_PURCHASE',
    supplierId: '',
    supplierPriceAED: '',
    notes: ''
  });
  const [isManualTaskModalOpen, setIsManualTaskModalOpen] = useState(false);
  const [manualTaskForm, setManualTaskForm] = useState({
    orderId: '',
    productSku: '',
    productName: '',
    quantity: '1',
    selectedSize: '',
    selectedColor: '',
    supplierId: '',
    supplierPriceAED: '',
    notes: ''
  });

  // Purchase Queue Handlers
  const handleEditTaskClick = (task: any) => {
    setEditingTaskId(task.id);
    setEditTaskForm({
      purchaseStatus: task.purchaseStatus,
      supplierId: task.supplierId || '',
      supplierPriceAED: task.supplierPriceAED !== null && task.supplierPriceAED !== undefined ? task.supplierPriceAED.toString() : '',
      notes: task.notes || ''
    });
  };

  const handleSaveTaskStatus = async (taskId: number) => {
    setLoading(true);
    try {
      await apiClient.updatePurchaseTaskStatus(taskId, {
        purchaseStatus: editTaskForm.purchaseStatus,
        notes: editTaskForm.notes,
        supplierId: editTaskForm.supplierId || null,
        supplierPriceAED: editTaskForm.supplierPriceAED ? parseInt(editTaskForm.supplierPriceAED) : null
      });
      showToast('Purchase task updated successfully!');
      setEditingTaskId(null);
      // Reload purchase tasks
      const pTasks = await apiClient.getPurchaseTasks();
      setPurchaseTasks(pTasks);
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to update task: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdateTaskStatus = async (status: string) => {
    if (selectedTaskIds.length === 0) return;
    setLoading(true);
    try {
      await apiClient.bulkUpdatePurchaseTasksStatus(selectedTaskIds, status);
      showToast(`Successfully updated ${selectedTaskIds.length} tasks to ${status}!`);
      setSelectedTaskIds([]);
      // Reload
      const pTasks = await apiClient.getPurchaseTasks();
      setPurchaseTasks(pTasks);
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to bulk update tasks: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDeleteTasks = async () => {
    if (selectedTaskIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedTaskIds.length} selected tasks?`)) return;
    setLoading(true);
    try {
      await apiClient.bulkDeletePurchaseTasks(selectedTaskIds);
      showToast(`Successfully deleted ${selectedTaskIds.length} tasks!`);
      setSelectedTaskIds([]);
      // Reload
      const pTasks = await apiClient.getPurchaseTasks();
      setPurchaseTasks(pTasks);
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to delete tasks: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateManualTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTaskForm.orderId || !manualTaskForm.productSku || !manualTaskForm.productName) {
      showToast('Order ID, Product SKU, and Product Name are required', true);
      return;
    }
    setLoading(true);
    try {
      await apiClient.createPurchaseTask({
        orderId: parseInt(manualTaskForm.orderId),
        productSku: manualTaskForm.productSku,
        productName: manualTaskForm.productName,
        quantity: parseInt(manualTaskForm.quantity) || 1,
        selectedSize: manualTaskForm.selectedSize || undefined,
        selectedColor: manualTaskForm.selectedColor || undefined,
        supplierId: manualTaskForm.supplierId || undefined,
        supplierPriceAED: manualTaskForm.supplierPriceAED ? parseInt(manualTaskForm.supplierPriceAED) : undefined,
        notes: manualTaskForm.notes || undefined
      });
      showToast('Manual purchase task created successfully!');
      setIsManualTaskModalOpen(false);
      setManualTaskForm({
        orderId: '',
        productSku: '',
        productName: '',
        quantity: '1',
        selectedSize: '',
        selectedColor: '',
        supplierId: '',
        supplierPriceAED: '',
        notes: ''
      });
      // Reload
      const pTasks = await apiClient.getPurchaseTasks();
      setPurchaseTasks(pTasks);
    } catch (err: any) {
      console.error(err);
      showToast(`Failed to create task: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  // Load active configurations from API (PostgreSQL database)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiClient.getSettings();
        if (data) {
          setSettingsForm({
            websiteName: data.siteName || 'AddisDubai',
            logoUrl: data.logoUrl || '',
            whatsappNumber: data.whatsappNumber || '+971552734073',
            currency: data.currency || 'ETB',
            deliveryFee: data.deliveryFee || '200',
            contactEmail: data.supportEmail || 'info@addisdubai.com'
          });
        }
      } catch (err: any) {
        console.error('Failed to load settings:', err);
        showToast('Failed to load database settings', true);
      }
    };
    fetchSettings();
  }, []);

  // Fetch classifications on tab changes or dashboard load
  const fetchClassifications = async () => {
    try {
      const [sups, brs, depts, cats, subs] = await Promise.all([
        apiClient.getSuppliers(),
        apiClient.getBrands(),
        apiClient.getDepartments(),
        apiClient.getCategories(),
        apiClient.getSubcategories()
      ]);
      setDbSuppliers(sups || []);
      setDbBrands(brs || []);
      setDbDepartments(depts || []);
      setDbCategories(cats || []);
      setDbSubcategories(subs || []);
    } catch (err) {
      console.error('Failed to load taxonomy classifications:', err);
    }
  };

  useEffect(() => {
    fetchClassifications();
  }, [activeTab]);

  // Fetch data on active tab changes
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      if (activeTab === 'dashboard') {
        const productData = await apiClient.getProducts();
        const ordersData = await apiClient.getOrders();
        const customerData = await apiClient.getCustomers();
        const analyticsData = await apiClient.getAnalytics();
        
        setProducts(productData);
        setOrdersList(ordersData);
        setCustomersList(customerData);
        setAnalytics(analyticsData);
      } else if (activeTab === 'products') {
        const data = await apiClient.getProducts();
        setProducts(data);
      } else if (activeTab === 'orders') {
        const data = await apiClient.getOrders();
        setOrdersList(data);
      } else if (activeTab === 'customers') {
        const data = await apiClient.getCustomers();
        setCustomersList(data);
      } else if (activeTab === 'purchaseQueue') {
        const data = await apiClient.getPurchaseTasks();
        setPurchaseTasks(data);
        const ordersData = await apiClient.getOrders();
        setOrdersList(ordersData);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- FILTERED DERIVED STATE ---
  
  // Unique brands from existing products for filtering
  const productBrands = useMemo(() => {
    const brands = products.map(p => p.brand).filter(Boolean);
    return ['All', ...Array.from(new Set(brands))];
  }, [products]);

  // Filter products list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(prodSearch.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(prodSearch.toLowerCase()));
      const matchesCategory = prodCatFilter === 'All' || p.category === prodCatFilter;
      const matchesBrand = prodBrandFilter === 'All' || p.brand === prodBrandFilter;
      
      const currentStatus = p.status || 'Published';
      const matchesStatus = prodStatusFilter === 'All' || currentStatus === prodStatusFilter;

      return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
    });
  }, [products, prodSearch, prodCatFilter, prodBrandFilter, prodStatusFilter]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (prodPage - 1) * prodsPerPage;
    return filteredProducts.slice(startIndex, startIndex + prodsPerPage);
  }, [filteredProducts, prodPage]);

  const totalProdPages = Math.ceil(filteredProducts.length / prodsPerPage) || 1;

  // Filter orders
  const filteredOrders = useMemo(() => {
    return ordersList.filter(o => {
      const term = orderSearch.toLowerCase();
      const matchesSearch = 
        String(o.id).includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        o.customerPhone.includes(term);
      const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [ordersList, orderSearch, orderStatusFilter]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customersList.filter(c => {
      const term = customerSearch.toLowerCase();
      return c.name.toLowerCase().includes(term) || c.phone.includes(term) || c.email.toLowerCase().includes(term);
    });
  }, [customersList, customerSearch]);

  // Sourcing & Sourcing Queue derived states
  const purchaseQueueStats = useMemo(() => {
    const total = purchaseTasks.length;
    const toPurchase = purchaseTasks.filter(t => t.purchaseStatus === 'TO_PURCHASE').length;
    const purchased = purchaseTasks.filter(t => t.purchaseStatus === 'PURCHASED').length;
    const packed = purchaseTasks.filter(t => t.purchaseStatus === 'PACKED').length;
    const ready = purchaseTasks.filter(t => t.purchaseStatus === 'READY_FOR_SHIPMENT').length;
    return { total, toPurchase, purchased, packed, ready };
  }, [purchaseTasks]);

  const filteredPurchaseTasks = useMemo(() => {
    return purchaseTasks.filter(task => {
      const matchStatus = purchaseFilter === 'ALL' || task.purchaseStatus === purchaseFilter;
      
      const searchLower = purchaseSearch.toLowerCase().trim();
      const matchSearch = !searchLower || 
        task.productName.toLowerCase().includes(searchLower) ||
        task.productSku.toLowerCase().includes(searchLower) ||
        task.orderId.toString().includes(searchLower) ||
        (task.supplierId && task.supplierId.toLowerCase().includes(searchLower)) ||
        (task.notes && task.notes.toLowerCase().includes(searchLower));
        
      return matchStatus && matchSearch;
    });
  }, [purchaseTasks, purchaseFilter, purchaseSearch]);

  // --- DYNAMIC ACTIONS HANDLERS ---

  const showToast = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(''), 5000);
    } else {
      setMessage(msg);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  // 1. Product Form Submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Resolve string names of selected classifications for legacy schema support
      const selectedCat = dbCategories.find(c => c.id === parseInt(prodForm.categoryId));
      const categoryStr = selectedCat ? selectedCat.name.toLowerCase() : prodForm.category;

      const selectedSub = dbSubcategories.find(s => s.id === parseInt(prodForm.subcategoryId));
      const subcategoryStr = selectedSub ? selectedSub.name : prodForm.subcategory;

      const selectedBr = dbBrands.find(b => b.id === parseInt(prodForm.brandId));
      const brandStr = selectedBr ? selectedBr.name : prodForm.brand;

      const payload = {
        sku: prodForm.sku,
        name: prodForm.name,
        description: prodForm.description,
        category: categoryStr,
        subcategory: subcategoryStr,
        brand: brandStr,
        priceETB: parseInt(prodForm.priceETB),
        originalPriceETB: prodForm.originalPriceETB ? parseInt(prodForm.originalPriceETB) : null,
        sizes: prodForm.sizes.split(',').map(s => s.trim()).filter(Boolean),
        colors: prodForm.colors,
        images: prodForm.images.split('\n').map(i => i.trim()).filter(Boolean),
        isFeatured: !!prodForm.isFeatured,
        isNewArrival: !!prodForm.isNewArrival,
        quantityAvailable: parseInt(prodForm.quantityAvailable),
        lowStockAlertThreshold: parseInt(prodForm.lowStockAlertThreshold),
        status: prodForm.status,
        supplierId: prodForm.supplierId ? parseInt(prodForm.supplierId) : null,
        brandId: prodForm.brandId ? parseInt(prodForm.brandId) : null,
        departmentId: prodForm.departmentId ? parseInt(prodForm.departmentId) : null,
        categoryId: prodForm.categoryId ? parseInt(prodForm.categoryId) : null,
        subcategoryId: prodForm.subcategoryId ? parseInt(prodForm.subcategoryId) : null
      };

      if (editingProduct) {
        await apiClient.updateProduct(editingProduct.id, payload);
        showToast('Product updated successfully!');
      } else {
        await apiClient.createProduct(payload);
        showToast('Product created successfully in master catalog!');
      }

      setIsEditing(false);
      setEditingProduct(null);
      loadData();
      onRefreshProducts();
    } catch (err: any) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  // 2. Delete Single Product
  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product from the catalog? This is irreversible.')) return;
    try {
      await apiClient.deleteProduct(id);
      showToast('Product deleted successfully');
      loadData();
      onRefreshProducts();
    } catch (err: any) {
      showToast(err.message, true);
    }
  };

  // 3. Duplicate Product Single-Click
  const handleDuplicateProduct = async (product: any) => {
    try {
      const payload = {
        ...product,
        sku: `${product.sku}-copy-${Math.floor(10 + Math.random() * 90)}`,
        name: `Copy of ${product.name}`,
        isFeatured: false,
        status: 'Draft' // Defaults duplicated copy to Draft
      };
      delete payload.id;
      delete payload.createdAt;

      await apiClient.createProduct(payload);
      showToast(`Duplicated "${product.name}" successfully as Draft!`);
      loadData();
      onRefreshProducts();
    } catch (err: any) {
      showToast(`Duplication failed: ${err.message}`, true);
    }
  };

  // 4. Hide / Publish Toggle Status Single-Click
  const handleToggleProductStatus = async (product: any) => {
    try {
      const nextStatus = (product.status || 'Published') === 'Published' ? 'Draft' : 'Published';
      await apiClient.updateProduct(product.id, { status: nextStatus });
      showToast(`Product status updated to ${nextStatus}!`);
      loadData();
      onRefreshProducts();
    } catch (err: any) {
      showToast(err.message, true);
    }
  };

  // 5. Bulk Selection Helper
  const handleSelectAllProducts = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProdIds(paginatedProducts.map(p => p.id));
    } else {
      setSelectedProdIds([]);
    }
  };

  const handleSelectProduct = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedProdIds([...selectedProdIds, id]);
    } else {
      setSelectedProdIds(selectedProdIds.filter(pid => pid !== id));
    }
  };

  // 6. Bulk Actions Execution
  const handleBulkStatusChange = async (status: 'Published' | 'Draft') => {
    setLoading(true);
    let successCount = 0;
    try {
      for (const id of selectedProdIds) {
        await apiClient.updateProduct(id, { status });
        successCount++;
      }
      showToast(`Successfully updated ${successCount} products to ${status}`);
      setSelectedProdIds([]);
      loadData();
      onRefreshProducts();
    } catch (err: any) {
      showToast(`Updated ${successCount} products, but encountered error: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete the ${selectedProdIds.length} selected products?`)) return;
    setLoading(true);
    let successCount = 0;
    try {
      for (const id of selectedProdIds) {
        await apiClient.deleteProduct(id);
        successCount++;
      }
      showToast(`Successfully deleted ${successCount} products from catalog`);
      setSelectedProdIds([]);
      loadData();
      onRefreshProducts();
    } catch (err: any) {
      showToast(`Deleted ${successCount} products, but encountered error: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  // 7. Order Status Update
  const handleOrderStatusUpdate = async (orderId: number, status: string) => {
    try {
      await apiClient.updateOrderStatus(orderId, status);
      showToast(`Order status marked as ${status}`);
      loadData();
    } catch (err: any) {
      showToast(err.message, true);
    }
  };

  // 8. Supplier Import Scraper Simulator Trigger
  const handleImportTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;
    
    setImporting(true);
    setImportProgress(10);
    setImportStep('Contacting supplier web host...');
    setImportLogs(['[Staging Portal] Handshaking supplier proxy certificates...']);
    setImportedStagingList([]);
    setSelectedImportedIds([]);

    const runProgressStep = (percent: number, step: string, logLine: string) => {
      return new Promise<void>(resolve => {
        setTimeout(() => {
          setImportProgress(percent);
          setImportStep(step);
          setImportLogs(prev => [...prev, `[Sourcing Log] ${logLine}`]);
          resolve();
        }, 800);
      });
    };

    try {
      await runProgressStep(25, 'Downloading web pages...', 'Bypassing cookie gateway. Resolved CDN content routing.');
      await runProgressStep(50, 'Extracting document catalog layout...', 'Found fashion elements structure. Catalog parsed successfully.');
      await runProgressStep(75, 'Parsing product specs & media arrays...', 'Downloading high resolution color palettes and fabric description sheets.');
      await runProgressStep(90, 'Aggregating draft products payload...', 'Mapping item configurations to Shopify Lite specification format.');

      const result = await apiClient.importProducts({
        supplierUrl: importUrl,
        supplierName: importSupplier,
        category: importCategory,
        brand: importBrand
      });

      setImportProgress(100);
      setImportStep('Import finished successfully!');
      setImportLogs(prev => [...prev, `[Done] Sourced ${result.products?.length || 0} product rows. Preview staged list below.`]);
      setImportedStagingList(result.products || []);
      setSelectedImportedIds((result.products || []).map((p: any) => p.sku));
      showToast(`Sourced ${result.products?.length || 0} items! Select which ones to publish.`);

    } catch (err: any) {
      setImportProgress(100);
      setImportStep('Connection interrupted.');
      setImportLogs(prev => [...prev, `[Critical Error] Sourcing failed: ${err.message}`]);
      showToast(err.message, true);
    } finally {
      setImporting(false);
    }
  };

  // 9. Staging Importer Bulk Operations
  const handleImportedSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedImportedIds(importedStagingList.map(p => p.sku));
    } else {
      setSelectedImportedIds([]);
    }
  };

  const handleImportedSelect = (sku: string, checked: boolean) => {
    if (checked) {
      setSelectedImportedIds([...selectedImportedIds, sku]);
    } else {
      setSelectedImportedIds(selectedImportedIds.filter(id => id !== sku));
    }
  };

  const handleBulkPublishImported = async (publishStatus: 'Published' | 'Draft') => {
    const productsToPublish = importedStagingList
      .filter(p => selectedImportedIds.includes(p.sku))
      .map(p => ({ ...p, status: publishStatus }));

    if (productsToPublish.length === 0) {
      showToast('No products selected for publication!', true);
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.bulkCreateProducts(productsToPublish);
      showToast(`Successfully published ${productsToPublish.length} items to catalogue as ${publishStatus}!`);
      setImportedStagingList([]);
      setSelectedImportedIds([]);
      setImportUrl('');
      setImportSupplier('');
      setImportBrand('');
      onRefreshProducts();
    } catch (err: any) {
      showToast(`Bulk publish failed: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  // 10. Settings Configuration Saving
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.updateSettings({
        siteName: settingsForm.websiteName,
        logoUrl: settingsForm.logoUrl,
        whatsappNumber: settingsForm.whatsappNumber,
        currency: settingsForm.currency,
        deliveryFee: settingsForm.deliveryFee,
        supportEmail: settingsForm.contactEmail
      });
      showToast('Shopify Lite portal configurations saved successfully to database!');
      // Trigger global page refresh by mimicking catalog reload
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      showToast(`Failed to save settings: ${err.message}`, true);
    } finally {
      setLoading(false);
    }
  };

  // Form setup for adding / editing product
  const openProductForm = (product: any | null = null) => {
    if (product) {
      setEditingProduct(product);
      setProdForm({
        sku: product.sku || '',
        name: product.name || '',
        description: product.description || '',
        category: product.category || 'dresses',
        subcategory: product.subcategory || '',
        brand: product.brand || '',
        priceETB: product.priceETB?.toString() || '',
        originalPriceETB: product.originalPriceETB?.toString() || '',
        sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : 'S, M, L, XL',
        colors: Array.isArray(product.colors) ? product.colors : [],
        images: Array.isArray(product.images) ? product.images.join('\n') : '',
        isFeatured: !!product.isFeatured,
        isNewArrival: !!product.isNewArrival,
        quantityAvailable: product.quantityAvailable?.toString() || '10',
        lowStockAlertThreshold: product.lowStockAlertThreshold?.toString() || '3',
        status: product.status || 'Published',
        supplierId: product.supplierId?.toString() || '',
        brandId: product.brandId?.toString() || '',
        departmentId: product.departmentId?.toString() || '',
        categoryId: product.categoryId?.toString() || '',
        subcategoryId: product.subcategoryId?.toString() || ''
      });
    } else {
      setEditingProduct(null);
      setProdForm({
        sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
        name: '',
        description: '',
        category: 'dresses',
        subcategory: '',
        brand: 'Dubai Outlet',
        priceETB: '',
        originalPriceETB: '',
        sizes: 'S, M, L, XL',
        colors: [
          { name: 'Classic Black', hex: '#111111' },
          { name: 'Satin Gold', hex: '#d4af37' }
        ],
        images: '',
        isFeatured: false,
        isNewArrival: true,
        quantityAvailable: '10',
        lowStockAlertThreshold: '3',
        status: 'Published',
        supplierId: '',
        brandId: '',
        departmentId: '',
        categoryId: '',
        subcategoryId: ''
      });
    }
    setIsEditing(true);
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-50 overflow-y-auto flex items-center justify-center p-2 md:p-6">
      <div className="bg-white w-full max-w-7xl rounded-xl border border-neutral-200/80 shadow-2xl flex flex-col h-[94vh] overflow-hidden font-sans">
        
        {/* Portal Header */}
        <div className="bg-neutral-950 text-white px-5 py-3.5 flex items-center justify-between border-b border-neutral-800 shrink-0 select-none">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-neutral-950 p-1.5 rounded-md flex items-center justify-center shrink-0">
              <ShoppingBag className="h-5 w-5 font-black" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans font-black tracking-widest text-[#D4AF37] uppercase text-[10px]">
                  {settingsForm.websiteName}
                </span>
                <span className="bg-amber-500/10 text-amber-400 text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded uppercase">
                  Shopify Lite
                </span>
              </div>
              <h1 className="text-xs font-semibold text-neutral-400">Launch Management Workspace</h1>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-all hover:rotate-90 p-1.5 rounded-lg hover:bg-neutral-800/50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Toast Message alerts */}
        {message && (
          <div className="bg-emerald-50 border-b border-emerald-150 text-emerald-800 px-6 py-2.5 font-sans font-semibold text-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage('')} className="text-emerald-500 hover:text-emerald-950 font-bold uppercase text-[10px]">Dismiss</button>
          </div>
        )}

        {errorMessage && (
          <div className="bg-rose-50 border-b border-rose-150 text-rose-800 px-6 py-2.5 font-sans font-semibold text-xs flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage('')} className="text-rose-500 hover:text-rose-950 font-bold uppercase text-[10px]">Dismiss</button>
          </div>
        )}

        {/* Workspace Layout Grid */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar Menu Panel */}
          <div className="w-56 bg-neutral-50 border-r border-neutral-200/70 p-3 shrink-0 flex flex-col justify-between hidden md:flex">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-black text-neutral-400 tracking-wider block px-2.5 mb-3 select-none">
                Core Workspace
              </span>
              
              <button 
                onClick={() => { setActiveTab('dashboard'); setIsEditing(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'dashboard' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'}`}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <span>Dashboard</span>
              </button>

              <button 
                onClick={() => { setActiveTab('products'); setIsEditing(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'products' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'}`}
              >
                <Package className="h-4 w-4 shrink-0" />
                <span>Products</span>
              </button>

              <button 
                onClick={() => { setActiveTab('import'); setIsEditing(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'import' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'}`}
              >
                <DownloadCloud className="h-4 w-4 shrink-0" />
                <span>Import Products</span>
              </button>

              <button 
                onClick={() => { setActiveTab('orders'); setIsEditing(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'orders' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'}`}
              >
                <ShoppingBag className="h-4 w-4 shrink-0" />
                <span>Orders</span>
              </button>

              <button 
                onClick={() => { setActiveTab('customers'); setIsEditing(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'customers' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'}`}
              >
                <Users className="h-4 w-4 shrink-0" />
                <span>Customers</span>
              </button>

              <button 
                onClick={() => { setActiveTab('purchaseQueue'); setIsEditing(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'purchaseQueue' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'}`}
              >
                <ClipboardList className="h-4 w-4 shrink-0" />
                <span>Purchase Queue</span>
              </button>

              <button 
                onClick={() => { setActiveTab('classifications'); setIsEditing(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'classifications' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'}`}
              >
                <Sliders className="h-4 w-4 shrink-0" />
                <span>Classifications</span>
              </button>

              <button 
                onClick={() => { setActiveTab('settings'); setIsEditing(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'settings' ? 'bg-neutral-900 text-white shadow-md' : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'}`}
              >
                <Settings className="h-4 w-4 shrink-0" />
                <span>Settings</span>
              </button>
            </div>

            {/* Operator info footprint */}
            <div className="bg-neutral-100 p-2.5 rounded-lg border border-neutral-200/50 text-[10px] space-y-1 select-none">
              <div className="flex items-center gap-1.5 font-bold text-neutral-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>Online Staff</span>
              </div>
              <p className="font-medium text-neutral-500 truncate">{user?.email}</p>
              <p className="text-amber-600 font-extrabold uppercase text-[8px] tracking-widest">{user?.role} level</p>
            </div>
          </div>

          {/* Right Workspace Main View */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto bg-neutral-100/50 flex flex-col">
            
            {/* Mobile Touch navigation layout */}
            <div className="flex md:hidden gap-1 mb-4 overflow-x-auto pb-2 border-b border-neutral-200 shrink-0">
              {(['dashboard', 'products', 'import', 'orders', 'customers', 'purchaseQueue', 'classifications', 'settings'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setIsEditing(false); }}
                  className={`px-3.5 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md border shrink-0 transition-all ${
                    activeTab === tab
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow'
                      : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50'
                  }`}
                >
                  {tab === 'import' ? 'Import' : tab === 'purchaseQueue' ? 'Sourcing Queue' : tab === 'classifications' ? 'Classifications' : tab}
                </button>
              ))}
            </div>

            {loading && activeTab !== 'import' && (
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <Loader2 className="h-8 w-8 text-neutral-800 animate-spin" />
                <span className="font-extrabold text-neutral-400 text-[10px] mt-3.5 uppercase tracking-widest">
                  Loading Store Data...
                </span>
              </div>
            )}

            {(!loading || activeTab === 'import') && (
              <>
                {/* 1. DASHBOARD VIEW */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    
                    {/* Bento Metrics Cards Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      
                      <div className="bg-white p-5 rounded-xl border border-neutral-200/70 shadow-sm relative overflow-hidden group">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest block">Catalog Sourced</span>
                        <div className="flex items-baseline gap-1.5 mt-1.5">
                          <span className="text-2xl font-black text-neutral-900 font-sans">
                            {products.length}
                          </span>
                          <span className="text-xs text-neutral-400 font-bold">Total</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-[9px] font-semibold text-neutral-500">
                          <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                            {products.filter(p => (p.status || 'Published') === 'Published').length} Published
                          </span>
                          <span className="bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded">
                            {products.filter(p => p.status === 'Draft').length} Drafts
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-neutral-200/70 shadow-sm">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest block">Order Volume</span>
                        <div className="flex items-baseline gap-1.5 mt-1.5">
                          <span className="text-2xl font-black text-neutral-900 font-sans">
                            {ordersList.length}
                          </span>
                          <span className="text-xs text-neutral-400 font-bold">Placed</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-[9px] font-semibold">
                          <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                            {ordersList.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length} Pending
                          </span>
                          <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                            {ordersList.filter(o => o.status === 'Delivered').length} Completed
                          </span>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-neutral-200/70 shadow-sm">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest block">Total Revenue</span>
                        <div className="flex items-baseline gap-1 mt-1.5">
                          <span className="text-2xl font-black text-emerald-700 font-mono">
                            {(analytics?.totalRevenue || 0).toLocaleString()}
                          </span>
                          <span className="text-xs text-neutral-500 font-bold">{settingsForm.currency}</span>
                        </div>
                        <span className="text-[9px] text-neutral-400 font-medium block mt-2 uppercase tracking-wide">
                          From delivered orders
                        </span>
                      </div>

                      <div className="bg-white p-5 rounded-xl border border-neutral-200/70 shadow-sm">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest block">Customer Directory</span>
                        <div className="flex items-baseline gap-1.5 mt-1.5">
                          <span className="text-2xl font-black text-neutral-900 font-sans">
                            {customersList.length}
                          </span>
                          <span className="text-xs text-neutral-400 font-bold">Registered</span>
                        </div>
                        <span className="text-[9px] text-emerald-600 font-bold block mt-2 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span>Fully synchronized</span>
                        </span>
                      </div>

                    </div>

                    {/* Quick actions row */}
                    <div className="bg-neutral-900 text-white p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-md select-none">
                      <div className="flex items-center gap-3">
                        <Sparkles className="h-5 w-5 text-amber-400 shrink-0 animate-pulse" />
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-200">Shopify Lite Launch Pad</h4>
                          <p className="text-[10px] text-neutral-400 mt-0.5">Quickly import products from supplier websites or add them manually to start cataloging.</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button 
                          onClick={() => setActiveTab('import')}
                          className="bg-amber-500 hover:bg-amber-600 text-neutral-950 font-extrabold px-3.5 py-2 text-[10px] uppercase rounded-lg tracking-wider flex items-center gap-1.5 cursor-pointer shadow"
                        >
                          <DownloadCloud className="h-4 w-4" />
                          <span>Import Supplier Products</span>
                        </button>
                        <button 
                          onClick={() => { setActiveTab('products'); openProductForm(); }}
                          className="bg-white/10 hover:bg-white/20 text-white font-extrabold px-3.5 py-2 text-[10px] uppercase rounded-lg tracking-wider flex items-center gap-1.5 cursor-pointer border border-white/10"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Single Product</span>
                        </button>
                        <button 
                          onClick={() => setActiveTab('orders')}
                          className="bg-white/10 hover:bg-white/20 text-white font-extrabold px-3.5 py-2 text-[10px] uppercase rounded-lg tracking-wider flex items-center gap-1.5 cursor-pointer border border-white/10"
                        >
                          <ShoppingBag className="h-4 w-4" />
                          <span>View Orders</span>
                        </button>
                      </div>
                    </div>

                    {/* Dashboard logs & staged products row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* Latest Orders */}
                      <div className="bg-white rounded-xl border border-neutral-200/70 p-5 shadow-sm overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4 shrink-0 select-none">
                          <h4 className="text-[11px] font-black text-black tracking-widest uppercase flex items-center gap-1.5">
                            <ShoppingBag className="h-4 w-4 text-neutral-600" />
                            <span>Latest Customer Orders</span>
                          </h4>
                          <button onClick={() => setActiveTab('orders')} className="text-amber-600 hover:underline text-[10px] font-bold">View all</button>
                        </div>
                        
                        {ordersList.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-neutral-400">
                            <ShoppingBag className="h-10 w-10 text-neutral-200 mb-2" />
                            <p className="text-xs font-semibold">No order logs received yet</p>
                          </div>
                        ) : (
                          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px]">
                            {ordersList.slice(0, 5).map((ord) => (
                              <div key={ord.id} className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-50 bg-neutral-50/30 text-xs hover:bg-neutral-50 transition-colors">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-neutral-900 font-mono">ORDER #{ord.id}</span>
                                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                      ord.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700' :
                                      ord.status === 'Cancelled' ? 'bg-rose-50 text-rose-700' :
                                      'bg-amber-50 text-amber-700'
                                    }`}>
                                      {ord.status}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-neutral-500 font-semibold">{ord.customerName} • {ord.customerPhone}</p>
                                </div>
                                <span className="font-black text-neutral-950 font-mono">{ord.totalAmountETB.toLocaleString()} {settingsForm.currency}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Staged & Draft Products */}
                      <div className="bg-white rounded-xl border border-neutral-200/70 p-5 shadow-sm overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4 shrink-0 select-none">
                          <h4 className="text-[11px] font-black text-black tracking-widest uppercase flex items-center gap-1.5">
                            <PlusCircle className="h-4 w-4 text-neutral-600" />
                            <span>Staged & Draft Products</span>
                          </h4>
                          <button onClick={() => { setActiveTab('products'); setProdStatusFilter('Draft'); }} className="text-amber-600 hover:underline text-[10px] font-bold">View drafts</button>
                        </div>

                        {products.filter(p => p.status === 'Draft').length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-neutral-400">
                            <Package className="h-10 w-10 text-neutral-200 mb-2" />
                            <p className="text-xs font-semibold">No products staged as Draft</p>
                            <p className="text-[10px] text-neutral-400 mt-0.5">All products are currently active and live.</p>
                          </div>
                        ) : (
                          <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px]">
                            {products.filter(p => p.status === 'Draft').slice(0, 5).map((prod) => (
                              <div key={prod.id} className="flex items-center justify-between p-2 rounded-lg border border-neutral-50 hover:bg-neutral-50 transition-colors text-xs">
                                <div className="flex items-center gap-3">
                                  <img src={prod.images?.[0] || 'https://placehold.co/40'} className="h-8 w-8 object-cover rounded-md border" />
                                  <div className="space-y-0.5">
                                    <h5 className="font-bold text-neutral-900 truncate max-w-[200px]">{prod.name}</h5>
                                    <p className="text-[9px] text-neutral-400 font-mono">{prod.sku} • {prod.category}</p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => handleToggleProductStatus(prod)}
                                  className="text-[10px] text-emerald-600 hover:text-emerald-800 font-bold px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 transition-colors"
                                >
                                  Publish
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Low stock indicators block */}
                    {analytics?.lowStockAlerts > 0 && (
                      <div className="bg-rose-50 border border-rose-150 p-4 rounded-xl flex items-start gap-3 select-none">
                        <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
                        <div className="space-y-1.5 flex-1">
                          <h4 className="font-extrabold text-[10px] uppercase tracking-wider text-rose-800">
                            Sourcing Alert: Low stock monitors triggered ({analytics.lowStockAlerts} items)
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {analytics.lowStockItems.map((it: any) => (
                              <div key={it.id} className="bg-white p-2 border border-rose-100 rounded text-[10px] flex justify-between items-center font-mono">
                                <span className="font-bold text-neutral-850 truncate max-w-[130px]">{it.name}</span>
                                <span className="bg-rose-100 text-rose-850 px-1.5 py-0.5 rounded font-black text-[9px]">Available: {it.qty}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* 2. PRODUCTS CATALOG VIEW */}
                {activeTab === 'products' && (
                  <div className="bg-white p-4 md:p-5 rounded-xl border border-neutral-200/70 shadow-sm space-y-4">
                    
                    {/* View/Edit Stage toggle */}
                    {isEditing ? (
                      <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                          <h2 className="font-extrabold text-sm uppercase tracking-wider text-black flex items-center gap-2">
                            <Sparkles className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                            <span>{editingProduct ? '📝 Professional Product Editor' : '✨ Add Sourced Item to Catalog'}</span>
                          </h2>
                          <button 
                            onClick={() => { setIsEditing(false); setEditingProduct(null); }}
                            className="text-neutral-400 hover:text-black font-extrabold text-[10px] uppercase flex items-center gap-1.5 hover:bg-neutral-100 px-3 py-1.5 rounded-lg"
                          >
                            <X className="h-4 w-4" />
                            <span>Cancel Form</span>
                          </button>
                        </div>

                        <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                          
                          <div className="space-y-1 block">
                            <label className="font-bold text-neutral-700 uppercase text-[10px]">Master SKU Code *</label>
                            <input 
                              type="text" 
                              className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-mono" 
                              required 
                              value={prodForm.sku}
                              onChange={e => setProdForm({...prodForm, sku: e.target.value})}
                            />
                                                   <div className="space-y-1 block">
                            <label className="font-bold text-neutral-700 uppercase text-[10px]">Product Name *</label>
                            <input 
                              type="text" 
                              className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black" 
                              required 
                              value={prodForm.name}
                              onChange={e => setProdForm({...prodForm, name: e.target.value})}
                            />
                          </div>

                          <div className="space-y-1.5 block md:col-span-2 bg-neutral-50/70 p-4 rounded-xl border border-neutral-200/50 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <span className="col-span-1 md:col-span-2 text-[10px] font-black text-black tracking-wider uppercase mb-1 block">Dynamic Product Classifications & Taxonomy</span>
                            
                            {/* Supplier Selector */}
                            <div className="space-y-1 block">
                              <label className="font-extrabold text-neutral-600 uppercase text-[9.5px]">Supplier Name</label>
                              <select 
                                className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black text-xs font-semibold"
                                value={prodForm.supplierId}
                                onChange={e => setProdForm({...prodForm, supplierId: e.target.value})}
                              >
                                <option value="">-- No Supplier bound --</option>
                                {dbSuppliers.map(s => (
                                  <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                              </select>
                            </div>

                            {/* Brand Selector */}
                            <div className="space-y-1 block">
                              <label className="font-extrabold text-neutral-600 uppercase text-[9.5px]">Brand Name</label>
                              <select 
                                className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black text-xs font-semibold"
                                value={prodForm.brandId}
                                onChange={e => {
                                  const bid = e.target.value;
                                  const br = dbBrands.find(b => b.id === parseInt(bid));
                                  setProdForm({
                                    ...prodForm, 
                                    brandId: bid,
                                    brand: br ? br.name : prodForm.brand
                                  });
                                }}
                              >
                                <option value="">-- No Brand bound --</option>
                                {dbBrands.map(b => (
                                  <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                              </select>
                            </div>

                            {/* Department Selector */}
                            <div className="space-y-1 block">
                              <label className="font-extrabold text-neutral-600 uppercase text-[9.5px]">Department *</label>
                              <select 
                                className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black text-xs font-semibold"
                                required
                                value={prodForm.departmentId}
                                onChange={e => setProdForm({...prodForm, departmentId: e.target.value})}
                              >
                                <option value="">-- Choose Department --</option>
                                {dbDepartments.map(d => (
                                  <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                              </select>
                            </div>

                            {/* Category Selector */}
                            <div className="space-y-1 block">
                              <label className="font-extrabold text-neutral-600 uppercase text-[9.5px]">Main Category *</label>
                              <select 
                                className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black text-xs font-semibold"
                                required
                                value={prodForm.categoryId}
                                onChange={e => {
                                  const cid = e.target.value;
                                  const cat = dbCategories.find(c => c.id === parseInt(cid));
                                  setProdForm({
                                    ...prodForm, 
                                    categoryId: cid,
                                    category: cat ? cat.name.toLowerCase() : prodForm.category,
                                    subcategoryId: '' // Reset subcategory when main category changes
                                  });
                                }}
                              >
                                <option value="">-- Choose Main Category --</option>
                                {dbCategories.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                              </select>
                            </div>

                            {/* Subcategory Selector */}
                            <div className="space-y-1 block md:col-span-2">
                              <label className="font-extrabold text-neutral-600 uppercase text-[9.5px]">Subcategory</label>
                              <select 
                                className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black text-xs font-semibold"
                                value={prodForm.subcategoryId}
                                onChange={e => {
                                  const sid = e.target.value;
                                  const sub = dbSubcategories.find(s => s.id === parseInt(sid));
                                  setProdForm({
                                    ...prodForm, 
                                    subcategoryId: sid,
                                    subcategory: sub ? sub.name : prodForm.subcategory
                                  });
                                }}
                                disabled={!prodForm.categoryId}
                              >
                                <option value="">-- No Subcategory or Choose --</option>
                                {dbSubcategories
                                  .filter(s => s.categoryId === parseInt(prodForm.categoryId))
                                  .map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                  ))
                                }
                              </select>
                            </div>
                          </div>   </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1 block">
                              <label className="font-bold text-neutral-700 uppercase text-[10px]">Price in ETB *</label>
                              <input 
                                type="number" 
                                className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-mono font-bold text-emerald-800" 
                                required
                                value={prodForm.priceETB}
                                onChange={e => setProdForm({...prodForm, priceETB: e.target.value})}
                              />
                            </div>
                            <div className="space-y-1 block">
                              <label className="font-bold text-neutral-700 uppercase text-[10px]">Compare Mall Price (ETB)</label>
                              <input 
                                type="number" 
                                className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-mono text-neutral-400" 
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
                                className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-mono" 
                                required
                                value={prodForm.quantityAvailable}
                                onChange={e => setProdForm({...prodForm, quantityAvailable: e.target.value})}
                              />
                            </div>
                            <div className="space-y-1 block">
                              <label className="font-bold text-neutral-700 uppercase text-[10px]">Low Stock Limit</label>
                              <input 
                                type="number" 
                                className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-mono" 
                                required
                                value={prodForm.lowStockAlertThreshold}
                                onChange={e => setProdForm({...prodForm, lowStockAlertThreshold: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="space-y-1 block md:col-span-2">
                            <label className="font-bold text-neutral-700 uppercase text-[10px]">Sizes (comma-separated)</label>
                            <input 
                              type="text" 
                              className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black" 
                              value={prodForm.sizes}
                              onChange={e => setProdForm({...prodForm, sizes: e.target.value})}
                            />
                          </div>

                          <div className="space-y-1 block md:col-span-2">
                            <label className="font-bold text-neutral-700 uppercase text-[10px]">Image URLs (one URL per line)</label>
                            <textarea 
                              rows={3}
                              className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-mono text-[10px]" 
                              placeholder="https://images.unsplash.com/..."
                              value={prodForm.images}
                              onChange={e => setProdForm({...prodForm, images: e.target.value})}
                            />
                          </div>

                          <div className="space-y-1 block md:col-span-2">
                            <label className="font-bold text-neutral-700 uppercase text-[10px]">Product Copy Description</label>
                            <textarea 
                              rows={3}
                              className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black" 
                              value={prodForm.description}
                              onChange={e => setProdForm({...prodForm, description: e.target.value})}
                            />
                          </div>

                          {/* Featured toggles and Status Selection */}
                          <div className="flex flex-wrap gap-6 items-center py-2 md:col-span-2 select-none justify-between border-t border-neutral-100 pt-3">
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer font-bold">
                                <input 
                                  type="checkbox" 
                                  checked={prodForm.isFeatured} 
                                  onChange={e => setProdForm({...prodForm, isFeatured: e.target.checked})}
                                  className="rounded border-neutral-300 text-amber-500 h-4 w-4"
                                />
                                <span className="uppercase text-[10px] text-neutral-700">Feature on Homepage</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer font-bold">
                                <input 
                                  type="checkbox" 
                                  checked={prodForm.isNewArrival} 
                                  onChange={e => setProdForm({...prodForm, isNewArrival: e.target.checked})}
                                  className="rounded border-neutral-300 text-amber-500 h-4 w-4"
                                />
                                <span className="uppercase text-[10px] text-neutral-700">Mark as New Arrival</span>
                              </label>
                            </div>
                            
                            <div className="flex items-center gap-2 block">
                              <label className="font-bold text-neutral-700 uppercase text-[10px]">Catalog Status:</label>
                              <select
                                value={prodForm.status}
                                onChange={e => setProdForm({...prodForm, status: e.target.value})}
                                className="bg-white border border-neutral-300 rounded-lg px-2.5 py-1.5 font-bold uppercase text-[9px] focus:outline-none"
                              >
                                <option value="Published">Published (Live)</option>
                                <option value="Draft">Draft (Staged)</option>
                              </select>
                            </div>
                          </div>

                          <div className="md:col-span-2 flex justify-end gap-2.5 pt-3 border-t border-neutral-100 shrink-0">
                            <button 
                              type="button" 
                              onClick={() => { setIsEditing(false); setEditingProduct(null); }}
                              className="border border-neutral-250 px-5 py-2.5 rounded-lg font-bold hover:bg-neutral-50"
                            >
                              Abort
                            </button>
                            <button 
                              type="submit" 
                              className="bg-neutral-950 hover:bg-amber-500 text-white hover:text-black px-6 py-2.5 rounded-lg font-black uppercase tracking-widest transition-all"
                            >
                              Save Product Specs
                            </button>
                          </div>

                        </form>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        
                        {/* Table Top Filter Toolbar */}
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/50">
                          
                          {/* Left: Search input */}
                          <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                              type="text"
                              value={prodSearch}
                              onChange={e => { setProdSearch(e.target.value); setProdPage(1); }}
                              placeholder="Search by product name, SKU, or brand supplier..."
                              className="w-full bg-white h-10 pl-10 pr-4 text-xs border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-semibold"
                            />
                            {prodSearch && (
                              <button onClick={() => setProdSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black">
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          {/* Right: Category, Brand, Status filters + action buttons */}
                          <div className="flex flex-wrap items-center gap-2">
                            
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black uppercase text-neutral-400">Category:</span>
                              <select
                                value={prodCatFilter}
                                onChange={e => { setProdCatFilter(e.target.value); setProdPage(1); }}
                                className="bg-white border border-neutral-250 rounded-lg px-2.5 py-1.5 font-bold text-[10px] uppercase cursor-pointer focus:outline-none"
                              >
                                <option value="All">All Categories</option>
                                <option value="dresses">Dresses</option>
                                <option value="abayas">Abayas</option>
                                <option value="handbags">Handbags</option>
                                <option value="shoes">Shoes</option>
                                <option value="beauty">Beauty</option>
                                <option value="jewelry">Jewelry</option>
                                <option value="watches">Watches</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black uppercase text-neutral-400">Status:</span>
                              <select
                                value={prodStatusFilter}
                                onChange={e => { setProdStatusFilter(e.target.value); setProdPage(1); }}
                                className="bg-white border border-neutral-250 rounded-lg px-2.5 py-1.5 font-bold text-[10px] uppercase cursor-pointer focus:outline-none"
                              >
                                <option value="All">All Statuses</option>
                                <option value="Published">Published</option>
                                <option value="Draft">Draft</option>
                              </select>
                            </div>

                            <button 
                              onClick={() => openProductForm()}
                              className="bg-neutral-950 hover:bg-amber-500 text-white hover:text-black font-extrabold px-4 py-2.5 text-[10px] uppercase rounded-lg tracking-wider flex items-center gap-1.5 cursor-pointer shadow transition-all shrink-0"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add Product</span>
                            </button>
                          </div>

                        </div>

                        {/* Floating Bulk actions overlay toolbar */}
                        {selectedProdIds.length > 0 && (
                          <div className="bg-neutral-900 text-white p-3 rounded-xl flex items-center justify-between gap-4 shadow-lg select-none animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-300">
                              <span className="bg-white/10 text-white px-2 py-0.5 rounded-md font-bold font-mono">
                                {selectedProdIds.length}
                              </span>
                              <span>products selected</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleBulkStatusChange('Published')}
                                className="bg-white/10 hover:bg-emerald-600 hover:text-white text-white font-extrabold px-3 py-1.5 text-[9px] uppercase rounded-md tracking-wider transition-colors"
                              >
                                Bulk Publish
                              </button>
                              <button 
                                onClick={() => handleBulkStatusChange('Draft')}
                                className="bg-white/10 hover:bg-neutral-600 hover:text-white text-white font-extrabold px-3 py-1.5 text-[9px] uppercase rounded-md tracking-wider transition-colors"
                              >
                                Bulk Stage Draft
                              </button>
                              <button 
                                onClick={handleBulkDelete}
                                className="bg-white/10 hover:bg-rose-600 hover:text-white text-rose-400 font-extrabold px-3 py-1.5 text-[9px] uppercase rounded-md tracking-wider transition-colors"
                              >
                                Bulk Delete
                              </button>
                              <button 
                                onClick={() => setSelectedProdIds([])}
                                className="text-neutral-400 hover:text-white p-1 text-[9px] uppercase font-bold"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Products Data Table */}
                        <div className="overflow-x-auto rounded-xl border border-neutral-200/50">
                          <table className="w-full text-left text-xs font-sans whitespace-nowrap">
                            <thead>
                              <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-extrabold uppercase text-[10px] select-none">
                                <th className="py-3 px-4 w-4 text-center">
                                  <input 
                                    type="checkbox" 
                                    className="rounded border-neutral-300 text-neutral-950 h-3.5 w-3.5"
                                    checked={paginatedProducts.length > 0 && selectedProdIds.length === paginatedProducts.length}
                                    onChange={handleSelectAllProducts}
                                  />
                                </th>
                                <th className="py-3 px-3">Item details</th>
                                <th className="py-3 px-3">SKU Code</th>
                                <th className="py-3 px-3">Category</th>
                                <th className="py-3 px-3">Brand</th>
                                <th className="py-3 px-3">Price</th>
                                <th className="py-3 px-3">Stock Available</th>
                                <th className="py-3 px-3">Status</th>
                                <th className="py-3 px-4 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                              {paginatedProducts.length === 0 ? (
                                <tr>
                                  <td colSpan={9} className="py-12 text-center text-neutral-400 font-bold">
                                    No products found matching filters.
                                  </td>
                                </tr>
                              ) : (
                                paginatedProducts.map((p) => {
                                  const currentStatus = p.status || 'Published';
                                  return (
                                    <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                                      <td className="py-3.5 px-4 text-center">
                                        <input 
                                          type="checkbox" 
                                          className="rounded border-neutral-300 text-neutral-950 h-3.5 w-3.5 cursor-pointer"
                                          checked={selectedProdIds.includes(p.id)}
                                          onChange={(e) => handleSelectProduct(p.id, e.target.checked)}
                                        />
                                      </td>
                                      <td className="py-3.5 px-3">
                                        <div className="flex items-center gap-3">
                                          <img src={p.images?.[0] || 'https://placehold.co/40'} alt="" className="h-10 w-10 object-cover border border-neutral-200 rounded-lg shrink-0 cursor-pointer" onClick={() => setProductPreview(p)} />
                                          <div>
                                            <h4 className="font-extrabold text-neutral-900 cursor-pointer hover:text-amber-600 transition-colors" onClick={() => setProductPreview(p)}>{p.name}</h4>
                                            <div className="flex items-center gap-2 mt-0.5 select-none">
                                              {p.isFeatured && <span className="text-[7.5px] bg-amber-50 text-amber-700 font-black tracking-widest px-1.5 py-0.5 rounded uppercase">Featured</span>}
                                              {p.isNewArrival && <span className="text-[7.5px] bg-indigo-50 text-indigo-700 font-black tracking-widest px-1.5 py-0.5 rounded uppercase">New</span>}
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-3.5 px-3 font-mono text-[10px] font-bold text-neutral-500">{p.sku}</td>
                                      <td className="py-3.5 px-3 text-neutral-700 capitalize font-bold text-[10.5px]">{p.category}</td>
                                      <td className="py-3.5 px-3 text-neutral-500 font-semibold">{p.brand || 'Dubai Brand'}</td>
                                      <td className="py-3.5 px-3 font-mono font-black text-neutral-950 text-[11px]">
                                        {p.priceETB?.toLocaleString()} {settingsForm.currency}
                                      </td>
                                      <td className="py-3.5 px-3">
                                        <span className={`font-black font-mono text-[11px] ${p.quantityAvailable <= p.lowStockAlertThreshold ? 'text-red-600 font-extrabold' : 'text-neutral-700'}`}>
                                          {p.quantityAvailable} units
                                        </span>
                                        {p.quantityAvailable <= p.lowStockAlertThreshold && (
                                          <span className="block text-[8px] text-red-500 font-black uppercase mt-0.5 select-none">LOW STOCK</span>
                                        )}
                                      </td>
                                      <td className="py-3.5 px-3">
                                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                          currentStatus === 'Published' 
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                            : 'bg-neutral-100 text-neutral-600'
                                        }`}>
                                          {currentStatus}
                                        </span>
                                      </td>
                                      <td className="py-3.5 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1 select-none">
                                          <button 
                                            onClick={() => openProductForm(p)}
                                            className="hover:bg-neutral-100 text-neutral-600 hover:text-black p-1.5 rounded-lg transition-colors"
                                            title="Edit specifications"
                                          >
                                            <Edit3 className="h-4 w-4" />
                                          </button>
                                          <button 
                                            onClick={() => handleToggleProductStatus(p)}
                                            className="hover:bg-neutral-100 text-neutral-600 hover:text-black p-1.5 rounded-lg transition-colors"
                                            title={(p.status || 'Published') === 'Published' ? 'Hide / Draft' : 'Publish / Make live'}
                                          >
                                            {(p.status || 'Published') === 'Published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                          </button>
                                          <button 
                                            onClick={() => handleDuplicateProduct(p)}
                                            className="hover:bg-neutral-100 text-neutral-600 hover:text-black p-1.5 rounded-lg transition-colors"
                                            title="Duplicate item"
                                          >
                                            <Copy className="h-4 w-4" />
                                          </button>
                                          <button 
                                            onClick={() => handleDeleteProduct(p.id)}
                                            className="hover:bg-rose-50 text-rose-600 p-1.5 rounded-lg transition-colors"
                                            title="Delete product"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination footer */}
                        {filteredProducts.length > prodsPerPage && (
                          <div className="flex items-center justify-between pt-4 select-none">
                            <span className="text-[10px] text-neutral-400 font-bold uppercase">
                              Showing {((prodPage - 1) * prodsPerPage) + 1} to {Math.min(prodPage * prodsPerPage, filteredProducts.length)} of {filteredProducts.length} pieces
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                disabled={prodPage === 1}
                                onClick={() => setProdPage(prodPage - 1)}
                                className="border border-neutral-200 px-3 py-1.5 rounded-md text-xs font-bold bg-white text-neutral-600 hover:text-black disabled:opacity-50"
                              >
                                Previous
                              </button>
                              <span className="text-xs font-bold px-3">Page {prodPage} of {totalProdPages}</span>
                              <button
                                disabled={prodPage === totalProdPages}
                                onClick={() => setProdPage(prodPage + 1)}
                                className="border border-neutral-200 px-3 py-1.5 rounded-md text-xs font-bold bg-white text-neutral-600 hover:text-black disabled:opacity-50"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    )}

                  </div>
                )}

                {/* 3. UNIVERSAL PRODUCT IMPORT ENGINE */}
                {activeTab === 'import' && (
                  <UniversalImportEngine 
                    currency={settingsForm.currency} 
                    onImportCompleted={onRefreshProducts} 
                  />
                )}

                {/* 4. ORDERS DIRECTORY VIEW */}
                {activeTab === 'orders' && (
                  <div className="bg-white p-4 md:p-5 rounded-xl border border-neutral-200/70 shadow-sm space-y-4">
                    
                    {/* Orders Filter Toolbar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-neutral-50 p-3 rounded-xl border border-neutral-200/50">
                      
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          type="text"
                          value={orderSearch}
                          onChange={e => setOrderSearch(e.target.value)}
                          placeholder="Search orders by number, client name, phone..."
                          className="w-full bg-white h-10 pl-10 pr-4 text-xs border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-semibold"
                        />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase text-neutral-400">Filter Status:</span>
                        <select
                          value={orderStatusFilter}
                          onChange={e => setOrderStatusFilter(e.target.value)}
                          className="bg-white border border-neutral-250 rounded-lg px-2.5 py-1.5 font-bold text-[10px] uppercase cursor-pointer focus:outline-none"
                        >
                          <option value="All">All Statuses</option>
                          <option value="Pending">Pending</option>
                          <option value="Deposit Pending">Deposit Pending</option>
                          <option value="Deposit Received">Deposit Received</option>
                          <option value="Purchased in Dubai">Purchased in Dubai</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Arrived in Ethiopia">Arrived in Ethiopia</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                    </div>

                    {/* Orders Table */}
                    <div className="overflow-x-auto rounded-xl border border-neutral-200/50">
                      <table className="w-full text-left text-xs font-sans whitespace-nowrap">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-extrabold uppercase text-[10px]">
                            <th className="py-3 px-4">Order Code</th>
                            <th className="py-3 px-3">Customer Identity</th>
                            <th className="py-3 px-3">Contact Dials</th>
                            <th className="py-3 px-3">Total Amount Sourced</th>
                            <th className="py-3 px-3">Hub Location Address</th>
                            <th className="py-3 px-3">Progression Status</th>
                            <th className="py-3 px-3">Purchased Articles</th>
                            <th className="py-3 px-4 text-right">Workflow Change</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {filteredOrders.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-neutral-400 font-bold">
                                No customer orders match query.
                              </td>
                            </tr>
                          ) : (
                            filteredOrders.map((or) => (
                              <tr key={or.id} className="hover:bg-neutral-50/40 transition-colors">
                                <td className="py-3 px-4">
                                  <span className="bg-neutral-950 text-white px-2.5 py-1 rounded font-black font-mono text-[10.5px]">
                                    #{or.id}
                                  </span>
                                  <span className="block text-[8px] text-neutral-400 font-bold mt-1 font-mono">
                                    {new Date(or.createdAt).toLocaleDateString()}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-extrabold text-neutral-950">{or.customerName}</div>
                                  <div className="text-[9px] text-neutral-400 font-mono mt-0.5">{or.shippingCity || 'Ethiopia'}</div>
                                </td>
                                <td className="py-3 px-3 font-semibold text-neutral-700">
                                  <div>Phone: {or.customerPhone}</div>
                                  {or.customerWhatsapp && (
                                    <a 
                                      href={`https://wa.me/${or.customerWhatsapp.replace(/[^0-9]/g, '')}`}
                                      target="_blank" 
                                      referrerPolicy="no-referrer"
                                      className="text-emerald-600 hover:underline flex items-center gap-1 font-bold text-[9px] uppercase mt-0.5"
                                    >
                                      <span>WhatsApp</span>
                                      <ExternalLink className="h-2.5 w-2.5" />
                                    </a>
                                  )}
                                </td>
                                <td className="py-3 px-3 font-mono font-black text-emerald-800 text-[11px]">{or.totalAmountETB?.toLocaleString()} {settingsForm.currency}</td>
                                <td className="py-3 px-3 text-neutral-500 font-bold text-[10.5px]">
                                  {or.shippingAddress ? `${or.shippingAddress}, ${or.shippingCity}` : 'Handover hub'}
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    or.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                    or.status === 'Cancelled' ? 'bg-rose-50 text-rose-700' :
                                    'bg-amber-50 text-amber-700 border border-amber-100'
                                  }`}>
                                    {or.status}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-neutral-600 font-medium max-w-[180px] truncate">
                                  {Array.isArray(or.items) ? or.items.map((it: any) => `${it.quantity}x ${it.product?.name || 'Item'}`).join(', ') : 'Sourced specs'}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <select 
                                    value={or.status} 
                                    onChange={e => handleOrderStatusUpdate(or.id, e.target.value)}
                                    className="bg-white border rounded-lg border-neutral-300 px-2.5 py-1.5 text-[9px] font-black uppercase cursor-pointer outline-none focus:border-neutral-900"
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Deposit Pending">Deposit Pending</option>
                                    <option value="Deposit Received">Deposit Received</option>
                                    <option value="Purchased in Dubai">Purchased in Dubai</option>
                                    <option value="Shipped">Dispatched Shipped</option>
                                    <option value="Arrived in Ethiopia">Arrived in Ethiopia</option>
                                    <option value="Out for Delivery">Out for Delivery</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>
                )}

                {/* 5. CUSTOMERS VIEW */}
                {activeTab === 'customers' && (
                  <div className="bg-white p-4 md:p-5 rounded-xl border border-neutral-200/70 shadow-sm space-y-4">
                    
                    <div className="flex bg-neutral-50 p-3 rounded-xl border border-neutral-200/50">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          type="text"
                          value={customerSearch}
                          onChange={e => setCustomerSearch(e.target.value)}
                          placeholder="Search customers directory by name, phone, email..."
                          className="w-full bg-white h-10 pl-10 pr-4 text-xs border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-semibold"
                        />
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-neutral-200/50">
                      <table className="w-full text-left text-xs font-sans whitespace-nowrap">
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-extrabold uppercase text-[10px]">
                            <th className="py-3 px-4">Customer Name</th>
                            <th className="py-3 px-3">Contact Email / Credentials</th>
                            <th className="py-3 px-3">Dials Phone</th>
                            <th className="py-3 px-3 text-center">Orders Count</th>
                            <th className="py-3 px-3 font-mono">Total Spent</th>
                            <th className="py-3 px-3">Last Active Sourcing</th>
                            <th className="py-3 px-3">Relationship status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                          {filteredCustomers.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-neutral-400 font-bold">
                                No registered customer clients matches.
                              </td>
                            </tr>
                          ) : (
                            filteredCustomers.map((cust) => (
                              <tr key={cust.id} className="hover:bg-neutral-50/40 transition-colors">
                                <td className="py-3 px-4 font-extrabold text-neutral-950">{cust.name}</td>
                                <td className="py-3 px-3 font-mono text-[10.5px] text-neutral-500">{cust.email}</td>
                                <td className="py-3 px-3 font-semibold text-neutral-700">{cust.phone || 'N/A'}</td>
                                <td className="py-3 px-3 text-center font-extrabold text-neutral-900 font-mono">{cust.ordersCount} orders</td>
                                <td className="py-3 px-3 font-mono font-black text-emerald-800 text-[11px]">
                                  {cust.totalSpent?.toLocaleString()} {settingsForm.currency}
                                </td>
                                <td className="py-3 px-3 text-neutral-500 font-semibold">
                                  {cust.lastOrderDate ? new Date(cust.lastOrderDate).toLocaleString() : 'Never ordered'}
                                </td>
                                <td className="py-3 px-3">
                                  <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full ${cust.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-neutral-100 text-neutral-500'}`}>
                                    {cust.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right select-none">
                                  {cust.phone && cust.phone !== 'N/A' ? (
                                    <a 
                                      href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, '')}?text=Hello%20${cust.name}!%20We%20are%20processing%20your%20AddisDubai%20import%20requests.`}
                                      target="_blank"
                                      referrerPolicy="no-referrer"
                                      className="text-[9.5px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-black uppercase transition-all"
                                    >
                                      WhatsApp chat
                                    </a>
                                  ) : (
                                    <span className="text-neutral-300 text-[9px] font-semibold uppercase">No phone</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>
                )}

                {/* 5. PURCHASE QUEUE VIEW */}
                {activeTab === 'purchaseQueue' && (
                  <div className="space-y-6">
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-neutral-200/60 shadow-xs">
                      <div>
                        <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
                          <ClipboardList className="h-5 w-5 text-amber-500 shrink-0" />
                          <span>Supplier Sourcing & Purchase Queue</span>
                        </h2>
                        <p className="text-xs text-neutral-500 font-medium mt-1">
                          Manage real-time cross-border purchases, supplier cost auditing, status pipelines, and custom notes.
                        </p>
                      </div>
                      <button
                        onClick={() => setIsManualTaskModalOpen(true)}
                        className="bg-neutral-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all self-start sm:self-center shadow-md cursor-pointer"
                      >
                        <PlusCircle className="h-4 w-4" />
                        <span>Manual Sourcing Task</span>
                      </button>
                    </div>

                    {/* Bento Box Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="bg-white p-4 rounded-xl border border-neutral-200/50 shadow-xs flex flex-col justify-between">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider block">Total Tasks</span>
                        <div className="flex items-baseline gap-1.5 mt-2">
                          <span className="text-2xl font-black text-neutral-950 font-mono">{purchaseQueueStats.total}</span>
                          <span className="text-[9px] font-bold text-neutral-400">items</span>
                        </div>
                      </div>

                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 shadow-xs flex flex-col justify-between">
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block">To Purchase</span>
                        <div className="flex items-baseline gap-1.5 mt-2">
                          <span className="text-2xl font-black text-amber-800 font-mono">{purchaseQueueStats.toPurchase}</span>
                          <span className="text-[9px] font-bold text-amber-500">pending</span>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-xs flex flex-col justify-between">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">Purchased</span>
                        <div className="flex items-baseline gap-1.5 mt-2">
                          <span className="text-2xl font-black text-blue-800 font-mono">{purchaseQueueStats.purchased}</span>
                          <span className="text-[9px] font-bold text-blue-500">secured</span>
                        </div>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 shadow-xs flex flex-col justify-between">
                        <span className="text-[10px] font-black text-purple-600 uppercase tracking-wider block">Packed</span>
                        <div className="flex items-baseline gap-1.5 mt-2">
                          <span className="text-2xl font-black text-purple-800 font-mono">{purchaseQueueStats.packed}</span>
                          <span className="text-[9px] font-bold text-purple-500">at dubai hub</span>
                        </div>
                      </div>

                      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-xs flex flex-col justify-between">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider block">Ready / Shipped</span>
                        <div className="flex items-baseline gap-1.5 mt-2">
                          <span className="text-2xl font-black text-emerald-800 font-mono">{purchaseQueueStats.ready}</span>
                          <span className="text-[9px] font-bold text-emerald-500">manifested</span>
                        </div>
                      </div>
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="bg-white p-4 rounded-xl border border-neutral-200/60 shadow-xs space-y-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Status Filters */}
                        <div className="flex flex-wrap gap-1">
                          {(['ALL', 'TO_PURCHASE', 'PURCHASED', 'PACKED', 'READY_FOR_SHIPMENT'] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => { setPurchaseFilter(status); setSelectedTaskIds([]); }}
                              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all border cursor-pointer ${
                                purchaseFilter === status
                                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                  : 'bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 hover:text-black'
                              }`}
                            >
                              {status.replace(/_/g, ' ')}
                            </button>
                          ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative max-w-md w-full">
                          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-400">
                            <Search className="h-4 w-4" />
                          </span>
                          <input
                            type="text"
                            placeholder="Search by SKU, Product Name, Order ID, Supplier ID..."
                            value={purchaseSearch}
                            onChange={(e) => setPurchaseSearch(e.target.value)}
                            className="w-full bg-neutral-50 border border-neutral-250 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-black focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      {/* Bulk Actions Block */}
                      {selectedTaskIds.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500 inline-block animate-pulse shrink-0" />
                            <span className="text-xs font-black text-amber-800">
                              {selectedTaskIds.length} sourcing tasks selected for batch action
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest">Update status:</span>
                            {(['TO_PURCHASE', 'PURCHASED', 'PACKED', 'READY_FOR_SHIPMENT'] as const).map((status) => (
                              <button
                                key={status}
                                onClick={() => handleBulkUpdateTaskStatus(status)}
                                className="bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200 text-[10px] font-bold px-2.5 py-1 rounded-md transition-all cursor-pointer shadow-xs"
                              >
                                {status.replace(/_/g, ' ')}
                              </button>
                            ))}
                            <div className="h-4 w-px bg-amber-200 mx-1 hidden sm:block" />
                            <button
                              onClick={handleBulkDeleteTasks}
                              className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-3 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Delete Selected</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Sourcing Table Container */}
                      <div className="overflow-x-auto rounded-xl border border-neutral-200/60">
                        <table className="w-full text-left text-xs font-sans whitespace-nowrap">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-extrabold uppercase text-[10px] select-none">
                              <th className="py-3 px-4 w-10 text-center">
                                <input
                                  type="checkbox"
                                  className="rounded cursor-pointer"
                                  checked={filteredPurchaseTasks.length > 0 && selectedTaskIds.length === filteredPurchaseTasks.length}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedTaskIds(filteredPurchaseTasks.map(t => t.id));
                                    } else {
                                      setSelectedTaskIds([]);
                                    }
                                  }}
                                />
                              </th>
                              <th className="py-3 px-4">Task Info</th>
                              <th className="py-3 px-3">Order Ref</th>
                              <th className="py-3 px-3">Item details</th>
                              <th className="py-3 px-3 text-center">Qty</th>
                              <th className="py-3 px-3">Pipeline Status</th>
                              <th className="py-3 px-3">Supplier Sourcing Params</th>
                              <th className="py-3 px-3">Notes / Logs</th>
                              <th className="py-3 px-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {filteredPurchaseTasks.length === 0 ? (
                              <tr>
                                <td colSpan={9} className="py-12 text-center text-neutral-400 font-bold">
                                  No purchase/sourcing tasks match the query.
                                </td>
                              </tr>
                            ) : (
                              filteredPurchaseTasks.map((task) => {
                                const isCurrentEdit = editingTaskId === task.id;
                                return (
                                  <tr key={task.id} className={`hover:bg-neutral-50/40 transition-colors ${isCurrentEdit ? 'bg-amber-50/30' : ''}`}>
                                    {/* Checkbox select */}
                                    <td className="py-4 px-4 text-center">
                                      <input
                                        type="checkbox"
                                        className="rounded cursor-pointer"
                                        checked={selectedTaskIds.includes(task.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedTaskIds([...selectedTaskIds, task.id]);
                                          } else {
                                            setSelectedTaskIds(selectedTaskIds.filter(id => id !== task.id));
                                          }
                                        }}
                                      />
                                    </td>

                                    {/* Task ID */}
                                    <td className="py-4 px-4">
                                      <span className="bg-neutral-100 text-neutral-800 font-mono font-bold px-2 py-0.5 rounded text-[10px]">
                                        TSK-{task.id}
                                      </span>
                                      <span className="block text-[8.5px] text-neutral-400 font-semibold mt-1 font-mono">
                                        {task.createdAt ? new Date(task.createdAt).toLocaleString() : 'N/A'}
                                      </span>
                                    </td>

                                    {/* Order Ref */}
                                    <td className="py-4 px-3">
                                      <button
                                        onClick={() => {
                                          setOrderSearch(task.orderId.toString());
                                          setOrderStatusFilter('All');
                                          setActiveTab('orders');
                                        }}
                                        className="bg-neutral-900 text-white font-mono font-black px-2.5 py-1 rounded text-[10.5px] hover:bg-black transition-all flex items-center gap-1 cursor-pointer"
                                      >
                                        <span>#{task.orderId}</span>
                                        <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                                      </button>
                                    </td>

                                    {/* Item name, sku, specs */}
                                    <td className="py-4 px-3 max-w-xs">
                                      <div className="font-extrabold text-neutral-900 truncate" title={task.productName}>
                                        {task.productName}
                                      </div>
                                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                        <span className="text-[9px] text-neutral-400 font-bold font-mono uppercase">SKU: {task.productSku}</span>
                                        {task.selectedSize && (
                                          <span className="bg-neutral-100 text-neutral-700 font-extrabold px-1.5 py-0.2 rounded text-[8.5px]">
                                            Size: {task.selectedSize}
                                          </span>
                                        )}
                                        {task.selectedColor && (
                                          <span className="bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.2 rounded text-[8.5px]">
                                            Color: {task.selectedColor}
                                          </span>
                                        )}
                                      </div>
                                    </td>

                                    {/* Quantity */}
                                    <td className="py-4 px-3 text-center font-bold font-mono text-neutral-800">
                                      {task.quantity}x
                                    </td>

                                    {/* Status Badge */}
                                    <td className="py-4 px-3">
                                      {isCurrentEdit ? (
                                        <select
                                          value={editTaskForm.purchaseStatus}
                                          onChange={(e) => setEditTaskForm({ ...editTaskForm, purchaseStatus: e.target.value })}
                                          className="bg-white border border-neutral-300 rounded-md px-1.5 py-1 text-xs font-semibold focus:outline-none focus:border-black"
                                        >
                                          <option value="TO_PURCHASE">TO PURCHASE</option>
                                          <option value="PURCHASED">PURCHASED</option>
                                          <option value="PACKED">PACKED</option>
                                          <option value="READY_FOR_SHIPMENT">READY FOR SHIPMENT</option>
                                        </select>
                                      ) : (
                                        <span className={`px-2.5 py-1 rounded-full font-black text-[9px] uppercase tracking-wider inline-block ${
                                          task.purchaseStatus === 'TO_PURCHASE' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                          task.purchaseStatus === 'PURCHASED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                          task.purchaseStatus === 'PACKED' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                          'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        }`}>
                                          {task.purchaseStatus?.replace(/_/g, ' ')}
                                        </span>
                                      )}
                                    </td>

                                    {/* Sourcing variables */}
                                    <td className="py-4 px-3">
                                      {isCurrentEdit ? (
                                        <div className="space-y-1.5">
                                          <div className="flex items-center gap-1">
                                            <span className="text-[8.5px] font-bold text-neutral-400 w-12">SUPP ID:</span>
                                            <input
                                              type="text"
                                              value={editTaskForm.supplierId}
                                              onChange={(e) => setEditTaskForm({ ...editTaskForm, supplierId: e.target.value })}
                                              placeholder="e.g. Dubai Outlet #4"
                                              className="bg-white border border-neutral-250 rounded px-2 py-0.5 text-[10.5px] font-semibold w-28 focus:outline-none"
                                            />
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <span className="text-[8.5px] font-bold text-neutral-400 w-12">AED COST:</span>
                                            <input
                                              type="number"
                                              value={editTaskForm.supplierPriceAED}
                                              onChange={(e) => setEditTaskForm({ ...editTaskForm, supplierPriceAED: e.target.value })}
                                              placeholder="AED Price"
                                              className="bg-white border border-neutral-250 rounded px-2 py-0.5 text-[10.5px] font-semibold w-28 focus:outline-none"
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-0.5 text-[11px]">
                                          <div>
                                            <span className="font-extrabold text-neutral-400 text-[8.5px] tracking-wider mr-1">SUPPLIER:</span>
                                            <span className="font-extrabold text-neutral-800">{task.supplierId || 'Not Sourced'}</span>
                                          </div>
                                          <div>
                                            <span className="font-extrabold text-neutral-400 text-[8.5px] tracking-wider mr-1">COST:</span>
                                            <span className="font-black text-emerald-800 font-mono">
                                              {task.supplierPriceAED ? `${task.supplierPriceAED} AED` : '--'}
                                            </span>
                                          </div>
                                        </div>
                                      )}
                                    </td>

                                    {/* Notes / Logs */}
                                    <td className="py-4 px-3 max-w-xs">
                                      {isCurrentEdit ? (
                                        <textarea
                                          value={editTaskForm.notes}
                                          onChange={(e) => setEditTaskForm({ ...editTaskForm, notes: e.target.value })}
                                          placeholder="Enter supplier, size check logs, ship tags..."
                                          rows={2}
                                          className="bg-white border border-neutral-250 rounded-lg p-2 text-[11px] font-medium w-full focus:outline-none focus:border-black max-h-16"
                                        />
                                      ) : (
                                        <p className="text-[11px] font-medium text-neutral-600 line-clamp-2 max-w-[180px] break-all" title={task.notes}>
                                          {task.notes || <span className="text-neutral-300 italic">No notes</span>}
                                        </p>
                                      )}
                                    </td>

                                    {/* Inline Actions */}
                                    <td className="py-4 px-4 text-right">
                                      {isCurrentEdit ? (
                                        <div className="flex items-center justify-end gap-1.5">
                                          <button
                                            onClick={() => handleSaveTaskStatus(task.id)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-2.5 py-1 rounded text-[10px] uppercase transition-all cursor-pointer shadow-xs"
                                          >
                                            Save
                                          </button>
                                          <button
                                            onClick={() => setEditingTaskId(null)}
                                            className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 font-extrabold px-2.5 py-1 rounded text-[10px] uppercase transition-all cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => handleEditTaskClick(task)}
                                          className="bg-neutral-900 hover:bg-black text-white font-extrabold px-3 py-1.5 rounded-lg text-[10px] uppercase transition-all flex items-center gap-1 ml-auto cursor-pointer shadow-xs"
                                        >
                                          <Edit3 className="h-3 w-3" />
                                          <span>Edit Sourcing</span>
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. SETTINGS VIEW */}
                {activeTab === 'settings' && (
                  <div className="bg-white p-5 rounded-xl border border-neutral-200/70 shadow-sm space-y-4 max-w-2xl">
                    <span className="text-[11px] font-black text-black tracking-widest uppercase block border-b border-neutral-100 pb-2 flex items-center gap-2">
                      <Settings className="h-4.5 w-4.5 text-amber-500" />
                      <span>Configure Store Settings</span>
                    </span>

                    <form onSubmit={handleSaveSettings} className="space-y-4 text-xs font-sans">
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 block">
                          <label className="font-bold text-neutral-700 uppercase text-[10px]">Website Store Name *</label>
                          <input 
                            type="text" 
                            required 
                            className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-semibold" 
                            value={settingsForm.websiteName} 
                            onChange={e => setSettingsForm({...settingsForm, websiteName: e.target.value})} 
                          />
                        </div>
                        <div className="space-y-1 block">
                          <label className="font-bold text-neutral-700 uppercase text-[10px]">Contact Email Address *</label>
                          <input 
                            type="email" 
                            required 
                            className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black" 
                            value={settingsForm.contactEmail} 
                            onChange={e => setSettingsForm({...settingsForm, contactEmail: e.target.value})} 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 block">
                          <label className="font-bold text-neutral-700 uppercase text-[10px]">WhatsApp Support Number *</label>
                          <input 
                            type="text" 
                            required 
                            className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-mono font-semibold" 
                            value={settingsForm.whatsappNumber} 
                            onChange={e => setSettingsForm({...settingsForm, whatsappNumber: e.target.value})} 
                          />
                        </div>
                        <div className="space-y-1 block">
                          <label className="font-bold text-neutral-700 uppercase text-[10px]">Currency Symbol *</label>
                          <input 
                            type="text" 
                            required 
                            className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-mono font-extrabold" 
                            value={settingsForm.currency} 
                            onChange={e => setSettingsForm({...settingsForm, currency: e.target.value})} 
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 block">
                          <label className="font-bold text-neutral-700 uppercase text-[10px]">Default Delivery Fee (Addis Ababa) *</label>
                          <input 
                            type="number" 
                            required 
                            className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-mono font-bold" 
                            value={settingsForm.deliveryFee} 
                            onChange={e => setSettingsForm({...settingsForm, deliveryFee: e.target.value})} 
                          />
                        </div>
                        <div className="space-y-1 block">
                          <label className="font-bold text-neutral-700 uppercase text-[10px]">Store Brand Logo Image URL</label>
                          <input 
                            type="url" 
                            placeholder="https://..." 
                            className="w-full bg-white px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-mono text-[10px]" 
                            value={settingsForm.logoUrl} 
                            onChange={e => setSettingsForm({...settingsForm, logoUrl: e.target.value})} 
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-neutral-100 flex justify-end">
                        <button 
                          type="submit" 
                          className="bg-neutral-950 hover:bg-amber-500 text-white hover:text-black font-black uppercase text-[10px] tracking-wider py-3 px-6 rounded-lg transition-all shadow flex items-center gap-2"
                        >
                          <Check className="h-4.5 w-4.5" />
                          <span>Save Settings & Apply Globally</span>
                        </button>
                      </div>

                    </form>
                  </div>
                )}

                {activeTab === 'classifications' && (
                  <ClassificationManager />
                )}
              </>
            )}

          </div>

        </div>

      </div>

      {/* MODAL 1: PREVIEW DETAILED PRODUCT SPEC SHEET */}
      {productPreview && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-55 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-xl border p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto font-sans">
            <button 
              onClick={() => setProductPreview(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black hover:bg-neutral-100 p-1.5 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex flex-col md:flex-row gap-5">
              <img 
                src={productPreview.images?.[0] || 'https://placehold.co/180'} 
                className="w-full md:w-44 h-44 object-cover rounded-xl border border-neutral-150 shadow-sm shrink-0" 
              />
              <div className="space-y-2 flex-1">
                <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-extrabold text-[8.5px] uppercase tracking-widest">
                  {productPreview.category}
                </span>
                <h3 className="font-extrabold text-base text-neutral-900 leading-tight">{productPreview.name}</h3>
                <p className="text-[10px] text-neutral-400 font-mono font-semibold">SKU: {productPreview.sku} | Brand: {productPreview.brand || ' Dubai Brand'}</p>
                
                <div className="flex items-baseline gap-2 pt-1 border-t">
                  <span className="text-sm font-black text-emerald-800 font-mono">{productPreview.priceETB?.toLocaleString()} {settingsForm.currency}</span>
                  {productPreview.originalPriceETB && (
                    <span className="text-[10px] text-neutral-400 line-through font-mono font-medium">{productPreview.originalPriceETB?.toLocaleString()} {settingsForm.currency}</span>
                  )}
                </div>

                <div className="text-[10px] text-neutral-500 space-y-1">
                  <div><strong>Available Sizes:</strong> {Array.isArray(productPreview.sizes) ? productPreview.sizes.join(', ') : productPreview.sizes}</div>
                  <div><strong>Inventory Limit:</strong> {productPreview.quantityAvailable} units (Alert threshold: {productPreview.lowStockAlertThreshold})</div>
                  <div><strong>Homepage feature:</strong> {productPreview.isFeatured ? 'Yes' : 'No'} | <strong>New arrival:</strong> {productPreview.isNewArrival ? 'Yes' : 'No'}</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t">
              <h5 className="font-extrabold text-[10px] uppercase text-neutral-400 mb-1">Product Copy Description</h5>
              <p className="text-[10.5px] text-neutral-600 leading-relaxed bg-neutral-50 p-2.5 rounded-lg font-medium">{productPreview.description || 'No description write-up.'}</p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button 
                onClick={() => setProductPreview(null)}
                className="border px-4 py-2 text-[10px] rounded-lg font-bold hover:bg-neutral-50 text-neutral-600"
              >
                Close Preview
              </button>
              <button 
                onClick={() => { openProductForm(productPreview); setProductPreview(null); }}
                className="bg-neutral-950 hover:bg-amber-500 hover:text-black text-white px-4 py-2 text-[10px] rounded-lg font-black uppercase transition-all"
              >
                Edit Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MANUAL SOURCING TASK CREATION */}
      {isManualTaskModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-55 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-xl border p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 font-sans max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsManualTaskModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black hover:bg-neutral-100 p-1.5 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="text-[11px] font-black text-neutral-400 tracking-widest uppercase block border-b border-neutral-100 pb-2 mb-4 flex items-center gap-1.5">
              <PlusCircle className="h-4.5 w-4.5 text-amber-500" />
              <span>Create Manual Sourcing Task</span>
            </span>

            <form onSubmit={handleCreateManualTask} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 block">
                  <label className="font-bold text-neutral-700 uppercase text-[9.5px]">Order ID *</label>
                  <input 
                    type="number" 
                    required 
                    placeholder="e.g. 1"
                    value={manualTaskForm.orderId}
                    onChange={(e) => setManualTaskForm({ ...manualTaskForm, orderId: e.target.value })}
                    className="w-full bg-neutral-50 px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-semibold" 
                  />
                </div>
                <div className="space-y-1 block">
                  <label className="font-bold text-neutral-700 uppercase text-[9.5px]">Product SKU *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. DXB-AB-001"
                    value={manualTaskForm.productSku}
                    onChange={(e) => setManualTaskForm({ ...manualTaskForm, productSku: e.target.value })}
                    className="w-full bg-neutral-50 px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-semibold" 
                  />
                </div>
              </div>

              <div className="space-y-1 block">
                <label className="font-bold text-neutral-700 uppercase text-[9.5px]">Product Name *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Luxury Silk Abaya"
                  value={manualTaskForm.productName}
                  onChange={(e) => setManualTaskForm({ ...manualTaskForm, productName: e.target.value })}
                  className="w-full bg-neutral-50 px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-semibold" 
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1 block">
                  <label className="font-bold text-neutral-700 uppercase text-[9.5px]">Quantity *</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={manualTaskForm.quantity}
                    onChange={(e) => setManualTaskForm({ ...manualTaskForm, quantity: e.target.value })}
                    className="w-full bg-neutral-50 px-2.5 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-semibold" 
                  />
                </div>
                <div className="space-y-1 block">
                  <label className="font-bold text-neutral-700 uppercase text-[9.5px]">Size</label>
                  <input 
                    type="text" 
                    placeholder="e.g. L"
                    value={manualTaskForm.selectedSize}
                    onChange={(e) => setManualTaskForm({ ...manualTaskForm, selectedSize: e.target.value })}
                    className="w-full bg-neutral-50 px-2.5 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-semibold" 
                  />
                </div>
                <div className="space-y-1 block">
                  <label className="font-bold text-neutral-700 uppercase text-[9.5px]">Color</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Emerald"
                    value={manualTaskForm.selectedColor}
                    onChange={(e) => setManualTaskForm({ ...manualTaskForm, selectedColor: e.target.value })}
                    className="w-full bg-neutral-50 px-2.5 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-semibold" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 block">
                  <label className="font-bold text-neutral-700 uppercase text-[9.5px]">Supplier ID</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Dubai Souk Shop #12"
                    value={manualTaskForm.supplierId}
                    onChange={(e) => setManualTaskForm({ ...manualTaskForm, supplierId: e.target.value })}
                    className="w-full bg-neutral-50 px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-semibold" 
                  />
                </div>
                <div className="space-y-1 block">
                  <label className="font-bold text-neutral-700 uppercase text-[9.5px]">Supplier Price (AED)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 150"
                    value={manualTaskForm.supplierPriceAED}
                    onChange={(e) => setManualTaskForm({ ...manualTaskForm, supplierPriceAED: e.target.value })}
                    className="w-full bg-neutral-50 px-3 py-2 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-semibold" 
                  />
                </div>
              </div>

              <div className="space-y-1 block">
                <label className="font-bold text-neutral-700 uppercase text-[9.5px]">Sourcing Notes</label>
                <textarea 
                  rows={2}
                  placeholder="Any extra sourcing notes, specific instructions, or logistics flags..."
                  value={manualTaskForm.notes}
                  onChange={(e) => setManualTaskForm({ ...manualTaskForm, notes: e.target.value })}
                  className="w-full bg-neutral-50 p-2.5 border border-neutral-250 rounded-lg focus:outline-none focus:border-black font-medium" 
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button"
                  onClick={() => setIsManualTaskModalOpen(false)}
                  className="border px-4 py-2 text-[10px] rounded-lg font-bold hover:bg-neutral-50 text-neutral-600 uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-neutral-900 hover:bg-black text-white px-5 py-2 text-[10px] rounded-lg font-black uppercase transition-all shadow cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
