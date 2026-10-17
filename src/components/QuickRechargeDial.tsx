import React, { useState } from 'react';
import { GameEngine } from '../gameEngine';
import { NmsAudioEngine } from '../three/audio/NmsAudioEngine';

interface QuickRechargeDialProps {
  game: GameEngine;
  onClose: () => void;
}

interface RechargeSlot {
  id: string;
  name: string;
  category: 'EXOSUIT' | 'SHIP' | 'MULTITOOL';
  currentVal: number;
  maxVal: number;
  color: string;
  icon: string;
  fuelName: string;
  fuelCost: number;
  fuelAvailable: number;
  rechargeAction: () => void;
  desc: string;
}

export const QuickRechargeDial: React.FC<QuickRechargeDialProps> = ({ game, onClose }) => {
  const [selectedSlotId, setSelectedSlotId] = useState<string>('hazard');

  const inv = game.data.inv;
  const hazardVal = Math.round(game.data.hazard);
  const lifeVal = Math.round(game.data.lifeSupport);
  const weaponVal = Math.round(game.data.weaponCharge);
  const shieldVal = Math.round(game.data.shield);

  const slots: RechargeSlot[] = [
    {
      id: 'hazard',
      name: '환경 방호복 보호막',
      category: 'EXOSUIT',
      currentVal: hazardVal,
      maxVal: 100,
      color: '#facc15',
      icon: '🛡️',
      fuelName: '나트륨 (Na)',
      fuelCost: 15,
      fuelAvailable: inv.sodium || 0,
      rechargeAction: () => {
        game.rechargeHazard();
        NmsAudioEngine.getInstance().playQuickRechargeChime();
      },
      desc: '극한 기후(방사능/유독/고열/혹한)로부터 신체를 보호하는 엑소슈트 실드입니다.'
    },
    {
      id: 'life',
      name: '생명 유지 장치',
      category: 'EXOSUIT',
      currentVal: lifeVal,
      maxVal: 100,
      color: '#ef4444',
      icon: '❤️',
      fuelName: '산소 (O₂)',
      fuelCost: 15,
      fuelAvailable: inv.oxygen || 0,
      rechargeAction: () => {
        game.rechargeLifeSupport();
        NmsAudioEngine.getInstance().playQuickRechargeChime();
      },
      desc: '행성 지표면 활동 시 호흡과 신진대사를 유지하는 산소 공급 탱크입니다.'
    },
    {
      id: 'mining',
      name: '채굴 레이저 빔',
      category: 'MULTITOOL',
      currentVal: weaponVal,
      maxVal: 100,
      color: '#06b6d4',
      icon: '⚡',
      fuelName: '탄소 (C)',
      fuelCost: 20,
      fuelAvailable: inv.carbon || 0,
      rechargeAction: () => {
        game.rechargeMiningBeam();
        NmsAudioEngine.getInstance().playQuickRechargeChime();
      },
      desc: '광물과 외계 식생을 절삭하는 다목적 도구의 고주파 플라즈마 에너지원입니다.'
    },
    {
      id: 'shield',
      name: '함선 편향 방어막',
      category: 'SHIP',
      currentVal: shieldVal,
      maxVal: game.data.maxShield || 100,
      color: '#38bdf8',
      icon: '🛸',
      fuelName: '나트륨 (Na)',
      fuelCost: 20,
      fuelAvailable: inv.sodium || 0,
      rechargeAction: () => {
        game.rechargeDeflectorShield();
        NmsAudioEngine.getInstance().playQuickRechargeChime();
      },
      desc: '성간 해적선과 센티넬 요격기의 레이저 포화를 분산 흡수하는 스타쉽 실드입니다.'
    },
    {
      id: 'thruster',
      name: '발진 추진기',
      category: 'SHIP',
      currentVal: 75,
      maxVal: 100,
      color: '#c084fc',
      icon: '🚀',
      fuelName: '이수소 (H)',
      fuelCost: 25,
      fuelAvailable: inv.dihydrogen || 0,
      rechargeAction: () => {
        game.rechargeLaunchThruster();
        NmsAudioEngine.getInstance().playQuickRechargeChime();
      },
      desc: '행성 지표면에서 궤도로 즉시 비상하기 위한 스타쉽 수직 이착륙 화학 로켓입니다.'
    },
    {
      id: 'pulse',
      name: '펄스 엔진',
      category: 'SHIP',
      currentVal: 90,
      maxVal: 100,
      color: '#10b981',
      icon: '🌌',
      fuelName: '삼중수소 (³H)',
      fuelCost: 20,
      fuelAvailable: inv.tritium || 0,
      rechargeAction: () => {
        game.rechargePulseEngine();
        NmsAudioEngine.getInstance().playQuickRechargeChime();
      },
      desc: '소행성 지대를 초광속(36 u/s)으로 순항하는 아공간 가속 엔진입니다.'
    }
  ];

  const activeSlot = slots.find((s) => s.id === selectedSlotId) || slots[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md animate-fadeIn">
      {/* Background Holographic Glow */}
      <div className="absolute w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg bg-slate-950/95 border border-cyan-500/40 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.25)] p-5 text-white flex flex-col items-center">
        {/* Header with authentic NMS Quick Menu Tag */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-sm font-black tracking-wider text-cyan-300 uppercase font-mono">
              원작 원형 퀵 충전 콘솔 // QUICK RECHARGE
            </h2>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-gray-300 rounded-lg border border-slate-700 cursor-pointer font-mono"
          >
            [X / ESC] 닫기
          </button>
        </div>

        {/* Circular Radial Dial Interface (SVG Dial Rings) */}
        <div className="relative w-64 h-64 my-2 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background Outer Ring */}
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />

            {/* Radial Segment Arcs for the 6 Quick Slots */}
            {slots.map((slot, idx) => {
              const radius = 42;
              const circumference = 2 * Math.PI * radius;
              const segmentAngle = 360 / slots.length;
              const gap = 4;
              const strokeLength = ((segmentAngle - gap) / 360) * circumference;
              const offset = (idx * segmentAngle / 360) * circumference;
              const pct = Math.min(1, Math.max(0, slot.currentVal / slot.maxVal));
              const fillLength = strokeLength * pct;
              const isSelected = slot.id === selectedSlotId;

              return (
                <g key={slot.id} className="cursor-pointer" onClick={() => setSelectedSlotId(slot.id)}>
                  {/* Segment Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth={isSelected ? '6' : '3.5'}
                    strokeDasharray={`${strokeLength} ${circumference}`}
                    strokeDashoffset={-offset}
                    className="transition-all duration-300"
                  />
                  {/* Active Segment Fill */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={slot.color}
                    strokeWidth={isSelected ? '6' : '4'}
                    strokeDasharray={`${fillLength} ${circumference}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </g>
              );
            })}
          </svg>

          {/* Center Holographic Core Display */}
          <div className="absolute inset-10 rounded-full bg-slate-900/90 border border-cyan-400/30 shadow-[inset_0_0_20px_rgba(6,182,212,0.3)] flex flex-col items-center justify-center text-center p-3">
            <span className="text-2xl mb-1">{activeSlot.icon}</span>
            <span className="text-xs font-bold text-gray-200 leading-tight">{activeSlot.name}</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-lg font-black font-mono" style={{ color: activeSlot.color }}>
                {activeSlot.currentVal}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">/ {activeSlot.maxVal}%</span>
            </div>
          </div>
        </div>

        {/* 6 Radial Buttons Grid for Quick Selection */}
        <div className="w-full grid grid-cols-3 gap-2 my-3">
          {slots.map((slot) => {
            const isSelected = slot.id === selectedSlotId;
            return (
              <button
                key={slot.id}
                onClick={() => {
                  setSelectedSlotId(slot.id);
                  NmsAudioEngine.getInstance().playQuickRechargeChime();
                }}
                className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] scale-102'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{slot.icon}</span>
                  <span className="text-[11px] font-bold text-gray-200 truncate">{slot.name.split(' ')[0]}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1 mt-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(slot.currentVal / slot.maxVal) * 100}%`,
                      backgroundColor: slot.color
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Slot Detailed Charge Panel & Action Button */}
        <div className="w-full bg-slate-900/80 border border-cyan-500/30 rounded-xl p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">{activeSlot.desc}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div>
              <span className="text-[10px] text-gray-400 block font-mono">필요 연료 소모</span>
              <span className="text-xs font-bold font-mono text-cyan-300">
                {activeSlot.fuelName} x{activeSlot.fuelCost}개{' '}
                <span className="text-gray-400 font-normal">
                  (보유: {activeSlot.fuelAvailable}개)
                </span>
              </span>
            </div>

            <button
              onClick={activeSlot.rechargeAction}
              disabled={activeSlot.fuelAvailable < activeSlot.fuelCost || activeSlot.currentVal >= activeSlot.maxVal}
              className={`px-5 py-2.5 rounded-xl font-bold font-mono text-xs flex items-center gap-1.5 cursor-pointer shadow-lg transition-all ${
                activeSlot.fuelAvailable < activeSlot.fuelCost || activeSlot.currentVal >= activeSlot.maxVal
                  ? 'bg-slate-800 text-gray-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white border border-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95'
              }`}
            >
              <span>⚡</span>
              <span>
                {activeSlot.currentVal >= activeSlot.maxVal
                  ? '완전 충전됨'
                  : activeSlot.fuelAvailable < activeSlot.fuelCost
                  ? '연료 부족'
                  : '원터치 급속 충전 (+50%)'}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom shortcut notice */}
        <div className="mt-3 text-[10px] text-gray-500 font-mono text-center">
          단축키 [X] 키로 게임 플레이 도중 언제든 원형 충전 다이얼을 즉각 호출할 수 있습니다.
        </div>
      </div>
    </div>
  );
};
