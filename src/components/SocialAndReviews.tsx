/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TESTIMONIALS, SOCIAL_GALLERY } from '../data/products';
import { 
  Star, 
  Quote, 
  MapPin, 
  CheckCircle, 
  Instagram, 
  Sparkles, 
  MessageCircle,
  TrendingUp,
  Award,
  Users,
  Building
} from 'lucide-react';

export default function SocialAndReviews() {
  const stats = [
    {
      id: 1,
      icon: <Award className="h-5 w-5 text-gold-500" />,
      value: '7,400+',
      label: 'Products Delivered',
      description: 'Sourced from UAE malls to Addis'
    },
    {
      id: 2,
      icon: <Users className="h-5 w-5 text-gold-500" />,
      value: '4,800+',
      label: 'Happy Fashion Clients',
      description: 'Repeat shoppers in Ethiopia'
    },
    {
      id: 3,
      icon: <TrendingUp className="h-5 w-5 text-gold-500" />,
      value: '14,200+',
      label: 'Sourced Items Fulfilled',
      description: 'Dresses, Bags, Oud & Heels'
    },
    {
      id: 4,
      icon: <Building className="h-5 w-5 text-gold-500" />,
      value: '6',
      label: 'Major Cities Served',
      description: 'Addis, Hawassa, Adama, & more'
    }
  ];

  return (
    <div className="space-y-16 py-12 md:py-20 bg-white select-none">
      
      {/* 1. CUSTOMER TESTIMONIALS SECTION */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6" id="testimonials">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-10 md:mb-14">
          <span className="text-[#D4AF37] font-sans tracking-[0.25em] text-[10px] md:text-xs font-black uppercase block">
            Verified Reviews
          </span>
          <h2 className="font-sans text-2xl md:text-3xl font-black tracking-tighter text-black uppercase leading-tight italic">
            Loved By Ethiopian Shoppers
          </h2>
          <div className="h-[2px] w-14 bg-black mx-auto mt-2" />
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {TESTIMONIALS.map((test) => (
            <div 
              key={test.id}
              className="bg-[#fafafa] border border-gray-100 rounded-none p-6 hover:border-black transition-all duration-300 flex flex-col justify-between space-y-6 relative"
            >
              {/* Double Quote decorative sign */}
              <Quote className="absolute top-6 right-6 h-10 w-10 text-neutral-200/60 pointer-events-none stroke-1" />

              {/* Verified review texts */}
              <div className="space-y-3 relative z-1">
                {/* Visual stars ranking count */}
                <div className="flex items-center text-[#D4AF37] gap-0.5">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-[#D4AF37]" />
                  ))}
                </div>
                <p className="font-sans text-xs md:text-sm text-neutral-600 leading-relaxed font-light italic uppercase tracking-wider">
                  "{test.text}"
                </p>
              </div>

              {/* Customer description */}
              <div className="flex items-center gap-3.5 border-t border-neutral-200/55 pt-4">
                <img 
                  src={test.avatar} 
                  alt={test.name} 
                  referrerPolicy="no-referrer"
                  className="h-11 w-11 rounded-none object-cover border border-neutral-200" 
                />
                <div className="space-y-0.5 font-sans">
                  <h4 className="font-black text-xs text-neutral-900 flex items-center gap-1 uppercase tracking-wide">
                    <span>{test.name}</span>
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500/5 shrink-0" />
                  </h4>
                  <div className="flex items-center text-[9px] text-neutral-500 font-bold uppercase tracking-wider gap-1">
                    <MapPin className="h-3 w-3 text-[#D4AF37]" />
                    <span>{test.location}</span>
                    <span>•</span>
                    <span>{test.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. SOCIAL PROOF COUNTER */}
      <section className="bg-neutral-950 text-white py-12 md:py-16 border-y border-neutral-900">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 divide-y-0 divide-x divide-neutral-800 text-center">
            {stats.map((st) => (
              <div key={st.id} className="space-y-1.5 md:space-y-2 py-4 md:py-0">
                <div className="inline-flex h-9 w-9 bg-neutral-900 border border-neutral-800 rounded-none items-center justify-center mb-1">
                  {st.icon}
                </div>
                <p className="font-sans text-2xl md:text-3xl font-black text-[#D4AF37] tracking-tight leading-none uppercase">
                  {st.value}
                </p>
                <div className="space-y-0.5 px-2">
                  <p className="font-sans font-extrabold text-xs text-neutral-200 uppercase tracking-widest">
                    {st.label}
                  </p>
                  <p className="font-sans text-[9px] text-neutral-400 font-bold uppercase tracking-widest">
                    {st.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SNAPCHAT / INSTAGRAM LOOKBOOK GALLERY */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6" id="lifestyle">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5 mb-10 md:mb-14">
          <span className="text-[#D4AF37] font-sans tracking-[0.25em] text-[10px] md:text-xs font-black uppercase block">
            @AddisDubaiFashion
          </span>
          <h2 className="font-sans text-2xl md:text-3xl font-black tracking-tighter text-black uppercase leading-tight italic">
            Style Inspiration Lookbook
          </h2>
          <div className="h-[2px] w-14 bg-black mx-auto mt-2" />
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {SOCIAL_GALLERY.map((imgUrl, idx) => (
            <div 
              key={idx}
              className="group relative aspect-square bg-neutral-100 rounded-none overflow-hidden border border-neutral-150 shadow-xs"
            >
              <img 
                src={imgUrl} 
                alt="Dubai Sourced look" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 rounded-none" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-[#ffffff]">
                <Instagram className="h-6 w-6 stroke-2 text-[#D4AF37] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. PREMIUM CONVERSATIONAL WHATSAPP BANNER */}
      <section className="max-w-4xl mx-auto px-4 md:px-6" id="whatsapp-order-section">
        <div className="bg-neutral-950 text-white rounded-none p-6 md:p-10 shadow-xl border border-neutral-800 space-y-6 relative overflow-hidden">
          {/* Subtle backgrounds vector circles */}
          <div className="absolute -top-16 -right-16 h-48 w-48 bg-[#D4AF37]/5 rounded-none blur-2xl" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 bg-emerald-500/5 rounded-none blur-2xl" />

          <div className="text-center space-y-3.5 relative z-1">
            <span className="text-[#D4AF37] font-sans tracking-widest text-[10px] font-black uppercase bg-neutral-900 border border-neutral-800 px-3.5 py-1.5 rounded-none inline-block">
              💬 SOURCING ANYTHING FROM DUBAI 💬
            </span>
            <h2 className="font-sans text-2xl md:text-3xl font-black tracking-tighter text-[#ffffff] uppercase leading-tight italic">
              Ready To Shop Personal Dubai Fashion?
            </h2>
            <p className="font-sans text-xs text-neutral-300 leading-relaxed max-w-xl mx-auto font-light uppercase tracking-wide">
              Found a dress on SHEIN, a bag on Namshi, or a watch in Dubai Mall that is not in our live list? Send us the links or screenshots! We will procure, verify, and deliver them to your hands in Ethiopia.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-1 select-none pt-2">
            <a
              href="https://wa.me/251911000000?text=Hello%20AddisDubai!%20I%20have%20custom%20links%20and%20screenshots%20of%20items%20I%20want%20to%20source%20directly%20from%20Dubai."
              target="_blank"
              referrerPolicy="no-referrer"
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-[#ffffff] font-sans font-black text-[10px] tracking-widest uppercase py-4 px-8 rounded-none flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer border border-[#D4AF37]/10"
              id="whatsapp-custom-order-btn"
            >
              <MessageCircle className="h-4.5 w-4.5 fill-white/10" />
              <span>Inquire Sourcing on WhatsApp</span>
            </a>
            
            <a
              href="https://t.me/goodtinsae"
              target="_blank"
              referrerPolicy="no-referrer"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/20 hover:border-[#D4AF37] px-7 py-4 rounded-none text-[10px] font-sans tracking-widest font-black uppercase flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Join Telegram channel</span>
            </a>
          </div>

          <div className="text-center font-sans text-[9px] uppercase font-bold text-neutral-400">
            Delivery across Ethiopia. Secured pay on handoff in Birr (ETB) based on real-time transparent rate checks.
          </div>
        </div>
      </section>
    </div>
  );
}
