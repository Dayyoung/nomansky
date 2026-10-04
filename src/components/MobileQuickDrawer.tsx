import React, { useState } from 'react';
import {
  X,
  Rocket,
  Backpack,
  Compass,
  Building2,
  Sword,
  Search,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { AudioSys } from '../audio';

interface QuickActionItem {
  id: string;
  name: string;
  category: 'ship' | 'gear' | 'galaxy' | 'base' | 'combat';
  icon: string;
  hotkey: string;
  color: string;
  desc: string;
  onClick: () => void;
}

interface MobileQuickDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenModal: (modalId: string) => void;
}

export const MobileQuickDrawer: React.FC<MobileQuickDrawerProps> = ({
  isOpen,
  onClose,
  onOpenModal
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'ship' | 'gear' | 'galaxy' | 'base' | 'combat'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const actions: QuickActionItem[] = [
    // 🛸 함선 & 비행
    {
      id: 'ship-switch',
      name: '함선 기종 전환',
      category: 'ship',
      icon: '🚀',
      hotkey: '[K]',
      color: 'border-cyan-400/50 bg-cyan-950/40 text-cyan-300',
      desc: '기계선 / 생체함선 / 인터셉터 / 솔라선 순환 탑승',
      onClick: () => onOpenModal('ship-switch')
    },
    {
      id: 'solar-ship',
      name: '솔라선 & 베스퍼 세일',
      category: 'ship',
      icon: '⛵',
      hotkey: '[.]',
      color: 'border-amber-400/50 bg-amber-950/40 text-amber-300',
      desc: '태양광 돛 전개, 영구 쉴드 충전 및 광자포 사격',
      onClick: () => onOpenModal('solar-ship')
    },
    {
      id: 'interceptor',
      name: '센티넬 인터셉터 인양',
      category: 'ship',
      icon: '🛸',
      hotkey: '[N / 8]',
      color: 'border-rose-400/50 bg-rose-950/40 text-rose-300',
      desc: '하모닉 두뇌 조율 및 S-Class 하이브리드 전투기 획득',
      onClick: () => onOpenModal('interceptor')
    },
    {
      id: 'scrapper',
      name: '우주선 인양 분해소',
      category: 'ship',
      icon: '🛸',
      hotkey: '[F1]',
      color: 'border-amber-400/50 bg-amber-950/40 text-amber-300',
      desc: '난파 함선 고철 분해, 보관함 슬롯 확장 및 S-Class 승급',
      onClick: () => onOpenModal('scrapper')
    },
    {
      id: 'orbital-freighter',
      name: '화물선 궤도 물질화기',
      category: 'ship',
      icon: '🛰️',
      hotkey: '[F6]',
      color: 'border-blue-400/50 bg-blue-950/40 text-blue-300',
      desc: '궤도에서 즉각 엑소크래프트 투하 및 항성계 광역 스캔',
      onClick: () => onOpenModal('orbital-freighter')
    },
    {
      id: 'nautilon-sonar',
      name: '노틸론 잠수정 & 소나 콘솔',
      category: 'ship',
      icon: '🌊',
      hotkey: '[0 / Alt+0]',
      color: 'border-blue-400/50 bg-blue-950/40 text-blue-300',
      desc: 'The Abyss & Aquarius: 심해 고출력 소나 스캔, 수중 어뢰, 훔볼트 엔진 및 심해 수확',
      onClick: () => onOpenModal('nautilon-sonar')
    },

    // 🎒 인벤토리 & 장비
    {
      id: 'inventory',
      name: '엑소슈트 인벤토리',
      category: 'gear',
      icon: '🎒',
      hotkey: '[TAB]',
      color: 'border-cyan-400/50 bg-cyan-950/40 text-cyan-300',
      desc: '원소 자원 관리, 빠른 충전 및 잉여 화물 유닛 판매',
      onClick: () => onOpenModal('inventory')
    },
    {
      id: 'weapon-arsenal',
      name: '다목적 도구 화기 무기고',
      category: 'gear',
      icon: '🔫',
      hotkey: '[/ / Alt+X]',
      color: 'border-orange-400/50 bg-orange-950/40 text-orange-300',
      desc: 'Sentinel & Waypoint: 5대 전문 주무기, 보조 유탄/박격포 및 센티넬 탄약 보급창',
      onClick: () => onOpenModal('weapon-arsenal')
    },
    {
      id: 'supercharge',
      name: '기술 과급 슬롯 튜닝',
      category: 'gear',
      icon: '⚡',
      hotkey: '[F9]',
      color: 'border-violet-400/50 bg-violet-950/40 text-violet-300',
      desc: '핵심 모듈 +35% 과급 부스트 및 화력/방어/속도 프로필',
      onClick: () => onOpenModal('supercharge')
    },
    {
      id: 'appearance',
      name: '외형 조작기 & 종족 커스텀',
      category: 'gear',
      icon: '👤',
      hotkey: '[F10]',
      color: 'border-pink-400/50 bg-pink-950/40 text-pink-300',
      desc: '6대 은하 종족, 망토 시뮬레이션 및 아머 컬러 팔레트',
      onClick: () => onOpenModal('appearance')
    },

    // 🪐 성간 탐사 & 은하
    {
      id: 'galaxy-map',
      name: '3D 은하계 지도 & 워프',
      category: 'galaxy',
      icon: '🌌',
      hotkey: '[M]',
      color: 'border-cyan-400/50 bg-cyan-950/40 text-cyan-300',
      desc: '성계 항로 탐색, 은하 중심 코리도 및 하이퍼드라이브 워프',
      onClick: () => onOpenModal('galaxy-map')
    },
    {
      id: 'discoveries',
      name: '행성 발견 도감',
      category: 'galaxy',
      icon: '🪐',
      hotkey: '[P]',
      color: 'border-emerald-400/50 bg-emerald-950/40 text-emerald-300',
      desc: '외계 생물 및 광물 데이터베이스 기록 및 나노로봇 보너스',
      onClick: () => onOpenModal('discoveries')
    },
    {
      id: 'portal',
      name: '고대 포탈 16 글리프',
      category: 'galaxy',
      icon: '🌀',
      hotkey: '[V]',
      color: 'border-cyan-400/50 bg-cyan-950/40 text-cyan-300',
      desc: '12개 룬 좌표 다이얼링 및 은하 중심/낙원 즉시 이동',
      onClick: () => onOpenModal('portal')
    },
    {
      id: 'ancient-ruins',
      name: '고대 외계 유적 발굴지',
      category: 'galaxy',
      icon: '🏛️',
      hotkey: '[-]',
      color: 'border-yellow-400/50 bg-yellow-950/40 text-yellow-300',
      desc: '고대 열쇠 3개 발굴 및 수백만 유닛 대형 유물 상자 개방',
      onClick: () => onOpenModal('ancient-ruins')
    },
    {
      id: 'colossal-archive',
      name: '거대 행성 기록 보관소',
      category: 'galaxy',
      icon: '🏯',
      hotkey: '[`]',
      color: 'border-emerald-400/50 bg-emerald-950/40 text-emerald-300',
      desc: '고생물 유물 교환 금고 및 원시 은하계 역사 열람',
      onClick: () => onOpenModal('colossal-archive')
    },
    {
      id: 'wonders',
      name: '은하계 경이 도감 & 영사기',
      category: 'galaxy',
      icon: '✨',
      hotkey: '[F8]',
      color: 'border-indigo-400/50 bg-indigo-950/40 text-indigo-300',
      desc: '최고 극한 행성/거대 괴수 기록 및 기지 홀로그램 투사',
      onClick: () => onOpenModal('wonders')
    },
    {
      id: 'atlas-path',
      name: '아틀라스 경로 & 항성 탄생',
      category: 'galaxy',
      icon: '🔴',
      hotkey: '[V]',
      color: 'border-rose-400/50 bg-rose-950/40 text-rose-300',
      desc: '10대 아틀라스 시드 합성, 신규 별 창조 및 스타시드 제작',
      onClick: () => onOpenModal('atlas-path')
    },
    {
      id: 'black-hole',
      name: '초거대 블랙홀 & 특이점 엔진',
      category: 'galaxy',
      icon: '🕳️',
      hotkey: '[Delete]',
      color: 'border-purple-400/50 bg-purple-950/40 text-purple-300',
      desc: '사건의 지평선 돌파, 100만 광년 상대론적 웜홀 점프',
      onClick: () => onOpenModal('black-hole')
    },

    // 🏛️ 기지 & 정착지
    {
      id: 'build-menu',
      name: '기지 건설 및 구조물',
      category: 'base',
      icon: '🏗️',
      hotkey: '[Z]',
      color: 'border-cyan-400/50 bg-cyan-950/40 text-cyan-300',
      desc: '정제기, 기지 컴퓨터, 벽/바닥/문 설치',
      onClick: () => onOpenModal('build-menu')
    },
    {
      id: 'settlement',
      name: '행성 정착지 행정 관리',
      category: 'base',
      icon: '🏛️',
      hotkey: '[L]',
      color: 'border-amber-400/50 bg-amber-950/40 text-amber-300',
      desc: '주민 분쟁 판결, 시설 건축 확장 및 일일 생산품 수확',
      onClick: () => onOpenModal('settlement')
    },
    {
      id: 'industrial',
      name: '자율 광물 채굴 파이프라인',
      category: 'base',
      icon: '🏭',
      hotkey: '[7]',
      color: 'border-amber-400/50 bg-amber-950/40 text-amber-300',
      desc: '심층 핫스팟 탐측, 자동 추출기 및 저장탱크 일괄 수확',
      onClick: () => onOpenModal('industrial')
    },
    {
      id: 'nutrient',
      name: '영양소 처리기 & 외계 요리',
      category: 'base',
      icon: '🍲',
      hotkey: '[5]',
      color: 'border-emerald-400/50 bg-emerald-950/40 text-emerald-300',
      desc: '외계 식재료 배합, 탐사 버프 요리 및 미식가 평가',
      onClick: () => onOpenModal('nutrient')
    },
    {
      id: 'biodome',
      name: '수경재배 바이오돔 & 농경',
      category: 'base',
      icon: '🌱',
      hotkey: '[F7]',
      color: 'border-lime-400/50 bg-lime-950/40 text-lime-300',
      desc: '8대 외계 작물 원클릭 일괄 수확 및 초고가 완제품 가공',
      onClick: () => onOpenModal('biodome')
    },
    {
      id: 'trade-outpost',
      name: '행성 대형 교역소',
      category: 'base',
      icon: '🏛️',
      hotkey: '[Insert]',
      color: 'border-teal-400/50 bg-teal-950/40 text-teal-300',
      desc: '성간 특산품 무역, 기항 상선 바터 및 황금 무역로 차익',
      onClick: () => onOpenModal('trade-outpost')
    },
    {
      id: 'manufacturing',
      name: '보안 제조시설 & 아틀라스패스',
      category: 'base',
      icon: '🏭',
      hotkey: '[I]',
      color: 'border-amber-400/50 bg-amber-950/40 text-amber-300',
      desc: '철문 폭파 침투, 오버라이드 퍼즐 및 1,500만 유닛 설계도',
      onClick: () => onOpenModal('manufacturing')
    },
    {
      id: 'teleport',
      name: '성계간 순간이동기 망',
      category: 'base',
      icon: '🌀',
      hotkey: '[6]',
      color: 'border-cyan-400/50 bg-cyan-950/40 text-cyan-300',
      desc: '기지, 우주정거장, 화물선 간 양자 물질 순간이동',
      onClick: () => onOpenModal('teleport')
    },

    // ⚔️ 전투 & 함대
    {
      id: 'freighter',
      name: '화물선 주력함 소환',
      category: 'combat',
      icon: '🚢',
      hotkey: '[H]',
      color: 'border-emerald-400/50 bg-emerald-950/40 text-emerald-300',
      desc: '초거대 캐피탈 화물선 소환, 함교 원정 및 화물창고',
      onClick: () => onOpenModal('freighter')
    },
    {
      id: 'squadron',
      name: '전투 비행중대 출격',
      category: 'combat',
      icon: '⚔️',
      hotkey: '[Q]',
      color: 'border-cyan-400/50 bg-cyan-950/40 text-cyan-300',
      desc: '4인 정예 파일럿 셰브론 편대 출격 및 합동 편대 공중전',
      onClick: () => onOpenModal('squadron')
    },
    {
      id: 'anomaly',
      name: '스페이스 아노말리',
      category: 'combat',
      icon: '🔮',
      hotkey: '[B]',
      color: 'border-purple-400/50 bg-purple-950/40 text-purple-300',
      desc: '넥서스 멀티 미션, 수은 상점 및 나다/폴로 성소',
      onClick: () => onOpenModal('anomaly')
    },
    {
      id: 'minotaur',
      name: '미노타우르스 중장갑 메카',
      category: 'combat',
      icon: '🤖',
      hotkey: '[1]',
      color: 'border-red-400/50 bg-red-950/40 text-red-300',
      desc: '이족보행 화력 지원 메카 투하, 센티넬 하드프레임 개조',
      onClick: () => onOpenModal('minotaur')
    },
    {
      id: 'laylaps',
      name: '센티넬 동료 레일랩스',
      category: 'combat',
      icon: '👁️',
      hotkey: '[,]',
      color: 'border-cyan-400/50 bg-cyan-950/40 text-cyan-300',
      desc: '해킹된 우호적 센티넬 드론, 광역 EMP 기절 및 자동 사격',
      onClick: () => onOpenModal('laylaps')
    },
    {
      id: 'outlaw-station',
      name: '무법자 해적 정거장',
      category: 'combat',
      icon: '☠️',
      hotkey: '[\\]',
      color: 'border-red-400/50 bg-red-950/40 text-red-300',
      desc: '현상금 사냥 집행, 위조 신분증 세탁 및 불법 밀수 시장',
      onClick: () => onOpenModal('outlaw-station')
    },
    {
      id: 'organic-fleet',
      name: '생체 호위함대 & 사이코닉 알',
      category: 'combat',
      icon: '🐙',
      hotkey: '[F2]',
      color: 'border-purple-400/50 bg-purple-950/40 text-purple-300',
      desc: '심해 생체 호위함 먹이 급여 변이 및 생체함선 기술 부화',
      onClick: () => onOpenModal('organic-fleet')
    },
    {
      id: 'expedition',
      name: '성간 원정대 & 마일스톤',
      category: 'combat',
      icon: '🏆',
      hotkey: '[F3]',
      color: 'border-amber-400/50 bg-amber-950/40 text-amber-300',
      desc: '5단계 원정 완수, 황금 벡터 & 스타본 러너 전설 함선',
      onClick: () => onOpenModal('expedition')
    },
    {
      id: 'egg-sequencer',
      name: '알 염기서열기 & 유전자 개조',
      category: 'combat',
      icon: '🧬',
      hotkey: '[F4]',
      color: 'border-emerald-400/50 bg-emerald-950/40 text-emerald-300',
      desc: '동행 생물 4대 유전자(크기/체색/공격성/변이) 재조합 부화',
      onClick: () => onOpenModal('egg-sequencer')
    },
    {
      id: 'fishing',
      name: '아쿠아리우스 해양 낚시 도감',
      category: 'combat',
      icon: '🎣',
      hotkey: '[Home]',
      color: 'border-cyan-400/50 bg-cyan-950/40 text-cyan-300',
      desc: '엑소스키프 전개, 외계 어종 낚시, 통발 및 해양 요리',
      onClick: () => onOpenModal('fishing')
    },

    // 🛸 v3.54 - v3.63 최신 시스템
    {
      id: 'station',
      name: '우주정거장 & 3대 길드',
      category: 'galaxy',
      icon: '🛸',
      hotkey: '[PageUp]',
      color: 'border-cyan-400/50 bg-cyan-950/40 text-cyan-300',
      desc: '궤도 정거장 무역, 3대 길드 의뢰, 함선 개조 및 암시장',
      onClick: () => onOpenModal('station')
    },
    {
      id: 'sandworm',
      name: '거대 샌드웜 & 이머전스 둥지',
      category: 'combat',
      icon: '🪱',
      hotkey: '[End]',
      color: 'border-yellow-400/50 bg-yellow-950/40 text-yellow-300',
      desc: '모래벌레 피리 소환, 사악한 자손 토벌, 샌드웜 탑승',
      onClick: () => onOpenModal('sandworm')
    },
    {
      id: 'base-computer',
      name: '베이스 컴퓨터 & 전력망',
      category: 'base',
      icon: '🏠',
      hotkey: '[F11]',
      color: 'border-teal-400/50 bg-teal-950/40 text-teal-300',
      desc: '기지 전력망 관리, 자동 추출기 수확, 아카이브 해독',
      onClick: () => onOpenModal('base-computer')
    },
    {
      id: 'abandoned-building',
      name: '버려진 건물 & 속삭이는 알',
      category: 'base',
      icon: '☣️',
      hotkey: '[F12]',
      color: 'border-emerald-400/50 bg-emerald-950/40 text-emerald-300',
      desc: '속삭이는 알 파괴, 생물학적 공포 소탕, 유충 코어 정제',
      onClick: () => onOpenModal('abandoned-building')
    },
    {
      id: 'archaeology',
      name: '고고학 뼈 발굴 & 위성 고철',
      category: 'galaxy',
      icon: '🦴',
      hotkey: '[F5]',
      color: 'border-amber-400/50 bg-amber-950/40 text-amber-300',
      desc: '고대 화석 지층 굴착, 추락 위성 인양, 학회 박물관 기증',
      onClick: () => onOpenModal('archaeology')
    },
    {
      id: 'specialist-terminals',
      name: '기지 5대 전문가 & 콜로서스',
      category: 'base',
      icon: '🏛️',
      hotkey: '[Y]',
      color: 'border-cyan-400/50 bg-cyan-950/40 text-cyan-300',
      desc: '건설/과학/무기/농경/차량 전문가 및 8륜 콜로서스 채광차',
      onClick: () => onOpenModal('specialist-terminals')
    },
    {
      id: 'pirate-flagship',
      name: '해적 드레드노트 기함 지휘',
      category: 'combat',
      icon: '🏴‍☠️',
      hotkey: '[Shift+H]',
      color: 'border-red-500/50 bg-red-950/40 text-red-300',
      desc: '나포된 해적 기함, 8문 헤비 터렛 궤도 폭격 및 암시장 조공',
      onClick: () => onOpenModal('pirate-flagship')
    },
    {
      id: 'large-refiner',
      name: '대형 3슬롯 정제기 & 연금술',
      category: 'base',
      icon: '⚗️',
      hotkey: '[Shift+R]',
      color: 'border-amber-400/50 bg-amber-950/40 text-amber-300',
      desc: '3원소 동시 정제, 무한 염소/농축탄소 증식, 양자 촉매',
      onClick: () => onOpenModal('large-refiner')
    },
    {
      id: 'atlantid-tool',
      name: '아틀란티드 멀티툴 & 룬 제단',
      category: 'gear',
      icon: '🔮',
      hotkey: '[Shift+G]',
      color: 'border-purple-400/50 bg-purple-950/40 text-purple-300',
      desc: '코르박스 룬 제단 공양, 일체형 룬 렌즈 및 광역 공명 채광',
      onClick: () => onOpenModal('atlantid-tool')
    },
    {
      id: 'livestock-ranch',
      name: '외계 생물 목장 & 가축 수확기',
      category: 'base',
      icon: '🥛',
      hotkey: '[Shift+U]',
      color: 'border-emerald-400/50 bg-emerald-950/40 text-emerald-300',
      desc: '자율 배식기 착유, 외계 제과 요리 납품, 품종 개량',
      onClick: () => onOpenModal('livestock-ranch')
    },
    {
      id: 'abyssal-horror',
      name: '심해 유적 & 매혹적인 조개',
      category: 'galaxy',
      icon: '🌊',
      hotkey: '[Shift+O]',
      color: 'border-cyan-400/50 bg-cyan-950/40 text-cyan-300',
      desc: '심해 185u 해구 유적 탐사, 살아있는 진주 채취, 심해 공포 토벌',
      onClick: () => onOpenModal('abyssal-horror')
    },
    {
      id: 'boundary-failure',
      name: '차원 경계 붕괴 & 피의 엘릭서',
      category: 'galaxy',
      icon: '🔮',
      hotkey: '[Shift+B]',
      color: 'border-violet-400/50 bg-violet-950/40 text-violet-300',
      desc: '거대 경계 고리, 텔라몬 기록, 3대 엘릭서 양조, 유령 토벌',
      onClick: () => onOpenModal('boundary-failure')
    },
    {
      id: 'living-ship',
      name: '생체 함선 스타버스 & 장기 배양',
      category: 'ship',
      icon: '🌱',
      hotkey: '[Shift+K]',
      color: 'border-rose-400/50 bg-rose-950/40 text-rose-300',
      desc: '보이드 에그 각성, 4대 생체 장기 배양, 유기체 무장 진화',
      onClick: () => onOpenModal('living-ship')
    },
    {
      id: 'floating-islands',
      name: '부유하는 하늘 섬 & 폭포 피난처',
      category: 'galaxy',
      icon: '🏝️',
      hotkey: '[Shift+J]',
      color: 'border-emerald-400/50 bg-emerald-950/40 text-emerald-300',
      desc: '성층권 부유 대륙, 안개 수액 채취, 무중력 절벽 다이브',
      onClick: () => onOpenModal('floating-islands')
    },
    {
      id: 'guild-envoy',
      name: '우주정거장 3대 길드 사절단',
      category: 'galaxy',
      icon: '🎖️',
      hotkey: '[Shift+M]',
      color: 'border-yellow-400/50 bg-yellow-950/40 text-yellow-300',
      desc: '상인/용병/탐험가 길드 평판 및 랭크별 무료 보급품 수령',
      onClick: () => onOpenModal('guild-envoy')
    },
    {
      id: 'galactic-core',
      name: '은하 중심 특이점 & 4대 은하 도약',
      category: 'galaxy',
      icon: '🌌',
      hotkey: '[Shift+C]',
      color: 'border-indigo-400/50 bg-indigo-950/40 text-indigo-300',
      desc: '아틀라스 시뮬레이션 각성, 힐베르트/칼립소/아이센탐 차원 전송',
      onClick: () => onOpenModal('galactic-core')
    },
    {
      id: 'starship-weapons',
      name: '스타쉽 5대 첨단 무장 시스템',
      category: 'ship',
      icon: '🚀',
      hotkey: '[Shift+X]',
      color: 'border-sky-400/50 bg-sky-950/40 text-sky-300',
      desc: '포톤 캐논, 인프라-나이프, 포지트론 이젝터, 사이클로트론, 로켓',
      onClick: () => onOpenModal('starship-weapons')
    },
    {
      id: 'hazard-protection',
      name: '엑소슈트 4대 극한 환경 보호막',
      category: 'gear',
      icon: '🛡️',
      hotkey: '[Shift+E]',
      color: 'border-amber-400/50 bg-amber-950/40 text-amber-300',
      desc: '혹한/극열/독성/방사능 특수 실드 재충전 및 과급 강화',
      onClick: () => onOpenModal('hazard-protection')
    },
    {
      id: 'multi-tool-salvage',
      name: '멀티툴 고철 분해 & 슬롯 확장',
      category: 'gear',
      icon: '🔧',
      hotkey: '[Shift+V]',
      color: 'border-emerald-400/50 bg-emerald-950/40 text-emerald-300',
      desc: '다목적 도구 분해 인양, 확장 슬롯 모듈 적용, S-Class 최종 승급',
      onClick: () => onOpenModal('multi-tool-salvage')
    },
    {
      id: 'cartographer',
      name: '정거장 지도제작자 & 5대 행성 차트',
      category: 'galaxy',
      icon: '🗺️',
      hotkey: '[Shift+L]',
      color: 'border-emerald-400/50 bg-emerald-950/40 text-emerald-300',
      desc: '항법 데이터 교환, 조난/상업/유적/보안/정착지 정밀 좌표 스캔',
      onClick: () => onOpenModal('cartographer')
    },
    {
      id: 'exosuit-upgrade',
      name: '엑소슈트 용량 증설 & 드롭 포드',
      category: 'gear',
      icon: '👕',
      hotkey: '[Shift+I]',
      color: 'border-blue-400/50 bg-blue-950/40 text-blue-300',
      desc: '정거장 홀로그램 슬롯 구매, 행성 추락 드롭 포드 부품 수리',
      onClick: () => onOpenModal('exosuit-upgrade')
    },
    {
      id: 'milestones',
      name: '은하계 여행자 10대 마일스톤',
      category: 'galaxy',
      icon: '🏆',
      hotkey: '[Shift+Y]',
      color: 'border-yellow-400/50 bg-yellow-950/40 text-yellow-300',
      desc: '도보/외계어/유닛/전투/생존 단계별 나노로봇 & 유닛 보상 일괄 수령',
      onClick: () => onOpenModal('milestones')
    },
    {
      id: 'derelict-freighter',
      name: '버려진 화물선 탐사 & 잔해 인양',
      category: 'galaxy',
      icon: '☠️',
      hotkey: '[Shift+O]',
      color: 'border-amber-400/50 bg-amber-950/40 text-amber-300',
      desc: '극저온 진공 (-48.5°C) 격실 돌파, 오염된 금속 및 화물 격벽 인양',
      onClick: () => onOpenModal('derelict-freighter')
    },
    {
      id: 'extreme-weather',
      name: '극한 기후 현상 및 대기 이상 관측소',
      category: 'galaxy',
      icon: '⚡',
      hotkey: '[Shift+F3]',
      color: 'border-amber-400/50 bg-amber-950/40 text-amber-300',
      desc: '중력 이상 폭풍, 유성우 폭격 및 용융 운석 핵 정제 추출',
      onClick: () => onOpenModal('extreme-weather')
    },
    {
      id: 'volcano',
      name: '칼데라 지열 발전소 & 바살트 정련소',
      category: 'base',
      icon: '🌋',
      hotkey: "[Shift+']",
      color: 'border-orange-400/50 bg-orange-950/40 text-orange-300',
      desc: '480°C 초고온 지열 발전, 바살트 채굴 및 마그마 코어 제련',
      onClick: () => onOpenModal('volcano')
    },
    {
      id: 'aquarium',
      name: '심해 크라켄 해구 탐사 & 트로피 수족관',
      category: 'galaxy',
      icon: '🦑',
      hotkey: '[Shift+End]',
      color: 'border-teal-400/50 bg-teal-950/40 text-teal-300',
      desc: '1,250m 심해 잠수종 하강, 최면의 눈 및 트로피 수족관 배당',
      onClick: () => onOpenModal('aquarium')
    },
    {
      id: 'spacewalk',
      name: '화물선 외벽 캣워크 & 무중력 EVA 우주유영',
      category: 'ship',
      icon: '🌌',
      hotkey: '[Shift+F6]',
      color: 'border-cyan-400/50 bg-cyan-950/40 text-cyan-300',
      desc: '선체 외벽 보도교 관측, 심우주 전파 천문대 및 진공 집진기',
      onClick: () => onOpenModal('spacewalk')
    },
    {
      id: 'bioluminescent-forest',
      name: '생체 발광 포자 숲 & 에테르 하늘가오리',
      category: 'galaxy',
      icon: '🌌',
      hotkey: '[Shift+F2]',
      color: 'border-emerald-400/50 bg-emerald-950/40 text-emerald-300',
      desc: '형광 포자목 원액 채취, 에테르 하늘가오리 비행 교감',
      onClick: () => onOpenModal('bioluminescent-forest')
    },
    {
      id: 'race-initiator',
      name: '엑소크래프트 레이스 트랙 스타터',
      category: 'base',
      icon: '🏁',
      hotkey: '[Shift+F4]',
      color: 'border-yellow-400/50 bg-yellow-950/40 text-yellow-300',
      desc: '타임어택 서킷 아치, 체크포인트 게이트 및 부스터 램프',
      onClick: () => onOpenModal('race-initiator')
    },
    {
      id: 'titan-beetle',
      name: '거대 비행 타이탄 비틀 활공 탈것',
      category: 'gear',
      icon: '🪲',
      hotkey: '[Shift+F5]',
      color: 'border-emerald-400/50 bg-emerald-950/40 text-emerald-300',
      desc: '성층권 28.5 u/s 활공 비행, 에테르 꽃가루 채취',
      onClick: () => onOpenModal('titan-beetle')
    },
    {
      id: 'short-range-teleporter',
      name: '기지 단거리 텔레포터 & 양자 도관망',
      category: 'base',
      icon: '🌀',
      hotkey: '[Shift+F7]',
      color: 'border-cyan-400/50 bg-cyan-950/40 text-cyan-300',
      desc: '480u 케이블 즉시 양자 순간이동, 타키온 도관 과급',
      onClick: () => onOpenModal('short-range-teleporter')
    },
    {
      id: 'em-generator',
      name: 'S-Class 전자기 발전소 & 무한 전력망',
      category: 'base',
      icon: '⚡',
      hotkey: '[Shift+F8]',
      color: 'border-violet-400/50 bg-violet-950/40 text-violet-300',
      desc: '행성 지자기장 핵 직결 24시간 +1,200 kPk 상시 발전, EMP 충격파',
      onClick: () => onOpenModal('em-generator')
    },
    {
      id: 'aquatic-base',
      name: '심해 수밀 해양 기지 & 수중 문풀',
      category: 'base',
      icon: '🌊',
      hotkey: '[Shift+F12]',
      color: 'border-cyan-400/50 bg-cyan-950/40 text-cyan-300',
      desc: '450m 해양 해구 수밀 돔, 산소 여과 순환 및 문풀 해저 잠수',
      onClick: () => onOpenModal('aquatic-base')
    },
    {
      id: 'power-grid',
      name: '기지 태양광 발전소 & 배터리 뱅크 허브',
      category: 'base',
      icon: '⚡',
      hotkey: '[Shift+F11]',
      color: 'border-yellow-400/50 bg-yellow-950/40 text-yellow-300',
      desc: '+350 kPk 광전기 발전, 커패시터 과급 및 10,000 kPk 축전',
      onClick: () => onOpenModal('power-grid')
    },
    {
      id: 'gas-harvester',
      name: '대기 기체 하베스터 & 화학 합성 정제소',
      category: 'base',
      icon: '💨',
      hotkey: '[Shift+7]',
      color: 'border-emerald-400/50 bg-emerald-950/40 text-emerald-300',
      desc: '라돈/질소/설퍼린 대기 가스 추출, 초전도체/반도체 합성',
      onClick: () => onOpenModal('gas-harvester')
    },
    {
      id: 'ship-paint',
      name: '우주선 도색, 외형 데칼 & 배기 흔적 튜닝',
      category: 'ship',
      icon: '🎨',
      hotkey: '[Shift+F1]',
      color: 'border-fuchsia-400/50 bg-fuchsia-950/40 text-fuchsia-300',
      desc: '선체 6종 컬러웨이, 팩션 엠블럼 데칼 및 플라즈마 배기 흔적',
      onClick: () => onOpenModal('ship-paint')
    },
    {
      id: 'custom-difficulty',
      name: '커스텀 게임 모드 & 8대 난이도 조절',
      category: 'gear',
      icon: '⚙️',
      hotkey: '[Shift+F9]',
      color: 'border-amber-400/50 bg-amber-950/40 text-amber-300',
      desc: '유해 환경, 전투, 센티넬, 제작 비용, 사망 패널티 실시간 튜닝',
      onClick: () => onOpenModal('custom-difficulty')
    }
  ];

  const filtered = actions.filter((act) => {
    const matchTab = activeTab === 'all' || act.category === activeTab;
    const matchQuery =
      searchQuery.trim() === '' ||
      act.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.hotkey.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md transition-opacity">
      {/* Drawer Container */}
      <div className="w-full max-h-[88vh] bg-slate-950 border-t-2 border-cyan-400/80 rounded-t-3xl flex flex-col shadow-[0_-10px_35px_rgba(0,229,255,0.25)] overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Top Handle & Title Header */}
        <div className="px-4 pt-3 pb-2 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌌</span>
            <div>
              <div className="text-sm font-bold text-white nms-header-font tracking-wider">
                NMS 모바일 퀵 커맨드 허브
              </div>
              <div className="text-[10px] text-cyan-300 font-mono">
                터치 한 번으로 게임 내 모든 시스템 및 모달 즉시 실행
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              AudioSys.playNote(220, 'sine', 0.1);
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-2 border-b border-white/5 bg-slate-900/60 flex items-center gap-2">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            type="text"
            placeholder="시스템 또는 기능 검색 (예: 솔라선, 낚시, 포탈, 인벤토리, 원정대...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-gray-500 outline-none font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-gray-400 hover:text-white text-xs px-1 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Horizontal Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto custom-scrollbar border-b border-white/10 bg-slate-900/80 text-xs">
          {[
            { id: 'all', label: '전체 (All)', icon: '✨' },
            { id: 'ship', label: '🛸 함선/비행', icon: '🛸' },
            { id: 'gear', label: '🎒 인벤토리/장비', icon: '🎒' },
            { id: 'galaxy', label: '🪐 성간탐사/은하', icon: '🪐' },
            { id: 'base', label: '🏛️ 기지/정착지', icon: '🏛️' },
            { id: 'combat', label: '⚔️ 전투/함대', icon: '⚔️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                AudioSys.playNote(480, 'sine', 0.05);
                setActiveTab(tab.id as typeof activeTab);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-bold font-mono whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                activeTab === tab.id
                  ? 'bg-cyan-500 text-black shadow-sm font-extrabold shadow-cyan-400/50'
                  : 'bg-slate-800 text-gray-300 hover:text-white border border-white/10'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Action Grid Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pb-safe">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                AudioSys.playNote(540, 'sine', 0.08);
                onClose();
                item.onClick();
              }}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-transform active:scale-[0.98] ${item.color}`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div className="flex flex-col overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white font-mono truncate">
                      {item.name}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 text-gray-300 font-mono border border-white/10 shrink-0">
                      {item.hotkey}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-300 mt-0.5 line-clamp-1">
                    {item.desc}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0" />
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 text-xs font-mono">
              검색 조건에 맞는 시스템이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
