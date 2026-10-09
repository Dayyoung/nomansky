import React, { useState } from 'react';
import { X, RefreshCw, Zap, Rocket, Shield, Sparkles, Check, ChevronRight } from 'lucide-react';
import { game } from '../gameEngine';
import { AudioSys } from '../audio';
import { ToolMode, DifficultyPreset, DifficultySettings } from '../types';

const MODAL_METADATA: Record<string, { icon: string; title: string }> = {
  'custom-difficulty': { icon: '⚙️', title: '커스텀 난이도 & 10대 게임플레이 조절 콘솔 (Waypoint 4.0 [F9])' },
  'nautilon-sonar': { icon: '🌊', title: '노틸론 잠수정 & 심해 고출력 소나 스캐너 (The Abyss & Aquarius)' },
  'inventory': { icon: '🎒', title: '엑소슈트 인벤토리 (Exosuit Inventory [Tab])' },
  'quick-recharge': { icon: '⚡', title: '퀵 긴급 충전 콘솔 (Quick Recharge)' },
  'galaxy-map': { icon: '🌌', title: '3D 은하계 지도 & 성간 워프 (Galaxy Map [M])' },
  'solar-ship': { icon: '⛵', title: '솔라선 & 베스퍼 세일 태양광 항해' },
  'laylaps': { icon: '🤖', title: "센티넬 동료 '레일랩스' 신경망 제어" },
  'outlaw-station': { icon: '☠️', title: '무법자 해적 정거장 & 현상금 사냥' },
  'atlas-path': { icon: '🔴', title: '아틀라스 경로 & 신규 항성 탄생 제단' },
  'manufacturing': { icon: '🏭', title: '행성 보안 제조시설 & 아틀라스패스' },
  'organic-fleet': { icon: '🐙', title: '생체 호위함대 & 사이코닉 알 배양' },
  'egg-sequencer': { icon: '🧬', title: '알 염기서열기 & 유전자 개조' },
  'biodome': { icon: '🌱', title: '바이오돔 수경재배 & 외계 농경' },
  'wonders': { icon: '✨', title: '은하계 경이 도감 & 홀로그램 영사기' },
  'supercharge': { icon: '⚡', title: '기술 과급 슬롯(Supercharged) 오버클럭' },
  'appearance': { icon: '👤', title: '외형 조작기 & 은하 6대 종족' },
  'orbital-freighter': { icon: '🛰️', title: '화물선 궤도 물질화기 & 광역 스캔' },
  'expedition': { icon: '🏆', title: '스페이스 아노말리 성간 원정대' },
  'scrapper': { icon: '🛸', title: '우주정거장 우주선 인양 분해소' },
  'trade-outpost': { icon: '🏛️', title: '행성 대형 교역소 & 7대 무역망' },
  'fishing': { icon: '🎣', title: '아쿠아리우스 해양 낚싯대 & 수생 도감' },
  'black-hole': { icon: '🕳️', title: '초거대 블랙홀 & 사건의 지평선 특이점' },
  'portal': { icon: '🌀', title: '고대 포탈 16 글리프 다이얼' },
  'minotaur': { icon: '🤖', title: '미노타우르스 중장갑 메카' },
  'weapon-arsenal': { icon: '🔫', title: '다목적 도구 전투 화기 & 중화기 사령부 (Sentinel & Waypoint)' },
  'nutrient': { icon: '🍲', title: '영양소 처리기 & 외계 요리실' },
  'teleport': { icon: '🌀', title: '성계간 순간이동기 터미널' },
  'discoveries': { icon: '🪐', title: '행성 발견 도감 & 동물군 분석' },
  'station': { icon: '🏛️', title: '성계 우주정거장 코어 & 3대 길드 특사' },
  'sandworm': { icon: '🪱', title: '거대 샌드웜 & 이머전스 둥지' },
  'base-computer': { icon: '🏠', title: '기지 컴퓨터 영토 선포 & 거점 건축' },
  'abandoned-building': { icon: '☣️', title: '버려진 연구시설 & 속삭이는 알' },
  'archaeology': { icon: '🦴', title: '고고학 뼈 발굴 & 고대 유물 복원' },
  'specialist-terminals': { icon: '🏛️', title: '기지 5대 전문가 & 콜로서스 채광차' },
  'pirate-flagship': { icon: '🏴‍☠️', title: '해적 드레드노트 기함 지휘' },
  'large-refiner': { icon: '⚗️', title: '대형 3슬롯 정제기 & 화학 연금술' },
  'atlantid-tool': { icon: '🔮', title: '아틀란티드 멀티툴 & 룬 제단' },
  'livestock-ranch': { icon: '🥛', title: '외계 생물 목장 & 가축 수확기' },
  'milestones': { icon: '🏆', title: '은하계 여행자 10대 마일스톤' },
  'hazard-protection': { icon: '🛡️', title: '엑소슈트 4대 극한 환경 보호막' },
  'multi-tool-salvage': { icon: '🔧', title: '멀티툴 고철 분해 & 슬롯 확장' },
  'cartographer': { icon: '🗺️', title: '정거장 지도제작자 & 5대 행성 차트' },
  'exosuit-upgrade': { icon: '👕', title: '엑소슈트 용량 증설 & 드롭 포드' },
  'guild-envoy': { icon: '🎖️', title: '우주정거장 3대 길드 사절단' },
  'galactic-core': { icon: '🌌', title: '은하 중심 특이점 & 4대 은하 도약' },
  'starship-weapons': { icon: '🚀', title: '스타쉽 5대 첨단 무장 시스템' },
  'floating-islands': { icon: '🏝️', title: '부유하는 하늘 섬 & 폭포 피난처 (Worlds 1)' },
  'boundary-failure': { icon: '🔮', title: '차원 경계 붕괴 & 텔라몬 왜곡 기록' },
  'abyssal-horror': { icon: '🌊', title: '심해 유적 & 매혹적인 조개 (The Abyss)' },
  'living-ship': { icon: '🌱', title: '생체 함선 스타버스 & 장기 배양' },
  'derelict-freighter': { icon: '☠️', title: '버려진 화물선 탐사 & 잔해 인양' },
  'extreme-weather': { icon: '⚡', title: '극한 기후 현상 및 대기 이상 관측소 (Worlds 1)' },
  'volcano': { icon: '🌋', title: '칼데라 지열 발전소 & 바살트 정련소 (Origins)' },
  'aquarium': { icon: '🦑', title: '심해 트로피 수족관 & 수중 표본' },
  'spacewalk': { icon: '🌌', title: '화물선 외벽 캣워크 & 무중력 EVA 우주유영' },
  'bioluminescent-forest': { icon: '🌌', title: '생체 발광 포자 숲 & 에테르 하늘가오리' },
  'race-initiator': { icon: '🏁', title: '엑소크래프트 레이스 트랙 스타터' },
  'titan-beetle': { icon: '🪲', title: '거대 비행 타이탄 비틀 활공 탈것' },
  'short-range-teleporter': { icon: '🌀', title: '기지 단거리 텔레포터 & 양자 도관망' },
  'em-generator': { icon: '⚡', title: 'S-Class 전자기 발전소 & 무한 전력망' },
  'aquatic-base': { icon: '🌊', title: '심해 수밀 해양 기지 & 수중 문풀' },
  'power-grid': { icon: '⚡', title: '기지 태양광 발전소 & 배터리 뱅크 허브' },
  'gas-harvester': { icon: '💨', title: '대기 기체 하베스터 & 화학 합성 정제소' },
  'ship-paint': { icon: '🎨', title: '우주선 도색, 외형 데칼 & 배기 흔적 튜닝' },
  'build-menu': { icon: '🏗️', title: '기지 건설 및 구조물 배치 [Z]' },
  'settlement': { icon: '🏛️', title: '행성 정착지 행정 관리 [L]' },
  'industrial': { icon: '🏭', title: '자율 광물 채굴 파이프라인' },
  'freighter': { icon: '🚢', title: '화물선 주력함 소환 [H]' },
  'squadron': { icon: '⚔️', title: '전투 비행중대 출격 [Q]' },
  'anomaly': { icon: '🔮', title: '스페이스 아노말리 성소 [B]' },
  'ancient-ruins': { icon: '🏛️', title: '고대 외계 유적 발굴지 [-]' },
  'colossal-archive': { icon: '🏯', title: '거대 행성 기록 보관소 [`]' },
  'interceptor': { icon: '🛸', title: '센티넬 인터셉터 인양 [N / 8]' }
};

interface MobileModalsProps {
  activeModal: string | null;
  onClose: () => void;
}

