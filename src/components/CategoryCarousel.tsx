/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CATEGORIES } from '../data/products';
import { Sparkles } from 'lucide-react';

interface CategoryCarouselProps {
  onSelectCategory: (categoryId: string) => void;
  activeCategory: string;
}

export default function CategoryCarousel({ onSelectCategory, activeCategory }: CategoryCarouselProps) {
  return (
    <section className="bg-white py-6 md:py-8 border-b border-neutral-100 select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Luxury Section Label */}
        <div className="flex items-center gap-2 mb-4 md:mb-5">
          <Sparkles className="h-4 w-4 text-[#D4AF37]" />
          <h2 className="font-sans text-[11px] font-black tracking-[0.25em] text-neutral-900 uppercase">
            Shop Dubai Collections by Category
          </h2>
        </div>

        {/* Categories container */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-3 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
          {/* "See All" special circular element */}
          <div
            onClick={() => onSelectCategory('')}
            className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
          >
            <div className={`relative h-14 w-14 rounded-full bg-gray-100 border-2 transition-all p-0.5 overflow-hidden ${
              activeCategory === '' 
                ? 'border-black' 
                : 'border-transparent group-hover:border-[#D4AF37]'
            }`}>
              <div className="bg-neutral-950 text-[#ffffff] h-full w-full rounded-full flex flex-col items-center justify-center text-center">
                <span className="font-sans text-[9px] font-black tracking-widest uppercase">ALL</span>
              </div>
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider text-center transition-colors group-hover:text-black ${
              activeCategory === '' ? 'text-black' : 'text-neutral-500'
            }`}>
              See All
            </span>
          </div>

          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
              >
                {/* Circular image avatar */}
                <div className={`relative h-14 w-14 rounded-full bg-gray-100 border-2 transition-all p-0.5 overflow-hidden ${
                  isActive 
                    ? 'border-black' 
                    : 'border-transparent group-hover:border-[#D4AF37]'
                }`}>
                  <img
                    src={cat.image}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover rounded-full bg-gray-200"
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-black/10 rounded-full" />
                  )}
                </div>
                
                {/* Category name layout */}
                <span className={`text-[9px] font-bold uppercase tracking-wider text-center transition-colors group-hover:text-black ${
                  isActive ? 'text-black' : 'text-neutral-500'
                }`}>
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
