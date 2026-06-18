/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { EXCHANGE_RATE_ETB } from '../data/products';
import { apiClient } from '../lib/api.ts';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Heart, 
  MessageCircle, 
  Sparkles, 
  Globe, 
  MapPin, 
  Gift, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  wishlistItems: Product[];
  onRemoveFromCart: (cartItemId: string) => void;
  onUpdateCartQty: (cartItemId: string, qty: number) => void;
  onRemoveFromWishlist: (product: Product) => void;
  onMoveToCart: (product: Product) => void;
  user?: any;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  wishlistItems,
  onRemoveFromCart,
  onUpdateCartQty,
  onRemoveFromWishlist,
  onMoveToCart,
  user,
}: CartDrawerProps) {
  const [activeTab, setActiveTab] = useState<'cart' | 'wishlist'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [shippingCity, setShippingCity] = useState('Addis Ababa');

  // Pre-populate name with user's synced database name
  useEffect(() => {
    if (user && user.name) {
      setCustomerName(user.name);
    }
  }, [user]);

  if (!isOpen) return null;

  // Calculators
  const itemsTotalAED = cartItems.reduce((acc, item) => acc + item.product.priceAED * item.quantity, 0);
  
  // Convert individual price to ETB accurately
  const getProdPriceETB = (prod: Product) => {
    return (prod as any).priceETB !== undefined 
      ? (prod as any).priceETB 
      : Math.round(prod.priceAED * EXCHANGE_RATE_ETB);
  };

  const subtotalETB = cartItems.reduce((acc, item) => acc + (getProdPriceETB(item.product) * item.quantity), 0);
  
  // Shipping calculations: Free above 36500 ETB, otherwise 1825 ETB flat courier fee
  const shippingETB = subtotalETB >= 36500 ? 0 : (subtotalETB === 0 ? 0 : 1825);

  const grandTotalETB = subtotalETB + shippingETB;

  // Generate WhatsApp text payload & persist order dynamically in DBMS
  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    // 1. Submit order to backend database for permanent tracking & inventory deduction in PostgreSQL
    try {
      const orderData = {
        customerName: customerName || (user ? user.name : 'Guest Customer'),
        customerPhone: user?.phone || user?.whatsapp || 'Not specified',
        shippingAddress: shippingCity,
        city: shippingCity,
        totalAmountETB: grandTotalETB,
        items: cartItems.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          size: item.selectedSize,
          color: item.selectedColor.name,
          price: getProdPriceETB(item.product)
        }))
      };

      await apiClient.createOrder(orderData);
    } catch (err) {
      console.error('Failed to persist order to Cloud SQL database:', err);
    }

    // 2. Format and open WhatsApp message
    let itemsText = '';
    cartItems.forEach((item, index) => {
      const itemPrice = getProdPriceETB(item.product);
      itemsText += `${index + 1}. ${item.product.name} (Product ID: ${item.product.id}, Size: ${item.selectedSize}, Color: ${item.selectedColor.name}) - ${itemPrice.toLocaleString()} ETB\n`;
    });

    const textMessage = `Hello Dubai2Addis Fashion,\n\n` +
      `I would like to order:\n\n` +
      itemsText + `\n` +
      `Total: ${grandTotalETB.toLocaleString()} ETB\n\n` +
      `Please send deposit payment instructions.\n\n` +
      `Customer Name: ${customerName || 'Guest'}\n` +
      `Shipping City: ${shippingCity}`;

    const encodedMessage = encodeURIComponent(textMessage);
    window.open(`https://wa.me/971552734073?text=${encodedMessage}`, '_blank', 'referrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end select-none">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in rounded-none border-l border-black">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-sans text-sm font-black tracking-[0.2em] text-black uppercase">
              SOURCING BAG
            </span>
            <span className="bg-emerald-550/10 text-emerald-800 text-[9px] font-sans font-black tracking-widest px-2 py-0.5 rounded-none border border-emerald-500/25 uppercase">
              Birr (ETB) Sourced
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-black rounded-none"
            title="Close Drawer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Double visual tab selector */}
        <div className="flex border-b border-gray-100 bg-neutral-50/50">
          <button
            onClick={() => setActiveTab('cart')}
            className={`flex-1 py-3.5 text-xs font-sans font-black tracking-widest uppercase border-b-2 flex items-center justify-center gap-2 transition-all rounded-none ${
              activeTab === 'cart'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
            id="order-bag-tab"
          >
            <ShoppingBag className="h-4 w-4 text-[#D4AF37]" />
            <span>Bag ({cartItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex-1 py-3.5 text-xs font-sans font-black tracking-widest uppercase border-b-2 flex items-center justify-center gap-2 transition-all rounded-none ${
              activeTab === 'wishlist'
                ? 'border-black text-black bg-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
            id="wishlist-tab"
          >
            <Heart className="h-4 w-4 text-rose-500" />
            <span>Wishlist ({wishlistItems.length})</span>
          </button>
        </div>

        {/* Content viewport */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === 'cart' ? (
            /* CART TAB PANEL */
            cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-6 py-12">
                <div className="h-16 w-16 bg-neutral-50 rounded-none flex items-center justify-center text-neutral-400 border border-neutral-100">
                  <ShoppingBag className="h-8 w-8 stroke-1" />
                </div>
                <div className="space-y-1">
                  <p className="font-sans text-sm font-bold text-black uppercase tracking-wider">Your bag is empty</p>
                  <p className="font-sans text-xs text-neutral-500 leading-normal uppercase tracking-wide">
                    Browse dresses, shoes, abayas and bags sourced directly from Dubai malls to add them to your custom shopping manifest.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-black text-[#ffffff] px-6 py-2.5 text-[10px] font-sans tracking-widest font-black uppercase rounded-none shadow-xs hover:bg-neutral-800 transition-colors cursor-pointer border border-black"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4 font-sans text-xs">
                {/* Free shipping banner reminder */}
                {subtotalETB >= 36500 ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-none flex items-center gap-2.5">
                    <Gift className="h-5 w-5 text-emerald-600 animate-bounce shrink-0" />
                    <div>
                      <p className="font-black uppercase tracking-wide text-[10px]">You unlocked FREE Shipping to Ethiopia! 🎉</p>
                      <p className="text-[9px] uppercase tracking-wider">Your sourcing list is above 36,500 ETB.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-neutral-800 p-3 rounded-none flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-[#D4AF37] shrink-0" />
                      <p className="text-[10px] uppercase font-bold tracking-wide">
                        Add <span className="font-black text-black">{(36500 - subtotalETB).toLocaleString()} ETB</span> more to unlock <span className="font-black text-emerald-705">FREE Courier</span>.
                      </p>
                    </div>
                    <span className="text-[9px] text-neutral-500 bg-white/75 px-1.5 py-0.5 rounded-none font-bold border border-neutral-200 block">
                      {subtotalETB.toLocaleString()}/36.5k ETB
                    </span>
                  </div>
                )}

                {/* Items loop */}
                <div className="divide-y divide-gray-100">
                  {cartItems.map((item) => {
                    const itemTotalETB = getProdPriceETB(item.product) * item.quantity;
                    return (
                      <div key={item.id} className="py-3 flex gap-3.5 first:pt-0 last:pb-0">
                        {/* Image */}
                        <div className="h-20 w-16 bg-neutral-50 rounded-none overflow-hidden border border-neutral-100 shrink-0">
                          <img src={item.product.image} alt={item.product.name} referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-none" />
                        </div>

                        {/* Title, specifications and control dials */}
                        <div className="flex-1 flex flex-col justify-between space-y-1">
                          <div className="space-y-0.5">
                            <span className="text-[9px] text-gold-700 font-black uppercase tracking-widest font-sans block">{item.product.brand}</span>
                            <h4 className="font-sans text-[11px] font-bold text-black uppercase tracking-wide line-clamp-1 leading-normal">{item.product.name}</h4>
                            <div className="flex flex-wrap gap-1.5 pt-0.5 text-[9px] font-bold uppercase tracking-wide text-neutral-500">
                              <span className="bg-neutral-100 px-1.5 py-0.5 rounded-none">Size: {item.selectedSize}</span>
                              <span className="bg-neutral-100 px-1.5 py-0.5 rounded-none flex items-center gap-1">
                                <span className="h-2 w-2 rounded-none inline-block" style={{ backgroundColor: item.selectedColor.hex }} />
                                {item.selectedColor.name}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Quantity buttons */}
                            <div className="flex items-center border border-neutral-200 rounded-none h-7 justify-between">
                              <button
                                disabled={item.quantity <= 1}
                                onClick={() => onUpdateCartQty(item.id, item.quantity - 1)}
                                className="px-2 text-neutral-500 hover:text-black disabled:opacity-30"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-2 font-black text-xs text-neutral-900">{item.quantity}</span>
                              <button
                                onClick={() => onUpdateCartQty(item.id, item.quantity + 1)}
                                className="px-2 text-neutral-500 hover:text-black"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Trash action button */}
                            <button
                              onClick={() => onRemoveFromCart(item.id)}
                              className="text-neutral-400 hover:text-rose-500 p-1 rounded-none hover:bg-rose-50 transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Estimated Price */}
                        <div className="text-right space-y-0.5 shrink-0 font-sans">
                          <span className="font-sans font-black text-emerald-700 tracking-tight block text-sm">
                            {itemTotalETB.toLocaleString()} ETB
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ) : (
            /* WISHLIST TAB PANEL */
            wishlistItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-6 py-12">
                <div className="h-16 w-16 bg-neutral-50 rounded-none flex items-center justify-center text-neutral-400 border border-neutral-100">
                  <Heart className="h-8 w-8 stroke-1" />
                </div>
                <div className="space-y-1">
                  <p className="font-sans text-sm font-bold text-black uppercase tracking-wider">Your Wishlist is empty</p>
                  <p className="font-sans text-xs text-neutral-500 leading-normal uppercase tracking-wide">
                    Save accessories, shoes, gowns, and abayas to view later or request custom pricing.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-gray-100 font-sans text-xs">
                {wishlistItems.map((prod) => (
                  <div key={prod.id} className="py-3 flex gap-3 first:pt-0 last:pb-0">
                    {/* Image */}
                    <div className="h-16 w-12 bg-neutral-50 rounded-none overflow-hidden border border-neutral-100 shrink-0">
                      <img src={prod.image} alt={prod.name} referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-none" />
                    </div>

                    {/* Metadata & conversion triggers */}
                    <div className="flex-1 space-y-1">
                      <div>
                        <span className="text-[9px] text-[#D4AF37] font-black uppercase font-sans tracking-widest">{prod.brand}</span>
                        <h4 className="font-sans text-xs font-bold text-black uppercase tracking-wide line-clamp-1 leading-normal">{prod.name}</h4>
                      </div>
                      <div className="flex items-baseline gap-1.5 font-sans">
                        <span className="font-black text-emerald-750 text-xs">{getProdPriceETB(prod).toLocaleString()} ETB</span>
                      </div>
                    </div>

                    {/* Quick interactions */}
                    <div className="flex flex-col justify-between items-end gap-1 shrink-0">
                      <button
                        onClick={() => onRemoveFromWishlist(prod)}
                        className="text-neutral-400 hover:text-rose-500"
                        title="Delete Wishlist"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => onMoveToCart(prod)}
                        className="bg-black hover:bg-[#D4AF37] hover:text-black text-white font-sans font-bold text-[9px] py-1.5 px-2.5 rounded-none flex items-center gap-1 active:scale-95 transition-all text-center leading-none uppercase tracking-widest"
                      >
                        <ShoppingBag className="h-3 w-3" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* 2. Customer Delivery metadata details form (Only shown if cart has active items and cart tab active) */}
        {activeTab === 'cart' && cartItems.length > 0 && (
          <div className="p-4 bg-neutral-50 border-t border-gray-100 space-y-3 font-sans">
            <span className="text-[9px] font-black text-neutral-400 tracking-widest uppercase block">
              1. Customer Delivery Details (Optional)
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block mb-1">Your Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Tigist"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-none px-2.5 py-1.5 text-xs text-neutral-800 focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block mb-1">Shipping City:</label>
                <select
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-none px-2.5 py-1.5 text-xs text-neutral-800 focus:border-black focus:outline-none"
                >
                  <option value="Addis Ababa">Addis Ababa</option>
                  <option value="Hawassa">Hawassa</option>
                  <option value="Adama">Adama</option>
                  <option value="Bahir Dar">Bahir Dar</option>
                  <option value="Dire Dawa">Dire Dawa</option>
                  <option value="Jimma">Jimma</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 3. Estimated Order Totals Footer (Only if cart tab and cart has active items) */}
        {activeTab === 'cart' && cartItems.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-white space-y-4">
            
            <div className="space-y-2 text-xs font-sans">
              {/* Subtotal */}
              <div className="flex justify-between items-center text-neutral-600 uppercase font-bold tracking-wide text-[10px]">
                <span>Items Subtotal:</span>
                <span className="font-extrabold text-neutral-900 text-right text-sm">
                  {subtotalETB.toLocaleString()} ETB
                </span>
              </div>

              {/* Courier Fee */}
              <div className="flex justify-between items-center text-neutral-600 uppercase font-bold tracking-wide text-[10px]">
                <span className="flex items-center gap-1">
                  <span>Courier from Dubai:</span>
                  <Globe className="h-3 w-3 text-neutral-400" />
                </span>
                <span className="font-extrabold text-neutral-900 text-right">
                  {shippingETB === 0 ? (
                    <span className="text-emerald-750 font-black bg-emerald-50 px-2 py-0.5 rounded-none flex items-center justify-center">FREE</span>
                  ) : (
                    <span className="text-sm">
                      {shippingETB.toLocaleString()} ETB
                    </span>
                  )}
                </span>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-xs font-sans">
                <span className="font-black text-black tracking-widest uppercase">Estimated Total:</span>
                <div className="text-right">
                  <span className="font-black text-emerald-700 text-base block font-sans animate-pulse">
                    {grandTotalETB.toLocaleString()} ETB
                  </span>
                </div>
              </div>
            </div>

            {/* Check-out trigger */}
            <div className="space-y-2.5">
              <button
                onClick={handleCheckout}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-[#ffffff] font-sans font-extrabold tracking-widest text-[10px] uppercase py-3.5 rounded-none flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer"
                id="send-whatsapp-order-btn"
              >
                <MessageCircle className="h-4.5 w-4.5 fill-[#ffffff]/10" />
                <span>Send Sourcing Order To WhatsApp</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[9px] uppercase font-bold text-neutral-400 font-sans tracking-wide">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Secure sourcing platform; pay ethically on courier arrival in Ethiopia</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
