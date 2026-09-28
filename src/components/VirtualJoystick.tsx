import React, { useRef, useState, useCallback, useEffect } from 'react';
import { AudioSys } from '../audio';

interface VirtualJoystickProps {
  onVectorChange: (vec: { x: number; y: number }) => void;
  radius?: number;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({
  onVectorChange,
  radius = 60
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);
  const activeTouchId = useRef<number | null>(null);
  const centerPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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
      onVectorChange({ x: normX, y: normY });
    },
    [radius, onVectorChange]
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    AudioSys.unlockOnFirstInteraction();
    if (activeTouchId.current !== null) return;

    const touch = e.changedTouches[0];
    activeTouchId.current = touch.identifier;
    setIsActive(true);

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      centerPos.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }

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
          onVectorChange({ x: 0, y: 0 });
          break;
        }
      }
    },
    [onVectorChange]
  );

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

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      className="relative flex items-center justify-center select-none touch-none"
      style={{
        width: radius * 2.4,
        height: radius * 2.4
      }}
    >
      {/* Outer Glow Ring */}
      <div
        className={`absolute rounded-full border border-cyan-400/40 bg-slate-950/70 backdrop-blur-md transition-shadow ${
          isActive ? 'shadow-[0_0_25px_rgba(0,229,255,0.45)] border-cyan-400' : 'shadow-[0_0_10px_rgba(0,229,255,0.15)]'
        }`}
        style={{
          width: radius * 2,
          height: radius * 2
        }}
      >
        {/* Crosshair guidelines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <div className="w-full h-[1px] bg-cyan-400"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <div className="h-full w-[1px] bg-cyan-400"></div>
        </div>
      </div>

      {/* Thumb Stick Knob */}
      <div
        className={`absolute rounded-full pointer-events-none transition-transform duration-75 flex items-center justify-center ${
          isActive
            ? 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_15px_#00e5ff] scale-105'
            : 'bg-cyan-500/80 shadow-[0_0_8px_rgba(0,229,255,0.4)]'
        }`}
        style={{
          width: radius * 0.9,
          height: radius * 0.9,
          transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
        }}
      >
        <div className="w-3.5 h-3.5 rounded-full bg-white/80 shadow-sm" />
      </div>
    </div>
  );
};
