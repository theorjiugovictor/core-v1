'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EarlyAccessModal } from '@/components/early-access-modal';
import arikePhoto from '../../assets/marketing-images/Thrift seller packing orders.png';
import mamaEmekaPhoto from '../../assets/marketing-images/Shop owner closing the day\'s books.jpeg';
import nexaPhoto from '../../assets/marketing-images/Food vendor on the move.png';
import fabricPhoto from '../../assets/marketing-images/Woman selling frabric, chatting with core.jpeg';
import sneakerPhoto from '../../assets/marketing-images/Sneaker reseller.png';
import lashPhoto from '../../assets/marketing-images/Lash tech between clients.png';
import productPhoto from '../../assets/marketing-images/Close-up product moment.png';
import founderPhoto from '../../assets/marketing-images/Young founder, modern SME.png';
import friendsPhoto from '../../assets/marketing-images/Friends running a brand together.png';

const businesses = [
  { name: 'Arike Pre-order', photo: arikePhoto, alt: 'Seller packing customer orders' },
  { name: 'Papa Emeka', photo: mamaEmekaPhoto, alt: 'Shop owner reviewing daily records' },
  { name: 'Nexa Kitchen', photo: nexaPhoto, alt: 'Food vendor carrying orders' },
  { name: 'Bisi & Co.', photo: fabricPhoto, alt: 'Fabric seller using her phone at her stall' },
  { name: 'Tobi Sneakers', photo: sneakerPhoto, alt: 'Sneaker reseller with merchandise' },
  { name: 'Zee Studio', photo: lashPhoto, alt: 'Lash technician between appointments' },
  { name: "Oyin's Place", photo: productPhoto, alt: 'Products prepared for sale' },
  { name: 'Face Essential by K', photo: founderPhoto, alt: 'Founder working on a business' },
  { name: 'New-Gen Street Wears', photo: friendsPhoto, alt: 'Friends building a business together' },
];

export function RotatingHero() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer: ReturnType<typeof setInterval> | undefined;

    const updateTimer = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
      if (!motionPreference.matches) {
        timer = setInterval(() => setActiveIndex(index => (index + 1) % businesses.length), 6000);
      }
    };

    updateTimer();
    motionPreference.addEventListener('change', updateTimer);
    return () => {
      if (timer) clearInterval(timer);
      motionPreference.removeEventListener('change', updateTimer);
    };
  }, []);

  return (
    <section className="relative isolate flex min-h-[540px] sm:min-h-[600px] items-end overflow-hidden bg-[#142821] px-5 pb-12 pt-20 text-white sm:px-10 sm:pb-16 lg:px-16">
      {businesses.map((business, index) => (
        <div key={business.name} className={`absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none ${index === activeIndex ? 'opacity-100' : 'opacity-0'}`} aria-hidden={index !== activeIndex}>
          <Image src={business.photo} alt={index === activeIndex ? business.alt : ''} fill priority={index === 0} sizes="100vw" className="object-cover object-center" />
        </div>
      ))}
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#101b18]/95 via-[#101b18]/70 to-[#101b18]/15 max-sm:bg-gradient-to-t max-sm:from-[#101b18]/95 max-sm:via-[#101b18]/65 max-sm:to-[#101b18]/10" />
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <div className="relative mb-5 h-6">
          {businesses.map((business, index) => (
            <div key={business.name} aria-hidden={index !== activeIndex} className={`absolute inset-0 flex items-center transition-opacity duration-1000 motion-reduce:transition-none ${index === activeIndex ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-sm leading-6 text-white/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.75)]">
                Built for <em className="font-serif text-[15px] font-normal text-white sm:text-base">{business.name}</em>
              </p>
            </div>
          ))}
        </div>
        <h1 className="font-display max-w-3xl text-[clamp(2.9rem,6vw,5.8rem)] leading-[1.04] text-balance">
          CORE makes every sale make sense.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/90 sm:text-xl">
          Record a sale with a message or voice note. Know your profit, your stock, and who still owes you.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <EarlyAccessModal>
            <Button size="lg" className="h-12 gap-2 rounded-md bg-accent px-7 text-sm font-semibold text-accent-foreground hover:bg-accent/90 sm:text-base">
              Request early access <ArrowRight className="h-4 w-4" />
            </Button>
          </EarlyAccessModal>
          <span className="text-xs font-mono text-white/80">Private beta · Limited onboarding</span>
        </div>
      </div>
    </section>
  );
}