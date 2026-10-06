import React, { useState } from 'react';
import { Menu, Shield, Flame, Heart, Compass, MapPin, Navigation, HelpCircle, X } from 'lucide-react';
import { FloatingText, game } from '../gameEngine';
import { PlanetEntity } from '../types';
import { AudioSys } from '../audio';
import { PlanetaryMinimap } from './PlanetaryMinimap';

interface MobileHUDProps {
  locationName: string;
  subLocation: string;
  units: number;
  nanites: number;
  quicksilver: number;
  taintedMetal: number;
  shield: number;
  maxShield: number;
  hazard: number;
  lifeSupport: number;
  activePlanet: PlanetEntity | null;
  gameState: 'SPACE' | 'PLANET' | 'WARP';
  isStormActive: boolean;
  stormCountdown: number;
  cargoScanTimer: number;
  pirateCountdown: number;
  sentinelAlert?: number;
  overheat?: number;
  isOverheated?: boolean;
  interactLabel: string | null;
  floatingTexts: FloatingText[];
  onOpenDrawer: () => void;
  isAutoPilot?: boolean;
  autoPilotTargetPlanet?: PlanetEntity | null;
  autoPilotPlanetStartTime?: number;
  cameraZoom?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onOpenArsenal?: () => void;
  onOpenDifficulty?: () => void;
}

