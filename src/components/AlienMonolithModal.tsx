import React, { useState } from 'react';
import { GameEngine } from '../gameEngine';
import { NmsAudioEngine } from '../three/audio/NmsAudioEngine';

interface AlienMonolithModalProps {
  game: GameEngine;
  onClose: () => void;
}

type AlienRace = 'KORVAX' | 'VYKEEN' | 'GEK';

interface MonolithTrial {
  race: AlienRace;
  raceName: string;
  raceIcon: string;
  monolithTitle: string;
  runicScript: string[];
  translatedWords: Record<string, string>;
  narrative: string;
  choices: {
    id: string;
    text: string;
    correct: boolean;
    rewardDesc: string;
    action: (game: GameEngine) => void;
  }[];
}

export const AlienMonolithModal: React.FC<AlienMonolithModalProps> = ({ game, onClose }) => {
  const [activeRace, setActiveRace] = useState<AlienRace>('KORVAX');
  const [resolvedChoiceId, setResolvedChoiceId] = useState<string | null>(null);

  const trials: Record<AlienRace, MonolithTrial> = {
    KORVAX: {
      race: 'KORVAX',
      raceName: '코르박스 전자집합체 (Korvax Echoes)',
      raceIcon: '🔷',
      monolithTitle: '단절된 에코들의 고대 융합 석판',
      runicScript: ['ATLAS', 'CONNECT', 'WIRE', 'ENTITY', 'SACRIFICE', 'KNOWLEDGE', 'ASCENSION'],
      translatedWords: {
        ATLAS: '아틀라스',
        CONNECT: '접속',
        ENTITY: '개체',
        KNOWLEDGE: '지식',
        ASCENSION: '승천'
      },
      narrative:
        '거대한 흑요석 삼각 석판에서 메탈릭한 공명음이 울려 퍼집니다. 전자 집합체의 단절된 에코들이 당신의 엑소슈트 신경망을 스캔하며 집합체에 합일할 영혼의 파편을 요구합니다.',
      choices: [
        {
          id: 'k1',
          text: '엑소슈트의 나노 에너지를 공여하여 집합체의 에코와 접속한다.',
          correct: true,
          rewardDesc: '아틀라스 패스 V1 데이터 획득 & 나노로봇 +350⬡ & 코르박스 평판 상승!',
          action: (g) => {
            g.data.nanites += 350;
            g.data.units += 150000;
            g.data.hazard = Math.min(100, g.data.hazard + 20);
            g.spawnFloatText('🔷 코르박스 에코 동조 성공! (+350 나노로봇, +150,000₩)', undefined, undefined, '#38bdf8');
          }
        },
        {
          id: 'k2',
          text: '멀티툴 플라즈마로 석판 표면의 홀로그램 회로를 강제 분석한다.',
          correct: false,
          rewardDesc: '석판의 방전 반동으로 쉴드 40% 손실, 대신 고대 외계 합금 조각 회수.',
          action: (g) => {
            g.data.shield = Math.max(10, g.data.shield - 40);
            g.data.inv.ferrite = (g.data.inv.ferrite || 0) + 120;
            g.spawnFloatText('⚠️ 석판 방전 반동! 쉴드 손실 및 페라이트 회수', undefined, undefined, '#ef4444');
          }
        },
        {
          id: 'k3',
          text: '깊은 침묵을 유지하며 코르박스의 순교자들을 위해 추모의 주파수를 송신한다.',
          correct: true,
          rewardDesc: '코르박스 외계어 어휘 3개 습득 및 워프 셀 1개 증정!',
          action: (g) => {
            g.data.inv.warpCell = (g.data.inv.warpCell || 0) + 1;
            g.data.nanites += 200;
            g.spawnFloatText('🔷 깊은 지혜의 통찰: 워프 셀 1개 및 외계어 어휘 습득!', undefined, undefined, '#c084fc');
          }
        }
      ]
    },
    VYKEEN: {
      race: 'VYKEEN',
      raceName: '바이킨 전사연합 (Vy\'keen Warriors)',
      raceIcon: '⚔️',
      monolithTitle: '선조 전사의 붉은 피와 검의 제단',
      runicScript: ['WARRIOR', 'BLADE', 'SENTINEL', 'DEATH', 'HONOR', 'GRAH', 'GLORY'],
      translatedWords: {
        WARRIOR: '전사',
        SENTINEL: '센티넬',
        HONOR: '명예',
        GLORY: '영광'
      },
      narrative:
        '석판 표면에 붉은 마그마 룬이 타오르며 고대 선조 바이킨 전사의 호령이 뇌리를 강타합니다. 제단 위에 꽂힌 부러진 블레이드가 센티넬 기계 괴물들을 멸절시킬 맹세를 요구합니다.',
      choices: [
        {
          id: 'v1',
          text: '멀티툴 볼트캐스터를 높이 들며 센티넬 멸절의 함성(GRAH!)을 내지른다.',
          correct: true,
          rewardDesc: '바이킨 명예 칭호 획득 & C-Class 중화기 볼트캐스터 탄약 +200 & 바이킨 평판 상승!',
          action: (g) => {
            g.data.ammo = g.data.maxAmmo;
            g.data.units += 220000;
            g.spawnFloatText('⚔️ 바이킨 선조의 인정! 탄약 완충 & +220,000₩', undefined, undefined, '#f87171');
          }
        },
        {
          id: 'v2',
          text: '블레이드를 뽑으려다 손에 상처를 입고 뒤로 물러선다.',
          correct: false,
          rewardDesc: '겁쟁이 판정: 생명유지장치 15% 소모.',
          action: (g) => {
            g.data.lifeSupport = Math.max(20, g.data.lifeSupport - 15);
            g.spawnFloatText('⚠️ 선조의 비웃음: 생명유지장치 감소', undefined, undefined, '#f97316');
          }
        },
        {
          id: 'v3',
          text: '제단 앞에 정중히 무릎 꿇고 전사들의 무덤에 나트륨 결정을 헌화한다.',
          correct: true,
          rewardDesc: '전사의 축복: 함선 쉴드 100% 완충 & 바이킨 어휘 2개 습득!',
          action: (g) => {
            g.data.shield = g.data.maxShield;
            g.data.nanites += 250;
            g.spawnFloatText('⚔️ 전사의 안식 축복: 쉴드 100% 충전 & 나노로봇 +250⬡', undefined, undefined, '#10b981');
          }
        }
      ]
    },
    GEK: {
      race: 'GEK',
      raceName: '게크 상인연합 (Gek First Spawn)',
      raceIcon: '💰',
      monolithTitle: '제일산란대의 향기로운 황금 유물 석판',
      runicScript: ['TRADE', 'BEAK', 'GOLD', 'PROFIT', 'SPAWN', 'FRIEND', 'UNIT'],
      translatedWords: {
        TRADE: '무역',
        GOLD: '황금',
        PROFIT: '이윤',
        UNIT: '유닛'
      },
      narrative:
        '달콤한 페로몬 향기가 석판의 균열을 타고 피어오릅니다. 고대 게크 제국의 찬란했던 황금기 기록과 무역 계약서가 황금 룬으로 새겨져 있습니다.',
      choices: [
        {
          id: 'g1',
          text: '엑소슈트 디스펜서에서 게크닙 향기를 분사하며 우호적 계약을 체결한다.',
          correct: true,
          rewardDesc: '대상인의 축복: 유닛 +500,000₩ & 고대 외계 유물 획득!',
          action: (g) => {
            g.data.units += 500000;
            g.data.inv.ancientArtifact = (g.data.inv.ancientArtifact || 0) + 1;
            g.spawnFloatText('💰 게크 제일산란대의 보물! (+500,000₩, 고대 유물)', undefined, undefined, '#fbbf24');
          }
        },
        {
          id: 'g2',
          text: '석판에 붙은 황금 도금을 멀티툴로 강제 채굴한다.',
          correct: false,
          rewardDesc: '게크 선조의 분노: 페로몬 악취로 생명유지장치 오염.',
          action: (g) => {
            g.data.lifeSupport = Math.max(30, g.data.lifeSupport - 20);
            g.spawnFloatText('⚠️ 탐욕의 대가: 페로몬 오염 발생', undefined, undefined, '#eab308');
          }
        },
        {
          id: 'g3',
          text: '황금 룬에 새겨진 고대 무역로의 은하 좌표를 복사한다.',
          correct: true,
          rewardDesc: '무역소 행성 차트 & 게크 어휘 3개 습득!',
          action: (g) => {
            g.data.nanites += 300;
            g.data.units += 200000;
            g.spawnFloatText('💰 은하 무역로 발견! (+200,000₩, +300 나노로봇)', undefined, undefined, '#34d399');
          }
        }
      ]
    }
  };

  const currentTrial = trials[activeRace];

  const handleSelectChoice = (choice: typeof currentTrial.choices[0]) => {
    if (resolvedChoiceId) return;
    setResolvedChoiceId(choice.id);
    choice.action(game);

    if (choice.correct) {
      NmsAudioEngine.getInstance().playDiscoveryFanfare();
    } else {
      NmsAudioEngine.getInstance().playShieldHit();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-950/95 border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] p-4 sm:p-6 text-white flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
              <h2 className="text-sm sm:text-base font-black tracking-widest text-cyan-300 uppercase font-mono">
                외계 모놀리스 석판 // ANCIENT MONOLITH
              </h2>
            </div>
            <span className="text-[11px] text-gray-400 font-mono">
              고대 지식의 비석 // 3대 외계 종족 언어 및 철학적 시험
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-gray-300 rounded-lg border border-slate-700 cursor-pointer font-mono"
          >
            닫기 [ESC]
          </button>
        </div>

        {/* 3-Race Faction Selector Tabs */}
        <div className="grid grid-cols-3 gap-2">
          {(['KORVAX', 'VYKEEN', 'GEK'] as AlienRace[]).map((r) => {
            const tr = trials[r];
            const isSelected = activeRace === r;
            return (
              <button
                key={r}
                onClick={() => {
                  setActiveRace(r);
                  setResolvedChoiceId(null);
                  NmsAudioEngine.getInstance().playMonolithResonance();
                }}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] scale-102'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span className="text-lg">{tr.raceIcon}</span>
                <span className="text-xs font-bold text-white mt-1">{tr.raceName.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Monolith Tablet Display Frame */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          {/* Tablet Inscription Header */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-cyan-300 font-mono">
              {currentTrial.monolithTitle}
            </span>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
              외계어 번역 엔진 가동 중
            </span>
          </div>

          {/* Holographic Alien Rune Inscription (Dynamic Translation) */}
          <div className="p-3 bg-black/60 rounded-xl border border-cyan-500/30 flex flex-wrap items-center gap-2 font-mono">
            {currentTrial.runicScript.map((word, idx) => {
              const isKnown = currentTrial.translatedWords[word];
              return (
                <div
                  key={idx}
                  className={`px-2 py-1 rounded text-xs font-bold transition-all ${
                    isKnown
                      ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50'
                      : 'bg-purple-950/60 text-purple-400/80 border border-purple-500/30 animate-pulse'
                  }`}
                >
                  {isKnown ? (
                    <span>{isKnown} ({word})</span>
                  ) : (
                    <span>◈◈ {word.slice(0, 3)} ◈◈</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Narrative Atmospheric Story */}
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800 italic">
            "{currentTrial.narrative}"
          </p>

          {/* Interactive Dilemma Choices */}
          <div className="space-y-2 mt-1">
            <span className="text-[11px] font-bold text-gray-400 font-mono block">
              석판의 물음에 당신의 행동을 선택하십시오:
            </span>

            {currentTrial.choices.map((choice) => {
              const isPicked = resolvedChoiceId === choice.id;
              const isResolved = resolvedChoiceId !== null;

              return (
                <button
                  key={choice.id}
                  onClick={() => handleSelectChoice(choice)}
                  disabled={isResolved}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex flex-col gap-1 ${
                    isPicked
                      ? choice.correct
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                        : 'bg-rose-950/80 border-rose-400 text-rose-200'
                      : isResolved
                      ? 'opacity-40 bg-slate-900 border-slate-800 cursor-not-allowed'
                      : 'bg-slate-900/80 border-slate-800 hover:border-cyan-400 hover:bg-slate-800/80 cursor-pointer text-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{choice.text}</span>
                    {isPicked && (
                      <span className="font-mono text-[11px]">
                        {choice.correct ? '✅ 시험 통과' : '⚠️ 오판'}
                      </span>
                    )}
                  </div>
                  {isPicked && (
                    <span className="text-[10px] text-cyan-300 font-mono mt-1">
                      결과: {choice.rewardDesc}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom hint */}
        <div className="text-[10px] text-gray-500 font-mono text-center">
          지표면의 3D 지식의 돌(Knowledge Stone)을 탐색하여 더 많은 외계어 어휘를 해독할 수 있습니다.
        </div>
      </div>
    </div>
  );
};
