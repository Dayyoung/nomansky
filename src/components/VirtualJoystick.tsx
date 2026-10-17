import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Zap, Flame, Lock } from 'lucide-react';
import { AudioSys } from '../audio';
import { game } from '../gameEngine';

interface VirtualJoystickProps {
  onVectorChange: (vec: { x: number; y: number }) => void;
  radius?: number;
  mode?: 'FIXED' | 'DYNAMIC';
  autoSprintEnabled?: boolean;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onVectorChange,
  radius = 48,
  mode = game.data.touchSettings?.joystickMode || 'DYNAMIC',
  autoSprintEnabled = game.data.touchSettings?.autoSprintLock ?? true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const [dynamicOrigin, setDynamicOrigin] = useState<{ x: number; y: number } | null>(null);
  const [isSprintLocked, setIsSprintLocked] = useState(false);
  const [isNearSprintGate, setIsNearSprintGate] = useState(false);

  const activeTouchId = useRef<number | null>(null);
  const centerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastSprintLockHaptic = useRef<number>(0);

  const isSpace = game.currState === 'SPACE';

  const updateVectorFromClientCoords = useCallback(
    (clientX: number, clientY: number) => {
      const dx = clientX - centerPos.current.x;
      const dy = clientY - centerPos.current.y;
      const dist = Math.hypot(dx, dy);

      let clampedX = dx;
      let clampedY = dy;
      if (dist > radius) {
        clampedX = (dx / dist) * radius;
        clampedY = (dy / dist) * radius;
      }

      setKnobPos({ x: clampedX, y: clampedY });

      // Normalized vector between -1 and 1
      const normX = clampedX / radius;
      const normY = clampedY / radius;

      // Sprint lock detection (Dragging stick towards top edge, normY <= -0.80)
      if (autoSprintEnabled) {
        const nearGate = normY <= -0.72 && Math.abs(normX) <= 0.55;
        setIsNearSprintGate(nearGate);

        if (normY <= -0.86 && Math.abs(normX) <= 0.45 && !isSprintLocked) {
          const now = Date.now();
          if (now - lastSprintLockHaptic.current > 350) {
            lastSprintLockHaptic.current = now;
            game.triggerHaptic(25);
            AudioSys.playNote(880, 'sine', 0.08);
          }
          setIsSprintLocked(true);
          game.touchControls.isSprinting = true;
        } else if (isSprintLocked && normY > -0.2) {
          // Release sprint lock if pulled down significantly
          setIsSprintLocked(false);
          game.touchControls.isSprinting = false;
          game.triggerHaptic(10);
        }
      }

      onVectorChange({ x: normX, y: normY });
    },
    [radius, autoSprintEnabled, isSprintLocked, onVectorChange]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    AudioSys.unlockOnFirstInteraction();
    if (activeTouchId.current !== null) return;

    const touch = e.changedTouches[0];
    activeTouchId.current = touch.identifier;
    setIsActive(true);

    if (mode === 'DYNAMIC') {
      // Anchor joystick center exactly at initial touch point
      centerPos.current = {
        x: touch.clientX,
        y: touch.clientY
      };
      setDynamicOrigin({ x: touch.clientX, y: touch.clientY });
    } else {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        centerPos.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        };
      }
    }

    game.triggerHaptic(12);
    updateVectorFromClientCoords(touch.clientX, touch.clientY);
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (activeTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchId.current) {
          updateVectorFromClientCoords(touch.clientX, touch.clientY);
          break;
        }
      }
    },
    [updateVectorFromClientCoords]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (activeTouchId.current === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId.current) {
          activeTouchId.current = null;
          setIsActive(false);
          setKnobPos({ x: 0, y: 0 });
          setDynamicOrigin(null);
          setIsNearSprintGate(false);

          if (!isSprintLocked) {
            game.touchControls.isSprinting = false;
            onVectorChange({ x: 0, y: 0 });
          } else {
            // Keep forward thrust vector while sprint locked
            onVectorChange({ x: 0, y: -1 });
          }
          break;
        }
      }
    },
    [isSprintLocked, onVectorChange]
  );

  const handleUnlockSprint = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsSprintLocked(false);
    game.touchControls.isSprinting = false;
    onVectorChange({ x: 0, y: 0 });
    game.triggerHaptic(15);
  };

  useEffect(() => {
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchcancel', handleTouchEnd);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  // Clean up sprint on unmount
  useEffect(() => {
    return () => {
      game.touchControls.isSprinting = false;
    };
  }, []);

  return (
    <>
      {/* Dynamic Floating Touch Capture Zone across the left 45% of viewport */}
      {mode === 'DYNAMIC' && (
        <div
          onTouchStart={handleTouchStart}
          className="fixed left-0 top-16 bottom-0 w-[46vw] z-30 pointer-events-auto touch-none select-none"
          aria-hidden="true"
        />
      )}

      {/* Main Joystick UI Container */}
      <div
        ref={containerRef}
        onTouchStart={mode === 'FIXED' ? handleTouchStart : undefined}
        className={`relative flex items-center justify-center select-none touch-none pointer-events-auto transition-opacity duration-200 ${
          mode === 'DYNAMIC'
            ? dynamicOrigin
              ? 'fixed z-40'
              : 'relative opacity-40 hover:opacity-70'
            : 'relative'
        }`}
        style={
          mode === 'DYNAMIC' && dynamicOrigin
            ? {
                left: dynamicOrigin.x - radius * 1.3,
                top: dynamicOrigin.y - radius * 1.3,
                width: radius * 2.6,
                height: radius * 2.6
              }
            : {
                width: radius * 2.5,
                height: radius * 2.5
              }
        }
      >
        {/* Sprint / Pulse Boost Lock Gate Indicator (Placed above joystick) */}
        {autoSprintEnabled && (
          <div
            onClick={isSprintLocked ? handleUnlockSprint : undefined}
            onTouchStart={isSprintLocked ? handleUnlockSprint : undefined}
            className={`absolute -top-6 xs:-top-7 sm:-top-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full border text-[7.5px] xs:text-[8px] sm:text-[9px] font-mono font-bold tracking-tight shadow-lg transition-all duration-150 whitespace-nowrap cursor-pointer ${
              isSprintLocked
                ? 'bg-amber-950/95 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-105 animate-pulse'
                : isNearSprintGate
                ? 'bg-cyan-950/90 border-cyan-300 text-cyan-200 shadow-[0_0_10px_rgba(0,229,255,0.5)] scale-105'
                : 'bg-slate-950/80 border-cyan-500/30 text-cyan-400/70 opacity-60'
            }`}
            title="위로 밀면 스프린트/부스트 고정"
          >
            {isSprintLocked ? (
              <>
                <Lock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                <span>{isSpace ? '부스트 락 해제 ✖' : '달리기 락 해제 ✖'}</span>
              </>
            ) : (
              <>
                {isSpace ? (
                  <Zap className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                ) : (
                  <Flame className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                )}
                <span>{isSpace ? '▲ 부스트 고정' : '▲ 달리기 고정'}</span>
              </>
            )}
          </div>
        )}

        {/* Outer Sci-Fi Glow Base Ring */}
        <div
          className={`absolute rounded-full border transition-all duration-200 backdrop-blur-md ${
            isSprintLocked
              ? 'border-amber-400 bg-amber-950/40 shadow-[0_0_30px_rgba(245,158,11,0.5)]'
              : isActive
              ? 'border-cyan-400 bg-slate-950/75 shadow-[0_0_25px_rgba(0,229,255,0.4)] scale-102'
              : 'border-cyan-500/30 bg-slate-950/60 shadow-[0_0_10px_rgba(0,229,255,0.15)]'
          }`}
          style={{
            width: radius * 2,
            height: radius * 2
          }}
        >
          {/* Circular Holographic Radial Ticks */}
          <div className="absolute inset-0 rounded-full border border-dashed border-cyan-400/25 pointer-events-none scale-90" />

          {/* Crosshair Guidelines with Cardinal N/E/S/W Ticks */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <div className="w-full h-[1px] bg-cyan-400" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <div className="h-full w-[1px] bg-cyan-400" />
          </div>

          {/* Cardinal Direction Dots */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300 opacity-60" />
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300 opacity-60" />
          <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300 opacity-60" />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cyan-300 opacity-60" />
        </div>

        {/* Thumb Stick Knob */}
        <div
          className={`absolute rounded-full pointer-events-none transition-transform duration-75 flex items-center justify-center shadow-lg ${
            isSprintLocked
              ? 'bg-gradient-to-br from-amber-400 to-orange-600 shadow-[0_0_18px_#f59e0b] scale-110'
              : isActive
              ? 'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 shadow-[0_0_18px_#00e5ff] scale-105'
              : 'bg-cyan-500/80 shadow-[0_0_8px_rgba(0,229,255,0.4)]'
          }`}
          style={{
            width: radius * 0.88,
            height: radius * 0.88,
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
          }}
        >
          {/* Inner Glowing Core */}
          <div className="w-3.5 h-3.5 rounded-full bg-white/90 shadow-sm flex items-center justify-center">
            <div className={`w-1.5 h-1.5 rounded-full ${isSprintLocked ? 'bg-amber-600' : 'bg-cyan-600'}`} />
          </div>
        </div>
      </div>
    </>
  );
};
