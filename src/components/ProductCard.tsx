/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Product } from '../types';
import { EXCHANGE_RATE_ETB } from '../data/products';
import { Heart, Eye, MessageCircle, ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
  onQuickView: () => void;
  onOrderWhatsApp: () => void;
  onAddToCart: () => void;
}

export default function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onOrderWhatsApp,
  onAddToCart
}: ProductCardProps) {
  // Support both Master DB schemas and legacy mock structures seamlessly
  const convertedPriceETB = (product as any).priceETB !== undefined 
    ? (product as any).priceETB 
    : Math.round(product.priceAED * EXCHANGE_RATE_ETB);
  
  const originalPriceETB = (product as any).originalPriceETB !== undefined
    ? (product as any).originalPriceETB
    : (product.originalPriceAED ? Math.round(product.originalPriceAED * EXCHANGE_RATE_ETB) : undefined);

  // Fallback rating and reviews
  const ratingScore = product.rating || 5;
  const reviewsCountVal = product.reviewsCount || 12;

  // Calculate discount percentage
  const discountPercent = originalPriceETB
    ? Math.round(((originalPriceETB - convertedPriceETB) / originalPriceETB) * 100)
    : 0;

  const imageSrc = Array.isArray(product.images) && product.images.length > 0 
    ? product.images[0] 
    : ((product as any).image || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=400');

  return (
    <div className="bg-white border border-gray-100 rounded-none overflow-hidden group hover:shadow-md transition-all duration-300 flex flex-col h-full relative" id={`product-card-${product.id}`}>
      
      {/* 1. Image Container with Badges */}
      <div className="relative overflow-hidden aspect-[3/4] bg-neutral-50 shrink-0 select-none rounded-none">
        <img
          src={imageSrc}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102 rounded-none"
        />

        {/* Shimmer overlay on hover */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Wishlist toggle anchor */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist();
          }}
          className="absolute top-2 right-2 p-2 bg-white/95 text-neutral-800 hover:text-[#D4AF37] rounded-none shadow-xs transition-all active:scale-90 z-10"
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          id={`wishlist-btn-${product.id}`}
        >
          <Heart 
            className={`h-4 w-4 transition-colors ${
              isWishlisted 
                ? 'fill-rose-500 text-rose-500' 
                : 'text-neutral-600'
            }`} 
          />
        </button>

        {/* Dynamic Promotional Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start pointer-events-none">
          {discountPercent > 0 && (
            <span className="bg-black text-white font-sans font-extrabold text-[8px] tracking-widest px-2 py-0.5 rounded-none shadow-xs uppercase">
              SAVE {discountPercent}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-[#D4AF37] text-white font-sans font-extrabold text-[8px] tracking-widest px-2 py-0.5 rounded-none shadow-xs">
              BEST SELLER
            </span>
          )}
        </div>

        {/* Over-image interactive drawer (Quick view on hover) */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-linear-to-t from-black/80 via-black/45 to-transparent flex justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView();
            }}
            className="bg-white text-neutral-900 border border-neutral-100 hover:bg-neutral-950 hover:text-white px-3.5 py-2 rounded-none font-sans font-bold text-[10px] tracking-widest uppercase flex items-center gap-1.5 transition-all"
            id={`quickview-btn-${product.id}`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Product Details */}
      <div className="p-3.5 flex-1 flex flex-col justify-between rounded-none bg-white">
        <div className="space-y-1">
          {/* Brand label */}
          <div className="flex items-center justify-between font-sans text-[9px] text-neutral-400 font-medium uppercase tracking-wider">
            <span className="text-[#a17a4c] font-bold">{product.brand}</span>
          </div>

          {/* Title Header */}
          <h3 
            onClick={onQuickView}
            className="font-sans text-[11px] font-semibold text-neutral-800 tracking-tight truncate cursor-pointer hover:text-[#D4AF37] transition-colors leading-tight"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Sourcing Short Description (One line max, filtered of categories) */}
          <p className="font-sans text-[10px] text-neutral-400 font-normal truncate leading-tight">
            {product.description
              ? product.description
                  .replace(/\b(dresses|dress|shoes|shoe|handbags|handbag|bags|bag|watches|watch|perfumes|perfume|kaftans|kaftan|gowns|gown|abayas|abaya|heels|slides|activewear|accessories|jewelries|jewelry|sneakers|sneaker)\b/gi, '')
                  .replace(/\s+/g, ' ')
                  .trim()
              : ''}
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-100 mt-2">
          {/* Price blocks listed on one line */}
          <div className="flex items-baseline gap-1.5 flex-nowrap overflow-hidden select-none">
            <span className="font-sans text-black text-xs sm:text-[13px] font-black tracking-tight shrink-0">
              {convertedPriceETB.toLocaleString()} ETB
            </span>
            {originalPriceETB ? (
              <>
                <span className="text-neutral-400 line-through font-sans text-[10px] shrink-0">
                  {originalPriceETB.toLocaleString()} ETB
                </span>
                {discountPercent > 0 && (
                  <span className="text-[#e25822] font-black text-[9px] shrink-0 hidden min-[340px]:inline-block bg-[#fff5f5] px-1 rounded">
                    -{discountPercent}%
                  </span>
                )}
              </>
            ) : (
              <span className="text-[9px] text-green-600 font-bold uppercase tracking-wider shrink-0">In Stock</span>
            )}
          </div>

          {/* Cool Side-by-side Action Buttons */}
          <div className="flex items-stretch gap-1.5 mt-1.5">
            {/* Quick Add Sourcing Bag icon only */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart();
              }}
              className="bg-neutral-50 hover:bg-neutral-100 text-neutral-800 hover:text-black border border-neutral-200 hover:border-neutral-300 p-2 rounded-md flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95"
              title="Quick Add to Bag"
              id={`add-to-cart-${product.id}`}
            >
              <ShoppingBag className="h-4 w-4" />
            </button>

            {/* Elegant WhatsApp Direct Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOrderWhatsApp();
              }}
              className="flex-1 bg-[#25D366] hover:bg-[#20ba5a] text-white font-sans font-semibold text-[10px] sm:text-[11px] py-2 px-2.5 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
              id={`whatsapp-order-${product.id}`}
            >
              <MessageCircle className="h-3.5 w-3.5 fill-current/10" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
