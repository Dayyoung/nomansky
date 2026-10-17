import React, { useState } from 'react';
import { GameEngine } from '../gameEngine';
import { NmsAudioEngine } from '../three/audio/NmsAudioEngine';

interface CapitalFreighterModalProps {
  game: GameEngine;
  onClose: () => void;
}

interface FrigateShip {
  id: string;
  name: string;
  type: 'COMBAT' | 'EXPLORATION' | 'INDUSTRIAL' | 'TRADE' | 'SUPPORT';
  typeLabel: string;
  icon: string;
  rank: 'S' | 'A' | 'B';
  stats: string;
  fuelCost: number;
  expeditionsCount: number;
  color: string;
}

interface ExpeditionMission {
  id: string;
  title: string;
  type: 'COMBAT' | 'EXPLORATION' | 'TRADE';
  difficulty: string;
  durationText: string;
  rewardUnits: number;
  rewardNanites: number;
  bonusItem: string;
  status: 'READY' | 'DISPATCHED' | 'COMPLETED';
  log: string;
}

export const CapitalFreighterModal: React.FC<CapitalFreighterModalProps> = ({ game, onClose }) => {
  const [activeTab, setActiveTab] = useState<'FLEET' | 'EXPEDITION' | 'BRIDGE'>('EXPEDITION');

  const [frigates] = useState<FrigateShip[]>([
    {
      id: 'frig_1',
      name: '성간 순양함 노스스타 (SSV Northstar)',
      type: 'COMBAT',
      typeLabel: '전투 요격 호위함',
      icon: '⚔️',
      rank: 'S',
      stats: '화력: 42 // 방어막: 38',
      fuelCost: 15,
      expeditionsCount: 18,
      color: 'border-red-500/50 text-red-300'
    },
    {
      id: 'frig_2',
      name: '심우주 탐사선 아틀라스의 눈 (Eye of Atlas)',
      type: 'EXPLORATION',
      typeLabel: '장거리 과학 탐사함',
      icon: '🔭',
      rank: 'S',
      stats: '탐사력: 45 // 스캐너: 40',
      fuelCost: 12,
      expeditionsCount: 24,
      color: 'border-cyan-500/50 text-cyan-300'
    },
    {
      id: 'frig_3',
      name: '타이탄 채굴 모함 (Titan Extractor)',
      type: 'INDUSTRIAL',
      typeLabel: '중공업 광물 채굴함',
      icon: '⛏️',
      rank: 'A',
      stats: '산업력: 39 // 제련율: 35',
      fuelCost: 18,
      expeditionsCount: 15,
      color: 'border-amber-500/50 text-amber-300'
    },
    {
      id: 'frig_4',
      name: '황금빛 상단선 골든 벡 (Golden Beak)',
      type: 'TRADE',
      typeLabel: '초대형 무역 수송함',
      icon: '💰',
      rank: 'A',
      stats: '무역력: 38 // 적재량: 44',
      fuelCost: 14,
      expeditionsCount: 12,
      color: 'border-yellow-500/50 text-yellow-300'
    },
    {
      id: 'frig_5',
      name: '에테리얼 보급선 (Ethereal Tender)',
      type: 'SUPPORT',
      typeLabel: '함대 지원 보급함',
      icon: '🛡️',
      rank: 'S',
      stats: '연료 절감: -35% // 수리력: 30',
      fuelCost: 6,
      expeditionsCount: 31,
      color: 'border-emerald-500/50 text-emerald-300'
    }
  ]);

  const [missions, setMissions] = useState<ExpeditionMission[]>([
    {
      id: 'm1',
      title: '성간 해적 카르텔 소탕 & 무역로 호송',
      type: 'COMBAT',
      difficulty: '★★★☆☆ (3성 위험도)',
      durationText: '도약 4시간 (즉시 완료 가능)',
      rewardUnits: 550000,
      rewardNanites: 450,
      bonusItem: '화물 격벽 x1, 오염된 금속 x150',
      status: 'READY',
      log: '적 해적 기함의 방어막을 무력화하고 나포된 보급품을 안전하게 회수했습니다.'
    },
    {
      id: 'm2',
      title: '미지의 암흑 성운 고대 유적 심층 조사',
      type: 'EXPLORATION',
      difficulty: '★★★★☆ (4성 위험도)',
      durationText: '도약 6시간 (즉시 완료 가능)',
      rewardUnits: 720000,
      rewardNanites: 600,
      bonusItem: '고대 외계 유물 x1, 나노로봇 클러스터',
      status: 'READY',
      log: '초거대 흑요석 모놀리스와 외계 생체 신호를 성공적으로 분석해 아카이브에 기록했습니다.'
    },
    {
      id: 'm3',
      title: '은하 중심부 메가 무역 회랑 개척',
      type: 'TRADE',
      difficulty: '★★☆☆☆ (2성 위험도)',
      durationText: '도약 3시간 (즉시 완료 가능)',
      rewardUnits: 880000,
      rewardNanites: 350,
      bonusItem: '색층 금속 x300, 순수 페라이트 x250',
      status: 'READY',
      log: '게크 제일산란대와의 대규모 합금 독점 무역 계약을 성사시켰습니다.'
    }
  ]);

  const handleDispatch = (mId: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === mId) {
          return { ...m, status: 'COMPLETED' };
        }
        return m;
      })
    );
    NmsAudioEngine.getInstance().playDiscoveryFanfare();
    game.spawnFloatText('🚀 호위함대 성간 원정 출격 완료!', undefined, undefined, '#38bdf8');
  };

  const handleClaimReward = (mission: ExpeditionMission) => {
    game.data.units += mission.rewardUnits;
    game.data.nanites += mission.rewardNanites;
    game.data.inv.cargoBulkhead = (game.data.inv.cargoBulkhead || 0) + 1;
    game.data.inv.chromaticMetal = (game.data.inv.chromaticMetal || 0) + 200;

    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === mission.id) {
          return { ...m, status: 'READY' };
        }
        return m;
      })
    );

    NmsAudioEngine.getInstance().playDiscoveryFanfare();
    game.spawnFloatText(`🏆 원정 보상 수확 완료! (+${mission.rewardUnits.toLocaleString()}₩, +${mission.rewardNanites}⬡, 화물 격벽)`, undefined, undefined, '#fbbf24');
  };

  const handleSummonFreighter = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nms-summon-freighter'));
    }
    NmsAudioEngine.getInstance().playHyperspaceWarpBoom();
    game.spawnFloatText('🚢 초거대 주력함 기함 & 호위함대 성간 소환 신호 발신!', undefined, undefined, '#38bdf8');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-950/95 border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] p-4 sm:p-6 text-white flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
              <h2 className="text-sm sm:text-base font-black tracking-widest text-cyan-300 uppercase font-mono">
                초거대 주력 화물선 기함 & 호위함대 // CAPITAL FREIGHTER [H]
              </h2>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              베나토르급 S-Class 주력함 // 5대 호위함 성간 원정 사령부
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-gray-300 rounded-lg border border-slate-700 cursor-pointer font-mono"
          >
            닫기 [H / ESC]
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          {[
            { id: 'EXPEDITION', label: '🚀 호위함대 성간 원정 (Expeditions)' },
            { id: 'FLEET', label: '🛡️ 5대 호위함 편대 (Frigate Fleet)' },
            { id: 'BRIDGE', label: '🏛️ 함교 지휘 데스크 (Bridge Command)' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id as typeof activeTab);
                NmsAudioEngine.getInstance().playQuickRechargeChime();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === t.id
                  ? 'bg-cyan-500 text-black font-extrabold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-900 text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Expeditions */}
        {activeTab === 'EXPEDITION' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs font-mono">
              <span className="text-gray-300">함대 연료: 100% 비축 // 지휘실 통신 링크 정상</span>
              <button
                onClick={handleSummonFreighter}
                className="px-3 py-1 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded text-[11px] cursor-pointer"
              >
                🚢 현재 우주 좌표로 기함 소환 [H]
              </button>
            </div>

            <div className="space-y-2.5">
              {missions.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {m.type === 'COMBAT' ? '⚔️' : m.type === 'EXPLORATION' ? '🔭' : '💰'}
                      </span>
                      <span className="text-xs font-black text-white">{m.title}</span>
                      <span className="text-[10px] text-yellow-400 font-mono">[{m.difficulty}]</span>
                    </div>

                    <p className="text-[11px] text-gray-400 leading-tight">
                      보상: <span className="text-cyan-300 font-mono font-bold">+{m.rewardUnits.toLocaleString()} ₩</span>,{' '}
                      <span className="text-purple-300 font-mono font-bold">+{m.rewardNanites} ⬡</span> ({m.bonusItem})
                    </p>

                    {m.status === 'COMPLETED' && (
                      <p className="text-[10px] text-emerald-400 font-mono italic">
                        📜 함장 일지: "{m.log}"
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 w-full sm:w-auto">
                    {m.status === 'READY' ? (
                      <button
                        onClick={() => handleDispatch(m.id)}
                        className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 text-white font-bold rounded-lg text-xs font-mono cursor-pointer shadow-md active:scale-95 transition-all"
                      >
                        🚀 호위함대 파견
                      </button>
                    ) : (
                      <button
                        onClick={() => handleClaimReward(m)}
                        className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold rounded-lg text-xs font-mono cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.4)] active:scale-95 transition-all"
                      >
                        🏆 원정 전리품 수확
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Frigate Fleet List */}
        {activeTab === 'FLEET' && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-300 block font-mono">
              주력함 배속 5대 호위함 편대 명부:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {frigates.map((f) => (
                <div
                  key={f.id}
                  className={`p-3 rounded-xl border bg-slate-900/80 ${f.color} flex flex-col justify-between gap-1.5`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{f.icon}</span>
                      <span className="text-xs font-black text-white">{f.name.split(' ')[0]}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                      RANK {f.rank}
                    </span>
                  </div>

                  <span className="text-[10px] text-gray-400">{f.typeLabel}</span>

                  <div className="pt-2 border-t border-slate-800 text-[10px] font-mono flex justify-between text-gray-300">
                    <span>{f.stats}</span>
                    <span className="text-cyan-400">원정 {f.expeditionsCount}회 성공</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Bridge Command */}
        {activeTab === 'BRIDGE' && (
          <div className="space-y-3 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">아틀라스의 여명 호 (SSV Dawn of Atlas)</span>
                <span className="text-[10px] text-cyan-300 font-mono">S-Class 34+4 슬롯 // 하이퍼드라이브 도약 반경: 3,850 LY</span>
              </div>
              <span className="text-2xl">🚢</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-white/5">
                <span className="text-gray-400 block text-[10px]">격납고 도킹 베이</span>
                <span className="text-white font-bold">3연장 트랙터 빔</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-white/5">
                <span className="text-gray-400 block text-[10px]">화물선 워프 코어</span>
                <span className="text-emerald-400 font-bold">완전 충전됨</span>
              </div>
            </div>

            <button
              onClick={handleSummonFreighter}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black rounded-xl text-xs font-mono cursor-pointer shadow-md hover:from-cyan-400 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              <span>🚀</span>
              <span>현재 우주 공간으로 초거대 주력함 소환 [H]</span>
            </button>
          </div>
        )}

        {/* Footer tip */}
        <div className="text-[10px] text-gray-500 font-mono text-center">
          우주 공간 비행 중 단축키 [H]를 누르면 언제든 주력함 기함과 호위함대를 즉시 소환할 수 있습니다.
        </div>
      </div>
    </div>
  );
};
