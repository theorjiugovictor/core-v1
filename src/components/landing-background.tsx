'use client';

import React, { useEffect, useState } from 'react';

export function LandingBackground() {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dynamic interactive spotlight following cursor */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 transition-transform duration-700 ease-out"
        style={{
          background: 'radial-gradient(circle, hsl(231 56% 27% / 0.4) 0%, hsl(42 100% 62% / 0.15) 50%, transparent 80%)',
          left: mousePos.x - 300,
          top: mousePos.y - 300,
        }}
      />

      {/* Subtle architectural dot-matrix pattern on Paper */}
      <div 
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: 'radial-gradient(hsl(231 56% 27% / 0.18) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Ambient gradient sweeps */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[400px] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
      <div className="absolute top-[35%] right-[-5%] w-[450px] h-[450px] rounded-full bg-accent/8 blur-[130px] animate-pulse [animation-delay:3s]" />
      <div className="absolute bottom-[10%] left-[-5%] w-[550px] h-[400px] rounded-full bg-primary/6 blur-[140px] animate-pulse [animation-delay:1.5s]" />

      {/* Subtle floating transaction telemetry badges (Background Depth) */}
      <div className="hidden lg:block absolute top-[18%] left-[8%] animate-fade-in-up [animation-duration:6s] opacity-70">
        <div className="px-3 py-1.5 rounded-lg border border-border bg-card/80 shadow-sm text-xs font-mono tabular flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success"></span>
          <span className="text-muted-foreground">Sale:</span>
          <span className="font-bold text-success">+₦45,000</span>
          <span className="text-muted-foreground text-[10px]">Indomie x10</span>
        </div>
      </div>

      <div className="hidden lg:block absolute top-[28%] right-[7%] animate-fade-in-up [animation-duration:8s] opacity-70">
        <div className="px-3 py-1.5 rounded-lg border border-border bg-card/80 shadow-sm text-xs font-mono tabular flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary"></span>
          <span className="text-muted-foreground">Stock Auto-Deduct:</span>
          <span className="font-bold text-foreground">-5 Bags Rice</span>
        </div>
      </div>

      <div className="hidden lg:block absolute top-[65%] left-[5%] animate-fade-in-up [animation-duration:7s] opacity-60">
        <div className="px-3 py-1.5 rounded-lg border border-border bg-card/80 shadow-sm text-xs font-mono tabular flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success"></span>
          <span className="text-muted-foreground">Transfer Verified:</span>
          <span className="font-bold text-success">₦12,500</span>
          <span className="text-[10px] text-muted-foreground">OPay</span>
        </div>
      </div>

      <div className="hidden lg:block absolute top-[75%] right-[10%] animate-fade-in-up [animation-duration:9s] opacity-60">
        <div className="px-3 py-1.5 rounded-lg border border-border bg-card/80 shadow-sm text-xs font-mono tabular flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent"></span>
          <span className="text-muted-foreground">Debt Cleared:</span>
          <span className="font-bold text-foreground">₦30,000</span>
          <span className="text-[10px] text-muted-foreground">Emeka</span>
        </div>
      </div>
    </div>
  );
}
