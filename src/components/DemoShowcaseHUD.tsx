import React from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Sparkles, Compass, Eye, ShieldAlert, Cpu } from 'lucide-react';
import { game, GameEngine } from '../gameEngine';
import { DemoShowcaseState } from '../types';

interface DemoShowcaseHUDProps {
  demoState: DemoShowcaseState;
  isAutoPilot: boolean;
  onToggleDemo: () => void;
}

export const DemoShowcaseHUD: React.FC<DemoShowcaseHUDProps> = ({
  demoState,
  isAutoPilot,
  onToggleDemo
}) => {
  if (!isAutoPilot && !demoState.isActive) {
    return null;
  }

  const {
    phaseIndex,
    totalPhases,
    title,
    description,
    subText,
    phaseDuration,
    phaseElapsed
  } = demoState;

  const progressPercent = Math.min(100, Math.max(0, (phaseElapsed / (phaseDuration || 1)) * 100));

  return (
    <aside 
      aria-label="AI 데모플레이 HUD"
      className="fixed top-14 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-xl pointer-events-auto transition-all duration-300"
    >
      <div className="relative overflow-hidden rounded-2xl bg-slate-950/90 border border-cyan-400/50 shadow-[0_0_25px_rgba(0,229,255,0.35)] backdrop-blur-md px-4 py-3 text-white">
        {/* Glow ambient background line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] sm:text-xs font-mono font-bold text-cyan-300 tracking-wider">
              <Sparkles className="w-3 h-3 text-cyan-300" />
              DEMO SHOWCASE ({phaseIndex + 1}/{totalPhases})
            </span>
            <span className="text-xs text-white/60 hidden sm:inline-block font-mono">
              [자동 시연 모드]
            </span>
          </div>

          {/* Controls: Prev, Next, Stop */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const prev = phaseIndex - 1 < 0 ? totalPhases - 1 : phaseIndex - 1;
                game.setupDemoPhase(prev);
              }}
              title="이전 시연 단계"
              className="p-1 rounded bg-white/5 hover:bg-white/15 active:scale-95 text-white/80 transition-colors border border-white/10"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => game.advanceDemoPhase()}
              title="다음 시연 단계"
              className="p-1 rounded bg-white/5 hover:bg-white/15 active:scale-95 text-white/80 transition-colors border border-white/10"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onToggleDemo}
              title="데모 종료 (수동 플레이 전환)"
              className="px-2 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 active:scale-95 text-[10px] sm:text-xs font-bold text-rose-300 border border-rose-500/40 transition-colors flex items-center gap-1 ml-1"
            >
              <Pause className="w-3 h-3" />
              <span>수동 전환</span>
            </button>
          </div>
        </div>

        {/* Phase Title & Subtitle */}
        <div className="mb-2">
          <h2 className="text-sm sm:text-base font-black text-cyan-200 flex items-center gap-1.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            <span>{title}</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-white/90 line-clamp-1 leading-snug">
            {description}
          </p>
          {subText && (
            <p className="text-[10px] text-cyan-400/80 font-mono line-clamp-1">
              {subText}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400 transition-[width] duration-150 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Phase Indicator & Quick Jump */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-white/10 text-[10px] font-mono">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-cyan-300 font-bold shrink-0">
              {phaseIndex + 1}/{totalPhases}
            </span>
            <span className="text-gray-400 truncate hidden xs:inline">
              {Math.round(progressPercent)}% 완료
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <select
              value={phaseIndex}
              onChange={(e) => game.setupDemoPhase(Number(e.target.value))}
              className="bg-slate-900 border border-cyan-400/40 rounded px-1.5 py-0.5 text-[9.5px] text-cyan-200 font-mono outline-none cursor-pointer max-w-[140px] xs:max-w-[180px] sm:max-w-[220px] truncate"
              title="원하는 시연 기능 단계로 즉시 점프"
            >
              {GameEngine.DEMO_PHASES.map((p, idx) => (
                <option key={idx} value={idx}>
                  {idx + 1}. {p.title.replace(/^[^\w가-힣]+/, '').slice(0, 22)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
};
