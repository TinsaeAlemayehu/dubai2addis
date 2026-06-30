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
    title: 'DUBAI TO ETHIOPIA',
    heading: "Shop Dubai's Best Stores from Ethiopia",
    subheading: 'We purchase your favorite fashion, shoes, bags, and beauty products from Dubai retailers, perform rigorous quality checks, consolidate your shipments, and deliver them safely to your doorstep in Ethiopia.',
    badge: 'PREMIUM SHOPPING GATEWAY',
    discount: '100% SECURE DELIVERY',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80',
    primaryActionText: 'Start Shopping',
    whatsappActionText: 'How It Works',
    badgeColor: 'bg-gold-500 text-black',
    accentColor: '#d4af37',
  },
  {
    id: 2,
    title: 'UNLIMITED ACCESS',
    heading: 'Access Thousands of Dubai Products Delivered to Ethiopia',
    subheading: 'Get direct access to Shein, Temu, Brands For Less, Amazon, Noon, and luxury UAE malls. Our professional team handles purchasing, inspection, and air cargo delivery directly to you.',
    badge: 'UNLIMITED RETAIL CHOICES',
    discount: 'NO MORE TRAVELING AGENTS',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=80',
    primaryActionText: 'Start Shopping',
    whatsappActionText: 'How It Works',
    badgeColor: 'bg-black text-[#ffffff] border border-gold-500/30',
    accentColor: '#111111',
  },
  {
    id: 3,
    title: 'YOUR SOURCING PARTNER',
    heading: 'Your Gateway to Shopping in Dubai',
    subheading: 'Shop with absolute confidence. Pay a secure deposit, get live verification photos of your items from Dubai, and track your weekly air freight from dispatch to handoff in Ethiopia.',
    badge: 'TRUSTED BY THOUSANDS',
    discount: 'WEEKLY AIR FREIGHT DROPS',
    image: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1600&q=80',
    primaryActionText: 'Start Shopping',
    whatsappActionText: 'How It Works',
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

  const handleHowItWorksClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const section = document.getElementById('how-it-works');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
            className="absolute inset-0 lg:left-1/2 lg:w-1/2 bg-cover bg-center transition-transform duration-[6000ms] scale-102"
            style={{ backgroundImage: `url(${SLIDES[current].image})` }}
          />
          {/* Modern high contrast overlay mesh to ensure perfect readable contrast */}
          <div className="absolute inset-0 bg-linear-to-r from-black via-black/80 lg:via-black/90 to-transparent lg:to-transparent" />

          {/* Text/Interactive Content Container */}
          <div className="relative max-w-[1400px] mx-auto px-6 h-full flex flex-col justify-center text-white z-10 w-full">
            <div className="max-w-2xl md:max-lg:max-w-xl lg:max-w-[55vw] lg:pl-[5%] md:max-lg:-translate-y-8 space-y-4 md:space-y-6 transition-all duration-300">
              
              {/* Shimmering Top Badge */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-1.5"
              >
                <span className="inline-block bg-[#C9A84C] text-black text-[10px] font-black uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-none">
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
                className="font-sans text-3xl md:text-[2.5rem] lg:text-[clamp(2.5rem,4vw,3.8rem)] font-black uppercase leading-tight italic tracking-tighter text-white"
              >
                {SLIDES[current].heading.split(' ').slice(0, 3).join(' ')} <br/>
                <span className="text-[#C9A84C] font-black">{SLIDES[current].heading.split(' ').slice(3).join(' ')}</span>
              </motion.h1>

              {/* Subheading Detail */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="font-sans text-xs md:text-[13px] lg:text-sm text-neutral-300 leading-relaxed max-w-xl md:max-lg:max-w-lg font-light uppercase tracking-wide"
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
                  className="bg-[#C9A84C] hover:bg-[#b0913b] text-black py-3 px-8 text-[11px] font-sans tracking-[0.2em] font-bold uppercase rounded-none border border-transparent flex items-center justify-center gap-2 transition-all cursor-pointer group active:scale-95 duration-200"
                >
                  <span>{SLIDES[current].primaryActionText}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleHowItWorksClick}
                  className="border border-white text-white text-[11px] font-bold py-3 px-8 uppercase tracking-[0.2em] rounded-none hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2 duration-200"
                >
                  <span>{SLIDES[current].whatsappActionText}</span>
                </button>
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