export const MobileHUD: React.FC<MobileHUDProps> = ({
  locationName,
  subLocation,
  units,
  nanites,
  quicksilver,
  taintedMetal,
  shield,
  maxShield,
  hazard,
  lifeSupport,
  activePlanet,
  gameState,
  isStormActive,
  stormCountdown,
  cargoScanTimer,
  pirateCountdown,
  sentinelAlert = 0,
  overheat = 0,
  isOverheated = false,
  interactLabel,
  floatingTexts,
  onOpenDrawer,
  isAutoPilot = false,
  autoPilotTargetPlanet = null,
  autoPilotPlanetStartTime = 0,
  cameraZoom = 1.0,
  onZoomIn = () => game.zoomIn(),
  onZoomOut = () => game.zoomOut(),
  onResetZoom = () => game.resetZoom(),
  onOpenArsenal,
  onOpenDifficulty
}) => {
  const [showLandingGuide, setShowLandingGuide] = useState(false);

  // AutoPilot time calculations
  const autoPilotElapsed = isAutoPilot && autoPilotPlanetStartTime ? Math.max(0, Math.floor((Date.now() - autoPilotPlanetStartTime) / 1000)) : 0;
  const autoPilotRemaining = Math.max(0, 180 - autoPilotElapsed);
  const elapsedMin = Math.floor(autoPilotElapsed / 60);
  const elapsedSec = autoPilotElapsed % 60;
  const remainMin = Math.floor(autoPilotRemaining / 60);
  const remainSec = autoPilotRemaining % 60;

  // Get nearest planet in space
  const nearestInfo = gameState === 'SPACE' ? game.getNearestPlanet() : null;
  const nearestPlanet = nearestInfo?.planet;
  const nearestDist = nearestInfo?.distance ?? 0;
  const insidePlanet = gameState === 'SPACE' ? game.getPlanetInAtmosphere() : null;
  const isInsidePlanet = Boolean(insidePlanet);
  const isLandingReady = Boolean(isInsidePlanet || (nearestPlanet && nearestDist < nearestPlanet.r + 380));

  const displayLocation = isInsidePlanet
    ? `🪐 ${insidePlanet?.name}`
    : locationName;
  const displaySubLocation = isInsidePlanet
    ? `대기권 저공 비행 // ${insidePlanet?.type}`
    : subLocation;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-2 sm:p-3 select-none">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-1.5 sm:gap-2 pointer-events-auto max-w-full overflow-hidden">
        {/* Left: Location & Biome + Compact Minimap (Top-Left) */}
        <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto flex-wrap sm:flex-nowrap">
          {/* Small Minimap Radar (Click to enlarge) */}
          <PlanetaryMinimap
            game={game}
            gameState={gameState}
            activePlanet={activePlanet}
            cameraZoom={cameraZoom}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onResetZoom={onResetZoom}
          />

          <div className="flex flex-col bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-cyan-400/30 max-w-[140px] xs:max-w-[170px] sm:max-w-xs shadow-md">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00e5ff] animate-ping shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold tracking-wider text-white nms-header-font truncate">
                {displayLocation}
              </span>
            </div>
            <span className="text-[8px] sm:text-[9px] text-cyan-300/80 font-mono tracking-wide truncate">
              {displaySubLocation}
            </span>
          </div>

          {/* Landing Guide Help Button */}
          <button
            onClick={() => {
              AudioSys.playNote(540, 'sine', 0.1);
              setShowLandingGuide(true);
            }}
            className="h-8 sm:h-9 px-1.5 sm:px-2 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-400/50 rounded-lg flex items-center gap-1 text-[9px] font-mono font-bold cursor-pointer active:scale-95 shadow-md backdrop-blur-md shrink-0"
            title="행성 착륙 방법 가이드"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="hidden xs:inline sm:inline">착륙가이드</span>
          </button>

          {/* AI Demo Showcase Toggle Button */}
          <button
            onClick={() => {
              AudioSys.unlockOnFirstInteraction();
              if (isAutoPilot) {
                game.disengageAutoPilot();
              } else {
                game.engageAutoPilot();
              }
            }}
            className={`h-8 sm:h-9 px-1.5 sm:px-2 rounded-lg flex items-center gap-1 text-[9px] font-mono font-bold cursor-pointer active:scale-95 shadow-md backdrop-blur-md shrink-0 border transition-all ${
              isAutoPilot
                ? 'bg-rose-950/90 hover:bg-rose-900 border-rose-400 text-rose-300 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-400/60 text-cyan-200 hover:text-white shadow-[0_0_10px_rgba(0,229,255,0.3)]'
            }`}
            title={isAutoPilot ? '데모플레이 정지 (수동 조작)' : 'AI 24단계 전 기능 데모플레이 시작'}
          >
            <span className="text-xs">🎬</span>
            <span className="font-mono text-[9px]">{isAutoPilot ? '데모중지' : '데모'}</span>
          </button>
        </div>

        {/* Center: In-Space Planet Navigation & Auto-Align Bar */}
        {gameState === 'SPACE' && nearestPlanet && (
          <div className={`flex items-center justify-center gap-1.5 sm:gap-2 backdrop-blur-md px-3 py-1.5 rounded-full border shadow-lg transition-all animate-in fade-in duration-200 ${
            isInsidePlanet
              ? 'bg-emerald-950/95 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.5)]'
              : 'bg-slate-950/90 border-cyan-400/60 shadow-[0_0_20px_rgba(0,229,255,0.3)]'
          }`}>
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-base">{isInsidePlanet ? '🛬' : '🪐'}</span>
              <span className="font-bold text-white truncate max-w-[110px] sm:max-w-[150px]">
                {insidePlanet ? insidePlanet.name : nearestPlanet.name}
              </span>
              <span className={`text-[10px] font-bold font-mono ${isInsidePlanet ? 'text-emerald-400' : 'text-yellow-400'}`}>
                {isInsidePlanet ? '대기권 비행 중' : `${nearestDist.toLocaleString()}u`}
              </span>
              <span className="text-[9px] text-cyan-300/80 hidden md:inline">
                [{insidePlanet ? insidePlanet.type : nearestPlanet.type}]
              </span>
            </div>

            {/* In-Planet Direct Landing Button ("그 상태에서 착륙버튼 표시") */}
            {isInsidePlanet ? (
              <button
                onClick={() => {
                  AudioSys.unlockOnFirstInteraction();
                  game.landCurrentShip(insidePlanet);
                }}
                className="px-3 py-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 text-black font-black rounded-full text-xs font-mono flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.9)] animate-bounce whitespace-nowrap"
                title="현재 위치에 비행기 착륙 [E]"
              >
                <span>🛬 지금 착륙</span>
                <span className="text-[9px] bg-black/20 px-1 rounded text-black font-mono">[E]</span>
              </button>
            ) : (
              <>
                {/* Quick Auto-Align Direction Button */}
                <button
                  onClick={() => {
                    AudioSys.unlockOnFirstInteraction();
                    game.alignToNearestPlanet();
                  }}
                  className="px-2.5 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-bold rounded-full text-[10px] font-mono flex items-center gap-1 cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(0,229,255,0.4)] whitespace-nowrap"
                >
                  <Navigation className="w-3 h-3 text-cyan-200 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>방향 정렬</span>
                </button>

                {/* Direct Land Button */}
                {isLandingReady && (
                  <button
                    onClick={() => {
                      AudioSys.unlockOnFirstInteraction();
                      game.enterAtmosphere(nearestPlanet);
                    }}
                    className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-bold rounded-full text-[10px] font-mono flex items-center gap-1 cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse whitespace-nowrap"
                  >
                    <span>🛬 대기권 착륙</span>
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Center: In-Planet Exosuit Human Mode Indicator & Takeoff Button */}
        {gameState === 'PLANET' && (
          <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <span className="text-base">👤</span>
              <span className="font-bold text-emerald-300">
                엑소슈트
              </span>
              {/* Active Weapon Tracking Indicator */}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 bg-black/60 border-white/20">
                <span className={
                  game.data.toolMode === 'MINING BEAM' ? 'text-emerald-400' :
                  game.data.toolMode === 'BOLTCASTER' ? 'text-red-400' :
                  game.data.toolMode === 'TERRAIN MANIPULATOR' ? 'text-sky-400' : 'text-purple-400'
                }>
                  🎯 {game.data.toolMode === 'MINING BEAM' ? '광맥 추적' :
                      game.data.toolMode === 'BOLTCASTER' ? '센티넬 조준' :
                      game.data.toolMode === 'TERRAIN MANIPULATOR' ? '동굴/지형' : '외계동물'}
                </span>
              </span>
            </div>

            {/* Quick Takeoff to Space Flight Button */}
            <button
              onClick={() => {
                AudioSys.unlockOnFirstInteraction();
                game.launchToOrbit();
              }}
              className="px-3 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-bold rounded-full text-[10px] font-mono flex items-center gap-1 cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(0,229,255,0.4)] whitespace-nowrap"
              title="우주선에 탑승하여 궤도로 발사 (비행기 모드 전환)"
            >
              <span>🚀 우주선 탑승 / 발사</span>
            </button>
          </div>
        )}

        {/* Right: Sentinel 5-Tier Diamond Indicators & Currency summary & Command Hub Drawer Button */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
          {/* Sentinel 5-Tier Diamond Indicators */}
          <div id="sentinel-alert-container" className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md px-1.5 sm:px-2 py-1 rounded-lg border border-red-500/30 shadow-md">
            <span className="text-[8.5px] font-bold font-mono text-red-400 mr-0.5 hidden sm:inline">센티넬</span>
            {[1, 2, 3, 4, 5].map((tier) => (
              <div
                key={tier}
                className={`sentinel-diamond ${sentinelAlert >= tier ? 'active' : ''}`}
                title={`센티넬 위협 레벨 ${tier}`}
              />
            ))}
          </div>

          {/* Compact Currency Badges */}
          <div className="hidden xs:flex sm:flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[9px] font-mono shadow-md">
            <span className="text-yellow-400 font-bold">
              {units >= 1000000 ? `${(units / 1000000).toFixed(1)}M` : units >= 1000 ? `${(units / 1000).toFixed(1)}k` : units} ₩
            </span>
            <span className="text-cyan-300 font-bold">
              {nanites >= 1000 ? `${(nanites / 1000).toFixed(1)}k` : nanites} ⬡
            </span>
            {quicksilver > 0 && <span className="text-purple-400 font-bold">{quicksilver} ◈</span>}
          </div>

          {/* v5.50.0 Combat Arsenal Command Matrix Quick Button */}
          {onOpenArsenal && (
            <button
              onClick={() => {
                AudioSys.unlockOnFirstInteraction();
                onOpenArsenal();
              }}
              className="h-8 sm:h-9 px-1.5 sm:px-2 bg-gradient-to-r from-orange-600/90 to-amber-600/90 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-lg border border-orange-300/80 text-[9.5px] sm:text-xs flex items-center gap-1 shadow-[0_0_15px_rgba(249,115,22,0.4)] active:scale-95 cursor-pointer backdrop-blur-md shrink-0"
              title="다목적 도구 전투 화기 4-탭 사령부 매트릭스 [Alt+X / /]"
            >
              <span>🔫</span>
              <span className="font-mono text-[9px] font-extrabold hidden xs:inline sm:inline">화기</span>
            </button>
          )}

          {/* v5.51.0 Waypoint 4.0 Custom Difficulty Quick Button */}
          {onOpenDifficulty && (
            <button
              onClick={() => {
                AudioSys.unlockOnFirstInteraction();
                onOpenDifficulty();
              }}
              className="h-8 sm:h-9 px-1.5 sm:px-2 bg-gradient-to-r from-amber-600/90 to-yellow-600/90 hover:from-amber-500 hover:to-yellow-500 text-white font-bold rounded-lg border border-amber-300/80 text-[9.5px] sm:text-xs flex items-center gap-1 shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer backdrop-blur-md shrink-0"
              title="커스텀 난이도 & 10대 게임플레이 조절 매트릭스 [F9]"
            >
              <span>⚙️</span>
              <span className="font-mono text-[9px] font-extrabold hidden xs:inline sm:inline">
                {game.data.difficultySettings?.preset || 'NORMAL'}
              </span>
            </button>
          )}

          {/* Quick Menu Button (Opens Full Mobile Drawer) */}
          <button
            onClick={onOpenDrawer}
            className="h-8 sm:h-9 px-2 sm:px-2.5 bg-gradient-to-r from-cyan-600/90 to-blue-600/90 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg border border-cyan-300 text-xs flex items-center gap-1 shadow-[0_0_15px_rgba(0,229,255,0.4)] active:scale-95 cursor-pointer backdrop-blur-md shrink-0"
          >
            <Menu className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px] tracking-wider font-extrabold">메뉴</span>
          </button>
        </div>
      </div>

      {/* Warnings & Banners Center */}
      <div className="flex flex-col items-center gap-2 my-auto pointer-events-none">
        {/* Storm Warning */}
        {stormCountdown > 0 && (
          <div className="bg-red-950/90 border-2 border-amber-400 px-4 py-2 rounded-lg text-center shadow-[0_0_25px_rgba(245,158,11,0.5)] animate-pulse">
            <span className="text-[10px] font-bold text-amber-300 tracking-widest block">⚠️ 행성 극한 폭풍 경보</span>
            <span className="text-xs font-bold text-white font-mono">폭풍 접근 중: {(stormCountdown / 60).toFixed(1)}s</span>
          </div>
        )}

        {/* Sentinel Cargo Scan Warning */}
        {cargoScanTimer > 0 && (
          <div className="bg-red-950/90 border-2 border-red-500 px-4 py-2 rounded-lg text-center shadow-[0_0_25px_rgba(239,68,68,0.6)] animate-pulse">
            <span className="text-[10px] font-bold text-red-300 tracking-widest block">⚠️ 센티넬 화물 불법 밀수 스캔 중!</span>
            <span className="text-xs font-bold text-white font-mono">[C 교란] 버튼을 눌러 스캔을 방해하세요!</span>
          </div>
        )}

        {/* Pirate Threat Warning */}
        {pirateCountdown > 0 && (
          <div className="bg-red-950/90 border-2 border-red-500 px-4 py-2 rounded-lg text-center shadow-[0_0_25px_rgba(239,68,68,0.6)] animate-pulse">
            <span className="text-[10px] font-bold text-red-400 tracking-widest block">⚠️ 해적 우주선 위협 벡터 감지</span>
            <span className="text-xs font-bold text-white font-mono">적기 워프 출현: {(pirateCountdown / 60).toFixed(1)}s</span>
          </div>
        )}

        {/* In-Planet Airplane Flight & Landing Banner */}
        {isInsidePlanet && gameState === 'SPACE' && (
          <div className="bg-emerald-950/95 border-2 border-emerald-400 px-5 py-2 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.7)] backdrop-blur-md animate-bounce text-center pointer-events-auto">
            <span className="text-xs sm:text-sm font-extrabold text-emerald-300 font-mono tracking-wider block">
              🛬 [{insidePlanet?.name}] 대기권 진입! (저공 비행 모드)
            </span>
            <div className="text-[11px] text-white font-mono flex items-center justify-center gap-1.5 mt-0.5">
              <span>원하는 위치에서</span>
              <button
                onClick={() => {
                  AudioSys.unlockOnFirstInteraction();
                  if (insidePlanet) game.landCurrentShip(insidePlanet);
                }}
                className="px-2.5 py-0.5 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-md shadow-md active:scale-95 cursor-pointer"
              >
                [🛬 지금 착륙]
              </button>
              <span>또는 [E] 키를 누르세요</span>
            </div>
          </div>
        )}

        {/* Orbit Approach Landing Ready Banner */}
        {!isInsidePlanet && isLandingReady && gameState === 'SPACE' && (
          <div className="bg-emerald-950/95 border-2 border-emerald-400 px-4 py-2 rounded-full shadow-[0_0_25px_rgba(16,185,129,0.6)] backdrop-blur-md animate-bounce text-center pointer-events-auto">
            <span className="text-xs font-bold text-emerald-300 font-mono tracking-wider block">
              ✨ [{nearestPlanet?.name}] 대기권 궤도 접근
            </span>
            <span className="text-[10px] text-white font-mono">
              전진하여 행성에 진입(저공 비행)하거나 상단 [대기권 착륙]을 누르세요
            </span>
          </div>
        )}

        {/* Interact Target Banner */}
        {interactLabel && !isLandingReady && (
          <div className="bg-slate-950/90 border border-cyan-400/70 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(0,229,255,0.4)] backdrop-blur-md animate-bounce">
            <span className="text-xs font-bold text-cyan-300 font-mono tracking-wider">
              {interactLabel}
            </span>
          </div>
        )}
      </div>



      {/* Landing Guide Modal Popup */}
      {showLandingGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
          <div className="w-full max-w-md bg-slate-950 border-2 border-cyan-400 rounded-2xl p-5 shadow-[0_0_40px_rgba(0,229,255,0.4)] font-mono text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-white nms-header-font">
                <Compass className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>행성 탐색 및 착륙 가이드</span>
              </div>
              <button
                onClick={() => setShowLandingGuide(false)}
                className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-gray-200 leading-relaxed">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-cyan-400/30">
                <span className="text-cyan-300 font-bold block mb-1">1단계: 네비게이션 화살표 확인</span>
                <span>
                  화면 테두리에 실시간으로 표시되는 <strong>네온 네비게이션 화살표</strong>와 우주선 주변 나침반 링이 인근 행성의 정확한 방향과 거리(u)를 가리킵니다.
                  상단의 <strong>[방향 정렬]</strong> 버튼을 누르면 기수가 행성으로 자동 조향됩니다!
                </span>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-amber-400/30">
                <span className="text-amber-300 font-bold block mb-1">2단계: 펄스 부스트로 고속 비행</span>
                <span>
                  우측 하단의 <strong>[펄스부스트]</strong> 버튼(또는 스페이스바)을 누르면 초광속 펄스 항법으로 36 u/s 속도로 행성을 향해 쾌속 비행합니다.
                </span>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-emerald-400/30">
                <span className="text-emerald-300 font-bold block mb-1">3단계: [E] 버튼 길게 누름 (착륙)</span>
                <span>
                  행성 대기권 380u 이내로 접근하면 화면에 대기권 진입 표시가 뜨고 우측에 큰 <strong>[E] 버튼</strong>이 빛납니다.
                  <strong>[E] 버튼을 약 1초간 길게 누르면(Hold)</strong> 대기권을 돌파하여 지표면에 안전하게 착륙하고 엑소슈트 보행 모드로 전환됩니다!
                </span>
              </div>

              <div className="p-2 bg-black/50 rounded border border-white/5 text-[10px] text-gray-400">
                💡 행성에서 다시 우주로 나갈 때: 착륙한 지점에 서 있는 우주선 근처에서 [E]를 누르거나 키보드 [T] 키를 누르면 즉시 궤도로 발사됩니다.
              </div>
            </div>

            <button
              onClick={() => {
                setShowLandingGuide(false);
                if (gameState === 'SPACE') game.alignToNearestPlanet();
              }}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md text-center"
            >
              확인 // 인근 행성으로 방향 정렬
            </button>
          </div>
        </div>
      )}

      {/* Floating text elements */}
      {floatingTexts.map((ft) => (
        <div
          key={ft.id}
          className="float-text"
          style={{
            left: ft.x,
            top: ft.y,
            color: ft.color
          }}
        >
          {ft.text}
        </div>
      ))}
    </div>
  );
};
