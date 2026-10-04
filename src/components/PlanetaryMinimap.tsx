import React, { useState, useEffect, useRef } from 'react';
import { GameEngine } from '../gameEngine';
import { PlanetEntity } from '../types';
import { AudioSys } from '../audio';
import { Compass, ZoomIn, ZoomOut, X, MapPin, Maximize2, Navigation, RotateCcw, Target } from 'lucide-react';

interface PlanetaryMinimapProps {
  game: GameEngine;
  gameState: 'SPACE' | 'PLANET' | 'WARP';
  activePlanet: PlanetEntity | null;
  cameraZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
}

export const PlanetaryMinimap: React.FC<PlanetaryMinimapProps> = ({
  game,
  gameState,
  activePlanet,
  cameraZoom,
  onZoomIn,
  onZoomOut,
  onResetZoom
}) => {
  // Only the button & game zoom are shown on main screen; clicking opens fullscreen minimap!
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Independent minimap zoom & pan state
  const [mapZoom, setMapZoom] = useState(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Drag and touch gesture refs
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });
  const touchDistRef = useRef<number | null>(null);
  const touchInitialZoomRef = useRef(1.0);

  // Close on ESC key when fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Dynamic canvas sizing on window resize or modal open
  useEffect(() => {
    if (!isFullscreen) return;

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = Math.floor(rect.width);
      canvas.height = Math.floor(rect.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [isFullscreen]);

  // Center minimap directly on player / starship
  const centerOnPlayer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    if (gameState === 'PLANET' && activePlanet) {
      const baseRadius = Math.min(w, h) * 0.42;
      const scale = (baseRadius / (activePlanet.r || 1)) * mapZoom;
      setPanOffset({
        x: -game.player.px * scale,
        y: -game.player.py * scale
      });
      AudioSys.playNote(620, 'sine', 0.1);
      game.spawnFloatText("📍 미니맵: 내 위치로 중심 정렬", undefined, undefined, '#00e5ff');
    } else if (gameState === 'SPACE') {
      const maxDist = 4200;
      const baseRadius = Math.min(w, h) * 0.42;
      const scale = (baseRadius / maxDist) * mapZoom;
      setPanOffset({
        x: -game.player.x * scale,
        y: -game.player.y * scale
      });
      AudioSys.playNote(620, 'sine', 0.1);
      game.spawnFloatText("🚀 미니맵: 내 함선으로 중심 정렬", undefined, undefined, '#00e5ff');
    }
  };

  // Reset minimap to full planet / system overview
  const resetMinimapOverview = () => {
    setPanOffset({ x: 0, y: 0 });
    setMapZoom(1.0);
    AudioSys.playNote(480, 'sine', 0.1);
  };

  // Minimap-only Zoom handlers
  const handleMinimapZoomIn = () => {
    setMapZoom(prev => Math.min(6.0, Number((prev * 1.25).toFixed(2))));
    AudioSys.playNote(580, 'sine', 0.08);
  };

  const handleMinimapZoomOut = () => {
    setMapZoom(prev => Math.max(0.25, Number((prev / 1.25).toFixed(2))));
    AudioSys.playNote(460, 'sine', 0.08);
  };

  // Mouse wheel zoom centered on cursor
  const handleMinimapWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    const container = containerRef.current;
    if (!container) {
      setMapZoom(prev => Math.max(0.25, Math.min(6.0, Number((prev * factor).toFixed(2)))));
      return;
    }

    const rect = container.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    setMapZoom(prevZoom => {
      const nextZoom = Math.max(0.25, Math.min(6.0, Number((prevZoom * factor).toFixed(2))));
      const k = nextZoom / prevZoom;
      setPanOffset(prevPan => ({
        x: (mx - cx) - ((mx - cx) - prevPan.x) * k,
        y: (my - cy) - ((my - cy) - prevPan.y) * k
      }));
      return nextZoom;
    });
  };

  // Pointer & Touch drag handlers for panning
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...panOffset };
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPanOffset({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Multi-touch pinch-to-zoom on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 2) {
      isDraggingRef.current = false;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistRef.current = dist;
      touchInitialZoomRef.current = mapZoom;
    } else if (e.touches.length === 1) {
      touchDistRef.current = null;
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...panOffset };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 2 && touchDistRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchDistRef.current;
      setMapZoom(Math.max(0.25, Math.min(6.0, Number((touchInitialZoomRef.current * ratio).toFixed(2)))));
    } else if (e.touches.length === 1 && isDraggingRef.current) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      setPanOffset({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length < 2) {
      touchDistRef.current = null;
    }
    if (e.touches.length === 0) {
      isDraggingRef.current = false;
    }
  };

  // Fullscreen Map Render Loop
  useEffect(() => {
    if (!isFullscreen) return;

    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderFullscreenRadar = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (w <= 0 || h <= 0) {
        animId = requestAnimationFrame(renderFullscreenRadar);
        return;
      }

      // Origin with pan offset
      const cx = w / 2 + panOffset.x;
      const cy = h / 2 + panOffset.y;

      ctx.clearRect(0, 0, w, h);

      // 1. Futuristic Tactical Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, Math.max(w, h) * 1.5);
      bgGrad.addColorStop(0, '#030a17');
      bgGrad.addColorStop(0.5, '#020612');
      bgGrad.addColorStop(1, '#010207');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Full-screen Grid Lines (aligned with pan offset)
      const gridSize = Math.max(20, Math.min(100, Math.round(40 * mapZoom)));
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
      ctx.lineWidth = 1;
      const startX = ((cx % gridSize) + gridSize) % gridSize;
      const startY = ((cy % gridSize) + gridSize) % gridSize;
      for (let x = startX; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = startY; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 3. Concentric Range Radar Rings (from radar center cx, cy)
      const maxScreenRadius = Math.hypot(w, h);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.16)';
      ctx.lineWidth = 1.2;
      const ringStep = 100 * mapZoom;
      for (let dist = ringStep; dist < maxScreenRadius; dist += ringStep) {
        ctx.beginPath();
        ctx.arc(cx, cy, dist, 0, Math.PI * 2);
        ctx.stroke();

        // Distance text tag on the horizontal axis
        const actualDist = Math.round(dist / mapZoom);
        ctx.font = '9px monospace';
        ctx.fillStyle = 'rgba(0, 229, 255, 0.45)';
        ctx.textAlign = 'center';
        ctx.fillText(`${actualDist}u`, cx + dist, cy - 4);
      }

      // 4. Tactical Center Crosshairs
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.stroke();

      // 5. Radar Sweeping Scan Beam
      const sweepAngle = (Date.now() * 0.0018) % (Math.PI * 2);
      ctx.save();
      const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxScreenRadius);
      sweepGrad.addColorStop(0, 'rgba(0, 229, 255, 0.35)');
      sweepGrad.addColorStop(1, 'rgba(0, 229, 255, 0.01)');
      ctx.strokeStyle = sweepGrad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * maxScreenRadius, cy + Math.sin(sweepAngle) * maxScreenRadius);
      ctx.stroke();
      ctx.restore();

      // 6. Entity Rendering: PLANET vs SPACE
      if (gameState === 'PLANET' && activePlanet) {
        const p = activePlanet;
        const baseRadius = Math.min(w, h) * 0.42;
        const scale = (baseRadius / (p.r || 1)) * mapZoom;

        // Planet Arc / Atmosphere
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, p.r * scale, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
        ctx.fill();
        ctx.strokeStyle = p.color || '#10b981';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 14;
        ctx.shadowColor = p.color || '#10b981';
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Atmospheric Sub-layer
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(10, (p.r - 40) * scale), 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // 1. Water Bodies / Oceans / Lava Lakes on Minimap
        if (p.waterBodies) {
          for (const wb of p.waterBodies) {
            const wx = cx + wb.cx * scale;
            const wy = cy + wb.cy * scale;
            const wr = wb.r * scale;
            ctx.fillStyle = wb.color;
            ctx.beginPath();
            ctx.arc(wx, wy, wr, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();

            if (mapZoom >= 0.7) {
              ctx.font = 'bold 8px monospace';
              ctx.fillStyle = '#ffffff';
              ctx.textAlign = 'center';
              ctx.fillText(p.hazardType === 'HEAT' ? '🌋용암호수' : '🌊외계대양', wx, wy);
            }
          }
        }

        // 2. Mountains & Volcanoes on Minimap
        if (p.mountains) {
          for (const mnt of p.mountains) {
            const mx = cx + mnt.lx * scale;
            const my = cy + mnt.ly * scale;
            const mr = mnt.r * scale;
            ctx.fillStyle = mnt.isVolcano ? '#7f1d1d' : '#334155';
            ctx.beginPath();
            ctx.arc(mx, my, mr, 0, Math.PI * 2);
            ctx.fill();

            if (mnt.isVolcano) {
              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.arc(mx, my, mr * 0.4, 0, Math.PI * 2);
              ctx.fill();
            }

            if (mapZoom >= 0.8) {
              ctx.font = 'bold 8px monospace';
              ctx.fillStyle = mnt.isVolcano ? '#f97316' : '#cbd5e1';
              ctx.textAlign = 'center';
              ctx.fillText(mnt.isVolcano ? '🌋화산' : '🏔️산맥', mx, my - mr - 2);
            }
          }
        }

        // 3. Caves on Minimap
        if (p.caves) {
          for (const cv of p.caves) {
            const cvx = cx + cv.lx * scale;
            const cvy = cy + cv.ly * scale;
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(cvx, cvy, Math.max(4, cv.r * scale), 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            if (mapZoom >= 0.75) {
              ctx.font = 'bold 8px monospace';
              ctx.fillStyle = '#38bdf8';
              ctx.textAlign = 'center';
              ctx.fillText('🕳️동굴', cvx, cvy - cv.r * scale - 2);
            }
          }
        }

        // 4. Fauna (Creatures) on Minimap
        if (p.fauna) {
          for (const cr of p.fauna) {
            const crx = cx + cr.lx * scale;
            const cry = cy + cr.ly * scale;
            const isToolTarget = game.data.toolMode === 'VOLTAIC STAFF';
            ctx.fillStyle = isToolTarget ? '#c084fc' : (cr.speciesRef.color || '#10b981');
            ctx.shadowBlur = isToolTarget ? 12 : 4;
            ctx.shadowColor = isToolTarget ? '#c084fc' : '#10b981';
            ctx.beginPath();
            ctx.arc(crx, cry, isToolTarget ? 6.5 : 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            if (isToolTarget) {
              ctx.strokeStyle = '#c084fc';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(crx, cry, 11, 0, Math.PI * 2);
              ctx.stroke();
            }

            if (mapZoom >= 0.85 || isToolTarget) {
              ctx.font = 'bold 8px monospace';
              ctx.fillStyle = isToolTarget ? '#e9d5ff' : '#a7f3d0';
              ctx.textAlign = 'center';
              ctx.fillText(isToolTarget ? `🎯[생물스캔] ${cr.speciesRef.commonName}` : '🐾외계동물', crx, cry - 7);
            }
          }
        }

        // 5. Sentinels on Minimap
        if (p.planetSentinels) {
          for (const st of p.planetSentinels) {
            const stx = cx + st.lx * scale;
            const sty = cy + st.ly * scale;
            const isToolTarget = game.data.toolMode === 'BOLTCASTER';
            ctx.fillStyle = isToolTarget ? '#ff0033' : (st.state === 'INVESTIGATE' ? '#ef4444' : '#f97316');
            ctx.shadowBlur = isToolTarget ? 14 : 6;
            ctx.shadowColor = ctx.fillStyle;
            ctx.beginPath();
            ctx.arc(stx, sty, isToolTarget ? 7 : 4.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            if (isToolTarget) {
              // Pulsing Target Lock Reticle Ring
              const sentPulse = 11 + Math.sin(Date.now() * 0.01) * 3;
              ctx.strokeStyle = '#ef4444';
              ctx.lineWidth = 1.8;
              ctx.beginPath();
              ctx.arc(stx, sty, sentPulse, 0, Math.PI * 2);
              ctx.stroke();
            }

            if (mapZoom >= 0.85 || isToolTarget) {
              ctx.font = 'bold 8px monospace';
              ctx.fillStyle = isToolTarget ? '#fca5a5' : '#f87171';
              ctx.textAlign = 'center';
              ctx.fillText(isToolTarget ? '🎯[타격목표] 센티넬 드론' : '🤖센티넬', stx, sty - 8);
            }
          }
        }

        // Caves on Minimap (Highlighted when TERRAIN MANIPULATOR is active)
        if (p.caves) {
          for (const cv of p.caves) {
            const cvx = cx + cv.lx * scale;
            const cvy = cy + cv.ly * scale;
            const isToolTarget = game.data.toolMode === 'TERRAIN MANIPULATOR';
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = isToolTarget ? '#00e5ff' : '#38bdf8';
            ctx.lineWidth = isToolTarget ? 2.5 : 1.5;
            ctx.beginPath();
            ctx.arc(cvx, cvy, Math.max(isToolTarget ? 7 : 4, cv.r * scale), 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            if (isToolTarget) {
              ctx.strokeStyle = '#38bdf8';
              ctx.setLineDash([4, 4]);
              ctx.beginPath();
              ctx.arc(cvx, cvy, Math.max(12, cv.r * scale + 5), 0, Math.PI * 2);
              ctx.stroke();
              ctx.setLineDash([]);
            }

            if (mapZoom >= 0.7 || isToolTarget) {
              ctx.font = 'bold 8px monospace';
              ctx.fillStyle = isToolTarget ? '#bae6fd' : '#38bdf8';
              ctx.textAlign = 'center';
              ctx.fillText(isToolTarget ? `🎯[지형굴착] ${cv.name}` : '🕳️동굴', cvx, cvy - cv.r * scale - 3);
            }
          }
        }

        // Deposits on Planet (Highlighted when MINING BEAM is active)
        for (const dep of p.deposits) {
          const dx = cx + dep.lx * scale;
          const dy = cy + dep.ly * scale;

          // Skip if outside viewport
          if (dx < -30 || dx > w + 30 || dy < -30 || dy > h + 30) continue;

          let depColor = '#94a3b8';
          let depName = '';
          if (dep.type === 'sodium') { depColor = '#facc15'; depName = 'Na (나트륨)'; }
          if (dep.type === 'oxygen') { depColor = '#ef4444'; depName = 'O2 (산소)'; }
          if (dep.type === 'dihydrogen') { depColor = '#38bdf8'; depName = 'H (이수소)'; }
          if (dep.type === 'carbon') { depColor = '#10b981'; depName = 'C (탄소)'; }
          if (dep.type === 'ferrite') { depColor = '#e2e8f0'; depName = 'Fe (페라이트)'; }

          const isToolTarget = game.data.toolMode === 'MINING BEAM';

          if (dep.hp > 0) {
            ctx.fillStyle = depColor;
            ctx.shadowBlur = isToolTarget ? 12 : 6;
            ctx.shadowColor = depColor;
            ctx.beginPath();
            ctx.arc(dx, dy, Math.max(3, (isToolTarget ? 6.5 : 5) * Math.min(1.5, mapZoom)), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            if (isToolTarget && (mapZoom >= 0.6 || Math.hypot(dep.lx - game.player.px, dep.ly - game.player.py) < 300)) {
              ctx.strokeStyle = depColor;
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              ctx.arc(dx, dy, (isToolTarget ? 10 : 8) * Math.min(1.5, mapZoom), 0, Math.PI * 2);
              ctx.stroke();
            }

            if (mapZoom >= 0.75 || isToolTarget) {
              ctx.font = 'bold 9px monospace';
              ctx.fillStyle = depColor;
              ctx.textAlign = 'center';
              ctx.fillText(depName, dx, dy - 8);
            }
          } else {
            ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
            ctx.beginPath();
            ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Parked Ship Marker with Beacon Pulse
        const shipX = cx + game.parkedShip.x * scale;
        const shipY = cy + game.parkedShip.y * scale;
        const pulseR = 8 + (Math.sin(Date.now() * 0.007) + 1) * 4;

        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(shipX, shipY, pulseR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#00e5ff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00e5ff';
        ctx.beginPath();
        ctx.arc(shipX, shipY, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#00e5ff';
        ctx.textAlign = 'center';
        ctx.fillText('🚀 내 우주선 (Parked Ship)', shipX, shipY + 20);

        // Player Marker
        const px = cx + game.player.px * scale;
        const py = cy + game.player.py * scale;

        // Player Pulsing Target Ring
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(px, py, 11, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 6.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Player Facing Arrow
        const facing = game.player.facing || 1;
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + facing * 20, py);
        ctx.stroke();

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('📍 현재 위치 (You)', px, py - 14);

        // Distance Vector Line between Player and Parked Ship
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(shipX, shipY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Active Weapon Target Tracking Vector Line (from Player to current Tool Target)
        const toolMode = game.data.toolMode;
        let trackX: number | null = null;
        let trackY: number | null = null;
        let trackColor = '#00e5ff';

        if (toolMode === 'MINING BEAM') {
          trackColor = '#00e5ff';
          let cDist = Infinity;
          for (const d of p.deposits) {
            if (d.hp > 0) {
              const dist = Math.hypot(d.lx - game.player.px, d.ly - game.player.py);
              if (dist < cDist) {
                cDist = dist;
                trackX = cx + d.lx * scale;
                trackY = cy + d.ly * scale;
              }
            }
          }
        } else if (toolMode === 'BOLTCASTER') {
          trackColor = '#ef4444';
          let cDist = Infinity;
          if (p.planetSentinels) {
            for (const s of p.planetSentinels) {
              if (s.hp > 0) {
                const dist = Math.hypot(s.lx - game.player.px, s.ly - game.player.py);
                if (dist < cDist) {
                  cDist = dist;
                  trackX = cx + s.lx * scale;
                  trackY = cy + s.ly * scale;
                }
              }
            }
          }
        } else if (toolMode === 'TERRAIN MANIPULATOR') {
          trackColor = '#38bdf8';
          let cDist = Infinity;
          if (p.caves) {
            for (const c of p.caves) {
              const dist = Math.hypot(c.lx - game.player.px, c.ly - game.player.py);
              if (dist < cDist) {
                cDist = dist;
                trackX = cx + c.lx * scale;
                trackY = cy + c.ly * scale;
              }
            }
          }
        } else if (toolMode === 'VOLTAIC STAFF') {
          trackColor = '#c084fc';
          let cDist = Infinity;
          if (p.fauna) {
            for (const f of p.fauna) {
              const dist = Math.hypot(f.lx - game.player.px, f.ly - game.player.py);
              if (dist < cDist) {
                cDist = dist;
                trackX = cx + f.lx * scale;
                trackY = cy + f.ly * scale;
              }
            }
          }
        }

        if (trackX !== null && trackY !== null) {
          ctx.strokeStyle = trackColor;
          ctx.lineWidth = 1.8;
          ctx.setLineDash([6, 3]);
          ctx.shadowBlur = 8;
          ctx.shadowColor = trackColor;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(trackX, trackY);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.shadowBlur = 0;
        }
      } else if (gameState === 'SPACE') {
        // Space Mode: Solar System & Starship
        const maxDist = 4200;
        const baseRadius = Math.min(w, h) * 0.42;
        const scale = (baseRadius / maxDist) * mapZoom;

        // Space Station
        if (game.entities.station) {
          const stX = cx + game.entities.station.x * scale;
          const stY = cy + game.entities.station.y * scale;

          ctx.fillStyle = '#00e5ff';
          ctx.shadowBlur = 14;
          ctx.shadowColor = '#00e5ff';
          ctx.beginPath();
          ctx.arc(stX, stY, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = '#00e5ff';
          ctx.textAlign = 'center';
          ctx.fillText('🛸 우주정거장 (Space Station)', stX, stY + 20);
        }

        // Planets
        for (const p of game.entities.planets) {
          const px = cx + p.x * scale;
          const py = cy + p.y * scale;
          const pR = Math.max(6, p.r * scale * 0.4);

          ctx.fillStyle = p.color || '#10b981';
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color || '#10b981';
          ctx.beginPath();
          ctx.arc(px, py, pR, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.font = 'bold 10px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(`🪐 ${p.name}`, px, py - pR - 6);
        }

        // Space Ship Player
        const shipX = cx + game.player.x * scale;
        const shipY = cy + game.player.y * scale;

        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#00e5ff';
        ctx.beginPath();
        ctx.arc(shipX, shipY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Heading Vector Line
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(shipX, shipY);
        ctx.lineTo(
          shipX + Math.cos(game.player.angle) * 24,
          shipY + Math.sin(game.player.angle) * 24
        );
        ctx.stroke();

        ctx.font = 'bold 11px monospace';
        ctx.fillStyle = '#00e5ff';
        ctx.textAlign = 'center';
        ctx.fillText('🚀 내 함선 (You)', shipX, shipY - 14);
      }

      // 7. Tactical Outer Border & North Heading
      ctx.font = '900 13px monospace';
      ctx.fillStyle = '#00e5ff';
      ctx.textAlign = 'center';
      ctx.fillText('▲ N (북쪽)', cx, 30);
      ctx.fillText('▼ S (남쪽)', cx, h - 16);
      ctx.textAlign = 'left';
      ctx.fillText('◀ W (서)', 20, cy);
      ctx.textAlign = 'right';
      ctx.fillText('E (동) ▶', w - 20, cy);

      animId = requestAnimationFrame(renderFullscreenRadar);
    };

    animId = requestAnimationFrame(renderFullscreenRadar);
    return () => cancelAnimationFrame(animId);
  }, [isFullscreen, gameState, activePlanet, game, mapZoom, panOffset]);

  // Coordinates calculation
  const coordText =
    gameState === 'PLANET'
      ? `X: ${Math.round(game.player.px)} | Y: ${Math.round(game.player.py)}`
      : `X: ${Math.round(game.player.x)} | Y: ${Math.round(game.player.y)}`;

  const distToShip =
    gameState === 'PLANET'
      ? Math.round(
          Math.hypot(
            game.parkedShip.x - game.player.px,
            game.parkedShip.y - game.player.py
          )
        )
      : null;

  return (
    <>
      {/* 1. Main Game HUD: Minimap Button + Independent Game Camera Zoom Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto">
        {/* Fullscreen Minimap Trigger Button */}
        <button
          onClick={() => {
            AudioSys.playNote(580, 'sine', 0.12);
            setIsFullscreen(true);
          }}
          className="h-8 sm:h-9 px-2 sm:px-3 bg-slate-950/90 hover:bg-slate-900 border border-cyan-400/80 text-cyan-300 rounded-lg flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold shadow-[0_0_15px_rgba(0,229,255,0.35)] cursor-pointer active:scale-95 transition-all pointer-events-auto shrink-0 group backdrop-blur-md"
          title="미니맵 전체화면 열기 (Click for Fullscreen Map)"
        >
          <Compass
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 group-hover:rotate-45 transition-transform animate-spin"
            style={{ animationDuration: '10s' }}
          />
          <span className="font-mono">지도</span>
          <Maximize2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-400/70 ml-0.5 group-hover:scale-125 transition-transform" />
        </button>

        {/* Dedicated Game Screen Camera Zoom Controls (게임 화면 확대/축소) */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-950/85 backdrop-blur-md px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-lg border border-cyan-500/30 text-[9px] sm:text-xs font-mono shadow-md">
          <button
            onClick={onZoomOut}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 flex items-center justify-center cursor-pointer active:scale-90 border border-white/10"
            title="게임 화면 축소"
          >
            <ZoomOut className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
          <button
            onClick={onResetZoom}
            className="px-1 sm:px-1.5 h-6 sm:h-7 rounded bg-slate-900 hover:bg-slate-800 text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center cursor-pointer active:scale-90 border border-white/10"
            title="게임 화면 100% 초기화"
          >
            {Math.round(cameraZoom * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 flex items-center justify-center cursor-pointer active:scale-90 border border-white/10"
            title="게임 화면 확대"
          >
            <ZoomIn className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Fullscreen Minimap (독립적인 미니맵 확대/축소 & 드래그 탐색 지원) */}
      {isFullscreen && (
        <div
          id="minimap-fullscreen-root"
          data-prevent-game-zoom="true"
          className="fixed inset-0 z-[100] w-screen h-screen bg-slate-950 flex flex-col justify-between select-none animate-in fade-in duration-200 pointer-events-auto overflow-hidden touch-none"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Top Bar Floating Header */}
          <div
            className="w-full bg-slate-950/90 backdrop-blur-md border-b border-cyan-400/30 px-4 py-2.5 flex items-center justify-between z-10 shrink-0"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 text-white font-bold nms-header-font text-base sm:text-lg">
              <Compass
                className="w-5 h-5 text-cyan-400 animate-spin"
                style={{ animationDuration: '8s' }}
              />
              <span>{gameState === 'PLANET' ? '행성 전술 탐사도' : '성계 궤도 전술도'}</span>
              <span className="hidden sm:inline text-xs text-cyan-400/80 font-mono font-normal ml-1">
                [FULLSCREEN RADAR]
              </span>
            </div>

            {/* Coordinates & Ship Distance Info */}
            <div className="flex items-center gap-2 sm:gap-4 text-xs font-mono">
              {/* Active Weapon Tracking Badge */}
              {gameState === 'PLANET' && (
                <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/80 border border-cyan-400/50 text-[11px] font-bold">
                  <span className="text-gray-400">무기 추적:</span>
                  <span className={
                    game.data.toolMode === 'MINING BEAM' ? 'text-emerald-300' :
                    game.data.toolMode === 'BOLTCASTER' ? 'text-red-400' :
                    game.data.toolMode === 'TERRAIN MANIPULATOR' ? 'text-sky-300' : 'text-purple-300'
                  }>
                    {game.data.toolMode === 'MINING BEAM' ? '💎 광물 광맥 (Na/O2/H/Fe/C)' :
                     game.data.toolMode === 'BOLTCASTER' ? '🤖 센티넬 감시 드론' :
                     game.data.toolMode === 'TERRAIN MANIPULATOR' ? '🕳️ 지하 동굴 / 산맥 지형' : '🐾 외계 동물 (생물 스캔)'}
                  </span>
                </span>
              )}

              <span className="text-cyan-300 flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-cyan-500/30 text-[11px]">
                <MapPin className="w-3 h-3 text-cyan-400" />
                <span>{coordText}</span>
              </span>
              {distToShip !== null && (
                <span className="text-emerald-300 font-bold bg-slate-900/90 px-2.5 py-1 rounded-lg border border-emerald-500/30 hidden sm:inline text-[11px]">
                  🚀 우주선: {distToShip}u
                </span>
              )}
            </div>

            {/* Close Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-white font-mono font-bold text-xs flex items-center gap-1.5 border border-red-500/60 cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.35)]"
                title="닫기 (ESC)"
              >
                <X className="w-4 h-4" />
                <span>닫기 [ESC]</span>
              </button>
            </div>
          </div>

          {/* Central Interactive Minimap Viewport */}
          <div
            ref={containerRef}
            className="flex-1 w-full h-full relative min-h-0 cursor-grab active:cursor-grabbing overflow-hidden"
            onClick={e => e.stopPropagation()}
            onWheel={handleMinimapWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <canvas
              ref={canvasRef}
              className="minimap-canvas absolute inset-0 w-full h-full block"
            />

            {/* Quick Navigation Overlay Pill on Top-Right of Map Viewport */}
            <div className="absolute top-3 right-4 flex items-center gap-2 z-20 pointer-events-auto">
              <button
                onClick={centerOnPlayer}
                className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-cyan-400/60 text-cyan-300 rounded-lg flex items-center gap-1.5 text-xs font-mono font-bold shadow-lg cursor-pointer active:scale-95 transition-all backdrop-blur-md"
                title="내 위치로 중심 이동"
              >
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>내 위치 중심</span>
              </button>
              <button
                onClick={resetMinimapOverview}
                className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-white/20 text-gray-300 rounded-lg flex items-center gap-1.5 text-xs font-mono font-bold shadow-lg cursor-pointer active:scale-95 transition-all backdrop-blur-md"
                title="전체 조망 초기화"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-400" />
                <span>전체 조망</span>
              </button>
            </div>

            {/* Gesture Tip Overlay (Discreet) */}
            <div className="absolute bottom-3 left-4 text-[10px] text-gray-400 font-mono bg-black/60 px-2.5 py-1 rounded-md border border-white/10 pointer-events-none hidden sm:block">
              💡 드래그로 화면 이동 | 마우스 휠 또는 핀치로 미니맵 확대/축소
            </div>
          </div>

          {/* Bottom Floating Bar: Resource Legend & Minimap Zoom Controls */}
          <div
            className="w-full bg-slate-950/90 backdrop-blur-md border-t border-cyan-400/30 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-10 shrink-0"
            onClick={e => e.stopPropagation()}
          >
            {/* Resource & Environment Legend (Planet Mode) */}
            {gameState === 'PLANET' ? (
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-mono">
                <div className="flex items-center gap-1 text-yellow-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 shadow-[0_0_6px_#facc15]" />
                  <span>나트륨</span>
                </div>
                <div className="flex items-center gap-1 text-red-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444]" />
                  <span>산소</span>
                </div>
                <div className="flex items-center gap-1 text-sky-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_6px_#38bdf8]" />
                  <span>이수소</span>
                </div>
                <div className="flex items-center gap-1 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-[0_0_6px_#cbd5e1]" />
                  <span>페라이트</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                  <span>탄소</span>
                </div>
                <div className="flex items-center gap-1 text-cyan-300">
                  <span>🌊 바다/호수</span>
                </div>
                <div className="flex items-center gap-1 text-orange-400">
                  <span>🌋 산/화산</span>
                </div>
                <div className={`flex items-center gap-1 ${game.data.toolMode === 'TERRAIN MANIPULATOR' ? 'text-sky-300 font-bold bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-400 animate-pulse' : 'text-blue-300'}`}>
                  <span>🕳️ 동굴</span>
                </div>
                <div className={`flex items-center gap-1 ${game.data.toolMode === 'VOLTAIC STAFF' ? 'text-purple-300 font-bold bg-purple-950/80 px-1.5 py-0.5 rounded border border-purple-400 animate-pulse' : 'text-green-300'}`}>
                  <span>🐾 외계동물</span>
                </div>
                <div className={`flex items-center gap-1 font-bold ${game.data.toolMode === 'BOLTCASTER' ? 'text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded border border-red-500 animate-pulse' : 'text-red-400'}`}>
                  <span>🤖 센티넬</span>
                </div>
                <div className="flex items-center gap-1 text-cyan-300 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00e5ff]" />
                  <span>내 우주선</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-cyan-300 font-mono flex items-center gap-2">
                <span>🛸 성계 궤도: 항성계 내 전 행성 및 우주 정거장 실시간 위치</span>
              </div>
            )}

            {/* Independent Minimap Zoom Controls (미니맵 전용 확대/축소) */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-cyan-300 font-mono font-bold">미니맵 배율:</span>
              <button
                onClick={handleMinimapZoomOut}
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-400/60 text-cyan-300 flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
                title="미니맵 축소"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={resetMinimapOverview}
                className="px-2.5 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-400/60 text-white font-mono text-xs flex items-center justify-center cursor-pointer active:scale-95 font-bold"
                title="100% 기본 배율"
              >
                {Math.round(mapZoom * 100)}%
              </button>
              <button
                onClick={handleMinimapZoomIn}
                className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-cyan-400/60 text-cyan-300 flex items-center justify-center cursor-pointer active:scale-95 shadow-sm"
                title="미니맵 확대"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
