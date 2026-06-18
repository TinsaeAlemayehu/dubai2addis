/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Heart, 
  ShoppingBag, 
  Menu, 
  X, 
  Phone, 
  Send, 
  Sparkles, 
  ChevronDown, 
  BadgeHelp,
  ArrowRight
} from 'lucide-react';
import { Product } from '../types';
import { User, LogOut, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onSearch: (query: string) => void;
  onSelectCategory: (categoryId: string) => void;
  activeCategory: string;
  user: any;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenDashboard: () => void;
}

export default function Header({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onSearch,
  onSelectCategory,
  activeCategory,
  user,
  onSignIn,
  onSignOut,
  onOpenDashboard
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [activeAnnouncement, setActiveAnnouncement] = useState(0);

  const announcements = [
    '✨ FREE COURIER FROM DUBAI TO ETHIOPIA ON ORDERS ABOVE 36,500 ETB! ✨',
    '📞 24/7 WHATSAPP SUPPORT: +971 55 273 4073 📞',
    '🔥 NEW ARRIVALS DIRECT FROM DUBAI EXCLUSIVE MALLS 🔥'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAnnouncement((prev) => (prev + 1) % announcements.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [announcements.length]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    onSearch(val);
  };

  const mainCategories = [
    { id: 'all', name: 'All Products' },
    { id: 'dresses', name: 'Dresses' },
    { id: 'abayas', name: 'Abayas & Hijabs' },
    { id: 'shoes', name: 'Shoes' },
    { id: 'handbags', name: 'Bags' },
    { id: 'beauty', name: 'Beauty & Oud' },
    { id: 'watches', name: 'Watches' },
    { id: 'jewelry', name: 'Jewelry' },
    { id: 'sports', name: 'Sportswear' },
    { id: 'accessories', name: 'Accessories' }
  ];

  const subNavItems = [
    { id: 'new-in', name: 'New Arrivals' },
    { id: 'dresses', name: 'Dresses' },
    { id: 'shoes', name: 'Shoes' },
    { id: 'handbags', name: 'Handbags' },
    { id: 'beauty', name: 'Beauty' },
    { id: 'sports', name: 'Sportswear' },
    { id: 'abayas', name: 'Hijabs & Abayas' },
    { id: 'jewelry', name: 'Jewelry' },
    { id: 'watches', name: 'Watches' }
  ];

  return (
    <>
      {/* 1. Announcement Bar */}
      <div className="bg-[#111111] text-white text-[10px] md:text-xs tracking-widest text-center py-2.5 px-4 font-sans font-medium transition-all duration-500 select-none border-b border-gold-500/20">
        <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto h-4">
          <Sparkles className="h-3.5 w-3.5 text-gold-500 animate-pulse shrink-0" />
          <span className="truncate">{announcements[activeAnnouncement]}</span>
        </div>
      </div>

      {/* 2. Top Bar (Desktop metadata features) */}
      <div className="hidden lg:block bg-neutral-50 py-1.5 border-b border-neutral-100 text-xs text-neutral-600 font-sans">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-neutral-800">Dubai Sourced:</span> Guarantees 100% original designer finds
            </span>
            <span className="h-3 w-[1px] bg-neutral-200" />
            <span className="text-gold-700 font-medium">✨ Fast shipping to Addis Ababa, Hawassa, & Adama</span>
          </div>
          <div className="flex items-center gap-5">
            <a 
              href="https://wa.me/971552734073" 
              target="_blank" 
              referrerPolicy="no-referrer"
              className="flex items-center gap-1.5 hover:text-gold-600 transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-500" />
              <span>WhatsApp: +971 55 273 4073</span>
            </a>
            <span className="h-3 w-[1px] bg-neutral-200" />
            <a href="#how-it-works" className="hover:text-gold-600 transition-colors">How Sourcing Works</a>
          </div>
        </div>
      </div>

      {/* 3. Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5 md:py-4 flex items-center justify-between gap-4">
          
          {/* Mobile Menu & Logo Container */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-neutral-800 hover:bg-neutral-100 rounded-full transition-colors"
              aria-label="Open navigation menu"
              id="mobile-menu-trigger"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            {/* Branding Logo */}
            <div 
              onClick={() => onSelectCategory('all')} 
              className="cursor-pointer select-none"
            >
              <div className="flex flex-col">
                <span className="font-sans text-xl md:text-2xl font-black tracking-tighter leading-none text-black">
                  DUBAI2ADDIS
                </span>
                <span className="text-[9px] tracking-[0.3em] text-gold-500 uppercase font-black mt-0.5 block">
                  FASHION HOUSE
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Central Category Tabs */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {mainCategories.map((cat) => {
              const isActive = (cat.id === 'all' && activeCategory === '') || activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id === 'all' ? '' : cat.id)}
                  className={`px-3.5 py-2 text-[11px] font-sans uppercase tracking-widest transition-all duration-200 font-bold ${
                    isActive 
                      ? 'text-black border-b-2 border-black rounded-none' 
                      : 'text-gray-400 hover:text-black hover:bg-neutral-50 rounded-none'
                  }`}
                  id={`cat-tab-${cat.id}`}
                >
                  {cat.name.replace('Products', '').replace('Abayas & Hijabs', 'Abayas').replace('Beauty & Oud', 'Beauty')}
                </button>
              );
            })}
          </nav>

          {/* Search Box & Controls */}
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            {/* Live Search Form */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative max-w-sm">
              <input
                type="text"
                placeholder="Search bags, abayas, dresses..."
                value={searchVal}
                onChange={handleSearchChange}
                className="w-56 lg:w-64 pl-9 pr-4 py-2 border border-neutral-200 text-sm focus:outline-none focus:border-gold-500 rounded bg-neutral-50/50 hover:bg-neutral-50 transition-colors font-sans"
              />
              <Search className="absolute left-3 h-4 w-4 text-neutral-400 pointer-events-none" />
              {searchVal && (
                <button 
                  type="button" 
                  onClick={() => { setSearchVal(''); onSearch(''); }}
                  className="absolute right-3 text-neutral-400 hover:text-black"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </form>

            <button 
              onClick={() => {
                // Focus on search or toggle simple mobile search overlay is handled via CSS
                const mobileSearchInput = document.getElementById('mobile-search');
                if (mobileSearchInput) mobileSearchInput.focus();
              }}
              className="md:hidden p-2 text-neutral-700 hover:bg-neutral-100 rounded-full"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-neutral-700 hover:text-gold-600 hover:bg-gold-500/5 rounded-full transition-all"
              id="wishlist-header-btn"
              title="View Wishlist"
            >
              <Heart className={`h-5 w-5 ${wishlistCount > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-[#ffffff] font-sans font-bold text-[9px] h-4 min-w-4 px-1 rounded-full flex items-center justify-center border border-white animate-bounce">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Bag Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 bg-black text-[#ffffff] hover:bg-[#D4AF37] hover:border-[#D4AF37] hover:text-black font-sans tracking-wide text-xs font-semibold rounded-none flex items-center gap-1.5 transition-all shadow-sm active:scale-95 border border-black"
              id="cart-header-btn"
            >
              <ShoppingBag className="h-4.5 w-4.5" />
              <span className="hidden sm:inline">Sourcing Bag</span>
              <span className="bg-[#ffffff] text-black text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </button>

            {/* Auth / Profile Hub */}
            <div className="flex items-center gap-2 border-l border-neutral-200 pl-3 md:pl-4">
              {!user ? (
                <button
                  onClick={onSignIn}
                  className="flex items-center gap-1.5 px-3 py-2 border border-neutral-300 text-[10px] md:text-xs font-bold uppercase tracking-widest text-neutral-800 hover:border-black active:scale-95 transition-all"
                  id="google-signin-btn"
                >
                  <User className="h-4 w-4 text-neutral-400" />
                  <span className="hidden md:inline">Sign In</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Shopify Admin Workspace (Super admin or Staff only) */}
                  {(user.role === 'SUPER_ADMIN' || user.role === 'STAFF') && (
                    <button
                      onClick={onOpenDashboard}
                      className="flex items-center gap-1 px-2.5 py-2 bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-gold-800 hover:bg-[#D4AF37]/25 transition-all active:scale-95"
                      title="Open Shopify Workspace"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="hidden xl:inline text-[9px] font-black uppercase tracking-widest">Workspace</span>
                    </button>
                  )}

                  {/* Profile Handoff Status Label */}
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[10px] font-bold text-neutral-900 truncate max-w-[80px]">
                      {user.name?.split(' ')[0] || 'User'}
                    </span>
                    <span className="text-[8px] font-black text-[#D4AF37] uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={onSignOut}
                    className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-full transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Luxury Subcategory Black Ribbon Navigation (Namshi/SHEIN feel) */}
        <div className="bg-[#1a1a1a] text-neutral-100 py-2.5 overflow-x-auto no-scrollbar border-t border-neutral-800 select-none hidden lg:block">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4 font-sans text-xs uppercase tracking-widest font-semibold shrink-0">
            <div className="flex items-center gap-8 text-[11px]">
              {subNavItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => onSelectCategory(item.id)}
                  className={`hover:text-gold-400 transition-colors whitespace-nowrap cursor-pointer ${
                    activeCategory === item.id ? 'text-gold-400 underline decoration-gold-500 underline-offset-4' : ''
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gold-400 font-serif lowercase italic">
              ✨ direct boutique fashion drops sourcing right now
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Dynamic Search Input Row */}
      <div className="md:hidden block bg-neutral-100 p-2.5 border-b border-neutral-200">
        <div className="relative">
          <input
            id="mobile-search"
            type="text"
            placeholder="Search premium fashion from Dubai..."
            value={searchVal}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-8 py-2 bg-white border border-neutral-200 text-sm rounded focus:outline-none focus:border-gold-500 font-sans"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 pointer-events-none" />
          {searchVal && (
            <button
              onClick={() => { setSearchVal(''); onSearch(''); }}
              className="absolute right-3 top-2.5 text-neutral-400 hover:text-black"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 5. Mobile Fulldrawer Slide-out Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop gray clickout */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
          />

          {/* Drawer content */}
          <div className="relative w-80 max-w-[85vw] bg-white h-full flex flex-col shadow-2xl z-10 transition-transform animate-slide-in">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-sans text-xl font-black tracking-tighter leading-none text-black">
                  DUBAI2ADDIS
                </span>
                <span className="text-[9px] tracking-[0.2em] text-gold-500 uppercase font-bold mt-1 block">
                  FASHION HOUSE
                </span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-neutral-500 hover:text-black rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto py-4 px-2 space-y-4">
              <div className="px-3">
                <span className="text-[10px] font-bold tracking-[0.15em] text-neutral-400 uppercase font-sans">
                  Sourcing Categories
                </span>
              </div>
              
              <div className="space-y-1">
                {mainCategories.map((cat) => {
                  const isActive = (cat.id === 'all' && activeCategory === '') || activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onSelectCategory(cat.id === 'all' ? '' : cat.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 text-sm font-sans rounded font-medium flex items-center justify-between ${
                        isActive 
                          ? 'bg-gold-500/15 text-gold-700 font-semibold' 
                          : 'text-neutral-800 hover:bg-neutral-50'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-neutral-300" />
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-neutral-100 pt-4 px-3 space-y-3 font-sans text-xs text-neutral-600">
                <div className="bg-gold-500/10 border border-gold-500/20 p-3 rounded text-neutral-800 space-y-1">
                  <p className="font-semibold text-gold-700 text-xs text-center">🇪🇹 DIRECT ETHIOPIAN DISPATCH</p>
                  <p className="text-[11px] leading-relaxed text-center">
                    Pay upon arrival. Beautiful pieces sourced from UAE malls & designer studios to your hands.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  <a 
                    href="https://wa.me/971552734073" 
                    target="_blank" 
                    referrerPolicy="no-referrer"
                    className="flex items-center gap-2.5 p-2 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded"
                  >
                    <Phone className="h-4 w-4 text-emerald-600" />
                    <span className="font-medium">WhatsApp: +971 55 273 4073</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-100 bg-neutral-50 text-center font-sans text-[11px] text-neutral-500">
              © 2026 Dubai2Addis Fashion Brand. Sourced Luxury.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
