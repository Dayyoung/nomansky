import React from 'react';
import { MilestoneBannerData } from '../types/banner';
import { Sparkles, Compass, Award } from 'lucide-react';

interface CinematicMilestoneBannerProps {
  banner: MilestoneBannerData | null;
}

export const CinematicMilestoneBanner: React.FC<CinematicMilestoneBannerProps> = ({ banner }) => {
  if (!banner) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-16 sm:top-20 z-50 pointer-events-none flex flex-col items-center justify-center animate-in fade-in slide-in-from-top-6 duration-500 ease-out"
    >
      {/* Cinematic Ultra-Widescreen Letterbox Banner */}
      <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Top Gold Geometric Accent Line */}
        <div className="w-48 sm:w-80 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_rgba(251,191,36,0.8)]" />

        {/* Main Pillar Banner Backdrop */}
        <div className="w-full bg-gradient-to-r from-transparent via-black/92 to-transparent backdrop-blur-md px-6 sm:px-12 py-3.5 sm:py-5 flex flex-col items-center text-center">
          {/* Category Tag & Rank */}
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-amber-300 uppercase shadow-sm">
              {banner.category}
            </span>
            {banner.rank && (
              <span className="px-2 py-0.5 rounded-sm bg-amber-500/20 border border-amber-400/40 text-[9px] sm:text-[10px] font-mono text-amber-200 tracking-wider">
                {banner.rank}
              </span>
            )}
          </div>

          {/* Majestic Title in Authentic NMS Sci-Fi Typography */}
          <h1
            className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-[0.18em] uppercase text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)] font-sans"
            style={{
              textShadow: `0 0 20px ${banner.color || '#38bdf8'}80, 0 2px 4px rgba(0,0,0,0.8)`
            }}
          >
            {banner.title}
          </h1>

          {/* Subtitle / Narrative Discovery Details */}
          <p className="mt-1 text-[11px] sm:text-sm font-mono text-slate-300 tracking-[0.12em] max-w-2xl text-center opacity-90">
            {banner.subTitle}
          </p>
        </div>

        {/* Bottom Gold Geometric Accent Line with Diamond Centerpiece */}
        <div className="relative flex items-center justify-center w-full">
          <div className="w-64 sm:w-96 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
          <div className="absolute w-2.5 h-2.5 bg-amber-400 rotate-45 shadow-[0_0_8px_#f59e0b]" />
        </div>
      </div>
    </div>
  );
};
