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
      className="fixed inset-x-0 top-12 xs:top-13 sm:top-16 z-50 pointer-events-none flex flex-col items-center justify-center animate-in fade-in slide-in-from-top-4 duration-500 ease-out px-2"
    >
      {/* Cinematic Ultra-Widescreen Letterbox Banner (모바일 최적화 슬림형) */}
      <div className="relative w-full max-w-3xl mx-auto flex flex-col items-center">
        {/* Top Gold Geometric Accent Line */}
        <div className="w-36 sm:w-80 h-[1px] sm:h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_rgba(251,191,36,0.8)]" />

        {/* Main Pillar Banner Backdrop */}
        <div className="w-full bg-gradient-to-r from-transparent via-black/90 to-transparent backdrop-blur-md px-4 sm:px-10 py-1.5 xs:py-2 sm:py-3.5 flex flex-col items-center text-center">
          {/* Category Tag & Rank */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[8.5px] xs:text-[9.5px] sm:text-xs font-mono font-bold tracking-[0.2em] text-amber-300 uppercase shadow-sm">
              {banner.category}
            </span>
            {banner.rank && (
              <span className="px-1.5 py-0.2 rounded-sm bg-amber-500/20 border border-amber-400/40 text-[8px] xs:text-[9px] sm:text-[10px] font-mono text-amber-200 tracking-wider">
                {banner.rank}
              </span>
            )}
          </div>

          {/* Majestic Title in Authentic NMS Sci-Fi Typography */}
          <h1
            className="text-sm xs:text-base sm:text-2xl md:text-3xl font-extrabold tracking-[0.14em] uppercase text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] font-sans"
            style={{
              textShadow: `0 0 16px ${banner.color || '#38bdf8'}80, 0 2px 4px rgba(0,0,0,0.8)`
            }}
          >
            {banner.title}
          </h1>

          {/* Subtitle / Narrative Discovery Details */}
          <p className="mt-0.5 text-[9px] xs:text-[10.5px] sm:text-xs font-mono text-slate-300 tracking-[0.08em] max-w-xl text-center opacity-90 truncate">
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
