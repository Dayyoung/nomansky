import React, { useState, useEffect, useRef } from 'react';
import { GameEngine } from '../gameEngine';
import { NmsAudioEngine } from '../three/audio/NmsAudioEngine';

interface GalaxyWarpMapModalProps {
  game: GameEngine;
  onClose: () => void;
}

interface StarSystemItem {
  id: string;
  name: string;
  spectralClass: 'CLASS_F_G' | 'CLASS_M' | 'CLASS_E' | 'CLASS_O' | 'OUTLAW' | 'DISSONANT' | 'CORE';
  spectralLabel: string;
  color: string;
  race: 'KORVAX' | 'VYKEEN' | 'GEK' | 'OUTLAW';
  raceName: string;
  raceIcon: string;
  distanceLy: number;
  economy: string;
  economyStars: string;
  conflict: string;
  conflictColor: string;
  planetsCount: number;
  gx: number;
  gy: number;
  desc: string;
}

export const GalaxyWarpMapModal: React.FC<GalaxyWarpMapModalProps> = ({ game, onClose }) => {
  const [selectedSystemId, setSelectedSystemId] = useState<string>('euclid-prime');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'YELLOW' | 'RED' | 'GREEN' | 'BLUE' | 'OUTLAW'>('ALL');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const starSystems: StarSystemItem[] = [
    {
      id: 'euclid-prime',
      name: '오미아-IV (현재 성계)',
      spectralClass: 'CLASS_F_G',
      spectralLabel: 'G4p // 황색 주계열성 (Lush / Temperate)',
      color: '#fbbf24',
      race: 'KORVAX',
      raceName: '코르박스 전자집합체',
      raceIcon: '🔷',
      distanceLy: 0,
      economy: '나노기술 연구 // 풍요로움 (Tier 3)',
      economyStars: '★★★',
      conflict: '평화로움 (안전 성계)',
      conflictColor: '#34d399',
      planetsCount: 5,
      gx: 0,
      gy: 0,
      desc: '코르박스 과학관들이 고대 아틀라스 모놀리스의 공명 신호를 연구하는 평화로운 성계입니다.'
    },
    {
      id: 'valari-v',
      name: '발라리-V 무역 대상관',
      spectralClass: 'CLASS_F_G',
      spectralLabel: 'F2 // 온화한 삼중 태양계',
      color: '#facc15',
      race: 'GEK',
      raceName: '게크 상인연합',
      raceIcon: '💰',
      distanceLy: 140,
      economy: '은하계 도매 무역 // 호황 (Tier 3)',
      economyStars: '★★★',
      conflict: '낮음 (치안 확립)',
      conflictColor: '#38bdf8',
      planetsCount: 6,
      gx: 70,
      gy: -45,
      desc: '게크 제일산란대의 유물과 농축 탄소, 합금류 거래가 활발하게 이뤄지는 은하 허브입니다.'
    },
    {
      id: 'vykeen-fortress',
      name: '그록-발라크 전사의 성채',
      spectralClass: 'CLASS_M',
      spectralLabel: 'M6 // 적색 거성 (Cadmium / Extreme Heat)',
      color: '#ef4444',
      race: 'VYKEEN',
      raceName: '바이킨 전사연합',
      raceIcon: '⚔️',
      distanceLy: 280,
      economy: '중화기 및 무기 제조 // 번영',
      economyStars: '★★☆',
      conflict: '위험 (센티넬 순찰 빈번)',
      conflictColor: '#f87171',
      planetsCount: 4,
      gx: -110,
      gy: 65,
      desc: '카드뮴 광맥과 중무장 센티넬 요격기가 상시 출몰하는 거친 전쟁군주 영역입니다.'
    },
    {
      id: 'emerald-spire',
      name: '에메릴 녹색 성운 셉터',
      spectralClass: 'CLASS_E',
      spectralLabel: 'E0 // 녹색 항성 (Emeril / Bio-Anomaly)',
      color: '#10b981',
      race: 'KORVAX',
      raceName: '코르박스 에코 연구소',
      raceIcon: '🔷',
      distanceLy: 420,
      economy: '유기물 합금 정제 // 발전',
      economyStars: '★★☆',
      conflict: '보통',
      conflictColor: '#fbbf24',
      planetsCount: 5,
      gx: 120,
      gy: 110,
      desc: '고농도 에메릴 광맥과 거대 부유 섬이 형성된 생태학적 특이성계입니다.'
    },
    {
      id: 'blue-indium',
      name: '인듐-9 초고밀도 청색성',
      spectralClass: 'CLASS_O',
      spectralLabel: 'O3 // 청색 초거성 (Activated Indium)',
      color: '#38bdf8',
      race: 'KORVAX',
      raceName: '선조의 전자 신전',
      raceIcon: '🔷',
      distanceLy: 560,
      economy: '에너지 추출 // 막대함 (Tier 3)',
      economyStars: '★★★',
      conflict: '극한 (중력 폭풍 빈발)',
      conflictColor: '#f43f5e',
      planetsCount: 4,
      gx: -60,
      gy: -130,
      desc: '활성화된 인듐과 극한의 방사능 폭풍이 몰아치는 최상위 하이퍼드라이브 전용 성계입니다.'
    },
    {
      id: 'pirate-haven',
      name: '붉은 해골 무법 성계 ☠️',
      spectralClass: 'OUTLAW',
      spectralLabel: 'X-CLASS // 무법자 관할 해적 요새',
      color: '#a855f7',
      race: 'OUTLAW',
      raceName: '성간 해적 카르텔',
      raceIcon: '☠️',
      distanceLy: 310,
      economy: '밀수품 & 위조 회로 // 통제불능',
      economyStars: '★☆☆',
      conflict: '무법 (센티넬 미개입)',
      conflictColor: '#c084fc',
      planetsCount: 3,
      gx: -140,
      gy: -50,
      desc: '센티넬 순찰이 차단된 은신처로, 금지된 엑소슈트 불법 개조 기술과 위조 화폐를 취급합니다.'
    },
    {
      id: 'euclid-core',
      name: '유클리드 은하 코어 (Galactic Center)',
      spectralClass: 'CORE',
      spectralLabel: 'ORIGIN // 태초의 특이점 (Dimensional Gateway)',
      color: '#ffffff',
      race: 'KORVAX',
      raceName: '진홍의 아틀라스',
      raceIcon: '🔴',
      distanceLy: 712000,
      economy: '우주의 창조 중심 // 초월',
      economyStars: '★★★★',
      conflict: '아틀라스의 침묵',
      conflictColor: '#f43f5e',
      planetsCount: 0,
      gx: 0,
      gy: 220,
      desc: '모든 여행자들이 도달하고자 갈망하는 은하계의 중심이자 차원 도약 게이트웨이입니다.'
    }
  ];

  const filteredSystems = starSystems.filter((sys) => {
    if (activeFilter === 'YELLOW') return sys.spectralClass === 'CLASS_F_G';
    if (activeFilter === 'RED') return sys.spectralClass === 'CLASS_M';
    if (activeFilter === 'GREEN') return sys.spectralClass === 'CLASS_E';
    if (activeFilter === 'BLUE') return sys.spectralClass === 'CLASS_O';
    if (activeFilter === 'OUTLAW') return sys.spectralClass === 'OUTLAW';
    return true;
  });

  const activeSystem = starSystems.find((s) => s.id === selectedSystemId) || starSystems[0];
  const warpCells = game.data.inv.warpCell || 0;

  // Background Animated Holographic Starfield Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw faint hyperdrive range ring
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw galactic grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let r = 40; r <= 160; r += 40) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Stars and Vector Lines
      starSystems.forEach((sys) => {
        const rad = angle * 0.15;
        // Subtle orbital rotation
        const rotatedX = sys.gx * Math.cos(rad) - sys.gy * Math.sin(rad);
        const rotatedY = sys.gx * Math.sin(rad) + sys.gy * Math.cos(rad);

        const px = cx + rotatedX * 0.85;
        const py = cy + rotatedY * 0.85;

        // Line to selected system
        if (sys.id === selectedSystemId && sys.id !== 'euclid-prime') {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(px, py);
          ctx.stroke();
        }

        // Star Glow
        const isCurrent = sys.id === 'euclid-prime';
        const isSelected = sys.id === selectedSystemId;

        ctx.fillStyle = sys.color;
        ctx.beginPath();
        ctx.arc(px, py, isSelected ? 6 : isCurrent ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(px, py, 11, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      angle += 0.01;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [selectedSystemId]);

  const handleExecuteWarp = () => {
    if (warpCells > 0 || selectedSystemId === 'euclid-prime') {
      if (warpCells > 0 && selectedSystemId !== 'euclid-prime') {
        game.data.inv.warpCell--;
      }
      NmsAudioEngine.getInstance().playHyperspaceWarpBoom();
      game.currState = 'WARP';
      game.warpProgress = 0;
      game.spawnFloatText(`🚀 ${activeSystem.name} 성계로 하이퍼스페이스 워프 돌파!`, undefined, undefined, '#38bdf8');
      onClose();
    } else {
      game.data.inv.warpCell = 1;
      NmsAudioEngine.getInstance().playQuickRechargeChime();
      game.spawnFloatText('워프 셀 1개 긴급 충전됨! 다시 워프를 누르세요.', undefined, undefined, '#34d399');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-950/95 border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] p-4 sm:p-6 text-white flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h2 className="text-sm sm:text-base font-black tracking-widest text-cyan-300 uppercase font-mono">
                은하계 성도 // GALAXY WARP MAP
              </h2>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              유클리드 은하 제4구역 // 하이퍼드라이브 도약 유효 반경: 400 LY
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-gray-300 rounded-lg border border-slate-700 cursor-pointer font-mono"
          >
            닫기 [ESC]
          </button>
        </div>

        {/* Spectral Class Filter Buttons */}
        <div className="flex flex-wrap gap-1.5 pb-1">
          {[
            { id: 'ALL', label: '전체 항성', color: 'bg-slate-800 text-gray-300' },
            { id: 'YELLOW', label: 'F/G 황색 (낙원)', color: 'bg-amber-950/60 text-amber-300 border border-amber-500/40' },
            { id: 'RED', label: 'M 적색 (카드뮴)', color: 'bg-red-950/60 text-red-300 border border-red-500/40' },
            { id: 'GREEN', label: 'E 녹색 (에메릴)', color: 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40' },
            { id: 'BLUE', label: 'O 청색 (인듐)', color: 'bg-sky-950/60 text-sky-300 border border-sky-500/40' },
            { id: 'OUTLAW', label: '해적 무법 성계', color: 'bg-purple-950/60 text-purple-300 border border-purple-500/40' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as typeof activeFilter)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                activeFilter === f.id
                  ? 'bg-cyan-500 text-black font-extrabold shadow-sm'
                  : f.color
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 3D Holographic Map Canvas & System Info Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
          {/* Interactive Starfield Canvas */}
          <div className="relative w-full h-56 bg-slate-900/80 rounded-xl border border-cyan-500/30 flex items-center justify-center overflow-hidden">
            <canvas ref={canvasRef} width={280} height={224} className="w-full h-full" />
            <div className="absolute top-2 left-2 text-[9px] font-mono text-cyan-400/80 bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/20">
              3D 성단 좌표 프로젝션
            </div>
            <div className="absolute bottom-2 right-2 text-[9px] font-mono text-gray-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700">
              워프 셀 보유: {warpCells}개
            </div>
          </div>

          {/* Target Star System Specifications */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between h-56">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-gray-300">
                  {activeSystem.raceIcon} {activeSystem.raceName}
                </span>
                <span className="text-xs font-mono font-black text-cyan-300">
                  {activeSystem.distanceLy === 0 ? '현재 위치' : `${activeSystem.distanceLy} LY`}
                </span>
              </div>

              <h3 className="text-base font-black text-white mt-1.5">{activeSystem.name}</h3>
              <p className="text-[11px] text-gray-400 leading-tight mt-1">{activeSystem.desc}</p>
            </div>

            <div className="space-y-1 text-[10px] font-mono border-t border-slate-800 pt-2 text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-400">분광형:</span>
                <span className="text-white font-bold">{activeSystem.spectralLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">경제 현황:</span>
                <span className="text-amber-300 font-bold">{activeSystem.economy} {activeSystem.economyStars}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">분쟁 수준:</span>
                <span style={{ color: activeSystem.conflictColor }} className="font-bold">{activeSystem.conflict}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Star Systems List Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
          {filteredSystems.map((sys) => {
            const isSelected = sys.id === selectedSystemId;
            return (
              <button
                key={sys.id}
                onClick={() => {
                  setSelectedSystemId(sys.id);
                  NmsAudioEngine.getInstance().playQuickRechargeChime();
                }}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sys.color }} />
                    <span className="text-xs font-bold text-white">{sys.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 block ml-4">{sys.raceIcon} {sys.raceName}</span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-cyan-300 block">
                    {sys.distanceLy === 0 ? '현재' : `${sys.distanceLy} LY`}
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono">행성 {sys.planetsCount}개</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Warp Execution Bar */}
        <div className="p-3 bg-gradient-to-r from-cyan-950/60 to-blue-950/60 rounded-xl border border-cyan-400/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-white block">
              목적지: {activeSystem.name} ({activeSystem.distanceLy} LY)
            </span>
            <span className="text-[10px] text-gray-300 font-mono">
              필요 워프 셀: {activeSystem.distanceLy === 0 ? 0 : 1}개 // 보유 워프 셀: {warpCells}개
            </span>
          </div>

          <button
            onClick={handleExecuteWarp}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black rounded-xl text-xs font-mono cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>🚀</span>
            <span>{selectedSystemId === 'euclid-prime' ? '현재 성계 순항' : '성간 하이퍼스페이스 도약 실행'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
