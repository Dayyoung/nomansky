import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Shield, Flame, Heart } from 'lucide-react';
import { game } from './gameEngine';
import { AudioSys } from './audio';
import { VirtualJoystick } from './components/VirtualJoystick';
import { ActionControls } from './components/ActionControls';
import { MobileHUD } from './components/MobileHUD';
import { MobileQuickDrawer } from './components/MobileQuickDrawer';
import { MobileModals } from './components/MobileModals';
import { DemoShowcaseHUD } from './components/DemoShowcaseHUD';
import { ToolMode, ShipType, DemoShowcaseState } from './types';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reactive state synced with game engine
  const [gameState, setGameState] = useState<'SPACE' | 'PLANET' | 'WARP'>('SPACE');
  const [units, setUnits] = useState(game.data.units);
  const [nanites, setNanites] = useState(game.data.nanites);
  const [quicksilver, setQuicksilver] = useState(game.data.quicksilver);
  const [taintedMetal, setTaintedMetal] = useState(game.data.taintedMetal);
  const [shield, setShield] = useState(game.data.shield);
  const [maxShield, setMaxShield] = useState(game.data.maxShield);
  const [hazard, setHazard] = useState(game.data.hazard);
  const [lifeSupport, setLifeSupport] = useState(game.data.lifeSupport);
  const [toolMode, setToolMode] = useState<ToolMode>(game.data.toolMode);
  const [shipType, setShipType] = useState<ShipType>(game.data.shipType);
  const [ammo, setAmmo] = useState(game.data.ammo);
  const [maxAmmo, setMaxAmmo] = useState(game.data.maxAmmo);
  const [overheat, setOverheat] = useState(game.data.overheat);
  const [isOverheated, setIsOverheated] = useState(game.data.isOverheated);
  const [isPulseActive, setIsPulseActive] = useState(game.data.isPulseActive);
  const [isVisorActive, setIsVisorActive] = useState(game.data.isVisorActive);
  const [interactLabel, setInteractLabel] = useState<string | null>(game.data.interactLabel);
  const [interactProgress, setInteractProgress] = useState(game.data.interactProgress);
  const [cargoScanTimer, setCargoScanTimer] = useState(game.data.cargoScanTimer);
  const [stormCountdown, setStormCountdown] = useState(game.data.stormCountdown);
  const [isStormActive, setIsStormActive] = useState(game.data.isStormActive);
  const [pirateCountdown, setPirateCountdown] = useState(game.data.pirateCountdown);
  const [sentinelAlert, setSentinelAlert] = useState(game.data.sentinelAlert || 0);
  const [floatingTexts, setFloatingTexts] = useState(game.data.floatingTexts);
  const [activePlanet, setActivePlanet] = useState(game.data.activePlanet);
  const [isAutoPilot, setIsAutoPilot] = useState(game.isAutoPilot);
  const [autoPilotTargetPlanet, setAutoPilotTargetPlanet] = useState(game.autoPilotTargetPlanet);
  const [autoPilotPlanetStartTime, setAutoPilotPlanetStartTime] = useState(game.autoPilotPlanetStartTime);
  const [cameraZoom, setCameraZoom] = useState(game.cameraZoom);
  const [isNautilonBoarded, setIsNautilonBoarded] = useState(game.data.nautilon.boarded);
  const [combatWeapons, setCombatWeapons] = useState(game.data.combatWeapons);
  const [secondaryWeapons, setSecondaryWeapons] = useState(game.data.secondaryWeapons);

  const touchDistRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1.0);

  // Mobile Drawers & Modals
  const [isQuickDrawerOpen, setIsQuickDrawerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [demoShowcase, setDemoShowcase] = useState<DemoShowcaseState>(game.data.demoShowcase);

  // Sync with engine
  const syncWithEngine = useCallback(() => {
    setGameState(game.currState);
    setUnits(game.data.units);
    setNanites(game.data.nanites);
    setQuicksilver(game.data.quicksilver);
    setTaintedMetal(game.data.taintedMetal);
    setShield(game.data.shield);
    setMaxShield(game.data.maxShield);
    setHazard(game.data.hazard);
    setLifeSupport(game.data.lifeSupport);
    setToolMode(game.data.toolMode);
    setShipType(game.data.shipType);
    setAmmo(game.data.ammo);
    setMaxAmmo(game.data.maxAmmo);
    setOverheat(game.data.overheat);
    setIsOverheated(game.data.isOverheated);
    setIsPulseActive(game.data.isPulseActive);
    setIsVisorActive(game.data.isVisorActive);
    setInteractLabel(game.data.interactLabel);
    setInteractProgress(game.data.interactProgress);
    setCargoScanTimer(game.data.cargoScanTimer);
    setStormCountdown(game.data.stormCountdown);
    setIsStormActive(game.data.isStormActive);
    setPirateCountdown(game.data.pirateCountdown);
    setSentinelAlert(game.data.sentinelAlert || 0);
    setFloatingTexts([...game.data.floatingTexts]);
    setActivePlanet(game.data.activePlanet);
    setIsAutoPilot(game.isAutoPilot);
    setAutoPilotTargetPlanet(game.autoPilotTargetPlanet);
    setAutoPilotPlanetStartTime(game.autoPilotPlanetStartTime);
    setCameraZoom(game.cameraZoom);
    setIsNautilonBoarded(game.data.nautilon.boarded);
    setCombatWeapons({ ...game.data.combatWeapons });
    setSecondaryWeapons({ ...game.data.secondaryWeapons });
    setDemoShowcase({ ...game.data.demoShowcase });

    // AI Demo Showcase Modal auto sync
    if (game.isAutoPilot && game.data.demoShowcase.isActive) {
      if (game.data.demoShowcase.activeModal !== activeModal) {
        setActiveModal(game.data.demoShowcase.activeModal);
      }
    }
  }, [activeModal]);

  useEffect(() => {
    const unsub = game.subscribe(syncWithEngine);
    return unsub;
  }, [syncWithEngine]);

  // Main Canvas Render & Animation Loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      game.update();
      if (canvasRef.current) {
        game.render(canvasRef.current);
      }
      syncWithEngine();
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [syncWithEngine]);

  // Keyboard Event Listeners for desktop fallback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      AudioSys.unlockOnFirstInteraction();
      game.notifyUserInput();
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') game.keyboard.w = 1;
      if (code === 'KeyS' || code === 'ArrowDown') game.keyboard.s = 1;
      if (code === 'KeyA' || code === 'ArrowLeft') game.keyboard.a = 1;
      if (code === 'KeyD' || code === 'ArrowRight') game.keyboard.d = 1;
      if (code === 'Space') game.keyboard.space = 1;
      if (code === 'ShiftLeft' || code === 'ShiftRight') game.keyboard.shift = 1;
      if (code === 'KeyE') game.keyboard.e = 1;

      if (code === 'Tab') {
        e.preventDefault();
        setActiveModal((prev) => (prev === 'inventory' ? null : 'inventory'));
      }
      if (code === 'KeyM') {
        if (e.shiftKey) setActiveModal((prev) => (prev === 'guild-envoy' ? null : 'guild-envoy'));
        else setActiveModal((prev) => (prev === 'galaxy-map' ? null : 'galaxy-map'));
      }
      if (code === 'KeyG') {
        if (e.shiftKey) setActiveModal((prev) => (prev === 'atlantid-tool' ? null : 'atlantid-tool'));
        else game.cycleToolMode();
      }
      if (code === 'KeyK') {
        if (e.shiftKey) setActiveModal((prev) => (prev === 'living-ship' ? null : 'living-ship'));
        else game.cycleStarship();
      }
      if (code === 'KeyR') {
        if (e.shiftKey) setActiveModal((prev) => (prev === 'large-refiner' ? null : 'large-refiner'));
        else game.reloadBoltcaster();
      }
      if (code === 'KeyH') {
        if (e.shiftKey) setActiveModal((prev) => (prev === 'pirate-flagship' ? null : 'pirate-flagship'));
        else setActiveModal((prev) => (prev === 'orbital-freighter' ? null : 'orbital-freighter'));
      }
      if (code === 'KeyU') {
        if (e.shiftKey) setActiveModal((prev) => (prev === 'livestock-ranch' ? null : 'livestock-ranch'));
        else setActiveModal((prev) => (prev === 'appearance' ? null : 'appearance'));
      }
      if (code === 'KeyY') {
        if (e.shiftKey) setActiveModal((prev) => (prev === 'milestones' ? null : 'milestones'));
        else setActiveModal((prev) => (prev === 'specialist-terminals' ? null : 'specialist-terminals'));
      }
      if (code === 'KeyV') {
        if (e.shiftKey) setActiveModal((prev) => (prev === 'multi-tool-salvage' ? null : 'multi-tool-salvage'));
        else setActiveModal((prev) => (prev === 'atlas-path' ? null : 'atlas-path'));
      }
      if (code === 'KeyI') {
        if (e.shiftKey) setActiveModal((prev) => (prev === 'exosuit-upgrade' ? null : 'exosuit-upgrade'));
        else setActiveModal((prev) => (prev === 'manufacturing' ? null : 'manufacturing'));
      }
      if (code === 'KeyJ') {
        if (e.shiftKey) setActiveModal((prev) => (prev === 'floating-islands' ? null : 'floating-islands'));
      }
      if (code === 'KeyB') {
        if (e.shiftKey) setActiveModal((prev) => (prev === 'boundary-failure' ? null : 'boundary-failure'));
      }
      if (code === 'KeyO') {
        if (e.shiftKey) setActiveModal((prev) => (prev === 'derelict-freighter' ? null : 'derelict-freighter'));
        else setActiveModal((prev) => (prev === 'abyssal-horror' ? null : 'abyssal-horror'));
      }
      if (code === 'Quote' && e.shiftKey) {
        setActiveModal((prev) => (prev === 'volcano' ? null : 'volcano'));
      }
      if (code === 'End' && e.shiftKey) {
        setActiveModal((prev) => (prev === 'aquarium' ? null : 'aquarium'));
      }
      if (code === 'KeyX') {
        if (e.altKey) setActiveModal((prev) => (prev === 'weapon-arsenal' ? null : 'weapon-arsenal'));
        else if (e.shiftKey) setActiveModal((prev) => (prev === 'starship-weapons' ? null : 'starship-weapons'));
        else setActiveModal((prev) => (prev === 'quick-recharge' ? null : 'quick-recharge'));
      }
      if (code === 'KeyC') {
        if (e.shiftKey) setActiveModal((prev) => (prev === 'galactic-core' ? null : 'galactic-core'));
        else game.triggerScanPulse();
      }
      if (code === 'KeyL') {
        if (e.shiftKey) setActiveModal((prev) => (prev === 'cartographer' ? null : 'cartographer'));
        else setActiveModal((prev) => (prev === 'settlement' ? null : 'settlement'));
      }
      if (code === 'Period') setActiveModal((prev) => (prev === 'solar-ship' ? null : 'solar-ship'));
      if (code === 'Comma') setActiveModal((prev) => (prev === 'laylaps' ? null : 'laylaps'));
      if (code === 'KeyQ') {
        if (e.shiftKey) game.cycleSecondaryWeapon();
        else game.fireSecondaryWeapon();
      }
      if (code === 'Backslash') setActiveModal((prev) => (prev === 'outlaw-station' ? null : 'outlaw-station'));
      if (code === 'Slash') setActiveModal((prev) => (prev === 'weapon-arsenal' ? null : 'weapon-arsenal'));
      if (code === 'Home') setActiveModal((prev) => (prev === 'fishing' ? null : 'fishing'));
      if (code === 'Delete') setActiveModal((prev) => (prev === 'black-hole' ? null : 'black-hole'));
      if (code === 'PageDown') setActiveModal((prev) => (prev === 'liquidator' ? null : 'liquidator'));
      if (code === 'PageUp') setActiveModal((prev) => (prev === 'station' ? null : 'station'));
      if (code === 'End') setActiveModal((prev) => (prev === 'sandworm' ? null : 'sandworm'));
      if (code === 'Insert') setActiveModal((prev) => (prev === 'trade-outpost' ? null : 'trade-outpost'));
      if (code === 'F1') {
        e.preventDefault();
        if (e.shiftKey) setActiveModal((prev) => (prev === 'ship-paint' ? null : 'ship-paint'));
        else setActiveModal((prev) => (prev === 'scrapper' ? null : 'scrapper'));
      }
      if (code === 'F2') {
        e.preventDefault();
        if (e.shiftKey) setActiveModal((prev) => (prev === 'bioluminescent-forest' ? null : 'bioluminescent-forest'));
        else setActiveModal((prev) => (prev === 'organic-fleet' ? null : 'organic-fleet'));
      }
      if (code === 'F3') {
        e.preventDefault();
        if (e.shiftKey) setActiveModal((prev) => (prev === 'extreme-weather' ? null : 'extreme-weather'));
        else setActiveModal((prev) => (prev === 'expedition' ? null : 'expedition'));
      }
      if (code === 'F4') {
        e.preventDefault();
        if (e.shiftKey) setActiveModal((prev) => (prev === 'race-initiator' ? null : 'race-initiator'));
        else setActiveModal((prev) => (prev === 'egg-sequencer' ? null : 'egg-sequencer'));
      }
      if (code === 'F5') {
        e.preventDefault();
        if (e.shiftKey) setActiveModal((prev) => (prev === 'titan-beetle' ? null : 'titan-beetle'));
        else setActiveModal((prev) => (prev === 'archaeology' ? null : 'archaeology'));
      }
      if (code === 'F6') {
        e.preventDefault();
        if (e.shiftKey) setActiveModal((prev) => (prev === 'spacewalk' ? null : 'spacewalk'));
        else setActiveModal((prev) => (prev === 'orbital-freighter' ? null : 'orbital-freighter'));
      }
      if (code === 'F7') {
        e.preventDefault();
        if (e.shiftKey) setActiveModal((prev) => (prev === 'short-range-teleporter' ? null : 'short-range-teleporter'));
        else setActiveModal((prev) => (prev === 'biodome' ? null : 'biodome'));
      }
      if (code === 'F8') {
        e.preventDefault();
        if (e.shiftKey) setActiveModal((prev) => (prev === 'em-generator' ? null : 'em-generator'));
        else setActiveModal((prev) => (prev === 'wonders' ? null : 'wonders'));
      }
      if (code === 'F9') {
        e.preventDefault();
        if (e.shiftKey) setActiveModal((prev) => (prev === 'supercharge' ? null : 'supercharge'));
        else setActiveModal((prev) => (prev === 'custom-difficulty' ? null : 'custom-difficulty'));
      }
      if (code === 'F10') { e.preventDefault(); setActiveModal((prev) => (prev === 'appearance' ? null : 'appearance')); }
      if (code === 'F11') {
        e.preventDefault();
        if (e.shiftKey) setActiveModal((prev) => (prev === 'power-grid' ? null : 'power-grid'));
        else setActiveModal((prev) => (prev === 'base-computer' ? null : 'base-computer'));
      }
      if (code === 'F12') {
        e.preventDefault();
        if (e.shiftKey) setActiveModal((prev) => (prev === 'aquatic-base' ? null : 'aquatic-base'));
        else setActiveModal((prev) => (prev === 'abandoned-building' ? null : 'abandoned-building'));
      }
      if (code === 'Digit7') {
        if (e.shiftKey) setActiveModal((prev) => (prev === 'gas-harvester' ? null : 'gas-harvester'));
        else setActiveModal((prev) => (prev === 'industrial' ? null : 'industrial'));
      }
      if (code === 'Digit0') {
        if (e.altKey) setActiveModal((prev) => (prev === 'nautilon-sonar' ? null : 'nautilon-sonar'));
        else game.toggleNautilonSubmarine();
      }
      if (code === 'KeyP') setActiveModal((prev) => (prev === 'discoveries' ? null : 'discoveries'));
      if (code === 'KeyZ') setActiveModal((prev) => (prev === 'build-menu' ? null : 'build-menu'));
      if (code === 'Escape') {
        setActiveModal(null);
        setIsQuickDrawerOpen(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') game.keyboard.w = 0;
      if (code === 'KeyS' || code === 'ArrowDown') game.keyboard.s = 0;
      if (code === 'KeyA' || code === 'ArrowLeft') game.keyboard.a = 0;
      if (code === 'KeyD' || code === 'ArrowRight') game.keyboard.d = 0;
      if (code === 'Space') game.keyboard.space = 0;
      if (code === 'ShiftLeft' || code === 'ShiftRight') game.keyboard.shift = 0;
      if (code === 'KeyE') game.keyboard.e = 0;
    };

    const onUserPointerDown = (e: MouseEvent | TouchEvent | PointerEvent) => {
      AudioSys.unlockOnFirstInteraction();
      if ('touches' in e && (e as TouchEvent).touches.length >= 2) {
        return;
      }
      game.notifyUserInput();
    };

    const onTouchStart = (e: TouchEvent) => {
      AudioSys.unlockOnFirstInteraction();
      // If touch is on a modal or minimap, don't zoom the game camera!
      if ((e.target as HTMLElement)?.closest?.('.modal-overlay, #minimap-fullscreen-root, canvas.minimap-canvas, [data-prevent-game-zoom="true"]')) {
        return;
      }
      if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        touchDistRef.current = dist;
        initialZoomRef.current = game.cameraZoom;
      } else if (e.touches.length === 1) {
        touchDistRef.current = null;
        game.notifyUserInput();
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if ((e.target as HTMLElement)?.closest?.('.modal-overlay, #minimap-fullscreen-root, canvas.minimap-canvas, [data-prevent-game-zoom="true"]')) {
        return;
      }
      if (e.touches.length === 2 && touchDistRef.current !== null) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const ratio = dist / touchDistRef.current;
        game.setCameraZoom(initialZoomRef.current * ratio);
        if (e.cancelable) e.preventDefault();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        touchDistRef.current = null;
      }
    };

    const onWheel = (e: WheelEvent) => {
      // If scrolling inside modal or minimap, don't zoom the game camera!
      if ((e.target as HTMLElement)?.closest?.('.modal-overlay, #minimap-fullscreen-root, canvas.minimap-canvas, [data-prevent-game-zoom="true"]')) {
        return;
      }
      const factor = e.deltaY < 0 ? 1.12 : 0.88;
      game.setCameraZoom(game.cameraZoom * factor);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('pointerdown', onUserPointerDown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('pointerdown', onUserPointerDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Joystick Input Handler
  const handleJoystickVector = useCallback((vec: { x: number; y: number }) => {
    if (Math.hypot(vec.x, vec.y) > 0.05) {
      game.notifyUserInput();
    }
    game.touchControls.joystickVector = vec;
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden select-none bg-black touch-none">
      {/* Scanline & Vignette Overlays */}
      <div className="scanlines" />
      <div className="vignette" />

      {/* Main 2D WebGL/Canvas Viewport */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-crosshair touch-none"
        onMouseDown={() => {
          AudioSys.unlockOnFirstInteraction();
          game.mouse.isDown = true;
        }}
        onMouseUp={() => {
          game.mouse.isDown = false;
        }}
        onTouchStart={() => {
          AudioSys.unlockOnFirstInteraction();
        }}
      />

      {/* Mobile In-Game HUD (Top compass, status bars, warnings, currency) */}
      <MobileHUD
        locationName={gameState === 'PLANET' && activePlanet ? activePlanet.name : '유클리드 은하 (EUCLID)'}
        subLocation={
          gameState === 'PLANET' && activePlanet
            ? `생물군계: ${activePlanet.type} // ${activePlanet.hazardType}`
            : '성간 심우주 궤도 // 미탐사 항성계'
        }
        units={units}
        nanites={nanites}
        quicksilver={quicksilver}
        taintedMetal={taintedMetal}
        shield={shield}
        maxShield={maxShield}
        hazard={hazard}
        lifeSupport={lifeSupport}
        activePlanet={activePlanet}
        gameState={gameState}
        isStormActive={isStormActive}
        stormCountdown={stormCountdown}
        cargoScanTimer={cargoScanTimer}
        pirateCountdown={pirateCountdown}
        sentinelAlert={sentinelAlert}
        overheat={overheat}
        isOverheated={isOverheated}
        interactLabel={interactLabel}
        floatingTexts={floatingTexts}
        isAutoPilot={isAutoPilot}
        autoPilotTargetPlanet={autoPilotTargetPlanet}
        autoPilotPlanetStartTime={autoPilotPlanetStartTime}
        cameraZoom={cameraZoom}
        onZoomIn={() => game.zoomIn()}
        onZoomOut={() => game.zoomOut()}
        onResetZoom={() => game.resetZoom()}
        onOpenArsenal={() => setActiveModal('weapon-arsenal')}
        onOpenDifficulty={() => setActiveModal('custom-difficulty')}
        onOpenDrawer={() => {
          AudioSys.playNote(480, 'sine', 0.1);
          setIsQuickDrawerOpen(true);
        }}
      />

      {/* AutoPilot Screen Border Glow Overlay */}
      {isAutoPilot && (
        <div className="fixed inset-0 pointer-events-none border-2 sm:border-4 border-cyan-400/50 shadow-[inset_0_0_60px_rgba(0,229,255,0.25)] z-30 animate-pulse" />
      )}

      {/* Touch Controls Layout (Landscape & Portrait Responsive) */}
      <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none flex items-end justify-between p-1.5 xs:p-2 sm:p-4 pb-safe max-w-full overflow-hidden">
        {/* Left Bottom: Vitals Status Cluster & Virtual Thumb Joystick */}
        <div className="pointer-events-auto shrink-0 flex flex-col items-start gap-1 sm:gap-1.5 mb-0.5 max-w-[130px] xs:max-w-[160px] sm:max-w-[200px]">
          {/* Shield Bar */}
          <div className="w-full bg-slate-950/85 backdrop-blur-md px-2 py-0.5 sm:py-1 rounded-md border border-cyan-400/30">
            <div className="flex justify-between items-center text-[8px] sm:text-[8.5px] font-bold font-mono text-cyan-300 mb-0.5">
              <span className="flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400" />
                <span>방어막</span>
              </span>
              <span>{Math.round(shield)}%</span>
            </div>
            <div className="w-full bg-gray-900 h-1 sm:h-1.5 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-300 transition-all duration-150"
                style={{ width: `${Math.max(0, Math.min(100, (shield / maxShield) * 100))}%` }}
              />
            </div>
          </div>

          {/* Hazard Protection Bar */}
          {gameState === 'PLANET' && (
            <div className="w-full bg-slate-950/85 backdrop-blur-md px-2 py-0.5 sm:py-1 rounded-md border border-yellow-400/30">
              <div className="flex justify-between items-center text-[8px] sm:text-[8.5px] font-bold font-mono text-yellow-300 mb-0.5">
                <span className="flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-400" />
                  <span>환경방호</span>
                </span>
                <span>{Math.round(hazard)}%</span>
              </div>
              <div className="w-full bg-gray-900 h-1 sm:h-1.5 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-yellow-600 to-amber-400 transition-all duration-150"
                  style={{ width: `${Math.max(0, Math.min(100, hazard))}%` }}
                />
              </div>
            </div>
          )}

          {/* Life Support Bar */}
          {gameState === 'PLANET' && (
            <div className="w-full bg-slate-950/85 backdrop-blur-md px-2 py-0.5 sm:py-1 rounded-md border border-red-500/30">
              <div className="flex justify-between items-center text-[8px] sm:text-[8.5px] font-bold font-mono text-red-300 mb-0.5">
                <span className="flex items-center gap-1">
                  <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400" />
                  <span>생명유지</span>
                </span>
                <span>{Math.round(lifeSupport)}%</span>
              </div>
              <div className="w-full bg-gray-900 h-1 sm:h-1.5 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-150"
                  style={{ width: `${Math.max(0, Math.min(100, lifeSupport))}%` }}
                />
              </div>
            </div>
          )}

          {/* Virtual Thumb Joystick */}
          <VirtualJoystick onVectorChange={handleJoystickVector} radius={44} />
        </div>

        {/* Center Bottom: Starship Cockpit & Flight Gauges (#cockpit-hud v2) */}
        {gameState === 'SPACE' && (
          <div id="cockpit-hud" className="hidden md:flex pointer-events-none select-none mb-1">
            {/* Speed Gauge Arc */}
            <div
              className={`flight-gauge-arc ${isPulseActive ? 'pulse-drive-active' : ''}`}
              style={{
                ['--gauge-val' as any]: Math.min(100, Math.round((Math.hypot(game.player.vx, game.player.vy) / (isPulseActive ? 32 : 10)) * 100))
              }}
            >
              <span className="text-[8px] font-mono text-cyan-300 font-bold uppercase tracking-wider">속도 (SPD)</span>
              <span className="text-xs font-mono font-extrabold text-white">
                {Math.round(Math.hypot(game.player.vx, game.player.vy) * 4)}u
              </span>
              <span className="text-[7px] font-mono text-cyan-400">
                {isPulseActive ? '초광속 펄스' : '추진 순항'}
              </span>
            </div>

            {/* Shield & Power Gauge Arc */}
            <div
              className="flight-gauge-arc"
              style={{
                ['--gauge-val' as any]: Math.min(100, Math.round((shield / maxShield) * 100))
              }}
            >
              <span className="text-[8px] font-mono text-cyan-300 font-bold uppercase tracking-wider">방어막</span>
              <span className="text-xs font-mono font-extrabold text-white">
                {Math.round(shield)}%
              </span>
              <span className="text-[7px] font-mono text-emerald-400">
                {shipType}
              </span>
            </div>
          </div>
        )}

        {/* Right Bottom: Action Cluster (Fire, Jetpack, Interact, Tool Switch, Reload, etc.) */}
        <div className="pointer-events-auto shrink-0">
          <ActionControls
            toolMode={toolMode}
            shipType={shipType}
            gameState={gameState}
            isVisorActive={isVisorActive}
            isOverheated={isOverheated}
            overheat={overheat}
            interactLabel={interactLabel}
            interactProgress={interactProgress}
            ammo={ammo}
            maxAmmo={maxAmmo}
            cargoScanTimer={cargoScanTimer}
            combatWeapons={combatWeapons}
            secondaryWeapons={secondaryWeapons}
            onFireStart={() => {
              game.touchControls.isFiring = true;
            }}
            onFireEnd={() => {
              game.touchControls.isFiring = false;
            }}
            onJetpackStart={() => {
              game.touchControls.isJetpacking = true;
            }}
            onJetpackEnd={() => {
              game.touchControls.isJetpacking = false;
            }}
            onInteractStart={() => {
              game.touchControls.isInteracting = true;
            }}
            onInteractEnd={() => {
              game.touchControls.isInteracting = false;
            }}
            onCycleTool={() => game.cycleToolMode()}
            onCycleCombatWeapon={() => game.cycleCombatWeapon()}
            onFireSecondary={() => game.fireSecondaryWeapon()}
            onCycleSecondary={() => game.cycleSecondaryWeapon()}
            onOpenArsenal={() => setActiveModal('weapon-arsenal')}
            onScan={() => game.triggerScanPulse()}
            onReload={() => game.reloadBoltcaster()}
            onToggleVisor={() => {
              game.data.isVisorActive = !game.data.isVisorActive;
              setIsVisorActive(game.data.isVisorActive);
              AudioSys.playNote(650, 'sine', 0.15);
            }}
            onOpenQuickRecharge={() => {
              setActiveModal('quick-recharge');
            }}
          />
        </div>
      </div>

      {/* Nautilon Submarine Mounted HUD (v5.23.0 The Abyss & Aquarius) */}
      {isNautilonBoarded && (
        <div id="nautilon-hud" className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-950/95 border border-blue-400/60 rounded-xl px-2.5 sm:px-6 py-1.5 sm:py-2.5 flex items-center gap-2 sm:gap-6 shadow-[0_0_30px_rgba(59,130,246,0.4)] z-40 pointer-events-auto max-w-[94vw] overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <span className="text-xl sm:text-2xl text-blue-400 animate-pulse shrink-0">🌊</span>
            <div className="truncate">
              <div className="text-[7.5px] sm:text-[9px] text-gray-400 font-mono tracking-widest hidden xs:block">SUBMERSIBLE EXOCRAFT</div>
              <div className="text-[11px] sm:text-sm font-bold text-white nms-header-font tracking-wider truncate">NAUTILON S-CLASS</div>
            </div>
          </div>
          <div className="hidden sm:flex flex-col gap-1 w-28 sm:w-32 shrink-0">
            <div className="flex justify-between text-[9px] sm:text-[10px] font-mono text-blue-300">
              <span>HUMBOLDT</span>
              <span>{game.data.nautilon.engineOverclock ? '100% [OC]' : '100%'}</span>
            </div>
            <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden border border-blue-400/30">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-full" />
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[7.5px] sm:text-[9px] text-gray-400 font-mono">DEPTH</div>
            <div className="text-[11px] sm:text-sm font-bold text-cyan-300 font-mono">-48.5u</div>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-mono shrink-0">
            <button
              onClick={() => setActiveModal('nautilon-sonar')}
              className="px-2 sm:px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold cursor-pointer shadow active:scale-95 text-[9px] sm:text-xs"
            >
              [소나📡]
            </button>
            <button
              onClick={() => game.dismountNautilon()}
              className="px-2 sm:px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 cursor-pointer active:scale-95 text-[9px] sm:text-xs"
            >
              [E]하선
            </button>
          </div>
        </div>
      )}

      {/* Full Mobile Quick Command Hub Drawer */}
      <MobileQuickDrawer
        isOpen={isQuickDrawerOpen}
        onClose={() => setIsQuickDrawerOpen(false)}
        onOpenModal={(modalId) => {
          if (modalId === 'ship-switch') {
            game.cycleStarship();
          } else {
            setActiveModal(modalId);
          }
        }}
      />

      {/* Mobile Responsive Modals (Inventory, Galaxy Map, Fishing, Black Hole, etc.) */}
      <MobileModals
        activeModal={activeModal}
        onClose={() => {
          setActiveModal(null);
          if (isAutoPilot) game.disengageAutoPilot();
        }}
      />

      {/* Cinematic AI Demo Showcase HUD Banner */}
      <DemoShowcaseHUD
        demoState={demoShowcase}
        isAutoPilot={isAutoPilot}
        onToggleDemo={() => {
          if (isAutoPilot) {
            game.disengageAutoPilot();
          } else {
            game.engageAutoPilot();
          }
        }}
      />
    </div>
  );
}
