/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CATEGORIES } from '../data/products';

interface CategoryCarouselProps {
  onSelectCategory: (categoryId: string) => void;
  activeCategory: string;
}

export default function CategoryCarousel({ onSelectCategory, activeCategory }: CategoryCarouselProps) {
  // Define exactly the 6 static categories requested plus "Shop All" to maintain perfect consistency
  const allCategories = [
    {
      id: '',
      name: 'Shop All',
      count: '600+ Items',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'dresses',
      name: 'Dresses',
      count: '124 Items',
      image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'shoes',
      name: 'Shoes',
      count: '85 Items',
      image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'handbags',
      name: 'Bags',
      count: '78 Items',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'beauty',
      name: 'Perfumes',
      count: '62 Items',
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'watches',
      name: 'Watches',
      count: '35 Items',
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'accessories',
      name: 'Accessories',
      count: '92 Items',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80',
    },
  ];

  return (
    <div className="bg-white border-b border-neutral-100 py-6 md:py-8 select-none">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex items-center gap-6 md:gap-8 overflow-x-auto no-scrollbar py-2">
          {allCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id || 'all-category'}
                onClick={() => onSelectCategory(cat.id)}
                className="flex flex-col items-center space-y-2 shrink-0 group focus:outline-none cursor-pointer"
              >
                <div className={`relative h-16 w-16 md:h-20 md:w-20 rounded-full overflow-hidden p-0.5 border-2 transition-all duration-300 ${
                  isActive 
                    ? 'border-[#D4AF37] scale-105 shadow-md' 
                    : 'border-transparent group-hover:border-neutral-300'
                }`}>
                  <div className="h-full w-full rounded-full overflow-hidden bg-neutral-150">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
                <span className={`text-[10px] md:text-xs font-sans uppercase tracking-widest font-black transition-colors ${
                  isActive ? 'text-[#D4AF37]' : 'text-neutral-700 group-hover:text-black'
                }`}>
                  {cat.name}
                </span>
                {cat.count && (
                  <span className="text-[8px] text-neutral-400 font-bold uppercase tracking-wider block">
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