export const MobileModals: React.FC<MobileModalsProps> = ({ activeModal, onClose }) => {
  const [subTab, setSubTab] = useState(0);
  const [, setTick] = useState(0);
  const triggerRender = () => setTick((t) => t + 1);

  if (!activeModal) return null;

  const handleClose = () => {
    AudioSys.playNote(220, 'sine', 0.08);
    onClose();
  };

  const meta = MODAL_METADATA[activeModal] || {
    icon: '🚀',
    title: activeModal.replace(/-/g, ' ').toUpperCase()
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-slate-950 border border-cyan-400/60 rounded-2xl shadow-[0_0_35px_rgba(0,229,255,0.25)] overflow-hidden">
        {/* Sticky Mobile Modal Header */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-900 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-lg sm:text-xl shrink-0">
              {meta.icon}
            </span>
            <div className="flex flex-col truncate">
              <span className="text-xs sm:text-sm font-bold text-white nms-header-font truncate">
                {meta.title}
              </span>
              <span className="text-[8.5px] sm:text-[9px] text-cyan-300 font-mono">터치 친화적 모바일 인터페이스 활성</span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-gray-300 hover:text-white cursor-pointer active:scale-95 shrink-0"
            title="닫기"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Body Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 sm:p-4 text-xs font-mono space-y-4 pb-safe">
          {/* 1. INVENTORY MODAL */}
          {activeModal === 'inventory' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-900 rounded-xl border border-cyan-400/40 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-white block">탑승 중인 주력 함선</span>
                  <span className="text-cyan-300 font-bold text-sm">
                    {game.data.shipType === 'SOLAR' ? 'S-Class 솔라선 (Vesper Sail)' : game.data.shipType === 'INTERCEPTOR' ? 'S-Class 센티넬 인터셉터' : game.data.shipType === 'LIVING' ? 'S-Class 유기체 생체함선' : 'A-Class 래디언트 필러'}
                  </span>
                </div>
                <button
                  onClick={() => game.cycleStarship()}
                  className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded-lg font-bold text-xs cursor-pointer shadow-md"
                >
                  기종 전환 [K]
                </button>
              </div>

              {/* Element Slots Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { name: '산소 (O2)', key: 'oxygen', count: game.data.inv.oxygen, color: 'text-red-400', icon: '🫁', action: () => game.rechargeLifeSupport(), btnText: '생명 충전' },
                  { name: '나트륨 (Na)', key: 'sodium', count: game.data.inv.sodium, color: 'text-yellow-400', icon: '⚡', action: () => game.rechargeHazard(), btnText: '방호 충전' },
                  { name: '탄소 (C)', key: 'carbon', count: game.data.inv.carbon, color: 'text-emerald-400', icon: '🌱', action: () => game.rechargeMiningBeam(), btnText: '레이저 충전' },
                  { name: '페라이트 (Fe)', key: 'ferrite', count: game.data.inv.ferrite, color: 'text-gray-300', icon: '⛏️', action: () => game.reloadBoltcaster(), btnText: '탄약 장전' },
                  { name: '규산염 (Si)', key: 'silicate', count: game.data.inv.silicate, color: 'text-amber-300', icon: '🏜️' },
                  { name: '퍼그늄 (Pg)', key: 'pugneum', count: game.data.inv.pugneum, color: 'text-rose-400', icon: '🤖' },
                  { name: '삼중수소 (T3)', key: 'tritium', count: game.data.inv.tritium, color: 'text-blue-400', icon: '🚀' },
                  { name: '색층 금속', key: 'chromaticMetal', count: game.data.inv.chromaticMetal, color: 'text-purple-300', icon: '🔮' }
                ].map((item) => (
                  <div key={item.key} className="p-2.5 bg-slate-900/80 rounded-xl border border-white/10 flex flex-col justify-between h-24">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-400 font-bold">{item.name}</span>
                      <span className="text-base">{item.icon}</span>
                    </div>
                    <div className="text-lg font-bold text-white">{item.count}</div>
                    {item.action ? (
                      <button
                        onClick={() => {
                          AudioSys.playNote(440, 'sine', 0.05);
                          item.action!();
                        }}
                        className="w-full py-1 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 text-[10px] font-bold rounded cursor-pointer border border-cyan-400/30"
                      >
                        {item.btnText}
                      </button>
                    ) : (
                      <span className="text-[9px] text-gray-500">기본 원소 화물</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. QUICK RECHARGE MODAL */}
          {activeModal === 'quick-recharge' && (
            <div className="space-y-3">
              <span className="text-xs text-gray-400 block">원터치로 주요 탐사 장비를 신속히 재충전합니다.</span>
              <button
                onClick={() => game.rechargeHazard()}
                className="w-full p-3.5 bg-yellow-950/40 hover:bg-yellow-900/50 border border-yellow-400 rounded-xl flex justify-between items-center text-left cursor-pointer active:scale-98"
              >
                <div>
                  <span className="text-xs font-bold text-yellow-300 block">환경 방호 보호막 충전</span>
                  <span className="text-[10px] text-gray-400">나트륨(Na) 15개 소모 ➔ +50% 충전</span>
                </div>
                <span className="text-sm font-bold text-yellow-400">충전 ➔</span>
              </button>
              <button
                onClick={() => game.rechargeLifeSupport()}
                className="w-full p-3.5 bg-red-950/40 hover:bg-red-900/50 border border-red-500 rounded-xl flex justify-between items-center text-left cursor-pointer active:scale-98"
              >
                <div>
                  <span className="text-xs font-bold text-red-300 block">생명 유지 장치 충전</span>
                  <span className="text-[10px] text-gray-400">산소(O2) 15개 소모 ➔ +50% 충전</span>
                </div>
                <span className="text-sm font-bold text-red-400">충전 ➔</span>
              </button>
              <button
                onClick={() => game.rechargeMiningBeam()}
                className="w-full p-3.5 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-400 rounded-xl flex justify-between items-center text-left cursor-pointer active:scale-98"
              >
                <div>
                  <span className="text-xs font-bold text-cyan-300 block">채굴 레이저 빔 충전</span>
                  <span className="text-[10px] text-gray-400">탄소(C) 20개 소모 ➔ +50% 충전</span>
                </div>
                <span className="text-sm font-bold text-cyan-400">충전 ➔</span>
              </button>
            </div>
          )}

          {/* 3. 3D GALAXY MAP MODAL */}
          {activeModal === 'galaxy-map' && (
            <div className="space-y-3">
              <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-400/40 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-white block">현재 위치: 유클리드 은하 제4구역</span>
                  <span className="text-[10px] text-cyan-300">보유 워프 셀: {game.data.inv.warpCell}개 // 은하 중심까지 712,000 LY</span>
                </div>
                <button
                  onClick={() => {
                    if (game.data.inv.warpCell > 0) {
                      game.data.inv.warpCell--;
                      game.currState = 'WARP';
                      game.warpProgress = 0;
                      AudioSys.playWarp();
                      handleClose();
                    } else {
                      game.data.inv.warpCell = 1;
                      game.spawnFloatText("워프 셀 1개 긴급 충전됨!", undefined, undefined, '#10b981');
                    }
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white font-bold rounded-lg cursor-pointer text-xs shadow-md"
                >
                  🚀 성간 워프 도약 실행
                </button>
              </div>

              {/* Star Systems List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { name: '오미아-IV (현재 성계)', race: '코르박스 연구 성계', dist: '0 LY', color: 'border-cyan-400' },
                  { name: '발라리-V 무역 성역', race: '게크 대상인 연합', dist: '180 LY', color: 'border-yellow-400' },
                  { name: '무법자 해적 요새 ☠️', race: '해적 무법 성계', dist: '240 LY', color: 'border-red-500' },
                  { name: '불협화 디스코디아 💜', race: '오토파지 성계', dist: '310 LY', color: 'border-purple-400' },
                  { name: '아틀라스 프라임 성소', race: '진홍의 아틀라스', dist: '420 LY', color: 'border-rose-400' },
                  { name: '초거대 블랙홀 특이점 🕳️', race: '시공간 균열 성계', dist: '580 LY', color: 'border-indigo-400' }
                ].map((sys, idx) => (
                  <div key={idx} className={`p-3 bg-slate-900 rounded-xl border ${sys.color} flex justify-between items-center`}>
                    <div>
                      <span className="font-bold text-white text-xs block">{sys.name}</span>
                      <span className="text-[10px] text-gray-400">{sys.race}</span>
                    </div>
                    <span className="text-cyan-300 font-bold text-xs">{sys.dist}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. SOLAR SHIP & VESPER SAIL */}
          {activeModal === 'solar-ship' && (
            <div className="space-y-3">
              <div className="p-4 bg-amber-950/40 rounded-xl border border-amber-400 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⛵</span>
                  <div>
                    <span className="text-sm font-bold text-white block">S-Class 솔라급 요격선 & 베스퍼 세일 코어</span>
                    <span className="text-[10px] text-amber-300">육각형 태양광 돛 전개 // 펄스 비행 및 무한 쉴드 자동 재생</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.shipType = 'SOLAR';
                    game.data.maxShield = 340;
                    game.data.shield = 340;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("솔라선 탑승 완료 // 베스퍼 세일 전개!", undefined, undefined, '#f59e0b');
                    handleClose();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md whitespace-nowrap"
                >
                  ⛵ 솔라선 즉시 탑승
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10">
                  <span className="text-gray-400 block text-[10px]">쉴드 자동 충전</span>
                  <span className="text-emerald-400 font-bold text-sm">+2.0% / 초</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10">
                  <span className="text-gray-400 block text-[10px]">펄스 추진 효율</span>
                  <span className="text-cyan-300 font-bold text-sm">+85% 연료 절감</span>
                </div>
              </div>
            </div>
          )}

          {/* 5. LAYLAPS SENTINEL COMPANION */}
          {activeModal === 'laylaps' && (
            <div className="space-y-3">
              <div className="p-4 bg-cyan-950/40 rounded-xl border border-cyan-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🤖</span>
                  <div>
                    <span className="text-sm font-bold text-white block">센티넬 동료 레일랩스 (Laylaps)</span>
                    <span className="text-[10px] text-cyan-300">신경망 프로토콜: 우호적 동행 및 자동 요격 활성</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    AudioSys.playNote(880, 'sine', 0.1, 0.4);
                    AudioSys.playNote(440, 'sawtooth', 0.2, 0.4);
                    game.spawnFloatText("⚡ 레일랩스 EMP 방출: 주변 위협 무력화!", undefined, undefined, '#00e5ff');
                  }}
                  className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  ⚡ EMP 긴급 방출
                </button>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                <span className="text-gray-300 text-xs">레일랩스 정찰 발굴: 지하 매몰 기술 모듈 탐측</span>
                <button
                  onClick={() => {
                    game.data.nanites += 200;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("💎 매몰 기술 발굴 성공! (+200 ⬡ 나노로봇)", undefined, undefined, '#10b981');
                  }}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-bold text-xs cursor-pointer"
                >
                  정찰 발굴
                </button>
              </div>
            </div>
          )}

          {/* 6. AQUARIUS FISHING RIG */}
          {activeModal === 'fishing' && (
            <div className="space-y-3">
              <div className="p-4 bg-cyan-950/40 rounded-xl border border-cyan-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎣</span>
                  <div>
                    <span className="text-sm font-bold text-white block">S-Class 로스트 앵글러 해양 낚싯대</span>
                    <span className="text-[10px] text-cyan-300">외계 수생 생물 어획, 엑소스키프 및 통발 네트워크</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    AudioSys.playFishingBite();
                    AudioSys.playReelClick();
                    const rewardUnits = Math.floor(15000 + Math.random() * 35000);
                    game.data.units += rewardUnits;
                    game.data.nanites += 45;
                    game.spawnFloatText(`🎣 어획 성공! [희귀] 프리즘 해마 (+${rewardUnits.toLocaleString()} ₩, +45 ⬡)`, undefined, undefined, '#00e5ff');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🎣 낚싯줄 투척 및 릴링
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>🚤 엑소스키프 전개 플랫폼</span>
                  <button
                    onClick={() => {
                      AudioSys.playPulseDrive();
                      game.spawnFloatText("🚤 엑소스키프 전개 완료!", undefined, undefined, '#22d3ee');
                    }}
                    className="px-2.5 py-1 bg-cyan-800 text-white rounded text-[10px] font-bold"
                  >
                    전개
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>🧺 자동 통발 일괄 수거</span>
                  <button
                    onClick={() => {
                      game.data.units += 120000;
                      game.data.nanites += 100;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("🧺 통발 수거 완료 (+120,000 ₩, +100 ⬡)", undefined, undefined, '#10b981');
                    }}
                    className="px-2.5 py-1 bg-emerald-800 text-white rounded text-[10px] font-bold"
                  >
                    수거
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 7. BLACK HOLE MODAL */}
          {activeModal === 'black-hole' && (
            <div className="space-y-3">
              <div className="p-4 bg-purple-950/40 rounded-xl border border-purple-400 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🕳️</span>
                  <div>
                    <span className="text-sm font-bold text-white block">초거대 블랙홀 & 사건의 지평선 특이점 엔진</span>
                    <span className="text-[10px] text-purple-300">상대론적 시공간 왜곡 돌파 // 100만 광년 너머로 즉각 웜홀 도약</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    AudioSys.playBlackHoleTransit();
                    game.data.units += 500000;
                    game.data.nanites += 1000;
                    game.data.quicksilver += 250;
                    game.spawnFloatText("🕳️ 사건의 지평선 돌파! 850,000 LY 도약 (+500,000 ₩, +1,000 ⬡, +250 ◈)", undefined, undefined, '#c084fc');
                    handleClose();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md whitespace-nowrap"
                >
                  🕳️ 사건의 지평선 돌파
                </button>
              </div>
            </div>
          )}

          {/* 8. ANCIENT PORTAL MODAL */}
          {activeModal === 'portal' && (
            <div className="space-y-3">
              <div className="p-3 bg-cyan-950/40 rounded-xl border border-cyan-400 flex justify-between items-center">
                <span className="text-xs font-bold text-white">고대 아틀라스 16 글리프 포탈 제어대</span>
                <button
                  onClick={() => {
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("🌀 포탈 게이트 개방 // 은하 중심 랑데부!", undefined, undefined, '#00e5ff');
                    handleClose();
                  }}
                  className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-xs cursor-pointer shadow-md"
                >
                  ⚡ 포탈 활성화 및 전송
                </button>
              </div>

              {/* 16 Glyphs Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {['🌅', '🐦', '👤', '🦕', '🌑', '🎈', '⛵', '🐛', '🦗', '🌌', '📦', '🐟', '🐙', '🚀', '🌲', '🔴'].map((sym, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      AudioSys.playNote(220 + idx * 25, 'sine', 0.1);
                      game.spawnFloatText(`글리프 #${idx + 1} (${sym}) 입력`, undefined, undefined, '#00e5ff');
                    }}
                    className="p-2.5 rounded-lg bg-slate-900 border border-white/10 hover:border-cyan-400 flex flex-col items-center justify-center text-lg cursor-pointer active:scale-95"
                  >
                    <span>{sym}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 9. WONDERS MODAL */}
          {activeModal === 'wonders' && (
            <div className="space-y-3">
              <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-400 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-white block">은하계 경이(Wonders) 카탈로그</span>
                  <span className="text-[10px] text-indigo-300">최대 거수 괴수, 극한 고온 행성 및 기지 홀로그램 투사</span>
                </div>
                <button
                  onClick={() => {
                    game.data.nanites += 1500;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("✨ 경이 탐사 보상 수령: +1,500 ⬡ 나노로봇!", undefined, undefined, '#818cf8');
                  }}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs cursor-pointer shadow-md"
                >
                  보상 수령 (+1,500 ⬡)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10">
                  <span className="text-indigo-400 font-bold block">🦕 8.6m 디플로도쿠스 타이탄</span>
                  <span className="text-gray-400 text-[10px]">최고 전장 기록 // 기지 홀로그램 영사기 투사 중</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10">
                  <span className="text-amber-400 font-bold block">🔥 +328.4°C 인페르노 화산 행성</span>
                  <span className="text-gray-400 text-[10px]">최고 극한 고온 기록 // 활성 화산 폭격</span>
                </div>
              </div>
            </div>
          )}

          {/* 10. SUPERCHARGE MODAL */}
          {activeModal === 'supercharge' && (
            <div className="space-y-3">
              <div className="p-3 bg-violet-950/40 rounded-xl border border-violet-400 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-white block">보라빛 공명 기술 과급 슬롯 (4/4 SLOTS)</span>
                  <span className="text-[10px] text-violet-300">과급 슬롯 모듈 스탯 +35% 오버클럭 시너지 부여</span>
                </div>
                <button
                  onClick={() => {
                    game.data.maxShield += 40;
                    game.data.shield = game.data.maxShield;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("⚡ 과급 슬롯 튜닝 완료! 쉴드 +40 오버차지", undefined, undefined, '#a855f7');
                  }}
                  className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-bold text-xs cursor-pointer shadow-md"
                >
                  ⚡ 오버클럭 튜닝
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-violet-500/40">
                  <span className="text-violet-300 font-bold block">💥 포톤 캐논 과급</span>
                  <span className="text-[10px] text-gray-400">+35% 연사 DPS 상승</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-violet-500/40">
                  <span className="text-violet-300 font-bold block">🛡️ 디플렉터 실드 과급</span>
                  <span className="text-[10px] text-gray-400">+80 선체 방어막 증강</span>
                </div>
              </div>
            </div>
          )}

          {/* 11. APPEARANCE MODAL */}
          {activeModal === 'appearance' && (
            <div className="space-y-3">
              <div className="p-3 bg-pink-950/40 rounded-xl border border-pink-400 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-white block">외형 조작기 (Appearance Modifier)</span>
                  <span className="text-[10px] text-pink-300">6대 은하 종족, 망토 시뮬레이션 및 아머 도색</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { name: '아노말리 (인간)', icon: '👨‍🚀', perk: '방호 소모율 -20%' },
                  { name: '코르박스 (전자)', icon: '🤖', perk: '바이저 스캔 +30%' },
                  { name: '바이킨 (전사)', icon: '⚔️', perk: '무기 공격력 +20%' },
                  { name: '게크 (조류 상인)', icon: '🐦', perk: '상점 매입 15% 할인' },
                  { name: '여행자 (영혼)', icon: '🌌', perk: '워프 도약 +200 LY' },
                  { name: '오토파지 (로봇)', icon: '🧵', perk: '스태프 화력 +30%' }
                ].map((race, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText(`종족 변경: ${race.name} (${race.perk})`, undefined, undefined, '#ec4899');
                    }}
                    className="p-3 rounded-xl bg-slate-900 border border-white/10 hover:border-pink-400 flex flex-col items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <span className="text-2xl">{race.icon}</span>
                    <span className="font-bold text-white text-xs">{race.name}</span>
                    <span className="text-[9px] text-pink-300">{race.perk}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 11-A. ORGANIC LIVING FRIGATE FLEET & PSYCHONIC EGG */}
          {activeModal === 'organic-fleet' && (
            <div className="space-y-3">
              <div className="p-4 bg-purple-950/40 rounded-xl border border-purple-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🐙</span>
                  <div>
                    <span className="text-sm font-bold text-white block">생체 호위함대 & 사이코닉 알(Psychonic Egg)</span>
                    <span className="text-[10px] text-purple-300">사이코닉 알 2개, 산란 주머니 1개 배양실 가동 중</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.nanites += 800;
                    game.data.maxShield += 30;
                    game.data.shield = game.data.maxShield;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("🥚 사이코닉 알 부화 완료! 신경망 생체 쉴드 +30 (+800 ⬡)", undefined, undefined, '#c084fc');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🥚 사이코닉 알 부화
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">산란 주머니(Spawning Sac)</span>
                    <span className="text-[9px] text-gray-400">생체 함선 슬롯 +1 영구 확장</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.units += 350000;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("👝 산란 주머니 이식 완료! (+350,000 ₩)", undefined, undefined, '#f59e0b');
                    }}
                    className="px-2.5 py-1 bg-amber-600 text-black font-bold rounded text-[10px]"
                  >
                    이식
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">생체 먹이 급여 변이</span>
                    <span className="text-[9px] text-gray-400">전투 / 탐사 능력치 상승</span>
                  </div>
                  <button
                    onClick={() => {
                      AudioSys.playRecharge();
                      game.spawnFloatText("🥗 생체 호위함 먹이 급여 완료 (탐사 +12)", undefined, undefined, '#10b981');
                    }}
                    className="px-2.5 py-1 bg-green-700 text-white rounded text-[10px] font-bold"
                  >
                    급여
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 11-B. EGG SEQUENCER & GENE MUTATION */}
          {activeModal === 'egg-sequencer' && (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🧬</span>
                  <div>
                    <span className="text-sm font-bold text-white block">알 염기서열 분석기 & 유전자 개조 챔버</span>
                    <span className="text-[10px] text-emerald-300">크기 2.0x 대형화, 체색 에메랄드, 공격성 75% 설정</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.nanites += 500;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("🐣 개조된 타이탄 배아 즉시 부화 완료! (+500 ⬡)", undefined, undefined, '#10b981');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🐣 타이탄 즉시 부화
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>📏 성장 호르몬 주입 (+0.5x)</span>
                  <button
                    onClick={() => {
                      AudioSys.playRecharge();
                      game.spawnFloatText("📏 성장 조절제 주입: 체격 2.5x 대형화!", undefined, undefined, '#10b981');
                    }}
                    className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[10px] font-bold"
                  >
                    주입
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>🎨 유전자 염색 물질 교체</span>
                  <button
                    onClick={() => {
                      AudioSys.playNote(580, 'sine', 0.1);
                      game.spawnFloatText("🎨 유전자 염색 분리: 일렉트릭 시안 색조 적용!", undefined, undefined, '#06b6d4');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    염색
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 11-C. BIODOME HYDROPONICS & AGRICULTURE */}
          {activeModal === 'biodome' && (
            <div className="space-y-3">
              <div className="p-4 bg-lime-950/40 rounded-xl border border-lime-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌱</span>
                  <div>
                    <span className="text-sm font-bold text-white block">바이오 돔 8대 작물 수경재배 온실</span>
                    <span className="text-[10px] text-lime-300">서리수정, 솔라바인, 스타브램블, 선인장 전량 재배 완충</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.units += 450000;
                    game.data.inv.carbon = (game.data.inv.carbon || 0) + 150;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("🌾 중앙 마스터 레버 가동: 전 작물 일괄 수확 완료 (+450,000 ₩)!", undefined, undefined, '#84cc16');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-lime-600 to-emerald-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🌾 전 작물 일괄 수확
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>📟 회로 기판(Circuit Board) 합성</span>
                  <button
                    onClick={() => {
                      game.data.units += 916000;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("💎 회로 기판 제작 및 매각 (+916,000 ₩)!", undefined, undefined, '#facc15');
                    }}
                    className="px-2.5 py-1 bg-amber-600 text-black font-bold rounded text-[10px]"
                  >
                    제작
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>💧 고농축 수경 배양액 순환</span>
                  <button
                    onClick={() => {
                      AudioSys.playRecharge();
                      game.spawnFloatText("💧 수경 배양액 주입: 작물 수확량 2배 적용!", undefined, undefined, '#84cc16');
                    }}
                    className="px-2.5 py-1 bg-lime-700 text-white rounded text-[10px] font-bold"
                  >
                    가속
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 11-D. ORBITAL FREIGHTER OPERATIONS */}
          {activeModal === 'orbital-freighter' && (
            <div className="space-y-3">
              <div className="p-4 bg-blue-950/40 rounded-xl border border-blue-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🛰️</span>
                  <div>
                    <span className="text-sm font-bold text-white block">화물선 궤도 물질화기 & 항성계 스캐너 룸</span>
                    <span className="text-[10px] text-blue-300">궤도 차량 투하, 원격 심층 스캔 및 항성 가스 추출</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.nanites += 600;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("📡 성간 광역 스캔 완료! 전 행성 환경 탐측 (+600 ⬡)", undefined, undefined, '#38bdf8');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  📡 광역 스캔 가동
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>🏎️ 로머 버기 즉시 궤도 투하</span>
                  <button
                    onClick={() => {
                      AudioSys.playPulseDrive();
                      game.spawnFloatText("🏎️ 로머 버기 궤도 빔 다운 완료!", undefined, undefined, '#00e5ff');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    투하
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>🌌 항성 가스 추출기 일괄 수확</span>
                  <button
                    onClick={() => {
                      game.data.inv.chromaticMetal = (game.data.inv.chromaticMetal || 0) + 120;
                      AudioSys.playRecharge();
                      game.spawnFloatText("📦 항성 가스 및 색층 금속 +120 수확!", undefined, undefined, '#facc15');
                    }}
                    className="px-2.5 py-1 bg-amber-600 text-black font-bold rounded text-[10px]"
                  >
                    수확
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 11-E. OMEGA EXPEDITIONS & LEGENDARY SHIPS */}
          {activeModal === 'expedition' && (
            <div className="space-y-3">
              <div className="p-4 bg-amber-950/40 rounded-xl border border-amber-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏆</span>
                  <div>
                    <span className="text-sm font-bold text-white block">스페이스 아노말리 성간 원정대 (Expeditions)</span>
                    <span className="text-[10px] text-amber-300">5단계 마일스톤 완수 // 전설의 골든 벡터 & 스타본 러너 해금</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.shipType = 'SOLAR';
                    game.data.maxShield = 360;
                    game.data.shield = 360;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("🥇 전설의 골든 벡터 S-Class 수령 및 탑승 완료!", undefined, undefined, '#facc15');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-black font-extrabold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🥇 골든 벡터 인수
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">스타본 러너 인수</span>
                    <span className="text-[9px] text-gray-400">반중력 레이서 호버링</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.shipType = 'SOLAR';
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("🛸 스타본 러너 함선 탑승 완료!", undefined, undefined, '#06b6d4');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    인수
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">원정 전리품 이송</span>
                    <span className="text-[9px] text-gray-400">수은 3,000 + 나노로봇 5,000</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.quicksilver = (game.data.quicksilver || 0) + 3000;
                      game.data.nanites += 5000;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("✨ 원정 전리품 본계정 이송 완료 (+3,000 ◈, +5,000 ⬡)!", undefined, undefined, '#facc15');
                    }}
                    className="px-2.5 py-1 bg-purple-700 text-white rounded text-[10px] font-bold"
                  >
                    이송
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 11-F. STARSHIP SCRAPPER & SALVAGE */}
          {activeModal === 'scrapper' && (
            <div className="space-y-3">
              <div className="p-4 bg-amber-950/40 rounded-xl border border-amber-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🛸</span>
                  <div>
                    <span className="text-sm font-bold text-white block">우주정거장 우주선 인양 분해소</span>
                    <span className="text-[10px] text-amber-300">고철 함선 해체, 보관함 확장 모듈 인양 및 S-Class 코어 승급</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.units += 4500000;
                    game.data.nanites += 950;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("💥 해적 전투기 고철 분해 완료! (+4,500,000 ₩, +950 ⬡, 확장 모듈 +1)", undefined, undefined, '#facc15');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  💥 함선 인양 분해
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>👝 보관함 확장 모듈 적용</span>
                  <button
                    onClick={() => {
                      game.data.maxShield += 20;
                      game.data.shield = game.data.maxShield;
                      AudioSys.playRecharge();
                      game.spawnFloatText("👝 보관함 슬롯 +1 확장 및 쉴드 강화!", undefined, undefined, '#10b981');
                    }}
                    className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[10px] font-bold"
                  >
                    적용
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>⭐ 함선 등급 S-Class 승급</span>
                  <button
                    onClick={() => {
                      game.data.shipClass = 'S';
                      game.data.maxShield = 360;
                      game.data.shield = 360;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("⭐ S-Class 반응로 승급 완료 (최대 실드 360)!", undefined, undefined, '#facc15');
                    }}
                    className="px-2.5 py-1 bg-amber-600 text-black font-bold rounded text-[10px]"
                  >
                    승급
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 11-G. PLANETARY TRADE OUTPOST & COMMODITIES */}
          {activeModal === 'trade-outpost' && (
            <div className="space-y-3">
              <div className="p-4 bg-teal-950/40 rounded-xl border border-teal-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏛️</span>
                  <div>
                    <span className="text-sm font-bold text-white block">행성 대형 교역소 & 7대 무역망</span>
                    <span className="text-[10px] text-teal-300">부유한 T3 첨단기술 무역 허브 // 300~500% 성간 차익 거래</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.units += 2500000;
                    game.data.nanites += 800;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("📈 황금 무역로 3각 차익 거래 완료 (+2,500,000 ₩, +800 ⬡)!", undefined, undefined, '#14b8a6');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  📈 황금 무역로 거래 실행
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">⚡ 양자 가속기 (도매 매입)</span>
                    <span className="price-delta-badge price-surge mt-1 inline-block">+420% 시세 급등</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.units += 235000;
                      AudioSys.playRecharge();
                      game.spawnFloatText("⚡ 무역 특산품 차익 실현 (+235,000 ₩)", undefined, undefined, '#facc15');
                    }}
                    className="px-2.5 py-1 bg-teal-700 text-white rounded text-[10px] font-bold"
                  >
                    매매
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">👨‍✈️ 기항 상선 조종사 바터</span>
                    <span className="price-delta-badge price-drop mt-1 inline-block">-35% 수수료 할인</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.units += 350000;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("🤝 상선 조종사 물물교환 완료 (+350,000 ₩ 가치)!", undefined, undefined, '#10b981');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    교환
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 12. WEAPON ARSENAL & HEAVY ORDNANCE COMMAND MATRIX (v5.50.0 Sentinel & Waypoint) */}
          {activeModal === 'weapon-arsenal' && (
            <div className="space-y-4">
              {/* Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 bg-slate-900/90 p-3 rounded-xl border border-orange-500/30 text-xs font-mono">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400">ACTIVE PRIMARY WEAPON</span>
                  <span className="text-sm font-bold text-yellow-400 font-mono truncate">
                    {game.data.combatWeapons.weapons[game.data.combatWeapons.activeWeapon]?.name.split(' ')[0] || 'BOLTCASTER'}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold">S-CLASS COMBAT RIG</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400">TOTAL COMBAT DPS</span>
                  <span className="text-sm font-bold text-orange-400 font-mono">
                    {Math.round(
                      (game.data.combatWeapons.weapons[game.data.combatWeapons.activeWeapon]?.baseDps || 3000) *
                        (game.data.combatWeapons.overclockActive ? 1.5 : 1) *
                        (game.data.combatWeapons.weapons[game.data.combatWeapons.activeWeapon]?.supercharged ? 1.3 : 1)
                    ).toLocaleString()}{' '}
                    DPS
                  </span>
                  <span className="text-[9px] text-amber-300">
                    {game.data.combatWeapons.overclockActive ? '공명 가속 활성 (+50%)' : '표준 탄도학'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400">ACTIVE SECONDARY</span>
                  <span className="text-sm font-bold text-cyan-300 font-mono truncate">
                    {game.data.secondaryWeapons.active.toUpperCase()}
                  </span>
                  <span className="text-[9px] text-cyan-400">
                    잔탄: {game.data.secondaryWeapons.ammo[game.data.secondaryWeapons.active] || 0}발
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400">SUPERCHARGED SLOTS</span>
                  <span className="text-sm font-bold text-purple-300 font-mono">
                    {Object.values(game.data.combatWeapons.weapons).filter((w) => w.supercharged).length} / 5 과급
                  </span>
                  <span className="text-[9px] text-purple-400 font-bold">오버클럭 슬롯 공명</span>
                </div>
              </div>

              {/* Sub-Tabs: Telemetry (0) | Primary (1) | Secondary (2) | Logistics (3) */}
              <div className="flex gap-2 border-b border-white/10 pb-2 text-xs font-mono overflow-x-auto">
                <button
                  onClick={() => setSubTab(0)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                    subTab === 0
                      ? 'bg-orange-500/30 text-orange-300 border border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                      : 'bg-slate-900 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  🎯 1. 화기 텔레메트리 &amp; 사격
                </button>
                <button
                  onClick={() => setSubTab(1)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                    subTab === 1
                      ? 'bg-orange-500/30 text-orange-300 border border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                      : 'bg-slate-900 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  ⚡ 2. 5대 기본 주무기
                </button>
                <button
                  onClick={() => setSubTab(2)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                    subTab === 2
                      ? 'bg-orange-500/30 text-orange-300 border border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                      : 'bg-slate-900 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  💣 3. 보조 중화기 유탄
                </button>
                <button
                  onClick={() => setSubTab(3)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 ${
                    subTab === 3
                      ? 'bg-orange-500/30 text-orange-300 border border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                      : 'bg-slate-900 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  🛠️ 4. 센티넬 병참 보급
                </button>
              </div>

              {/* Sub-Tab 0: Telemetry & Firing Test */}
              {subTab === 0 && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-orange-950/80 via-amber-950/80 to-slate-950 p-4 rounded-xl border border-orange-500/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="text-xs font-bold text-orange-300 flex items-center gap-2">
                        <span>🔥</span>
                        <span>다목적 도구 탄도학 &amp; 과급 슬롯 공명 시스템 (Ballistics Matrix)</span>
                      </div>
                      <p className="text-[11px] text-gray-300 mt-1">
                        센티넬 지상군 드론, 쿼드루페드, 하드프레임 메카 및 거대 워커의 편향 쉴드를 관통하는 전술 화기 사령부입니다.
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => game.testFireActiveCombatWeapon()}
                        className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 text-white font-bold text-xs rounded-lg shadow-md cursor-pointer transition-all"
                      >
                        💥 사격 시험 (Test)
                      </button>
                      <button
                        onClick={() => game.cycleCombatWeapon()}
                        className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-white font-bold text-xs rounded-lg shadow-md cursor-pointer transition-all"
                      >
                        🔄 주무기 순환 (G)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 space-y-2">
                      <span className="font-bold text-amber-300 block">S-Class 전투 프레임 스펙</span>
                      <p className="text-gray-300 text-[11px] leading-relaxed">
                        최대 4개의 과급 슬롯(Supercharged Slots)이 배치되어 있어 주무기 및 부속 모듈을 과급 슬롯에 배치 시 피해량 50%, 발사 속도 35%, 반동 제어력이 비약적으로 극대화됩니다.
                      </p>
                      <div className="p-2 bg-black/40 rounded border border-amber-500/20 text-[10px] text-amber-200 font-mono">
                        • 현재 무장: {game.data.combatWeapons.weapons[game.data.combatWeapons.activeWeapon]?.name}<br />
                        • 장탄수: {game.data.combatWeapons.weapons[game.data.combatWeapons.activeWeapon]?.curMag} / {game.data.combatWeapons.weapons[game.data.combatWeapons.activeWeapon]?.magSize}발
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 space-y-2">
                      <span className="font-bold text-cyan-300 block">보조 중화기 연동 체계</span>
                      <p className="text-gray-300 text-[11px] leading-relaxed">
                        원거리 장애물 파괴 및 광역 섬광 마비를 위해 플라즈마 런처, 지질학 캐논, 마비 박격포가 다목적 도구 하부 레일에 병렬 장착되어 있습니다.
                      </p>
                      <div className="p-2 bg-black/40 rounded border border-cyan-500/20 text-[10px] text-cyan-200 font-mono">
                        • 보조 무장: {game.data.secondaryWeapons.active.toUpperCase()}<br />
                        • 사격 키: [보조 사격 버튼] 또는 3번 탭에서 즉각 발사
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 1: 5 Primary Weapons */}
              {subTab === 1 && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {Object.entries(game.data.combatWeapons.weapons).map(([wKey, w]) => {
                      const isEquipped = game.data.combatWeapons.activeWeapon === wKey;
                      const dps = Math.round(
                        (w.baseDps || 3000) *
                          (game.data.combatWeapons.overclockActive ? 1.5 : 1) *
                          (w.supercharged ? 1.3 : 1)
                      );
                      return (
                        <div
                          key={wKey}
                          className={`p-3 rounded-xl border flex flex-col justify-between gap-2 bg-slate-900/90 transition-all ${
                            isEquipped ? 'border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.25)]' : 'border-white/10'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-xs">{w.name}</span>
                                {w.supercharged && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-400">
                                    과급 ✓
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400 font-mono block mt-0.5">
                                피해량: {w.damage} | 연사: {w.rate}s | 탄창: {w.magSize}발
                              </span>
                            </div>
                            <span className="text-xs font-bold font-mono text-orange-400">{dps.toLocaleString()} DPS</span>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                            <button
                              onClick={() => game.equipCombatWeapon(wKey)}
                              disabled={isEquipped}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                isEquipped
                                  ? 'bg-emerald-600/70 text-emerald-200 border border-emerald-400 cursor-default'
                                  : 'bg-orange-600 hover:bg-orange-500 text-white'
                              }`}
                            >
                              {isEquipped ? '장착 중 (EQUIPPED)' : '장착 (EQUIP)'}
                            </button>
                            <button
                              onClick={() => game.superchargeWeapon(wKey)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                w.supercharged
                                  ? 'bg-purple-900/80 text-purple-300 border border-purple-400'
                                  : 'bg-slate-800 hover:bg-slate-700 text-gray-300 border border-white/10'
                              }`}
                            >
                              {w.supercharged ? '과급 해제' : '과급 튜닝 (500⬡)'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: Secondary Heavy Ordnance */}
              {subTab === 2 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {[
                      {
                        id: 'plasmaLauncher',
                        name: '플라즈마 런처 (Plasma Launcher)',
                        icon: '💥',
                        desc: '표면을 튕겨 반동 후 폭발하는 고온 플라즈마 구체 유탄. 드론 밀집지역 일망타진.',
                        type: '고폭 유탄'
                      },
                      {
                        id: 'geologyCannon',
                        name: '지질학 캐논 (Geology Cannon)',
                        icon: '🌋',
                        desc: '지반을 대규모 굴착하며 폭심지 충격파를 일으키는 중력파 지질 폭탄.',
                        type: '지형 파괴탄'
                      },
                      {
                        id: 'paralysisMortar',
                        name: '마비 박격포 (Paralysis Mortar)',
                        icon: '⚡',
                        desc: '적중 반경의 모든 센티넬을 전자기 펄스로 즉각 마비시키고 취약 상태로 유도.',
                        type: '전자기 마비탄'
                      },
                      {
                        id: 'personalForcefield',
                        name: '개인용 역장 (Personal Forcefield)',
                        icon: '🛡️',
                        desc: '전방에 방어막 에너지를 투사하여 적의 중화기 탄환과 레이저를 도탄 반사.',
                        type: '투사형 역장'
                      },
                      {
                        id: 'cloakingDevice',
                        name: '은폐 장치 (Cloaking Device)',
                        icon: '👻',
                        desc: '빛을 굴절시켜 센티넬 경계망과 추적 센서로부터 즉각 완전 투명화.',
                        type: '광학 위장막'
                      }
                    ].map((sec) => {
                      const isEquipped = game.data.secondaryWeapons.active === sec.id;
                      const ammo = game.data.secondaryWeapons.ammo[sec.id] || 0;
                      return (
                        <div
                          key={sec.id}
                          className={`p-3 rounded-xl border flex flex-col justify-between gap-2 bg-slate-900/90 ${
                            isEquipped ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]' : 'border-white/10'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                                <span>{sec.icon}</span>
                                <span>{sec.name}</span>
                              </span>
                              <span className="text-[10px] text-cyan-300 font-mono font-bold">
                                잔여: {ammo}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed">{sec.desc}</p>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                            <button
                              onClick={() => game.equipSecondaryWeapon(sec.id as any)}
                              disabled={isEquipped}
                              className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                isEquipped
                                  ? 'bg-cyan-600/70 text-cyan-100 border border-cyan-400 cursor-default'
                                  : 'bg-slate-800 hover:bg-slate-700 text-white'
                              }`}
                            >
                              {isEquipped ? '보조 장착 중 ✓' : '보조무기 장착'}
                            </button>
                            {isEquipped && (
                              <button
                                onClick={() => game.fireSecondaryWeapon()}
                                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                              >
                                🚀 즉시 발사
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-Tab 3: Sentinel Modifications & Quartermaster Supplies */}
              {subTab === 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-900/90 rounded-xl border border-purple-500/30 flex flex-col justify-between gap-2">
                    <div>
                      <span className="font-bold text-purple-300 text-xs block mb-1">🔮 인양된 유리 정제 &amp; 무기 모듈</span>
                      <p className="text-[11px] text-gray-400">
                        파괴된 센티넬 드론에서 회수한 인양된 유리를 분석하여 희귀 불법 센티넬 무기 파편을 추출합니다.
                      </p>
                      <span className="text-[10px] text-purple-400 font-mono block mt-1">+180,000 ₩, +250 ⬡, 센티넬 무기 모듈</span>
                    </div>
                    <button
                      onClick={() => game.refineSalvagedGlassWeapon()}
                      disabled={game.data.combatWeapons.glassRefined}
                      className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                        game.data.combatWeapons.glassRefined
                          ? 'bg-purple-950/60 text-purple-400 border border-purple-400/40 cursor-default'
                          : 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer shadow-md'
                      }`}
                    >
                      {game.data.combatWeapons.glassRefined ? '정제 완료 ✓' : '유리 정제 및 모듈 획득'}
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-900/90 rounded-xl border border-yellow-500/30 flex flex-col justify-between gap-2">
                    <div>
                      <span className="font-bold text-amber-300 text-xs block mb-1">📦 야전 탄약 캡슐 투하</span>
                      <p className="text-[11px] text-gray-400">
                        궤도 보급선에서 압축 탄약 컨테이너를 투하하여 5대 전투 화기의 모든 탄창을 100% 즉시 보급합니다.
                      </p>
                      <span className="text-[10px] text-amber-400 font-mono block mt-1">+150 ⬡, 모든 화기 탄약 완전 보급</span>
                    </div>
                    <button
                      onClick={() => game.supplyFieldMunitions()}
                      disabled={game.data.combatWeapons.munitionsSupplied}
                      className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                        game.data.combatWeapons.munitionsSupplied
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-400/40 cursor-default'
                          : 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer shadow-md'
                      }`}
                    >
                      {game.data.combatWeapons.munitionsSupplied ? '보급 완료 ✓' : '야전 탄약 캡슐 투하'}
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-900/90 rounded-xl border border-cyan-500/30 flex flex-col justify-between gap-2">
                    <div>
                      <span className="font-bold text-cyan-300 text-xs block mb-1">⚡ 과급 슬롯 과부하 공명 가동</span>
                      <p className="text-[11px] text-gray-400">
                        다목적 도구 전원 회로를 강제 과급하여 전투 화기의 공격력을 +50%, 연사력을 +35% 영구 증폭합니다.
                      </p>
                      <span className="text-[10px] text-cyan-400 font-mono block mt-1">+200 ⬡, 공격력/연사력 영구 오버클럭</span>
                    </div>
                    <button
                      onClick={() => game.overclockWeaponMatrix()}
                      disabled={game.data.combatWeapons.overclockActive}
                      className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                        game.data.combatWeapons.overclockActive
                          ? 'bg-cyan-950/60 text-cyan-400 border border-cyan-400/40 cursor-default'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer shadow-md'
                      }`}
                    >
                      {game.data.combatWeapons.overclockActive ? '과부하 공명 가동 중 ✓' : '과부하 공명 가동'}
                    </button>
                  </div>

                  <div className="p-3.5 bg-slate-900/90 rounded-xl border border-orange-500/30 flex flex-col justify-between gap-2">
                    <div>
                      <span className="font-bold text-orange-300 text-xs block mb-1">📋 무기고 병참 지원금 수령</span>
                      <p className="text-[11px] text-gray-400">
                        우주 군수사령부의 공식 라이선스 지원금을 수령하여 화기 개조와 은하계 탐사 자금을 확충합니다.
                      </p>
                      <span className="text-[10px] text-orange-400 font-mono block mt-1">+320,000 ₩, +450 ⬡, +150 ◈ 퀵실버</span>
                    </div>
                    <button
                      onClick={() => game.claimArmoryMunitionsGrant()}
                      disabled={game.data.combatWeapons.grantClaimed}
                      className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                        game.data.combatWeapons.grantClaimed
                          ? 'bg-orange-950/60 text-orange-400 border border-orange-400/40 cursor-default'
                          : 'bg-orange-600 hover:bg-orange-500 text-white cursor-pointer shadow-md'
                      }`}
                    >
                      {game.data.combatWeapons.grantClaimed ? '지원금 수령 완료 ✓' : '병참 지원금 수령'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 13. ORBITAL SPACE STATION & GUILDS */}
          {activeModal === 'station' && (
            <div className="space-y-3">
              <div className="p-4 bg-cyan-950/40 rounded-xl border border-cyan-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🛸</span>
                  <div>
                    <span className="text-sm font-bold text-white block">궤도 우주 정거장 허브 (Space Station)</span>
                    <span className="text-[10px] text-cyan-300">성간 무역 터미널, 3대 길드 의뢰 및 함선 개조</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.units += 250000;
                    game.data.nanites += 300;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("🏛️ 정거장 무역 및 길드 보상 정산 (+250,000 ₩, +300 ⬡)", undefined, undefined, '#facc15');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  무역 거래 & 보상 수령
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">함선 S-Class 승급</span>
                    <span className="text-[9px] text-gray-400">쉴드 360 & 워프 사거리 극대화</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.shipClass = 'S';
                      game.data.maxShield = 360;
                      game.data.shield = 360;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("⭐ 함선 S-Class 최종 승급 완료 (쉴드 360)!", undefined, undefined, '#10b981');
                    }}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded text-[10px]"
                  >
                    승급
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">화물 슬롯 +1 확장</span>
                    <span className="text-[9px] text-gray-400">수용량 영구 증설</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.inv.ferrite = (game.data.inv.ferrite || 0) + 100;
                      AudioSys.playRecharge();
                      game.spawnFloatText("📦 화물 적재 모듈 확장 완료!", undefined, undefined, '#00e5ff');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    확장
                  </button>
                </div>
              </div>

              {/* Station Galactic Trade Terminal Table (v2) */}
              <div className="p-3 bg-black/60 rounded-xl border border-cyan-500/30 flex flex-col gap-2">
                <div className="flex justify-between items-center border-b border-white/10 pb-1.5">
                  <span className="text-xs font-bold text-cyan-300 font-mono">🏛️ 성간 무역 시세 (Galactic Trade Terminal)</span>
                  <span className="text-[9px] text-gray-400">실시간 변동 시세</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-900/80 rounded-lg border border-white/5 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block text-[11px]">배선 직물 (Wiring Loom)</span>
                      <span className="text-[9px] text-gray-400">단가: 25,000 ₩</span>
                    </div>
                    <span className="price-delta-badge price-surge">+24.8% 급등</span>
                  </div>
                  <div className="p-2 bg-slate-900/80 rounded-lg border border-white/5 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white block text-[11px]">마이크로프로세서</span>
                      <span className="text-[9px] text-gray-400">단가: 19,000 ₩</span>
                    </div>
                    <span className="price-delta-badge price-drop">-18.2% 하락</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 14. COLOSSAL SANDWORM & EMERGENCE BURROWS */}
          {activeModal === 'sandworm' && (
            <div className="space-y-3">
              <div className="p-4 bg-yellow-950/40 rounded-xl border border-yellow-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🪱</span>
                  <div>
                    <span className="text-sm font-bold text-white block">행성 거대 샌드웜 타이탄 (Colossal Sandworm)</span>
                    <span className="text-[10px] text-yellow-300">모래벌레 피리 소환, 둥지 정화 및 비행 샌드웜 탑승</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.nanites += 650;
                    game.data.units += 350000;
                    if (game.data.sandworm) {
                      game.data.sandworm.materials.cursedDust += 35;
                      game.data.sandworm.wormsSummoned++;
                    }
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("🪱 모래벌레 피리 공명 // 샌드웜 지진 도약 발생! (+650 ⬡, +350,000 ₩, 먼지 +35)", undefined, undefined, '#facc15');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-black font-extrabold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🪱 모래벌레 피리 연주
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">갈망의 촉수 절단</span>
                    <span className="text-[9px] text-gray-400">둥지 정화 및 사악한 자손 +2</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.nanites += 450;
                      AudioSys.playBoltcaster();
                      game.spawnFloatText("🗡️ 갈망의 촉수 절단 완료 (+450 ⬡)", undefined, undefined, '#ef4444');
                    }}
                    className="px-2.5 py-1 bg-red-700 text-white rounded text-[10px] font-bold"
                  >
                    절단
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">비행 샌드웜 탑승</span>
                    <span className="text-[9px] text-gray-400">초고속 대기권 활공</span>
                  </div>
                  <button
                    onClick={() => {
                      AudioSys.playPulseDrive();
                      game.spawnFloatText("🦅 거대 비행 샌드웜 탑승 활공 활성화!", undefined, undefined, '#22d3ee');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    탑승
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 15. BASE COMPUTER & POWER GRID */}
          {activeModal === 'base-computer' && (
            <div className="space-y-3">
              <div className="p-4 bg-teal-950/40 rounded-xl border border-teal-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏠</span>
                  <div>
                    <span className="text-sm font-bold text-white block">행성 기지 등록 관리 & 전력망</span>
                    <span className="text-[10px] text-teal-300">발전량: 250 kW | 배터리: 100,000 kF 완충</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.inv.pureFerrite = (game.data.inv.pureFerrite || 0) + 250;
                    game.data.inv.oxygen = (game.data.inv.oxygen || 0) + 180;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("📦 기지 추출 자원 일괄 수거 완료! (페라이트 +250, 산소 +180)", undefined, undefined, '#10b981');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  📦 추출 자원 일괄 수거
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">전력망 과급 부스트</span>
                    <span className="text-[9px] text-gray-400">발전량 +100 kW 과급</span>
                  </div>
                  <button
                    onClick={() => {
                      AudioSys.playRecharge();
                      game.spawnFloatText("⚡ 기지 전력망 과급 부스트 가동 완료!", undefined, undefined, '#facc15');
                    }}
                    className="px-2.5 py-1 bg-amber-600 text-black font-bold rounded text-[10px]"
                  >
                    과급
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">기지 아카이브 해독</span>
                    <span className="text-[9px] text-gray-400">여행자 잔류 데이터 복원</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.nanites += 450;
                      game.data.units += 250000;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("📜 아카이브 해독 완료 (+450 ⬡, +250,000 ₩)", undefined, undefined, '#00e5ff');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    해독
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 16. ABANDONED RESEARCH BUILDING & BIOLOGICAL HORRORS */}
          {activeModal === 'abandoned-building' && (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">☣️</span>
                  <div>
                    <span className="text-sm font-bold text-white block">버려진 연구 시설 & 속삭이는 알</span>
                    <span className="text-[10px] text-emerald-300">유충 코어 채취, 생물학적 공포 격퇴 및 오염 정제</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (game.data.abandonedBuilding) {
                      game.data.abandonedBuilding.larvalCores++;
                    }
                    AudioSys.playNote(220, 'triangle', 0.1);
                    AudioSys.playWarning();
                    game.spawnFloatText("🥚 속삭이는 알 파괴: 유충 코어 +1 획득! (공포 군집 출현!)", undefined, undefined, '#ef4444');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🥚 속삭이는 알 파괴
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">생물학적 공포 소탕</span>
                    <span className="text-[9px] text-gray-400">군집 박멸 보상금</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.nanites += 550;
                      game.data.units += 380000;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("💥 생물학적 공포 소탕 완료! (+550 ⬡, +380,000 ₩)", undefined, undefined, '#10b981');
                    }}
                    className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[10px] font-bold"
                  >
                    소탕
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">유충 코어 나노로봇 정제</span>
                    <span className="text-[9px] text-gray-400">코어 1개 ➔ +50 ⬡</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.nanites += 250;
                      AudioSys.playRecharge();
                      game.spawnFloatText("🧪 유충 코어 정제 완료 (+250 ⬡ 나노로봇)", undefined, undefined, '#00e5ff');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    정제
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 17. ARCHAEOLOGY ANCIENT BONES & SALVAGED SCRAP */}
          {activeModal === 'archaeology' && (
            <div className="space-y-3">
              <div className="p-4 bg-amber-950/40 rounded-xl border border-amber-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🦴</span>
                  <div>
                    <span className="text-sm font-bold text-white block">고고학 고대 뼈 발굴 & 위성 고철</span>
                    <span className="text-[10px] text-amber-300">125.4 MYR 고대 골격 화석, 추락 위성 인양 및 학회 기증</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const units = 850000;
                    game.data.units += units;
                    game.data.nanites += 350;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText(`🦴 희귀 고대 뼈 발굴 성공! (+${units.toLocaleString()} ₩, +350 ⬡)`, undefined, undefined, '#facc15');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-black font-extrabold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  ⛏️ 지층 굴착 및 화석 발굴
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">추락 위성 고철 인양</span>
                    <span className="text-[9px] text-gray-400">색층 금속 +80 및 나노로봇</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.units += 450000;
                      game.data.nanites += 400;
                      game.data.inv.chromaticMetal = (game.data.inv.chromaticMetal || 0) + 80;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("🛰️ 인공위성 고철 인양 완료 (+450,000 ₩, +400 ⬡)", undefined, undefined, '#00e5ff');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    인양
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">고생물학 학회 기증</span>
                    <span className="text-[9px] text-gray-400">수은 +150 및 나노로봇 x2</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.quicksilver = (game.data.quicksilver || 0) + 150;
                      game.data.nanites += 500;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("🏛️ 학회 박물관 기증 완료 (+500 ⬡, +150 ◈)", undefined, undefined, '#10b981');
                    }}
                    className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[10px] font-bold"
                  >
                    기증
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 18. SPECIALIST TERMINALS & COLOSSUS 8-WHEEL JUGGERNAUT */}
          {activeModal === 'specialist-terminals' && (
            <div className="space-y-3">
              <div className="p-4 bg-cyan-950/40 rounded-xl border border-cyan-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🚜</span>
                  <div>
                    <span className="text-sm font-bold text-white block">콜로서스 8륜 채광 장갑차 (Colossus)</span>
                    <span className="text-[10px] text-cyan-300">42슬롯 대용량 적재함 & 메가 보링 광역 채광 레이저</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (game.data.colossus) {
                      game.data.colossus.mounted = !game.data.colossus.mounted;
                    }
                    AudioSys.playPulseDrive();
                    game.spawnFloatText("🚜 콜로서스 8륜 초대형 채광차 소환 및 탑승 완료!", undefined, undefined, '#f59e0b');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-black font-extrabold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🚜 콜로서스 소환/탑승
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">메가 보링 레이저 채광</span>
                    <span className="text-[9px] text-gray-400">광역 지맥 대량 절삭</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.inv.ferrite = (game.data.inv.ferrite || 0) + 120;
                      game.data.inv.silicate = (game.data.inv.silicate || 0) + 80;
                      AudioSys.playRecharge();
                      game.spawnFloatText("⚡ 메가 보어 채광 완료 (+120 페라이트, +80 규산염)", undefined, undefined, '#facc15');
                    }}
                    className="px-2.5 py-1 bg-yellow-600 text-black font-bold rounded text-[10px]"
                  >
                    채광
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">5대 전문가 연구 기금</span>
                    <span className="text-[9px] text-gray-400">감독관/과학/무기/농경 배당금</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.units += 450000;
                      game.data.nanites += 400;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("🏛️ 5대 전문가 연구 기금 정산 (+450,000 ₩, +400 ⬡)", undefined, undefined, '#10b981');
                    }}
                    className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[10px] font-bold"
                  >
                    수령
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 19. PIRATE DREADNOUGHT FLAGSHIP */}
          {activeModal === 'pirate-flagship' && (
            <div className="space-y-3">
              <div className="p-4 bg-red-950/40 rounded-xl border border-red-500 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏴‍☠️</span>
                  <div>
                    <span className="text-sm font-bold text-white block">해적 드레드노트 기함 '크림슨 리바이어던'</span>
                    <span className="text-[10px] text-red-300">나포된 S-Class 650u 초대형 기함 & 8문 대함 터렛</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    AudioSys.playNote(150, 'sawtooth', 0.3, 0.5);
                    AudioSys.playNote(220, 'square', 0.2, 0.4);
                    game.spawnFloatText("⚡ 드레드노트 8문 헤비 터렛 궤도 폭격 발사! (350 관통 피해)", undefined, undefined, '#ef4444');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  ⚡ 궤도 폭격 일제 사격
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">암시장 해적 조공 수거</span>
                    <span className="text-[9px] text-gray-400">무법자 5개 성계 상납금</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.units += 850000;
                      game.data.nanites += 700;
                      game.data.quicksilver = (game.data.quicksilver || 0) + 150;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("💰 해적 기함 조공 정산 (+850,000 ₩, +700 ⬡, +150 ◈)", undefined, undefined, '#facc15');
                    }}
                    className="px-2.5 py-1 bg-amber-600 text-black font-bold rounded text-[10px]"
                  >
                    수거
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">늑대무리 편대 약탈 출격</span>
                    <span className="text-[9px] text-gray-400">상선 선단 노획품 전량 수령</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.units += 600000;
                      game.data.nanites += 500;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("🐺 늑대무리 편대 약탈 성공 (+600,000 ₩, +500 ⬡)", undefined, undefined, '#c084fc');
                    }}
                    className="px-2.5 py-1 bg-purple-700 text-white rounded text-[10px] font-bold"
                  >
                    출격
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 20. LARGE 3-SLOT REFINER ALCHEMY */}
          {activeModal === 'large-refiner' && (
            <div className="space-y-3">
              <div className="p-4 bg-amber-950/40 rounded-xl border border-amber-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⚗️</span>
                  <div>
                    <span className="text-sm font-bold text-white block">대형 3슬롯 정제기 & 연금술 연구소</span>
                    <span className="text-[10px] text-amber-300">산소 촉매 무한 증식 루프 & 양자 화학 정제</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.units += 1200000;
                    AudioSys.playRecharge();
                    game.spawnFloatText("⚗️ 3-슬롯 정제 연금술 실행: 염소 6배 증식 성공 (+1,200,000 ₩)!", undefined, undefined, '#facc15');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-extrabold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  ⚗️ 3원소 정제 연금술 가동
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">농축 탄소 무한 순환</span>
                    <span className="text-[9px] text-gray-400">산소 촉매 6배 증식</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.inv.condensedCarbon = (game.data.inv.condensedCarbon || 0) + 240;
                      AudioSys.playRecharge();
                      game.spawnFloatText("🌱 농축 탄소 240개 증식 완료!", undefined, undefined, '#10b981');
                    }}
                    className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[10px] font-bold"
                  >
                    증식
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">양자 촉매 오버클럭</span>
                    <span className="text-[9px] text-gray-400">정제 수율 1.5배 과급</span>
                  </div>
                  <button
                    onClick={() => {
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("⚡ 양자 정제 촉매 과급 활성화 (수율 150%)!", undefined, undefined, '#38bdf8');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    과급
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 21. ATLANTID MULTI-TOOL & RUNIC ALTAR */}
          {activeModal === 'atlantid-tool' && (
            <div className="space-y-3">
              <div className="p-4 bg-purple-950/40 rounded-xl border border-purple-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🔮</span>
                  <div>
                    <span className="text-sm font-bold text-white block">코르박스 룬 제단 & 아틀란티드 멀티툴</span>
                    <span className="text-[10px] text-purple-300">일체형 룬 렌즈 채광 2.5배 가속 및 380 DPS 화력</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.nanites += 850;
                    game.data.toolMode = 'VOLTAIC STAFF';
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("🔮 S-Class 아틀란티드 멀티툴 각성 및 장착! (+850 ⬡ 나노로봇)", undefined, undefined, '#c084fc');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🔮 아틀란티드 도구 각성
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">룬 렌즈 공명 파동 방출</span>
                    <span className="text-[9px] text-gray-400">광역 자원 일괄 원격 채취</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.inv.pureFerrite = (game.data.inv.pureFerrite || 0) + 200;
                      game.data.inv.atlantideum = (game.data.inv.atlantideum || 0) + 80;
                      AudioSys.playRecharge();
                      game.spawnFloatText("⚡ 룬 렌즈 공명 수확 (순수페라이트 +200, 아틀란티디움 +80)", undefined, undefined, '#22d3ee');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    공명
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">보이드 아카이브 해독</span>
                    <span className="text-[9px] text-gray-400">코르박스 프라임 기록 복원</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.units += 650000;
                      game.data.nanites += 500;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("📜 보이드 아카이브 해독 완료 (+650,000 ₩, +500 ⬡)", undefined, undefined, '#facc15');
                    }}
                    className="px-2.5 py-1 bg-amber-600 text-black font-bold rounded text-[10px]"
                  >
                    해독
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 22. LIVESTOCK RANCHING & CREATURE HARVESTER */}
          {activeModal === 'livestock-ranch' && (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🥛</span>
                  <div>
                    <span className="text-sm font-bold text-white block">외계 생물 목장 & 가축 수확기</span>
                    <span className="text-[10px] text-emerald-300">12마리 외계 가축 무리, 신선한 우유 12병, 거대 알 15개 적재</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.units += 380000;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("🥛 가축 생산물 전량 수확 완료! (우유, 알, 꿀 +380,000 ₩)", undefined, undefined, '#10b981');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🥛 가축 생산물 일괄 수확
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">생물 펠릿 추가 급여</span>
                    <span className="text-[9px] text-gray-400">착유 주기 1.5배 가속</span>
                  </div>
                  <button
                    onClick={() => {
                      AudioSys.playRecharge();
                      game.spawnFloatText("🌾 생물 펠릿 급여 완료 (가축 만족도 100%)", undefined, undefined, '#4ade80');
                    }}
                    className="px-2.5 py-1 bg-green-700 text-white rounded text-[10px] font-bold"
                  >
                    급여
                  </button>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">특선 유제품 조리 납품</span>
                    <span className="text-[9px] text-gray-400">미식가 길드 최고가 매각</span>
                  </div>
                  <button
                    onClick={() => {
                      game.data.units += 680000;
                      game.data.nanites += 400;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("👨‍🍳 미식 유제품 디저트 납품 완료 (+680,000 ₩, +400 ⬡)", undefined, undefined, '#facc15');
                    }}
                    className="px-2.5 py-1 bg-amber-600 text-black font-bold rounded text-[10px]"
                  >
                    납품
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 23. JOURNEY MILESTONES & TITLES */}
          {activeModal === 'milestones' && (
            <div className="space-y-3">
              <div className="p-4 bg-yellow-950/40 rounded-xl border border-yellow-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏆</span>
                  <div>
                    <span className="text-sm font-bold text-white block">은하계 여행자 10대 핵심 이정표</span>
                    <span className="text-[10px] text-yellow-300">도보 탐사, 외계어, 자산 축적, 센티넬 퇴치 단계별 나노로봇 보상</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.nanites += 1500;
                    game.data.units += 500000;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("🏆 달성 이정표 일괄 수령 완료! (+1,500 ⬡, +500,000 ₩)", undefined, undefined, '#facc15');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-500 text-black font-extrabold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🏆 보상 일괄 수령 (+1,500 ⬡)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { name: '도보 탐사 거리', rank: 'RANK 8 // 초성간 도보자', icon: '👟', desc: '12,500m 누적 보행 주파' },
                  { name: '외계어 어휘 습득', rank: 'RANK 6 // 언어학 권위자', icon: '📜', desc: '35개 외계 3대 지성체 단어' },
                  { name: '누적 자산 축적', rank: 'RANK 7 // 억만장자', icon: '💎', desc: '4,500,000 ¤ 유닛 축적' },
                  { name: '센티넬 드론 파괴', rank: 'RANK 6 // 기계 학살자', icon: '⚙️', desc: '28기 센티넬 요격 파괴' }
                ].map((ms, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{ms.icon}</span>
                      <div>
                        <span className="font-bold text-white text-xs block">{ms.name}</span>
                        <span className="text-[9px] text-yellow-400 font-bold">{ms.rank}</span>
                        <span className="text-[9px] text-gray-400 block">{ms.desc}</span>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-bold text-xs whitespace-nowrap">✓ 달성</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 24. EXOSUIT ENVIRONMENTAL HAZARD PROTECTION */}
          {activeModal === 'hazard-protection' && (
            <div className="space-y-3">
              <div className="p-4 bg-amber-950/40 rounded-xl border border-amber-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🛡️</span>
                  <div>
                    <span className="text-sm font-bold text-white block">엑소슈트 4대 극한 환경 보호 모듈</span>
                    <span className="text-[10px] text-amber-300">혹한, 극열, 독성, 방사능 4대 특수 실드 과급 충전</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.rechargeHazard();
                    game.data.hazard = 100;
                    AudioSys.playRecharge();
                    game.spawnFloatText("🛡️ 전 환경 방호 실드 100% 완전 충전 완료!", undefined, undefined, '#10b981');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-black font-extrabold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  ⚡ 전 실드 일괄 완충
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { name: '❄️ 열 분산 장치 (Cold)', desc: '혹한/눈보라 동결 완벽 차단', color: 'border-cyan-400 text-cyan-300' },
                  { name: '🔥 냉각 네트워크 (Heat)', desc: '극열/화염 폭풍 열기 분산', color: 'border-amber-400 text-amber-300' },
                  { name: '🧪 독성 억제기 (Toxic)', desc: '산성비/부식성 포자 중화', color: 'border-emerald-400 text-emerald-300' },
                  { name: '☢️ 방사능 편향기 (Radiation)', desc: '감마선/방사성 낙진 편향', color: 'border-purple-400 text-purple-300' }
                ].map((sh, idx) => (
                  <div key={idx} className={`p-3 bg-slate-900 rounded-xl border ${sh.color} flex justify-between items-center`}>
                    <div>
                      <span className="font-bold text-xs block">{sh.name}</span>
                      <span className="text-[9px] text-gray-400">{sh.desc}</span>
                    </div>
                    <span className="text-emerald-400 font-bold text-xs">100%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 25. MULTI-TOOL SALVAGE & EXPANSION */}
          {activeModal === 'multi-tool-salvage' && (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🔧</span>
                  <div>
                    <span className="text-sm font-bold text-white block">다목적 도구 고철 분해 & 슬롯 확장</span>
                    <span className="text-[10px] text-emerald-300">현재 슬롯: 34 / 60 | 확장 모듈 3개 보유</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.units += 450000;
                    game.data.nanites += 350;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("💥 예비 멀티툴 고철 분해 완료! (+450,000 ₩, +350 ⬡, 확장 모듈 +1)", undefined, undefined, '#10b981');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  💥 도구 분해 인양
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">확장 모듈 무료 적용</span>
                    <span className="text-[9px] text-gray-400">슬롯 +1 칸 영구 증설</span>
                  </div>
                  <button
                    onClick={() => {
                      AudioSys.playRecharge();
                      game.spawnFloatText("👝 멀티툴 슬롯 +1칸 확장 적용 완료!", undefined, undefined, '#00e5ff');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    적용
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white block">멀티툴 S-Class 승급</span>
                    <span className="text-[9px] text-gray-400">화력 +40% 및 과급 4개</span>
                  </div>
                  <button
                    onClick={() => {
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("⭐ 멀티툴 S-Class 승급 완료!", undefined, undefined, '#facc15');
                    }}
                    className="px-2.5 py-1 bg-amber-600 text-black font-bold rounded text-[10px]"
                  >
                    승급
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 26. CARTOGRAPHER & PLANETARY CHARTS */}
          {activeModal === 'cartographer' && (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🗺️</span>
                  <div>
                    <span className="text-sm font-bold text-white block">우주정거장 지도제작자 & 5대 행성 차트</span>
                    <span className="text-[10px] text-emerald-300">항법 데이터로 난파선, 유적, 교역소, 보안시설 정밀 탐측</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("🗺️ 긴급 조난 신호 차트 해독: 난파선 및 추락 화물선 좌표 포착!", undefined, undefined, '#00e5ff');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  📍 조난 차트 좌표 해독
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { name: '🚨 긴급 조난 차트', desc: '난파선 & 화물선' },
                  { name: '🏢 상업 정착지 차트', desc: '대형 교역소 & 아카이브' },
                  { name: '🔮 고대 유적 차트', desc: '외계 모놀리스 & 포탈' },
                  { name: '🏭 보안 시설 차트', desc: '제조공장 & 센티넬 기둥' },
                  { name: '🏘️ 정착지 허가 차트', desc: '미개척 총독 집무실' }
                ].map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      AudioSys.playNote(480, 'sine', 0.1);
                      game.spawnFloatText(`📍 [${c.name}] 좌표 정밀 스캔 완료!`, undefined, undefined, '#38bdf8');
                    }}
                    className="p-2.5 bg-slate-900 border border-white/10 hover:border-emerald-400 rounded-xl text-left cursor-pointer"
                  >
                    <span className="font-bold text-white block text-xs">{c.name}</span>
                    <span className="text-[9px] text-gray-400">{c.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 27. EXOSUIT UPGRADE & DROP POD */}
          {activeModal === 'exosuit-upgrade' && (
            <div className="space-y-3">
              <div className="p-4 bg-blue-950/40 rounded-xl border border-blue-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👕</span>
                  <div>
                    <span className="text-sm font-bold text-white block">엑소슈트 홀로그램 슬롯 증설 & 드롭 포드</span>
                    <span className="text-[10px] text-blue-300">화물 48/120 슬롯 | 기술 24/60 슬롯</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("💎 엑소슈트 화물 슬롯 +1칸 증설 완료!", undefined, undefined, '#38bdf8');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  📦 화물 슬롯 증설
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>⚡ 기술 슬롯 +1 확장</span>
                  <button
                    onClick={() => {
                      AudioSys.playRecharge();
                      game.spawnFloatText("⚡ 엑소슈트 기술 슬롯 +1칸 확장 완료!", undefined, undefined, '#a855f7');
                    }}
                    className="px-2.5 py-1 bg-purple-700 text-white rounded text-[10px] font-bold"
                  >
                    확장
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>🪂 드롭 포드 3대 부품 수리</span>
                  <button
                    onClick={() => {
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("🎉 드롭 포드 수리 완료 // +1 무상 슬롯 획득!", undefined, undefined, '#10b981');
                    }}
                    className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[10px] font-bold"
                  >
                    수리
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 28. GUILD ENVOY BOOTH */}
          {activeModal === 'guild-envoy' && (
            <div className="space-y-3">
              <div className="p-4 bg-yellow-950/40 rounded-xl border border-yellow-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎖️</span>
                  <div>
                    <span className="text-sm font-bold text-white block">우주정거장 3대 길드 사절단 부스</span>
                    <span className="text-[10px] text-yellow-300">상인 길드, 용병 길드, 탐험가 길드 무료 보급품</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.units += 250000;
                    game.data.nanites += 300;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("🎁 3대 길드 사절단 무료 보급품 수령 완료 (+250,000 ₩, +300 ⬡)!", undefined, undefined, '#facc15');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-500 text-black font-extrabold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🎁 길드 보급품 수령
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { name: '⚖️ 상인 길드 (Merchants)', perk: '무역품 기부 및 확장권 수령' },
                  { name: '⚔️ 용병 길드 (Mercenaries)', perk: '센티넬 부품 기부 및 무기 확장' },
                  { name: '🔭 탐험가 길드 (Explorers)', perk: '발견 데이터 기부 및 워프 코어' }
                ].map((g, idx) => (
                  <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-white/10 flex flex-col justify-between gap-1">
                    <span className="font-bold text-white text-xs">{g.name}</span>
                    <span className="text-[9px] text-gray-400">{g.perk}</span>
                    <span className="text-[10px] text-yellow-400 font-bold mt-1">RANK 3 [JOURNEYMAN]</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 29. GALACTIC CORE SINGULARITY */}
          {activeModal === 'galactic-core' && (
            <div className="space-y-3">
              <div className="p-4 bg-indigo-950/40 rounded-xl border border-indigo-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌌</span>
                  <div>
                    <span className="text-sm font-bold text-white block">은하 중심 초공간 특이점 & 4대 다중 은하</span>
                    <span className="text-[10px] text-indigo-300">유클리드, 힐베르트, 칼립소, 아이센탐 차원 도약</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.units += 1500000;
                    game.data.nanites += 2000;
                    AudioSys.playWarp();
                    game.spawnFloatText("🌌 은하 중심 아틀라스 시뮬레이션 각성 완료 (+1,500,000 ₩, +2,000 ⬡)!", undefined, undefined, '#c084fc');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🌌 아틀라스 각성
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { name: '🌍 1. 유클리드 은하', desc: '균형의 우주 // 무역 마진 +20%' },
                  { name: '🔮 2. 힐베르트 차원', desc: '비전의 우주 // 고대 유물 +35%' },
                  { name: '🔥 3. 칼립소 은하', desc: '격노의 우주 // 폭풍 결정 2배' },
                  { name: '🏝️ 4. 아이센탐 은하', desc: '영원한 낙원 // 파라다이스 행성' }
                ].map((gal, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      AudioSys.playWarp();
                      game.spawnFloatText(`🌌 차원 전송 완료: [${gal.name}] 진입!`, undefined, undefined, '#a855f7');
                    }}
                    className="p-3 bg-slate-900 border border-white/10 hover:border-indigo-400 rounded-xl text-left cursor-pointer"
                  >
                    <span className="font-bold text-white block text-xs">{gal.name}</span>
                    <span className="text-[9px] text-cyan-300">{gal.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 30. STARSHIP COMBAT WEAPONS */}
          {activeModal === 'starship-weapons' && (
            <div className="space-y-3">
              <div className="p-4 bg-sky-950/40 rounded-xl border border-sky-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🚀</span>
                  <div>
                    <span className="text-sm font-bold text-white block">스타쉽 5대 첨단 전투 무장 시스템</span>
                    <span className="text-[10px] text-sky-300">비행 중 [G] 키로 즉시 무기 전환 가능</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { name: '포톤 캐논 (Photon Cannon)', desc: '2연장 고속 플라즈마 에너지 볼트 (25 DMG)' },
                  { name: '인프라-나이프 가속기 (Infra-Knife)', desc: '3연장 운동 에너지 게틀링 난사 (38 DMG)' },
                  { name: '포지트론 이젝터 (Positron Ejector)', desc: '6발 반물질 산탄 근접 격발 (18x6 DMG)' },
                  { name: '사이클로트론 발리스타 (Cyclotron)', desc: 'EMP 전자기 소용돌이 구체 마비 (65 DMG)' },
                  { name: '로켓 런처 (Rocket Launcher)', desc: '대형 고폭탄두 일격 파괴 (160 DMG)' }
                ].map((sw, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      AudioSys.playPhotonCannon();
                      game.spawnFloatText(`🚀 스타쉽 무장 장착: [${sw.name.split(' (')[0]}]!`, undefined, undefined, '#38bdf8');
                      handleClose();
                    }}
                    className="p-3 bg-slate-900 border border-white/10 hover:border-sky-400 rounded-xl text-left cursor-pointer"
                  >
                    <span className="font-bold text-white block text-xs">{sw.name}</span>
                    <span className="text-[9px] text-gray-400">{sw.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 31. FLOATING SKY ISLANDS */}
          {activeModal === 'floating-islands' && (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏝️</span>
                  <div>
                    <span className="text-sm font-bold text-white block">천공의 부유 섬 & 폭포 피난처</span>
                    <span className="text-[10px] text-emerald-300">성층권 1,420u 고고도 대륙 // 안개 수액 채취 및 무중력 다이브</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.units += 550000;
                    game.data.nanites += 600;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("🪂 천공 섬 무중력 절벽 다이브 성공 (+550,000 ₩, +600 ⬡)!", undefined, undefined, '#10b981');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🪂 절벽 다이브 감행
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>💧 증류 안개 수액 채취</span>
                  <button
                    onClick={() => {
                      game.data.units += 320000;
                      AudioSys.playRecharge();
                      game.spawnFloatText("💧 증류 안개 수액 채취 완료 (+320,000 ₩)!", undefined, undefined, '#38bdf8');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    채취
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>🌸 천공 발광 꽃 꿀 수확</span>
                  <button
                    onClick={() => {
                      game.data.units += 450000;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("🌸 천공 꽃 꿀 수확 완료 (+450,000 ₩)!", undefined, undefined, '#facc15');
                    }}
                    className="px-2.5 py-1 bg-amber-600 text-black font-bold rounded text-[10px]"
                  >
                    수확
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 32. BOUNDARY FAILURE & THE CURSED */}
          {activeModal === 'boundary-failure' && (
            <div className="space-y-3">
              <div className="p-4 bg-violet-950/40 rounded-xl border border-violet-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🔮</span>
                  <div>
                    <span className="text-sm font-bold text-white block">차원 경계 붕괴 & 고대 엘릭서 연금술</span>
                    <span className="text-[10px] text-violet-300">80m 거대 경계 고리 // 텔라몬 기록 해독 및 유령 토벌</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.units += 450000;
                    game.data.nanites += 650;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("👻 차원 균열 유령 괴수 토벌 성공 (+450,000 ₩, +650 ⬡, 저주받은 가루 +45)!", undefined, undefined, '#d946ef');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  👻 유령 괴수 토벌
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>🩸 피의 엘릭서 양조</span>
                  <button
                    onClick={() => {
                      game.data.units += 350000;
                      game.data.nanites += 300;
                      AudioSys.playRecharge();
                      game.spawnFloatText("🩸 피의 엘릭서 양조 완료 (변칙 억제도 +60%)!", undefined, undefined, '#ef4444');
                    }}
                    className="px-2.5 py-1 bg-red-700 text-white rounded text-[10px] font-bold"
                  >
                    양조
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>✨ 차원 왜곡장 보정</span>
                  <button
                    onClick={() => {
                      game.data.nanites += 500;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("✨ 차원장 보정 완료 (+500 ⬡ 나노로봇)!", undefined, undefined, '#c084fc');
                    }}
                    className="px-2.5 py-1 bg-purple-700 text-white rounded text-[10px] font-bold"
                  >
                    보정
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 33. ABYSSAL HORROR & SUNKEN RUINS */}
          {activeModal === 'abyssal-horror' && (
            <div className="space-y-3">
              <div className="p-4 bg-cyan-950/40 rounded-xl border border-cyan-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌊</span>
                  <div>
                    <span className="text-sm font-bold text-white block">심해 해저 유적 & 매혹적인 조개</span>
                    <span className="text-[10px] text-cyan-300">살아있는 진주 채취, 심해 공포 토벌 및 삼지창 유물 발굴</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.units += 720000;
                    game.data.nanites += 300;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("🔱 침몰한 해저 유적 삼지창 금고 발굴 완료 (+720,000 ₩, +300 ⬡)!", undefined, undefined, '#38bdf8');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🔱 해저 유적 발굴
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>🦪 살아있는 진주 채취</span>
                  <button
                    onClick={() => {
                      game.data.units += 480000;
                      AudioSys.playRecharge();
                      game.spawnFloatText("🦪 살아있는 진주 채취 (+480,000 ₩)!", undefined, undefined, '#22d3ee');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    채취
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>⚔️ 심해 공포 요격</span>
                  <button
                    onClick={() => {
                      game.data.nanites += 750;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("⚔️ 심해 공포 요격 격퇴! (+750 ⬡, 최면의 눈 +1)", undefined, undefined, '#f43f5e');
                    }}
                    className="px-2.5 py-1 bg-red-700 text-white rounded text-[10px] font-bold"
                  >
                    요격
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 34. LIVING SHIP STARBIRTH */}
          {activeModal === 'living-ship' && (
            <div className="space-y-3">
              <div className="p-4 bg-rose-950/40 rounded-xl border border-rose-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌱</span>
                  <div>
                    <span className="text-sm font-bold text-white block">생체 우주선 스타버스 & 장기 배양</span>
                    <span className="text-[10px] text-rose-300">보이드 에그 각성 // 4대 핵심 생체 장기 배양</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.shipType = 'LIVING';
                    game.data.maxShield = 280;
                    game.data.shield = 280;
                    game.data.units += 600000;
                    game.data.nanites += 800;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("🌱 S-Class 유기체 생체함선 탑승 완료 (+600,000 ₩, +800 ⬡)!", undefined, undefined, '#f43f5e');
                    handleClose();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🌱 생체함선 탑승
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>💓 파동 심장 배양 성숙</span>
                  <button
                    onClick={() => {
                      game.data.units += 380000;
                      AudioSys.playRecharge();
                      game.spawnFloatText("💓 파동 심장 성숙 완료 (+380,000 ₩)!", undefined, undefined, '#fb7185');
                    }}
                    className="px-2.5 py-1 bg-pink-700 text-white rounded text-[10px] font-bold"
                  >
                    배양
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>🛡️ 경화된 껍질 추가 배양</span>
                  <button
                    onClick={() => {
                      game.data.units += 420000;
                      AudioSys.playRecharge();
                      game.spawnFloatText("🛡️ 경화된 껍질 배양 완료 (+420,000 ₩)!", undefined, undefined, '#f59e0b');
                    }}
                    className="px-2.5 py-1 bg-amber-600 text-black font-bold rounded text-[10px]"
                  >
                    배양
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 35. DESOLATION: DEEP SPACE DERELICT FREIGHTER SALVAGE */}
          {activeModal === 'derelict-freighter' && (
            <div className="space-y-3">
              <div className="p-4 bg-amber-950/40 rounded-xl border border-amber-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">☠️</span>
                  <div>
                    <span className="text-sm font-bold text-white block">버려진 화물선 탐사 및 잔해 인양</span>
                    <span className="text-[10px] text-amber-300">MS-7 헤스페로스 // 극저온 진공 (-48.5°C) 격실 돌파</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.units += 500000;
                    game.data.nanites += 1200;
                    game.data.inv.cargoBulkhead = (game.data.inv.cargoBulkhead || 0) + 1;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("📦 중앙 메인프레임 화물 격벽 및 나노로봇 인양 완료! (+1,200 ⬡, +500,000 ₩)", undefined, undefined, '#facc15');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-black font-extrabold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  📦 화물 격벽 인양
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>선원 보관함 수색</span>
                  <button
                    onClick={() => {
                      game.data.taintedMetal = (game.data.taintedMetal || 0) + 80;
                      game.data.nanites += 200;
                      AudioSys.playRecharge();
                      game.spawnFloatText("📜 선원 기록 및 오염된 금속 +80 인양!", undefined, undefined, '#f59e0b');
                    }}
                    className="px-2.5 py-1 bg-amber-700 text-white rounded text-[10px] font-bold"
                  >
                    수색
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>보안 방어망 해킹</span>
                  <button
                    onClick={() => {
                      game.data.units += 100000;
                      game.data.nanites += 300;
                      AudioSys.playRecharge();
                      game.spawnFloatText("🛡️ 방어 터렛 해킹 완료 (+100,000 ₩, +300 ⬡)", undefined, undefined, '#38bdf8');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    해킹
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 36. EXTREME WEATHER & METEORS */}
          {activeModal === 'extreme-weather' && (
            <div className="space-y-3">
              <div className="p-4 bg-amber-950/40 rounded-xl border border-amber-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⚡</span>
                  <div>
                    <span className="text-sm font-bold text-white block">극한 기후 현상 및 대기 이상 관측 콘솔</span>
                    <span className="text-[10px] text-amber-300">중력 이상 폭풍, 유성우 폭격 및 플라즈마 낙뢰 제어</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.units += 120000;
                    game.data.nanites += 350;
                    game.data.quicksilver = (game.data.quicksilver || 0) + 150;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("☄️ 용융 운석 핵 정제 완료 (+120,000 ₩, +350 ⬡, +150 ◈)", undefined, undefined, '#f59e0b');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  ☄️ 운석 핵 정제
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>이온 억제 필드 가동</span>
                  <button
                    onClick={() => {
                      game.data.hazard = 100;
                      game.data.shield = game.data.maxShield;
                      AudioSys.playRecharge();
                      game.spawnFloatText("🛡️ 이온 억제 필드 가동: 환경 유해도 -80% 감소!", undefined, undefined, '#10b981');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    전개
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>중력 드라이브 동조</span>
                  <button
                    onClick={() => {
                      AudioSys.playPulseDrive();
                      game.spawnFloatText("🌀 중력 드라이브 동조: 제트팩 추진력 +150% 가속!", undefined, undefined, '#a855f7');
                    }}
                    className="px-2.5 py-1 bg-purple-700 text-white rounded text-[10px] font-bold"
                  >
                    동조
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 37. ACTIVE VOLCANO & BASALT */}
          {activeModal === 'volcano' && (
            <div className="space-y-3">
              <div className="p-4 bg-orange-950/40 rounded-xl border border-orange-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌋</span>
                  <div>
                    <span className="text-sm font-bold text-white block">칼데라 지열 발전소 & 바살트(Basalt) 정련소</span>
                    <span className="text-[10px] text-orange-300">480°C 초고온 지열 사이폰 및 마그마 코어 제련</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.inv.basalt = (game.data.inv.basalt || 0) + 150;
                    game.data.nanites += 350;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("🌋 바살트(현무암) 150개 채굴 및 기지 전력 충전 완료!", undefined, undefined, '#f97316');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  ⚡ 바살트 채굴 (+150 Ba)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>고열 전도성 합금 합성</span>
                  <button
                    onClick={() => {
                      game.data.units += 85000;
                      AudioSys.playRecharge();
                      game.spawnFloatText("💎 고열 전도성 합금 제작 (+85,000 ₩)!", undefined, undefined, '#fbbf24');
                    }}
                    className="px-2.5 py-1 bg-amber-600 text-black font-bold rounded text-[10px]"
                  >
                    합성
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>칼데라 긴급 감압 밸브</span>
                  <button
                    onClick={() => {
                      game.data.nanites += 40;
                      AudioSys.playRecharge();
                      game.spawnFloatText("🚨 칼데라 감압 완료 (지진 안정화)", undefined, undefined, '#38bdf8');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    감압
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 38. ABYSSAL KRAKEN & TROPHY AQUARIUM */}
          {activeModal === 'aquarium' && (
            <div className="space-y-3">
              <div className="p-4 bg-teal-950/40 rounded-xl border border-teal-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🦑</span>
                  <div>
                    <span className="text-sm font-bold text-white block">심해 크라켄 해구 탐사 & 트로피 수족관</span>
                    <span className="text-[10px] text-teal-300">수심 1,250m 잠수종 하강 // 발광 크릴 미끼 및 관람료 배당</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.units += 65000;
                    game.data.nanites += 120;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("⚓ 잠수종 1,250m 하강 완료! 최면의 눈 x3 인양 (+65,000 ₩, +120 ⬡)", undefined, undefined, '#22d3ee');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  ⚓ 잠수종 1,250m 하강
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>수족관 관람료 징수</span>
                  <button
                    onClick={() => {
                      game.data.units += 45000;
                      game.data.nanites += 180;
                      AudioSys.playRecharge();
                      game.spawnFloatText("🐠 수족관 배당금 수령 (+45,000 ₩, +180 ⬡)", undefined, undefined, '#c084fc');
                    }}
                    className="px-2.5 py-1 bg-purple-700 text-white rounded text-[10px] font-bold"
                  >
                    수령
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>해양학자 데이터 제출</span>
                  <button
                    onClick={() => {
                      game.data.units += 80000;
                      game.data.nanites += 320;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("🧬 코르박스 해양 조사 보고 완료 (+80,000 ₩, +320 ⬡)", undefined, undefined, '#38bdf8');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    제출
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 39. FREIGHTER EXTERIOR SPACEWALK */}
          {activeModal === 'spacewalk' && (
            <div className="space-y-3">
              <div className="p-4 bg-cyan-950/40 rounded-xl border border-cyan-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌌</span>
                  <div>
                    <span className="text-sm font-bold text-white block">화물선 외벽 캣워크 & 무중력 EVA 우주유영</span>
                    <span className="text-[10px] text-cyan-300">선체 외벽 보도교, 심우주 전파 천문대 및 진공 성간 집진기</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    AudioSys.playPulseDrive();
                    game.spawnFloatText("🚀 무중력 EVA 우주유영 개시 (300초간 제트팩 2배 체공)", undefined, undefined, '#00e5ff');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🚀 무중력 우주유영 개시
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>성간 먼지 집진 수거</span>
                  <button
                    onClick={() => {
                      game.data.inv.tritium = (game.data.inv.tritium || 0) + 250;
                      AudioSys.playRecharge();
                      game.spawnFloatText("☄️ 트리튬 +250 집진 수확 완료!", undefined, undefined, '#facc15');
                    }}
                    className="px-2.5 py-1 bg-yellow-600 text-black font-bold rounded text-[10px]"
                  >
                    수거
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>심우주 전파 스캔</span>
                  <button
                    onClick={() => {
                      game.data.units += 75000;
                      game.data.inv.warpCell = (game.data.inv.warpCell || 0) + 2;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("📡 심우주 성운 스캔 완료 (+75,000 ₩, 워프셀 +2)", undefined, undefined, '#c084fc');
                    }}
                    className="px-2.5 py-1 bg-purple-700 text-white rounded text-[10px] font-bold"
                  >
                    스캔
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 40. BIOLUMINESCENT SPORE GROVE */}
          {activeModal === 'bioluminescent-forest' && (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌌</span>
                  <div>
                    <span className="text-sm font-bold text-white block">생체 발광 포자 숲 & 에테르 하늘가오리</span>
                    <span className="text-[10px] text-emerald-300">형광 균류 포자목 군락 // 부유 에테르 가오리 교감</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.inv.oxygen = (game.data.inv.oxygen || 0) + 250;
                    game.data.inv.condensedCarbon = (game.data.inv.condensedCarbon || 0) + 180;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("✨ 생체 발광 포자 원액 채취 (+250 산소, +180 농축탄소)!", undefined, undefined, '#34d399');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  ✨ 포자 원액 채취
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>하늘가오리 비행 교감</span>
                  <button
                    onClick={() => {
                      game.data.hazard = 100;
                      AudioSys.playPulseDrive();
                      game.spawnFloatText("🕊️ 하늘가오리 교감 (300초 환경면역 & 제트팩 +60%)!", undefined, undefined, '#38bdf8');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    교감
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>식물학 도감 학명 등재</span>
                  <button
                    onClick={() => {
                      game.data.units += 85000;
                      game.data.nanites += 350;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("📖 식물학 도감 등재 완료 (+85,000 ₩, +350 ⬡)", undefined, undefined, '#f472b6');
                    }}
                    className="px-2.5 py-1 bg-pink-700 text-white rounded text-[10px] font-bold"
                  >
                    등재
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 41. EXOCRAFT RACE INITIATOR */}
          {activeModal === 'race-initiator' && (
            <div className="space-y-3">
              <div className="p-4 bg-yellow-950/40 rounded-xl border border-yellow-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🏁</span>
                  <div>
                    <span className="text-sm font-bold text-white block">엑소크래프트 레이스 트랙 스타터</span>
                    <span className="text-[10px] text-yellow-300">타임어택 서킷 아치 // 체크포인트 게이트 및 부스터 램프</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    AudioSys.playPulseDrive();
                    game.spawnFloatText("🏁 레이스 스타트! 300초간 엑소크래프트 속도 +80% 부스트 가동!", undefined, undefined, '#facc15');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-500 text-black font-extrabold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🏁 레이스 스타트
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>체크포인트 동기화</span>
                  <button
                    onClick={() => {
                      game.data.units += 65000;
                      game.data.nanites += 280;
                      AudioSys.playRecharge();
                      game.spawnFloatText("🎯 체크포인트 게이트 통과 보너스 (+65,000 ₩, +280 ⬡)", undefined, undefined, '#10b981');
                    }}
                    className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[10px] font-bold"
                  >
                    동기화
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>리그 랩타임 등재</span>
                  <button
                    onClick={() => {
                      game.data.units += 85000;
                      game.data.nanites += 350;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("🏆 서킷 신기록 등재 완료 (+85,000 ₩, +350 ⬡)", undefined, undefined, '#facc15');
                    }}
                    className="px-2.5 py-1 bg-yellow-600 text-black font-bold rounded text-[10px]"
                  >
                    등재
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 42. COLOSSAL TITAN BEETLE MOUNT */}
          {activeModal === 'titan-beetle' && (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🪲</span>
                  <div>
                    <span className="text-sm font-bold text-white block">거대 비행 타이탄 비틀 (Titan Beetle Mount)</span>
                    <span className="text-[10px] text-emerald-300">성층권 활공 안장 // 28.5 u/s 비행 순항 및 에테르 꽃가루</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    AudioSys.playPulseDrive();
                    game.spawnFloatText("🪲 타이탄 비틀 안장 탑승 // 고고도 활공 비행 개시 (300초 환경면역)!", undefined, undefined, '#34d399');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🪲 활공 비행 이륙
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>에테르 꽃가루 수확</span>
                  <button
                    onClick={() => {
                      game.data.inv.condensedCarbon = (game.data.inv.condensedCarbon || 0) + 250;
                      game.data.inv.dihydrogen = (game.data.inv.dihydrogen || 0) + 150;
                      AudioSys.playRecharge();
                      game.spawnFloatText("🌾 에테르 꽃가루 채취 (+250 농축탄소, +150 이수소)", undefined, undefined, '#facc15');
                    }}
                    className="px-2.5 py-1 bg-yellow-600 text-black font-bold rounded text-[10px]"
                  >
                    수확
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>생체학 데이터 등록</span>
                  <button
                    onClick={() => {
                      game.data.units += 85000;
                      game.data.nanites += 350;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("📜 타이탄 곤충 학명 등재 완료 (+85,000 ₩, +350 ⬡)", undefined, undefined, '#38bdf8');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    등록
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 43. SHORT-RANGE TELEPORTER */}
          {activeModal === 'short-range-teleporter' && (
            <div className="space-y-3">
              <div className="p-4 bg-cyan-950/40 rounded-xl border border-cyan-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌀</span>
                  <div>
                    <span className="text-sm font-bold text-white block">기지 단거리 텔레포터 & 양자 도관망</span>
                    <span className="text-[10px] text-cyan-300">480u 케이블 즉시 순간이동 // 타키온 과급 신호 증폭</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    AudioSys.playPulseDrive();
                    game.spawnFloatText("⚡ 아공간 양자 순간이동 실행 완료! (베타 패드 도착)", undefined, undefined, '#38bdf8');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  ⚡ 양자 순간이동
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>타키온 도관 과급</span>
                  <button
                    onClick={() => {
                      AudioSys.playRecharge();
                      game.spawnFloatText("🚀 타키온 과급: 300초간 기동성 및 이동 속도 +60%!", undefined, undefined, '#38bdf8');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    과급
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>양자 얽힘 주파수 조율</span>
                  <button
                    onClick={() => {
                      game.data.shield = game.data.maxShield;
                      AudioSys.playRecharge();
                      game.spawnFloatText("🛡️ 주파수 조율: 실드 100% 완충 및 기지 서지 공급!", undefined, undefined, '#10b981');
                    }}
                    className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[10px] font-bold"
                  >
                    조율
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 44. ELECTROMAGNETIC GENERATOR */}
          {activeModal === 'em-generator' && (
            <div className="space-y-3">
              <div className="p-4 bg-violet-950/40 rounded-xl border border-violet-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⚡</span>
                  <div>
                    <span className="text-sm font-bold text-white block">S-Class 전자기 발전소 & 무한 전력망</span>
                    <span className="text-[10px] text-violet-300">행성 자기장 핵 직결 // 24시간 +1,200 kPk 상시 발전</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    AudioSys.playRecharge();
                    game.spawnFloatText("🌀 자기장 로터 위상 동기화: +450 kPk 서지 전력 공급!", undefined, undefined, '#c084fc');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🌀 로터 위상 동기화
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>초전도 송전망 과급</span>
                  <button
                    onClick={() => {
                      AudioSys.playPulseDrive();
                      game.spawnFloatText("🌐 초전도 과급: 300초간 모든 채굴기 가동 속도 +200%!", undefined, undefined, '#38bdf8');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    과급
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>EMP 센티넬 전파 교란</span>
                  <button
                    onClick={() => {
                      game.data.sentinelAlert = 0;
                      AudioSys.playPulseDrive();
                      game.spawnFloatText("📡 EMP 펄스 방출: 센티넬 경계 레벨 즉시 해제!", undefined, undefined, '#ef4444');
                    }}
                    className="px-2.5 py-1 bg-red-700 text-white rounded text-[10px] font-bold"
                  >
                    방출
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 45. SUBMERGED AQUATIC MARINE BASE */}
          {activeModal === 'aquatic-base' && (
            <div className="space-y-3">
              <div className="p-4 bg-cyan-950/40 rounded-xl border border-cyan-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🌊</span>
                  <div>
                    <span className="text-sm font-bold text-white block">심해 수밀 해양 기지 & 수중 문풀</span>
                    <span className="text-[10px] text-cyan-300">450m 해양 해구 // 산소 여과 순환 및 켈프 화합물 가공</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.inv.oxygen = (game.data.inv.oxygen || 0) + 250;
                    game.data.lifeSupport = 100;
                    AudioSys.playRecharge();
                    game.spawnFloatText("🫁 해수 산소 여과 순환: +250 O₂ 완충!", undefined, undefined, '#22d3ee');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  🫁 해수 산소 여과
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>문풀 해저 잠수</span>
                  <button
                    onClick={() => {
                      game.data.units += 75000;
                      game.data.nanites += 320;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("🏊 문풀 해저 잠수 완료 (+75,000 ₩, +320 ⬡)", undefined, undefined, '#38bdf8');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    잠수
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>수밀 격벽 과급</span>
                  <button
                    onClick={() => {
                      AudioSys.playRecharge();
                      game.spawnFloatText("🛡️ 수밀 격벽 과급: 300초간 심해 수압 완전 면역!", undefined, undefined, '#facc15');
                    }}
                    className="px-2.5 py-1 bg-amber-600 text-black font-bold rounded text-[10px]"
                  >
                    과급
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 46. BASE SOLAR POWER GRID */}
          {activeModal === 'power-grid' && (
            <div className="space-y-3">
              <div className="p-4 bg-yellow-950/40 rounded-xl border border-yellow-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⚡</span>
                  <div>
                    <span className="text-sm font-bold text-white block">기지 태양광 발전소 & 배터리 뱅크 허브</span>
                    <span className="text-[10px] text-yellow-300">+350 kPk 광전기 발전 // 10,000 kPk 대용량 축전</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    AudioSys.playRecharge();
                    game.spawnFloatText("☀️ 태양광 발전 및 배터리 전력 +350 kPk 충전 완료!", undefined, undefined, '#facc15');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-500 text-black font-extrabold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  ☀️ 태양광 전력 충전
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>커패시터 200% 오버클럭</span>
                  <button
                    onClick={() => {
                      AudioSys.playPulseDrive();
                      game.spawnFloatText("⚡ 커패시터 과급 방출: 300초간 기지 설비 가속 +200%!", undefined, undefined, '#00e5ff');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    방출
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>전력망 데이터 전송</span>
                  <button
                    onClick={() => {
                      game.data.units += 65000;
                      game.data.nanites += 280;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("📡 전력망 데이터 제출 완료 (+65,000 ₩, +280 ⬡)", undefined, undefined, '#c084fc');
                    }}
                    className="px-2.5 py-1 bg-purple-700 text-white rounded text-[10px] font-bold"
                  >
                    전송
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 47. ATMOSPHERIC GAS HARVESTER */}
          {activeModal === 'gas-harvester' && (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-950/40 rounded-xl border border-emerald-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">💨</span>
                  <div>
                    <span className="text-sm font-bold text-white block">대기 기체 하베스터 & 화학 합성 정제소</span>
                    <span className="text-[10px] text-emerald-300">라돈, 질소, 설퍼린 추출 // 초전도체 및 반도체 합성</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.data.inv.nitrogen = (game.data.inv.nitrogen || 0) + 150;
                    game.data.inv.radon = (game.data.inv.radon || 0) + 150;
                    game.data.inv.sulphurine = (game.data.inv.sulphurine || 0) + 150;
                    AudioSys.playDiscoveryFanfare();
                    game.spawnFloatText("💨 대기 기체 수거 완료! (질소, 라돈, 설퍼린 각 +150)", undefined, undefined, '#34d399');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  💨 대기 기체 수거 (+150 단위)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>반도체 고속 합성</span>
                  <button
                    onClick={() => {
                      game.data.units += 400000;
                      AudioSys.playRecharge();
                      game.spawnFloatText("📟 반도체 합성 및 매각 완료 (+400,000 ₩)!", undefined, undefined, '#38bdf8');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    합성
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>초전도체 고순도 합성</span>
                  <button
                    onClick={() => {
                      game.data.units += 1500000;
                      AudioSys.playDiscoveryFanfare();
                      game.spawnFloatText("🔮 초전도체 합성 완료 (+1,500,000 ₩)!", undefined, undefined, '#c084fc');
                    }}
                    className="px-2.5 py-1 bg-purple-700 text-white rounded text-[10px] font-bold"
                  >
                    합성
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 48. STARSHIP PAINT & CUSTOM EXHAUST */}
          {activeModal === 'ship-paint' && (
            <div className="space-y-3">
              <div className="p-4 bg-fuchsia-950/40 rounded-xl border border-fuchsia-400 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎨</span>
                  <div>
                    <span className="text-sm font-bold text-white block">우주선 도색, 외형 데칼 & 플라즈마 배기 흔적 튜닝</span>
                    <span className="text-[10px] text-fuchsia-300">6종 시그니처 컬러웨이, 팩션 엠블럼 및 공기역학 오버클럭</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    AudioSys.playPulseDrive();
                    game.spawnFloatText("⚡ 함선 추진기 공기역학 오버클럭 완료 (+30% 비행 추진력)!", undefined, undefined, '#10b981');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                >
                  ⚡ 공기역학 오버클럭
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>아틀라스 크림슨 & 골드</span>
                  <button
                    onClick={() => {
                      AudioSys.playRecharge();
                      game.spawnFloatText("🎨 선체 도색: 아틀라스 크림슨 & 골드 적용!", undefined, undefined, '#ef4444');
                    }}
                    className="px-2.5 py-1 bg-red-700 text-white rounded text-[10px] font-bold"
                  >
                    도색
                  </button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-white/10 flex justify-between items-center">
                  <span>인듐 시안 배기 플라즈마</span>
                  <button
                    onClick={() => {
                      AudioSys.playRecharge();
                      game.spawnFloatText("🔵 배기 플라즈마: 인듐 시안 궤적 적용!", undefined, undefined, '#00e5ff');
                    }}
                    className="px-2.5 py-1 bg-cyan-700 text-white rounded text-[10px] font-bold"
                  >
                    장착
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 49. WAYPOINT 4.0 CUSTOM GAME DIFFICULTY (v5.51.0) */}
          {activeModal === 'custom-difficulty' && (() => {
            const diff = game.data.difficultySettings || {
              preset: 'NORMAL',
              hazardDrain: 'STANDARD',
              lifeSupportDrain: 'STANDARD',
              combatDifficulty: 'STANDARD',
              sentinelAggression: 'STANDARD',
              craftingCost: 'STANDARD',
              purchaseCost: 'STANDARD',
              fuelUsage: 'STANDARD',
              deathConsequence: 'GRAVE',
              sprintStamina: 'STANDARD',
              scannerRecharge: 'STANDARD'
            };

            const presetDescriptions: Record<string, string> = {
              NORMAL: 'NORMAL (표준 탐험)',
              RELAXED: 'RELAXED (완화 모드)',
              SURVIVAL: 'SURVIVAL (생존 도전)',
              PERMADEATH: 'PERMADEATH (영구 사망 도전)',
              CREATIVE: 'CREATIVE (창작 모드)',
              CUSTOM: 'CUSTOM (사용자 정의)'
            };

            const granularParams: Array<{
              key: keyof DifficultySettings;
              name: string;
              current: string;
              options: Array<{ value: string; label: string }>;
            }> = [
              {
                key: 'hazardDrain',
                name: '1. 환경 보호 소모율',
                current: diff.hazardDrain,
                options: [
                  { value: 'CREATIVE', label: '무제한(0x)' },
                  { value: 'RELAXED', label: '완화(0.4x)' },
                  { value: 'STANDARD', label: '표준(1.0x)' },
                  { value: 'HARSH', label: '혹독(1.8x)' }
                ]
              },
              {
                key: 'lifeSupportDrain',
                name: '2. 생명 유지 소모율',
                current: diff.lifeSupportDrain,
                options: [
                  { value: 'CREATIVE', label: '무제한(0x)' },
                  { value: 'RELAXED', label: '완화(0.5x)' },
                  { value: 'STANDARD', label: '표준(1.0x)' },
                  { value: 'HARSH', label: '혹독(1.8x)' }
                ]
              },
              {
                key: 'combatDifficulty',
                name: '3. 전투 난이도 & 대미지',
                current: diff.combatDifficulty,
                options: [
                  { value: 'WEAK', label: '약함(0.6x)' },
                  { value: 'STANDARD', label: '표준(1.0x)' },
                  { value: 'CHALLENGING', label: '도전(1.6x)' }
                ]
              },
              {
                key: 'sentinelAggression',
                name: '4. 센티넬 공격성 & 경계',
                current: diff.sentinelAggression,
                options: [
                  { value: 'LOW', label: '비선제' },
                  { value: 'STANDARD', label: '표준 반응' },
                  { value: 'HOSTILE', label: '상시 적대' }
                ]
              },
              {
                key: 'craftingCost',
                name: '5. 자원 제작 비용',
                current: diff.craftingCost,
                options: [
                  { value: 'FREE', label: '무료(0자원)' },
                  { value: 'STANDARD', label: '표준' },
                  { value: 'EXPENSIVE', label: '고비용(1.5x)' }
                ]
              },
              {
                key: 'purchaseCost',
                name: '6. 상점 구매 경제 난이도',
                current: diff.purchaseCost,
                options: [
                  { value: 'DISCOUNT', label: '할인(0.7x)' },
                  { value: 'STANDARD', label: '표준 가격' },
                  { value: 'HIGH', label: '인플레(1.5x)' }
                ]
              },
              {
                key: 'fuelUsage',
                name: '7. 우주선 펄스/워프 연료 소모',
                current: diff.fuelUsage,
                options: [
                  { value: 'FREE', label: '무료(0소모)' },
                  { value: 'STANDARD', label: '표준 소모' },
                  { value: 'HIGH', label: '고소모(1.5x)' }
                ]
              },
              {
                key: 'deathConsequence',
                name: '8. 사망 패널티 (페널티)',
                current: diff.deathConsequence,
                options: [
                  { value: 'NONE', label: '손실 없음' },
                  { value: 'GRAVE', label: '묘비(GRAVE)' },
                  { value: 'PERMADEATH', label: '영구 삭제' }
                ]
              },
              {
                key: 'sprintStamina',
                name: '9. 제트팩 & 스태미나',
                current: diff.sprintStamina,
                options: [
                  { value: 'INFINITE', label: '무제한(∞)' },
                  { value: 'STANDARD', label: '표준(1.0x)' },
                  { value: 'LIMITED', label: '제한(0.5x)' }
                ]
              },
              {
                key: 'scannerRecharge',
                name: '10. 스캐너 재충전 쿨다운',
                current: diff.scannerRecharge,
                options: [
                  { value: 'INSTANT', label: '즉시(0s)' },
                  { value: 'FAST', label: '빠름(3s)' },
                  { value: 'STANDARD', label: '표준(8s)' }
                ]
              }
            ];

            return (
              <div className="space-y-4">
                {/* Header Summary Banner */}
                <div className="p-3.5 bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 rounded-xl border border-amber-500/50 flex flex-col gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xl text-amber-400 animate-pulse">⚙️</span>
                      <span className="text-[11px] font-bold text-amber-300 tracking-wider">WAYPOINT 4.0 // 난이도 엔진 매트릭스</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 font-bold">
                      v5.51.0 LIVE
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-white">
                    현재 프리셋: <span className="text-amber-400">{presetDescriptions[diff.preset] || diff.preset}</span>
                  </div>
                  <p className="text-[10px] text-gray-300">
                    전투 난이도, 생명 유지, 스캐너 쿨다운, 자원 제작 비용 및 사망 패널티를 실시간으로 맞춤 변경할 수 있습니다. [F9] 단축키 지원.
                  </p>
                </div>

                {/* 5 Official Presets Row */}
                <div>
                  <div className="text-[10px] font-bold text-gray-400 mb-1.5 flex items-center justify-between">
                    <span>공식 게임 프리셋 선택 (5 Official Presets)</span>
                    <span className="text-amber-400 font-normal">즉시 일괄 적용</span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                    {(['NORMAL', 'RELAXED', 'SURVIVAL', 'PERMADEATH', 'CREATIVE', 'CUSTOM'] as DifficultyPreset[]).map((pKey) => {
                      const isActive = diff.preset === pKey;
                      const isPermadeath = pKey === 'PERMADEATH';
                      return (
                        <button
                          key={pKey}
                          onClick={() => {
                            game.applyDifficultyPreset(pKey);
                            triggerRender();
                          }}
                          className={`py-2 px-1.5 rounded-lg text-center font-bold text-[10px] transition-all cursor-pointer border ${
                            isActive
                              ? isPermadeath
                                ? 'bg-rose-600 text-white border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                                : 'bg-amber-600 text-white border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                              : isPermadeath
                              ? 'bg-slate-900 text-rose-300 border-rose-900/50 hover:bg-rose-950/60'
                              : 'bg-slate-900 text-gray-400 border-white/10 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          {pKey}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 10 Granular Modifiers Grid */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-gray-400 flex items-center justify-between">
                    <span>10대 세부 튜닝 매개변수 (Granular Modifiers)</span>
                    <span className="text-cyan-400 font-normal">변경 시 [CUSTOM] 전환</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {granularParams.map((param) => (
                      <div
                        key={param.key}
                        className="bg-slate-900/90 p-2.5 rounded-xl border border-white/10 flex flex-col gap-1.5"
                      >
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-white truncate">{param.name}</span>
                          <span className="text-[10px] text-amber-400 font-bold shrink-0 ml-1">
                            {param.current}
                          </span>
                        </div>
                        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${param.options.length}, minmax(0, 1fr))` }}>
                          {param.options.map((opt) => {
                            const isSelected = opt.value === param.current;
                            return (
                              <button
                                key={opt.value}
                                onClick={() => {
                                  game.setDifficultyParam(param.key as any, opt.value as any);
                                  triggerRender();
                                }}
                                className={`py-1 px-1 rounded text-[10px] font-bold transition-all text-center truncate cursor-pointer ${
                                  isSelected
                                    ? 'bg-amber-600 text-white border border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                                    : 'bg-slate-950 text-gray-400 border border-white/10 hover:text-white hover:bg-slate-800'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Utopia Speeder Requisition Banner */}
                <div className="p-3 bg-gradient-to-r from-cyan-950/70 via-slate-900 to-blue-950/70 rounded-xl border border-cyan-500/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">유토피아 스피더(Utopia Speeder) 특수기</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-600/30 text-cyan-300 border border-cyan-500/50">
                          {game.data.shipType === 'UTOPIA_SPEEDER' ? '탑승 중' : '원정 9 보상'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400">초고속 웨지형 공기역학 동체, 대기권 최고속도 +40%, 부스트 가속 +50%.</p>
                    </div>
                  </div>
                  <button
                    disabled={game.data.shipType === 'UTOPIA_SPEEDER'}
                    onClick={() => {
                      game.claimUtopiaSpeeder();
                      triggerRender();
                    }}
                    className={`w-full sm:w-auto px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap border ${
                      game.data.shipType === 'UTOPIA_SPEEDER'
                        ? 'bg-slate-800 text-gray-500 border-white/10 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-300/50 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    }`}
                  >
                    {game.data.shipType === 'UTOPIA_SPEEDER' ? '✓ 조종석 활성화 완료' : '🚀 유토피아 스피더 즉시 탑승'}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* 51. NAUTILON SUBMARINE & HIGH-POWER SONAR MATRIX (v5.23.0 The Abyss & Aquarius) */}
          {activeModal === 'nautilon-sonar' && (
            <div className="space-y-4">
              {/* Telemetry Overview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-900/90 p-3 rounded-xl border border-blue-500/30 text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400">선체 내압 한계 (HULL PRESSURE)</span>
                  <span className="text-sm font-bold text-cyan-300 font-mono">100% 완전 밀폐</span>
                  <span className="text-[9px] text-emerald-400">수심 무제한 무한 잠항</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400">훔볼트 추진 엔진 (HUMBOLDT)</span>
                  <span className="text-sm font-bold text-blue-400 font-mono">
                    {game.data.nautilon.engineOverclock ? '75 u/s (오버클럭 가동)' : '45 u/s (기본 순항)'}
                  </span>
                  <span className="text-[9px] text-amber-300">
                    {game.data.nautilon.engineOverclock ? '엔진: S급 오버클럭' : '엔진: 기본형'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400">수중 무장 체계 (SUB WEAPON)</span>
                  <span className="text-sm font-bold text-red-400 font-mono">
                    {game.data.nautilon.torpedoLauncher ? '어뢰 발사관 + 채굴빔' : '테티스 채굴 빔'}
                  </span>
                  <span className="text-[9px] text-yellow-300">
                    {game.data.nautilon.torpedoLauncher ? '어뢰 장전 완료' : '어뢰관: 미장착'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400">심해 수확 전리품 (SALVAGE)</span>
                  <span className="text-sm font-bold text-emerald-300 font-mono">
                    진주 {game.data.nautilon.livingPearls} // 코어 {game.data.nautilon.hadalCores}
                  </span>
                  <span className="text-[9px] text-gray-300">심연의 공포 수확물</span>
                </div>
              </div>

              {/* Boarding Status Banner & Quick Action */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-950/40 border border-blue-400/40">
                <div className="flex items-center gap-3">
                  <span className="text-2xl animate-pulse">🌊</span>
                  <div>
                    <div className="text-xs font-bold text-white nms-header-font">
                      {game.data.nautilon.boarded ? '노틸론 잠수정 승선 중 // 수중 잠항 모드' : '노틸론 잠수정 대기 중 (수면/표면 배치)'}
                    </div>
                    <div className="text-[10px] text-cyan-300">
                      {game.data.nautilon.boarded
                        ? '100% 익사 방지 / 수압 완전 면역 가동'
                        : '행성 해양 수역에서 탑승하여 심해 탐사를 시작하세요'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    game.toggleNautilonSubmarine();
                  }}
                  className={`px-4 py-2 rounded-lg font-bold text-xs cursor-pointer shadow-md transition-all ${
                    game.data.nautilon.boarded
                      ? 'bg-rose-600 hover:bg-rose-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {game.data.nautilon.boarded ? '잠수정 하선 [E]' : '잠수정 탑승 [0]'}
                </button>
              </div>

              {/* Sub-Tabs: Specs | Sonar | Tech | Harvest */}
              <div className="flex gap-2 border-b border-white/10 pb-2 text-xs font-mono overflow-x-auto">
                <button
                  onClick={() => setSubTab(0)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    subTab === 0
                      ? 'bg-blue-500/30 text-blue-300 border border-blue-400'
                      : 'bg-slate-900 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  1. 선체 제원 (SPECS)
                </button>
                <button
                  onClick={() => setSubTab(1)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    subTab === 1
                      ? 'bg-blue-500/30 text-blue-300 border border-blue-400'
                      : 'bg-slate-900 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  2. 고출력 소나 (SONAR)
                </button>
                <button
                  onClick={() => setSubTab(2)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    subTab === 2
                      ? 'bg-blue-500/30 text-blue-300 border border-blue-400'
                      : 'bg-slate-900 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  3. 기술 업그레이드 (TECH)
                </button>
                <button
                  onClick={() => setSubTab(3)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    subTab === 3
                      ? 'bg-blue-500/30 text-blue-300 border border-blue-400'
                      : 'bg-slate-900 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  4. 심해 수확 (HARVEST)
                </button>
              </div>

              {/* Sub-Tab 0: Specs */}
              {subTab === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 space-y-2">
                    <span className="font-bold text-cyan-300 block">선체 내압 및 심해 내구도</span>
                    <p className="text-gray-300 text-[11px] leading-relaxed">
                      S-Class 강화 티타늄 압력 선체 구조로 설계되어 수심 5,000u 이상의 초고압 심해 해구에서도 100% 완전 밀폐를 유지합니다. 승선 중에는 플레이어의 산소 게이지 및 환경 유해 위험 게이지가 일체 소모되지 않습니다.
                    </p>
                    <div className="p-2 bg-black/40 rounded border border-cyan-500/20 text-[10px] text-cyan-200 font-mono">
                      • 수심 0u ~ 심해 무제한 완전 잠항 지원<br />
                      • 고압 방수 탐사 조명 &amp; 360도 수중 수화 렌더링
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 space-y-2">
                    <span className="font-bold text-blue-300 block">훔볼트 추진기 &amp; 서치라이트</span>
                    <p className="text-gray-300 text-[11px] leading-relaxed">
                      심해 전용 수중 플라즈마 분사 엔진으로 급류와 해류를 돌파할 수 있습니다. 야간 및 심해 무광 환경에서도 전방 95u를 투사하는 고출력 볼류메트릭 서치라이트가 기본 탑재되어 있습니다.
                    </p>
                    <div className="p-2 bg-black/40 rounded border border-blue-500/20 text-[10px] text-blue-200 font-mono">
                      • 서치라이트: 전방 볼류메트릭 조명 가동<br />
                      • 음향 파동: 소나 펄스 상시 방출
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 1: Sonar Scanning */}
              {subTab === 1 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-blue-500/30 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">🏛️</span>
                          <span className="font-bold text-white text-xs">침몰한 선구자 유적 탐색</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mb-2">
                          심해 해저에 잠든 고대 문명의 석조 신전과 고대 보물함을 음파로 스캔합니다.
                        </p>
                        <span className="text-[10px] text-cyan-300 font-mono block mb-2">
                          보상: +450,000 ₩, +300 ⬡, 고대 열쇠
                        </span>
                      </div>
                      <button
                        onClick={() => game.scanSunkenRuins()}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold"
                      >
                        소나 스캔 발동
                      </button>
                    </div>

                    <div className="p-3 bg-slate-900/90 rounded-xl border border-blue-500/30 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">🚀</span>
                          <span className="font-bold text-white text-xs">침몰한 우주선 난파선 인양</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mb-2">
                          행성 대기권 진입 중 추락하여 수중에 수장된 성간 우주선의 잔해를 탐지합니다.
                        </p>
                        <span className="text-[10px] text-cyan-300 font-mono block mb-2">
                          보상: +600,000 ₩, 함선 보관함 확장
                        </span>
                      </div>
                      <button
                        onClick={() => game.scanSunkenStarship()}
                        className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold"
                      >
                        우주선 신호 추적
                      </button>
                    </div>

                    <div className="p-3 bg-slate-900/90 rounded-xl border border-amber-500/30 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">🚢</span>
                          <span className="font-bold text-white text-xs">침몰한 화물선 대형 잔해</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mb-2">
                          심해에 반파된 채 가라앉은 거대 성간 화물선 화물 격벽 컨테이너를 탐지합니다.
                        </p>
                        <span className="text-[10px] text-amber-300 font-mono block mb-2">
                          보상: +850,000 ₩, 화물선 격벽
                        </span>
                      </div>
                      <button
                        onClick={() => game.scanSunkenFreighter()}
                        className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold"
                      >
                        화물선 잔해 탐지
                      </button>
                    </div>

                    <div className="p-3 bg-slate-900/90 rounded-xl border border-pink-500/30 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">👁️</span>
                          <span className="font-bold text-white text-xs">심연의 공포 &amp; 생체 서식지</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mb-2">
                          해저 동굴에 서식하는 초거대 심연의 공포 생명체와 최면 눈 서식지를 탐색합니다.
                        </p>
                        <span className="text-[10px] text-pink-300 font-mono block mb-2">
                          보상: 살아있는 진주 +3, 해달 코어 +2, 최면눈 +1
                        </span>
                      </div>
                      <button
                        onClick={() => game.scanAbyssalHorrors()}
                        className="w-full py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg text-xs font-bold"
                      >
                        심연 생명체 탐색
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: Tech Upgrades */}
              {subTab === 2 && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-white/10 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-white text-xs block mb-1">훔볼트 오버클럭</span>
                        <p className="text-[10px] text-gray-400 mb-2">
                          수중 추진력을 극대화하여 순항 속도를 45 u/s에서 75 u/s로 비약적으로 향상시킵니다.
                        </p>
                        <span className="text-[10px] text-yellow-400 font-mono block mb-2">비용: 400 ⬡</span>
                      </div>
                      <button
                        onClick={() => game.upgradeNautilonTech('engine')}
                        disabled={game.data.nautilon.engineOverclock}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold ${
                          game.data.nautilon.engineOverclock
                            ? 'bg-emerald-900 text-emerald-300 cursor-default'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        {game.data.nautilon.engineOverclock ? '장착 완료 ✓' : '연구 및 장착'}
                      </button>
                    </div>

                    <div className="p-3 bg-slate-900/90 rounded-xl border border-white/10 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-white text-xs block mb-1">수중 어뢰 발사관</span>
                        <p className="text-[10px] text-gray-400 mb-2">
                          수중 장갑 파괴용 나노 추진 어뢰를 장착하여 해저 장애물과 위협 생물을 즉각 격파합니다.
                        </p>
                        <span className="text-[10px] text-yellow-400 font-mono block mb-2">비용: 650 ⬡</span>
                      </div>
                      <button
                        onClick={() => game.upgradeNautilonTech('torpedo')}
                        disabled={game.data.nautilon.torpedoLauncher}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold ${
                          game.data.nautilon.torpedoLauncher
                            ? 'bg-emerald-900 text-emerald-300 cursor-default'
                            : 'bg-red-600 hover:bg-red-500 text-white'
                        }`}
                      >
                        {game.data.nautilon.torpedoLauncher ? '장착 완료 ✓' : '연구 및 장착'}
                      </button>
                    </div>

                    <div className="p-3 bg-slate-900/90 rounded-xl border border-white/10 flex flex-col justify-between">
                      <div>
                        <span className="font-bold text-white text-xs block mb-1">테티스 채굴 레이저</span>
                        <p className="text-[10px] text-gray-400 mb-2">
                          수중 굴절 방지 코팅 렌즈로 해저 광맥과 심해 광석을 수면 위처럼 빠르게 채굴합니다.
                        </p>
                        <span className="text-[10px] text-yellow-400 font-mono block mb-2">비용: 500 ⬡</span>
                      </div>
                      <button
                        onClick={() => game.upgradeNautilonTech('mining')}
                        disabled={game.data.nautilon.tethysMining}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold ${
                          game.data.nautilon.tethysMining
                            ? 'bg-emerald-900 text-emerald-300 cursor-default'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {game.data.nautilon.tethysMining ? '장착 완료 ✓' : '연구 및 장착'}
                      </button>
                    </div>
                  </div>

                  {game.data.nautilon.torpedoLauncher && (
                    <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-red-300 block">수중 어뢰 긴급 사격 테스트</span>
                        <span className="text-[10px] text-gray-400">전방 심해를 향해 고폭 충격파 어뢰를 즉시 발사합니다.</span>
                      </div>
                      <button
                        onClick={() => game.launchSubTorpedo()}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs cursor-pointer shadow-md"
                      >
                        🚀 어뢰 발사
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 3: Oceanic Harvest */}
              {subTab === 3 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-blue-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">🦪 살아있는 진주 채취 (LIVING PEARLS)</span>
                      <span className="text-cyan-300 font-mono font-bold">
                        보유: {game.data.nautilon.livingPearls}개
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      심해 조개류 군락지에서 천연 유기체 보석을 안전하게 추출하여 은하계 암시장에 고가에 매각합니다.
                    </p>
                    <button
                      onClick={() => game.harvestAbyssPearls()}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg"
                    >
                      진주 수확하기 (+2 진주, +120,000 ₩)
                    </button>
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-xl border border-purple-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">💎 해달 코어 심해 정제 (HADAL CORES)</span>
                      <span className="text-purple-300 font-mono font-bold">
                        보유: {game.data.nautilon.hadalCores}개
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      심연의 미끼 열매에서 발광 핵을 추출하여 아노말리 연구용 고순도 나노로봇 군집으로 정제합니다.
                    </p>
                    <button
                      onClick={() => game.harvestHadalCores()}
                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg"
                    >
                      코어 정제하기 (+1 코어, +150 ⬡)
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 52. DEFAULT FALLBACK MODAL HANDLER */}
          {!['inventory', 'quick-recharge', 'galaxy-map', 'solar-ship', 'laylaps', 'fishing', 'black-hole', 'portal', 'wonders', 'supercharge', 'appearance', 'weapon-arsenal', 'station', 'sandworm', 'base-computer', 'abandoned-building', 'archaeology', 'specialist-terminals', 'pirate-flagship', 'large-refiner', 'atlantid-tool', 'livestock-ranch', 'organic-fleet', 'egg-sequencer', 'biodome', 'orbital-freighter', 'expedition', 'scrapper', 'trade-outpost', 'atlas-path', 'outlaw-station', 'manufacturing', 'minotaur', 'teleport', 'nutrient', 'discoveries', 'build-menu', 'milestones', 'hazard-protection', 'multi-tool-salvage', 'cartographer', 'exosuit-upgrade', 'guild-envoy', 'galactic-core', 'starship-weapons', 'floating-islands', 'boundary-failure', 'abyssal-horror', 'living-ship', 'derelict-freighter', 'extreme-weather', 'volcano', 'aquarium', 'spacewalk', 'bioluminescent-forest', 'race-initiator', 'titan-beetle', 'short-range-teleporter', 'em-generator', 'aquatic-base', 'power-grid', 'gas-harvester', 'ship-paint', 'custom-difficulty', 'nautilon-sonar'].includes(activeModal) && (
            <div className="space-y-4 text-center py-6">
              <span className="text-4xl block">✨</span>
              <span className="text-sm font-bold text-white block">
                [{activeModal.toUpperCase()}] 시스템 연동 완료
              </span>
              <span className="text-xs text-gray-400 block max-w-md mx-auto">
                모바일 환경에서 원활하게 구동되도록 커맨드 큐에 등록되었습니다. 즉각 실행하거나 장비를 점검하세요.
              </span>
              <button
                onClick={() => {
                  AudioSys.playDiscoveryFanfare();
                  game.spawnFloatText(`시스템 [${activeModal}] 실행 완료!`, undefined, undefined, '#00e5ff');
                  handleClose();
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-md"
              >
                확인 및 계속하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
