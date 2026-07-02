/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageCircle, 
  Instagram, 
  Compass, 
  ShieldCheck, 
  Globe
} from 'lucide-react';
import { StoreSettings } from '../types';

interface FooterProps {
  storeSettings?: StoreSettings;
  onSelectCategory: (categoryId: string) => void;
}

export default function Footer({ storeSettings, onSelectCategory }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 text-neutral-400 font-sans text-xs select-none border-t border-neutral-900" id="footer">
      
      {/* 1. Main Footer Grid */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-12 md:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 border-b border-neutral-900">
        
        {/* Branding & description block */}
        <div className="space-y-4">
          <div className="flex flex-col">
            <span className="font-sans text-xl font-black tracking-tighter text-white">
              {storeSettings?.siteName || 'ADDISDUBAI'}
            </span>
            <span className="text-[9px] tracking-[0.3em] text-[#D4AF37] uppercase font-extrabold mt-1 block">
              FASHION HOUSE
            </span>
          </div>
          <p className="font-light text-[11px] leading-relaxed text-neutral-500">
            Sourcing premium fashion apparel, abayas, signature handbags, rhinestone heels, watches, and designer perfumes directly from UAE retailers and malls to your hands in Ethiopia.
          </p>
          <div className="flex items-center gap-2.5 pt-1.5">
            {/* Telegram */}
            <a 
              href="https://t.me/goodtinsae" 
              target="_blank" 
              referrerPolicy="no-referrer"
              className="h-8 w-8 bg-neutral-900 hover:bg-gold-500 hover:text-black rounded-none flex items-center justify-center transition-colors border border-neutral-800 text-neutral-300"
              title="Telegram Channel"
            >
              <Send className="h-4 w-4" />
            </a>
            {/* Instagram */}
            <a 
              href="https://instagram.com" 
              target="_blank" 
              referrerPolicy="no-referrer"
              className="h-8 w-8 bg-neutral-900 hover:bg-gold-500 hover:text-black rounded-none flex items-center justify-center transition-colors border border-neutral-800 text-neutral-300"
              title="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
            {/* WhatsApp */}
            <a 
              href="https://wa.me/971552734073" 
              target="_blank" 
              referrerPolicy="no-referrer"
              className="h-8 w-8 bg-neutral-900 hover:bg-emerald-500 hover:text-white rounded-none flex items-center justify-center transition-colors border border-neutral-800 text-neutral-300"
              title="WhatsApp Chat Sourcing"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Quick Sourcing categories */}
        <div className="space-y-4">
          <h3 className="text-white text-xs font-extrabold uppercase tracking-widest font-sans">
            Sourcing Departments
          </h3>
          <ul className="space-y-2.5 font-sans font-medium text-neutral-500">
            <li>
              <button onClick={() => onSelectCategory('dresses')} className="hover:text-gold-500 transition-colors cursor-pointer text-left">
                Elegant Evening Dresses
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('abayas')} className="hover:text-gold-500 transition-colors cursor-pointer text-left">
                Embroidery Abayas & Modest Hijabs
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('handbags')} className="hover:text-gold-500 transition-colors cursor-pointer text-left">
                Authentic Designer Handbags
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('shoes')} className="hover:text-gold-500 transition-colors cursor-pointer text-left">
                Glass Crystal Rhinestone Heels
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('watches')} className="hover:text-gold-500 transition-colors cursor-pointer text-left">
                Luxury Timepieces & Watches
              </button>
            </li>
            <li>
              <button onClick={() => onSelectCategory('beauty')} className="hover:text-gold-500 transition-colors cursor-pointer text-left">
                Signature Arabian Oud Perfumes
              </button>
            </li>
          </ul>
        </div>

        {/* Customer policy list */}
        <div className="space-y-4">
          <h3 className="text-white text-xs font-extrabold uppercase tracking-widest font-sans">
            Customer Care & Policies
          </h3>
          <ul className="space-y-2.5 font-sans font-medium text-neutral-500">
            <li>
              <a href="#how-it-works" className="hover:text-gold-500 transition-colors">How Dubai Sourcing Works</a>
            </li>
            <li>
              <a href="#trust-section" className="hover:text-gold-500 transition-colors">Delivery Timeline (Addis & Regions)</a>
            </li>
            <li>
              <a href="#lifestyle" className="hover:text-gold-500 transition-colors">WhatsApp Order Verification</a>
            </li>
            <li>
              <a href="#footer" className="hover:text-gold-500 transition-colors">Safety Refund Policy on Arrival</a>
            </li>
            <li>
              <a href="#footer" className="hover:text-gold-500 transition-colors">Active Custom Sourcing Form</a>
            </li>
            <li>
              <a href="#footer" className="hover:text-gold-500 transition-colors">Terms of Exchange rate checks</a>
            </li>
          </ul>
        </div>

        {/* Contact and address */}
        <div className="space-y-4">
          <h3 className="text-white text-xs font-extrabold uppercase tracking-widest font-sans">
            Bole Office & Sourcing Hub
          </h3>
          <ul className="space-y-3 text-[11px] text-neutral-500">
            <li className="flex items-start gap-2">
              <MapPin className="h-4.5 w-4.5 text-gold-500 shrink-0 mt-0.5" />
              <span>
                Ethiopia Hub: Bole Road, Premium Towers, 4th Floor, Addis Ababa, Ethiopia.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Compass className="h-4.5 w-4.5 text-gold-500 shrink-0 mt-0.5" />
              <span>
                UAE Logistics: Deira Sourcing Center, Creek Plaza, Deira, Dubai, UAE.
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-emerald-500" />
              <span>WhatsApp Chat: <a href={`https://wa.me/${(storeSettings?.whatsappNumber || '971552734073').replace(/[^0-9]/g, '')}`} target="_blank" referrerPolicy="no-referrer" className="hover:text-white transition-colors">{storeSettings?.whatsappNumber || '+971 55 273 4073'}</a></span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gold-500" />
              <span>Call Support: <a href="tel:+251909319951" className="hover:text-white transition-colors">+251 909 319 951</a></span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gold-500" />
              <span>{storeSettings?.supportEmail || 'support@addisdubai.com'}</span>
            </li>
          </ul>
        </div>

      </div>

      {/* 2. Sourcing warning and legal declarations wrapper */}
      <div className="bg-neutral-950/65 text-[10px] py-6 px-4 border-b border-neutral-900 select-none">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-neutral-600 font-sans text-center md:text-left">
          <div className="flex flex-col gap-1">
            <span className="text-neutral-400 font-bold block flex items-center justify-center md:justify-start gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              DUBAI MALLS INTEGRATION DESK
            </span>
            <span>
              All displayed luxury product designs, logos, and specific trademarks (e.g., SHEIN, Brands For Less, Dubai Outlet deals, Temu Finds) remain proprietary to their respected copyright holder. We act as independent on-behalf shoppers, buying directly in retail stores and delivering with air-cargo agents.
            </span>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 select-none bg-white/5 border border-white/5 p-2 rounded">
            <Globe className="h-3.5 w-3.5 text-gold-500" />
            <span className="font-bold text-neutral-300">Direct Sourcing & Secure Air Courier</span>
          </div>
        </div>
      </div>

      {/* 3. Credits & copyright */}
      <div className="bg-neutral-950 py-4 text-center text-neutral-600 text-[10px] select-none">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {currentYear} AddisDubai Fashion Brand Sourcing Platform. Sourced and delivered with confidence.</p>
          <div className="flex items-center gap-4">
            <a href="#footer" className="hover:text-neutral-400">Privacy Policy</a>
            <span>•</span>
            <a href="#footer" className="hover:text-neutral-400">Terms & Conditions</a>
          </div>
        </div>
      </div>

    </footer>
  );
}
