/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ShoppingBag, 
  Link, 
  ShieldCheck, 
  Truck, 
  Check, 
  DollarSign, 
  Sparkles, 
  Users, 
  Search,
  CheckCircle,
  Clock,
  MapPin,
  HeartHandshake,
  MessageSquare
} from 'lucide-react';

export default function TrustAndProcess() {
  const stores = [
    { name: 'SHEIN', logoText: 'SHEIN', url: 'https://ae.shein.com', accent: 'border-black hover:bg-black hover:text-white' },
    { name: 'Temu', logoText: 'TEMU', url: 'https://www.temu.com/ae', accent: 'border-[#FB5B1B]/25 text-[#FB5B1B] hover:bg-[#FB5B1B] hover:text-white' },
    { name: 'Brands For Less', logoText: 'BFL', url: 'https://www.brandsforless.com/ae', accent: 'border-[#FDCB04]/30 text-[#e6b300] hover:bg-[#FDCB04] hover:text-black' },
    { name: 'Amazon AE', logoText: 'AMAZON', url: 'https://www.amazon.ae', accent: 'border-neutral-200 text-neutral-800 hover:bg-black hover:text-white' },
    { name: 'Noon', logoText: 'NOON', url: 'https://www.noon.com/uae-en', accent: 'border-[#FEE000]/35 text-neutral-900 hover:bg-[#FEE000]' },
  ];

  const steps = [
    {
      id: '01',
      icon: <Search className="h-5 w-5 text-[#C9A84C]" />,
      title: 'Browse products',
      description: 'Explore trending Dubai collections directly on our website or visit any of your favorite UAE online stores.'
    },
    {
      id: '02',
      icon: <Link className="h-5 w-5 text-[#C9A84C]" />,
      title: 'Send us the product link',
      description: 'Simply paste the product link in our website search or send it directly to our customer support team via WhatsApp.'
    },
    {
      id: '03',
      icon: <ShieldCheck className="h-5 w-5 text-[#C9A84C]" />,
      title: 'We purchase & quality check',
      description: 'Our on-the-ground team in Dubai purchases the exact original item and performs a strict physical quality inspection.'
    },
    {
      id: '04',
      icon: <Truck className="h-5 w-5 text-[#C9A84C]" />,
      title: 'We deliver safely to Ethiopia',
      description: 'We consolidate your cargo and ship it securely via express air freight directly to Addis Ababa and major regions.'
    }
  ];

  const whyChooseUs = [
    {
      icon: <Sparkles className="h-6 w-6 text-[#C9A84C]" />,
      title: 'Shop from trusted Dubai retailers',
      description: 'Get direct access to genuine inventory from Shein, Temu, BFL, Amazon, and official brand boutiques without high markups.'
    },
    {
      icon: <DollarSign className="h-6 w-6 text-[#C9A84C]" />,
      title: 'Transparent pricing',
      description: 'No hidden agent fees or unexpected charges. Know exactly what your product costs in Ethiopian Birr (ETB) before checkout.'
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-[#C9A84C]" />,
      title: 'Quality checked before shipping',
      description: 'We inspect every item physically at our Dubai warehouse. If we find any defects, we return it to the merchant instantly.'
    },
    {
      icon: <Truck className="h-6 w-6 text-[#C9A84C]" />,
      title: 'Reliable delivery',
      description: 'Weekly scheduled flights ensure your packages reach Ethiopia safely, avoiding random delay risks of independent travelers.'
    },
    {
      icon: <HeartHandshake className="h-6 w-6 text-[#C9A84C]" />,
      title: 'Fast customer support',
      description: 'Speak to real support executives who are happy to guide you with size charts, style recommendations, and order answers.'
    },
    {
      icon: <Clock className="h-6 w-6 text-[#C9A84C]" />,
      title: 'Order tracking',
      description: 'Enjoy complete peace of mind with continuous milestone notifications on your order from procurement to local dispatch.'
    }
  ];

  const trustPoints = [
    { title: 'Purchased directly from Dubai', desc: '100% original merchandise from official UAE retail channels.' },
    { title: 'Secure payment options', desc: 'Convenient local bank transfers with a secure deposit model.' },
    { title: 'Quality inspection before shipping', desc: 'Every product is hand-verified for sizes, defects, and colors.' },
    { title: 'Reliable delivery networks', desc: 'Insured cargo routes delivering safely to your hands in Ethiopia.' },
    { title: 'Friendly customer support', desc: 'Active communication to guide you through order specifications.' },
    { title: 'Order updates throughout delivery', desc: 'Stay updated with clear tracking from store-buy to Addis Ababa.' },
  ];

  return (
    <div className="space-y-16 md:space-y-24 py-12 md:py-20 select-none bg-white">
      
      {/* 2. TRUSTED STORES SECTION */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6" id="trusted-stores">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="text-[#C9A84C] font-sans tracking-[0.25em] text-[10px] md:text-xs font-black uppercase block">
            Direct Retail Access
          </span>
          <h2 className="font-sans text-2xl md:text-3xl font-black tracking-tighter text-black uppercase leading-tight italic">
            Shop Your Favorite Dubai Stores
          </h2>
          <div className="h-[2px] w-14 bg-black mx-auto mt-2" />
        </div>

        <p className="text-center text-sm text-neutral-500 max-w-2xl mx-auto mb-8 font-light uppercase tracking-wide leading-relaxed">
          Get direct access to thousands of original brands. Simply browse these platforms or send us any product link to purchase.
        </p>

        {/* Brand Logos Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {stores.map((store) => (
            <a 
              key={store.name}
              href={store.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center justify-center p-6 border bg-neutral-50 transition-all duration-300 rounded-[8px] group ${store.accent}`}
            >
              <span className="font-sans text-lg font-black tracking-widest text-neutral-800 group-hover:text-inherit">
                {store.logoText}
              </span>
              <span className="text-[10px] text-neutral-400 font-medium tracking-wider mt-1.5 group-hover:text-inherit uppercase">
                {store.name}
              </span>
            </a>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-neutral-400 font-medium uppercase tracking-widest">
            ✦ And many other Dubai retailers! We can source from any online store in the UAE.
          </p>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="bg-neutral-50 py-16 md:py-24 border-y border-gray-100" id="how-it-works">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12 md:mb-16">
            <span className="text-[#C9A84C] font-sans tracking-[0.25em] text-[10px] md:text-xs font-black uppercase block">
              Effortless Procurement
            </span>
            <h2 className="font-sans text-2xl md:text-3xl font-black tracking-tighter text-black uppercase leading-tight italic">
              How It Works
            </h2>
            <div className="h-[2px] w-14 bg-black mx-auto mt-2" />
          </div>

          {/* Steppers container */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((st) => (
              <div 
                key={st.id} 
                className="relative flex flex-col items-start bg-white p-6 border border-neutral-100 rounded-[12px] hover:border-black hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between w-full mb-5">
                  <div className="h-9 w-9 bg-neutral-950 text-white rounded-[6px] flex items-center justify-center font-sans font-black text-xs">
                    {st.id}
                  </div>
                  <div className="h-9 w-9 bg-[#C9A84C]/10 rounded-[6px] flex items-center justify-center">
                    {st.icon}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-sans font-bold text-sm text-neutral-900 leading-tight">
                    {st.title}
                  </h3>
                  <p className="font-sans text-xs text-neutral-500 leading-relaxed font-light tracking-wide">
                    {st.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Sourcing Callout */}
          <div className="mt-12 bg-white border border-gray-100 rounded-[12px] p-6 flex flex-col sm:flex-row justify-between items-center gap-4 max-w-4xl mx-auto shadow-xs">
            <div className="space-y-1 text-center sm:text-left">
              <p className="font-sans font-bold text-xs tracking-wider text-neutral-900 uppercase">
                Have a specific product link to submit?
              </p>
              <p className="font-sans text-xs text-neutral-500 max-w-xl font-light">
                Simply paste any URL in our top search bar, or send it directly over WhatsApp. We will generate your price estimation in Birr instantly.
              </p>
            </div>
            <a
              href="https://wa.me/251911000000?text=Hello%20AddisDubai!%20I%20have%20product%20links%20from%20Dubai%20stores%20I%20would%20like%20to%20order."
              target="_blank"
              referrerPolicy="no-referrer"
              className="bg-black hover:bg-[#C9A84C] hover:text-black text-white px-6 py-3 rounded-[6px] font-sans font-bold text-xs uppercase tracking-wider transition-all duration-200 shrink-0 text-center block w-full sm:w-auto active:scale-95"
            >
              Order via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE US SECTION */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-6" id="why-choose-us">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12 md:mb-16">
          <span className="text-[#C9A84C] font-sans tracking-[0.25em] text-[10px] md:text-xs font-black uppercase block">
            The Smart Sourcing Choice
          </span>
          <h2 className="font-sans text-2xl md:text-3xl font-black tracking-tighter text-black uppercase leading-tight italic">
            Why Choose Us
          </h2>
          <div className="h-[2px] w-14 bg-black mx-auto mt-2" />
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {whyChooseUs.map((benefit, idx) => (
            <div 
              key={idx}
              className="bg-white p-6 border border-neutral-100 rounded-[12px] hover:border-[#C9A84C] hover:shadow-md transition-all duration-300 flex flex-col space-y-4"
            >
              <div className="bg-[#C9A84C]/10 h-11 w-11 rounded-[6px] flex items-center justify-center shrink-0">
                {benefit.icon}
              </div>
              <div className="space-y-2">
                <h3 className="font-sans font-bold text-sm text-neutral-900">
                  {benefit.title}
                </h3>
                <p className="font-sans text-xs text-neutral-500 leading-relaxed font-light tracking-wide">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. WHY CUSTOMERS TRUST US SECTION */}
      <section className="bg-neutral-950 text-white py-16 md:py-24 border-y border-neutral-900" id="trust-details">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12 md:mb-16">
            <span className="text-[#C9A84C] font-sans tracking-[0.25em] text-[10px] md:text-xs font-black uppercase block">
              100% Reliable Shopper
            </span>
            <h2 className="font-sans text-2xl md:text-3xl font-black tracking-tighter text-white uppercase leading-tight italic">
              Why Customers Trust Us
            </h2>
            <div className="h-[2px] w-14 bg-[#C9A84C] mx-auto mt-2" />
          </div>

          {/* Grid Layout of Pointers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {trustPoints.map((point, index) => (
              <div key={index} className="flex gap-4">
                <div className="mt-1 h-5 w-5 rounded-full bg-[#C9A84C]/20 flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5 text-[#C9A84C] stroke-[3px]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-sans font-bold text-sm text-white">
                    {point.title}
                  </h4>
                  <p className="font-sans text-xs text-neutral-400 font-light leading-relaxed">
                    {point.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
