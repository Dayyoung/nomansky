import React, { useState } from 'react';
import {
  Pause,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Play
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
  const [showStepCatalog, setShowStepCatalog] = useState(false);

  const {
    phaseIndex = 0,
    totalPhases = GameEngine.DEMO_PHASES.length,
    title,
    phaseDuration,
    phaseElapsed,
  } = demoState;

  const allPhases = GameEngine.DEMO_PHASES;
  const safeTotal = allPhases.length || totalPhases || 88;
  const safeIndex = ((phaseIndex % safeTotal) + safeTotal) % safeTotal;
  const currentPhaseCfg = allPhases[safeIndex] || allPhases[0];
  const nextPhaseIdx = (safeIndex + 1) % safeTotal;
  const nextPhaseCfg = allPhases[nextPhaseIdx] || allPhases[0];

  const durationSafe = phaseDuration || currentPhaseCfg?.duration || 4200;
  const progressPercent = Math.min(100, Math.max(0, (phaseElapsed / durationSafe) * 100));
  const globalProgress = Math.min(
    100,
    Math.max(1, Math.round(((safeIndex + progressPercent / 100) / safeTotal) * 100))
  );

  const formatStepTitle = (rawTitle: string) => {
    if (!rawTitle) return '우주 및 행성 탐사';
    return rawTitle.replace(/^(\S+\s+)?\d+\/\d+\.\s*/, '').trim();
  };

  if (!isAutoPilot && !demoState.isActive) {
    return null;
  }

  return (
    <>
      {/* 최상단 2px 초슬림 전체/현재 스텝 진행 라인 */}
      <div
        className="fixed top-0 inset-x-0 z-[120] pointer-events-none select-none h-1 bg-slate-950/90"
        aria-hidden="true"
      >
        <div
          className="absolute inset-y-0 left-0 bg-cyan-500/30 transition-all duration-300"
          style={{ width: `${globalProgress}%` }}
        />
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-emerald-300 transition-[width] duration-100 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 초간소화 1줄 스텝 진행도 바 (모바일 & 데스크톱 겸용) */}
      <aside
        aria-label="데모 스텝 진행도 바"
        className="fixed top-9 xs:top-10 left-1/2 -translate-x-1/2 z-[45] w-[94vw] max-w-md pointer-events-auto"
      >
        <div className="relative overflow-hidden rounded-lg bg-slate-950/88 backdrop-blur-md border border-cyan-400/40 shadow-lg px-2 py-1 text-white">
          {/* 1줄 컴팩트 레이아웃: [STEP 01/88] + 제목 + 진행률% + 이전/다음/목록/수동 */}
          <div className="flex items-center justify-between gap-1.5">
            {/* 좌측: 스텝 번호 + 현재 스텝 제목 + 퍼센트 */}
            <button
              onClick={() => setShowStepCatalog((prev) => !prev)}
              className="flex items-center gap-1.5 min-w-0 flex-1 text-left cursor-pointer"
              title="터치하여 전체 88스텝 목록 열기/닫기"
            >
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-cyan-500/25 border border-cyan-400/60 text-[9.5px] font-mono font-extrabold text-cyan-200 tabular-nums shrink-0">
                <Play className="w-2 h-2 text-cyan-300 fill-cyan-300 shrink-0" />
                <span>{String(safeIndex + 1).padStart(2, '0')}/{safeTotal}</span>
              </span>

              <span className="text-[10.5px] sm:text-xs font-bold text-white truncate">
                {formatStepTitle(title || currentPhaseCfg?.title)}
              </span>

              <span className="text-[9.5px] font-mono font-bold text-cyan-300 tabular-nums shrink-0">
                {Math.round(progressPercent)}%
              </span>
            </button>

            {/* 우측: 최소 컨트롤 버튼 (<, >, 목록, 수동) */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                onClick={() => {
                  const prev = safeIndex - 1 < 0 ? safeTotal - 1 : safeIndex - 1;
                  game.setupDemoPhase(prev, false);
                }}
                title="이전 스텝"
                className="p-1 rounded bg-slate-800/90 hover:bg-slate-700 text-cyan-200 active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>

              <button
                onClick={() => game.advanceDemoPhase()}
                title="다음 스텝"
                className="p-1 rounded bg-slate-800/90 hover:bg-slate-700 text-cyan-200 active:scale-95 cursor-pointer"
              >
                <ChevronRight className="w-3 h-3" />
              </button>

              <button
                onClick={() => setShowStepCatalog((prev) => !prev)}
                title="전체 스텝 목록"
                className="p-1 rounded bg-slate-800/90 hover:bg-slate-700 text-cyan-300 active:scale-95 cursor-pointer"
              >
                {showStepCatalog ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <button
                onClick={onToggleDemo}
                title="데모 종료 (수동 조작)"
                className="px-1.5 py-0.5 rounded bg-rose-600/40 hover:bg-rose-600/60 border border-rose-400/50 text-[9px] font-mono font-bold text-rose-200 flex items-center gap-0.5 active:scale-95 cursor-pointer"
              >
                <Pause className="w-2.5 h-2.5" />
                <span>종료</span>
              </button>
            </div>
          </div>

          {/* 하단 테두리 내장형 마이크로 진행 게이지 */}
          <div className="mt-1 w-full h-1 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 transition-[width] duration-100 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* 펼침 시에만 표시되는 간결한 스텝 선택 리스트 */}
          {showStepCatalog && (
            <div className="mt-1.5 pt-1.5 border-t border-cyan-500/30 space-y-1">
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-300 px-0.5">
                <span className="truncate">
                  다음 ▶ <strong className="text-amber-300">{nextPhaseIdx + 1}. {formatStepTitle(nextPhaseCfg?.title)}</strong>
                </span>
                <span className="text-emerald-300 shrink-0 ml-2">전체 {globalProgress}%</span>
              </div>

              <div className="grid grid-cols-2 gap-1 max-h-36 overflow-y-auto pr-0.5">
                {allPhases.map((p, idx) => {
                  const isCurrent = idx === safeIndex;
                  return (
                    <button
                      key={`step_${idx}`}
                      onClick={() => {
                        game.setupDemoPhase(idx, false);
                        setShowStepCatalog(false);
                      }}
                      className={`text-left px-1.5 py-0.5 rounded border font-mono text-[9px] truncate cursor-pointer ${
                        isCurrent
                          ? 'bg-cyan-500/30 border-cyan-300 text-white font-bold'
                          : 'bg-slate-900/90 border-white/10 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-cyan-300 font-bold mr-1">{idx + 1}.</span>
                      <span>{formatStepTitle(p.title)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
