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
    '📞 CALL SUPPORT (ETHIOPIA): +251 909 319 951 📞',
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
      <div className="bg-[#111111] text-white text-[10px] md:text-xs lg:text-[14px] tracking-widest text-center py-2.5 px-4 font-sans font-medium transition-all duration-500 select-none border-b border-gold-500/20">
        <div className="flex items-center justify-center gap-2 max-w-[1400px] mx-auto min-h-4">
          <Sparkles className="h-3.5 w-3.5 text-gold-500 animate-pulse shrink-0" />
          <span className="truncate whitespace-normal md:truncate">{announcements[activeAnnouncement]}</span>
        </div>
      </div>

      {/* 2. Top Bar (Desktop metadata features) */}
      <div className="hidden lg:block bg-neutral-50 py-1.5 border-b border-neutral-100 text-xs text-neutral-600 font-sans">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center gap-4">
          {/* Column 1 */}
          <div className="flex items-center gap-1.5 justify-start flex-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span><span className="font-semibold text-neutral-800">Dubai Sourced:</span> Guarantees 100% original designer finds</span>
          </div>
          
          {/* Column 2 */}
          <div className="flex items-center justify-center text-gold-700 font-medium flex-1 text-center">
            <span>✨ Fast shipping to Addis Ababa, Hawassa, & Adama</span>
          </div>

          {/* Column 3 */}
          <div className="flex items-center justify-end gap-4 flex-1">
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
            <a 
              href="tel:+251909319951"
              className="flex items-center gap-1.5 hover:text-gold-600 transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-gold-500" />
              <span>Call: +251 909 319 951</span>
            </a>
            <span className="h-3 w-[1px] bg-neutral-200" />
            <a href="#how-it-works" className="hover:text-gold-600 transition-colors text-right">How Sourcing Works</a>
          </div>
        </div>
      </div>

      {/* 3. Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-neutral-100 transition-all overflow-visible">
        <div className="max-w-[1400px] mx-auto px-6 py-3.5 md:py-4 flex items-center justify-between gap-2.5 md:gap-4 w-full overflow-visible box-border">
          
          {/* Mobile Menu & Logo Container */}
          <div className="flex items-center gap-1.5 md:gap-3 shrink-0">
            
            {/* Branding Logo */}
            <div 
              onClick={() => onSelectCategory('all')} 
              className="cursor-pointer select-none shrink-0"
            >
              <div className="flex flex-col">
                <span className="font-sans text-lg md:text-2xl font-black tracking-tighter leading-none text-black">
                  DUBAI2ADDIS
                </span>
                <span className="text-[8px] md:text-[9px] tracking-[0.3em] text-gold-500 uppercase font-black mt-0.5 block">
                  FASHION HOUSE
                </span>
              </div>
            </div>
          </div>

          {/* Search Box & Controls */}
          <div className="flex items-center gap-2 md:gap-3 lg:gap-4 shrink-0 flex-shrink-0 overflow-visible">
            {/* Live Search Form */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative max-w-sm shrink-0">
              <input
                type="text"
                placeholder="Search bags, abayas, dresses..."
                value={searchVal}
                onChange={handleSearchChange}
                className="w-40 md:max-lg:w-44 lg:w-56 xl:w-64 pl-9 pr-4 py-2 border border-neutral-200 text-sm focus:outline-none focus:border-gold-500 rounded bg-neutral-50/50 hover:bg-neutral-50 transition-colors font-sans"
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
              className="md:hidden p-2 text-neutral-700 hover:bg-neutral-100 rounded-full shrink-0"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-neutral-700 hover:text-gold-600 hover:bg-gold-500/5 rounded-full transition-all shrink-0"
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

            {/* Auth / Profile Hub */}
            <div className="flex items-center gap-2 border-l border-neutral-200 pl-2.5 md:pl-4 shrink-0 overflow-visible">
              {!user ? (
                <button
                  onClick={onSignIn}
                  className="relative p-2 text-neutral-700 hover:text-gold-600 hover:bg-gold-500/5 rounded-full transition-all flex items-center justify-center md:border md:border-neutral-300 md:px-3 md:py-2 md:text-xs md:font-bold md:uppercase md:tracking-widest md:text-neutral-800 md:hover:border-black md:rounded-none shrink-0"
                  id="google-signin-btn"
                  title="Sign In"
                >
                  <User className="h-5 w-5 md:h-4 md:w-4 md:text-neutral-400" />
                  <span className="hidden md:inline">Sign In</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                  {/* Shopify Admin Workspace (Super admin or Staff only) */}
                  {(user.role === 'SUPER_ADMIN' || user.role === 'STAFF') && (
                    <button
                      onClick={onOpenDashboard}
                      className="flex items-center gap-1 px-2 py-1.5 md:px-2.5 md:py-2 bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-gold-800 hover:bg-[#D4AF37]/25 transition-all active:scale-95 shrink-0"
                      title="Open Shopify Workspace"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="hidden xl:inline text-[9px] font-black uppercase tracking-widest">Workspace</span>
                    </button>
                  )}

                  {/* Profile Handoff Status Label */}
                  <div className="hidden sm:flex flex-col text-left leading-none shrink-0">
                    <span className="text-[10px] font-bold text-neutral-900 truncate max-w-[80px]">
                      {user.name?.split(' ')[0] || 'User'}
                    </span>
                    <span className="text-[8px] font-black text-[#D4AF37] uppercase tracking-wider mt-0.5">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={onSignOut}
                    className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-full transition-all shrink-0"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Elegant Mobile-Optimized Static Category Navigation Bar (resembles e-commerce reference image) */}
        <div className="bg-white border-t border-b border-neutral-150 select-none relative z-10">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex items-center justify-between gap-2">
            <div className="flex items-center justify-start md:justify-center gap-5 md:gap-8 overflow-x-auto no-scrollbar py-2.5 flex-1 scroll-smooth">
              {[
                { id: '', name: 'All' },
                { id: 'dresses', name: 'Dresses' },
                { id: 'shoes', name: 'Shoes' },
                { id: 'handbags', name: 'Bags' },
                { id: 'beauty', name: 'Perfumes' },
                { id: 'watches', name: 'Watches' },
                { id: 'accessories', name: 'Accessories' }
              ].map((item) => {
                const isActive = (item.id === '' && (activeCategory === '' || activeCategory === 'all')) || activeCategory === item.id;
                return (
                  <button
                    key={item.id || 'all-cat'}
                    onClick={() => onSelectCategory(item.id)}
                    className={`relative py-1 text-xs md:text-sm font-sans uppercase tracking-widest whitespace-nowrap cursor-pointer transition-all ${
                      isActive 
                        ? 'text-black font-extrabold border-b-2 border-black pb-1' 
                        : 'text-neutral-500 font-semibold hover:text-black pb-1 border-b-2 border-transparent'
                    }`}
                  >
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Shopping Bag Button in static category menu bar */}
            <button 
              onClick={onOpenCart}
              className="p-1.5 text-neutral-800 hover:bg-neutral-100 hover:text-gold-600 rounded-md shrink-0 flex items-center gap-1 transition-all active:scale-95"
              aria-label="Open sourcing bag"
              id="category-cart-btn"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="bg-black text-[#ffffff] text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
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

    </>
  );
}
