import React, { useState } from 'react';
import { GameEngine } from '../gameEngine';
import { NmsAudioEngine } from '../three/audio/NmsAudioEngine';

interface SpaceAnomalyModalProps {
  game: GameEngine;
  onClose: () => void;
}

interface NexusMission {
  id: string;
  title: string;
  desc: string;
  icon: string;
  quicksilverReward: number;
  unitReward: number;
  status: 'AVAILABLE' | 'ACTIVE' | 'COMPLETED';
}

interface QuicksilverItem {
  id: string;
  name: string;
  cost: number;
  icon: string;
  category: string;
  desc: string;
}

export const SpaceAnomalyModal: React.FC<SpaceAnomalyModalProps> = ({ game, onClose }) => {
  const [activeTab, setActiveTab] = useState<'NEXUS' | 'NADA_POLO' | 'QUICKSILVER'>('NEXUS');

  const [missions, setMissions] = useState<NexusMission[]>([
    {
      id: 'nm_1',
      title: '센티넬 하이브 기둥 파괴 작전',
      desc: '행성 센티넬 지휘 기둥을 급습하여 방어벽을 해킹하고 센티넬 경계망을 무력화하십시오.',
      icon: '🤖',
      quicksilverReward: 250,
      unitReward: 450000,
      status: 'AVAILABLE'
    },
    {
      id: 'nm_2',
      title: '고대 거대 샌드웜 유충 둥지 토벌',
      desc: '사막 행성의 지하 둥지에서 튀어나오는 포식자 유충을 섬멸하고 고농도 산성을 중화하십시오.',
      icon: '🪱',
      quicksilverReward: 250,
      unitReward: 500000,
      status: 'AVAILABLE'
    },
    {
      id: 'nm_3',
      title: '미지의 변이 식물 유전자 표본 수집',
      desc: '극저온 행성의 동굴 심층부에서 자라나는 발광 변이 식물의 줄기를 채취하여 분석하십시오.',
      icon: '🧬',
      quicksilverReward: 250,
      unitReward: 380000,
      status: 'AVAILABLE'
    }
  ]);

  const quicksilverItems: QuicksilverItem[] = [
    {
      id: 'void_egg',
      name: '보이드 에그 (Void Egg)',
      cost: 500,
      icon: '🥚',
      category: '생체 함선 퀘스트',
      desc: '우주의 별빛을 먹고 맥박치는 살아있는 유기체 알. S-Class 생체함선 탄생의 열쇠입니다.'
    },
    {
      id: 'atlas_trail',
      name: '아틀라스 진홍빛 제트팩 궤적',
      cost: 300,
      icon: '✨',
      category: '외형 이펙트',
      desc: '제트팩 부스트 가동 시 진홍빛 아틀라스 데이터 파티클 궤적을 뿜어냅니다.'
    },
    {
      id: 'retro_helmet',
      name: '태초의 여행자 복고풍 헬멧',
      cost: 400,
      icon: '🪖',
      category: '커스터마이징',
      desc: '유클리드 은하 초창기 개척자들의 원형 골드 바이저 헬멧입니다.'
    },
    {
      id: 'anomaly_figurine',
      name: '폴로의 우주선 대시보드 피규어',
      cost: 200,
      icon: '🧸',
      category: '함선 조종석 인테리어',
      desc: '스타쉽 조종석 전면에 장착하는 고개 흔들리는 전문가 폴로 미니어처입니다.'
    }
  ];

  const handleAcceptMission = (missionId: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === missionId) return { ...m, status: 'COMPLETED' };
        return m;
      })
    );
    NmsAudioEngine.getInstance().playDiscoveryFanfare();
    game.spawnFloatText('🌌 넥서스 멀티플레이 미션 출격 완료!', undefined, undefined, '#38bdf8');
  };

  const handleClaimMission = (m: NexusMission) => {
    game.data.quicksilver = (game.data.quicksilver || 0) + m.quicksilverReward;
    game.data.units += m.unitReward;
    setMissions((prev) =>
      prev.map((item) => {
        if (item.id === m.id) return { ...item, status: 'AVAILABLE' };
        return item;
      })
    );
    NmsAudioEngine.getInstance().playDiscoveryFanfare();
    game.spawnFloatText(`✨ 넥서스 보상 수령! (+${m.quicksilverReward} 수은, +${m.unitReward.toLocaleString()} ₩)`, undefined, undefined, '#c084fc');
  };

  const handleBuyQuicksilverItem = (item: QuicksilverItem) => {
    const curQs = game.data.quicksilver || 0;
    if (curQs >= item.cost) {
      game.data.quicksilver = curQs - item.cost;
      if (item.id === 'void_egg') {
        game.data.inv.voidEgg = (game.data.inv.voidEgg || 0) + 1;
      }
      NmsAudioEngine.getInstance().playDiscoveryFanfare();
      game.spawnFloatText(`🎁 [${item.name}] 구매 완료!`, undefined, undefined, '#34d399');
    } else {
      // Emergency Quicksilver grant for player preview
      game.data.quicksilver = curQs + 500;
      NmsAudioEngine.getInstance().playQuickRechargeChime();
      game.spawnFloatText('✨ 넥서스 커뮤니티 기여금 500 수은(Quicksilver) 보급 완료!', undefined, undefined, '#c084fc');
    }
  };

  const handleSummonAnomaly = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nms-summon-anomaly'));
    }
    NmsAudioEngine.getInstance().playHyperspaceWarpBoom();
    game.spawnFloatText('🔮 스페이스 아노말리 구체 성간 시공간 소환 완료!', undefined, undefined, '#c084fc');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-950/95 border border-purple-500/40 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.3)] p-4 sm:p-6 text-white flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
              <h2 className="text-sm sm:text-base font-black tracking-widest text-purple-300 uppercase font-mono">
                스페이스 아노말리 // THE SPACE ANOMALY [B]
              </h2>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              나다와 폴로의 차원 성소 // 넥서스 멀티플레이 허브 & 수은 합성소
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-gray-300 rounded-lg border border-slate-700 cursor-pointer font-mono"
          >
            닫기 [B / ESC]
          </button>
        </div>

        {/* Quicksilver Balance Header */}
        <div className="flex items-center justify-between p-3 bg-purple-950/40 rounded-xl border border-purple-500/30 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔮</span>
            <span className="text-gray-300">보유 수은 (Quicksilver):</span>
            <span className="text-purple-300 font-extrabold text-sm">{game.data.quicksilver || 0} QS</span>
          </div>

          <button
            onClick={handleSummonAnomaly}
            className="px-3 py-1 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded text-[11px] cursor-pointer shadow-md"
          >
            🌌 현재 우주로 아노말리 소환 [B]
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-800 pb-2">
          {[
            { id: 'NEXUS', label: '🌐 넥서스 협동 미션 (The Nexus)' },
            { id: 'NADA_POLO', label: '🧙 나다 & 폴로의 성소 (Nada & Polo)' },
            { id: 'QUICKSILVER', label: '🛍️ 수은 합성 상점 (Quicksilver Store)' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id as typeof activeTab);
                NmsAudioEngine.getInstance().playQuickRechargeChime();
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                activeTab === t.id
                  ? 'bg-purple-600 text-white font-extrabold shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-900 text-gray-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Nexus Missions */}
        {activeTab === 'NEXUS' && (
          <div className="space-y-3">
            <span className="text-xs text-gray-300 font-mono block">
              넥서스 큐브 터미널에서 은하계 공동체 원정 미션을 수주하고 수은을 획득하십시오:
            </span>

            <div className="space-y-2.5">
              {missions.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{m.icon}</span>
                      <span className="text-xs font-black text-white">{m.title}</span>
                      <span className="text-[10px] text-purple-300 font-mono font-bold bg-purple-950/70 px-2 py-0.5 rounded border border-purple-500/30">
                        +{m.quicksilverReward} QS
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-tight">{m.desc}</p>
                    <span className="text-[10px] text-cyan-300 font-mono block">
                      추가 보수: +{m.unitReward.toLocaleString()} ₩
                    </span>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto">
                    {m.status === 'AVAILABLE' ? (
                      <button
                        onClick={() => handleAcceptMission(m.id)}
                        className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold rounded-lg text-xs font-mono cursor-pointer shadow-md active:scale-95 transition-all"
                      >
                        🚀 미션 출격
                      </button>
                    ) : (
                      <button
                        onClick={() => handleClaimMission(m)}
                        className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-black font-extrabold rounded-lg text-xs font-mono cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.4)] active:scale-95 transition-all"
                      >
                        🏆 수은 보상 수령
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Nada & Polo */}
        {activeTab === 'NADA_POLO' && (
          <div className="space-y-3">
            <div className="p-4 bg-slate-900/90 rounded-xl border border-purple-500/30 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔷</span>
                <div>
                  <span className="text-xs font-bold text-white block">사제 엔티티 나다 (Priest Entity Nada)</span>
                  <span className="text-[10px] text-purple-300 font-mono">코르박스 이탈자 // 시뮬레이션의 자유 수호자</span>
                </div>
              </div>
              <p className="text-xs text-gray-300 italic bg-black/40 p-3 rounded-lg border border-slate-800">
                "여행자... 당신은 아틀라스의 꼭두각시가 아니다. 자신의 의지로 별들을 탐색하라. 우리가 당신을 지켜보고 도울 것이다."
              </p>
              <button
                onClick={() => {
                  game.data.nanites += 500;
                  NmsAudioEngine.getInstance().playDiscoveryFanfare();
                  game.spawnFloatText('🔷 나다의 축복: 발견 데이터 교환 (+500 나노로봇)', undefined, undefined, '#38bdf8');
                }}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-lg text-xs font-mono cursor-pointer shadow-md"
              >
                📜 발견 데이터 공유 & 나노로봇 교환 (+500 ⬡)
              </button>
            </div>

            <div className="p-4 bg-slate-900/90 rounded-xl border border-yellow-500/30 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🐸</span>
                <div>
                  <span className="text-xs font-bold text-white block">전문가 폴로 (Specialist Polo)</span>
                  <span className="text-[10px] text-yellow-300 font-mono">게크 친구 // 시공간 특이점 관측자</span>
                </div>
              </div>
              <p className="text-xs text-gray-300 italic bg-black/40 p-3 rounded-lg border border-slate-800">
                "친구! 우주의 깊은 구멍들을 찾는가? 내가 블랙홀 좌표와 진홍의 아틀라스 신전 위치를 알려줄 수 있어!"
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    NmsAudioEngine.getInstance().playDiscoveryFanfare();
                    game.spawnFloatText('🕳️ 폴로의 특이점 데이터: 인근 초대질량 블랙홀 좌표 확인!', undefined, undefined, '#c084fc');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 font-bold rounded-lg text-xs font-mono cursor-pointer border border-purple-500/30"
                >
                  🕳️ 블랙홀 좌표 요청
                </button>
                <button
                  onClick={() => {
                    NmsAudioEngine.getInstance().playDiscoveryFanfare();
                    game.spawnFloatText('🔴 폴로의 성소 데이터: 아틀라스 인터페이스 좌표 확인!', undefined, undefined, '#f43f5e');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold rounded-lg text-xs font-mono cursor-pointer border border-rose-500/30"
                >
                  🔴 아틀라스 인터페이스 요청
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Quicksilver Store */}
        {activeTab === 'QUICKSILVER' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-mono text-gray-300">
              <span>수은 합성 동반자 상점 (Quicksilver Synthesis Bot):</span>
              <span className="text-purple-300">잔액: {game.data.quicksilver || 0} QS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quicksilverItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-xs font-black text-white">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-purple-300 font-mono">
                        {item.cost} QS
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono block mt-0.5">{item.category}</span>
                    <p className="text-[11px] text-gray-400 leading-tight mt-1">{item.desc}</p>
                  </div>

                  <button
                    onClick={() => handleBuyQuicksilverItem(item)}
                    className="w-full py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white font-bold rounded-lg text-xs font-mono cursor-pointer active:scale-95 transition-all shadow-sm"
                  >
                    수은으로 교환
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer tip */}
        <div className="text-[10px] text-gray-500 font-mono text-center">
          성간 우주 비행 중 [B] 키를 누르면 언제든 스페이스 아노말리 구체를 즉각 소환할 수 있습니다.
        </div>
      </div>
    </div>
  );
};
