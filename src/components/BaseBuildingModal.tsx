import React, { useState } from 'react';
import { GameEngine } from '../gameEngine';
import { NmsAudioEngine } from '../three/audio/NmsAudioEngine';

interface BaseBuildingModalProps {
  game: GameEngine;
  onClose: () => void;
}

type BuildCategory = 'HABITATION' | 'POWER' | 'STRUCTURE';

interface BuildableModule {
  id: string;
  name: string;
  category: BuildCategory;
  icon: string;
  desc: string;
  costDesc: string;
  requiredFerrite: number;
  requiredPureFerrite: number;
  requiredCarbon: number;
  powerDelta: number;
  demandDelta: number;
  color: string;
}

export const BaseBuildingModal: React.FC<BaseBuildingModalProps> = ({ game, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<BuildCategory>('HABITATION');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('hab_cylinder');

  const baseHousing = game.data.baseHousing;
  const inv = game.data.inv;

  const modules: BuildableModule[] = [
    // Habitation
    {
      id: 'hab_cylinder',
      name: '원통형 대형 거주 모듈',
      category: 'HABITATION',
      icon: '🏢',
      desc: '행성의 가혹한 대기 폭풍과 방사능을 완벽히 차단하는 원작 시그니처 원통형 모듈입니다.',
      costDesc: '순수 페라이트 x40, 탄소 x20',
      requiredFerrite: 0,
      requiredPureFerrite: 40,
      requiredCarbon: 20,
      powerDelta: 0,
      demandDelta: 15,
      color: '#06b6d4'
    },
    {
      id: 'hab_square',
      name: '정사각형 모듈 룸',
      category: 'HABITATION',
      icon: '🏠',
      desc: '모듈식 확장이 용이한 고강도 티타늄 합금 큐브형 거주 공간입니다.',
      costDesc: '순수 페라이트 x35, 탄소 x15',
      requiredFerrite: 0,
      requiredPureFerrite: 35,
      requiredCarbon: 15,
      powerDelta: 0,
      demandDelta: 12,
      color: '#38bdf8'
    },
    {
      id: 'biodome',
      name: '바이오돔 수경재배 온실',
      category: 'HABITATION',
      icon: '🌱',
      desc: '별빛 가시풀, 솔라 바인, 닙닙 새싹 등 희귀 외계 식물을 대량 수확하는 지오데식 유리 돔입니다.',
      costDesc: '순수 페라이트 x50, 탄소 x30',
      requiredFerrite: 0,
      requiredPureFerrite: 50,
      requiredCarbon: 30,
      powerDelta: 0,
      demandDelta: 25,
      color: '#10b981'
    },

    // Power
    {
      id: 'solar_panel',
      name: '태양광 발전기 패널',
      category: 'POWER',
      icon: '☀️',
      desc: '항성의 일조량을 실시간 추적하여 낮 동안 50 kW의 청정 전력을 생산합니다.',
      costDesc: '페라이트 x30, 금속 도금판 x1',
      requiredFerrite: 30,
      requiredPureFerrite: 0,
      requiredCarbon: 0,
      powerDelta: 50,
      demandDelta: 0,
      color: '#facc15'
    },
    {
      id: 'battery_bank',
      name: '대용량 전력 배터리',
      category: 'POWER',
      icon: '🔋',
      desc: '낮에 생산된 잉여 전력을 100,000 kF까지 비축하여 일몰 후 밤에도 기지 전력을 공급합니다.',
      costDesc: '순수 페라이트 x25, 탄소 x10',
      requiredFerrite: 0,
      requiredPureFerrite: 25,
      requiredCarbon: 10,
      powerDelta: 0,
      demandDelta: 0,
      color: '#34d399'
    },
    {
      id: 'teleporter',
      name: '단거리 순간이동기 링',
      category: 'POWER',
      icon: '🌀',
      desc: '기지 내 서로 다른 구역이나 광물 채굴지 사이를 광속으로 오가는 아공간 웜홀 터미널입니다.',
      costDesc: '순수 페라이트 x30, 탄소 x20',
      requiredFerrite: 0,
      requiredPureFerrite: 30,
      requiredCarbon: 20,
      powerDelta: 0,
      demandDelta: 20,
      color: '#c084fc'
    },

    // Structure
    {
      id: 'airlock_door',
      name: '기지 자동 에어록 도어',
      category: 'STRUCTURE',
      icon: '🚪',
      desc: '여행자가 다가오면 부드럽게 감응하여 열리는 기밀 압력 도어입니다.',
      costDesc: '페라이트 x20',
      requiredFerrite: 20,
      requiredPureFerrite: 0,
      requiredCarbon: 0,
      powerDelta: 0,
      demandDelta: 5,
      color: '#e2e8f0'
    },
    {
      id: 'access_ramp',
      name: '진입 경사로 & 램프',
      category: 'STRUCTURE',
      icon: '📐',
      desc: '험준한 외계 지형에서도 모듈로 쉽게 보행 진입할 수 있도록 돕는 구조물입니다.',
      costDesc: '페라이트 x15',
      requiredFerrite: 15,
      requiredPureFerrite: 0,
      requiredCarbon: 0,
      powerDelta: 0,
      demandDelta: 0,
      color: '#94a3b8'
    },
    {
      id: 'landing_pad',
      name: '육각 스타쉽 착륙장',
      category: 'STRUCTURE',
      icon: '🛸',
      desc: '우주선 이착륙 시 발진 추진기 연료 소모를 0으로 만들어주는 자동 유도 착륙장입니다.',
      costDesc: '순수 페라이트 x60, 탄소 x40',
      requiredFerrite: 0,
      requiredPureFerrite: 60,
      requiredCarbon: 40,
      powerDelta: 0,
      demandDelta: 10,
      color: '#f97316'
    }
  ];

  const filteredModules = modules.filter((m) => m.category === activeCategory);
  const activeModule = modules.find((m) => m.id === selectedModuleId) || modules[0];

  const hasMaterials =
    (inv.ferrite || 0) >= activeModule.requiredFerrite &&
    (inv.pureFerrite || 0) >= activeModule.requiredPureFerrite &&
    (inv.carbon || 0) >= activeModule.requiredCarbon;

  const handleConstruct = () => {
    if (!hasMaterials) {
      // Auto-grant construction materials in creative/assisted style so the player can experience building
      game.data.inv.ferrite = (game.data.inv.ferrite || 0) + 100;
      game.data.inv.pureFerrite = (game.data.inv.pureFerrite || 0) + 100;
      game.data.inv.carbon = (game.data.inv.carbon || 0) + 100;
      NmsAudioEngine.getInstance().playQuickRechargeChime();
      game.spawnFloatText('📦 기지 건축 자재(페라이트/탄소) 긴급 보급 완료!', undefined, undefined, '#10b981');
    }

    if (activeModule.requiredFerrite > 0) game.data.inv.ferrite = Math.max(0, (game.data.inv.ferrite || 0) - activeModule.requiredFerrite);
    if (activeModule.requiredPureFerrite > 0) game.data.inv.pureFerrite = Math.max(0, (game.data.inv.pureFerrite || 0) - activeModule.requiredPureFerrite);
    if (activeModule.requiredCarbon > 0) game.data.inv.carbon = Math.max(0, (game.data.inv.carbon || 0) - activeModule.requiredCarbon);

    game.constructBaseModule(
      activeModule.id,
      activeModule.name,
      activeModule.powerDelta,
      activeModule.demandDelta
    );
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
                3D 기지 건설 & 모듈 스냅 건축 // BASE BUILDING [Z]
              </h2>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              기지 컴퓨터 반경 300u // 지형 밀착형 3D 실시간 스냅 건축
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-gray-300 rounded-lg border border-slate-700 cursor-pointer font-mono"
          >
            닫기 [Z / ESC]
          </button>
        </div>

        {/* Base Power Grid & Stats Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2.5 bg-slate-900/90 rounded-xl border border-cyan-500/30 text-center">
            <span className="text-[10px] text-gray-400 block">설치된 총 모듈</span>
            <span className="text-base font-extrabold text-cyan-300 mt-0.5 block">
              {baseHousing.modulesCount}개
            </span>
            <span className="text-[9px] text-gray-500">{baseHousing.name.split(' ')[0]}</span>
          </div>

          <div className="p-2.5 bg-slate-900/90 rounded-xl border border-yellow-500/30 text-center">
            <span className="text-[10px] text-gray-400 block">태양광 발전량</span>
            <span className="text-base font-extrabold text-yellow-300 mt-0.5 block">
              {baseHousing.powerOutput} kW
            </span>
            <span className="text-[9px] text-emerald-400 font-bold">전력 흑자</span>
          </div>

          <div className="p-2.5 bg-slate-900/90 rounded-xl border border-rose-500/30 text-center">
            <span className="text-[10px] text-gray-400 block">기지 전력 소모량</span>
            <span className="text-base font-extrabold text-rose-300 mt-0.5 block">
              {baseHousing.powerDemand} kW
            </span>
            <span className="text-[9px] text-gray-400">가동률 정상</span>
          </div>

          <div className="p-2.5 bg-slate-900/90 rounded-xl border border-emerald-500/30 text-center">
            <span className="text-[10px] text-gray-400 block">배터리 저장량</span>
            <span className="text-base font-extrabold text-emerald-300 mt-0.5 block">
              {Math.round(baseHousing.batteryStored / 1000)} kF
            </span>
            <span className="text-[9px] text-emerald-400 font-bold">100% 완충</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          {[
            { id: 'HABITATION', label: '🏢 거주 모듈 (Habitation)' },
            { id: 'POWER', label: '⚡ 전력 & 기술 (Power & Tech)' },
            { id: 'STRUCTURE', label: '🏗️ 구조 & 편의 (Structure)' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as BuildCategory);
                NmsAudioEngine.getInstance().playQuickRechargeChime();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeCategory === cat.id
                  ? 'bg-cyan-500 text-black font-extrabold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-900 text-gray-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {filteredModules.map((m) => {
            const isSelected = m.id === selectedModuleId;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedModuleId(m.id);
                  NmsAudioEngine.getInstance().playQuickRechargeChime();
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] scale-102'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{m.icon}</span>
                    <span className="text-xs font-bold text-white">{m.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 leading-tight block mt-1.5 line-clamp-2">
                    {m.desc}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-cyan-300 font-bold">{m.costDesc}</span>
                  {m.powerDelta > 0 && <span className="text-yellow-400 font-bold">+{m.powerDelta}kW</span>}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Selected Module Blueprint Construction Bar */}
        <div className="p-3.5 bg-slate-900/90 rounded-xl border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg">{activeModule.icon}</span>
              <span className="text-xs font-black text-white">{activeModule.name}</span>
              <span className="text-[10px] text-cyan-300 font-mono">[{activeModule.costDesc}]</span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono flex items-center gap-3">
              <span>보유 페라이트: {inv.ferrite || 0}</span>
              <span>순수 페라이트: {inv.pureFerrite || 0}</span>
              <span>탄소: {inv.carbon || 0}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                game.data.inv.ferrite = (game.data.inv.ferrite || 0) + 150;
                game.data.inv.pureFerrite = (game.data.inv.pureFerrite || 0) + 150;
                game.data.inv.carbon = (game.data.inv.carbon || 0) + 150;
                NmsAudioEngine.getInstance().playQuickRechargeChime();
                game.spawnFloatText('📦 기지 건축 자재 +150개 보급 완료!', undefined, undefined, '#10b981');
              }}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 border border-slate-700 text-xs rounded-xl font-mono cursor-pointer shrink-0"
              title="건축 자재 긴급 보급"
            >
              자재 보급
            </button>

            <button
              onClick={handleConstruct}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black rounded-xl text-xs font-mono cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <span>🏗️</span>
              <span>3D 기지에 실시간 건축 스냅</span>
            </button>
          </div>
        </div>

        {/* Footer tip */}
        <div className="text-[10px] text-gray-500 font-mono text-center">
          배치된 구조물은 행성 표면 3D 환경에 즉시 실시간 렌더링되며, 전력망과 연결되어 작동합니다.
        </div>
      </div>
    </div>
  );
};
