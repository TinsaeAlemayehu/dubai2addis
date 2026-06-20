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
  Sparkle
} from 'lucide-react';

export default function App() {
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

  // Persistence states
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('dubai2addis_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('dubai2addis_wishlist');
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
      setAuthError('Google Sign-In blocked by your browser environment. Please try the credentials bypass options below!');
    } finally {
      setAuthLoading(false);
    }
  };

  // Email login / register support
  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      if (isRegistering) {
        const regRes = await apiClient.register({ email, password });
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
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Authentication failed. Check credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Quick bypass for development and testing in iframe environments
  const handleQuickBypassLogin = async (roleType: 'SUPER_ADMIN' | 'STAFF' | 'CUSTOMER') => {
    setAuthLoading(true);
    setAuthError('');
    const customEmail = `${roleType.toLowerCase()}@dubai2addis.com`;
    const passwordBypass = 'Dub2AddisSecurePass1!';
    
    try {
      const loginRes = await apiClient.login({ email: customEmail, password: passwordBypass });
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
        console.warn('Firebase Custom Token sign-in failed during bypass, continuing with local session:', authErr);
      }
      
      // Let's force synchronize profile role
      setTimeout(async () => {
        try {
          await apiClient.updateProfile({ role: roleType, name: `${roleType.charAt(0) + roleType.slice(1).toLowerCase()} Simulator` });
          const profile = await apiClient.getProfile();
          setUser(profile);
          localStorage.setItem('local_auth_user', JSON.stringify(profile));
        } catch (e) {}
      }, 500);

      setShowAuthModal(false);
    } catch (err: any) {
      console.error(err);
      setAuthError('Bypass login failed: ' + err.message);
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
    localStorage.setItem('dubai2addis_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('dubai2addis_wishlist', JSON.stringify(wishlist));
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

    const textMessage = `Hello Dubai2Addis Fashion,\n\n` +
      `I would like to order:\n\n` +
      `1. ${product.name} (Product ID: ${product.id}) - ${convertedETB.toLocaleString()} ETB\n\n` +
      `Total: ${convertedETB.toLocaleString()} ETB\n\n` +
      `Please send deposit payment instructions.`;

    const encoded = encodeURIComponent(textMessage);
    window.open(`https://wa.me/971552734073?text=${encoded}`, '_blank', 'referrer');
  };

  // 4. Computation - Filtered Catalog list based on states
  const filteredProducts = useMemo(() => {
    let result = [...productsList];

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
      <main className="flex-1 max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-12" ref={productsSectionRef}>
        
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  isWishlisted={wishlist.some((w) => w.id === prod.id)}
                  onToggleWishlist={() => handleToggleWishlist(prod)}
                  onQuickView={() => setQuickViewProduct(prod)}
                  onOrderWhatsApp={() => handleSingleProductWhatsApp(prod)}
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
      <Footer onSelectCategory={handleSelectCategory} />

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
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-none border border-neutral-100 shadow-2xl p-6 relative font-sans">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black p-1 transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex h-10 w-10 bg-[#D4AF37]/15 text-gold-700 items-center justify-center rounded-none mb-1">
                <Sparkle className="h-5 w-5 fill-[#D4AF37]" />
              </div>
              <h3 className="font-sans font-black text-sm tracking-widest uppercase text-black">
                {isRegistering ? 'CREATE FASHION ID' : 'AUTHENTICATE FASHION ID'}
              </h3>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                Sync wishlists & unlock express Dubia sourcing orders.
              </p>
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-100 text-red-800 p-3 mb-4 rounded-none text-[10px] font-bold uppercase flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-650" />
                <span>{authError}</span>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailAuthSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-1 block">
                <label className="font-black text-neutral-700 uppercase text-[9px] tracking-wider block">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="w-full bg-white p-2.5 pl-9 border border-neutral-250 rounded-none focus:outline-none focus:border-black"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                </div>
              </div>

              <div className="space-y-1 block">
                <label className="font-black text-neutral-700 uppercase text-[9px] tracking-wider block">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-white p-2.5 pl-9 border border-neutral-250 rounded-none focus:outline-none focus:border-black"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <Key className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                </div>
              </div>

              {/* Secure Administrative Credentials Info Block */}
              <div className="p-2.5 bg-neutral-50 border border-neutral-200 text-neutral-600 text-[9px] uppercase tracking-wider font-extrabold space-y-1 rounded-none leading-relaxed">
                <span className="text-[#D4AF37] block">✦ ADMIN PROFILE ACCESS KEYS:</span>
                <div>Emails: <code className="text-black bg-neutral-100 px-1 rounded font-mono font-bold">goodtinsae@gmail.com</code> / <code className="text-black bg-neutral-100 px-1 rounded font-mono font-bold">itistinsae@gmail.com</code></div>
                <div>Password: <code className="text-black bg-neutral-100 px-1 rounded font-mono font-bold">atinzzz</code></div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-black hover:bg-[#D4AF37] hover:text-black font-sans font-extrabold uppercase text-[10px] tracking-wider text-white py-3 transition-colors rounded-none"
              >
                {authLoading ? 'Verifying...' : (isRegistering ? 'Register Fashion Account' : 'Login Securely')}
              </button>
            </form>

            <div className="text-center mt-3 text-[10px]">
              <button
                onClick={() => setIsRegistering(!isRegistering)}
                className="font-bold underline text-neutral-500 hover:text-black uppercase tracking-wider"
              >
                {isRegistering ? 'Already have an ID? Login' : "Don't have an account? Sign Up"}
              </button>
            </div>

            {/* Google Popup login (Works on new tab, but may get popups blocked inside iframe) */}
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-neutral-200"></div>
              <span className="flex-shrink mx-4 text-neutral-400 text-[8px] uppercase tracking-widest font-black">OR LOG IN WITH GOOGLE</span>
              <div className="flex-grow border-t border-neutral-200"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full border border-neutral-300 hover:bg-neutral-50 p-2.5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded-none"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.64l3.15-3.15C17.41 1.7 14.9 1 12 1 7.24 1 3.2 3.73 1.3 7.74l3.78 2.93c.89-2.67 3.39-4.63 6.92-4.63z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.47-1.11 2.71-2.36 3.55l3.67 2.84c2.15-1.98 3.38-4.89 3.38-8.49z" />
                <path fill="#FBBC05" d="M5.08 14.67c-.23-.69-.36-1.43-.36-2.17s.13-1.48.36-2.17L1.3 7.4A10.975 10.975 0 000 12.5c0 1.94.51 3.76 1.4 5.37l3.68-2.93-1.3-.3z" />
                <path fill="#34A853" d="M12 23c3.1 0 5.71-1.03 7.61-2.79l-3.67-2.84c-1.02.68-2.33 1.09-3.94 1.09-3.53 0-6.03-1.96-6.92-4.63L1.3 16.76C3.2 20.77 7.24 23 12 23z" />
              </svg>
              <span>Popup Google Auth</span>
            </button>

            {/* HIGH-QUALITY ROLES WORKSPACE SIMULATOR (Solves iframe restrictions flawlessly!) */}
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-neutral-200"></div>
              <span className="flex-shrink mx-4 text-amber-500 text-[8px] uppercase tracking-widest font-black">IFRAME SIMULATION & INTERACTIVES</span>
              <div className="flex-grow border-t border-neutral-200"></div>
            </div>

            <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider text-center leading-normal mb-3">
              Standard popups are often blocked inside sandboxed preview iframes. Use these high-fidelity quick role selector simulator logins to immediately test role-based authorizations!
            </p>

            <div className="grid grid-cols-3 gap-1.5 font-sans">
              <button
                type="button"
                onClick={() => handleQuickBypassLogin('SUPER_ADMIN')}
                className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[9px] uppercase py-2 tracking-wide block transition-colors"
                title="Log in as Super Admin"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickBypassLogin('STAFF')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[9px] uppercase py-2 tracking-wide block transition-colors"
                title="Log in as Staff operator"
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => handleQuickBypassLogin('CUSTOMER')}
                className="bg-neutral-800 hover:bg-black text-white font-extrabold text-[9px] uppercase py-2 tracking-wide block transition-colors"
                title="Log in as Standard Customer"
              >
                Customer
              </button>
            </div>

          </div>
        </div>
      )}

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
          href="https://wa.me/971552734073?text=Hello%20Dubai2Addis!%20I%20have%20questions%20about%20custom%20importing%20fashion%20items%20from%20Dubai."
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
