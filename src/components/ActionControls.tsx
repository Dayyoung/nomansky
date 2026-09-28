import React from 'react';
import { Crosshair, Zap, Rocket, Radio, RefreshCw, Eye, BatteryCharging, ShieldAlert } from 'lucide-react';
import { game } from '../gameEngine';
import { AudioSys } from '../audio';
import { ToolMode, ShipType } from '../types';

interface ActionControlsProps {
  toolMode: ToolMode;
  shipType: ShipType;
  gameState: 'SPACE' | 'PLANET' | 'WARP';
  isVisorActive: boolean;
  isOverheated: boolean;
  overheat: number;
  interactLabel: string | null;
  interactProgress: number;
  ammo: number;
  maxAmmo: number;
  cargoScanTimer: number;
  onFireStart: () => void;
  onFireEnd: () => void;
  onJetpackStart: () => void;
  onJetpackEnd: () => void;
  onInteractStart: () => void;
  onInteractEnd: () => void;
  onCycleTool: () => void;
  onScan: () => void;
  onReload: () => void;
  onToggleVisor: () => void;
  onOpenQuickRecharge: () => void;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  toolMode,
  shipType,
  gameState,
  isVisorActive,
  isOverheated,
  overheat,
  interactLabel,
  interactProgress,
  ammo,
  maxAmmo,
  cargoScanTimer,
  onFireStart,
  onFireEnd,
  onJetpackStart,
  onJetpackEnd,
  onInteractStart,
  onInteractEnd,
  onCycleTool,
  onScan,
  onReload,
  onToggleVisor,
  onOpenQuickRecharge
}) => {
  const isSpace = gameState === 'SPACE';
  const hasInteract = Boolean(interactLabel);

  return (
    <div className="relative flex flex-col items-end gap-2 select-none touch-none pointer-events-auto">
      {/* Improved Multi-tool Weapons & Heat Meter HUD (v2) */}
      <div id="multitool-hud" className="mb-1 pointer-events-none select-none">
        <div className="flex items-center justify-between gap-3 text-[10px] font-mono font-bold text-cyan-300">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>{isSpace ? (shipType === 'SOLAR' ? '베스퍼 세일 캐논' : '포톤 캐논') : toolMode}</span>
          </span>
          <span className={isOverheated ? 'text-red-400 font-extrabold animate-pulse' : overheat > 60 ? 'text-amber-400 font-bold' : 'text-gray-300'}>
            {isOverheated ? '과열 경고!' : `${Math.round(overheat)}%`}
          </span>
        </div>
        <div className={`heat-meter-bar ${isOverheated ? 'heat-overheated' : ''}`}>
          <div
            className="heat-meter-fill"
            style={{ width: `${Math.max(0, Math.min(100, overheat))}%` }}
          />
        </div>
      </div>

      {/* Top Auxiliary Utility Bar - Consistently sized icons, no clipping */}
      <div className="flex items-center justify-end gap-1.5 sm:gap-2">
        {/* Quick Recharge */}
        <button
          onClick={() => {
            AudioSys.unlockOnFirstInteraction();
            onOpenQuickRecharge();
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/95 border border-yellow-400/60 flex flex-col items-center justify-center text-yellow-400 active:scale-95 shadow-md backdrop-blur-md shrink-0 cursor-pointer"
          title="퀵 충전 (Sodium/Oxygen)"
        >
          <BatteryCharging className="w-4 h-4 text-yellow-400" />
          <span className="text-[8px] font-bold font-mono">충전</span>
        </button>

        {/* Visor Toggle */}
        {!isSpace && (
          <button
            onClick={() => {
              AudioSys.unlockOnFirstInteraction();
              onToggleVisor();
            }}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex flex-col items-center justify-center active:scale-95 shadow-md backdrop-blur-md shrink-0 cursor-pointer ${
              isVisorActive
                ? 'bg-cyan-500 border-cyan-300 text-black font-bold shadow-[0_0_12px_#00e5ff]'
                : 'bg-slate-900/95 border-cyan-400/50 text-cyan-300'
            }`}
            title="분석 바이저 [F]"
          >
            <Eye className="w-4 h-4" />
            <span className="text-[8px] font-bold font-mono">바이저</span>
          </button>
        )}

        {/* Scan / Deflector */}
        <button
          onClick={() => {
            AudioSys.unlockOnFirstInteraction();
            onScan();
          }}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border flex flex-col items-center justify-center active:scale-95 shadow-md backdrop-blur-md shrink-0 cursor-pointer ${
            cargoScanTimer > 0
              ? 'bg-red-600 border-red-400 text-white animate-pulse shadow-[0_0_15px_#ef4444]'
              : 'bg-slate-900/95 border-cyan-400/50 text-cyan-300'
          }`}
          title={cargoScanTimer > 0 ? '화물 교란기 작동 [C]' : '지형 스캔 [C]'}
        >
          {cargoScanTimer > 0 ? (
            <>
              <ShieldAlert className="w-4 h-4 text-white" />
              <span className="text-[8px] font-bold font-mono">교란</span>
            </>
          ) : (
            <>
              <Radio className="w-4 h-4 text-cyan-300" />
              <span className="text-[8px] font-bold font-mono">스캔</span>
            </>
          )}
        </button>

        {/* Tool Switch Mode (On Planet) or Ship Switch (In Space) */}
        {!isSpace ? (
          <button
            onClick={() => {
              AudioSys.unlockOnFirstInteraction();
              onCycleTool();
            }}
            className={`h-9 sm:h-10 px-3 rounded-full border flex items-center gap-1.5 active:scale-95 shadow-md backdrop-blur-md shrink-0 cursor-pointer transition-colors ${
              toolMode === 'BOLTCASTER'
                ? 'bg-red-950/90 border-red-400 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : toolMode === 'TERRAIN MANIPULATOR'
                ? 'bg-sky-950/90 border-sky-400 text-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                : toolMode === 'VOLTAIC STAFF'
                ? 'bg-purple-950/90 border-purple-400 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'bg-emerald-950/90 border-emerald-400/80 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
            }`}
            title="무기/도구 전환 [G] - 모드별 타겟 자동 추적"
          >
            <Zap className={`w-3.5 h-3.5 shrink-0 ${
              toolMode === 'BOLTCASTER' ? 'text-red-400' :
              toolMode === 'TERRAIN MANIPULATOR' ? 'text-sky-400' :
              toolMode === 'VOLTAIC STAFF' ? 'text-purple-400' : 'text-emerald-400'
            }`} />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold font-mono whitespace-nowrap leading-none">
                {toolMode === 'MINING BEAM' ? '채굴광선' : toolMode === 'BOLTCASTER' ? '볼트캐스터' : toolMode === 'TERRAIN MANIPULATOR' ? '지형조작기' : '볼타익스태프'}
              </span>
              <span className="text-[7.5px] opacity-80 font-mono whitespace-nowrap leading-none mt-0.5">
                {toolMode === 'MINING BEAM' ? '추적: 광맥' : toolMode === 'BOLTCASTER' ? '추적: 센티넬' : toolMode === 'TERRAIN MANIPULATOR' ? '추적: 동굴/지형' : '추적: 동물'}
              </span>
            </div>
          </button>
        ) : (
          <button
            onClick={() => {
              AudioSys.unlockOnFirstInteraction();
              game.cycleStarship();
            }}
            className="h-9 sm:h-10 px-3 rounded-full bg-slate-900/95 border border-amber-400/70 flex items-center gap-1.5 text-amber-300 active:scale-95 shadow-md backdrop-blur-md shrink-0 cursor-pointer"
            title="함선 전환 [K]"
          >
            <Rocket className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-[10px] font-bold font-mono whitespace-nowrap">
              {shipType === 'SOLAR' ? '솔라선' : shipType === 'INTERCEPTOR' ? '인터셉터' : shipType === 'LIVING' ? '생체함선' : '표준전투기'}
            </span>
          </button>
        )}
      </div>

      {/* Main Action Thumb Cluster (Ergonomic, spacious, zero clipping) */}
      <div className="flex items-end justify-end gap-2 sm:gap-3">
        {/* Dynamic Interact / E Button */}
        {hasInteract && (
          <div className="relative shrink-0">
            <button
              onTouchStart={(e) => {
                e.stopPropagation();
                AudioSys.unlockOnFirstInteraction();
                onInteractStart();
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                onInteractEnd();
              }}
              onClick={() => {
                AudioSys.unlockOnFirstInteraction();
                if (game.data.activeInteractAction) {
                  game.data.activeInteractAction();
                }
              }}
              onMouseDown={() => {
                AudioSys.unlockOnFirstInteraction();
                onInteractStart();
              }}
              onMouseUp={onInteractEnd}
              className={`relative w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-slate-950/95 border-2 flex flex-col items-center justify-center active:scale-95 backdrop-blur-md cursor-pointer animate-pulse ${
                interactLabel?.includes('착륙')
                  ? 'border-emerald-400 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.7)]'
                  : 'border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(0,229,255,0.4)]'
              }`}
            >
              {/* Circular Hold Progress */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke={interactLabel?.includes('착륙') ? 'rgba(16,185,129,0.2)' : 'rgba(0,229,255,0.2)'}
                  strokeWidth="3"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke={interactLabel?.includes('착륙') ? '#10b981' : '#00e5ff'}
                  strokeWidth="4"
                  strokeDasharray="176"
                  strokeDashoffset={176 - interactProgress * 176}
                  style={{ transition: 'stroke-dashoffset 0.05s linear' }}
                />
              </svg>
              <span className={`text-sm sm:text-base font-extrabold font-mono ${interactLabel?.includes('착륙') ? 'text-emerald-300' : 'text-cyan-300'}`}>[E]</span>
              <span className="text-[7px] sm:text-[8px] font-bold text-gray-200 tracking-tighter">
                {!isSpace ? '우주선 탑승' : (interactLabel?.includes('도킹') ? '정거장 도킹' : '지금 착륙')}
              </span>
            </button>
          </div>
        )}

        {/* Dedicated Reload Button in BOLTCASTER (Rifle) Mode */}
        {!isSpace && toolMode === 'BOLTCASTER' && (
          <button
            onClick={() => {
              AudioSys.unlockOnFirstInteraction();
              onReload();
            }}
            className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full border-2 flex flex-col items-center justify-center active:scale-95 shadow-xl backdrop-blur-md cursor-pointer shrink-0 transition-all ${
              ammo === 0
                ? 'bg-red-950/95 border-red-400 text-red-300 animate-bounce shadow-[0_0_20px_rgba(239,68,68,0.7)]'
                : ammo <= 8
                ? 'bg-amber-950/95 border-amber-400 text-amber-300 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'bg-slate-900/95 border-amber-400/80 text-amber-300 hover:bg-slate-800 shadow-md'
            }`}
            title="소총 탄약 재장전 [R]"
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 text-amber-300 mb-0.5 ${ammo === 0 ? 'animate-spin' : ''}`} />
            <span className="text-[8px] sm:text-[9px] font-extrabold font-mono tracking-tighter">
              {ammo === 0 ? '재장전!' : '장전'}
            </span>
          </button>
        )}

        {/* Secondary: Jetpack / Pulse Boost Button */}
        <button
          onTouchStart={(e) => {
            e.stopPropagation();
            AudioSys.unlockOnFirstInteraction();
            onJetpackStart();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            onJetpackEnd();
          }}
          onMouseDown={() => {
            AudioSys.unlockOnFirstInteraction();
            onJetpackStart();
          }}
          onMouseUp={onJetpackEnd}
          className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-slate-900/95 border-2 border-emerald-400/90 text-emerald-300 flex flex-col items-center justify-center shadow-lg active:scale-95 active:bg-emerald-500/20 backdrop-blur-md shrink-0 cursor-pointer"
          title={isSpace ? '펄스 드라이브 가속 [SPACE]' : '제트팩 도약 [SPACE]'}
        >
          <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 mb-0.5" />
          <span className="text-[8px] sm:text-[9px] font-bold font-mono tracking-wider">
            {isSpace ? '펄스부스트' : '제트팩'}
          </span>
        </button>

        {/* Primary Main: Fire / Mine / Cannon Button */}
        <div className="relative shrink-0">
          {/* Floating Ammo Badge for Boltcaster Mode (Anchored at top, ZERO text clipping) */}
          {!isSpace && toolMode === 'BOLTCASTER' && (
            <div
              className={`absolute -top-3 left-1/2 -translate-x-1/2 z-20 px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold shadow-lg flex items-center gap-1 whitespace-nowrap pointer-events-none transition-all ${
                ammo === 0
                  ? 'bg-red-950 border-red-400 text-red-300 animate-pulse'
                  : ammo <= 8
                  ? 'bg-amber-950 border-amber-400 text-amber-300'
                  : 'bg-slate-950/95 border-amber-400/80 text-amber-300'
              }`}
            >
              <span className="text-[8px] opacity-75">탄약</span>
              <span className={`text-[10px] ${ammo === 0 ? 'text-red-400 font-extrabold' : 'text-white'}`}>
                {ammo}
              </span>
              <span className="text-gray-400 text-[8px]">/{maxAmmo}</span>
            </div>
          )}

          <button
            onTouchStart={(e) => {
              e.stopPropagation();
              AudioSys.unlockOnFirstInteraction();
              if (!isSpace && toolMode === 'BOLTCASTER' && ammo === 0) {
                onReload();
                return;
              }
              onFireStart();
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              onFireEnd();
            }}
            onMouseDown={() => {
              AudioSys.unlockOnFirstInteraction();
              if (!isSpace && toolMode === 'BOLTCASTER' && ammo === 0) {
                onReload();
                return;
              }
              onFireStart();
            }}
            onMouseUp={onFireEnd}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 flex flex-col items-center justify-center shadow-2xl active:scale-95 backdrop-blur-md cursor-pointer transition-colors ${
              isOverheated
                ? 'bg-red-950/90 border-red-500 text-red-400 shadow-[0_0_20px_#ef4444]'
                : isSpace
                ? 'bg-gradient-to-br from-amber-600/90 to-red-700/90 border-amber-300 text-white shadow-[0_0_25px_rgba(251,191,36,0.4)]'
                : toolMode === 'BOLTCASTER'
                ? ammo === 0
                  ? 'bg-amber-950 border-amber-400 text-amber-300 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                  : 'bg-gradient-to-br from-amber-600/95 to-orange-700/95 border-amber-300 text-white shadow-[0_0_25px_rgba(245,158,11,0.4)]'
                : 'bg-gradient-to-br from-cyan-600/90 to-blue-700/90 border-cyan-300 text-white shadow-[0_0_25px_rgba(0,229,255,0.4)]'
            }`}
            title={isSpace ? '광자포 발사 [FIRE]' : '채굴 레이저 / 발사 [MINE]'}
          >
            {/* Overheat Arc Indicator around Button */}
            {overheat > 0 && (
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="37"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray="232"
                  strokeDashoffset={232 - (overheat / 100) * 232}
                />
              </svg>
            )}

            {toolMode === 'BOLTCASTER' && ammo === 0 ? (
              <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 mb-0.5 animate-spin" />
            ) : (
              <Crosshair className="w-5 h-5 sm:w-6 sm:h-6 text-white mb-0.5" />
            )}

            <span className="text-[9px] sm:text-[10px] font-extrabold font-mono tracking-wide text-center px-1 leading-tight">
              {isOverheated
                ? '과열냉각'
                : isSpace
                ? '함포사격'
                : toolMode === 'BOLTCASTER'
                ? ammo === 0
                  ? '장전필요'
                  : '소총사격'
                : '채굴/사격'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

