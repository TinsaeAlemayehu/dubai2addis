/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import CategoryCarousel from './components/CategoryCarousel';
import ProductCard from './components/ProductCard';
import ProductQuickView from './components/ProductQuickView';
import CartDrawer from './components/CartDrawer';
import TrustAndProcess from './components/TrustAndProcess';
import SocialAndReviews from './components/SocialAndReviews';
import Footer from './components/Footer';

import { Product, CartItem } from './types';
import { EXCHANGE_RATE_ETB } from './data/products';
import { auth, googleAuthProvider as googleProvider } from './lib/firebase.ts';
import { signInWithPopup, signInWithCustomToken, signOut } from 'firebase/auth';
import { apiClient } from './lib/api.ts';
import AdminDashboard from './components/AdminDashboard.tsx';

import { 
  SlidersHorizontal, 
  Sparkles, 
  Check, 
  X, 
  MessageCircle, 
  ChevronRight, 
  Tag, 
  Award,
  Zap,
  ArrowUp,
  RotateCcw,
  LogIn,
  Key,
  Mail,
  ShieldAlert,
  Sparkle,
  Eye,
  EyeOff,
  Lock,
  Phone,
  User
} from 'lucide-react';

export default function App() {
  // Global store configuration settings
  const [storeSettings, setStoreSettings] = useState({
    siteName: 'AddisDubai',
    websiteName: 'AddisDubai', // Backward compatibility fallback
    logoUrl: '',
    whatsappNumber: '+971552734073',
    currency: 'ETB',
    deliveryFee: '200',
    supportEmail: 'info@addisdubai.com',
    contactEmail: 'info@addisdubai.com' // Backward compatibility fallback
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await apiClient.getSettings();
        if (data) {
          setStoreSettings({
            siteName: data.siteName || 'AddisDubai',
            websiteName: data.siteName || 'AddisDubai',
            logoUrl: data.logoUrl || '',
            whatsappNumber: data.whatsappNumber || '+971552734073',
            currency: data.currency || 'ETB',
            deliveryFee: data.deliveryFee || '200',
            supportEmail: data.supportEmail || 'info@addisdubai.com',
            contactEmail: data.supportEmail || 'info@addisdubai.com'
          });
          // Update page title / meta elements
          document.title = (data.siteName || 'AddisDubai') + " - Premium Fashion Sourcing";
        }
      } catch (err) {
        console.error('Failed to load settings from DB:', err);
      }
    }
    loadSettings();
  }, []);

  // Authentication & Panel toggles
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('local_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Email form states for auth simulator
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Persistence states
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('addisdubai_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('addisdubai_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Structural filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');

  // UI Open overlays
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isBagOpen, setIsBagOpen] = useState(false);
  const [scrollUpBtn, setScrollUpBtn] = useState(false);

  // Auto-scroll anchor point for filters
  const productsSectionRef = useRef<HTMLDivElement>(null);

  // Fetch Master Catalog Products from Cloud DB
  const loadMasterCatalog = async () => {
    try {
      const dbProds = await apiClient.getProducts();
      setProductsList(dbProds);
    } catch (error) {
      console.error('Failed to load products from centralized Cloud SQL:', error);
    } finally {
      setLoading(false);
    }
  };

  // Signout support logic
  const handleSignOut = async () => {
    try {
      await signOut(auth).catch(() => {});
      localStorage.removeItem('local_auth_token');
      localStorage.removeItem('local_auth_user');
      setUser(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Google signin helper
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
      setShowAuthModal(false);
    } catch (err: any) {
      console.error(err);
      setAuthError('Google Sign-In blocked by your browser environment or third-party popup restrictions.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Email login / register support
  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    if (isRegistering) {
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match.');
        setAuthLoading(false);
        return;
      }
      if (!agreeTerms) {
        setAuthError('You must agree to the Terms & Conditions and Privacy Policy.');
        setAuthLoading(false);
        return;
      }
    }

    try {
      if (isRegistering) {
        // Build the full phone string with +251 flag prefix
        const fullPhone = phoneNumber ? `+251${phoneNumber.replace(/^\+251/, '').trim()}` : '';
        const regRes = await apiClient.register({ 
          email, 
          password, 
          name: fullName, 
          phone: fullPhone 
        });
        if (regRes.localToken) {
          localStorage.setItem('local_auth_token', regRes.localToken);
        }
        if (regRes.user) {
          localStorage.setItem('local_auth_user', JSON.stringify(regRes.user));
          setUser(regRes.user);
        }
        try {
          await signInWithCustomToken(auth, regRes.customToken);
        } catch (authErr) {
          console.warn('Firebase Custom Token sign-in failed during registry, continuing with local session:', authErr);
        }
      } else {
        const loginRes = await apiClient.login({ email, password });
        if (loginRes.localToken) {
          localStorage.setItem('local_auth_token', loginRes.localToken);
        }
        if (loginRes.user) {
          localStorage.setItem('local_auth_user', JSON.stringify(loginRes.user));
          setUser(loginRes.user);
        }
        try {
          await signInWithCustomToken(auth, loginRes.customToken);
        } catch (authErr) {
          console.warn('Firebase Custom Token sign-in failed, continuing with local session:', authErr);
        }
      }
      setShowAuthModal(false);
      setEmail('');
      setPassword('');
      setFullName('');
      setPhoneNumber('');
      setConfirmPassword('');
      setAgreeTerms(false);
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Authentication failed. Check credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth synchronization effect
  useEffect(() => {
    loadMasterCatalog();

    const syncProfile = async () => {
      try {
        const profile = await apiClient.getProfile();
        setUser(profile);
        localStorage.setItem('local_auth_user', JSON.stringify(profile));
        if (profile.wishlist && Array.isArray(profile.wishlist)) {
          const resolvedWishList = productsList.filter(p => profile.wishlist.includes(p.id.toString()));
          if (resolvedWishList.length > 0) {
            setWishlist(resolvedWishList);
          }
        }
      } catch (error) {
        console.error('Failed to sync profile from DB:', error);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        await syncProfile();
      } else {
        const hasLocalToken = localStorage.getItem('local_auth_token');
        if (hasLocalToken) {
          await syncProfile();
        } else {
          setUser(null);
          localStorage.removeItem('local_auth_user');
        }
      }
    });

    if (localStorage.getItem('local_auth_token')) {
      syncProfile();
    }

    return () => unsubscribe();
  }, [productsList.length]);

  // Sync state to local standard cache
  useEffect(() => {
    localStorage.setItem('addisdubai_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('addisdubai_wishlist', JSON.stringify(wishlist));
    // Push update to DB if signed in
    if (user) {
      apiClient.updateWishlist(wishlist.map(w => w.id.toString())).catch(() => {});
    }
  }, [wishlist, user]);

  // Monitor scroll for returning to top
  useEffect(() => {
    const checkScroll = () => {
      setScrollUpBtn(window.scrollY > 500);
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  // Sync category picks and scroll to grid anchor automatically
  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory('All');
    setSelectedBrand('All');
    setSearchQuery(''); // Clear search on explicit category click to avoid empty matrix errors

    // Slow scroll to products anchor point
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // State handlers for cart/wishlist
  const handleAddToCart = (product: Product, size: string, color: { name: string; hex: string }, quantity: number) => {
    const itemCompositionId = `${product.id}-${size}-${color.name}`;
    
    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.id === itemCompositionId);
      if (existing) {
        return prevItems.map((item) => 
          item.id === itemCompositionId 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      } else {
        return [...prevItems, { id: itemCompositionId, product, selectedSize: size, selectedColor: color, quantity }];
      }
    });
    
    // Automatically reveal Sourcing Bag drawer to confirm success! Extremely responsive
    setIsBagOpen(true);
  };

  const handleRemoveFromCart = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const handleUpdateCartQty = (cartItemId: string, qty: number) => {
    setCartItems((prev) => 
      prev.map((item) => 
        item.id === cartItemId 
          ? { ...item, quantity: Math.max(1, qty) } 
          : item
      )
    );
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const match = prev.find((item) => item.id === product.id);
      if (match) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };

  const handleMoveToCart = (product: Product) => {
    // Pick default size and color
    const size = product.sizes[0] || 'One Size';
    const color = product.colors[0] || { name: 'Default', hex: '#ccc' };
    
    handleAddToCart(product, size, color, 1);
    
    // Remote from wishlist once transferred
    setWishlist((prev) => prev.filter((item) => item.id !== product.id));
  };

  // Launch single product direct WhatsApp ordering
  const handleSingleProductWhatsApp = (product: Product) => {
    const convertedETB = (product as any).priceETB !== undefined
      ? (product as any).priceETB
      : Math.round(product.priceAED * EXCHANGE_RATE_ETB);

    const textMessage = `Hello ${storeSettings.websiteName} Fashion,\n\n` +
      `I would like to order:\n\n` +
      `1. ${product.name} (Product ID: ${product.id}) - ${convertedETB.toLocaleString()} ${storeSettings.currency}\n\n` +
      `Total: ${convertedETB.toLocaleString()} ${storeSettings.currency}\n\n` +
      `Please send deposit payment instructions.`;

    const encoded = encodeURIComponent(textMessage);
    const cleanedPhone = storeSettings.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanedPhone}?text=${encoded}`, '_blank', 'referrer');
  };

  // 4. Computation - Filtered Catalog list based on states
  const filteredProducts = useMemo(() => {
    // Only display Published products to the end-users / customers
    let result = productsList.filter(p => !p.status || p.status === 'Published');

    // Category filter
    if (selectedCategory) {
      if (selectedCategory === 'new-in') {
        result = result.filter((p) => p.isNewArrival);
      } else {
        result = result.filter((p) => p.category === selectedCategory);
      }
    }

    // Subcategory filter
    if (selectedSubcategory !== 'All') {
      result = result.filter((p) => p.subcategory === selectedSubcategory);
    }

    // Brand filter
    if (selectedBrand !== 'All') {
      result = result.filter((p) => p.brand === selectedBrand);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => 
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sorting algorithm
    if (sortBy === 'price-asc') {
      result.sort((a, b) => {
        const pa = (a as any).priceETB !== undefined ? (a as any).priceETB : a.priceAED * EXCHANGE_RATE_ETB;
        const pb = (b as any).priceETB !== undefined ? (b as any).priceETB : b.priceAED * EXCHANGE_RATE_ETB;
        return pa - pb;
      });
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => {
        const pa = (a as any).priceETB !== undefined ? (a as any).priceETB : a.priceAED * EXCHANGE_RATE_ETB;
        const pb = (b as any).priceETB !== undefined ? (b as any).priceETB : b.priceAED * EXCHANGE_RATE_ETB;
        return pb - pa;
      });
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 5) - (a.rating || 5));
    } else if (sortBy === 'best-seller') {
      result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }

    return result;
  }, [productsList, selectedCategory, selectedSubcategory, selectedBrand, searchQuery, sortBy]);

  // Derived subcategories available for current parent category
  const dynamicSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    
    const uniques = new Set<string>();
    productsList.filter((p) => p.category === selectedCategory).forEach((p) => {
      if (p.subcategory) uniques.add(p.subcategory);
    });
    return Array.from(uniques);
  }, [productsList, selectedCategory]);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between relatives font-sans select-none antialiased">
      
      {/* Signout support logic */}
      {/* Dynamic Header Component */}
      <Header
        storeSettings={storeSettings}
        cartCount={cartItems.reduce((acc, x) => acc + x.quantity, 0)}
        wishlistCount={wishlist.length}
        onOpenCart={() => { setIsBagOpen(true); }}
        onOpenWishlist={() => { setIsBagOpen(true); }} // Wishlist lives in separate tab in CartDrawer
        onSearch={(q) => { setSearchQuery(q); }}
        onSelectCategory={handleSelectCategory}
        activeCategory={selectedCategory}
        user={user}
        onSignIn={() => setShowAuthModal(true)}
        onSignOut={handleSignOut}
        onOpenDashboard={() => setShowAdminDashboard(true)}
      />

      {/* Main Promotional Banner Carousel */}
      <HeroSlider onExploreClick={() => handleSelectCategory('')} />

      {/* Premium Circular Horizontal swipeable Department Carousel */}
      <CategoryCarousel 
        onSelectCategory={handleSelectCategory} 
        activeCategory={selectedCategory} 
      />

      {/* Grid containing filtering, deals & products */}
      <main className="flex-1 max-w-[1400px] mx-auto px-4 md:px-6 py-8 space-y-12" ref={productsSectionRef} id="marketplace-catalog">
        
        {/* Marketplace banner section (Colloquial Namshi / Centrepoint vibe) */}
        {!searchQuery && !selectedCategory && (
          <section className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
            {/* Promo Left: Abayas and Modest items */}
            <div 
              onClick={() => handleSelectCategory('abayas')}
              className="bg-neutral-900 text-white rounded-none p-6 md:p-8 flex flex-col justify-between items-start cursor-pointer group relative overflow-hidden h-64 border border-neutral-800"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:scale-101 transition-transform duration-500 rounded-none" 
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80")' }}
              />
              <div className="absolute inset-0 bg-linear-to-r from-neutral-950 via-neutral-950/70 to-transparent rounded-none" />
              
              <div className="relative z-1 space-y-1.5 max-w-xs md:max-w-sm">
                <span className="text-white font-sans tracking-[0.25em] text-[8px] font-black uppercase bg-[#D4AF37] px-2 py-0.5 rounded-none">
                  Logistics Weekly Air-runs
                </span>
                <h3 className="font-sans text-xl md:text-2xl font-black uppercase tracking-tight leading-none italic">Elite Modest Wear & Premium Abayas</h3>
                <p className="text-[10px] text-neutral-300 font-light uppercase tracking-wider">Fine georgettes and luxury gold thread lace.</p>
              </div>

              <span className="relative z-1 font-sans text-[10px] tracking-widest uppercase font-black text-[#D4AF37] flex items-center gap-1 hover:text-white transition-colors">
                <span>Browse Modest drops</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            {/* Promo Right: High-heels and handbags */}
            <div 
              onClick={() => handleSelectCategory('handbags')}
              className="bg-neutral-50 rounded-none p-6 md:p-8 flex flex-col justify-between items-start cursor-pointer group relative overflow-hidden h-64 border border-gray-100"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:scale-101 transition-transform duration-500 rounded-none" 
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80")' }}
              />
              <div className="absolute inset-0 bg-linear-to-r from-neutral-50 via-neutral-50/70 to-transparent rounded-none" />

              <div className="relative z-1 space-y-1.5 max-w-xs md:max-w-sm text-neutral-900">
                <span className="text-white font-sans tracking-[0.25em] text-[8px] font-black uppercase bg-black px-2 py-0.5 rounded-none">
                  OUTLET RATES
                </span>
                <h3 className="font-sans text-xl md:text-2xl font-black uppercase tracking-tight leading-none italic">Sovereign Accessories & Bags</h3>
                <p className="text-[10px] text-neutral-500 font-light uppercase tracking-wider">Quilted leather, gemstone links, sourced directly.</p>
              </div>

              <span className="relative z-1 font-sans text-[10px] tracking-widest uppercase font-black text-black flex items-center gap-1 hover:text-[#D4AF37] transition-colors">
                <span>Browse luxury bags</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </section>
        )}

        {/* 2. FILTERING CONTROL HEADBAR */}
        <section className="bg-white border border-gray-100 rounded-none p-4 md:p-5 space-y-4 shadow-xs">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Filter headers state feedback */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[#D4AF37] shrink-0" />
              <div className="space-y-0.5">
                <h2 className="font-sans font-black text-xs text-black tracking-[0.2em] uppercase">
                  FILTERING CATALOG
                </h2>
                <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">
                  {filteredProducts.length} pieces found
                  {selectedCategory && ` in ${selectedCategory}`}
                </p>
              </div>
            </div>

            {/* Practical Quick Filter choices */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Reset state helper (Only if filters are active) */}
              {(selectedCategory || selectedBrand !== 'All' || selectedSubcategory !== 'All' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedBrand('All');
                    setSelectedSubcategory('All');
                    setSearchQuery('');
                  }}
                  className="bg-neutral-100 hover:bg-black hover:text-white text-neutral-800 text-[10px] py-1.5 px-3 rounded-none flex items-center gap-1 font-sans font-bold tracking-widest uppercase transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Filters</span>
                </button>
              )}

              {/* Sorting algorithm selector dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-neutral-50 border border-gray-200 hover:border-black text-neutral-800 text-[10px] tracking-wider uppercase px-3 py-2 rounded-none focus:outline-none focus:ring-1 focus:ring-black font-sans cursor-pointer font-bold"
              >
                <option value="popular">Most Popular</option>
                <option value="best-seller">Best Sellers</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
          </div>

          {/* Sourcing Brands filter bar (SHEIN, Brands For Less, Dubai Outlet deals etc) */}
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.2em] font-sans block">
              Sourcing Outlets & Platforms:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {['All', 'Brands For Less', 'SHEIN', 'Temu Finds', 'Dubai Outlet Deals', 'New Collection'].map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1.5 rounded-none text-[10px] uppercase font-bold tracking-widest font-sans transition-all cursor-pointer ${
                    selectedBrand === brand
                      ? 'bg-black text-white font-black'
                      : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Selected dynamic subcategories selectors (If viewing dresses, abayas, shoes etc) */}
          {dynamicSubcategories.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <span className="text-[9px] font-black text-[#D4AF37] uppercase tracking-[0.2em] font-sans block">
                Narrow down style:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button
                  onClick={() => setSelectedSubcategory('All')}
                  className={`px-3 py-1.5 rounded-none text-[10px] uppercase font-bold tracking-widest font-sans transition-all shrink-0 cursor-pointer ${
                    selectedSubcategory === 'All'
                      ? 'bg-black text-white'
                      : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                  }`}
                >
                  All Styles
                </button>
                {dynamicSubcategories.map((sub) => (
                  <button
                    key={sub}
                    onClick={() => setSelectedSubcategory(sub)}
                    className={`px-3 py-1.5 rounded-none text-[10px] uppercase font-bold tracking-widest font-sans transition-all shrink-0 cursor-pointer ${
                      selectedSubcategory === sub
                        ? 'bg-[#D4AF37] text-white font-black'
                        : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100'
                    }`}
                  >
                    {sub.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 3. DYNAMIC PRODUCTS GRID */}
        <section className="space-y-6">
          
          {searchQuery && (
            <div className="bg-neutral-50 border border-neutral-150 p-3 rounded font-sans text-xs text-neutral-600 select-none">
              🔍 Showing items matching <span className="font-bold text-black font-semibold">"{searchQuery}"</span>. Click reset below to load entire catalog.
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="h-72 border border-neutral-100 rounded-lg flex flex-col items-center justify-center text-center p-6 space-y-4">
              <span className="bg-neutral-50 h-12 w-12 rounded-full flex items-center justify-center text-neutral-400">
                🔍
              </span>
              <div className="space-y-1 font-sans">
                <p className="font-serif text-base font-bold text-neutral-900">No matching pieces found</p>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-normal">
                  Try clearing select filters, searching different keywords (e.g. oud, heels, dresses), or join our Telegram for custom requests.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setSelectedBrand('All');
                  setSelectedSubcategory('All');
                  setSearchQuery('');
                }}
                className="bg-black hover:bg-neutral-800 text-[#ffffff] px-5 py-2 rounded text-xs font-sans tracking-wider font-bold uppercase transition-colors shrink-0"
              >
                Load All Products Grid
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  isWishlisted={wishlist.some((w) => w.id === prod.id)}
                  onToggleWishlist={() => handleToggleWishlist(prod)}
                  onQuickView={() => setQuickViewProduct(prod)}
                  onOrderWhatsApp={() => handleSingleProductWhatsApp(prod)}
                  onAddToCart={() => {
                    const size = prod.sizes?.[0] || 'One Size';
                    const color = prod.colors?.[0] || { name: 'Default', hex: '#ccc' };
                    handleAddToCart(prod, size, color, 1);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Trust Badges and "How it works" stepper */}
      <TrustAndProcess />

      {/* Verified Reviews, social counters and looking gallery */}
      <SocialAndReviews />

      {/* Dynamic footer credentials block */}
      <Footer storeSettings={storeSettings} onSelectCategory={handleSelectCategory} />

      {/* --- FLOATING DIALS & DIALOG OVERLAYS --- */}

      {/* 1. Dynamic Product Quickview Dialogue Modal */}
      {quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={wishlist.some((w) => w.id === quickViewProduct.id)}
        />
      )}

      {/* 2. Slide out Shopping Cart Drawer Overlay */}
      <CartDrawer
        storeSettings={storeSettings}
        isOpen={isBagOpen}
        onClose={() => setIsBagOpen(false)}
        cartItems={cartItems}
        wishlistItems={wishlist}
        onRemoveFromCart={handleRemoveFromCart}
        onUpdateCartQty={handleUpdateCartQty}
        onRemoveFromWishlist={handleToggleWishlist}
        onMoveToCart={handleMoveToCart}
        user={user}
      />

      {/* 3. Shopify-style Admin Management Workspace Dashboard */}
      {showAdminDashboard && (
        <AdminDashboard
          user={user}
          onClose={() => setShowAdminDashboard(false)}
          onRefreshProducts={loadMasterCatalog}
        />
      )}

      {/* 4. Elegant Authentication Dialogue Popover with Quick bypass simulation buttons */}
      {showAuthModal && (() => {
        const getPasswordStrength = (pass: string) => {
          if (!pass) return { level: 0, label: '', color: 'bg-neutral-200' };
          if (pass.length < 6) return { level: 1, label: 'Weak', color: 'bg-red-500' };
          const hasNumber = /\d/.test(pass);
          const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
          const hasMixed = /[a-z]/.test(pass) && /[A-Z]/.test(pass);
          if (pass.length >= 8 && hasNumber && hasSpecial && hasMixed) {
            return { level: 3, label: 'Strong', color: 'bg-emerald-500' };
          }
          return { level: 2, label: 'Medium', color: 'bg-amber-500' };
        };

        const strength = getPasswordStrength(password);

        return (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 overflow-y-auto flex items-center justify-center p-4">
            <div className="bg-white w-[90%] md:w-full max-w-[480px] rounded-[12px] shadow-xl p-6 md:p-10 relative font-sans animate-in fade-in zoom-in-95 duration-250">
              {/* Close Button */}
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-black p-1 transition-all"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header Container */}
              <div className="flex flex-col items-center text-center mb-6">
                {/* Logo */}
                <span className="font-sans text-xl md:text-2xl font-black tracking-tighter leading-none text-black uppercase">
                  AddisDubai
                </span>
                <span className="text-[9px] tracking-[0.3em] text-[#C9A84C] uppercase font-black mt-1 block">
                  Fashion House
                </span>

                {/* Title and Subtitle */}
                <h3 className="text-xl md:text-2xl font-semibold text-neutral-900 mt-5 tracking-tight">
                  {isRegistering ? 'Create your account' : 'Welcome back'}
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {isRegistering ? 'Join AddisDubai Fashion House' : 'Sign in to your account'}
                </p>
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-150 text-red-800 p-3.5 mb-5 rounded-[6px] text-xs flex items-start gap-2.5">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-650 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleEmailAuthSubmit} className="space-y-4">
                {isRegistering && (
                  /* Full Name field */
                  <div className="space-y-1 block">
                    <label className="text-xs font-semibold text-neutral-700 block">Full name</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Enter your name"
                        className="w-full bg-white h-[52px] px-4 border border-[#ddd] rounded-[6px] text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Email field */}
                <div className="space-y-1 block">
                  <label className="text-xs font-semibold text-neutral-700 block">Email address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      className="w-full bg-white h-[52px] px-4 border border-[#ddd] rounded-[6px] text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {isRegistering && (
                  /* Phone Number field with +251 Ethiopia flag prefix */
                  <div className="space-y-1 block">
                    <label className="text-xs font-semibold text-neutral-700 block">Phone number</label>
                    <div className="flex rounded-[6px] border border-[#ddd] overflow-hidden focus-within:border-[#C9A84C] focus-within:ring-1 focus-within:ring-[#C9A84C] transition-all">
                      <span className="bg-neutral-50 border-r border-[#ddd] px-3 flex items-center text-sm font-medium text-neutral-500 select-none">
                        🇪🇹 +251
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="912345678"
                        className="w-full bg-white h-[50px] px-3 text-sm focus:outline-none transition-all"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Password field */}
                <div className="space-y-1 block">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-neutral-700 block">Password</label>
                    {!isRegistering && (
                      <a href="#" className="text-xs font-medium text-[#C9A84C] hover:underline">
                        Forgot password?
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      className="w-full bg-white h-[52px] pl-4 pr-11 border border-[#ddd] rounded-[6px] text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {isRegistering && (
                  <>
                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-neutral-500">Password strength:</span>
                          <span className={
                            strength.level === 1 ? 'text-red-500 font-semibold' :
                            strength.level === 2 ? 'text-amber-500 font-semibold' :
                            'text-emerald-500 font-semibold'
                          }>
                            {strength.label}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${strength.color}`} 
                            style={{ width: strength.level === 1 ? '33.3%' : strength.level === 2 ? '66.6%' : '100%' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Confirm Password field */}
                    <div className="space-y-1 block">
                      <label className="text-xs font-semibold text-neutral-700 block">Confirm password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          placeholder="Confirm your password"
                          className="w-full bg-white h-[52px] pl-4 pr-11 border border-[#ddd] rounded-[6px] text-sm focus:outline-none focus:border-[#C9A84C] focus:ring-1 focus:ring-[#C9A84C] transition-all"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="pt-1">
                      <label className="flex items-start gap-2.5 text-xs text-neutral-600 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="mt-0.5 rounded border-neutral-350 text-[#C9A84C] focus:ring-[#C9A84C] h-4 w-4"
                        />
                        <span>
                          I agree to the <a href="#" className="text-[#C9A84C] hover:underline font-medium">Terms & Conditions</a> and <a href="#" className="text-[#C9A84C] hover:underline font-medium">Privacy Policy</a>
                        </span>
                      </label>
                    </div>
                  </>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#111] hover:bg-black font-sans font-bold text-sm tracking-wide text-white h-[52px] rounded-[6px] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#111] uppercase"
                >
                  {authLoading ? 'Please wait...' : (isRegistering ? 'Create account' : 'Sign in')}
                </button>
              </form>

              {/* Divider */}
              <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-neutral-200"></div>
                <span className="flex-shrink mx-4 text-neutral-400 text-xs font-medium">
                  or continue with
                </span>
                <div className="flex-grow border-t border-neutral-200"></div>
              </div>

              {/* Google login button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full border border-neutral-300 bg-white hover:bg-neutral-50 h-[52px] rounded-[6px] text-sm font-medium flex items-center justify-center gap-2.5 transition-all text-neutral-700"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.41 1.7 14.9 1 12 1 7.24 1 3.2 3.73 1.3 7.74l3.78 2.93c.89-2.67 3.39-4.63 6.92-4.63z" />
                  <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.67 2.84c2.15-1.98 3.38-4.89 3.38-8.49z" />
                  <path fill="#FBBC05" d="M5.08 14.67c-.23-.69-.36-1.43-.36-2.17s.13-1.48.36-2.17L1.3 7.4A10.975 10.975 0 000 12.5c0 1.94.51 3.76 1.4 5.37l3.68-2.93-1.3-.3z" />
                  <path fill="#34A853" d="M12 23c3.1 0 5.71-1.03 7.61-2.79l-3.67-2.84c-1.02.68-2.33 1.09-3.94 1.09-3.53 0-6.03-1.96-6.92-4.63L1.3 16.76C3.2 20.77 7.24 23 12 23z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Bottom Switch Link */}
              <div className="text-center mt-6">
                <button
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setAuthError('');
                  }}
                  className="text-sm font-semibold text-[#C9A84C] hover:underline"
                >
                  {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 3. Global Floating WhatsApp Green Pulse Button */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
        {scrollUpBtn && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-3 bg-black text-white hover:bg-gold-500 hover:text-black rounded-full shadow-lg border border-neutral-800 hover:border-transparent transition-all hover:scale-105 active:scale-95"
            title="Scroll To Top"
            id="scroll-to-top-btn"
          >
            <ArrowUp className="h-4.5 w-4.5 font-bold" />
          </button>
        )}
        
        <a
          href={`https://wa.me/${storeSettings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${storeSettings.siteName}! I have questions about custom importing fashion items.`)}`}
          target="_blank"
          referrerPolicy="no-referrer"
          className="relative h-14 w-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center text-[#ffffff] shadow-2xl transition-transform hover:scale-115 active:scale-90 group border border-emerald-400"
          title="Direct Support on Chat"
          id="floating-whatsapp-btn"
        >
          {/* Pulsing visual halo elements */}
          <span className="absolute inset-0 bg-emerald-500/25 h-full w-full rounded-full animate-ping pointer-events-none" />
          <MessageCircle className="h-7 w-7 fill-[#ffffff]/10" />
          
          {/* Quick badge label tags appearing on hover */}
          <span className="absolute right-16 bg-black text-[#ffffff] text-[10px] font-sans font-extrabold tracking-widest px-3 py-1.5 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase mr-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
            <span>Chat support online</span>
          </span>
        </a>
      </div>

    </div>
  );
}
