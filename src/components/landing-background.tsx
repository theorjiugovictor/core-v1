'use client';

import React from 'react';

/**
 * Modern architectural background:
 * - Pure Paper (#F5F6F8) foundation
 * - Subtle hairline grid with coordinate markers
 * - Soft, directional ambient light sweeps in Indigo (#1E2A6B) and Cowrie (#FFC53D)
 * - Zero artificial heavy vignettes or cluttered floating elements
 */
export function LandingBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Precision architectural hairline grid on Paper */}
      <div 
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(223 15% 91% / 0.8) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(223 15% 91% / 0.8) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Subtle top-center directional ambient glow (Indigo to warm Cowrie) */}
      <div 
        className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full blur-[140px] opacity-40"
        style={{
          background: 'radial-gradient(ellipse at center, hsl(231 56% 27% / 0.18) 0%, hsl(42 100% 62% / 0.1) 45%, transparent 70%)',
        }}
      />

      {/* Subtle bottom-right counter-light */}
      <div 
        className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] rounded-full blur-[160px] opacity-25"
        style={{
          background: 'radial-gradient(circle, hsl(231 56% 27% / 0.15) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
