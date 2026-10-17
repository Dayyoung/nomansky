import React from 'react';
import { MilestoneBannerData } from '../types/banner';

interface CinematicMilestoneBannerProps {
  banner: MilestoneBannerData | null;
}

export const CinematicMilestoneBanner: React.FC<CinematicMilestoneBannerProps> = ({ banner }) => {
  if (!banner) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-20 sm:top-22 z-40 pointer-events-none flex justify-center px-3 animate-in fade-in duration-300"
    >
      <div className="bg-slate-950/80 backdrop-blur-md border border-amber-400/40 rounded-full px-3.5 py-1 flex items-center gap-2 shadow-md max-w-[90vw]">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-300 uppercase shrink-0">
          {banner.category.split('//')[0].trim()}
        </span>
        <span className="text-[10.5px] sm:text-xs font-extrabold text-white truncate">
          {banner.title}
        </span>
      </div>
    </div>
  );
};
