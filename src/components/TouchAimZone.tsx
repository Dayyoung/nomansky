import React, { useRef, useState, useCallback, useEffect } from 'react';
import { game } from '../gameEngine';
import { AudioSys } from '../audio';
import { Navigation, ZoomIn } from 'lucide-react';

interface TouchAimZoneProps {
  is3DActive: boolean;
}

export const TouchAimZone: React.FC<TouchAimZoneProps> = ({ is3DActive }) => {
  const activeTouchId = useRef<number | null>(null);
  const lastPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartTime = useRef<number>(0);
  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTapTime = useRef<number>(0);

  // Pinch zoom tracking
  const initialPinchDist = useRef<number | null>(null);
  const initialZoomLevel = useRef<number>(1.0);
  const [zoomBadge, setZoomBadge] = useState<number | null>(null);
  const zoomBadgeTimer = useRef<number | null>(null);

  // Two-finger swipe tracking
  const twoFingerStartPos = useRef<{ x: number; y: number } | null>(null);

  // Visual touch ripple indicator
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const rippleTimer = useRef<number | null>(null);

  const showZoomFeedback = (zoom: number) => {
    setZoomBadge(Number(zoom.toFixed(2)));
    if (zoomBadgeTimer.current) clearTimeout(zoomBadgeTimer.current);
    zoomBadgeTimer.current = window.setTimeout(() => {
      setZoomBadge(null);
    }, 1200);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // If touch target is an interactive button, skip look zone
    if ((e.target as HTMLElement)?.closest('button, input, select, .modal-overlay, #minimap-fullscreen-root, [data-no-aim="true"]')) {
      return;
    }

    AudioSys.unlockOnFirstInteraction();
    game.notifyUserInput();

    if (e.touches.length === 2) {
      // 2-Finger Pinch Zoom or 2-Finger Swipe Start
      activeTouchId.current = null;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      initialPinchDist.current = dist;
      initialZoomLevel.current = game.cameraZoom;
      twoFingerStartPos.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2
      };
      return;
    }

    if (e.touches.length === 1 && activeTouchId.current === null) {
      const touch = e.touches[0];
      // Only capture touches starting on the right 55% of the viewport (camera look region)
      if (touch.clientX < window.innerWidth * 0.38) {
        return;
      }

      activeTouchId.current = touch.identifier;
      lastPos.current = { x: touch.clientX, y: touch.clientY };
      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
      touchStartTime.current = Date.now();

      // Spawn visual touch indicator
      setRipple({ x: touch.clientX, y: touch.clientY });
      if (rippleTimer.current) clearTimeout(rippleTimer.current);
      rippleTimer.current = window.setTimeout(() => setRipple(null), 600);

      // Check double-tap
      const now = Date.now();
      if (now - lastTapTime.current < 280) {
        // Double-tap triggered!
        const tapDist = Math.hypot(touch.clientX - touchStartPos.current.x, touch.clientY - touchStartPos.current.y);
        if (tapDist < 40) {
          handleDoubleTap();
        }
      }
      lastTapTime.current = now;
    }
  };

  const handleDoubleTap = () => {
    game.triggerHaptic(20);
    if (game.currState === 'SPACE') {
      AudioSys.playDiscoveryFanfare();
      game.alignToNearestPlanet();
      game.spawnFloatText('🎯 네비게이션: 인근 행성으로 방향 즉시 정렬', undefined, undefined, '#00e5ff');
    } else {
      AudioSys.playNote(720, 'sine', 0.1);
      game.spawnFloatText('🔄 카메라 시점 전방 재정렬', undefined, undefined, '#38bdf8');
      // Trigger event for ThreeCanvas / ThreeGameEngine to reset camera yaw
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('nms-recenter-camera'));
      }
    }
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      // 2-Finger Pinch Zoom or Horizontal Swipe
      if (e.touches.length === 2 && initialPinchDist.current !== null) {
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const pinchDelta = dist - initialPinchDist.current;

        if (Math.abs(pinchDelta) > 15) {
          const ratio = dist / initialPinchDist.current;
          const newZoom = Math.max(0.4, Math.min(3.0, initialZoomLevel.current * ratio));
          game.setCameraZoom(newZoom);
          showZoomFeedback(newZoom);
        }

        if (e.cancelable) e.preventDefault();
        return;
      }

      // 1-Finger Look & Aim
      if (activeTouchId.current === null) return;
      for (let i = 0; i < e.touches.length; i++) {
        const touch = e.touches[i];
        if (touch.identifier === activeTouchId.current) {
          const dx = touch.clientX - lastPos.current.x;
          const dy = touch.clientY - lastPos.current.y;
          lastPos.current = { x: touch.clientX, y: touch.clientY };

          if (Math.hypot(dx, dy) > 0.1) {
            game.notifyUserInput();
            if (!game.touchControls.lookDelta) {
              game.touchControls.lookDelta = { x: 0, y: 0 };
            }
            game.touchControls.lookDelta.x += dx;
            game.touchControls.lookDelta.y += dy;
          }

          if (e.cancelable) e.preventDefault();
          break;
        }
      }
    },
    []
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      // Check 2-finger horizontal swipe gesture on release
      if (e.touches.length < 2 && twoFingerStartPos.current) {
        twoFingerStartPos.current = null;
        initialPinchDist.current = null;
      }

      if (activeTouchId.current !== null) {
        let touchStillActive = false;
        for (let i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier === activeTouchId.current) {
            touchStillActive = true;
            break;
          }
        }
        if (!touchStillActive) {
          activeTouchId.current = null;
        }
      }
    },
    []
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
    <>
      {/* Touch Aim / Look Surface spanning right 60% of viewport */}
      <div
        onTouchStart={handleTouchStart}
        className="fixed inset-y-0 right-0 w-[62vw] z-10 pointer-events-auto touch-none select-none"
        aria-label="터치 시점 조작 및 조준 영역"
      />

      {/* Floating Touch Ripple Indicator */}
      {ripple && (
        <div
          className="fixed pointer-events-none z-30 w-10 h-10 -ml-5 -mt-5 rounded-full border border-cyan-400/60 bg-cyan-400/20 shadow-[0_0_15px_#00e5ff] animate-ping"
          style={{ left: ripple.x, top: ripple.y }}
        />
      )}

      {/* Pinch Zoom Level Badge */}
      {zoomBadge !== null && (
        <div className="fixed top-20 right-4 z-40 bg-slate-950/90 border border-cyan-400/80 px-3 py-1.5 rounded-full text-xs font-mono font-bold text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.4)] backdrop-blur-md flex items-center gap-1.5 animate-in fade-in zoom-in-90 pointer-events-none">
          <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
          <span>시야 배율: {zoomBadge}x</span>
        </div>
      )}
    </>
  );
};
