import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  Eye,
  Radio,
  Sparkles,
  Orbit,
  Zap,
  HelpCircle,
  X,
  Navigation,
  Compass,
  Globe,
  Disc,
  Wrench,
  Anchor,
  Flame,
  Check,
  Package,
  FileText,
  ShieldAlert,
  Waves,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ThreeGameEngine, CameraViewMode, Three3DSceneMode } from '../three/ThreeGameEngine';
import { game } from '../gameEngine';
import { ShipType } from '../types';
import { AudioSys } from '../audio';

interface ThreeCanvasProps {
  onToggleDimension?: () => void;
  is3DActive: boolean;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ onToggleDimension, is3DActive }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ThreeGameEngine | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('CHASE');
  const [activeSpeed, setActiveSpeed] = useState(0);
  const [isPulseActive, setIsPulseActive] = useState(false);
  const [showControlGuide, setShowControlGuide] = useState(false);
  const [gameState, setGameState] = useState(game.currState);
  const [active3DScene, setActive3DScene] = useState<Three3DSceneMode>('FLIGHT');
  const [selectedColorHex, setSelectedColorHex] = useState<number>(0xcc2936);
  const [isScenePanelCollapsed, setIsScenePanelCollapsed] = useState(game.isAutoPilot);

  // Pointer drag state
  const isPointerDownRef = useRef(false);
  const lastPointerPosRef = useRef({ x: 0, y: 0 });
  const lastDemoPhaseRef = useRef<string | null>(null);

  // Initialize ThreeGameEngine on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const threeEngine = new ThreeGameEngine(canvasRef.current);
    engineRef.current = threeEngine;

    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current || !engineRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      engineRef.current.resize(rect.width, rect.height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    // Render loop
    let animId: number;
    const loop = () => {
      if (engineRef.current && is3DActive) {
        engineRef.current.render();
        const currentSpeed = Math.hypot(game.player.vx, game.player.vy);
        setActiveSpeed(Math.round(currentSpeed * 120));
        setIsPulseActive(Boolean(game.data.isPulseActive));
        setGameState(game.currState);

        // Sync with Demo Showcase Phase when demo tour is running
        if (game.isAutoPilot && game.data.demoShowcase.isActive) {
          const phase = game.data.demoShowcase.phase;
          const phaseChanged = lastDemoPhaseRef.current !== phase;
          if (phaseChanged) {
            lastDemoPhaseRef.current = phase;
          }

          if (phase === 'DERELICT_FREIGHTER') {
            if (engineRef.current.current3DSceneMode !== 'DERELICT_FREIGHTER' || phaseChanged) {
              engineRef.current.set3DSceneMode('DERELICT_FREIGHTER');
              setActive3DScene('DERELICT_FREIGHTER');
            }
          } else if (phase === 'EVA_SPACEWALK') {
            if (engineRef.current.current3DSceneMode !== 'EVA_SPACEWALK' || phaseChanged) {
              engineRef.current.set3DSceneMode('EVA_SPACEWALK');
              setActive3DScene('EVA_SPACEWALK');
            }
          } else if (phase === 'BLACK_HOLE') {
            if (engineRef.current.current3DSceneMode !== 'BLACK_HOLE' || phaseChanged) {
              engineRef.current.set3DSceneMode('BLACK_HOLE');
              setActive3DScene('BLACK_HOLE');
            }
          } else if (phase === 'SPACE_STATION') {
            if (engineRef.current.current3DSceneMode !== 'SPACE_STATION' || phaseChanged) {
              engineRef.current.set3DSceneMode('SPACE_STATION');
              setActive3DScene('SPACE_STATION');
            }
          } else if (['STARSHIP_CYCLE', 'SHIP_FABRICATION', 'SOLAR_SAIL'].includes(phase)) {
            if (engineRef.current.current3DSceneMode !== 'SHIP_HANGAR' || phaseChanged) {
              engineRef.current.set3DSceneMode('SHIP_HANGAR');
              setActive3DScene('SHIP_HANGAR');
            }
          } else if (phase === 'GALAXY_MAP') {
            if (engineRef.current.current3DSceneMode !== 'GALAXY_MAP' || phaseChanged) {
              engineRef.current.set3DSceneMode('GALAXY_MAP');
              setActive3DScene('GALAXY_MAP');
            }
          } else if (phase === 'AQUARIUS_FISHING') {
            if (engineRef.current.current3DSceneMode !== 'OCEAN_FISHING' || phaseChanged) {
              engineRef.current.set3DSceneMode('OCEAN_FISHING');
              setActive3DScene('OCEAN_FISHING');
            }
          } else if (['BASE_BUILDING', 'BUILD_MENU_SYSTEM'].includes(phase)) {
            if (engineRef.current.current3DSceneMode !== 'BASE_BUILDING' || phaseChanged) {
              engineRef.current.set3DSceneMode('BASE_BUILDING');
              setActive3DScene('BASE_BUILDING');
            }
          } else if (game.currState === 'PLANET' && !['OCEAN_FISHING', 'BASE_BUILDING', 'FAUNA_INSPECT'].includes(engineRef.current.current3DSceneMode)) {
            if (engineRef.current.current3DSceneMode !== 'PLANET' || phaseChanged) {
              engineRef.current.set3DSceneMode('PLANET');
              setActive3DScene('PLANET');
            }
          } else {
            // Space Flight phases (STARSHIP_WEAPONS, SPACE_COMBAT, SPACE_PULSE, PIRATE_DREADNOUGHT, etc.)
            if (engineRef.current.current3DSceneMode !== 'FLIGHT' || phaseChanged) {
              engineRef.current.set3DSceneMode('FLIGHT');
              setActive3DScene('FLIGHT');
            }
          }
        }
      }
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, [is3DActive]);

  // Pointer drag & position handlers for mouse & touch steering / camera look
  const updatePointerNormalized = (clientX: number, clientY: number, isActive: boolean) => {
    if (!engineRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      const normX = ((clientX - rect.left) / rect.width) * 2 - 1; // -1 (left) ~ +1 (right)
      const normY = -(((clientY - rect.top) / rect.height) * 2 - 1); // +1 (top) ~ -1 (bottom)
      engineRef.current.pointerNormalized.x = Math.max(-1, Math.min(1, normX));
      engineRef.current.pointerNormalized.y = Math.max(-1, Math.min(1, normY));
      engineRef.current.pointerActive = isActive;
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDownRef.current = true;
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

    if (engineRef.current) {
      engineRef.current.isPointerDown = true;
      updatePointerNormalized(e.clientX, e.clientY, true);
      if (game.currState === 'SPACE') {
        engineRef.current.fireLaser();
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!engineRef.current) return;

    if (isPointerDownRef.current) {
      const dx = e.clientX - lastPointerPosRef.current.x;
      const dy = e.clientY - lastPointerPosRef.current.y;
      lastPointerPosRef.current = { x: e.clientX, y: e.clientY };

      engineRef.current.mouseLookDelta = { x: dx, y: dy };
      updatePointerNormalized(e.clientX, e.clientY, true);
    } else if (game.currState === 'SPACE') {
      updatePointerNormalized(e.clientX, e.clientY, false);
    }
  };

  const handlePointerUpOrCancel = () => {
    isPointerDownRef.current = false;
    if (engineRef.current) {
      engineRef.current.isPointerDown = false;
      engineRef.current.pointerActive = false;
      engineRef.current.mouseLookDelta = { x: 0, y: 0 };
      engineRef.current.pointerNormalized = { x: 0, y: 0 };
    }
  };

  // Cycle Camera Mode
  const handleCycleCamera = useCallback(() => {
    if (!engineRef.current) return;
    const modes: CameraViewMode[] = ['CHASE', 'COCKPIT', 'ORBIT'];
    const nextIdx = (modes.indexOf(cameraMode) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    engineRef.current.cameraMode = nextMode;
    setCameraMode(nextMode);
    game.spawnFloatText(`카메라: ${nextMode === 'CHASE' ? '3인칭 추적' : nextMode === 'COCKPIT' ? '1인칭 조종석' : '자유 궤도'}`, game.player.x, game.player.y, '#38bdf8');
  }, [cameraMode]);

  // Trigger 3D Scanner Wave
  const handleScan = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.triggerScanner();
    game.spawnFloatText('📡 3D 전방위 지형 스캔 펄스 방출', game.player.x, game.player.y, '#00f5ff');
  }, []);

  // Change 3D Scene Mode
  const switch3DScene = (scene: Three3DSceneMode) => {
    setActive3DScene(scene);
    if (engineRef.current) {
      engineRef.current.set3DSceneMode(scene);
    }
    AudioSys.playNote(540, 'sine', 0.12);
  };

  // Starship Color Palettes
  const shipColorPalettes = [
    { name: '아틀라스 화이트', hex: 0xf8fafc, bg: 'bg-slate-100' },
    { name: '로열 골드', hex: 0xfacc15, bg: 'bg-yellow-400' },
    { name: '크림슨 레드', hex: 0xcc2936, bg: 'bg-rose-600' },
    { name: '보이드 바이올렛', hex: 0x9333ea, bg: 'bg-purple-600' },
    { name: '스텔스 블랙', hex: 0x0f172a, bg: 'bg-slate-900' },
    { name: '아웃로 사이언', hex: 0x06b6d4, bg: 'bg-cyan-400' },
  ];

  const handleApplyShipColor = (colorHex: number) => {
    setSelectedColorHex(colorHex);
    if (engineRef.current) {
      engineRef.current.setCustomShipColor(colorHex);
    }
    AudioSys.playRecharge();
    game.spawnFloatText('🎨 선체 메탈릭 도색 컬러웨이 적용 완료', undefined, undefined, '#38bdf8');
  };

  const handleSwitchShipType = (type: ShipType) => {
    game.data.shipType = type;
    if (engineRef.current) {
      engineRef.current.updateStarship(type, selectedColorHex);
    }
    AudioSys.playDiscoveryFanfare();
    game.spawnFloatText(`🛸 주력 함선 교체: [${type}] 도킹 완료`, undefined, undefined, '#facc15');
  };

  return (
    <div className={`absolute inset-0 w-full h-full pointer-events-auto ${is3DActive ? 'z-0' : '-z-10 opacity-0 pointer-events-none'}`}>
      {/* Three.js WebGL Canvas with Pointer Event Steering */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block touch-none cursor-crosshair select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrCancel}
        onPointerCancel={handlePointerUpOrCancel}
      />

      {/* Cryogenic Frost Vignette Overlay for Derelict Freighter Scene */}
      {active3DScene === 'DERELICT_FREIGHTER' && (
        <div className="absolute inset-0 pointer-events-none z-10 border-[16px] sm:border-[28px] border-cyan-500/20 shadow-[inset_0_0_100px_rgba(0,229,255,0.25)] mix-blend-screen animate-pulse" />
      )}

      {/* Planetary Atmosphere Re-entry Plasma Heat Shield Burn Overlay */}
      {game.getPlanetInAtmosphere() && (
        <div className="absolute inset-0 pointer-events-none z-10 border-[14px] sm:border-[24px] border-amber-500/30 shadow-[inset_0_0_80px_rgba(245,158,11,0.35)] mix-blend-screen animate-pulse" />
      )}

      {/* Hyper-Pulse Drive Warp Flare Vignette */}
      {isPulseActive && (
        <div className="absolute inset-0 pointer-events-none z-10 border-[10px] sm:border-[18px] border-cyan-400/25 shadow-[inset_0_0_120px_rgba(0,229,255,0.3)] mix-blend-screen animate-pulse" />
      )}

      {/* 1. First-Person 3D Cockpit Canopy HUD Overlay */}
      {cameraMode === 'COCKPIT' && (
        <div className="absolute inset-0 pointer-events-none select-none z-15 flex flex-col justify-between p-4 sm:p-8">
          {/* Top Canopy Arch Arc */}
          <div className="w-full flex justify-between items-center text-cyan-300 font-mono text-[10px] sm:text-xs tracking-wider opacity-85">
            <span className="flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded border border-cyan-500/30">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>NAV 074° // {isPulseActive ? 'HYPER-PULSE' : 'CRUISE'}</span>
            </span>
            <span className="bg-black/60 px-2.5 py-1 rounded border border-cyan-500/30">
              COCKPIT CANOPY MK-IV // HULL 100%
            </span>
          </div>

          {/* Center Flight Reticle & Crosshair */}
          <div className="relative flex items-center justify-center self-center w-36 h-36">
            {/* Speed Dial Ring */}
            <div className={`w-24 h-24 rounded-full border-2 border-cyan-400/60 flex items-center justify-center transition-all ${isPulseActive ? 'scale-125 border-cyan-200 animate-ping' : ''}`}>
              <div className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_12px_#00f5ff]" />
            </div>
            {/* Holographic Wing Marks */}
            <div className="absolute left-1 w-5 h-0.5 bg-cyan-400/90 rounded" />
            <div className="absolute right-1 w-5 h-0.5 bg-cyan-400/90 rounded" />
            <div className="absolute top-3 w-0.5 h-4 bg-cyan-400/90 rounded" />
            <div className="absolute -bottom-8 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 border border-cyan-400/50 text-xs font-mono font-bold text-cyan-200 shadow-md">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>{isPulseActive ? '초광속 펄스' : `${activeSpeed} u/s`}</span>
            </div>
          </div>

          {/* Bottom Cockpit Instrument Dials */}
          <div className="w-full flex justify-between items-end text-[11px] font-mono text-cyan-200">
            <div className="p-2 rounded-lg bg-black/75 border border-cyan-500/40 backdrop-blur-sm space-y-0.5">
              <div className="text-[10px] text-cyan-400">DEFLECTOR SHIELD</div>
              <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden border border-cyan-400/30">
                <div className="h-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" style={{ width: `${(game.data.shield / game.data.maxShield) * 100}%` }} />
              </div>
            </div>
            <div className="p-2 rounded-lg bg-black/75 border border-amber-500/40 backdrop-blur-sm space-y-0.5 text-right">
              <div className="text-[10px] text-amber-300">HYPERDRIVE CORE</div>
              <div className="text-amber-200 font-bold">100% READY // 150만 ly</div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top-Left Floating 3D Controls Ribbon (카메라 시점 & 조작 안내) */}
      <div className="absolute top-11 xs:top-12 sm:top-14 left-2 sm:left-4 z-25 flex items-center gap-1 sm:gap-1.5 pointer-events-auto">
        {/* Camera Mode Toggle */}
        <button
          onClick={handleCycleCamera}
          className="flex items-center gap-1 sm:gap-1.5 px-2 xs:px-2.5 sm:px-3 py-1 xs:py-1.5 rounded-lg bg-slate-900/85 hover:bg-slate-800 border border-cyan-400/40 text-slate-200 text-[10px] xs:text-[11px] sm:text-xs font-mono font-semibold shadow-md backdrop-blur-md active:scale-95 transition-all cursor-pointer"
          title="카메라 시점 변경 [3인칭 / 1인칭 조종석 / 자유 궤도]"
        >
          {cameraMode === 'CHASE' && <Camera className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-blue-400" />}
          {cameraMode === 'COCKPIT' && <Eye className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-amber-400" />}
          {cameraMode === 'ORBIT' && <Orbit className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-emerald-400" />}
          <span>{cameraMode === 'CHASE' ? '3인칭' : cameraMode === 'COCKPIT' ? '1인칭' : '궤도'}</span>
        </button>

        {/* Control Guide Toggle (데모 모드에서는 화면 가림 방지를 위해 조작 가이드 숨김) */}
        {!game.isAutoPilot && (
          <button
            onClick={() => setShowControlGuide(!showControlGuide)}
            className="flex items-center gap-1 px-2 xs:px-2.5 py-1 xs:py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] xs:text-[11px] sm:text-xs font-mono backdrop-blur-md active:scale-95 transition-all cursor-pointer"
            title="3D 조작 체계 안내 가이드"
          >
            <HelpCircle className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-amber-400" />
            <span className="hidden xs:inline sm:inline">조작법</span>
          </button>
        )}
      </div>

      {/* 3. Top-Right Active 3D Scene Interactive Overlay Panel */}
      {active3DScene !== 'FLIGHT' && active3DScene !== 'PLANET' && (
        isScenePanelCollapsed ? (
          <aside
            aria-label="3D 인터랙티브 패널 (접힘)"
            className="absolute top-11 xs:top-12 sm:top-14 right-2 sm:right-4 z-35 pointer-events-auto"
          >
            <button
              onClick={() => setIsScenePanelCollapsed(false)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/90 hover:bg-slate-900 border border-cyan-400/60 shadow-xl backdrop-blur-md text-cyan-200 text-[10px] sm:text-xs font-mono font-bold active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>
                {active3DScene === 'DERELICT_FREIGHTER' ? '☠️ 난파 화물선' :
                 active3DScene === 'EVA_SPACEWALK' ? '🌌 EVA 유영' :
                 active3DScene === 'SHIP_HANGAR' ? '🛸 함선 도색' :
                 active3DScene === 'BLACK_HOLE' ? '🕳️ 블랙홀' :
                 active3DScene === 'SPACE_STATION' ? '🏛️ 정거장 코어' :
                 active3DScene === 'GALAXY_MAP' ? '🗺️ 은하지도' : '🎣 심해 낚시'}
              </span>
              <ChevronDown className="w-3 h-3 text-cyan-300" />
            </button>
          </aside>
        ) : (
          <aside
            aria-label="3D 실시간 인터랙티브 패널"
            className="absolute top-11 xs:top-12 sm:top-14 right-2 sm:right-4 z-35 w-[calc(100vw-1rem)] max-w-xs sm:w-80 p-2.5 sm:p-3.5 rounded-xl bg-slate-950/95 border border-cyan-500/50 shadow-2xl backdrop-blur-xl text-white pointer-events-auto space-y-2 max-h-[50vh] sm:max-h-[75vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-1.5 text-xs font-bold font-mono truncate mr-1">
                {active3DScene === 'DERELICT_FREIGHTER' && <span className="text-amber-400">☠️ 난파 화물선 인양</span>}
                {active3DScene === 'EVA_SPACEWALK' && <span className="text-cyan-300">🌌 무중력 EVA 유영</span>}
                {active3DScene === 'SHIP_HANGAR' && <span className="text-amber-300">🛸 함선 격납고 & 도색</span>}
                {active3DScene === 'BLACK_HOLE' && <span className="text-purple-400">🕳️ 초거대 블랙홀 특이점</span>}
                {active3DScene === 'SPACE_STATION' && <span className="text-cyan-300">🏛️ 우주정거장 코어</span>}
                {active3DScene === 'GALAXY_MAP' && <span className="text-blue-300">🗺️ 3D 은하계 성간지도</span>}
                {active3DScene === 'OCEAN_FISHING' && <span className="text-teal-300">🎣 심해 수중 탐사 & 낚시</span>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setIsScenePanelCollapsed(true)}
                  className="p-1 rounded-md text-cyan-300 hover:text-white hover:bg-white/10 cursor-pointer"
                  title="패널 최소화 (3D 화면 보기)"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => switch3DScene(gameState === 'PLANET' ? 'PLANET' : 'FLIGHT')}
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                  title="비행 모드로 복귀"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          {/* Content by 3D Scene */}
          {active3DScene === 'DERELICT_FREIGHTER' && (
            <div className="space-y-2 text-xs font-mono">
              <div className="text-[11px] text-cyan-200">
                MS-7 헤스페로스 // 영하 48.5°C 극저온 진공 격실
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={() => {
                    game.data.units += 500000;
                    game.data.nanites += 1200;
                    game.data.inv.cargoBulkhead = (game.data.inv.cargoBulkhead || 0) + 1;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText('📦 중앙 메인프레임 화물 격벽 인양! (+500,000 ₩, +1,200 ⬡)', undefined, undefined, '#facc15');
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/50 text-amber-200 font-bold active:scale-95 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> 화물 격벽 인양</span>
                  <span className="text-[10px] text-amber-400">+50만₩</span>
                </button>
                <button
                  onClick={() => {
                    game.data.taintedMetal = (game.data.taintedMetal || 0) + 80;
                    game.data.nanites += 200;
                    AudioSys.playRecharge();
                    game.spawnFloatText('📜 승무원 일지 및 오염된 금속 +80 인양!', undefined, undefined, '#38bdf8');
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 active:scale-95 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> 승무원 보관함 수색</span>
                  <span className="text-[10px] text-cyan-300">+80금속</span>
                </button>
                <button
                  onClick={() => switch3DScene('EVA_SPACEWALK')}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400/50 text-cyan-200 font-bold active:scale-95 transition-all cursor-pointer text-[11px]"
                >
                  <span>🌌 외벽 캣워크 무중력 EVA 유영 전환</span>
                </button>
              </div>
            </div>
          )}

          {active3DScene === 'EVA_SPACEWALK' && (
            <div className="space-y-2 text-xs font-mono">
              <div className="text-[11px] text-cyan-200">
                화물선 선체 외벽 보도교 // 심우주 무중력 EVA
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  onClick={() => {
                    game.data.inv.tritium = (game.data.inv.tritium || 0) + 80;
                    AudioSys.playPulseDrive();
                    game.spawnFloatText('🛰️ 성간 가스 집진기 점검 완료 (+80 삼중수소)', undefined, undefined, '#38bdf8');
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-200 font-bold active:scale-95 transition-all cursor-pointer"
                >
                  <span>🛰️ 외벽 가스 집진기 점검</span>
                  <span className="text-[10px] text-cyan-300">+80 삼중수소</span>
                </button>
                <button
                  onClick={() => {
                    game.data.nanites += 300;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText('🔭 심우주 천문대 관측 기록 완료 (+300 ⬡)', undefined, undefined, '#facc15');
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 active:scale-95 transition-all cursor-pointer"
                >
                  <span>🔭 심우주 천문대 관측</span>
                  <span className="text-[10px] text-amber-300">+300 ⬡</span>
                </button>
                <button
                  onClick={() => switch3DScene('FLIGHT')}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 transition-all cursor-pointer text-[11px]"
                >
                  <span>🚀 에어록 복귀 & 우주선 탑승</span>
                </button>
              </div>
            </div>
          )}

          {active3DScene === 'SHIP_HANGAR' && (
            <div className="space-y-2.5 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block mb-1">4대 특수 함선 기종 선택:</span>
                <div className="grid grid-cols-2 gap-1">
                  {(['MECHANICAL', 'SOLAR', 'INTERCEPTOR', 'LIVING'] as ShipType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => handleSwitchShipType(t)}
                      className={`px-2 py-1 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                        game.data.shipType === t
                          ? 'bg-amber-500/30 border-amber-400 text-amber-300 shadow-sm'
                          : 'bg-slate-900 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t === 'MECHANICAL' ? '전투기' : t === 'SOLAR' ? '솔라선' : t === 'INTERCEPTOR' ? '센티넬' : '생체함선'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block mb-1">선체 메탈릭 도색 컬러웨이:</span>
                <div className="flex items-center gap-1.5">
                  {shipColorPalettes.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => handleApplyShipColor(c.hex)}
                      title={c.name}
                      className={`w-6 h-6 rounded-full ${c.bg} border-2 flex items-center justify-center transition-all cursor-pointer ${
                        selectedColorHex === c.hex ? 'scale-110 border-white shadow-[0_0_8px_white]' : 'border-black/40 opacity-80 hover:opacity-100'
                      }`}
                    >
                      {selectedColorHex === c.hex && <Check className="w-3 h-3 text-black font-extrabold" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  AudioSys.playPulseDrive();
                  game.spawnFloatText('🔥 펄스 드라이브 애프터버너 점화 시험 완료!', undefined, undefined, '#38bdf8');
                }}
                className="w-full flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400/50 text-cyan-200 font-bold active:scale-95 transition-all cursor-pointer text-[11px]"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>추진 엔진 분사 시험</span>
              </button>
            </div>
          )}

          {active3DScene === 'BLACK_HOLE' && (
            <div className="space-y-2 text-xs font-mono">
              <div className="text-[11px] text-purple-300">
                사건의 지평선 // 시공간 중력 왜곡률 99.8%
              </div>
              <button
                onClick={() => {
                  game.currState = 'WARP';
                  AudioSys.playDiscoveryFanfare();
                  game.spawnFloatText('🕳️ 특이점 돌파: 150만 광년 너머 성계로 초공간 워프!', undefined, undefined, '#bf5af2');
                  switch3DScene('WARP');
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold active:scale-95 transition-all cursor-pointer shadow-lg shadow-purple-950/60"
              >
                <Disc className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
                <span>특이점 엔진 점화 // 3D 시공간 도약</span>
              </button>
            </div>
          )}

          {active3DScene === 'SPACE_STATION' && (
            <div className="space-y-2 text-xs font-mono">
              <div className="text-[11px] text-cyan-200">
                오비탈 우주정거장 코어 // 은하 무역 터미널 연동
              </div>
              <button
                onClick={() => {
                  game.data.shield = game.data.maxShield;
                  game.data.hazard = 100;
                  game.data.lifeSupport = 100;
                  AudioSys.playRecharge();
                  game.spawnFloatText('⚡ 정거장 트랙터 빔 도킹: 쉴드 및 생명유지 완전 충전', undefined, undefined, '#00e5ff');
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400/50 text-cyan-200 font-bold active:scale-95 transition-all cursor-pointer"
              >
                <span>⚡ 쉴드 & 생명유지 완전 충전</span>
                <span className="text-[10px] text-cyan-300">100%</span>
              </button>
              <button
                onClick={() => {
                  game.data.units += 150000;
                  AudioSys.playDiscoveryFanfare();
                  game.spawnFloatText('💰 은하 무역 시세 차익 거래 완료 (+150,000 ₩)', undefined, undefined, '#facc15');
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-200 active:scale-95 transition-all cursor-pointer"
              >
                <span>💰 은하 무역 단말기 거래</span>
                <span className="text-[10px] text-amber-300">+15만₩</span>
              </button>
            </div>
          )}

          {active3DScene === 'GALAXY_MAP' && (
            <div className="space-y-2 text-xs font-mono">
              <div className="text-[11px] text-blue-300">
                은하 중심점 (Galactic Core) 거리: 698,420 ly
              </div>
              <button
                onClick={() => {
                  game.currState = 'WARP';
                  AudioSys.playDiscoveryFanfare();
                  game.spawnFloatText('🌌 성간 하이퍼드라이브 도약 점화 // 차원 워프 터널 진입', undefined, undefined, '#38bdf8');
                  switch3DScene('WARP');
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-extrabold active:scale-95 transition-all cursor-pointer shadow-lg shadow-blue-950/60"
              >
                <Orbit className="w-3.5 h-3.5 text-cyan-200 animate-spin" />
                <span>하이퍼드라이브 성간 도약 [WARP]</span>
              </button>
            </div>
          )}

          {active3DScene === 'OCEAN_FISHING' && (
            <div className="space-y-2 text-xs font-mono">
              <div className="text-[11px] text-teal-300">
                아쿠아리우스 심해 음파 탐지기 // 수심 142m
              </div>
              <button
                onClick={() => {
                  game.data.units += 75000;
                  game.data.nanites += 120;
                  AudioSys.playDiscoveryFanfare();
                  game.spawnFloatText('🐟 S급 발광 심해 가오리 낚시 성공! (+75,000 ₩, +120 ⬡)', undefined, undefined, '#2dd4bf');
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-teal-600/30 hover:bg-teal-600/50 border border-teal-400/50 text-teal-200 font-bold active:scale-95 transition-all cursor-pointer"
              >
                <span className="flex items-center gap-1.5"><Anchor className="w-3.5 h-3.5" /> 낚싯대 투척 & 입질 챔질</span>
                <span className="text-[10px] text-teal-300">+7.5만₩</span>
              </button>
            </div>
          )}
        </aside>
      )
    )}

      {/* 4. Bottom 3D Scene Selector Quick Ribbon (데모 모드에서는 화면 가림 방지를 위해 하단 바 숨김) */}
      {!game.isAutoPilot && (
        <nav
          aria-label="3D 모든 화면 씬 셀렉터 바"
          className="absolute bottom-12 sm:bottom-3 inset-x-0 z-35 flex justify-center pointer-events-none select-none px-2"
        >
          <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-full bg-slate-950/85 border border-cyan-400/40 shadow-2xl backdrop-blur-md overflow-x-auto max-w-[75vw] sm:max-w-full pointer-events-auto scrollbar-none">
            {[
              { id: 'FLIGHT', label: '성간비행', icon: '🚀' },
              { id: 'DERELICT_FREIGHTER', label: '난파화물선', icon: '☠️' },
              { id: 'EVA_SPACEWALK', label: '무중력EVA', icon: '🌌' },
              { id: 'BLACK_HOLE', label: '블랙홀', icon: '🕳️' },
              { id: 'SPACE_STATION', label: '우주정거장', icon: '🏛️' },
              { id: 'SHIP_HANGAR', label: '격납고도색', icon: '🛸' },
              { id: 'GALAXY_MAP', label: '3D은하지도', icon: '🗺️' },
              { id: 'PLANET', label: '행성탐사', icon: '🌍' },
              { id: 'OCEAN_FISHING', label: '심해낚시', icon: '🎣' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => switch3DScene(item.id as Three3DSceneMode)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                  active3DScene === item.id
                    ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/60 shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/10 border border-transparent'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {/* 5. No Man's Sky Authentic Controls Guide Popover */}
      {showControlGuide && (
        <div className="absolute top-28 left-4 z-50 max-w-sm p-4 rounded-xl bg-slate-950/95 border border-cyan-500/40 shadow-2xl backdrop-blur-xl text-slate-200 pointer-events-auto">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>노맨즈스카이(No Man's Sky) 3D 조작 체계</span>
            </span>
            <button
              onClick={() => setShowControlGuide(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 text-[11px] font-mono leading-relaxed">
            <div>
              <div className="font-bold text-amber-300 mb-1">🚀 3D 성간 우주선 비행 조작:</div>
              <ul className="space-y-1 text-slate-300 pl-1">
                <li>• <span className="text-cyan-300 font-bold">W / S</span>: 가속 순항 / 감속 브레이크</li>
                <li>• <span className="text-cyan-300 font-bold">A / D</span>: 좌/우 선회 및 롤 뱅킹 (<span className="text-amber-300 font-bold">A: 좌, D: 우</span>)</li>
                <li>• <span className="text-cyan-300 font-bold">모바일 조이스틱</span>: 좌우 밀기 시 우주선과 사람 모두 정확한 좌/우 선회 지원</li>
                <li>• <span className="text-cyan-300 font-bold">화면 드래그</span>: 피치(상하) 및 요(좌우) 조향</li>
                <li>• <span className="text-cyan-300 font-bold">Shift</span>: 부스터 애프터버너 분사</li>
                <li>• <span className="text-cyan-300 font-bold">Space</span>: 초광속 펄스 드라이브</li>
                <li>• <span className="text-cyan-300 font-bold">화면 클릭 / 발사</span>: 광자포 쌍발 레이저 사격</li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-emerald-300 mb-1">👤 3D 행성 표면 도보 탐사:</div>
              <ul className="space-y-1 text-slate-300 pl-1">
                <li>• <span className="text-cyan-300 font-bold">W / S</span>: 전진 / 후진 이동</li>
                <li>• <span className="text-cyan-300 font-bold">A / D</span>: 좌/우 스트레이프 및 시점 선회 (<span className="text-amber-300 font-bold">A: 좌, D: 우</span>)</li>
                <li>• <span className="text-cyan-300 font-bold">Space</span>: 제트팩 부스터 수직 상승</li>
                <li>• <span className="text-cyan-300 font-bold">클릭 유지</span>: 다목적 도구 채광 레이저 빔</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
