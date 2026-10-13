import React, { useState, useEffect } from 'react';
import { game } from '../gameEngine';
import { NmsAudioEngine } from '../three/audio/NmsAudioEngine';

interface AnalysisVisorHUDProps {
  onClose: () => void;
}

export const AnalysisVisorHUD: React.FC<AnalysisVisorHUDProps> = ({ onClose }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scannedTarget, setScannedTarget] = useState<{
    title: string;
    latin: string;
    type: string;
    distance: number;
    resource: string;
    unitsReward: number;
  } | null>(null);

  useEffect(() => {
    // Sound cue on visor engage
    NmsAudioEngine.getInstance().playScannerPing();

    // Find nearest target on planet
    const curPlanet = game.data.activePlanet || game.entities.planets[0];
    if (curPlanet && curPlanet.deposits && curPlanet.deposits.length > 0) {
      const dep = curPlanet.deposits[0];
      setScannedTarget({
        title: dep.commonName || `${dep.type.toUpperCase()} 광맥`,
        latin: dep.latinName || 'Mineralis Caelestis',
        type: dep.isFlora ? '외계 식물군 (FLORA)' : '지질 광물 (MINERAL)',
        distance: Math.floor(Math.random() * 45 + 15),
        resource: dep.type.toUpperCase(),
        unitsReward: 4800,
      });
    }

    const timer = setInterval(() => {
      setScanProgress((prev) => (prev < 100 ? prev + 12 : 100));
    }, 120);

    return () => clearInterval(timer);
  }, []);

  const cycleZoom = () => {
    setZoomLevel((prev) => (prev === 1 ? 2.5 : prev === 2.5 ? 5 : 1));
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex flex-col justify-between overflow-hidden p-6 font-mono select-none">
      {/* 1. Holographic Scanline Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, #00f0ff 100%)',
          boxShadow: 'inset 0 0 100px rgba(0, 240, 255, 0.4)',
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:100%_4px]" />

      {/* Top Header: Visor Mode Bar */}
      <div className="relative flex items-center justify-between border-b border-cyan-500/40 bg-black/60 px-6 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 animate-ping rounded-full bg-cyan-400" />
          <span className="text-sm font-black tracking-widest text-cyan-400">ANALYSIS VISOR v4.8</span>
          <span className="rounded bg-cyan-950 px-2 py-0.5 text-xs text-cyan-300">SCAN SPECTRUM ACTIVE</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="text-slate-400">
            배율: <strong className="text-cyan-300">{zoomLevel}x</strong>
          </span>
          <span className="text-slate-400">
            행성 대기: <strong className="text-emerald-400">{game.data.activePlanet?.hazardType || 'STABLE'}</strong>
          </span>
          <button
            onClick={onClose}
            className="pointer-events-auto rounded border border-cyan-500/60 bg-cyan-900/50 px-3 py-1 font-sans text-xs font-bold text-cyan-200 transition-colors hover:bg-cyan-800"
          >
            [F] 닫기
          </button>
        </div>
      </div>

      {/* Central Targeting Reticle & Analysis Tag */}
      <div className="relative flex flex-1 items-center justify-center">
        {/* Reticle Brackets */}
        <div className="relative flex h-48 w-48 items-center justify-center">
          <div className="absolute -top-4 -left-4 h-8 w-8 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute -top-4 -right-4 h-8 w-8 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute -bottom-4 -left-4 h-8 w-8 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute -bottom-4 -right-4 h-8 w-8 border-b-2 border-r-2 border-cyan-400" />

          {/* Center Crosshair */}
          <div className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_#00f0ff]" />
          <div className="absolute h-16 w-16 rounded-full border border-cyan-500/30" />
          <div className="absolute h-32 w-32 rounded-full border border-dashed border-cyan-500/20" />
        </div>

        {/* Detailed Target Classification Card */}
        {scannedTarget && (
          <div className="pointer-events-auto absolute top-1/2 left-[calc(50%+110px)] -translate-y-1/2 w-80 rounded-lg border border-cyan-400/50 bg-slate-950/85 p-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2">
              <span className="text-xs font-black tracking-wider text-cyan-300">{scannedTarget.type}</span>
              <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-[10px] text-cyan-400">
                거리 {scannedTarget.distance}u
              </span>
            </div>

            <div className="mt-2.5">
              <h3 className="text-base font-black text-white">{scannedTarget.title}</h3>
              <p className="text-xs italic text-slate-400">{scannedTarget.latin}</p>
            </div>

            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>주요 자원 원소:</span>
                <span className="font-bold text-amber-300">{scannedTarget.resource}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>데이터 발견 보상:</span>
                <span className="font-bold text-emerald-400">+{scannedTarget.unitsReward.toLocaleString()} UNITS</span>
              </div>
            </div>

            {/* Analysis Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-cyan-400">
                <span>분석 스캔 완료율</span>
                <span>{scanProgress}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-150"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Command Strip */}
      <div className="relative flex items-center justify-between border-t border-cyan-500/40 bg-black/60 px-6 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-6 text-xs text-slate-300">
          <div>
            <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-cyan-300">F</kbd> 바이저 끄기
          </div>
          <div>
            <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-cyan-300">C</kbd> 스캐너 펄스
          </div>
          <div>
            <kbd className="rounded bg-slate-800 px-1.5 py-0.5 text-cyan-300">우클릭</kbd> 줌 전환
          </div>
        </div>

        <div className="pointer-events-auto flex gap-2">
          <button
            onClick={cycleZoom}
            className="rounded border border-cyan-500/40 bg-cyan-950/60 px-3 py-1 text-xs font-bold text-cyan-300 transition hover:bg-cyan-900"
          >
            배율 변경 ({zoomLevel}x)
          </button>
          <button
            onClick={() => NmsAudioEngine.getInstance().playScannerPing()}
            className="rounded border border-cyan-500/40 bg-cyan-950/60 px-3 py-1 text-xs font-bold text-cyan-300 transition hover:bg-cyan-900"
          >
            스캔 펄스 발신 [C]
          </button>
        </div>
      </div>
    </div>
  );
};
