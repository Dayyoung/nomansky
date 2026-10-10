import React, { useState } from 'react';
import {
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  Crosshair,
  Pickaxe,
  ShieldAlert,
  Flame,
  Swords,
  Fish,
  Info
} from 'lucide-react';
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
  // 간소화된 슬림 모드가 기본값 (플레이 화면 시야 100% 확보)
  const [showDetails, setShowDetails] = useState(false);

  if (!isAutoPilot && !demoState.isActive) {
    return null;
  }

  const {
    mode = 'REAL_PLAYER',
    phaseIndex,
    totalPhases,
    title,
    description,
    subText,
    badge,
    category,
    phaseDuration,
    phaseElapsed,
    currentActivity = 'GATHERING',
    activityLabel,
    currentTargetName,
    currentTargetDist,
    actionDetails,
    gatheredCount = 0,
    huntedCount = 0,
    sentinelsKilled = 0
  } = demoState;

  const durationSafe = phaseDuration || 4000;
  const progressPercent = Math.min(100, Math.max(0, (phaseElapsed / durationSafe) * 100));
  const elapsedSeconds = (phaseElapsed / 1000).toFixed(1);
  const totalSeconds = (durationSafe / 1000).toFixed(1);
  const globalProgress = Math.round(((phaseIndex + progressPercent / 100) / totalPhases) * 100);

  const getActivityIcon = () => {
    switch (currentActivity) {
      case 'HUNTING':
        return <Crosshair className="w-3.5 h-3.5 text-amber-400 animate-pulse" />;
      case 'SENTINEL_COMBAT':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-bounce" />;
      case 'GATHERING':
        return <Pickaxe className="w-3.5 h-3.5 text-cyan-400" />;
      case 'SPACE_FLIGHT':
        return <Flame className="w-3.5 h-3.5 text-sky-400" />;
      case 'FISHING':
        return <Fish className="w-3.5 h-3.5 text-teal-300" />;
      default:
        return <Swords className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <>
      {/* 1. 최상단 실시간 진행도 바 (z-[120] - 플레이 화면 절대 가리지 않는 2px 슬림 라인) */}
      <div
        className="fixed top-0 inset-x-0 z-[120] pointer-events-none select-none h-1 bg-slate-950/90 border-b border-cyan-400/30 backdrop-blur-sm shadow-[0_1px_8px_rgba(0,229,255,0.4)]"
        aria-hidden="true"
      >
        {/* 전체 투어 누적 진행도 */}
        <div
          className="absolute inset-y-0 left-0 bg-cyan-900/40 transition-all duration-300"
          style={{ width: `${globalProgress}%` }}
        />
        {/* 현재 단계 진행도 */}
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 shadow-[0_0_8px_#00e5ff] transition-[width] duration-100 ease-linear rounded-r-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 2. 간소화된 슬림 플로팅 데모 HUD (z-[100] - 화면 가림 최소화 & 가벼운 캡슐 형태) */}
      <aside
        aria-label="AI 데모플레이 쇼케이스 HUD"
        className="fixed top-2 sm:top-2.5 left-1/2 -translate-x-1/2 z-[100] w-[96%] max-w-xl pointer-events-auto transition-all duration-200"
      >
        <div className="relative rounded-full sm:rounded-2xl bg-slate-950/85 border border-cyan-400/50 shadow-[0_4px_25px_rgba(0,0,0,0.6)] backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 text-white">
          {/* Main Slim Row: 모든 핵심 상태를 한 줄로 간소화 표시 */}
          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
            {/* Left: 모드 뱃지 & 실시간 활동 상태 */}
            <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0" />

              {/* 모드 전환 버튼 (실전 사냥/채집 <-> 기능 투어) */}
              <button
                onClick={() => game.toggleDemoAutoplayMode()}
                title="클릭하여 모드 전환: [실전 사냥&채집] <-> [88단계 투어]"
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9.5px] sm:text-[11px] font-bold tracking-tight transition-all cursor-pointer shrink-0 ${
                  mode === 'REAL_PLAYER'
                    ? 'bg-emerald-500/20 border-emerald-400/60 text-emerald-300'
                    : 'bg-sky-500/20 border-sky-400/60 text-sky-300'
                }`}
              >
                {mode === 'REAL_PLAYER' ? '🏹 실전' : '📋 투어'}
              </button>

              {/* 단계 번호 */}
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-[9.5px] sm:text-[11px] font-mono font-bold text-cyan-300 shrink-0">
                <Sparkles className="w-2.5 h-2.5 text-cyan-300 shrink-0" />
                {phaseIndex + 1}/{totalPhases}
              </span>

              {/* 현재 활동 & 타겟 (간소화 한 줄) */}
              <div className="flex items-center gap-1 truncate text-[10px] sm:text-xs">
                <span className="shrink-0">{getActivityIcon()}</span>
                <span className="font-semibold text-cyan-100 truncate">
                  {activityLabel ? activityLabel.replace(/모드:.*$/, '').trim() : '⛏️ 채집'}
                </span>
                {currentTargetName && (
                  <span className="text-amber-300 text-[9.5px] sm:text-[10px] font-mono truncate hidden xs:inline">
                    ({currentTargetName.split(' ')[0]}
                    {currentTargetDist !== undefined ? ` ${currentTargetDist}m` : ''})
                  </span>
                )}
              </div>
            </div>

            {/* Right: 실시간 사냥/채집 카운터 & 제어 버튼 */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
              {/* 카운터 요약 */}
              <div className="hidden sm:flex items-center gap-1.5 font-mono text-[9.5px] text-gray-300 mr-1">
                <span className="text-cyan-300">⛏️{gatheredCount}</span>
                <span className="text-amber-300">🍖{huntedCount}</span>
                <span className="text-rose-400">🤖{sentinelsKilled}</span>
              </div>

              {/* 이전 / 다음 단계 */}
              <button
                onClick={() => {
                  const prev = phaseIndex - 1 < 0 ? totalPhases - 1 : phaseIndex - 1;
                  game.setupDemoPhase(prev, false);
                }}
                title="이전 단계"
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 active:scale-95 text-cyan-200 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>

              <button
                onClick={() => game.advanceDemoPhase()}
                title="다음 단계"
                className="p-1 rounded-md bg-white/10 hover:bg-white/20 active:scale-95 text-cyan-200 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>

              {/* 상세 정보 / 점프 선택기 펼치기 버튼 */}
              <button
                onClick={() => setShowDetails((prev) => !prev)}
                title={showDetails ? "상세 정보 접기 (간소화 모드)" : "상세 설명 & 88단계 선택 펼치기"}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  showDetails
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50'
                    : 'bg-white/10 hover:bg-white/20 text-gray-300'
                }`}
              >
                {showDetails ? (
                  <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                ) : (
                  <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                )}
              </button>

              {/* 데모 종료 / 수동 전환 */}
              <button
                onClick={onToggleDemo}
                title="데모 종료 및 수동 플레이 전환"
                className="px-2 py-0.5 rounded-full bg-rose-600/30 hover:bg-rose-600/50 active:scale-95 text-[9.5px] sm:text-[10px] font-bold text-rose-200 border border-rose-500/50 transition-colors flex items-center gap-0.5 cursor-pointer"
              >
                <Pause className="w-2.5 h-2.5" />
                <span>수동</span>
              </button>
            </div>
          </div>

          {/* 3. 펼쳐진 상세 정보 서랍 (사용자가 원할 때만 열림) */}
          {showDetails && (
            <div className="mt-2 pt-2 border-t border-cyan-500/20 space-y-1.5 animate-fadeIn">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-cyan-200 truncate">
                    {title}
                  </h3>
                  <p className="text-[10.5px] sm:text-xs text-gray-300 line-clamp-1 mt-0.5">
                    {description}
                  </p>
                  {actionDetails ? (
                    <p className="text-[9.5px] text-emerald-300 font-mono line-clamp-1 mt-0.5 font-semibold">
                      ⚡ {actionDetails}
                    </p>
                  ) : subText ? (
                    <p className="text-[9.5px] text-cyan-300/80 font-mono line-clamp-1 mt-0.5">
                      {subText}
                    </p>
                  ) : null}
                </div>

                <div className="text-right shrink-0 font-mono text-[9.5px] text-gray-300">
                  <div className="text-cyan-300 font-bold">{elapsedSeconds}s / {totalSeconds}s</div>
                  <div className="text-amber-300 font-bold">전체 {globalProgress}%</div>
                </div>
              </div>

              {/* 88단계 바로가기 선택창 */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10 text-[9.5px] font-mono">
                <div className="flex items-center gap-1 text-gray-400">
                  <Layers className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span>원하는 단계 선택:</span>
                </div>
                <select
                  value={phaseIndex}
                  onChange={(e) => game.setupDemoPhase(Number(e.target.value), false)}
                  className="bg-slate-900 border border-cyan-400/50 rounded-lg px-2 py-0.5 text-[9.5px] text-cyan-200 font-mono outline-none cursor-pointer max-w-[200px] sm:max-w-[260px] truncate"
                >
                  {GameEngine.DEMO_PHASES.map((p, idx) => (
                    <option key={idx} value={idx}>
                      {idx + 1}. {p.title.replace(/^[^\w가-힣]+/, '').slice(0, 22)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
