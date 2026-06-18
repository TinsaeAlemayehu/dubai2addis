/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { EXCHANGE_RATE_ETB } from '../data/products';
import { X, Heart, Star, ShoppingBag, MessageCircle, AlertCircle, Sparkles, Check } from 'lucide-react';

interface ProductQuickViewProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: { name: string; hex: string }, quantity: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

export default function ProductQuickView({
  product,
  onClose,
  onAddToCart,
  onToggleWishlist,
  isWishlisted
}: ProductQuickViewProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || 'One Size');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || { name: 'Default', hex: '#ccc' });
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const convertedPriceETB = Math.round(product.priceAED * EXCHANGE_RATE_ETB);
  const totalAED = product.priceAED * quantity;
  const totalETB = convertedPriceETB * quantity;

  const handleAddBag = () => {
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setAddedAnimation(true);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 2000);
  };

  const handleDirectWhatsApp = () => {
    const textMessage = `Hello Dubai2Addis Fashion,\n\n` +
      `I would like to order:\n` +
      `1. ${product.name} (ID: ${product.id}) - ${convertedPriceETB.toLocaleString()} ETB\n` +
      `   * Size: ${selectedSize}\n` +
      `   * Color: ${selectedColor.name}\n` +
      `   * Qty: ${quantity}\n\n` +
      `Total: ${totalETB.toLocaleString()} ETB\n\n` +
      `Please send deposit payment instructions.`;

    const encodedMessage = encodeURIComponent(textMessage);
    window.open(`https://wa.me/971552734073?text=${encodedMessage}`, '_blank', 'referrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Click-out backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" 
      />

      {/* Main quickview modal viewport */}
      <div className="relative w-full max-w-4xl bg-white rounded-none shadow-2xl overflow-hidden z-10 flex flex-col md:flex-row max-h-[92vh] md:max-h-[85vh] transition-transform animate-scale-in border border-black">
        
        {/* Close Button Anchor */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-black text-[#ffffff] hover:bg-[#D4AF37] hover:text-black rounded-none shadow-xs z-20 transition-all active:scale-90"
          title="Close Dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Side: Product Gallery */}
        <div className="w-full md:w-[48%] bg-neutral-50 flex flex-col justify-between p-4 md:p-6 border-b md:border-b-0 md:border-r border-neutral-100 overflow-y-auto no-scrollbar rounded-none">
          <div className="space-y-4">
            {/* Active Display Panel */}
            <div className="relative aspect-[3/4] bg-white rounded-none border border-neutral-100 overflow-hidden select-none">
              <img
                src={images[activeImageIdx]}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-all rounded-none"
              />
              <span className="absolute bottom-3 right-3 bg-black/80 text-[#ffffff] text-[9px] font-sans px-2.5 py-1 rounded-none font-bold uppercase tracking-wider">
                Image {activeImageIdx + 1} of {images.length}
              </span>
            </div>

            {/* Thumbnail Gallery Nav (if multiple images exist) */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-16 h-16 rounded-none border-2 overflow-hidden transition-all shrink-0 ${
                      activeImageIdx === idx ? 'border-[#D4AF37] scale-102' : 'border-neutral-200'
                    }`}
                  >
                    <img src={img} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover rounded-none" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sourcing credentials badge footer */}
          <div className="mt-4 bg-[#D4AF37]/10 border border-[#D4AF37]/20 p-3 rounded-none flex items-start gap-2 text-gold-800 text-xs font-sans">
            <Sparkles className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-extrabold uppercase tracking-wide text-[#D4AF37]">100% Authentic Sourced Item</p>
              <p className="text-neutral-600 text-[10px] uppercase font-bold tracking-wider leading-relaxed">
                DIRECT FROM DUBAI EXCLUSIVE BRAND MALLS. SAFELY SHIPPED TO ETHIOPIA.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Specifications and Purchase Triggers */}
        <div className="w-full md:w-[52%] p-5 md:p-8 overflow-y-auto flex flex-col justify-between space-y-4 md:space-y-6">
          <div className="space-y-3.5">
            {/* Headers labels */}
            <div className="flex items-center justify-between font-sans text-xs">
              <span className="bg-black text-[#ffffff] font-sans font-black text-[9px] tracking-[0.25em] px-2.5 py-1 rounded-none uppercase">
                DUBAI ORIGINAL
              </span>
              <span className="text-neutral-500 tracking-wider font-bold uppercase text-[9px]">
                SKU: D2A-{product.id}-{selectedSize}
              </span>
            </div>

            {/* Brand Title */}
            <p className="text-[#D4AF37] font-sans tracking-widest uppercase font-black text-[10px]">{product.brand}</p>
            
            {/* Dynamic Custom Header Name */}
            <h2 className="font-sans text-xl md:text-2xl font-black uppercase tracking-tight leading-none text-black italic">
              {product.name}
            </h2>

            {/* Rating summary */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <div className="flex items-center text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-neutral-200'}`} />
                ))}
              </div>
              <span className="font-sans text-[10px] font-bold text-black uppercase tracking-wider">{product.rating} / 5</span>
              <span className="text-neutral-300">|</span>
              <span className="font-sans text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{product.reviewsCount} verified retail checks</span>
            </div>

            {/* Beautiful Transparent Price Matrix */}
            <div className="bg-neutral-50 p-4 rounded-none border border-neutral-100 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-neutral-500 text-[9px] uppercase tracking-wider font-bold font-sans">Single Item Price:</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-sans text-lg font-black text-emerald-700 tracking-tight">
                    {convertedPriceETB.toLocaleString()} ETB
                  </span>
                </div>
              </div>

              {product.originalPriceAED && (
                <div className="text-right">
                  <span className="text-neutral-400 text-[8px] uppercase font-black tracking-widest block font-sans">Original Mall:</span>
                  <span className="text-neutral-400 line-through text-xs font-sans block">
                    {Math.round(product.originalPriceAED * EXCHANGE_RATE_ETB).toLocaleString()} ETB
                  </span>
                  <span className="bg-rose-500 text-white text-[8px] font-sans font-black tracking-widest px-1.5 py-0.5 rounded-none uppercase leading-none">
                    SAVE {Math.round(((product.originalPriceAED - product.priceAED) / product.originalPriceAED) * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Description Paragraph */}
            <p className="font-sans text-[11px] uppercase tracking-wide text-neutral-600 leading-relaxed font-light">
              {product.description}
            </p>

            {/* Color Option Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black tracking-widest text-black font-sans flex items-center gap-1">
                  <span>Select Color:</span>
                  <span className="text-neutral-500 capitalize font-bold">({selectedColor.name})</span>
                </span>
                <div className="flex items-center gap-3">
                  {product.colors.map((color) => {
                    const isColSelected = selectedColor.name === color.name;
                    return (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`relative h-7 w-7 rounded-none border border-neutral-300 transition-all cursor-pointer ${
                          isColSelected ? 'ring-2 ring-black scale-105' : 'hover:scale-102'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                        id={`color-picker-${color.name}`}
                      >
                        {isColSelected && (
                          <Check className={`absolute inset-0 m-auto h-3.5 w-3.5 ${
                            color.hex.toLowerCase() === '#ffffff' || color.hex.toLowerCase() === '#fdfef7' ? 'text-black' : 'text-white'
                          }`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Option Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between items-center text-[10px] font-sans font-black tracking-widest uppercase">
                  <span className="text-black flex items-center gap-1">
                    <span>Select Size:</span>
                    <span className="text-neutral-500">({selectedSize})</span>
                  </span>
                  <a href="#how-it-works" className="text-[#D4AF37] hover:underline">Size Guide</a>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-xs font-sans tracking-wide rounded-none border transition-all cursor-pointer font-bold uppercase ${
                        selectedSize === size
                          ? 'border-black bg-black text-[#ffffff]'
                          : 'border-neutral-200 bg-white hover:border-black text-neutral-800'
                      }`}
                      id={`size-picker-${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector dial */}
            <div className="space-y-2 pt-1.5">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#111111] font-sans">
                Quantity Sourcing:
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-neutral-300 rounded-none font-sans h-10 w-32 justify-between">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 py-1.5 text-lg font-bold text-neutral-600 hover:text-black hover:bg-neutral-50 disabled:opacity-30 disabled:pointer-events-none h-full"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-sm text-neutral-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-4 py-1.5 text-lg font-bold text-neutral-600 hover:text-black hover:bg-neutral-50 h-full"
                  >
                    +
                  </button>
                </div>

                <div className="font-sans text-[10px] uppercase font-bold text-neutral-400">
                  Delivery total: <span className="font-extrabold text-neutral-800">{totalETB.toLocaleString()} ETB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Buy Buttons */}
          <div className="border-t border-neutral-100 pt-4 flex flex-col sm:flex-row gap-3">
            {/* 1. Add to Order Bag Drawer */}
            <button
              onClick={handleAddBag}
              className={`flex-1 font-sans font-bold text-[10px] tracking-widest uppercase py-3 px-6 rounded-none flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-xs border border-transparent ${
                addedAnimation
                  ? 'bg-emerald-600 text-white'
                  : 'bg-black text-[#ffffff] hover:bg-[#D4AF37] hover:text-black'
              }`}
              id="add-bag-modal"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{addedAnimation ? 'Successfully Added!' : 'Add Sourcing Bag'}</span>
            </button>

            {/* 2. Direct Instant WhatsApp Contact */}
            <button
              onClick={handleDirectWhatsApp}
              className="flex-1 bg-emerald-500 hover:bg-emerald-650 text-white font-sans font-bold text-[10px] tracking-widest uppercase py-3 px-6 rounded-none flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 cursor-pointer"
              id="whatsapp-order-modal"
            >
              <MessageCircle className="h-4 w-4 fill-white/10" />
              <span>WhatsApp Order</span>
            </button>

            {/* 3. Wishlist Heart icon toggle */}
            <button
              onClick={() => onToggleWishlist(product)}
              className={`h-11 w-11 flex items-center justify-center rounded-none border border-neutral-200 transition-all hover:bg-neutral-50 shrink-0 ${
                isWishlisted ? 'text-rose-500 border-rose-200 bg-rose-500/5' : 'text-neutral-500'
              }`}
              title="Add to wishlist"
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Delivery Note & Import Tax Reminder */}
          <div className="bg-neutral-50 p-2.5 rounded-none border border-neutral-150 flex items-center gap-2 text-[9px] uppercase font-bold text-neutral-500 font-sans tracking-wide">
            <AlertCircle className="h-4.5 w-4.5 text-neutral-400 shrink-0" />
            <p>
              ⚡ Order process: Add to Sourcing Bag to request a custom list, or tap WhatsApp to secure this single piece immediately. Deliveries arrive in Addis weekly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
