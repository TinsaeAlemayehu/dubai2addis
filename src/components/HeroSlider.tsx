/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SLIDES = [
  {
    id: 1,
    title: 'DUBAI BOUTIQUE DROPS',
    heading: 'Dubai Fashion Delivered Directly To Ethiopia',
    subheading: 'Premium abayas, gowns, bags, high heels, and watches sourced directly from Dubai markets and luxury malls. Beautiful handcrafted items chosen for Ethiopian fashion curators.',
    badge: 'EXCLUSIVE SPRING SELECTION',
    discount: 'UP TO 70% OFF',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80',
    primaryActionText: 'Explore Collection',
    whatsappActionText: 'Order on WhatsApp',
    badgeColor: 'bg-gold-500 text-black',
    accentColor: '#d4af37',
  },
  {
    id: 2,
    title: 'MODEST LUXURY & ABAYAS',
    heading: 'Elegant Modest & Abaya Styling From Dubai Creek',
    subheading: 'Handpicked premium georgettes, intricate gold thread embroidery, and floaty silhouettes tailored for festive Ethiopian weddings and spiritual celebrations.',
    badge: 'RAMADAN & MODEST DROPS',
    discount: 'BOUTIQUE DESIGNS',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=80',
    primaryActionText: 'Shop Abayas',
    whatsappActionText: 'Sourcing Support',
    badgeColor: 'bg-black text-[#ffffff] border border-gold-500/30',
    accentColor: '#111111',
  },
  {
    id: 3,
    title: 'ACCESSORIES & TIMEPIECES',
    heading: 'High-Society Timepieces & Pure Plated Gold Accessories',
    subheading: 'Upgrade your look with stunning chronographs, emerald sunburst dials, and triple-plated tarnish resistant hoops. Guaranteed authenticity and safe courier directly to your door.',
    badge: '18K GOLD COLLECTION',
    discount: '100% QUALITY GUARANTEED',
    image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1600&q=80',
    primaryActionText: 'Shop Jewels & Watches',
    whatsappActionText: 'Inquire Custom Brands',
    badgeColor: 'bg-gold-700 text-white',
    accentColor: '#94711e',
  }
];

interface HeroSliderProps {
  onExploreClick: () => void;
}

export default function HeroSlider({ onExploreClick }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  };

  return (
    <section className="relative h-[480px] md:h-[600px] lg:h-[660px] bg-neutral-950 overflow-hidden w-full select-none" id="hero-slider">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.85 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background image side-profile */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[6000ms] scale-102"
            style={{ backgroundImage: `url(${SLIDES[current].image})` }}
          />
          {/* Modern high contrast overlay mesh to ensure perfect readable contrast */}
          <div className="absolute inset-0 bg-linear-to-r from-black via-black/80 to-transparent" />

          {/* Text/Interactive Content Container */}
          <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-center text-white z-10 w-full">
            <div className="max-w-2xl space-y-4 md:space-y-6">
              
              {/* Shimmering Top Badge */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-1.5"
              >
                <span className="inline-block bg-[#D4AF37] text-black text-[10px] font-black uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-none">
                  {SLIDES[current].badge}
                </span>
                <span className="text-[#ffffff] bg-black/60 font-sans text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1.5 border border-white/10 rounded-none">
                  {SLIDES[current].discount}
                </span>
              </motion.div>

              {/* Title Header */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="font-sans text-3xl md:text-5xl lg:text-6xl font-black uppercase leading-none italic tracking-tighter text-white"
              >
                {SLIDES[current].heading.split(' ').slice(0, 3).join(' ')} <br/>
                <span className="text-[#D4AF37] font-black">{SLIDES[current].heading.split(' ').slice(3).join(' ')}</span>
              </motion.h1>

              {/* Subheading Detail */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="font-sans text-xs md:text-sm text-neutral-300 leading-relaxed max-w-xl font-light uppercase tracking-wide"
              >
                {SLIDES[current].subheading}
              </motion.p>

              {/* Dual Action CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
              >
                <button
                  onClick={onExploreClick}
                  className="bg-black hover:bg-[#D4AF37] text-white hover:text-black py-3 px-8 text-[11px] font-sans tracking-[0.2em] font-bold uppercase rounded-none border border-white/50 hover:border-[#D4AF37] flex items-center justify-center gap-2 transition-all cursor-pointer group active:scale-95 duration-200"
                >
                  <span>{SLIDES[current].primaryActionText}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href={`https://wa.me/251911000000?text=Hello%20Dubai2Addis!%20I%20am%20interested%20in%20custom%20sourcing%20fashion%20items%20from%20Dubai.`}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="border border-white text-white text-[11px] font-bold py-3 px-8 uppercase tracking-[0.2em] rounded-none hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 duration-200"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" />
                  <span>{SLIDES[current].whatsappActionText}</span>
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Index Line Markers */}
      <div className="absolute bottom-8 left-12 z-20 flex gap-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-0.5 transition-all duration-300 ${
              current === index 
                ? 'w-10 bg-white' 
                : 'w-10 bg-gray-500'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Circle Control navigation arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 p-2 text-white/80 hover:text-white rounded-full transition-all border border-white/10 hidden md:block"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/60 p-2 text-white/80 hover:text-white rounded-full transition-all border border-white/10 hidden md:block"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </section>
  );
}
