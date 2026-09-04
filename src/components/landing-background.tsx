'use client';

import React from 'react';

/**
 * Modern, spacious architectural background:
 * - Pure Paper tactile canvas with high-key white luminous sheen
 * - Precision architectural hairline grid (subtle 0.25 opacity)
 * - Ultra-soft moving ambient glow (Indigo #1E2A6B and Cowrie #FFC53D) drifting slowly behind content
 * - Elevated, radiant depth without heavy vignettes
 */
export function LandingBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Precision architectural hairline grid on Paper */}
      <div 
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(223 15% 88% / 0.7) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(223 15% 88% / 0.7) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
        }}
      />

      {/* High-key luminous center sheen: makes the white background radiant & polished */}
      <div 
        className="absolute -top-36 left-1/2 -translate-x-1/2 w-[1200px] h-[750px] rounded-full blur-[140px] pointer-events-none opacity-85"
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 45%, transparent 75%)',
        }}
      />

      {/* Subtle moving Indigo ambient glow orb (18s slow drift) */}
      <div 
        className="absolute -top-24 left-1/2 w-[920px] h-[580px] rounded-full blur-[150px] pointer-events-none opacity-65 animate-glow-1"
        style={{
          background: 'radial-gradient(circle, hsl(231 56% 27% / 0.08) 0%, hsl(230 65% 54% / 0.03) 45%, transparent 70%)',
        }}
      />

      {/* Subtle moving Cowrie gold ambient glow orb (24s counter drift) */}
      <div 
        className="absolute top-24 left-1/2 w-[820px] h-[500px] rounded-full blur-[160px] pointer-events-none opacity-55 animate-glow-2"
        style={{
          background: 'radial-gradient(circle, hsl(42 100% 62% / 0.06) 0%, hsl(42 100% 62% / 0.015) 50%, transparent 75%)',
        }}
      />
    </div>
  );
}
