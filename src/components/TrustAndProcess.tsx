/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShieldCheck, 
  Truck, 
  Clock, 
  MessageCircle, 
  HelpCircle, 
  Search, 
  FileText, 
  ShoppingBag,
  CreditCard,
  Check
} from 'lucide-react';

export default function TrustAndProcess() {
  const trustBadges = [
    {
      id: 1,
      icon: <ShieldCheck className="h-6 w-6 text-gold-500" />,
      title: 'DUBAI SOURCED PRODUCTS',
      description: '100% authentic premium brands, fragrances, abayas, and footwear sourced directly from UAE boutiques and retail centers. We check each item for visual quality.'
    },
    {
      id: 2,
      icon: <Truck className="h-6 w-6 text-gold-500" />,
      title: 'SECURE COURIER TO ETHIOPIA',
      description: 'Weekly air freight dispatch safely from Dubai to our hubs in Addis Ababa, Hawassa, and Adama. Track your package dispatch in real time through our customer team.'
    },
    {
      id: 3,
      icon: <CreditCard className="h-6 w-6 text-gold-500" />,
      title: '50% DEPOSIT & 50% ON ARRIVAL',
      description: 'Zero upfront financial risk! Simply register your custom order on WhatsApp, pay a 50% deposit to confirm availability & shipping, and pay the remaining 50% after receiving your items.'
    },
    {
      id: 4,
      icon: <MessageCircle className="h-6 w-6 text-gold-500" />,
      title: '24/7 WHATSAPP ADVISORS',
      description: 'A genuine customer support executive handles your shopping list, suggesting current sizes, alternative colors, and giving premium order guides.'
    }
  ];

  const steps = [
    {
      id: '01',
      icon: <Search className="h-5 w-5 text-black" />,
      title: 'Customer Selects Item',
      description: 'Explore our clean digital showcase of premium Dubai wear, bags, and items. Pick your sizes and colors.'
    },
    {
      id: '02',
      icon: <MessageCircle className="h-5 w-5 text-black" />,
      title: 'Order via WhatsApp',
      description: 'Clicks checkout or direct buy. An elegant order breakdown generates automatically for you to send to us.'
    },
    {
      id: '03',
      icon: <FileText className="h-5 w-5 text-black" />,
      title: 'Confirm Availability',
      description: 'Our team goes on-site in Dubai to confirm actual physical stock sizes and styles at boutique malls.'
    },
    {
      id: '04',
      icon: <CreditCard className="h-5 w-5 text-black" />,
      title: 'Pay 50% Deposit',
      description: 'We send you clear bank deposit instructions. Pay 50% to confirm your order secure sourcing.'
    },
    {
      id: '05',
      icon: <Truck className="h-5 w-5 text-black" />,
      title: 'Purchase & Ship',
      description: 'We purchase the exact original products from official malls and dispatch them airfreight to Ethiopia.'
    },
    {
      id: '06',
      icon: <ShoppingBag className="h-5 w-5 text-black" />,
      title: 'Customer Receives Item',
      description: 'Confirm receipts securely when the package arrives directly at our hub locations in Addis Ababa.'
    },
    {
      id: '07',
      icon: <Check className="h-5 w-5 text-emerald-600 font-bold" />,
      title: 'Pay Remaining 50%',
      description: 'Inspect your items confidently and complete the remaining half of your purchase secure and happy.'
    }
  ];

  return (
    <div className="space-y-16 py-12 md:py-20 select-none">
      
      {/* 1. TRUST SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-6" id="trust-section">
        {/* Section title */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-10 md:mb-14">
          <span className="text-[#D4AF37] font-sans tracking-[0.25em] text-[10px] md:text-xs font-black uppercase block">
            Why Shop With Us
          </span>
          <h2 className="font-sans text-2xl md:text-3xl font-black tracking-tighter text-black uppercase leading-tight italic">
            Premium, Transparent Dubai Sourced Fashion
          </h2>
          <div className="h-[2px] w-14 bg-black mx-auto mt-2" />
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {trustBadges.map((badge) => (
            <div 
              key={badge.id} 
              className="bg-white p-5 md:p-6 border border-gray-100 rounded-none hover:border-black transition-all duration-300 space-y-4"
            >
              <div className="bg-[#D4AF37]/10 h-11 w-11 rounded-none flex items-center justify-center">
                {badge.icon}
              </div>
              <div className="space-y-2">
                <h3 className="font-sans font-black text-xs md:text-sm tracking-widest text-black uppercase">
                  {badge.title}
                </h3>
                <p className="font-sans text-xs text-neutral-500 leading-relaxed font-light uppercase tracking-wide">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION */}
      <section className="bg-neutral-50 py-12 md:py-20 border-y border-gray-100" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Section title */}
          <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-12 md:mb-16">
            <span className="text-[#D4AF37] font-sans tracking-[0.25em] text-[10px] md:text-xs font-black uppercase block">
              Easy Ordering Stream
            </span>
            <h2 className="font-sans text-2xl md:text-3xl font-black tracking-tighter text-black uppercase leading-tight italic">
              Our Dubai Sourcing Process, Explained
            </h2>
            <div className="h-[2px] w-14 bg-black mx-auto mt-2" />
          </div>

          {/* Steppers container */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((st) => (
              <div key={st.id} className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left space-y-4 max-w-xs mx-auto md:mx-0 bg-white p-5 border border-neutral-100 hover:border-black transition-all">
                {/* Round dial badge counts */}
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-black text-white rounded-none flex items-center justify-center font-sans font-black text-xs shadow-xs z-1">
                    {st.id}
                  </div>
                  {/* Subtle icon container */}
                  <div className="h-8 w-8 bg-[#D4AF37]/10 rounded-none flex items-center justify-center">
                    {st.icon}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-sans font-black text-[11px] tracking-widest text-black uppercase">
                    {st.title}
                  </h3>
                  <p className="font-sans text-xs text-neutral-500 leading-relaxed font-light uppercase tracking-wide">
                    {st.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Size assistance call-out banner */}
          <div className="mt-12 bg-white border border-gray-100 rounded-none p-5 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 max-w-4xl mx-auto">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-sans font-black text-xs tracking-[0.15em] text-black uppercase flex items-center justify-center sm:justify-start gap-1.5">
                <span className="h-2 w-2 rounded-none bg-[#D4AF37] inline-block animate-pulse" />
                <span>NOT SURE ABOUT SIZES OR DESIGN ACCURACY?</span>
              </p>
              <p className="font-sans text-xs text-neutral-500 max-w-xl font-light uppercase tracking-wide">
                Do not worry! Once you click Order, our team will review the size chart on UAE sites and verify measurements with you via real photos before final dispatch.
              </p>
            </div>
            <a
              href="https://wa.me/971552734073?text=Hello%20Dubai2Addis!%20I%20need%20help%20confirming%20size%20guides%20for%20an%20item%20I%20want%20to%20order."
              target="_blank"
              referrerPolicy="no-referrer"
              className="bg-black hover:bg-[#D4AF37] hover:text-black text-white px-5 py-2.5 rounded-none font-sans font-black text-[10px] uppercase tracking-widest transition-all shrink-0 active:scale-95 text-center block w-full sm:w-auto border border-black hover:border-[#D4AF37]"
            >
              Ask Our Size Guide
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
