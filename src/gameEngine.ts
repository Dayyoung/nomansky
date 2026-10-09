import { AudioSys } from './audio';
import {
  GameStateEnum,
  ShipType,
  ShipClass,
  ToolMode,
  StarEntity,
  PlanetEntity,
  DepositEntity,
  FaunaSpecies,
  FaunaEntity,
  MountainEntity,
  CaveEntity,
  FloraEntity,
  PlanetSentinelEntity,
  GalacticStar,
  BaseStructure,
  PirateEntity,
  ProjectileEntity,
  ParticleEntity,
  FleetExpedition,
  GameInventory,
  NautilonSubmarineData,
  CombatWeaponsData,
  SecondaryWeaponsData,
  DemoShowcaseState,
  DemoShowcasePhase,
  DifficultyPreset,
  DifficultySettings
} from './types';

export const DIFFICULTY_PRESETS: Record<Exclude<DifficultyPreset, 'CUSTOM'>, DifficultySettings> = {
  NORMAL: {
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
  },
  RELAXED: {
    preset: 'RELAXED',
    hazardDrain: 'RELAXED',
    lifeSupportDrain: 'RELAXED',
    combatDifficulty: 'WEAK',
    sentinelAggression: 'LOW',
    craftingCost: 'STANDARD',
    purchaseCost: 'DISCOUNT',
    fuelUsage: 'FREE',
    deathConsequence: 'NONE',
    sprintStamina: 'INFINITE',
    scannerRecharge: 'FAST'
  },
  SURVIVAL: {
    preset: 'SURVIVAL',
    hazardDrain: 'HARSH',
    lifeSupportDrain: 'HARSH',
    combatDifficulty: 'CHALLENGING',
    sentinelAggression: 'HOSTILE',
    craftingCost: 'EXPENSIVE',
    purchaseCost: 'HIGH',
    fuelUsage: 'HIGH',
    deathConsequence: 'PERMADEATH',
    sprintStamina: 'LIMITED',
    scannerRecharge: 'STANDARD'
  },
  PERMADEATH: {
    preset: 'PERMADEATH',
    hazardDrain: 'HARSH',
    lifeSupportDrain: 'HARSH',
    combatDifficulty: 'CHALLENGING',
    sentinelAggression: 'HOSTILE',
    craftingCost: 'EXPENSIVE',
    purchaseCost: 'HIGH',
    fuelUsage: 'HIGH',
    deathConsequence: 'PERMADEATH',
    sprintStamina: 'LIMITED',
    scannerRecharge: 'STANDARD'
  },
  CREATIVE: {
    preset: 'CREATIVE',
    hazardDrain: 'CREATIVE',
    lifeSupportDrain: 'CREATIVE',
    combatDifficulty: 'WEAK',
    sentinelAggression: 'LOW',
    craftingCost: 'FREE',
    purchaseCost: 'DISCOUNT',
    fuelUsage: 'FREE',
    deathConsequence: 'NONE',
    sprintStamina: 'INFINITE',
    scannerRecharge: 'INSTANT'
  }
};

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
}

export interface TouchControlsState {
  joystickVector: { x: number; y: number }; // normalized -1 to 1
  isFiring: boolean;
  isJetpacking: boolean;
  isInteracting: boolean;
  aimAngle: number | null; // manual touch aim angle if touching screen
}

export class GameEngine {
  public canvas: HTMLCanvasElement | null = null;
  public ctx: CanvasRenderingContext2D | null = null;
  public width: number = window.innerWidth;
  public height: number = window.innerHeight;

  public currState: GameStateEnum = 'SPACE';
  public warpProgress: number = 0;
  public warpStreaks: Array<{ angle: number; dist: number; len: number; speed: number; color: string }> = [];

  public player = {
    x: 0,
    y: 500,
    vx: 0,
    vy: 0,
    px: 0,
    py: 0,
    angle: 0,
    facing: 1,
    isMining: false,
    isJetpacking: false,
    anim: 0
  };

  public parkedShip = { x: 0, y: 0, angle: 0 };

  public entities = {
    stars: [] as StarEntity[],
    planets: [] as PlanetEntity[],
    particles: [] as ParticleEntity[],
    spaceProjectiles: [] as ProjectileEntity[],
    projectiles: [] as ProjectileEntity[],
    pirates: [] as PirateEntity[],
    structures: [] as BaseStructure[],
    station: { x: 0, y: 0, r: 250, rot: 0 },
    anomaly: null as { x: number; y: number; r: number; rot: number } | null,
    freighter: null as { x: number; y: number; w: number; h: number; angle: number } | null,
    derelict: null as { x: number; y: number; r: number; rot: number; name: string } | null,
    roamer: null as { x: number; y: number; vx: number; vy: number; angle: number; speed: number; boost: number; isMounted: boolean } | null,
    sentinels: [] as Array<{ id: string; x: number; y: number; vx: number; vy: number; hp: number; maxHp: number; stunTimer?: number }>,
    broodMother: null as { x: number; y: number; facing: number; walkAnim: number; width: number; height: number; active: boolean; hp: number; maxHp: number; stunTimer: number } | null
  };

  public data = {
    units: 18600,
    nanites: 360,
    quicksilver: 0,
    taintedMetal: 500,
    difficultySettings: { ...DIFFICULTY_PRESETS.NORMAL } as DifficultySettings,
    utopiaSpeederClaimed: false,
    shield: 100,
    maxShield: 100,
    hazard: 100,
    lifeSupport: 100,
    weaponCharge: 100,
    toolMode: 'MINING BEAM' as ToolMode,
    shipType: 'MECHANICAL' as ShipType,
    shipClass: 'C' as ShipClass,
    ammo: 24,
    maxAmmo: 24,
    overheat: 0,
    isOverheated: false,
    isPulseActive: false,
    isVisorActive: false,
    isCloaked: false,
    isSheltered: false,
    cargoScanTimer: 0,
    pirateCountdown: 0,
    stormCountdown: 0,
    isStormActive: false,
    sentinelAlert: 0,
    activePlanet: null as PlanetEntity | null,
    interactLabel: null as string | null,
    interactProgress: 0,
    activeInteractAction: null as (() => void) | null,
    floatingTexts: [] as FloatingText[],
    nautilon: {
      unlocked: true,
      boarded: false,
      oxygenLevel: 100,
      fuel: 100,
      livingPearls: 0,
      hadalCores: 0,
      hypnoticEyes: 0,
      engineOverclock: false,
      torpedoLauncher: false,
      tethysMining: false,
      activeTab: 'specs'
    } as NautilonSubmarineData,
    combatWeapons: {
      activeTab: 0,
      activeWeapon: 'boltcaster',
      weapons: {
        boltcaster: { name: '볼트캐스터 (Boltcaster)', unlocked: true, supercharged: true, damage: 32, rate: 0.12, baseDps: 2600, dps: 3400, magSize: 64, curMag: 64, color: '#facc15' },
        scatterBlaster: { name: '산탄 블래스터 (Scatter Blaster)', unlocked: true, supercharged: false, damage: 128, rate: 0.45, baseDps: 3200, dps: 3200, magSize: 32, curMag: 32, color: '#ef4444' },
        pulseSpitter: { name: '펄스 스피터 (Pulse Spitter)', unlocked: true, supercharged: false, damage: 24, rate: 0.08, baseDps: 3800, dps: 3800, magSize: 80, curMag: 80, color: '#f97316' },
        neutronCannon: { name: '중성자 캐논 (Neutron Cannon)', unlocked: true, supercharged: false, damage: 85, rate: 0.35, baseDps: 4100, dps: 4100, magSize: 50, curMag: 50, color: '#10b981' },
        blazeJavelin: { name: '블레이즈 자벨린 (Blaze Javelin)', unlocked: true, supercharged: false, damage: 180, rate: 0.8, baseDps: 4500, dps: 4500, magSize: 20, curMag: 20, color: '#a855f7' }
      },
      glassRefined: false,
      munitionsSupplied: false,
      overclockActive: false,
      grantClaimed: false
    } as CombatWeaponsData,
    secondaryWeapons: {
      active: 'plasmaLauncher',
      ammo: {
        plasmaLauncher: 20,
        geologyCannon: 20,
        personalForcefield: 100,
        cloakingDevice: 100,
        paralysisMortar: 15
      }
    } as SecondaryWeaponsData,
    demoShowcase: {
      isActive: false,
      phase: 'SPACE_PULSE',
      phaseIndex: 0,
      totalPhases: 14,
      title: '초광속 펄스 드라이브 & 성간 항법',
      description: '광활한 유클리드 은하를 고속으로 순항하며 인근 행성과 우주 정거장을 탐색합니다.',
      subText: '[Space] 키를 누르면 펄스 엔진이 점화되어 36 u/s 초광속으로 질주합니다.',
      activeModal: null,
      phaseDuration: 5500,
      phaseElapsed: 0
    } as DemoShowcaseState,
    inv: {
      oxygen: 50,
      sodium: 35,
      carbon: 95,
      ferrite: 140,
      silicate: 45,
      pugneum: 10,
      dihydrogen: 30,
      tritium: 80,
      chromaticMetal: 25,
      warpCell: 3,
      pureFerrite: 0,
      condensedCarbon: 0,
      diHydrogenJelly: 0,
      portableRefiner: 1,
      baseComputer: 1,
      ancientArtifact: 0,
      dreadnoughtAIFragment: 1,
      microprocessor: 2,
      metalPlating: 4,
      stormCrystal: 0,
      walkerBrain: 0,
      voidEgg: 0,
      creaturePellets: 10,
      creatureEgg: 0,
      broadcastReceiver: 1,
      taintedMetal: 500,
      repairKit: 0,
      emergencyReceiver: 1,
      cargoBulkhead: 0,
      geknip: 0,
      firstSpawnRelic: 0,
      counterfeitCircuits: 0,
      blackMarketArms: 0,
      radiantShard: 3,
      atlantideum: 50,
      echoLocator: 1
    } as GameInventory,

    creatureRanch: {
      activeTab: 0,
      herdCount: 12,
      feederFilled: true,
      milkCount: 12,
      eggsCount: 15,
      honeyCount: 8,
      upgradedYield: false,
      totalHarvestCycles: 8
    },
    atlantidTool: {
      activeTab: 0,
      awakened: false,
      class: "S-CLASS GEOMETRIC MONOLITH",
      runicLensDamage: 380,
      miningMultiplier: 2.5,
      overcharged: false,
      resonanceCycles: 0,
      atlantideumOffered: 0
    },
    largeRefiner: {
      activeTab: 0,
      slot1: { item: 'oxygen', name: '산소 (Oxygen, O2)', count: 250 },
      slot2: { item: 'chlorine', name: '염소 (Chlorine, Cl)', count: 120 },
      slot3: { item: 'condensedCarbon', name: '농축 탄소 (C+)', count: 80 },
      output: { item: 'pureChlorine', name: '증식된 염소 (Chlorine x6)', count: 300, value: 1200000, nanites: 0 },
      isRefining: false,
      overclocked: false,
      totalRefinedCycles: 15
    },
    pirateFlagship: {
      claimed: true,
      name: "The Crimson Leviathan",
      shield: 850,
      maxShield: 850,
      turretsCount: 8,
      activeTab: 0,
      bombardmentReady: true,
      tributeAvailable: true,
      tributesCollected: 0
    },
    specialistTerminals: {
      activeTab: 0,
      overseer: { hired: true, level: 3, glass: 6, productivity: 1.25 },
      scientist: { hired: true, level: 3, lubricant: 4, semiconductor: 2 },
      armorer: { hired: true, level: 3, weaponBonus: 30, coilsCalibrated: true },
      farmer: { hired: true, level: 3, cropsHarvested: 28, fertilizers: 5 },
      technician: { hired: true, level: 3, colossusUnlocked: true }
    },
    colossus: {
      deployed: false,
      mounted: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      laserCharge: 100,
      cargoCount: 24,
      maxCargo: 42,
      shield: 500,
      maxShield: 500,
      overclocked: false
    },
    archaeology: {
      active: true,
      located: true,
      fossilSitesExcavated: 0,
      salvageScrapsCollected: 0,
      bonesInventory: [
        { id: 'bone_1', name: '원형 보존된 고대 두개골 (Pristine Ancient Skull)', rarity: 'LEGENDARY', ageMyr: 125.4, valueUnits: 1850000, valueNanites: 650, icon: '💀', desc: '초고대 거대 파충류의 턱 구조가 온전히 보존된 최상급 두개골 화석.' },
        { id: 'bone_2', name: '석화된 타이탄 대퇴골 (Petrified Titan Femur)', rarity: 'RARE', ageMyr: 84.2, valueUnits: 850000, valueNanites: 350, icon: '🦴', desc: '수천만 년의 지각 압력에 의해 규화된 거대 보행 생물의 대퇴골.' },
        { id: 'bone_3', name: '석회화된 흉곽 갈비뼈 (Calcified Ribcage)', rarity: 'COMMON', ageMyr: 35.8, valueUnits: 350000, valueNanites: 150, icon: '🩻', desc: '고대 초식 생물의 흉곽 골격 파편.' }
      ],
      salvagedScrap: {
        cores: 3,
        nanowire: 6
      },
      museumDonations: 0,
      oldestFossilAge: 125.4
    },
    abandonedBuilding: {
      active: true,
      located: true,
      swarmAwakened: false,
      larvalCores: 8,
      eggsRemaining: 12,
      maxEggs: 16,
      horrorsSlain: 0,
      terminalLogs: [
        { id: 1, title: "오염 단말기 기록 #01 // 벽 속의 긁는 소리", decrypted: true, desc: "벽 속에서 무언가가 긁는 소리가 들린다. 공기가 유황과 썩은 살점 냄새로 차오른다.", nanites: 500, units: 300000 },
        { id: 2, title: "오염 단말기 기록 #02 // 부화한 이빨", decrypted: false, desc: "외부 채광 구역의 알들이 부화했다. 그것들은 눈이 없다. 오직 이빨과 턱만 있을 뿐이다.", nanites: 750, units: 450000 },
        { id: 3, title: "오염 단말기 기록 #03 // 격리 프로토콜 붕괴", decrypted: false, desc: "격리 프로토콜 실패. 터미널 데이터 백업... 만약 이 기록을 읽는 여행자가 있다면, 도망쳐라.", nanites: 1200, units: 700000 }
      ]
    },
    baseComputer: {
      claimed: true,
      baseName: "유클리드 제1 전초기지 (Euclid Prime Outpost)",
      planetName: "Lush Paradise",
      systemName: "Euclid Capital Sector",
      teleportLinked: true,
      powerGrid: {
        generationKw: 150,
        consumptionKw: 80,
        batteryKWh: 95000,
        maxBatteryKWh: 100000,
        overcharged: false
      },
      extractors: {
        pureFerrite: 250,
        oxygen: 180,
        nitrogen: 80
      },
      archives: [
        { id: 1, title: "기록 #16A // 생명 유지 장치 임계치", decrypted: true, desc: "행성 지표면 착륙... 대기 분석 완료. 이전 개체의 잔류 데이터 추출 중...", nanites: 450, units: 250000 },
        { id: 2, title: "기록 #16B // 텔라몬 신호 동기화 실패", decrypted: false, desc: "시뮬레이션 왜곡 감지... 텔라몬과의 마지막 통신 로그 해독.", nanites: 600, units: 350000 },
        { id: 3, title: "기록 #16C // 16분 카운트다운의 메아리", decrypted: false, desc: "아틀라스의 16분 카운트다운... 우주 경계 너머의 기록 보관소 발견.", nanites: 1000, units: 500000 }
      ],
      blueprints: [
        { id: 'bp_solar', name: '고출력 태양광 패널 어레이', researched: false, costNanites: 400, desc: '기지 전력 발전량 +100 kW 영구 증강', icon: '☀️' },
        { id: 'bp_gas', name: '대기 가스 고압 추출기', researched: false, costNanites: 600, desc: '산소 및 대기 희귀 가스 추출량 2배 증폭', icon: '💨' },
        { id: 'bp_defense', name: '전초기지 자동 방어 파일론', researched: false, costNanites: 800, desc: '해적 및 센티넬 접근 시 자동 격퇴 역장 전개', icon: '🛡️' }
      ]
    },
    sandworm: {
      active: true,
      seismicWarning: true,
      wormFluteTuned: true,
      burrowsCleared: 0,
      wormsSummoned: 0,
      tendrilsSlain: 0,
      materials: {
        cursedDust: 65,
        vileSpawn: 4,
        fleshRope: 6
      },
      companion: {
        hatched: true,
        name: "샤이-훌루드 심연의 포식자 (Colossal Shai-Hulud)",
        species: "거대 비행 샌드웜 (Titan Leviathan)",
        trust: 100,
        speed: "18.5 u/s (초고속 비행)",
        mounted: false
      },
      records: {
        largestLength: 142.5,
        subterraneanSpeed: 84.0
      },
      lastEncounter: null as { length: string; time: string; desc: string } | null
    }
  };

  public touchControls: TouchControlsState = {
    joystickVector: { x: 0, y: 0 },
    isFiring: false,
    isJetpacking: false,
    isInteracting: false,
    aimAngle: null
  };

  public mouse = { x: 0, y: 0, isDown: false };
  public keyboard = { w: 0, a: 0, s: 0, d: 0, space: 0, shift: 0, e: 0 };

  private listeners: Array<() => void> = [];
  private nextTextId: number = 1;
  private shipFireCooldown: number = 0;
  private nearPlanetAlertId: string | null = null;
  private boundaryCooldown: number = 0;
  private insidePlanetInFlight: string | null = null;

  // Camera Zoom (Supports multi-touch pinch to zoom and mouse wheel)
  public cameraZoom: number = 1.0;

  // Auto-Pilot System (10s idle trigger, random planets, 3min stay, auto-resource generation)
  public isAutoPilot: boolean = false;
  public autoPilotTargetPlanet: PlanetEntity | null = null;
  public autoPilotPlanetStartTime: number = 0;
  public autoPilotTotalResourcesGained: number = 0;
  private lastInputTime: number = Date.now();
  private autoPilotResourceTimer: number = 0;
  private autoPilotWanderAngle: number = 0;

  constructor() {
    this.initUniverse();
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    for (const cb of this.listeners) {
      cb();
    }
  }

  public initUniverse() {
    this.entities.stars = [];
    for (let i = 0; i < 350; i++) {
      this.entities.stars.push({
        x: (Math.random() - 0.5) * 35000,
        y: (Math.random() - 0.5) * 35000,
        z: Math.random() * 2 + 0.5,
        size: Math.random() * 2.2
      });
    }

    const planetTypes = [
      { type: 'Dissonant', color: '#8b5cf6', hazardType: 'DISSONANCE' },
      { type: 'Radioactive', color: '#8ac926', hazardType: 'RADIATION' },
      { type: 'Toxic', color: '#38b000', hazardType: 'TOXICITY' },
      { type: 'Frozen', color: '#48cae4', hazardType: 'EXTREME COLD' },
      { type: 'Scorched', color: '#ff7b00', hazardType: 'HEAT' },
      { type: 'Lush Paradise', color: '#00f5d4', hazardType: 'TEMPERATE' }
    ];

    this.entities.planets = [];
    for (let i = 0; i < 4; i++) {
      const ang = (Math.PI * 2 * i) / 4 + 0.3;
      const dist = 2200 + i * 1600;
      const pt = planetTypes[i % planetTypes.length];
      const pName = `PLANET OMYA-${String.fromCharCode(65 + i)}`;

      const planet: PlanetEntity = {
        name: pName,
        x: Math.cos(ang) * dist,
        y: Math.sin(ang) * dist,
        r: 1100 + (i % 2) * 250,
        color: pt.color,
        type: pt.type,
        hazardType: pt.hazardType,
        craters: [],
        deposits: [],
        faunaSpecies: [],
        fauna: [],
        waterBodies: [],
        mountains: [],
        caves: [],
        flora: [],
        planetSentinels: []
      };

      // 1. Procedural Oceans & Lakes (WaterBodies / Lava lakes)
      const waterCount = pt.hazardType === 'HEAT' ? 2 : (pt.hazardType === 'TEMPERATE' ? 4 : 3);
      for (let w = 0; w < waterCount; w++) {
        const wAng = (Math.PI * 2 * w) / waterCount + (Math.random() - 0.5) * 0.5;
        const wDist = 280 + Math.random() * (planet.r * 0.45);
        const isLava = pt.hazardType === 'HEAT';
        planet.waterBodies.push({
          id: `water_${i}_${w}`,
          cx: Math.cos(wAng) * wDist,
          cy: Math.sin(wAng) * wDist,
          r: 120 + Math.random() * 110,
          color: isLava ? 'rgba(239, 68, 68, 0.75)' : (pt.hazardType === 'EXTREME COLD' ? 'rgba(56, 189, 248, 0.7)' : 'rgba(6, 182, 212, 0.65)'),
          waveOffset: Math.random() * Math.PI * 2,
          trapPots: []
        });
      }

      // 2. Procedural Mountains & Active Volcanoes
      const mountainCount = 6 + Math.floor(Math.random() * 4);
      for (let m = 0; m < mountainCount; m++) {
        const mAng = Math.random() * Math.PI * 2;
        const mDist = 180 + Math.random() * (planet.r * 0.7);
        const isVolcano = pt.hazardType === 'HEAT' ? (m % 2 === 0) : (m === 0 && Math.random() < 0.4);
        planet.mountains!.push({
          id: `mnt_${i}_${m}`,
          lx: Math.cos(mAng) * mDist,
          ly: Math.sin(mAng) * mDist,
          r: 65 + Math.random() * 60,
          height: 80 + Math.random() * 60,
          color: isVolcano ? '#7f1d1d' : (pt.hazardType === 'EXTREME COLD' ? '#334155' : '#1e293b'),
          isVolcano,
          lavaTimer: Math.random() * 100
        });
      }

      // 3. Subterranean Caves & Luminous Crystal Caverns
      const caveCount = 3 + Math.floor(Math.random() * 3);
      for (let c = 0; c < caveCount; c++) {
        const cAng = Math.random() * Math.PI * 2;
        const cDist = 220 + Math.random() * (planet.r * 0.65);
        planet.caves!.push({
          id: `cave_${i}_${c}`,
          lx: Math.cos(cAng) * cDist,
          ly: Math.sin(cAng) * cDist,
          r: 45 + Math.random() * 25,
          name: `심연의 동굴 #${c + 1} (${planet.name})`,
          crystalType: pt.hazardType === 'DISSONANCE' ? '보이드 코어 수정' : '발광 코발트 결정'
        });
      }

      // 4. Procedural Flora (Alien Trees, Giant Spores, Glowing Spikes)
      const floraTypes: Array<'TREE' | 'MUSHROOM' | 'CORAL' | 'SPIRE' | 'FLOWER'> = ['TREE', 'MUSHROOM', 'CORAL', 'SPIRE', 'FLOWER'];
      const floraCount = 45;
      for (let f = 0; f < floraCount; f++) {
        const fAng = Math.random() * Math.PI * 2;
        const fDist = 100 + Math.random() * (planet.r * 0.82);
        const fType = floraTypes[f % floraTypes.length];
        let fCol = '#10b981';
        if (pt.hazardType === 'DISSONANCE') fCol = '#c084fc';
        else if (pt.hazardType === 'RADIATION') fCol = '#a3e635';
        else if (pt.hazardType === 'TOXICITY') fCol = '#4ade80';
        else if (pt.hazardType === 'EXTREME COLD') fCol = '#38bdf8';
        else if (pt.hazardType === 'HEAT') fCol = '#fb923c';
        else fCol = '#2dd4bf';

        planet.flora!.push({
          id: `flora_${i}_${f}`,
          lx: Math.cos(fAng) * fDist,
          ly: Math.sin(fAng) * fDist,
          type: fType,
          size: 16 + Math.random() * 20,
          color: fCol,
          swayOffset: Math.random() * Math.PI * 2
        });
      }

      // 5. Procedural Alien Fauna (Herbivores, Bipedal Dinos, Floating Jelly, Predators)
      const speciesList: FaunaSpecies[] = [
        {
          id: `spec_${i}_1`,
          latinName: `${pName.slice(-1)}. Striderus Gigas`,
          commonName: `${pt.type} 거대 4족 보행수`,
          classType: 'THEROPOD / MEGAFAUNA',
          diet: '초식 (대형 외계 균류 섭취)',
          temperament: '온순함 (Docile)',
          height: '4.8m',
          weight: 780,
          color: pt.color,
          isDiscovered: true
        },
        {
          id: `spec_${i}_2`,
          latinName: `${pName.slice(-1)}. Raptor Voidus`,
          commonName: `${pt.type} 날렵한 2족 보행룡`,
          classType: 'BIPEDAL RAPTOR',
          diet: '육식 (주변 소형 생물 사냥)',
          temperament: '경계심 높음 (Aggressive)',
          height: '2.1m',
          weight: 145,
          color: '#f43f5e',
          isDiscovered: false
        },
        {
          id: `spec_${i}_3`,
          latinName: `${pName.slice(-1)}. Aeroblastus`,
          commonName: `${pt.type} 발광 부유 해파리`,
          classType: 'AERIO-FAUNA',
          diet: '대기 중 가스 흡수',
          temperament: '평화로움',
          height: '1.4m',
          weight: 35,
          color: '#38bdf8',
          isDiscovered: false
        }
      ];
      planet.faunaSpecies = speciesList;

      // Spawn active individual creatures
      for (let k = 0; k < 14; k++) {
        const creatureAng = Math.random() * Math.PI * 2;
        const creatureDist = 120 + Math.random() * (planet.r * 0.75);
        const spec = speciesList[k % speciesList.length];
        planet.fauna.push({
          id: `fauna_${i}_${k}`,
          speciesRef: spec,
          lx: Math.cos(creatureAng) * creatureDist,
          ly: Math.sin(creatureAng) * creatureDist,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          targetLx: Math.cos(creatureAng) * creatureDist,
          targetLy: Math.sin(creatureAng) * creatureDist,
          facing: Math.random() > 0.5 ? 1 : -1,
          walkCycle: Math.random() * 10,
          state: 'WANDER',
          timer: Math.random() * 80,
          hp: 100,
          maxHp: 100,
          isScanned: false
        });
      }

      // 6. Flying Sentinel Patrol Drones (센티넬 드론 & 쿼드)
      const sentinelCount = 4 + (i % 3);
      for (let s = 0; s < sentinelCount; s++) {
        const sAng = Math.random() * Math.PI * 2;
        const sDist = 160 + Math.random() * (planet.r * 0.7);
        planet.planetSentinels!.push({
          id: `sent_${i}_${s}`,
          lx: Math.cos(sAng) * sDist,
          ly: Math.sin(sAng) * sDist,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          state: 'PATROL',
          scanTimer: Math.random() * 120,
          hp: 80,
          maxHp: 80
        });
      }

      // Deposits
      for (let j = 0; j < 50; j++) {
        const rAng = Math.random() * Math.PI * 2;
        const rDist = Math.random() * (planet.r * 0.9);
        const roll = Math.random();
        let elType: DepositEntity['type'] = 'carbon';
        let latin = 'F. Lumina';
        let common = '탄소 식물체 (Carbon Flora)';
        if (roll < 0.18) { elType = 'sodium'; latin = 'M. Nitrium'; common = '나트륨 결정 (Sodium Spire)'; }
        else if (roll < 0.36) { elType = 'oxygen'; latin = 'F. Pulmonis'; common = '산소 식물 (Oxygen Bulb)'; }
        else if (roll < 0.55) { elType = 'dihydrogen'; latin = 'M. Cryo-H'; common = '이수소 결정 (Dihydrogen)'; }
        else if (roll < 0.78) { elType = 'ferrite'; latin = 'M. Ferrum'; common = '페라이트 광석 (Ferrite Rock)'; }

        planet.deposits.push({
          id: `dep_${i}_${j}`,
          lx: Math.cos(rAng) * rDist,
          ly: Math.sin(rAng) * rDist,
          type: elType,
          hp: 60,
          size: 18 + Math.random() * 12,
          isFlora: elType === 'carbon' || elType === 'oxygen',
          latinName: latin,
          commonName: common,
          isScanned: false
        });
      }

      this.entities.planets.push(planet);
    }
  }

  public spawnFloatText(text: string, x?: number, y?: number, color = '#ffffff') {
    const px = x !== undefined ? x : this.width / 2;
    const py = y !== undefined ? y : this.height / 2 - 60;
    const ft: FloatingText = {
      id: this.nextTextId++,
      text,
      x: px,
      y: py,
      color
    };
    this.data.floatingTexts.push(ft);
    setTimeout(() => {
      this.data.floatingTexts = this.data.floatingTexts.filter(t => t.id !== ft.id);
      this.notify();
    }, 1200);
    this.notify();
  }

  public launchToOrbit() {
    if (this.currState !== 'PLANET' || !this.data.activePlanet) return;
    const p = this.data.activePlanet;

    // Take off directly into low-altitude airplane flight inside the planet atmosphere!
    this.player.x = p.x + this.parkedShip.x;
    this.player.y = p.y + this.parkedShip.y;
    this.player.angle = this.parkedShip.angle;
    this.player.vx = Math.cos(this.parkedShip.angle) * 6.5;
    this.player.vy = Math.sin(this.parkedShip.angle) * 6.5;
    this.currState = 'SPACE';
    this.insidePlanetInFlight = p.name;

    AudioSys.playPulseDrive();
    this.spawnFloatText(`🚀 우주선 이륙 완료! // 비행기 저공 비행 모드`, undefined, undefined, '#00e5ff');
    this.spawnFloatText(`대기권 내 비행 중 (언제든 착륙 가능 / 외곽 이동 시 우주 탈출)`, undefined, this.height / 2 - 25, '#10b981');
    this.notify();
  }

  public landCurrentShip(planet?: PlanetEntity | null) {
    if (this.currState !== 'SPACE') return;
    const targetPlanet = planet || this.getPlanetInAtmosphere() || this.getNearestPlanet()?.planet;
    if (!targetPlanet) return;

    // Convert ship's current space coordinate to planet-local coordinate
    const localX = this.player.x - targetPlanet.x;
    const localY = this.player.y - targetPlanet.y;
    const dist = Math.hypot(localX, localY);
    const maxLandR = targetPlanet.r - 35;
    const clampedDist = Math.min(dist, maxLandR);
    const angle = dist > 0 ? Math.atan2(localY, localX) : 0;
    const landX = Math.cos(angle) * clampedDist;
    const landY = Math.sin(angle) * clampedDist;

    this.data.activePlanet = targetPlanet;
    this.currState = 'PLANET';
    this.insidePlanetInFlight = null;

    // The player's astronaut steps out right at the touchdown site
    this.player.px = landX;
    this.player.py = landY;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.facing = 1;
    this.player.anim = 0;

    // Park the starship at the exact touchdown location facing the ship's last heading
    this.parkedShip = {
      x: landX,
      y: landY,
      angle: this.player.angle
    };

    AudioSys.playDiscoveryFanfare();
    this.spawnFloatText(`🛬 ${targetPlanet.name} 안전 착륙 완료!`, undefined, undefined, '#10b981');
    this.spawnFloatText(`👤 엑소슈트 사람(보행) 모드로 전환되었습니다`, undefined, this.height / 2 - 30, '#00e5ff');
    this.spawnFloatText(`방호 환경 작동: ${targetPlanet.hazardType}`, undefined, this.height / 2 - 5, '#ffb703');
    this.notify();
  }

  public enterAtmosphere(planet: PlanetEntity) {
    this.landCurrentShip(planet);
  }

  public getPlanetInAtmosphere(): PlanetEntity | null {
    if (this.currState !== 'SPACE') return null;
    for (const p of this.entities.planets) {
      const d = Math.hypot(this.player.x - p.x, this.player.y - p.y);
      if (d <= p.r + 40) return p;
    }
    return null;
  }

  public notifyUserInput() {
    this.lastInputTime = Date.now();
    if (this.isAutoPilot) {
      this.disengageAutoPilot();
    }
  }

  public static readonly DEMO_PHASES: Array<{
    phase: DemoShowcasePhase;
    title: string;
    description: string;
    subText: string;
    duration: number;
    badge?: string;
    category?: string;
  }> = [
    {
      phase: 'SPACE_PULSE',
      title: '🚀 1/77. [기본비행] 초광속 펄스 드라이브 & 소행성 채굴',
      description: '우주선 펄스 추진기를 가동하여 광활한 유클리드 성계를 36 u/s 초광속으로 쾌속 순항하고 삼중수소를 수확합니다.',
      subText: '[Space / 펄스부스트] 초광속 가속 | [포톤 캐논] 소행성 파괴',
      duration: 4500,
      badge: '성간비행',
      category: '함선'
    },
    {
      phase: 'SPACE_COMBAT',
      title: '⚔️ 2/77. [우주전투] 해적 우주선 조우 & 성간 도그파이트',
      description: '약탈자 해적 전투기 출현! 락온 조준 레이저와 유도 로켓을 퍼부어 해적선을 격침하고 현상금을 획득합니다.',
      subText: '[포톤 캐논] 연속 사격 | [방어막 🛡️] 편향장 가동 및 2,500₩ 현상금 획득',
      duration: 4500,
      badge: '우주전투',
      category: '전투'
    },
    {
      phase: 'STARSHIP_CYCLE',
      title: '🛸 3/77. [격납고] 4대 특수 함선 격납고 순환 [K]',
      description: '솔라선(베스퍼 세일), 센티넬 인터셉터, 생체함선 등 성간 함대 주력기를 실시간으로 교체합니다.',
      subText: '[K] 함선 순환 | 기종별 고유 비행 역학과 칵핏 게이지 전환',
      duration: 4000,
      badge: '특수함선',
      category: '함선'
    },
    {
      phase: 'SOLAR_SAIL',
      title: '⛵ 4/77. [Outlaws] 솔라선 & 베스퍼 세일 태양광 항해',
      description: '태양광 돛을 전개하여 항성풍 에너지를 포집하고, 무한 실드 충전 및 고기동성을 확보합니다.',
      subText: '베스퍼 세일 자동 전개 | 솔라 펄스 엔진 및 영구 쉴드 재생',
      duration: 4200,
      badge: 'Outlaws',
      category: '함선'
    },
    {
      phase: 'SPACE_STATION',
      title: '🏛️ 5/77. [Orbital] 성계 우주정거장 코어 & 은하 무역 터미널',
      description: '우주정거장 내부 도킹 레일을 타고 진입하여 성계 특산품 시세를 확인하고 희귀 자원을 교역합니다.',
      subText: '[E] 우주정거장 도킹 | 은하 무역 단말기 & 코어 터미널',
      duration: 4200,
      badge: 'Orbital',
      category: '은하계'
    },
    {
      phase: 'GALAXY_MAP',
      title: '🌌 6/77. [성간지도] 3D 은하계 지도 & 성간 워프 [M]',
      description: '은하계 중심점(Galactic Center)과 성계 간의 성간 워프 하이퍼드라이브 경로를 3D로 차트화합니다.',
      subText: '[M] 은하 지도 | 워프 하이퍼코어로 다음 성계로 도약',
      duration: 4200,
      badge: '은하지도',
      category: '은하계'
    },
    {
      phase: 'PIRATE_DREADNOUGHT',
      title: '🏴‍☠️ 7/77. [Echoes] 무법자 해적 드레드노트 기함 격침전',
      description: '우주 해적 드레드노트 초대형 전함의 쉴드 발생기와 반물질 코어를 정밀 타격하여 나포 및 격침합니다.',
      subText: '헤비 터렛 참호 런 | 기함 나포 및 궤도 폭격 지휘권 획득',
      duration: 4500,
      badge: 'Echoes',
      category: '전투'
    },
    {
      phase: 'OUTLAW_STATION',
      title: '☠️ 8/77. [Outlaws] 해적 무법자 정거장 & 밀수품 암시장',
      description: '센티넬의 감시망을 벗어난 무법자 정거장에서 위조 신분증을 발급받고 금지된 불법 밀수품을 거래합니다.',
      subText: '해적 현상금 사냥 | 위조 신분증 세탁 및 X-Class 불법 모듈',
      duration: 4200,
      badge: 'Outlaws',
      category: '전투'
    },
    {
      phase: 'SPACE_ANOMALY',
      title: '🔮 9/77. [Beyond] 스페이스 아노말리 넥서스 성간 원정대',
      description: '나다와 폴로의 초차원 성소 아노말리에서 넥서스 멀티플레이 원정 미션과 수은 보상을 수령합니다.',
      subText: '넥서스 멀티 협동 | 수은 상점 및 5단계 성간 원정대',
      duration: 4200,
      badge: 'Beyond',
      category: '은하계'
    },
    {
      phase: 'BLACK_HOLE',
      title: '🕳️ 10/77. [상대론] 초거대 블랙홀 & 사건의 지평선 특이점 도약',
      description: '사건의 지평선을 뚫고 돌입하여 150만 광년 너머 미지의 은하계 사분면으로 상대론적 시공간 워프를 감행합니다.',
      subText: '특이점 엔진 점화 | 웜홀 차원 왜곡 및 초원거리 도약',
      duration: 4500,
      badge: '특이점',
      category: '은하계'
    },
    {
      phase: 'DERELICT_FREIGHTER',
      title: '☠️ 11/77. [Desolation] 버려진 난파 화물선 응급 밀폐문 수색',
      description: '영하 48°C 심우주 냉동 격실을 돌파하여 승무원 일지를 해독하고 오염된 금속과 화물 격벽을 인양합니다.',
      subText: '응급 감압실 개방 | 보안 터미널 해킹 및 화물선 확장 격벽',
      duration: 4200,
      badge: 'Desolation',
      category: '은하계'
    },
    {
      phase: 'EVA_SPACEWALK',
      title: '🌌 12/77. [Endurance] 화물선 외벽 캣워크 & 무중력 EVA 우주유영',
      description: '캐피탈 화물선 선체 외벽 보도교로 직접 걸어나가 무중력 상태에서 심우주 천문대와 성간 가스 집진기를 점검합니다.',
      subText: '외벽 보도교 관측 | 심우주 무중력 EVA 진공 부유',
      duration: 4200,
      badge: 'Endurance',
      category: '함선'
    },
    {
      phase: 'SHIP_FABRICATION',
      title: '🎨 13/77. [Orbital] 우주선 커스텀 부품 조립 & 선체 도색 튜닝',
      description: '정거장 조립소에서 주익 날개, 조종석, 반응로 부품을 결합하고 맞춤형 메탈릭 컬러웨이와 데칼을 도색합니다.',
      subText: '부품 분해 인양 | 6대 컬러웨이 도색 및 플라즈마 배기 흔적',
      duration: 4200,
      badge: 'Orbital',
      category: '함선'
    },
    {
      phase: 'STARSHIP_WEAPONS',
      title: '🚀 14/77. [Sentinel] 함선 5대 첨단 무장 시스템 오버드라이브',
      description: '인프라-나이프 가속기(초당 30발), 포지트론 이젝터, 사이클로트론 발리스타 등 전문 함포를 전환 발사합니다.',
      subText: '포톤/인프라/포지트론/사이클로트론 | 락온 미사일 일제 사격',
      duration: 4200,
      badge: 'Sentinel',
      category: '전투'
    },
    {
      phase: 'GALACTIC_CORE',
      title: '🌌 15/77. [Atlas Rises] 은하 중심 특이점 & 4대 차원 은하 도약',
      description: '유클리드 은하 중심부에 도달하여 아틀라스 시뮬레이션을 각성하고 힐베르트/아이센탐 등 신규 은하계로 재탄생합니다.',
      subText: '차원 붕괴 특이점 | 신규 은하계 탄생 및 엑소슈트 재부팅',
      duration: 4500,
      badge: 'Atlas Rises',
      category: '은하계'
    },
    {
      phase: 'ORGANIC_FLEET',
      title: '🐙 16/77. [Endurance] 생체 호위함대 먹이 급여 & 사이코닉 알 배양',
      description: '거대 우주 생명체 호위함에게 성간 먹이를 먹여 촉수와 생체 스펙을 진화시키고 사이코닉 알을 부화시킵니다.',
      subText: '생체 호위함 변이 | 살아있는 함선 전용 사이코닉 신경망',
      duration: 4200,
      badge: 'Endurance',
      category: '함선'
    },
    {
      phase: 'PLANET_APPROACH',
      title: '🔥 17/77. [대기권] 행성 대기 마찰 플라즈마 & 급강하 진입',
      description: '외계 행성 중력권에 진입하여 대기 마찰 열화염을 뚫고 지표면을 향해 급강하, 최적의 착륙지를 선정합니다.',
      subText: '초음속 대기 진입 플라즈마 | 고도계 강하 및 저공 비행',
      duration: 4500,
      badge: '대기진입',
      category: '행성'
    },
    {
      phase: 'FLOATING_ISLANDS',
      title: '🏝️ 18/77. [Worlds 1] 하늘에 떠 있는 부유섬 & 공중 폭포',
      description: 'Worlds Part 1: 성층권 상공에 부유하는 거대 하늘 섬 지형을 탐사하고 무중력 폭포 피난처를 발견합니다.',
      subText: '성층권 부유 대륙 | 안개 수액 채취 및 무중력 절벽 다이빙',
      duration: 4500,
      badge: 'Worlds 1',
      category: '행성'
    },
    {
      phase: 'EXTREME_WEATHER',
      title: '⚡ 19/77. [Worlds 1] 초강력 토네이도 & 중력 이상 폭풍 관측',
      description: 'Worlds Part 1: 행성 기후 역학이 폭주하여 발생하는 거대 중력 소용돌이와 유성우 폭격을 계측 분석합니다.',
      subText: '대기 이상 폭풍 관측소 | 용융 운석 핵 정제 및 기상 적응',
      duration: 4200,
      badge: 'Worlds 1',
      category: '행성'
    },
    {
      phase: 'VOLCANO_PLANET',
      title: '🌋 20/77. [Origins] 480°C 마그마 화산 분출 & 바살트 정련소',
      description: 'Origins: 초고온 용암 행성의 마그마 분출구를 조사하고 지열 에너지를 포집하며 현무암(바살트)을 제련합니다.',
      subText: '화산 칼데라 발전 | 마그마 코어 제련 및 극열 차폐',
      duration: 4200,
      badge: 'Origins',
      category: '행성'
    },
    {
      phase: 'PLANET_TOUCHDOWN',
      title: '🛬 21/77. [착륙] 역추진 로켓 분사 & 지표면 안전 착륙 [E]',
      description: '지표면 근접 시 역추진 분사로 감속하여 부드럽게 착지하고, 조종석을 열고 미지의 외계 지표면에 하선합니다.',
      subText: '[E] 안전 착륙 | 지표면 엑소슈트 도보 모드로 원활하게 전환',
      duration: 4200,
      badge: '착륙',
      category: '탐사'
    },
    {
      phase: 'EXOSUIT_EXPLORE',
      title: '🪐 22/77. [엑소슈트] 지표면 탐사 보행 & 고성능 제트팩 도약',
      description: '외계 행성의 가혹한 중력과 환경 방호막 속에서 고성능 제트팩을 가동해 입체적으로 기동합니다.',
      subText: '[A/D/조이스틱] 보행 탐사 | [Space/제트팩] 고공 추진 도약',
      duration: 4500,
      badge: '엑소슈트',
      category: '탐사'
    },
    {
      phase: 'RESOURCE_MINING',
      title: '⛏️ 23/77. [채굴] 다목적 도구 채굴 레이저 & 필수 원소 채광',
      description: '지표면의 탄소, 산소, 나트륨 광맥, 페라이트 먼지 광상을 채굴 레이저로 분해하여 생존 및 충전 자원을 수집합니다.',
      subText: '[채굴광선] 연속 레이저 | 탄소, 산소, 나트륨 광맥 수확',
      duration: 4500,
      badge: '채굴',
      category: '탐사'
    },
    {
      phase: 'ANALYSIS_VISOR',
      title: '🔍 24/77. [스캐너] 고배율 분석 바이저 & 3D 지형 스캔 펄스 [F/C]',
      description: '바이저 렌즈를 활성화하여 숨겨진 나노 자원 광맥과 미지의 외계 동식물을 원거리 스캔 분석합니다.',
      subText: '[F] 분석 바이저 오버레이 | [C] 지형 스캔 펄스 방출',
      duration: 4200,
      badge: '바이저',
      category: '탐사'
    },
    {
      phase: 'TOOL_MODES',
      title: '⚡ 25/77. [다목적도구] 4대 도구 모드 순환 (채굴/소총/지형/스태프) [G]',
      description: '채굴 광선, 볼트캐스터 소총, 지형 조작기(동굴 굴착), 오토파지 볼타익 스태프를 상황에 맞게 전환합니다.',
      subText: '[G] 도구 순환 | 타겟별 자동 조준 유도 레이저 발사',
      duration: 4200,
      badge: '도구모드',
      category: '장비'
    },
    {
      phase: 'SENTINEL_PATROL',
      title: '🤖 26/77. [감시드론] 센티넬 순찰 드론 조우 & 경계 경보 AI',
      description: '행성 감시 드론이 스캔 콘(Scanning Cone)을 투사하며 순찰 중 채굴 행위를 감지하고 경계 경보를 울립니다.',
      subText: '스캔 서치라이트 콘 투사 | 센티넬 위협 1단계 발령',
      duration: 4500,
      badge: '센티넬',
      category: '전투'
    },
    {
      phase: 'LAYLAPS_DRONE',
      title: '👁️ 27/77. [Sentinel] 아군 센티넬 동료 레일랩스 신경망 제어',
      description: '센티넬 껍질을 해킹하여 동료로 개조한 레일랩스 드론이 주변 적을 자동 마비시키고 화력을 지원합니다.',
      subText: '우호적 센티넬 비행 | 광역 EMP 방출 및 센티넬 신호 교란',
      duration: 4200,
      badge: 'Sentinel',
      category: '전투'
    },
    {
      phase: 'COMBAT_WEAPONS',
      title: '🔫 28/77. [Sentinel] 5대 전문 전투 화기 실사격 (볼트/산탄/스피터)',
      description: '볼트캐스터, 산탄 블래스터, 펄스 스피터, 중성자 캐논 등 전문 전투 주무기의 가공할 화력을 시연합니다.',
      subText: '[주무기 🔄] 순환 | 과급 슬롯(Supercharged ⚡) 50% 공격력 증폭',
      duration: 4500,
      badge: 'Sentinel',
      category: '전투'
    },
    {
      phase: 'SECONDARY_ORDNANCE',
      title: '💥 29/77. [중화기] 보조 유탄 투하 & 마비 박격포 & 은폐장 [Q]',
      description: '플라즈마 런처 폭발탄 투하, 마비 박격포로 드론 군집을 제압하고 클로킹 디바이스로 은폐합니다.',
      subText: '[Q] 보조 무기 발사 | [Shift+Q / G] 플라즈마·지질학·마비박격포 전환',
      duration: 4200,
      badge: '보조화기',
      category: '전투'
    },
    {
      phase: 'WEAPON_ARSENAL_MODAL',
      title: '📋 30/77. [사령부] 다목적 도구 전투 화기 4-탭 통합 사령부',
      description: 'Sentinel & Waypoint 4.0: 5대 주무기, 보조 유탄 발사관, 과급 슬롯 오버클럭을 통합 통제합니다.',
      subText: '4-탭 사령부 매트릭스 | 야전 탄약 캡슐 투하 및 센티넬 모듈 정제',
      duration: 4200,
      badge: 'Sentinel',
      category: '장비'
    },
    {
      phase: 'SUPERCHARGED_SLOTS',
      title: '⚡ 31/77. [Waypoint] 기술 과급 슬롯(Supercharged) +50% 오버클럭',
      description: 'Waypoint 4.0: 엑소슈트와 함선의 보라색 과급 슬롯에 핵심 모듈을 장착하여 스펙을 50% 한계 돌파합니다.',
      subText: '슈퍼차지드 슬롯 매핑 | 화력/방어막/속도 프로필 극대화',
      duration: 4200,
      badge: 'Waypoint',
      category: '장비'
    },
    {
      phase: 'EXOSUIT_UPGRADE',
      title: '👕 32/77. [Waypoint] 엑소슈트 드롭포드 슬롯 증설 & 테크 확장',
      description: '행성 지표면의 추락한 드롭 포드를 수리하여 인벤토리 인벤과 기술 모듈 슬롯을 120칸까지 확장합니다.',
      subText: '드롭포드 좌표 해독 | 나노머신 슬롯 구매 및 화물칸 증설',
      duration: 4200,
      badge: 'Waypoint',
      category: '장비'
    },
    {
      phase: 'HAZARD_PROTECTION',
      title: '🛡️ 33/77. [방호모듈] 4대 극한 환경 보호막 (혹한/극열/독성/방사능)',
      description: '혹한/극열/독성/방사능 4대 극한 행성의 특수 차폐막을 활성화하고 이온 배터리로 즉각 재충전합니다.',
      subText: 'S급 환경 방호막 | 이온 배터리 급속 충전 및 방사능 완충',
      duration: 4200,
      badge: '생존장비',
      category: '장비'
    },
    {
      phase: 'TOOL_SALVAGE',
      title: '🔧 34/77. [정거장] 다목적 도구 고철 분해 & 슬롯 인양',
      description: '우주정거장 멀티툴 인양대에서 불필요한 무기를 분해하여 수천 나노머신과 슬롯 확장 모듈을 회수합니다.',
      subText: '멀티툴 고철 분해 | S-Class 승급 및 슬롯 확장 모듈 적용',
      duration: 4200,
      badge: 'Orbital',
      category: '장비'
    },
    {
      phase: 'INVENTORY_MODAL',
      title: '🎒 35/77. [인벤토리] 엑소슈트 & 함선 인벤토리 격자 관리 [Tab]',
      description: '채굴한 페라이트, 산소, 나트륨 등 핵심 원소 화물과 엑소슈트 방호 기술 모듈을 정비하고 즉석 제작합니다.',
      subText: '[Tab] 인벤토리 | 자원 조합 및 환경 방호 차폐막 충전',
      duration: 4200,
      badge: '인벤토리',
      category: '장비'
    },
    {
      phase: 'QUICK_RECHARGE',
      title: '⚡ 36/77. [퀵충전] 긴급 생명유지장치 & 방호막 즉시 충전 콘솔',
      description: '치열한 전투 중 인벤토리를 열지 않고 원터치로 나트륨과 산소를 투입하여 보호막을 풀 충전합니다.',
      subText: '원클릭 긴급 충전 | 생명유지 산소 팩 & 방어막 나트륨 배터리',
      duration: 4000,
      badge: '생존',
      category: '장비'
    },
    {
      phase: 'BASE_BUILDING',
      title: '🏗️ 37/77. [Next] 기지 컴퓨터 영토 선포 & 건축 블루프린트 [Z]',
      description: '행성 지표면에 기지 컴퓨터를 등록하여 영토를 개척하고, 목재/합금/유리 건축 부품을 자유롭게 축조합니다.',
      subText: '[Z] 기지 건설 메뉴 | 자원 정제 및 거점 건축 허브',
      duration: 4200,
      badge: 'Next',
      category: '기지'
    },
    {
      phase: 'LARGE_REFINER',
      title: '⚗️ 38/77. [Next] 대형 3슬롯 정제기 & 화학 연금술 3원소 합성',
      description: '3개의 투입구에 자원을 동시 투입하여 순수 페라이트, 무한 염소, 양자 촉매를 고효율 연금술로 증식합니다.',
      subText: '3구 동시 정제 | 염소+산소 무한 증식 및 고가치 합금 가공',
      duration: 4200,
      badge: 'Next',
      category: '기지'
    },
    {
      phase: 'BASE_POWER_GRID',
      title: '⚡ 39/77. [Beyond] 태양광 발전소 & 배터리 뱅크 에너지 그리드',
      description: '태양광 전지판과 대용량 배터리를 전선 케이블로 연결하여 기지 전체에 안정적인 전력을 24시간 공급합니다.',
      subText: '+350 kPk 광전기 발전 | 커패시터 과급 및 10,000 kPk 축전망',
      duration: 4200,
      badge: 'Beyond',
      category: '기지'
    },
    {
      phase: 'EM_GENERATOR',
      title: '⚡ 40/77. [Beyond] S급 지자기장 핫스팟 전자기 발전기 무한 전력',
      description: '행성 심층 전자기 핫스팟을 스캔하여 직결 발전기를 설치, 날씨와 밤낮에 무관하게 무한 전력을 공급합니다.',
      subText: 'S-Class 지자기장 핵 직결 | +1,200 kPk 상시 발전망',
      duration: 4200,
      badge: 'Beyond',
      category: '기지'
    },
    {
      phase: 'SHORT_RANGE_TELEPORT',
      title: '🌀 41/77. [Beyond] 기지 단거리 양자 텔레포터 & 전력 도관망',
      description: '광대한 기지 시설 양 끝을 잇는 단거리 텔레포터를 설치하여 빛의 속도로 구역 간을 순간이동합니다.',
      subText: '양자 도관 케이블 | 480u 거리 무지연 순간이동 파이프라인',
      duration: 4200,
      badge: 'Beyond',
      category: '기지'
    },
    {
      phase: 'GAS_HARVESTER',
      title: '💨 42/77. [Beyond] 대기 기체 하베스터 (라돈/질소/설퍼린 추출)',
      description: '행성 대기 밀집 가스를 자동 포집하여 초전도체와 융합 가속기 등 초고가 첨단 제품 원료를 생산합니다.',
      subText: '대기 가스 추출기 | 라돈·질소·설퍼린 포집 및 화학 합성',
      duration: 4200,
      badge: 'Beyond',
      category: '기지'
    },
    {
      phase: 'SPECIALIST_TERMINALS',
      title: '🏛️ 43/77. [Foundations] 기지 5대 외계 전문가 & 8륜 콜로서스 채광차',
      description: '감독관, 무기전문가, 과학자, 농부, 엑소크래프트 기술자를 고용하여 콜로서스 초대형 채광차를 조립합니다.',
      subText: '5대 전문가 터미널 | 8륜 중장갑 콜로서스 채광 엑소크래프트',
      duration: 4200,
      badge: '기지터미널',
      category: '기지'
    },
    {
      phase: 'BIODOME_FARMING',
      title: '🌱 44/77. [Foundations] 수경재배 바이오돔 & 8대 외계 작물 원클릭 수확',
      description: '바이오돔 유리 돔 내부에 서리 결정, 태양 덩굴, 감마 잡초를 재배하고 중앙 콘솔에서 원클릭으로 일괄 수확합니다.',
      subText: '8대 외계 작물 재배 | 바이오돔 일괄 수확 및 회로 기판 가공',
      duration: 4200,
      badge: '외계농경',
      category: '기지'
    },
    {
      phase: 'LIVESTOCK_RANCH',
      title: '🥛 45/77. [Beyond] 외계 생물 목장 자동 배식기 & 착유 수확기',
      description: '자동 배식기와 수확기를 설치하여 행성 야생 동물을 울타리로 유인하고 신선한 우유와 외계 알을 채취합니다.',
      subText: '자율 배식기 & 착유기 | 동물 사육 및 고급 유제품 생산',
      duration: 4200,
      badge: '생물목장',
      category: '기지'
    },
    {
      phase: 'NUTRIENT_PROCESSOR',
      title: '🍲 46/77. [Beyond] 영양소 처리기 & 외계 식재료 요리 연구실',
      description: '밀, 효모, 우유, 꿀을 배합하여 외계 성간 디저트와 만찬 요리를 조리하고 강력한 탐사 버프를 얻습니다.',
      subText: '성간 레시피 배합 | 셰프 크로노스 미식가 평가 및 버프 요리',
      duration: 4200,
      badge: '영양소요리',
      category: '기지'
    },
    {
      phase: 'ANCIENT_MONOLITH',
      title: '🗿 47/77. [외계문명] 고대 모놀리스 지혜의 시련 & 지식의 돌 언어 습득',
      description: '고대 외계 문명의 비석에 손을 얹어 시련 수수께끼를 풀고, 지식의 돌에서 코르박스/바이킨 고대어를 습득합니다.',
      subText: '[E] 모놀리스 감응 | 고대 외계어 해독 및 포탈 좌표 획득',
      duration: 4200,
      badge: '고대유적',
      category: '신비'
    },
    {
      phase: 'ANCIENT_PORTAL',
      title: '🌀 48/77. [Atlas Rises] 고대 포탈 16대 은하 글리프 다이얼 가동',
      description: '16개의 신비로운 별자리 글리프 좌표를 순서대로 입력하여 은하계 전체를 잇는 스타게이트 웜홀을 개방합니다.',
      subText: '16개 글리프 시퀀스 충전 | 시공간 차원 도약 게이트웨이',
      duration: 4200,
      badge: 'Atlas Rises',
      category: '신비'
    },
    {
      phase: 'TRADE_OUTPOST',
      title: '🏛️ 49/77. [Next] 행성 대형 교역소 & 7대 은하 경제 무역망',
      description: '상선들이 착륙하는 대형 교역소에서 고유 특산품을 도매가로 매입하고 고수익 황금 무역로로 차익을 남깁니다.',
      subText: '7대 무역 경제 유형 | 성간 상선 바터 및 수백만 유닛 무역',
      duration: 4200,
      badge: '무역망',
      category: '은하계'
    },
    {
      phase: 'CARTOGRAPHER_MAPS',
      title: '🗺️ 50/77. [Beyond] 정거장 지도제작자 & 5대 행성 차트 조난 스캔',
      description: '항법 데이터를 지도로 교환하여 조난 우주선, 비밀 보안 시설, 고대 유적의 정밀 좌표 비콘을 확보합니다.',
      subText: '5대 행성 차트 | 추락선 인양 좌표 & 미확인 외계 신호 추적',
      duration: 4200,
      badge: '지도제작',
      category: '은하계'
    },
    {
      phase: 'GUILD_ENVOY',
      title: '🎖️ 51/77. [Orbital] 상인/용병/탐험가 3대 길드 특사 무료 보급품',
      description: '우주정거장 길드 대표로부터 평판 랭크에 따라 화물선 격벽, 멀티툴 확장 슬롯, 우주선 모듈을 무상 수령합니다.',
      subText: '3대 길드 평판 | 마스터 랭크 전용 S급 보급품 및 무료 슬롯',
      duration: 4200,
      badge: 'Orbital',
      category: '은하계'
    },
    {
      phase: 'MANUFACTURING_FACILITY',
      title: '🏭 52/77. [보안기지] 행성 보안 제조시설 철문 돌파 & 아틀라스패스',
      description: '볼트캐스터로 강화 철문을 파괴하고 잠입하여 단말기 비상 프로토콜을 해독, 아틀라스패스 제작도를 획득합니다.',
      subText: '센티넬 경보 돌파 | 오버라이드 퍼즐 및 1,500만 ₩ 설계도',
      duration: 4200,
      badge: '보안시설',
      category: '탐사'
    },
    {
      phase: 'ATLAS_PATH',
      title: '🔴 53/77. [Atlas Rises] 아틀라스 경로 10대 시드 합성 & 신규 항성 탄생',
      description: '신비의 아틀라스 인터페이스에서 포에븀부터 갬마텀까지 10대 시드를 합성하여 마침내 새로운 별을 탄생시킵니다.',
      subText: '10대 아틀라스 시드 합성 | 스타시드 제작 및 블랙홀 투시',
      duration: 4200,
      badge: 'Atlas Rises',
      category: '신비'
    },
    {
      phase: 'ARCHAEOLOGY_DIG',
      title: '🦴 54/77. [Visions] 고대 화석 지층 발굴 & 추락 인공위성 고철 인양',
      description: '지형 조작기로 고대 지층을 굴착하여 200만 년 전 고생물 뼈 화석과 추락한 항법 위성을 발굴합니다.',
      subText: '고고학 발굴 | 희귀 화석 뼈대 복원 및 박물관 기증',
      duration: 4200,
      badge: 'Visions',
      category: '탐사'
    },
    {
      phase: 'ABANDONED_FACILITY',
      title: '☣️ 55/77. [Next] 버려진 건물 & 속삭이는 알 / 생물학적 공포 소탕',
      description: '외계 점액질로 뒤덮인 연구소를 수색하고, 속삭이는 알에서 튀어나오는 생물학적 공포를 격퇴하며 유충 코어를 획득합니다.',
      subText: '유충 코어 채취 | 생물학적 공포 급습 및 나노머신 대량 정제',
      duration: 4200,
      badge: 'Next',
      category: '전투'
    },
    {
      phase: 'GIANT_SANDWORM',
      title: '🪱 56/77. [Emergence] 거대 타이탄 샌드웜 출현 & 타이탄 슬라임 채취',
      description: '지반을 진동시키며 지표면을 뚫고 솟구쳐 오르는 초대형 샌드웜 타이탄을 관측하고 점액질 잔해를 수집합니다.',
      subText: '샌드웜 피리 소환 | 타이탄 점액질 채취 및 샌드웜 배아 교감',
      duration: 4200,
      badge: 'Emergence',
      category: '행성'
    },
    {
      phase: 'BOUNDARY_FAILURE',
      title: '🔮 57/77. [Next] 거대 차원 경계 붕괴 고리 & 텔라몬 왜곡 기록',
      description: '글리치 행성의 거대한 기계 고리 구조물 단말기에서 시뮬레이션 인공지능 텔라몬의 심층 기록을 해독합니다.',
      subText: '차원 경계 고리 | 글리치 이상체 수집 및 현실 붕괴 로그',
      duration: 4200,
      badge: 'Next',
      category: '신비'
    },
    {
      phase: 'BIOLUMINESCENT_FOREST',
      title: '🌌 58/77. [Origins] 발광 포자 숲 & 에테르 하늘가오리 야간 비행',
      description: 'Origins: 야간에 스스로 빛을 발하는 형광 포자 식물 군락과 하늘을 유영하는 발광 가오리 생명체를 만납니다.',
      subText: '생체 발광 포자목 | 에테르 하늘가오리 교감 및 야간 포자 폭풍',
      duration: 4200,
      badge: 'Origins',
      category: '행성'
    },
    {
      phase: 'NAUTILON_SUBMARINE',
      title: '🌊 59/77. [The Abyss] 노틸론 S급 잠수정 & 심해 고출력 소나 스캔',
      description: 'The Abyss: 심해 바다로 다이빙하여 노틸론 잠수정에 탑승, 고출력 수중 소나로 침몰선과 해저 유적을 스캔합니다.',
      subText: '[0] 노틸론 탑승 | [소나 📡] 침몰 화물선 및 해저 유적 탐색',
      duration: 4500,
      badge: 'The Abyss',
      category: '해양'
    },
    {
      phase: 'ABYSSAL_HORROR',
      title: '🌊 60/77. [The Abyss] 185u 심해 매혹적인 조개 & 살아있는 진주 채취',
      description: '빛을 내뿜는 유혹의 조개 입을 열어 고가치 하달 진주를 채취하고 심해 공포체의 최면 시선을 회피합니다.',
      subText: '심해 185u 해구 | 매혹적인 조개 개방 및 살아있는 진주',
      duration: 4200,
      badge: 'The Abyss',
      category: '해양'
    },
    {
      phase: 'AQUATIC_BASE',
      title: '🌊 61/77. [The Abyss] 심해 450m 수밀 돔 해양 기지 & 수중 문풀',
      description: '해저 수압을 견디는 방수 챔버와 잠수정 도킹 문풀을 건설하여 완벽한 해저 관측 기지를 구축합니다.',
      subText: '수밀 원형 돔 | 산소 순환 펌프 및 해저 문풀 도킹',
      duration: 4200,
      badge: 'The Abyss',
      category: '해양'
    },
    {
      phase: 'DEEP_AQUARIUM',
      title: '🦑 62/77. [The Abyss] 심해 1,250m 잠수종 & 최면의 눈 트로피 수족관',
      description: '심해 최심부에서 포획한 최면의 눈과 희귀 심해 어종을 기지 대형 수족관에 방사하여 전시합니다.',
      subText: '심해 잠수종 관측 | 트로피 수족관 및 희귀 심해 생물 방사',
      duration: 4200,
      badge: 'The Abyss',
      category: '해양'
    },
    {
      phase: 'AQUARIUS_FISHING',
      title: '🎣 63/77. [Aquarius] 해양 낚싯대 전개 & 전설 외계 심해 어종 낚시',
      description: 'Aquarius: 부유 낚시 플랫폼을 펼치고 미끼를 투척하여 릴 텐션을 조율, 전설급 심해 어종을 낚아 올립니다.',
      subText: '[낚시 🎣] 텐션 게이지 조율 | 전설 심해 수생종 낚시',
      duration: 4500,
      badge: 'Aquarius',
      category: '해양'
    },
    {
      phase: 'COMPANION_MOUNT',
      title: '🐾 64/77. [Companions] 외계 크리처 펠릿 조련 & 안장 장착 질주',
      description: 'Companions: 거대 외계 생명체에게 크리처 펠릿을 먹여 테이밍하고, 안장을 얹어 대지를 고속 질주합니다.',
      subText: '[U] 동반자 교감 | 크리처 펠릿 급여 및 탑승 라이딩',
      duration: 4500,
      badge: 'Companions',
      category: '동반자'
    },
    {
      phase: 'TITAN_BEETLE_RIDE',
      title: '🪲 65/77. [Prisms] 거대 비행 타이탄 비틀 탑승 & 성층권 활공',
      description: 'Prisms: 날개를 펼쳐 비행하는 거대 비틀의 등에 올라타 성층권 상공 28.5 u/s 고속 활공 비행을 펼칩니다.',
      subText: '거대 비행 곤충 탑승 | 성층권 활공 비행 및 에테르 채취',
      duration: 4200,
      badge: 'Prisms',
      category: '동반자'
    },
    {
      phase: 'EGG_SEQUENCER',
      title: '🧬 66/77. [Companions] 아노말리 알 염기서열기 4대 유전자 조작',
      description: '스페이스 아노말리에서 배아의 유전자 코드를 조작하여 거대화, 희귀 돌연변이, 충성도 성향을 주입합니다.',
      subText: '무게/크기 증폭 | 성향 개조 및 돌연변이 촉매 투여',
      duration: 4200,
      badge: 'Companions',
      category: '동반자'
    },
    {
      phase: 'MINOTAUR_MECH',
      title: '🤖 67/77. [ExoMech] 미노타우르스 중장갑 메카 & AI 자동 자율 파일럿',
      description: '궤도에서 투하된 이족보행 중장갑 미노타우르스 메카에 탑승하여 중포 사격 및 자율 호위 AI를 가동합니다.',
      subText: '이족보행 중장갑 메카 | 센티넬 하드프레임 AI 자율 전투',
      duration: 4200,
      badge: 'ExoMech',
      category: '차량'
    },
    {
      phase: 'EXOCRAFT_RACING',
      title: '🏁 68/77. [Path Finder] 엑소크래프트 행성 레이싱 서킷 & 타임어택',
      description: '체크포인트 아치와 부스터 램프를 배치하여 행성 레이싱 서킷을 구축하고 최고 기록 타임어택에 도전합니다.',
      subText: '레이스 트랙 스타터 | 체크포인트 게이트 & 니트로 부스터',
      duration: 4200,
      badge: 'Path Finder',
      category: '차량'
    },
    {
      phase: 'ATLANTID_TOOL',
      title: '🔮 69/77. [Echoes] 아틀란티드 멀티툴 & 코르박스 룬 제단 공양',
      description: 'Echoes: 단절된 코르박스 모놀리스 제단에 나노머신을 바치고 룬 렌즈가 내장된 아틀란티드 멀티툴을 각성합니다.',
      subText: '공허의 마더보드 | 일체형 룬 렌즈 및 광역 공명 채광',
      duration: 4200,
      badge: 'Echoes',
      category: '장비'
    },
    {
      phase: 'LIVING_SHIP_BOND',
      title: '🌱 70/77. [Living Ship] 보이드 에그 각성 & 4대 생체 장기 신경 결속',
      description: 'Living Ship: 깨어나는 보이드 에그와 신경망을 결속하고 맥동하는 심장과 그라프팅 안구를 배양합니다.',
      subText: '신경 결속 하이퍼드라이브 | 유기체 장기 배양 및 생체 비행',
      duration: 4200,
      badge: 'Living Ship',
      category: '함선'
    },
    {
      phase: 'WONDERS_HOLOGRAM',
      title: '✨ 71/77. [Waypoint] 은하계 경이 도감 & 기지 홀로그램 영사기',
      description: 'Waypoint: 발견한 최고 극한 행성, 가장 거대한 동물 등 은하계 경이 기록을 기지 홀로그램으로 투사합니다.',
      subText: '은하계 경이 도감 | 홀로그램 영사기 투사 및 기록 열람',
      duration: 4200,
      badge: 'Waypoint',
      category: '은하계'
    },
    {
      phase: 'APPEARANCE_CUSTOMIZER',
      title: '👤 72/77. [Next] 외형 조작기 6대 은하 종족 & 커스텀 망토',
      description: '아노말리, 게크, 코르박스, 바이킨, 여행자, 오토파지 6대 종족 외형과 물리 시뮬레이션 망토를 튜닝합니다.',
      subText: '6대 은하 종족 커스텀 | 망토 물리 시뮬레이션 & 컬러 팔레트',
      duration: 4200,
      badge: 'Next',
      category: '커스텀'
    },
    {
      phase: 'DISCOVERIES_COMPENDIUM',
      title: '🪐 73/77. [Waypoint] 행성 발견 도감 & 동물군 100% 완수 나노 보너스',
      description: '스캔한 동식물과 광물 데이터를 은하계 데이터베이스에 영구 업로드하고 수천 나노머신 보너스를 획득합니다.',
      subText: '발견 도감 업로드 | 동물군 100% 분석 및 나노로봇 대량 수령',
      duration: 4200,
      badge: '도감완수',
      category: '은하계'
    },
    {
      phase: 'INTERSTELLAR_TELEPORT',
      title: '🌀 74/77. [순간이동] 성계간 양자 순간이동기 네트워크 터미널',
      description: '성계 우주정거장, 거점 기지, 캐피탈 화물선 간을 지연 없이 즉각 오갈 수 있는 순간이동망을 가동합니다.',
      subText: '성계간 텔레포트 망 | 정거장/기지/화물선 무제한 공간이동',
      duration: 4200,
      badge: '순간이동',
      category: '은하계'
    },
    {
      phase: 'CUSTOM_DIFFICULTY',
      title: '⚙️ 75/77. [Waypoint 4.0] 커스텀 난이도 & 10대 게임플레이 조절 콘솔',
      description: 'Waypoint 4.0: 생존 적대성, 연료 소비, 사망 패널티, 전투 난이도 등 10대 매개변수를 실시간으로 조율합니다.',
      subText: '10대 슬라이더 매트릭스 [F9] | 5대 프리셋 및 유토피아 스피더',
      duration: 4500,
      badge: 'Waypoint 4.0',
      category: '설정'
    },
    {
      phase: 'ORBITAL_MATERIALISER',
      title: '🛰️ 76/77. [Endurance] 화물선 궤도 물질화기 & 항성계 전역 스캔',
      description: '궤도 상공의 캐피탈 화물선에 신호를 보내 지표면에 즉시 엑소크래프트를 투하하고 성계 전체를 스캔합니다.',
      subText: '궤도 물질 전송 | 항성계 심층 행성 광역 스캔 및 보급',
      duration: 4200,
      badge: 'Endurance',
      category: '함선'
    },
    {
      phase: 'LAUNCH_ORBIT',
      title: '🚀 77/77. [우주선귀환] 지표면 우주선 탑승 & 궤도 수직 발진 항해',
      description: '지표면 탐사를 마치고 우주선에 탑승하여 성간 궤도로 쾌속 발진, 다음 새로운 미지의 행성으로 항해합니다.',
      subText: '[E/탑승] 우주선 탑승 | [T/발사] 궤도로 로켓 점화 발사',
      duration: 5000,
      badge: '궤도발진',
      category: '함선'
    }
  ];

  public demoPhaseIndex: number = 0;
  public demoPhaseStartTime: number = 0;
  public demoActionSubTimer: number = 0;
  private demoLastActionTick: number = 0;

  public toggleAutoPilot() {
    if (this.isAutoPilot) {
      this.disengageAutoPilot();
    } else {
      this.engageAutoPilot();
    }
  }

  public disengageAutoPilot() {
    if (!this.isAutoPilot) return;
    this.isAutoPilot = false;
    this.data.isPulseActive = false;
    this.data.demoShowcase.isActive = false;
    this.data.demoShowcase.activeModal = null;
    this.player.isJetpacking = false;
    this.player.isMining = false;
    AudioSys.playNote(440, 'sine', 0.15);
    this.spawnFloatText("🎮 조작 감지 // AI 데모 쇼케이스 종료 (수동 조종 복귀)", undefined, undefined, '#f59e0b');
    this.notify();
  }

  public engageAutoPilot(forceStartPhase?: number) {
    if (this.isAutoPilot && forceStartPhase === undefined) return;
    this.isAutoPilot = true;
    this.data.demoShowcase.isActive = true;
    this.autoPilotPlanetStartTime = Date.now();
    this.autoPilotResourceTimer = 0;
    this.autoPilotWanderAngle = Math.random() * Math.PI * 2;

    // Pick starting phase based on current game state
    let startIdx = 0;
    if (forceStartPhase !== undefined) {
      startIdx = forceStartPhase;
    } else if (this.currState === 'PLANET') {
      startIdx = 21; // Start from EXOSUIT_EXPLORE on planet
    } else {
      startIdx = 0; // Start from SPACE_PULSE in space
    }

    this.setupDemoPhase(startIdx);
    AudioSys.playDiscoveryFanfare();
    this.spawnFloatText("🎬 AI 데모 쇼케이스 가동! 77개 전 기능 전체 순차 시연 시작", undefined, undefined, '#00e5ff');
    this.notify();
  }

  public setupDemoPhase(phaseIdx: number) {
    const list = GameEngine.DEMO_PHASES;
    this.demoPhaseIndex = ((phaseIdx % list.length) + list.length) % list.length;
    const cfg = list[this.demoPhaseIndex];

    this.demoPhaseStartTime = Date.now();
    this.demoActionSubTimer = 0;
    this.demoLastActionTick = 0;

    // Update reactive state
    this.data.demoShowcase.phase = cfg.phase;
    this.data.demoShowcase.phaseIndex = this.demoPhaseIndex;
    this.data.demoShowcase.totalPhases = list.length;
    this.data.demoShowcase.title = cfg.title;
    this.data.demoShowcase.description = cfg.description;
    this.data.demoShowcase.subText = cfg.subText;
    this.data.demoShowcase.badge = cfg.badge;
    this.data.demoShowcase.category = cfg.category;
    this.data.demoShowcase.phaseDuration = cfg.duration;
    this.data.demoShowcase.phaseElapsed = 0;

    // Default modal mapping
    const modalMap: Partial<Record<DemoShowcasePhase, string>> = {
      SOLAR_SAIL: 'solar-ship',
      SPACE_STATION: 'station',
      GALAXY_MAP: 'galaxy-map',
      PIRATE_DREADNOUGHT: 'pirate-flagship',
      OUTLAW_STATION: 'outlaw-station',
      SPACE_ANOMALY: 'expedition',
      BLACK_HOLE: 'black-hole',
      DERELICT_FREIGHTER: 'derelict-freighter',
      EVA_SPACEWALK: 'spacewalk',
      SHIP_FABRICATION: 'ship-paint',
      STARSHIP_WEAPONS: 'starship-weapons',
      GALACTIC_CORE: 'galactic-core',
      ORGANIC_FLEET: 'organic-fleet',
      FLOATING_ISLANDS: 'floating-islands',
      EXTREME_WEATHER: 'extreme-weather',
      VOLCANO_PLANET: 'volcano',
      LAYLAPS_DRONE: 'laylaps',
      WEAPON_ARSENAL_MODAL: 'weapon-arsenal',
      SUPERCHARGED_SLOTS: 'supercharge',
      EXOSUIT_UPGRADE: 'exosuit-upgrade',
      HAZARD_PROTECTION: 'hazard-protection',
      TOOL_SALVAGE: 'multi-tool-salvage',
      INVENTORY_MODAL: 'inventory',
      QUICK_RECHARGE: 'quick-recharge',
      BASE_BUILDING: 'base-computer',
      LARGE_REFINER: 'large-refiner',
      BASE_POWER_GRID: 'power-grid',
      EM_GENERATOR: 'em-generator',
      SHORT_RANGE_TELEPORT: 'short-range-teleporter',
      GAS_HARVESTER: 'gas-harvester',
      SPECIALIST_TERMINALS: 'specialist-terminals',
      BIODOME_FARMING: 'biodome',
      LIVESTOCK_RANCH: 'livestock-ranch',
      NUTRIENT_PROCESSOR: 'nutrient',
      ANCIENT_MONOLITH: 'archaeology',
      ANCIENT_PORTAL: 'portal',
      TRADE_OUTPOST: 'trade-outpost',
      CARTOGRAPHER_MAPS: 'cartographer',
      GUILD_ENVOY: 'guild-envoy',
      MANUFACTURING_FACILITY: 'manufacturing',
      ATLAS_PATH: 'atlas-path',
      ARCHAEOLOGY_DIG: 'archaeology',
      ABANDONED_FACILITY: 'abandoned-building',
      GIANT_SANDWORM: 'sandworm',
      BOUNDARY_FAILURE: 'boundary-failure',
      BIOLUMINESCENT_FOREST: 'bioluminescent-forest',
      NAUTILON_SUBMARINE: 'nautilon-sonar',
      ABYSSAL_HORROR: 'abyssal-horror',
      AQUATIC_BASE: 'aquatic-base',
      DEEP_AQUARIUM: 'aquarium',
      AQUARIUS_FISHING: 'fishing',
      TITAN_BEETLE_RIDE: 'titan-beetle',
      EGG_SEQUENCER: 'egg-sequencer',
      MINOTAUR_MECH: 'minotaur',
      EXOCRAFT_RACING: 'race-initiator',
      ATLANTID_TOOL: 'atlantid-tool',
      LIVING_SHIP_BOND: 'living-ship',
      WONDERS_HOLOGRAM: 'wonders',
      APPEARANCE_CUSTOMIZER: 'appearance',
      DISCOVERIES_COMPENDIUM: 'discoveries',
      INTERSTELLAR_TELEPORT: 'teleport',
      CUSTOM_DIFFICULTY: 'custom-difficulty',
      ORBITAL_MATERIALISER: 'orbital-freighter'
    };

    this.data.demoShowcase.activeModal = modalMap[cfg.phase] || null;

    // Specific phase setup hooks
    const isSpacePhase = [
      'SPACE_PULSE', 'SPACE_COMBAT', 'STARSHIP_CYCLE', 'SOLAR_SAIL',
      'SPACE_STATION', 'GALAXY_MAP', 'PIRATE_DREADNOUGHT', 'OUTLAW_STATION',
      'SPACE_ANOMALY', 'BLACK_HOLE', 'DERELICT_FREIGHTER', 'EVA_SPACEWALK',
      'SHIP_FABRICATION', 'STARSHIP_WEAPONS', 'GALACTIC_CORE', 'ORGANIC_FLEET',
      'PLANET_APPROACH'
    ].includes(cfg.phase);

    if (isSpacePhase && this.currState !== 'SPACE') {
      this.launchToOrbit();
    } else if (!isSpacePhase && cfg.phase !== 'LAUNCH_ORBIT' && this.currState === 'SPACE' && this.entities.planets.length > 0) {
      this.landCurrentShip(this.entities.planets[0]);
    }

    switch (cfg.phase) {
      case 'SPACE_PULSE':
        this.data.isPulseActive = true;
        this.selectRandomAutoPilotPlanet();
        AudioSys.playPulseDrive();
        break;
      case 'SPACE_COMBAT':
        this.data.isPulseActive = false;
        this.data.pirateCountdown = 120;
        AudioSys.playNote(260, 'sawtooth', 0.25);
        this.spawnFloatText("⚠️ 경보: 해적 약탈기 급습! 도그파이트 요격 개시", undefined, undefined, '#ff3366');
        break;
      case 'STARSHIP_CYCLE':
        this.data.isPulseActive = false;
        AudioSys.playNote(480, 'sine', 0.15);
        break;
      case 'SOLAR_SAIL':
        this.data.shipType = 'SOLAR';
        AudioSys.playNote(540, 'sine', 0.2);
        this.spawnFloatText("⛵ 솔라선 베스퍼 세일 태양광 돛 전개!", undefined, undefined, '#fbbf24');
        break;
      case 'PLANET_APPROACH':
        this.data.isPulseActive = true;
        if (!this.autoPilotTargetPlanet) this.selectRandomAutoPilotPlanet();
        break;
      case 'PLANET_TOUCHDOWN':
        this.data.demoShowcase.activeModal = null;
        if (this.currState === 'SPACE' && this.entities.planets.length > 0) {
          const target = this.autoPilotTargetPlanet || this.entities.planets[0];
          this.landCurrentShip(target);
        }
        AudioSys.playDiscoveryFanfare();
        break;
      case 'EXOSUIT_EXPLORE':
        this.data.isVisorActive = false;
        this.player.isMining = false;
        break;
      case 'RESOURCE_MINING':
        this.data.toolMode = 'MINING BEAM';
        this.data.isVisorActive = false;
        break;
      case 'ANALYSIS_VISOR':
        this.data.isVisorActive = true;
        this.setCameraZoom(1.3);
        this.triggerScanPulse();
        break;
      case 'TOOL_MODES':
        this.data.isVisorActive = false;
        this.setCameraZoom(1.0);
        break;
      case 'SENTINEL_PATROL':
        this.data.isVisorActive = false;
        this.data.sentinelAlert = 1;
        AudioSys.playNote(300, 'sawtooth', 0.2);
        this.spawnFloatText("🤖 센티넬 경비 드론 탐지 // 스캔 서치라이트 전개", undefined, undefined, '#ef4444');
        break;
      case 'COMBAT_WEAPONS':
        this.data.toolMode = 'BOLTCASTER';
        this.equipCombatWeapon('boltcaster');
        break;
      case 'SECONDARY_ORDNANCE':
        this.data.toolMode = 'BOLTCASTER';
        this.equipSecondaryWeapon('plasmaLauncher');
        break;
      case 'NAUTILON_SUBMARINE':
        this.data.nautilon.boarded = true;
        AudioSys.playNote(220, 'sawtooth', 0.3);
        this.spawnFloatText("🌊 노틸론 S급 잠수정 탑승 // 심해 추진 가동", undefined, this.height / 2 - 50, '#38bdf8');
        break;
      case 'AQUARIUS_FISHING':
        if (this.data.nautilon.boarded) this.dismountNautilon();
        AudioSys.playNote(540, 'sine', 0.15);
        break;
      case 'COMPANION_MOUNT':
        if (this.data.nautilon.boarded) this.dismountNautilon();
        AudioSys.playNote(620, 'sine', 0.2);
        this.spawnFloatText("🐾 외계 생명체 테이밍 완료 // 탑승 라이딩 개시", undefined, undefined, '#10b981');
        break;
      case 'LAUNCH_ORBIT':
        this.data.demoShowcase.activeModal = null;
        if (this.data.nautilon.boarded) this.dismountNautilon();
        break;
      default:
        AudioSys.playNote(440, 'sine', 0.1);
        break;
    }

    this.notify();
  }

  public advanceDemoPhase() {
    this.setupDemoPhase(this.demoPhaseIndex + 1);
  }

  public updateDemoShowcase() {
    if (!this.isAutoPilot) return;

    const now = Date.now();
    const elapsed = now - this.demoPhaseStartTime;
    this.data.demoShowcase.phaseElapsed = elapsed;

    const cfg = GameEngine.DEMO_PHASES[this.demoPhaseIndex] || GameEngine.DEMO_PHASES[0];

    // Check if phase duration elapsed -> advance to next phase
    if (elapsed >= cfg.duration) {
      this.advanceDemoPhase();
      return;
    }

    this.demoActionSubTimer++;

    // Specific phase update logic
    switch (cfg.phase) {
      case 'SPACE_PULSE': {
        if (this.currState !== 'SPACE') this.launchToOrbit();
        this.player.angle += 0.012;
        this.data.isPulseActive = true;
        this.player.vx = Math.cos(this.player.angle) * 30.0;
        this.player.vy = Math.sin(this.player.angle) * 30.0;
        if (this.demoActionSubTimer % 45 === 0) {
          this.fireSpaceWeapons();
          if (this.demoActionSubTimer % 90 === 0) {
            this.spawnFloatText("+15 삼중수소 (소행성 채굴)", undefined, undefined, '#38bdf8');
          }
        }
        break;
      }

      case 'SPACE_COMBAT': {
        if (this.currState !== 'SPACE') this.launchToOrbit();
        this.data.isPulseActive = false;
        this.player.angle += 0.024;
        this.player.vx = Math.cos(this.player.angle) * 12.0;
        this.player.vy = Math.sin(this.player.angle) * 12.0;
        if (this.demoActionSubTimer % 22 === 0) {
          this.fireSpaceWeapons();
        }
        if (elapsed > 3200 && this.demoLastActionTick === 0) {
          this.demoLastActionTick = 1;
          this.data.units += 2500;
          this.data.nanites += 50;
          AudioSys.playDiscoveryFanfare();
          this.spawnFloatText("💥 해적 인터셉터 격침! (+2,500 ₩ 현상금, +50 ⬡)", undefined, undefined, '#fbbf24');
        }
        break;
      }

      case 'STARSHIP_CYCLE': {
        if (this.currState !== 'SPACE') this.launchToOrbit();
        this.data.isPulseActive = false;
        this.player.vx = Math.cos(this.player.angle) * 8.5;
        this.player.vy = Math.sin(this.player.angle) * 8.5;
        if (this.demoActionSubTimer % 65 === 0) {
          this.cycleStarship();
        }
        if (this.demoActionSubTimer % 80 === 0) {
          this.fireSpaceWeapons();
        }
        break;
      }

      case 'SOLAR_SAIL': {
        this.data.shipType = 'SOLAR';
        this.player.angle += 0.015;
        this.player.vx = Math.cos(this.player.angle) * 15.0;
        this.player.vy = Math.sin(this.player.angle) * 15.0;
        if (this.demoActionSubTimer % 50 === 0) {
          this.fireSpaceWeapons();
        }
        break;
      }

      case 'PLANET_APPROACH': {
        this.data.demoShowcase.activeModal = null;
        if (this.currState !== 'SPACE') {
          this.advanceDemoPhase();
          return;
        }
        if (!this.autoPilotTargetPlanet) {
          this.selectRandomAutoPilotPlanet();
        }
        const target = this.autoPilotTargetPlanet;
        if (target) {
          const dx = target.x - this.player.x;
          const dy = target.y - this.player.y;
          const dist = Math.hypot(dx, dy);
          const targetAngle = Math.atan2(dy, dx);
          let diff = targetAngle - this.player.angle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          this.player.angle += diff * 0.12;

          const isPulse = dist > target.r + 250;
          this.data.isPulseActive = isPulse;
          const spd = isPulse ? 32.0 : 12.0;
          this.player.vx = Math.cos(this.player.angle) * spd;
          this.player.vy = Math.sin(this.player.angle) * spd;

          if (dist <= target.r * 0.85) {
            this.data.isPulseActive = false;
            this.landCurrentShip(target);
            AudioSys.playDiscoveryFanfare();
            this.advanceDemoPhase();
            return;
          }
        }
        break;
      }

      case 'PLANET_TOUCHDOWN': {
        this.data.demoShowcase.activeModal = null;
        if (this.currState !== 'PLANET' && this.entities.planets.length > 0) {
          this.landCurrentShip(this.entities.planets[0]);
        }
        this.player.isMining = false;
        this.player.px += Math.cos(this.autoPilotWanderAngle) * 2.0;
        this.player.py += Math.sin(this.autoPilotWanderAngle) * 2.0;
        this.player.anim += 0.15;
        break;
      }

      case 'EXOSUIT_EXPLORE': {
        if (this.currState !== 'PLANET' && this.entities.planets.length > 0) {
          this.landCurrentShip(this.entities.planets[0]);
        }
        this.data.demoShowcase.activeModal = null;
        this.player.px += Math.cos(this.autoPilotWanderAngle) * 3.4;
        this.player.py += Math.sin(this.autoPilotWanderAngle) * 3.4;
        this.autoPilotWanderAngle += 0.032;
        this.player.facing = Math.cos(this.autoPilotWanderAngle) > 0 ? 1 : -1;
        this.player.anim += 0.2;

        const jetpackCycle = this.demoActionSubTimer % 90;
        if (jetpackCycle > 25 && jetpackCycle < 60) {
          this.player.isJetpacking = true;
          this.player.py -= 1.6;
          if (this.demoActionSubTimer % 18 === 0) AudioSys.playJetpack();
        } else {
          this.player.isJetpacking = false;
        }
        break;
      }

      case 'RESOURCE_MINING': {
        if (this.currState !== 'PLANET' && this.entities.planets.length > 0) {
          this.landCurrentShip(this.entities.planets[0]);
        }
        this.data.demoShowcase.activeModal = null;
        this.data.toolMode = 'MINING BEAM';
        this.player.isMining = true;
        if (this.data.activePlanet) {
          this.handlePlanetFire(this.data.activePlanet);
        }
        break;
      }

      case 'ANALYSIS_VISOR': {
        if (this.currState !== 'PLANET' && this.entities.planets.length > 0) {
          this.landCurrentShip(this.entities.planets[0]);
        }
        this.data.demoShowcase.activeModal = null;
        this.data.isVisorActive = true;
        this.player.isJetpacking = false;
        this.player.px += Math.cos(this.autoPilotWanderAngle) * 1.2;
        this.player.py += Math.sin(this.autoPilotWanderAngle) * 1.2;
        this.autoPilotWanderAngle += 0.015;
        this.player.anim += 0.1;
        if (this.demoActionSubTimer % 75 === 0) {
          this.triggerScanPulse();
        }
        break;
      }

      case 'TOOL_MODES': {
        this.data.demoShowcase.activeModal = null;
        this.data.isVisorActive = false;
        this.setCameraZoom(1.0);
        if (this.demoActionSubTimer % 65 === 0) {
          this.cycleToolMode();
        }
        this.player.isMining = true;
        if (this.data.activePlanet) {
          this.handlePlanetFire(this.data.activePlanet);
        }
        break;
      }

      case 'SENTINEL_PATROL': {
        this.data.demoShowcase.activeModal = null;
        this.data.isVisorActive = false;
        this.player.isMining = false;
        this.player.px += Math.cos(this.autoPilotWanderAngle) * 2.2;
        this.player.py += Math.sin(this.autoPilotWanderAngle) * 2.2;
        this.autoPilotWanderAngle += 0.02;
        if (this.demoActionSubTimer % 60 === 0) {
          AudioSys.playNote(340, 'sawtooth', 0.15);
        }
        break;
      }

      case 'COMBAT_WEAPONS': {
        this.data.demoShowcase.activeModal = null;
        this.data.toolMode = 'BOLTCASTER';
        if (this.demoActionSubTimer % 60 === 0) {
          this.cycleCombatWeapon();
        }
        this.player.isMining = true;
        if (this.demoActionSubTimer % 8 === 0 && this.data.activePlanet) {
          this.handlePlanetFire(this.data.activePlanet);
        }
        break;
      }

      case 'SECONDARY_ORDNANCE': {
        this.data.demoShowcase.activeModal = null;
        this.data.toolMode = 'BOLTCASTER';
        if (this.demoActionSubTimer % 75 === 0) {
          this.cycleSecondaryWeapon();
          this.fireSecondaryWeapon();
        }
        break;
      }

      case 'WEAPON_ARSENAL_MODAL': {
        this.player.isMining = false;
        const tabs = ['primary', 'secondary', 'upgrades', 'overclock'];
        const tabIdx = Math.floor((elapsed / 1100) % tabs.length);
        this.data.demoShowcase.modalTab = tabs[tabIdx];
        if (tabIdx === 3 && !this.data.combatWeapons.overclockActive && elapsed > 3300) {
          this.overclockWeaponMatrix();
        }
        break;
      }

      case 'INVENTORY_MODAL': {
        this.player.isMining = false;
        if (elapsed > 2000 && this.demoLastActionTick === 0) {
          this.demoLastActionTick = 1;
          this.rechargeHazard();
        }
        break;
      }

      case 'NAUTILON_SUBMARINE': {
        this.data.demoShowcase.activeModal = null;
        this.data.nautilon.boarded = true;
        this.player.px += Math.cos(this.autoPilotWanderAngle) * 3.0;
        this.player.py += Math.sin(this.autoPilotWanderAngle) * 3.0;
        this.autoPilotWanderAngle += 0.022;
        if (this.demoActionSubTimer % 85 === 0) {
          this.triggerNautilonSonar();
        }
        break;
      }

      case 'COMPANION_MOUNT': {
        if (this.data.nautilon.boarded) {
          this.dismountNautilon();
        }
        this.data.demoShowcase.activeModal = null;
        this.player.px += Math.cos(this.autoPilotWanderAngle) * 5.2;
        this.player.py += Math.sin(this.autoPilotWanderAngle) * 5.2;
        this.autoPilotWanderAngle += 0.028;
        this.player.facing = Math.cos(this.autoPilotWanderAngle) > 0 ? 1 : -1;
        this.player.anim += 0.35;
        break;
      }

      case 'LAUNCH_ORBIT': {
        this.data.demoShowcase.activeModal = null;
        if (this.data.nautilon.boarded) {
          this.dismountNautilon();
        }
        if (this.currState === 'PLANET') {
          const shipDist = Math.hypot(this.parkedShip.x - this.player.px, this.parkedShip.y - this.player.py);
          if (shipDist > 45) {
            const toShipAngle = Math.atan2(this.parkedShip.y - this.player.py, this.parkedShip.x - this.player.px);
            this.player.px += Math.cos(toShipAngle) * 4.6;
            this.player.py += Math.sin(toShipAngle) * 4.6;
            this.player.facing = Math.cos(toShipAngle) > 0 ? 1 : -1;
            this.player.anim += 0.25;
          } else {
            const prevPlanet = this.data.activePlanet?.name;
            this.launchToOrbit();
            this.selectRandomAutoPilotPlanet(prevPlanet);
            this.advanceDemoPhase();
            return;
          }
        } else {
          this.data.isPulseActive = true;
          this.player.vx = Math.cos(this.player.angle) * 32.0;
          this.player.vy = Math.sin(this.player.angle) * 32.0;
        }
        break;
      }

      default: {
        // General modal or background simulation
        if (this.currState === 'PLANET') {
          this.player.px += Math.cos(this.autoPilotWanderAngle) * 1.5;
          this.player.py += Math.sin(this.autoPilotWanderAngle) * 1.5;
          this.autoPilotWanderAngle += 0.01;
          this.player.anim += 0.08;
        } else {
          this.player.angle += 0.008;
          this.player.vx = Math.cos(this.player.angle) * 10.0;
          this.player.vy = Math.sin(this.player.angle) * 10.0;
        }
        break;
      }
    }
  }

  public setCameraZoom(zoom: number) {
    this.cameraZoom = Math.max(0.4, Math.min(3.5, zoom));
    this.notify();
  }

  public zoomIn(delta: number = 0.25) {
    this.setCameraZoom(this.cameraZoom + delta);
  }

  public zoomOut(delta: number = 0.25) {
    this.setCameraZoom(this.cameraZoom - delta);
  }

  public resetZoom() {
    this.setCameraZoom(1.0);
  }

  public selectRandomAutoPilotPlanet(excludePlanetName?: string) {
    const available = this.entities.planets.filter(p => p.name !== excludePlanetName);
    const pool = available.length > 0 ? available : this.entities.planets;
    if (pool.length > 0) {
      const idx = Math.floor(Math.random() * pool.length);
      this.autoPilotTargetPlanet = pool[idx];
    }
  }

  public rechargeHazard() {
    if (this.data.inv.sodium >= 15 && this.data.hazard < 100) {
      this.data.inv.sodium -= 15;
      this.data.hazard = Math.min(100, this.data.hazard + 50);
      AudioSys.playRecharge();
      this.spawnFloatText("나트륨 충전: 환경 보호막 복구 (+50%)", undefined, undefined, '#ffb703');
    } else {
      this.spawnFloatText("나트륨(Na) 부족 (15개 필요)", undefined, undefined, '#ff3366');
      AudioSys.playWarning();
    }
    this.notify();
  }

  public rechargeLifeSupport() {
    if (this.data.inv.oxygen >= 15 && this.data.lifeSupport < 100) {
      this.data.inv.oxygen -= 15;
      this.data.lifeSupport = Math.min(100, this.data.lifeSupport + 50);
      AudioSys.playRecharge();
      this.spawnFloatText("산소 충전: 생명 유지 장치 충전 (+50%)", undefined, undefined, '#ff3366');
    } else {
      this.spawnFloatText("산소(O2) 부족 (15개 필요)", undefined, undefined, '#ff3366');
      AudioSys.playWarning();
    }
    this.notify();
  }

  public rechargeMiningBeam() {
    if (this.data.inv.carbon >= 20 && this.data.weaponCharge < 100) {
      this.data.inv.carbon -= 20;
      this.data.weaponCharge = Math.min(100, this.data.weaponCharge + 50);
      AudioSys.playRecharge();
      this.spawnFloatText("탄소 충전: 채굴 레이저 충전 (+50%)", undefined, undefined, '#00e5ff');
    } else {
      this.spawnFloatText("탄소(C) 부족 (20개 필요)", undefined, undefined, '#ff3366');
      AudioSys.playWarning();
    }
    this.notify();
  }

  public cycleToolMode() {
    const modes: ToolMode[] = ['MINING BEAM', 'TERRAIN MANIPULATOR', 'BOLTCASTER', 'VOLTAIC STAFF'];
    const nextIdx = (modes.indexOf(this.data.toolMode) + 1) % modes.length;
    this.data.toolMode = modes[nextIdx];
    AudioSys.playNote(520, 'sine', 0.1);
    this.spawnFloatText(`도구 모드: ${this.data.toolMode}`, undefined, undefined, '#00e5ff');
    this.notify();
  }

  public reloadBoltcaster() {
    if (this.data.ammo >= this.data.maxAmmo) {
      this.spawnFloatText("탄창 이미 가득 참", undefined, undefined, '#94a3b8');
      return;
    }
    if (this.data.inv.ferrite >= 10) {
      this.data.inv.ferrite -= 10;
      this.data.ammo = this.data.maxAmmo;
      AudioSys.playRecharge();
      this.spawnFloatText("볼트캐스터 재장전 완료 (24발)", undefined, undefined, '#facc15');
    } else if (this.data.inv.carbon >= 15) {
      this.data.inv.carbon -= 15;
      this.data.ammo = this.data.maxAmmo;
      AudioSys.playRecharge();
      this.spawnFloatText("탄소 합성 재장전 완료 (24발)", undefined, undefined, '#facc15');
    } else {
      this.data.ammo = this.data.maxAmmo;
      AudioSys.playRecharge();
      this.spawnFloatText("비상 탄약 긴급 보급 완료!", undefined, undefined, '#facc15');
    }
    this.notify();
  }

  public lastScanTime: number = 0;

  public triggerScanPulse() {
    const now = Date.now();
    const rechargeSetting = this.data.difficultySettings?.scannerRecharge || 'STANDARD';
    const cooldownMs = rechargeSetting === 'INSTANT' ? 400 : (rechargeSetting === 'FAST' ? 3000 : 8000);
    
    if (now - this.lastScanTime < cooldownMs) {
      const remainSec = ((cooldownMs - (now - this.lastScanTime)) / 1000).toFixed(1);
      this.spawnFloatText(`⏳ 스캐너 재충전 중 (${remainSec}초 대기)`, undefined, undefined, '#94a3b8');
      return;
    }
    this.lastScanTime = now;
    AudioSys.playScanPulse();
    this.spawnFloatText("📡 스캐너 펄스 발동 // 지형 자원 탐지", undefined, undefined, '#00e5ff');
  }

  // --- WAYPOINT 4.0 DIFFICULTY SYSTEM (v5.51.0) ---
  public applyDifficultyPreset(presetKey: DifficultyPreset) {
    if (presetKey === 'CUSTOM') {
      this.data.difficultySettings.preset = 'CUSTOM';
    } else if (DIFFICULTY_PRESETS[presetKey as keyof typeof DIFFICULTY_PRESETS]) {
      this.data.difficultySettings = { ...DIFFICULTY_PRESETS[presetKey as keyof typeof DIFFICULTY_PRESETS] };
    }
    AudioSys.playRecharge();
    this.spawnFloatText(`⚙️ 난이도 프리셋 적용: [${presetKey}]`, undefined, this.height / 2 - 70, '#f59e0b');
    this.notify();
  }

  public setDifficultyParam<K extends keyof DifficultySettings>(paramName: K, value: DifficultySettings[K]) {
    if (!this.data.difficultySettings) {
      this.data.difficultySettings = { ...DIFFICULTY_PRESETS.NORMAL };
    }
    this.data.difficultySettings[paramName] = value;
    this.data.difficultySettings.preset = 'CUSTOM';
    AudioSys.playNote(587, 'sine', 0.08, 0.2);
    this.notify();
  }

  public claimUtopiaSpeeder() {
    this.data.shipType = 'UTOPIA_SPEEDER';
    this.data.maxShield = 320;
    this.data.shield = 320;
    this.data.utopiaSpeederClaimed = true;
    AudioSys.playDiscoveryFanfare();
    this.spawnFloatText("🚀 UTOPIA SPEEDER STARSHIP CLAIMED // SPEED & AGILITY MAXIMIZED!", undefined, this.height / 2 - 70, '#00e5ff');
    this.notify();
  }

  public takeDamage(amount: number) {
    const diff = this.data.difficultySettings || DIFFICULTY_PRESETS.NORMAL;
    if (diff.hazardDrain === 'CREATIVE') return; // Creative mode: God mode
    if (diff.combatDifficulty === 'WEAK') amount *= 0.5;
    else if (diff.combatDifficulty === 'CHALLENGING') amount *= 1.6;

    if (this.data.shield > 0) {
      this.data.shield = Math.max(0, this.data.shield - amount);
    } else {
      this.data.hazard = Math.max(0, this.data.hazard - amount * 0.5);
    }
    this.notify();
  }

  // Nautilon Submarine System (The Abyss 1.70 & Aquarius 5.10)
  public toggleNautilonSubmarine() {
    if (this.currState !== 'PLANET') {
      this.spawnFloatText("⚠️ 노틸론 잠수정은 행성 수역/표면에서만 전개 가능합니다!", undefined, this.height / 2 - 60, '#ff3366');
      return;
    }
    this.data.nautilon.boarded = !this.data.nautilon.boarded;
    if (this.data.nautilon.boarded) {
      this.data.hazard = 100;
      this.data.lifeSupport = 100;
      AudioSys.playNote(293.66, 'sine', 0.25, 0.4);
      setTimeout(() => AudioSys.playNote(587.33, 'sine', 0.35, 0.5), 180);
      this.spawnFloatText("🌊 NAUTILON SUBMERSIBLE BOARDED // 100% DEPTH IMMUNITY ONLINE!", undefined, this.height / 2 - 70, '#38bdf8');
    } else {
      AudioSys.playNote(300, 'sine', 0.15, 0.2);
      this.spawnFloatText("⚓ DISMOUNTED NAUTILON // 잠수정 하선 완료", undefined, this.height / 2 - 60, '#94a3b8');
    }
    this.notify();
  }

  public triggerNautilonSonar() {
    AudioSys.playNote(220, 'sine', 0.35, 0.4);
    setTimeout(() => AudioSys.playNote(440, 'sine', 0.2, 0.3), 150);
    this.scanSunkenRuins();
    this.spawnFloatText("📡 노틸론 고출력 소나 스캔 // 심해 유적 및 수중 잔해 좌표 수신", undefined, this.height / 2 - 70, '#38bdf8');
  }

  public dismountNautilon() {
    this.data.nautilon.boarded = false;
    AudioSys.playNote(300, 'sine', 0.15, 0.2);
    this.spawnFloatText("⚓ DISMOUNTED NAUTILON // 잠수정 하선 완료", undefined, this.height / 2 - 60, '#94a3b8');
    this.notify();
  }

  public scanSunkenRuins() {
    this.data.units += 450000;
    this.data.nanites += 300;
    AudioSys.playNote(293.66, 'sine', 0.25, 0.4);
    setTimeout(() => AudioSys.playNote(587.33, 'sine', 0.35, 0.5), 180);
    this.spawnFloatText("🏛️ SUNKEN PRECURSOR RUINS DETECTED! (+450,000 ₩, +300 ⬡)", undefined, this.height / 2 - 70, '#38bdf8');
    this.notify();
  }

  public scanSunkenStarship() {
    this.data.units += 600000;
    AudioSys.playNote(293.66, 'sine', 0.25, 0.4);
    setTimeout(() => AudioSys.playNote(587.33, 'sine', 0.35, 0.5), 180);
    this.spawnFloatText("🚀 SUNKEN STARSHIP WRECKAGE SALVAGED! (+600,000 ₩)", undefined, this.height / 2 - 70, '#00e5ff');
    this.notify();
  }

  public scanSunkenFreighter() {
    this.data.units += 850000;
    AudioSys.playNote(293.66, 'sine', 0.25, 0.4);
    setTimeout(() => AudioSys.playNote(587.33, 'sine', 0.35, 0.5), 180);
    this.spawnFloatText("🚢 SUNKEN FREIGHTER LOCATED! (+850,000 ₩)", undefined, this.height / 2 - 70, '#f59e0b');
    this.notify();
  }

  public scanAbyssalHorrors() {
    this.data.nautilon.livingPearls += 3;
    this.data.nautilon.hadalCores += 2;
    this.data.nautilon.hypnoticEyes += 1;
    AudioSys.playNote(293.66, 'sine', 0.25, 0.4);
    setTimeout(() => AudioSys.playNote(587.33, 'sine', 0.35, 0.5), 180);
    this.spawnFloatText("👁️ ABYSSAL HORROR EXPEDITION! (진주 +3, 코어 +2, 최면눈 +1)", undefined, this.height / 2 - 70, '#ec4899');
    this.notify();
  }

  public launchSubTorpedo() {
    if (!this.data.nautilon.torpedoLauncher) {
      this.spawnFloatText("⚠️ 수중 어뢰 발사관이 미장착 상태입니다! 기술 탭에서 업그레이드하세요.", undefined, this.height / 2 - 60, '#f59e0b');
      return;
    }
    AudioSys.playNote(140, 'triangle', 0.4, 0.5);
    this.spawnFloatText("🚀 SUB-SURFACE TORPEDO LAUNCHED! // 심해 충격파 발생!", undefined, this.height / 2 - 70, '#ef4444');
    this.notify();
  }

  public upgradeNautilonTech(techKey: 'engine' | 'torpedo' | 'mining') {
    if (techKey === 'engine') {
      if (this.data.nanites < 400) {
        this.spawnFloatText("⚠️ 나노로봇이 부족합니다 (필요: 400 ⬡)", undefined, undefined, '#ff3366');
        return;
      }
      this.data.nanites -= 400;
      this.data.nautilon.engineOverclock = true;
      AudioSys.playDiscoveryFanfare();
      this.spawnFloatText("⚙️ 훔볼트 드라이브 펄스 오버클럭 완료! (+65% 순항속도)", undefined, undefined, '#38bdf8');
    } else if (techKey === 'torpedo') {
      if (this.data.nanites < 650) {
        this.spawnFloatText("⚠️ 나노로봇이 부족합니다 (필요: 650 ⬡)", undefined, undefined, '#ff3366');
        return;
      }
      this.data.nanites -= 650;
      this.data.nautilon.torpedoLauncher = true;
      AudioSys.playDiscoveryFanfare();
      this.spawnFloatText("🚀 나노 수중 어뢰 발사관 무장 장착 완료!", undefined, undefined, '#ef4444');
    } else if (techKey === 'mining') {
      if (this.data.nanites < 500) {
        this.spawnFloatText("⚠️ 나노로봇이 부족합니다 (필요: 500 ⬡)", undefined, undefined, '#ff3366');
        return;
      }
      this.data.nanites -= 500;
      this.data.nautilon.tethysMining = true;
      AudioSys.playDiscoveryFanfare();
      this.spawnFloatText("⛏️ 테티스 고출력 수중 채굴 레이저 가동 완료!", undefined, undefined, '#10b981');
    }
    this.notify();
  }

  public harvestAbyssPearls() {
    this.data.nautilon.livingPearls += 2;
    this.data.units += 120000;
    AudioSys.playNote(440, 'sine', 0.15, 0.2);
    this.spawnFloatText("🦪 살아있는 진주 채취 완료 (+2 진주, +120,000 ₩)", undefined, undefined, '#38bdf8');
    this.notify();
  }

  public harvestHadalCores() {
    this.data.nautilon.hadalCores += 1;
    this.data.nanites += 150;
    AudioSys.playNote(440, 'sine', 0.15, 0.2);
    this.spawnFloatText("💎 해달 코어 정제 완료 (+1 코어, +150 ⬡)", undefined, undefined, '#a855f7');
    this.notify();
  }

  // Combat Arsenal & Ordnance Matrix System (v5.50.0 Sentinel & Waypoint)
  public testFireActiveCombatWeapon() {
    const cw = this.data.combatWeapons;
    const activeW = cw.weapons[cw.activeWeapon] || cw.weapons.boltcaster;
    AudioSys.playBoltcaster();
    const dps = Math.round((activeW.baseDps || 3000) * (cw.overclockActive ? 1.5 : 1) * (activeW.supercharged ? 1.3 : 1));
    this.spawnFloatText(`💥 [사격 시험] ${activeW.name.split(' ')[0]} 발사! (${dps} DPS)`, undefined, this.height / 2 - 70, activeW.color || '#f97316');
    this.notify();
  }

  public cycleCombatWeapon() {
    const cw = this.data.combatWeapons;
    const keys = Object.keys(cw.weapons);
    const currIdx = keys.indexOf(cw.activeWeapon);
    const nextIdx = (currIdx + 1) % keys.length;
    this.equipCombatWeapon(keys[nextIdx]);
  }

  public equipCombatWeapon(weaponId: string) {
    const cw = this.data.combatWeapons;
    if (!cw.weapons[weaponId]) return;
    cw.activeWeapon = weaponId;
    const w = cw.weapons[weaponId];
    this.data.toolMode = 'BOLTCASTER';
    AudioSys.playNote(440, 'triangle', 0.1, 0.2);
    setTimeout(() => AudioSys.playNote(659.25, 'sine', 0.15, 0.25), 80);
    this.spawnFloatText(`🔫 주무기 장착: ${w.name.split(' ')[0]}`, undefined, this.height / 2 - 60, w.color || '#facc15');
    this.notify();
  }

  public superchargeWeapon(weaponId: string) {
    const cw = this.data.combatWeapons;
    const w = cw.weapons[weaponId];
    if (!w) return;
    if (this.data.nanites < 500 && !w.supercharged) {
      this.data.nanites += 500;
    }
    if (!w.supercharged) {
      this.data.nanites = Math.max(0, this.data.nanites - 500);
    }
    w.supercharged = !w.supercharged;
    w.dps = Math.round(w.baseDps * (w.supercharged ? 1.5 : 1.0));
    AudioSys.playDiscoveryFanfare();
    this.spawnFloatText(`⚡ ${w.name.split(' ')[0]} 과급 슬롯 ${w.supercharged ? '활성화! (+50% 화력)' : '해제'}`, undefined, this.height / 2 - 60, '#00e5ff');
    this.notify();
  }

  public refineSalvagedGlassWeapon() {
    const cw = this.data.combatWeapons;
    cw.glassRefined = true;
    this.data.units += 180000;
    this.data.nanites += 250;
    AudioSys.playDiscoveryFanfare();
    this.spawnFloatText("🔮 인양된 유리 정제 완료! (+180k ₩, +250 ⬡, 센티넬 무기 파편 모듈)", undefined, this.height / 2 - 70, '#c084fc');
    this.notify();
  }

  public supplyFieldMunitions() {
    const cw = this.data.combatWeapons;
    cw.munitionsSupplied = true;
    this.data.nanites += 150;
    this.data.ammo = this.data.maxAmmo;
    for (const k in cw.weapons) {
      cw.weapons[k].curMag = cw.weapons[k].magSize;
    }
    AudioSys.playDiscoveryFanfare();
    this.spawnFloatText("📦 야전 탄약 캡슐 투하 // 모든 화기 탄약 100% 즉시 보급 (+150 ⬡)", undefined, this.height / 2 - 70, '#fbbf24');
    this.notify();
  }

  public overclockWeaponMatrix() {
    const cw = this.data.combatWeapons;
    cw.overclockActive = true;
    this.data.nanites += 200;
    AudioSys.playDiscoveryFanfare();
    this.spawnFloatText("⚡ 과급 슬롯 과부하 공명 가동! (공격력 +50%, 연사력 +35%, +200 ⬡)", undefined, this.height / 2 - 70, '#06b6d4');
    this.notify();
  }

  public claimArmoryMunitionsGrant() {
    const cw = this.data.combatWeapons;
    cw.grantClaimed = true;
    this.data.units += 320000;
    this.data.nanites += 450;
    this.data.quicksilver += 150;
    AudioSys.playDiscoveryFanfare();
    this.spawnFloatText("📋 무기고 병참 지원금 수령! (+320k ₩, +450 ⬡, +150 ◈)", undefined, this.height / 2 - 70, '#f97316');
    this.notify();
  }

  public equipSecondaryWeapon(weaponKey: 'plasmaLauncher' | 'geologyCannon' | 'personalForcefield' | 'cloakingDevice' | 'paralysisMortar') {
    this.data.secondaryWeapons.active = weaponKey;
    AudioSys.playNote(520, 'sine', 0.1, 0.2);
    this.spawnFloatText(`💣 보조 중화기 전환: ${weaponKey.toUpperCase()}`, undefined, this.height / 2 - 60, '#38bdf8');
    this.notify();
  }

  public fireSecondaryWeapon() {
    const sec = this.data.secondaryWeapons;
    const active = sec.active;
    if ((sec.ammo[active] || 0) <= 0) {
      this.spawnFloatText(`⚠️ ${active.toUpperCase()} 탄약/에너지가 고갈되었습니다!`, undefined, this.height / 2 - 60, '#ef4444');
      return;
    }
    sec.ammo[active] = Math.max(0, (sec.ammo[active] || 0) - 1);
    AudioSys.playNote(180, 'sawtooth', 0.35, 0.4);
    this.spawnFloatText(`💥 [보조 발사] ${this.getSecondaryWeaponName(active)} 사격! (잔탄: ${sec.ammo[active]})`, undefined, this.height / 2 - 70, '#f97316');
    this.notify();
  }

  public cycleSecondaryWeapon() {
    const sec = this.data.secondaryWeapons;
    const order: Array<'plasmaLauncher' | 'geologyCannon' | 'personalForcefield' | 'cloakingDevice' | 'paralysisMortar'> = [
      'plasmaLauncher', 'geologyCannon', 'paralysisMortar', 'personalForcefield', 'cloakingDevice'
    ];
    const currIdx = order.indexOf(sec.active);
    const nextIdx = (currIdx + 1) % order.length;
    this.equipSecondaryWeapon(order[nextIdx]);
  }

  public getSecondaryWeaponName(key?: string): string {
    const k = key || this.data.secondaryWeapons.active;
    switch (k) {
      case 'plasmaLauncher': return '플라즈마 런처';
      case 'geologyCannon': return '지질학 캐논';
      case 'paralysisMortar': return '마비 박격포';
      case 'personalForcefield': return '개인 역장 방패';
      case 'cloakingDevice': return '은폐 장치';
      default: return '보조 무기';
    }
  }

  public getSecondaryWeaponIcon(key?: string): string {
    const k = key || this.data.secondaryWeapons.active;
    switch (k) {
      case 'plasmaLauncher': return '💥';
      case 'geologyCannon': return '🌋';
      case 'paralysisMortar': return '⚡';
      case 'personalForcefield': return '🛡️';
      case 'cloakingDevice': return '👻';
      default: return '💣';
    }
  }

  public getNearestPlanet(): { planet: PlanetEntity; distance: number } | null {
    if (this.entities.planets.length === 0) return null;
    let nearest: PlanetEntity = this.entities.planets[0];
    let minDist = Infinity;
    for (const p of this.entities.planets) {
      const d = Math.hypot(p.x - this.player.x, p.y - this.player.y);
      if (d < minDist) {
        minDist = d;
        nearest = p;
      }
    }
    return { planet: nearest, distance: Math.round(minDist) };
  }

  public alignToNearestPlanet() {
    if (this.currState !== 'SPACE') return;
    const res = this.getNearestPlanet();
    if (res) {
      const { planet, distance } = res;
      const angle = Math.atan2(planet.y - this.player.y, planet.x - this.player.x);
      this.player.angle = angle;
      this.player.vx = Math.cos(angle) * 5.5;
      this.player.vy = Math.sin(angle) * 5.5;
      AudioSys.playDiscoveryFanfare();
      this.spawnFloatText(`🧭 [${planet.name}] 방향 정렬 완료! (거리: ${distance}u)`, undefined, undefined, '#00e5ff');
      this.spawnFloatText("👉 [펄스부스트] 버튼을 눌러 고속 전진하세요!", undefined, this.height / 2 - 25, '#facc15');
      this.notify();
    }
  }

  public cycleStarship() {
    const order: ShipType[] = ['MECHANICAL', 'LIVING', 'INTERCEPTOR', 'SOLAR'];
    const idx = (order.indexOf(this.data.shipType) + 1) % order.length;
    this.data.shipType = order[idx];

    if (this.data.shipType === 'SOLAR') {
      this.data.maxShield = 340;
      this.data.shield = 340;
      this.spawnFloatText("함선: S-Class 솔라선 (베스퍼 세일 태양광 항해)", undefined, undefined, '#f59e0b');
    } else if (this.data.shipType === 'INTERCEPTOR') {
      this.data.maxShield = 320;
      this.data.shield = 320;
      this.spawnFloatText("함선: S-Class 센티넬 인터셉터 (반중력 호버)", undefined, undefined, '#ef4444');
    } else if (this.data.shipType === 'LIVING') {
      this.data.maxShield = 280;
      this.data.shield = 280;
      this.spawnFloatText("함선: S-Class 유기체 생체 함선", undefined, undefined, '#c084fc');
    } else {
      this.data.maxShield = 200;
      this.data.shield = 200;
      this.spawnFloatText("함선: 클래식 래디언트 필러 기계선", undefined, undefined, '#00e5ff');
    }
    AudioSys.playDiscoveryFanfare();
    this.notify();
  }

  public update() {
    if (this.currState === 'WARP') {
      this.warpProgress++;
      if (this.warpProgress > 150) {
        this.currState = 'SPACE';
        this.warpProgress = 0;
        AudioSys.playDiscoveryFanfare();
        this.spawnFloatText("워프 도약 완료 // 신규 성계 도달", undefined, undefined, '#00e5ff');
      }
      return;
    }

    // Shield natural recharge
    if (this.data.shield < this.data.maxShield) {
      const regenRate = this.data.shipType === 'SOLAR' && this.currState === 'SPACE' ? 0.08 : 0.03;
      this.data.shield = Math.min(this.data.maxShield, this.data.shield + regenRate);
    }

    // Weapon Overheat Cool
    if (this.data.overheat > 0) {
      this.data.overheat = Math.max(0, this.data.overheat - (this.data.isOverheated ? 0.4 : 0.7));
      if (this.data.overheat === 0 && this.data.isOverheated) {
        this.data.isOverheated = false;
      }
    }

    // Input vector combining Joystick + Keyboard
    let moveX = this.touchControls.joystickVector.x;
    let moveY = this.touchControls.joystickVector.y;
    if (this.keyboard.w) moveY -= 1;
    if (this.keyboard.s) moveY += 1;
    if (this.keyboard.a) moveX -= 1;
    if (this.keyboard.d) moveX += 1;

    const inputLen = Math.hypot(moveX, moveY);
    if (inputLen > 1) {
      moveX /= inputLen;
      moveY /= inputLen;
    }

    // Check user input activity to disengage autopilot if user moves joystick/keyboard
    if (inputLen > 0.08 || this.touchControls.isFiring || this.touchControls.isJetpacking || this.touchControls.isInteracting || this.mouse.isDown) {
      this.notifyUserInput();
    }

    const now = Date.now();
    // 10s idle trigger condition: automatically engage AutoPilot
    if (!this.isAutoPilot && (now - this.lastInputTime >= 10000)) {
      this.engageAutoPilot();
    }

    // SPACE STATE
    if (this.currState === 'SPACE') {
      if (this.isAutoPilot) {
        this.updateDemoShowcase();
      } else {
        // MANUAL PLAYER FLIGHT CONTROLS
        const isThrusting = (this.touchControls.isJetpacking || this.keyboard.space || inputLen > 0.1);
        if (inputLen > 0.08) {
          const targetAngle = Math.atan2(moveY, moveX);
          this.player.angle = targetAngle;
        }

        if (isThrusting) {
          const pulse = Boolean(this.touchControls.isJetpacking || this.keyboard.space);
          this.data.isPulseActive = pulse;
          const spd = pulse ? 36.0 : 7.5;
          this.player.vx += Math.cos(this.player.angle) * (pulse ? 1.5 : 0.4);
          this.player.vy += Math.sin(this.player.angle) * (pulse ? 1.5 : 0.4);
          const maxV = spd;
          const curV = Math.hypot(this.player.vx, this.player.vy);
          if (curV > maxV) {
            this.player.vx = (this.player.vx / curV) * maxV;
            this.player.vy = (this.player.vy / curV) * maxV;
          }
        } else {
          this.data.isPulseActive = false;
          this.player.vx *= 0.97;
          this.player.vy *= 0.97;
        }
      }

      this.player.x += this.player.vx;
      this.player.y += this.player.vy;

      // Space Shooting
      if (this.shipFireCooldown > 0) this.shipFireCooldown--;
      if ((this.touchControls.isFiring || this.mouse.isDown) && this.shipFireCooldown === 0) {
        this.fireSpaceWeapons();
      }

      // Check space proximity interactions (Planets, Station, Anomaly, Freighter)
      let interactTarget: string | null = null;
      let interactAction: (() => void) | null = null;
      let nearestPlanetInRange: PlanetEntity | null = null;

      for (const p of this.entities.planets) {
        const d = Math.hypot(this.player.x - p.x, this.player.y - p.y);

        // When entering planet atmosphere in airplane mode (d <= p.r):
        if (d <= p.r) {
          nearestPlanetInRange = p;
          interactTarget = `🛬 ${p.name} 착륙 [E / 착륙버튼]`;
          interactAction = () => this.landCurrentShip(p);

          // Detect initial atmosphere entry
          if (this.insidePlanetInFlight !== p.name) {
            this.insidePlanetInFlight = p.name;
            AudioSys.playDiscoveryFanfare();
            this.spawnFloatText(`🔥 ${p.name} 대기권 진입 완료! 저공 비행 중`, undefined, undefined, '#10b981');
            this.spawnFloatText(`🛬 [착륙] 버튼 또는 [E]를 누르면 이 위치에 착륙합니다`, undefined, this.height / 2 - 25, '#00e5ff');
          }
          break;
        } else if (d < p.r + 380) {
          // Approaching orbital landing zone
          nearestPlanetInRange = p;
          interactTarget = `🛬 ${p.name} 궤도 착륙 [E]`;
          interactAction = () => this.landCurrentShip(p);

          // If exiting planet atmosphere into outer space
          if (this.insidePlanetInFlight === p.name && d > p.r + 40) {
            this.insidePlanetInFlight = null;
            this.spawnFloatText(`🚀 ${p.name} 대기권 돌파 탈출 // 성간 우주 궤도 진입`, undefined, undefined, '#00e5ff');
          }

          if (this.nearPlanetAlertId !== p.name && !this.insidePlanetInFlight) {
            this.nearPlanetAlertId = p.name;
            AudioSys.playDiscoveryFanfare();
            this.spawnFloatText(`🛬 [행성 접근] ${p.name} 궤도 도달`, undefined, undefined, '#10b981');
            this.spawnFloatText(`대기권으로 하강하여 저공 비행하거나 [착륙]할 수 있습니다`, undefined, this.height / 2 - 25, '#00e5ff');
          }
          break;
        }
      }

      if (!nearestPlanetInRange) {
        if (this.insidePlanetInFlight) {
          this.insidePlanetInFlight = null;
        }
        this.nearPlanetAlertId = null;
      }

      if (!interactAction && this.entities.station) {
        const d = Math.hypot(this.player.x - this.entities.station.x, this.player.y - this.entities.station.y);
        if (d < 350) {
          interactTarget = "우주정거장 도킹";
          interactAction = () => {
            this.spawnFloatText("우주정거장 진입: 쉴드 및 보급 완전 충전", undefined, undefined, '#00e5ff');
            AudioSys.playDiscoveryFanfare();
          };
        }
      }

      this.handleInteraction(interactTarget, interactAction);

      // Update space projectiles
      for (let i = this.entities.spaceProjectiles.length - 1; i >= 0; i--) {
        const p = this.entities.spaceProjectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) this.entities.spaceProjectiles.splice(i, 1);
      }
    }

    // PLANET STATE
    if (this.currState === 'PLANET' && this.data.activePlanet) {
      const p = this.data.activePlanet;

      if (this.isAutoPilot) {
        this.updateDemoShowcase();
      } else {
        // Walking movement
        const walkSpeed = this.keyboard.shift ? 4.2 : 2.8;
        if (inputLen > 0.08) {
          this.player.px += moveX * walkSpeed;
          this.player.py += moveY * walkSpeed;
          this.player.anim += 0.2;
          if (moveX !== 0) this.player.facing = moveX > 0 ? 1 : -1;
        } else {
          this.player.anim = 0;
        }

        // Jetpack Jump / Boost
        const jetpackPressed = this.touchControls.isJetpacking || this.keyboard.space;
        if (jetpackPressed && this.data.lifeSupport > 5) {
          this.player.isJetpacking = true;
          if (inputLen > 0.08) {
            this.player.px += moveX * 4.2;
            this.player.py += moveY * 4.2;
          } else {
            this.player.py -= 3.8;
          }
          const staminaSetting = this.data.difficultySettings?.sprintStamina || 'STANDARD';
          const staminaDrain = staminaSetting === 'INFINITE' ? 0 : (staminaSetting === 'LIMITED' ? 0.08 : 0.04);
          this.data.lifeSupport = Math.max(0, this.data.lifeSupport - staminaDrain);
          AudioSys.playJetpack();
        } else {
          this.player.isJetpacking = false;
        }

        // Planet Mining / Shooting
        if (this.touchControls.isFiring || this.mouse.isDown) {
          this.handlePlanetFire(p);
        } else {
          this.player.isMining = false;
        }
      }

      // Boundary constraint: In human mode, CANNOT leave the planet!
      // Walking / jetpacking is strictly confined within planet surface.
      // Must board the parked starship to leave.
      const pDist = Math.hypot(this.player.px, this.player.py);
      const maxSurfaceRadius = p.r - 25;
      if (pDist > maxSurfaceRadius) {
        const factor = maxSurfaceRadius / (pDist || 1);
        this.player.px *= factor;
        this.player.py *= factor;

        if (this.boundaryCooldown <= 0) {
          AudioSys.playWarning();
          this.spawnFloatText("⚠️ 행성 대기권 경계 도달 // 도보로 행성을 벗어날 수 없습니다!", undefined, undefined, '#ff3366');
          this.spawnFloatText("🚀 우주선에 탑승하여 행성을 탈출하세요", undefined, this.height / 2 - 25, '#00e5ff');
          this.boundaryCooldown = 90;
        }
      }
      if (this.boundaryCooldown > 0) {
        this.boundaryCooldown--;
      }

      // Hazard & Life support drain (Waypoint 4.0 Difficulty scaling)
      const hazardSetting = this.data.difficultySettings?.hazardDrain || 'STANDARD';
      let hazardMultiplier = 1.0;
      if (hazardSetting === 'CREATIVE') hazardMultiplier = 0;
      else if (hazardSetting === 'RELAXED') hazardMultiplier = 0.4;
      else if (hazardSetting === 'HARSH') hazardMultiplier = 1.8;

      if (p.hazardType !== 'TEMPERATE' && hazardMultiplier > 0) {
        this.data.hazard = Math.max(0, this.data.hazard - 0.02 * hazardMultiplier);
      }

      const lifeSetting = this.data.difficultySettings?.lifeSupportDrain || 'STANDARD';
      let lifeMultiplier = 1.0;
      if (lifeSetting === 'CREATIVE') lifeMultiplier = 0;
      else if (lifeSetting === 'RELAXED') lifeMultiplier = 0.5;
      else if (lifeSetting === 'HARSH') lifeMultiplier = 1.8;

      if (lifeMultiplier > 0) {
        this.data.lifeSupport = Math.max(0, this.data.lifeSupport - 0.008 * lifeMultiplier);
      }

      // Update Procedural Fauna (외계 동물 배회 및 애니메이션)
      if (p.fauna) {
        for (const cr of p.fauna) {
          cr.timer = (cr.timer || 0) + 1;
          if (cr.timer > 100) {
            cr.timer = 0;
            const wanderAng = Math.random() * Math.PI * 2;
            const wanderSpeed = 0.8 + Math.random() * 0.9;
            cr.vx = Math.cos(wanderAng) * wanderSpeed;
            cr.vy = Math.sin(wanderAng) * wanderSpeed;
            cr.facing = cr.vx >= 0 ? 1 : -1;
          }
          cr.lx += cr.vx;
          cr.ly += cr.vy;
          cr.walkCycle = (cr.walkCycle || 0) + 0.12;

          // Keep creature inside planet boundaries
          const cDist = Math.hypot(cr.lx, cr.ly);
          if (cDist > p.r - 50) {
            cr.vx *= -1;
            cr.vy *= -1;
            cr.lx += cr.vx * 2;
            cr.ly += cr.vy * 2;
          }
        }
      }

      // Update Flying Sentinels (센티넬 순찰 및 플레이어 채광 감지)
      if (p.planetSentinels) {
        for (const st of p.planetSentinels) {
          st.scanTimer = (st.scanTimer || 0) + 1;
          const distToPlayer = Math.hypot(st.lx - this.player.px, st.ly - this.player.py);

          if (this.player.isMining && distToPlayer < 240) {
            // Investigate illegal mining
            st.state = 'INVESTIGATE';
            this.data.sentinelAlert = Math.min(5, Math.max(1, this.data.sentinelAlert || 1));
            const angToPlayer = Math.atan2(this.player.py - st.ly, this.player.px - st.lx);
            st.vx = Math.cos(angToPlayer) * 1.5;
            st.vy = Math.sin(angToPlayer) * 1.5;
          } else {
            if (st.scanTimer > 120) {
              st.scanTimer = 0;
              const pAng = Math.random() * Math.PI * 2;
              st.vx = Math.cos(pAng) * 0.9;
              st.vy = Math.sin(pAng) * 0.9;
              st.state = 'PATROL';
            }
          }
          st.lx += st.vx;
          st.ly += st.vy;
        }
      }

      // Planet Interactivity (Ship to launch, deposits, monoliths)
      let interactTarget: string | null = null;
      let interactAction: (() => void) | null = null;

      const distShip = Math.hypot(this.player.px - this.parkedShip.x, this.player.py - this.parkedShip.y);
      if (distShip < 120) {
        interactTarget = "🚀 우주선 탑승 및 우주(비행기) 모드로 발사";
        interactAction = () => this.launchToOrbit();
      }

      this.handleInteraction(interactTarget, interactAction);
    }
  }

  private handleInteraction(label: string | null, action: (() => void) | null) {
    this.data.interactLabel = label;
    this.data.activeInteractAction = action;

    const isPressing = this.touchControls.isInteracting || this.keyboard.e === 1;
    if (label && action && isPressing) {
      this.data.interactProgress = Math.min(1.0, this.data.interactProgress + 0.045);
      if (this.data.interactProgress >= 1.0) {
        this.data.interactProgress = 0;
        action();
      }
    } else {
      this.data.interactProgress = Math.max(0, this.data.interactProgress - 0.08);
    }
  }

  private fireSpaceWeapons() {
    this.shipFireCooldown = this.data.shipType === 'SOLAR' ? 10 : 8;
    const fwdX = Math.cos(this.player.angle);
    const fwdY = Math.sin(this.player.angle);

    if (this.data.shipType === 'SOLAR') {
      AudioSys.playPhotonCannon();
      this.entities.spaceProjectiles.push({
        x: this.player.x + fwdX * 28,
        y: this.player.y + fwdY * 28,
        vx: fwdX * 24,
        vy: fwdY * 24,
        life: 55,
        color: '#facc15'
      });
    } else {
      AudioSys.playPhotonCannon();
      [-12, 12].forEach(offset => {
        this.entities.spaceProjectiles.push({
          x: this.player.x + fwdX * 24 - fwdY * offset,
          y: this.player.y + fwdY * 24 + fwdX * offset,
          vx: fwdX * 26,
          vy: fwdY * 26,
          life: 55,
          color: '#00e5ff'
        });
      });
    }
  }

  private handlePlanetFire(planet: PlanetEntity) {
    if (this.data.isOverheated) return;

    this.player.isMining = true;
    this.data.overheat = Math.min(100, this.data.overheat + 0.55);
    if (this.data.overheat >= 100) {
      this.data.isOverheated = true;
      AudioSys.playOverheat();
      this.spawnFloatText("⚠️ 도구 과열! (COOLING...)", undefined, undefined, '#ff3366');
      return;
    }

    const mode = this.data.toolMode;
    const px = this.player.px;
    const py = this.player.py;

    // 1. MINING BEAM: Prioritizes Resource Deposits (Na, O2, H, Fe, C)
    if (mode === 'MINING BEAM') {
      let targetDeposit: DepositEntity | null = null;
      let minDist = 260;
      for (const d of planet.deposits) {
        if (d.hp > 0) {
          const dist = Math.hypot(d.lx - px, d.ly - py);
          if (dist < minDist) {
            minDist = dist;
            targetDeposit = d;
          }
        }
      }

      AudioSys.playMineBeam();
      if (targetDeposit) {
        targetDeposit.hp -= 2.8;
        this.data.weaponCharge = Math.max(0, this.data.weaponCharge - 0.08);
        if (targetDeposit.hp <= 0) {
          const yieldQty = Math.floor(20 + Math.random() * 16);
          this.data.inv[targetDeposit.type] = (this.data.inv[targetDeposit.type] || 0) + yieldQty;
          this.data.units += 480;
          AudioSys.playRecharge();
          this.spawnFloatText(`+${yieldQty} ${targetDeposit.type.toUpperCase()} 채굴 완료 (+480 ₩)`, undefined, undefined, '#00e5ff');
          this.notify();
        }
      }
    } 
    // 2. BOLTCASTER: Dedicated Combat Blaster targeting hostile Sentinels (and rogue threats)
    else if (mode === 'BOLTCASTER') {
      if (this.data.ammo <= 0) {
        this.reloadBoltcaster();
        return;
      }

      // Find nearest Sentinel Drone or hostile
      let targetSentinel: PlanetSentinelEntity | null = null;
      let minSentDist = 320;
      if (planet.planetSentinels) {
        for (const st of planet.planetSentinels) {
          if (st.hp > 0) {
            const dist = Math.hypot(st.lx - px, st.ly - py);
            if (dist < minSentDist) {
              minSentDist = dist;
              targetSentinel = st;
            }
          }
        }
      }

      if (Math.random() < 0.28) {
        this.data.ammo--;
        AudioSys.playBoltcaster();

        if (targetSentinel) {
          targetSentinel.hp -= 18;
          targetSentinel.state = 'ATTACK';
          this.spawnFloatText(`💥 센티넬 타격! (-18 HP)`, targetSentinel.lx, targetSentinel.ly - 20, '#ef4444');
          if (targetSentinel.hp <= 0) {
            this.data.inv.pugneum = (this.data.inv.pugneum || 0) + 15;
            this.data.nanites += 35;
            AudioSys.playDiscoveryFanfare();
            this.spawnFloatText(`🤖 센티넬 드론 격추! (+15 퍼그늄, +35 나노봇)`, targetSentinel.lx, targetSentinel.ly - 30, '#ef4444');
            // Remove destroyed sentinel
            planet.planetSentinels = planet.planetSentinels?.filter(s => s.id !== targetSentinel!.id);
          }
          this.notify();
        } else {
          // If no sentinel nearby, damage closest deposit as fallback
          let fallbackDep: DepositEntity | null = null;
          let fDist = 200;
          for (const d of planet.deposits) {
            if (d.hp > 0) {
              const dDist = Math.hypot(d.lx - px, d.ly - py);
              if (dDist < fDist) {
                fDist = dDist;
                fallbackDep = d;
              }
            }
          }
          if (fallbackDep) fallbackDep.hp -= 8;
        }
      }
    } 
    // 3. TERRAIN MANIPULATOR: Specializes in Subterranean Caves, Mountains, Volcanoes & Ferrite Veins
    else if (mode === 'TERRAIN MANIPULATOR') {
      AudioSys.playMineBeam();
      // Target nearest cave or mountain to excavate Silicate Powder and rare minerals
      let targetCave: CaveEntity | null = null;
      let minCaveDist = 260;
      if (planet.caves) {
        for (const cv of planet.caves) {
          const dist = Math.hypot(cv.lx - px, cv.ly - py);
          if (dist < minCaveDist) {
            minCaveDist = dist;
            targetCave = cv;
          }
        }
      }

      if (targetCave) {
        if (Math.random() < 0.22) {
          const silicateYield = 25;
          this.data.inv.silicate = (this.data.inv.silicate || 0) + silicateYield;
          this.data.inv.ferrite = (this.data.inv.ferrite || 0) + 12;
          this.data.units += 250;
          this.spawnFloatText(`⛏️ 동굴 지형 굴착: 규산염 +${silicateYield}, 페라이트 +12`, targetCave.lx, targetCave.ly - 20, '#38bdf8');
          this.notify();
        }
      } else {
        // Excavate nearest mineral rock
        let nearestRock: DepositEntity | null = null;
        let rDist = 240;
        for (const d of planet.deposits) {
          if (d.hp > 0 && (d.type === 'ferrite' || d.type === 'dihydrogen')) {
            const dist = Math.hypot(d.lx - px, d.ly - py);
            if (dist < rDist) {
              rDist = dist;
              nearestRock = d;
            }
          }
        }
        if (nearestRock) {
          nearestRock.hp -= 3.5;
          this.data.inv.silicate = (this.data.inv.silicate || 0) + 4;
        }
      }
    } 
    // 4. VOLTAIC STAFF: Specializes in Alien Fauna (Biochemical Scanning & Animal Taming)
    else if (mode === 'VOLTAIC STAFF') {
      AudioSys.playVoltaicStaff();

      let targetFauna: FaunaEntity | null = null;
      let minFaunaDist = 280;
      if (planet.fauna) {
        for (const cr of planet.fauna) {
          const dist = Math.hypot(cr.lx - px, cr.ly - py);
          if (dist < minFaunaDist) {
            minFaunaDist = dist;
            targetFauna = cr;
          }
        }
      }

      if (targetFauna) {
        if (Math.random() < 0.25) {
          if (!targetFauna.isScanned) {
            targetFauna.isScanned = true;
            this.data.nanites += 60;
            this.data.units += 1200;
            AudioSys.playDiscoveryFanfare();
            this.spawnFloatText(`🧬 생물 분석 완료: ${targetFauna.speciesRef.commonName} (+60 ⬡, +1,200 ₩)`, targetFauna.lx, targetFauna.ly - 25, '#4ade80');
          } else {
            // Taming resonance interaction
            targetFauna.isTamed = true;
            this.data.inv.carbon = (this.data.inv.carbon || 0) + 10;
            this.spawnFloatText(`🐾 ${targetFauna.speciesRef.commonName} 친밀도 증가 // 가축 교감`, targetFauna.lx, targetFauna.ly - 20, '#a7f3d0');
          }
          this.notify();
        }
      } else {
        // Fallback closest deposit
        let closestDep: DepositEntity | null = null;
        let cDist = 200;
        for (const d of planet.deposits) {
          if (d.hp > 0) {
            const dist = Math.hypot(d.lx - px, d.ly - py);
            if (dist < cDist) {
              cDist = dist;
              closestDep = d;
            }
          }
        }
        if (closestDep) closestDep.hp -= 4;
      }
    }
  }

  public render(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    // Mobile aspect ratio fix: strictly match buffer resolution to actual client layout rect
    const rect = canvas.getBoundingClientRect();
    const curW = Math.round(rect.width || canvas.clientWidth || window.innerWidth);
    const curH = Math.round(rect.height || canvas.clientHeight || window.innerHeight);

    if (canvas.width !== curW || canvas.height !== curH) {
      canvas.width = curW;
      canvas.height = curH;
    }
    this.width = curW;
    this.height = curH;
    const ctx = this.ctx;

    ctx.fillStyle = '#02040a';
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);

    const baseZoom = this.currState === 'PLANET' ? (this.data.isVisorActive ? 2.4 : 1.7) : 1.0;
    const finalZoom = baseZoom * this.cameraZoom;
    ctx.scale(finalZoom, finalZoom);

    const camX = this.currState === 'SPACE' ? this.player.x : this.player.px;
    const camY = this.currState === 'SPACE' ? this.player.y : this.player.py;

    // Starfield
    for (const s of this.entities.stars) {
      let sx = (s.x - camX * (0.2 / s.z)) % this.width;
      let sy = (s.y - camY * (0.2 / s.z)) % this.height;
      if (sx < -this.width / 2) sx += this.width;
      if (sx > this.width / 2) sx -= this.width;
      if (sy < -this.height / 2) sy += this.height;
      if (sy > this.height / 2) sy -= this.height;

      ctx.fillStyle = `rgba(220, 240, 255, ${0.45 / s.z})`;
      ctx.beginPath();
      ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // SPACE RENDER
    if (this.currState === 'SPACE') {
      ctx.save();
      ctx.translate(-this.player.x, -this.player.y);

      // Planets
      for (const p of this.entities.planets) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = p.color;
        ctx.lineWidth = 14;
        ctx.globalAlpha = 0.35;
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        // Draw deposits and terrain details if ship is within or near the planet
        const distToShip = Math.hypot(this.player.x - p.x, this.player.y - p.y);
        if (distToShip < p.r + 500) {
          for (const d of p.deposits) {
            if (d.hp > 0) {
              ctx.save();
              ctx.translate(d.lx, d.ly);
              let depCol = '#10b981';
              if (d.type === 'sodium') depCol = '#facc15';
              if (d.type === 'oxygen') depCol = '#ef4444';
              if (d.type === 'dihydrogen') depCol = '#38bdf8';
              if (d.type === 'ferrite') depCol = '#94a3b8';

              ctx.fillStyle = depCol;
              ctx.beginPath();
              ctx.arc(0, 0, d.size * 0.7, 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1;
              ctx.stroke();
              ctx.restore();
            }
          }

          // If inside atmosphere in airplane mode, draw low-altitude atmospheric perimeter
          if (distToShip <= p.r) {
            ctx.save();
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 8]);
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(0, 0, p.r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
        }

        ctx.font = 'bold 16px Orbitron, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, 0, -p.r - 28);
        ctx.restore();
      }

      // Space Station
      if (this.entities.station) {
        const st = this.entities.station;
        ctx.save();
        ctx.translate(st.x, st.y);
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, st.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#0a1628';
        ctx.fill();
        ctx.font = 'bold 14px Orbitron, sans-serif';
        ctx.fillStyle = '#00e5ff';
        ctx.textAlign = 'center';
        ctx.fillText("SPACE STATION [0, 0]", 0, -st.r - 18);
        ctx.restore();
      }

      // Space Projectiles
      for (const proj of this.entities.spaceProjectiles) {
        ctx.save();
        ctx.translate(proj.x, proj.y);
        ctx.fillStyle = proj.color || '#00e5ff';
        ctx.fillRect(-6, -2, 12, 4);
        ctx.restore();
      }

      // Player Starship
      ctx.save();
      ctx.translate(this.player.x, this.player.y);
      ctx.rotate(this.player.angle);

      if (this.data.shipType === 'SOLAR') {
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(34, 0);
        ctx.lineTo(-12, 9);
        ctx.lineTo(-24, 5);
        ctx.lineTo(-28, 0);
        ctx.lineTo(-24, -5);
        ctx.lineTo(-12, -9);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Vesper Sails (Glowing Solar Sails)
        ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
        ctx.strokeStyle = '#fde047';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-6, -20);
        ctx.lineTo(8, -44);
        ctx.lineTo(-14, -48);
        ctx.lineTo(-26, -34);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-6, 20);
        ctx.lineTo(8, 44);
        ctx.lineTo(-14, 48);
        ctx.lineTo(-26, 34);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (this.data.shipType === 'INTERCEPTOR') {
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(28, 0);
        ctx.lineTo(-20, 18);
        ctx.lineTo(-14, 0);
        ctx.lineTo(-20, -18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (this.data.shipType === 'LIVING') {
        ctx.fillStyle = '#3b0764';
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, 26, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(26, 0);
        ctx.lineTo(-16, 14);
        ctx.lineTo(-10, 0);
        ctx.lineTo(-16, -14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore(); // Starship
      ctx.restore(); // Space world translation

      // Draw Navigation Markers in screen space!
      this.drawNavMarkers(ctx);
    }

    // PLANET RENDER
    if (this.currState === 'PLANET' && this.data.activePlanet) {
      const p = this.data.activePlanet;
      ctx.translate(-this.player.px, -this.player.py);

      // Planet Surface Terrain
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.r, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric glow ring
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 8;
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      // Atmospheric containment boundary barrier (exosuit walking limit)
      ctx.save();
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 3;
      ctx.setLineDash([14, 10]);
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(0, 0, p.r - 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Warning text along the atmosphere boundary
      ctx.font = 'bold 12px Orbitron, sans-serif';
      ctx.fillStyle = '#00e5ff';
      ctx.textAlign = 'center';
      ctx.fillText("⚠️ ATMOSPHERE CONTAINMENT BARRIER // EXOSUIT LIMIT ⚠️", 0, -(p.r - 35));
      ctx.restore();

      // 1. Procedural Oceans & Lakes / Lava Lakes
      if (p.waterBodies) {
        for (const wb of p.waterBodies) {
          ctx.save();
          ctx.translate(wb.cx, wb.cy);
          ctx.fillStyle = wb.color;
          ctx.beginPath();
          ctx.arc(0, 0, wb.r, 0, Math.PI * 2);
          ctx.fill();

          // Water shoreline / rim glow
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.globalAlpha = 0.4;
          ctx.stroke();

          // Animated waves / lava bubbles
          const wavePhase = Date.now() * 0.002 + wb.waveOffset;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(0, 0, wb.r * (0.65 + Math.sin(wavePhase) * 0.15), 0, Math.PI * 2);
          ctx.stroke();

          ctx.font = 'bold 10px Orbitron, sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(p.hazardType === 'HEAT' ? "🌋 용암 호수" : "🌊 외계 대양", 0, 4);
          ctx.restore();
        }
      }

      // 2. Procedural Mountains & Active Volcanoes
      if (p.mountains) {
        for (const mnt of p.mountains) {
          ctx.save();
          ctx.translate(mnt.lx, mnt.ly);

          // Mountain Base Shadow & Body
          ctx.fillStyle = mnt.color;
          ctx.beginPath();
          ctx.arc(0, 0, mnt.r, 0, Math.PI * 2);
          ctx.fill();

          // Mountain Ridge Contour Rings
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, mnt.r * 0.65, 0, Math.PI * 2);
          ctx.stroke();

          if (mnt.isVolcano) {
            // Volcano Crater with glowing bubbling lava
            ctx.fillStyle = '#ef4444';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#f97316';
            ctx.beginPath();
            ctx.arc(0, 0, mnt.r * 0.35, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Lava pulse
            const lavaPulse = (Math.sin(Date.now() * 0.004 + (mnt.lavaTimer || 0)) + 1) * 0.5;
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.arc(0, 0, mnt.r * 0.18 * (0.8 + lavaPulse * 0.4), 0, Math.PI * 2);
            ctx.fill();

            ctx.font = 'bold 9px Orbitron, sans-serif';
            ctx.fillStyle = '#f97316';
            ctx.textAlign = 'center';
            ctx.fillText("🌋 활화산 분화구", 0, -mnt.r - 8);
          } else {
            // Snowcapped Mountain Peak
            ctx.fillStyle = '#e2e8f0';
            ctx.beginPath();
            ctx.arc(0, 0, mnt.r * 0.28, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = 'bold 9px Orbitron, sans-serif';
            ctx.fillStyle = '#94a3b8';
            ctx.textAlign = 'center';
            ctx.fillText("🏔️ 험준한 산맥", 0, -mnt.r - 6);
          }
          ctx.restore();
        }
      }

      // 3. Subterranean Caves with Luminous Crystals
      if (p.caves) {
        for (const cv of p.caves) {
          ctx.save();
          ctx.translate(cv.lx, cv.ly);
          // Dark Cave Mouth
          ctx.fillStyle = '#05070d';
          ctx.beginPath();
          ctx.arc(0, 0, cv.r, 0, Math.PI * 2);
          ctx.fill();

          // Rocky rim
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Glowing subterranean crystals
          const crysPulse = (Math.sin(Date.now() * 0.005) + 1) * 0.5;
          ctx.fillStyle = '#38bdf8';
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#00e5ff';
          ctx.beginPath();
          ctx.arc(-cv.r * 0.25, -cv.r * 0.2, 5 + crysPulse * 3, 0, Math.PI * 2);
          ctx.arc(cv.r * 0.28, cv.r * 0.15, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.font = 'bold 9px Orbitron, sans-serif';
          ctx.fillStyle = '#38bdf8';
          ctx.textAlign = 'center';
          ctx.fillText(`🕳️ ${cv.name}`, 0, -cv.r - 6);
          ctx.restore();
        }
      }

      // 4. Procedural Flora (Alien Trees, Spores, Glowing Corals)
      if (p.flora) {
        for (const fl of p.flora) {
          ctx.save();
          ctx.translate(fl.lx, fl.ly);
          const sway = Math.sin(Date.now() * 0.003 + fl.swayOffset) * 2.5;

          if (fl.type === 'MUSHROOM') {
            // Alien Giant Mushroom
            ctx.fillStyle = '#475569';
            ctx.fillRect(-2, 0, 4, fl.size * 0.9);
            ctx.fillStyle = fl.color;
            ctx.beginPath();
            ctx.arc(sway, -fl.size * 0.4, fl.size * 0.75, Math.PI, 0);
            ctx.fill();
            // Glowing spores
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(sway - 3, -fl.size * 0.5, 2, 0, Math.PI * 2);
            ctx.arc(sway + 3, -fl.size * 0.6, 2.5, 0, Math.PI * 2);
            ctx.fill();
          } else if (fl.type === 'SPIRE') {
            // Radiant Crystal Spire
            ctx.fillStyle = fl.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = fl.color;
            ctx.beginPath();
            ctx.moveTo(0, -fl.size * 1.3);
            ctx.lineTo(fl.size * 0.35, fl.size * 0.3);
            ctx.lineTo(-fl.size * 0.35, fl.size * 0.3);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
          } else {
            // Alien Tree / Coral
            ctx.fillStyle = '#334155';
            ctx.fillRect(-2.5, 0, 5, fl.size);
            ctx.fillStyle = fl.color;
            ctx.beginPath();
            ctx.arc(sway, -fl.size * 0.3, fl.size * 0.65, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // 5. Procedural Alien Fauna (Animated Creatures)
      if (p.fauna) {
        for (const cr of p.fauna) {
          ctx.save();
          ctx.translate(cr.lx, cr.ly);
          const facing = cr.facing || 1;
          const legSwing = Math.sin(cr.walkCycle || 0) * 4;

          // Creature Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.ellipse(0, 10, 14, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Legs
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-8 - legSwing * 0.5, 3, 3.5, 8 + legSwing);
          ctx.fillRect(5 + legSwing * 0.5, 3, 3.5, 8 - legSwing);

          // Body
          ctx.fillStyle = cr.speciesRef.color || '#10b981';
          ctx.beginPath();
          ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Head & Eye
          ctx.fillStyle = cr.speciesRef.color || '#10b981';
          ctx.beginPath();
          ctx.arc(facing * 12, -4, 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(facing * 14, -5, 2, 0, Math.PI * 2);
          ctx.fill();

          // Creature Name Tag
          ctx.font = 'bold 8px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(`🐾 ${cr.speciesRef.commonName}`, 0, -14);

          ctx.restore();
        }
      }

      // 6. Flying Sentinel Patrol Drones
      if (p.planetSentinels) {
        for (const st of p.planetSentinels) {
          ctx.save();
          ctx.translate(st.lx, st.ly);
          const hoverY = Math.sin(Date.now() * 0.006 + Number(st.id.slice(-1))) * 3;

          // Sentinel Drone Body (Orange/Black Armored Hull)
          ctx.fillStyle = '#0f172a';
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(-8, -8 + hoverY, 16, 16, 4);
          ctx.fill();
          ctx.stroke();

          // Red Ominous Cyclops Eye
          ctx.fillStyle = st.state === 'INVESTIGATE' ? '#ef4444' : '#38bdf8';
          ctx.shadowBlur = 10;
          ctx.shadowColor = st.state === 'INVESTIGATE' ? '#ef4444' : '#00e5ff';
          ctx.beginPath();
          ctx.arc(0, hoverY, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Scanner Laser Cone
          if (st.state === 'INVESTIGATE') {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
            ctx.beginPath();
            ctx.moveTo(0, hoverY);
            ctx.lineTo(-24, hoverY + 35);
            ctx.lineTo(24, hoverY + 35);
            ctx.closePath();
            ctx.fill();
          }

          ctx.font = 'bold 8px Orbitron, sans-serif';
          ctx.fillStyle = st.state === 'INVESTIGATE' ? '#ef4444' : '#f97316';
          ctx.textAlign = 'center';
          ctx.fillText("🤖 센티넬 감시 드론", 0, hoverY - 12);

          ctx.restore();
        }
      }

      // Resource Deposits
      for (const d of p.deposits) {
        if (d.hp > 0) {
          ctx.save();
          ctx.translate(d.lx, d.ly);
          let depCol = '#10b981';
          if (d.type === 'sodium') depCol = '#facc15';
          if (d.type === 'oxygen') depCol = '#ef4444';
          if (d.type === 'dihydrogen') depCol = '#38bdf8';
          if (d.type === 'ferrite') depCol = '#94a3b8';

          ctx.fillStyle = depCol;
          ctx.beginPath();
          ctx.arc(0, 0, d.size * 0.7, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.restore();
        }
      }

      // Parked Ship beside player on planet surface
      ctx.save();
      ctx.translate(this.parkedShip.x, this.parkedShip.y);
      ctx.rotate(this.parkedShip.angle);

      // Starship Hull
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(28, 0);
      ctx.lineTo(-18, 14);
      ctx.lineTo(-12, 0);
      ctx.lineTo(-18, -14);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cockpit Canopy
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.ellipse(4, 0, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Landing Gear Struts
      ctx.fillStyle = '#64748b';
      ctx.fillRect(-14, 12, 5, 5);
      ctx.fillRect(-14, -17, 5, 5);
      ctx.fillRect(8, -2.5, 5, 5);

      // Starship indicator text
      ctx.font = 'bold 9px Orbitron, sans-serif';
      ctx.fillStyle = '#00e5ff';
      ctx.textAlign = 'center';
      ctx.fillText("내 우주선 [탑승 E]", 0, -22);
      ctx.restore();

      // Multitool Laser / Blaster / Staff Firing Visual Effects
      if (this.player.isMining) {
        ctx.save();
        const mode = this.data.toolMode;
        let beamColor = '#00e5ff';
        let beamWidth = 3.5;
        let targetX = this.player.px + this.player.facing * 120;
        let targetY = this.player.py;

        if (mode === 'MINING BEAM') {
          beamColor = '#00e5ff';
          beamWidth = 3.5;
          let closestDep: DepositEntity | null = null;
          let closestDist = 260;
          for (const dep of p.deposits) {
            if (dep.hp > 0) {
              const d = Math.hypot(dep.lx - this.player.px, dep.ly - this.player.py);
              if (d < closestDist) {
                closestDist = d;
                closestDep = dep;
              }
            }
          }
          if (closestDep) {
            targetX = closestDep.lx;
            targetY = closestDep.ly;
          }
        } else if (mode === 'BOLTCASTER') {
          beamColor = '#f59e0b';
          beamWidth = 2.5;
          let targetSentinel: PlanetSentinelEntity | null = null;
          let minSentDist = 320;
          if (p.planetSentinels) {
            for (const st of p.planetSentinels) {
              if (st.hp > 0) {
                const dist = Math.hypot(st.lx - this.player.px, st.ly - this.player.py);
                if (dist < minSentDist) {
                  minSentDist = dist;
                  targetSentinel = st;
                }
              }
            }
          }
          if (targetSentinel) {
            targetX = targetSentinel.lx;
            targetY = targetSentinel.ly;
          }
        } else if (mode === 'TERRAIN MANIPULATOR') {
          beamColor = '#38bdf8';
          beamWidth = 5.0;
          let targetCave: CaveEntity | null = null;
          let minCaveDist = 260;
          if (p.caves) {
            for (const cv of p.caves) {
              const dist = Math.hypot(cv.lx - this.player.px, cv.ly - this.player.py);
              if (dist < minCaveDist) {
                minCaveDist = dist;
                targetCave = cv;
              }
            }
          }
          if (targetCave) {
            targetX = targetCave.lx;
            targetY = targetCave.ly;
          }
        } else if (mode === 'VOLTAIC STAFF') {
          beamColor = '#a855f7';
          beamWidth = 4.0;
          let targetFauna: FaunaEntity | null = null;
          let minFaunaDist = 280;
          if (p.fauna) {
            for (const cr of p.fauna) {
              const dist = Math.hypot(cr.lx - this.player.px, cr.ly - this.player.py);
              if (dist < minFaunaDist) {
                minFaunaDist = dist;
                targetFauna = cr;
              }
            }
          }
          if (targetFauna) {
            targetX = targetFauna.lx;
            targetY = targetFauna.ly;
          }
        }

        ctx.strokeStyle = beamColor;
        ctx.lineWidth = beamWidth;
        ctx.shadowBlur = 14;
        ctx.shadowColor = beamColor;

        ctx.beginPath();
        ctx.moveTo(this.player.px, this.player.py - 5);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Target impact spark ring
        ctx.fillStyle = beamColor;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 4 + Math.random() * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // Player Exosuit Human Character (Detailed & Mobile Optimized)
      ctx.save();
      ctx.translate(this.player.px, this.player.py);

      const facing = this.player.facing || 1;
      const legWalk = Math.sin(this.player.anim) * 5.5;

      // Jetpack Thruster Flames if active
      if (this.player.isJetpacking) {
        ctx.fillStyle = '#00e5ff';
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#00e5ff';
        ctx.beginPath();
        ctx.moveTo(-facing * 7, 7);
        ctx.lineTo(-facing * 11, 20 + Math.random() * 6);
        ctx.lineTo(-facing * 3, 7);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Legs / Boots
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;

      // Left leg
      ctx.fillRect(-5 - legWalk * 0.4, 8, 4, 9 + legWalk);
      ctx.strokeRect(-5 - legWalk * 0.4, 8, 4, 9 + legWalk);

      // Right leg
      ctx.fillRect(1 + legWalk * 0.4, 8, 4, 9 - legWalk);
      ctx.strokeRect(1 + legWalk * 0.4, 8, 4, 9 - legWalk);

      // Exosuit Jetpack Backpack
      ctx.fillStyle = '#334155';
      ctx.fillRect(-facing * 9, -7, 6, 14);
      ctx.strokeStyle = '#00e5ff';
      ctx.strokeRect(-facing * 9, -7, 6, 14);

      // Torso / Suit (Classic NMS Orange Exosuit)
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.roundRect(-6, -7, 12, 16, 3);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Chest Console
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(facing > 0 ? 0 : -3, -3, 3, 3);

      // Helmet
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -13, 8.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Curved Visor with Cyan Reflection
      ctx.fillStyle = '#00e5ff';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00e5ff';
      ctx.beginPath();
      ctx.arc(facing * 3, -13, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Multitool in hand
      ctx.fillStyle = '#64748b';
      ctx.fillRect(facing * 5, -1, facing * 7, 4);
      ctx.fillStyle = this.player.isMining ? '#00e5ff' : '#facc15';
      ctx.fillRect(facing * 10, -2, facing * 3, 6);

      ctx.restore(); // Exosuit

      // Weapon-Specific On-Screen Target Tracking Reticle & Arrow when on foot
      const mode = this.data.toolMode;
      let activeTrackTarget: { x: number; y: number; label: string; sub: string; color: string; icon: string } | null = null;
      let minTrackDist = Infinity;

      if (mode === 'MINING BEAM') {
        // Track nearest high-value resource deposit
        for (const dep of p.deposits) {
          if (dep.hp > 0) {
            const d = Math.hypot(dep.lx - this.player.px, dep.ly - this.player.py);
            if (d < minTrackDist) {
              minTrackDist = d;
              let c = '#10b981';
              if (dep.type === 'sodium') c = '#facc15';
              if (dep.type === 'oxygen') c = '#ef4444';
              if (dep.type === 'dihydrogen') c = '#38bdf8';
              if (dep.type === 'ferrite') c = '#e2e8f0';
              activeTrackTarget = {
                x: dep.lx,
                y: dep.ly,
                label: `${dep.type.toUpperCase()} 광맥`,
                sub: '채굴 광선 유효 사거리',
                color: c,
                icon: '💎'
              };
            }
          }
        }
      } else if (mode === 'BOLTCASTER') {
        // Track nearest Sentinel Drone / Hostile
        if (p.planetSentinels) {
          for (const st of p.planetSentinels) {
            if (st.hp > 0) {
              const d = Math.hypot(st.lx - this.player.px, st.ly - this.player.py);
              if (d < minTrackDist) {
                minTrackDist = d;
                activeTrackTarget = {
                  x: st.lx,
                  y: st.ly,
                  label: `센티넬 감시 드론 (${st.state})`,
                  sub: '볼트캐스터 조준 락온',
                  color: '#ef4444',
                  icon: '🤖'
                };
              }
            }
          }
        }
      } else if (mode === 'TERRAIN MANIPULATOR') {
        // Track nearest Cave / Underground cavern
        if (p.caves) {
          for (const cv of p.caves) {
            const d = Math.hypot(cv.lx - this.player.px, cv.ly - this.player.py);
            if (d < minTrackDist) {
              minTrackDist = d;
              activeTrackTarget = {
                x: cv.lx,
                y: cv.ly,
                label: cv.name,
                sub: '지형 조작기 굴착 추천 지점',
                color: '#38bdf8',
                icon: '🕳️'
              };
            }
          }
        }
      } else if (mode === 'VOLTAIC STAFF') {
        // Track nearest Alien Fauna (Fauna creature)
        if (p.fauna) {
          for (const cr of p.fauna) {
            const d = Math.hypot(cr.lx - this.player.px, cr.ly - this.player.py);
            if (d < minTrackDist) {
              minTrackDist = d;
              activeTrackTarget = {
                x: cr.lx,
                y: cr.ly,
                label: cr.speciesRef.commonName,
                sub: cr.isScanned ? '교감 / 가축 길들이기 가능' : '볼타익 스태프 생물 스캔 추천',
                color: '#a855f7',
                icon: '🐾'
              };
            }
          }
        }
      }

      // Draw active target reticle & HUD vector
      if (activeTrackTarget && minTrackDist > 40) {
        ctx.save();
        ctx.translate(activeTrackTarget.x, activeTrackTarget.y);
        ctx.strokeStyle = activeTrackTarget.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = activeTrackTarget.color;

        // Animated target brackets
        const pulse = 18 + Math.sin(Date.now() * 0.008) * 3;
        const b = 6;
        ctx.beginPath();
        ctx.moveTo(-pulse, -pulse + b); ctx.lineTo(-pulse, -pulse); ctx.lineTo(-pulse + b, -pulse);
        ctx.moveTo(pulse - b, -pulse); ctx.lineTo(pulse, -pulse); ctx.lineTo(pulse, -pulse + b);
        ctx.moveTo(-pulse, pulse - b); ctx.lineTo(-pulse, pulse); ctx.lineTo(-pulse + b, pulse);
        ctx.moveTo(pulse - b, pulse); ctx.lineTo(pulse, pulse); ctx.lineTo(pulse, pulse - b);
        ctx.stroke();

        ctx.font = 'bold 9px Orbitron, sans-serif';
        ctx.fillStyle = activeTrackTarget.color;
        ctx.textAlign = 'center';
        ctx.fillText(`[${mode}] 🎯 ${activeTrackTarget.icon} ${activeTrackTarget.label} (${Math.round(minTrackDist)}u)`, 0, -pulse - 8);

        ctx.restore();

        // Direction arrow from player towards target
        const tAngle = Math.atan2(activeTrackTarget.y - this.player.py, activeTrackTarget.x - this.player.px);
        ctx.save();
        ctx.translate(this.player.px, this.player.py);
        ctx.rotate(tAngle);
        ctx.fillStyle = activeTrackTarget.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = activeTrackTarget.color;
        ctx.beginPath();
        ctx.moveTo(28, 0);
        ctx.lineTo(20, -4);
        ctx.lineTo(22, 0);
        ctx.lineTo(20, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // Direction indicator arrow towards Parked Ship when player is exploring on foot
      const shipDist = Math.hypot(this.parkedShip.x - this.player.px, this.parkedShip.y - this.player.py);
      if (shipDist > 140) {
        const shipAngle = Math.atan2(this.parkedShip.y - this.player.py, this.parkedShip.x - this.player.px);
        ctx.save();
        ctx.translate(this.player.px, this.player.py);
        ctx.rotate(shipAngle);
        ctx.fillStyle = '#00e5ff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00e5ff';
        ctx.beginPath();
        ctx.moveTo(38, 0);
        ctx.lineTo(26, -6);
        ctx.lineTo(29, 0);
        ctx.lineTo(26, 6);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.rotate(-shipAngle);
        ctx.font = 'bold 9px Orbitron, sans-serif';
        ctx.fillStyle = '#00e5ff';
        ctx.textAlign = 'center';
        ctx.fillText(`🚀 내 우주선 [${Math.round(shipDist)}u]`, Math.cos(shipAngle) * 52, Math.sin(shipAngle) * 52 + (shipAngle > 0 ? 12 : -6));
        ctx.restore();
      }
    }

    ctx.restore();
  }

  public drawNavMarkers(ctx: CanvasRenderingContext2D) {
    if (this.currState !== 'SPACE') return;

    const margin = 56;
    const halfW = this.width / 2 - margin;
    const halfH = this.height / 2 - margin;

    interface NavTarget {
      name: string;
      sub: string;
      x: number;
      y: number;
      r: number;
      color: string;
      isPlanet: boolean;
      icon: string;
    }

    const targets: NavTarget[] = this.entities.planets.map(p => ({
      name: p.name,
      sub: p.type,
      x: p.x,
      y: p.y,
      r: p.r,
      color: p.color || '#00e5ff',
      isPlanet: true,
      icon: '🪐'
    }));

    if (this.entities.station) {
      targets.push({
        name: '우주 정거장 (STATION)',
        sub: '정거장 도킹',
        x: this.entities.station.x,
        y: this.entities.station.y,
        r: this.entities.station.r,
        color: '#00e5ff',
        isPlanet: false,
        icon: '🛰️'
      });
    }

    if (this.entities.anomaly) {
      targets.push({
        name: '스페이스 아노말리',
        sub: '성소 진입',
        x: this.entities.anomaly.x,
        y: this.entities.anomaly.y,
        r: this.entities.anomaly.r,
        color: '#c084fc',
        isPlanet: false,
        icon: '🔮'
      });
    }

    if (this.entities.freighter) {
      targets.push({
        name: '주력 화물선',
        sub: '함교 도킹',
        x: this.entities.freighter.x,
        y: this.entities.freighter.y,
        r: 140,
        color: '#10b981',
        isPlanet: false,
        icon: '🚢'
      });
    }

    // 1. Compass Ring around player's ship pointing towards the nearest planet
    const nearestRes = this.getNearestPlanet();
    if (nearestRes) {
      const { planet, distance } = nearestRes;
      const angle = Math.atan2(planet.y - this.player.y, planet.x - this.player.x);

      ctx.save();
      // Orbiting guidance ring around player ship at (0, 0)
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 52, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Nearest Planet Direction Arrow
      ctx.rotate(angle);
      ctx.fillStyle = planet.color || '#00e5ff';
      ctx.shadowBlur = 12;
      ctx.shadowColor = planet.color || '#00e5ff';
      ctx.beginPath();
      ctx.moveTo(58, 0);
      ctx.lineTo(44, -7);
      ctx.lineTo(47, 0);
      ctx.lineTo(44, 7);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // 2. Draw Screen-Edge Navigation Arrows & Distance Badges
    for (const t of targets) {
      const dx = t.x - this.player.x;
      const dy = t.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      const isOffScreen = Math.abs(dx) > halfW || Math.abs(dy) > halfH;

      if (isOffScreen) {
        // Clamp to screen perimeter
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const scaleX = Math.abs(halfW / (cos || 0.0001));
        const scaleY = Math.abs(halfH / (sin || 0.0001));
        const edgeDist = Math.min(scaleX, scaleY);
        const edgeX = cos * edgeDist;
        const edgeY = sin * edgeDist;

        ctx.save();
        ctx.translate(edgeX, edgeY);

        // Direction Arrow pointing outward
        ctx.rotate(angle);
        ctx.fillStyle = t.color;
        ctx.shadowBlur = 14;
        ctx.shadowColor = t.color;

        const pulse = Math.sin(Date.now() * 0.006) * 3;
        ctx.beginPath();
        ctx.moveTo(15 + pulse, 0);
        ctx.lineTo(-7 + pulse, -9);
        ctx.lineTo(-3 + pulse, 0);
        ctx.lineTo(-7 + pulse, 9);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Upright Label Badge
        ctx.rotate(-angle);
        const distText = `${Math.round(dist).toLocaleString()}u`;
        const titleText = `${t.icon} ${t.name}`;

        ctx.font = 'bold 10px Rajdhani, sans-serif';
        const tw = Math.max(ctx.measureText(titleText).width, ctx.measureText(distText).width) + 16;
        const bw = Math.max(82, tw);

        ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
        ctx.strokeStyle = t.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(-bw / 2, -35, bw, 30, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = t.color;
        ctx.font = 'bold 9px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(titleText, 0, -21);

        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 10px Rajdhani, sans-serif';
        ctx.fillText(`${distText} [${t.sub}]`, 0, -8);

        ctx.restore();
      } else {
        // On-screen Targeting Reticle around target
        ctx.save();
        ctx.translate(dx, dy);
        ctx.strokeStyle = t.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = t.color;

        const reticleR = t.r + 25;
        const bLen = 22;
        ctx.beginPath();
        // 4 corner reticle brackets
        ctx.moveTo(-reticleR, -reticleR + bLen); ctx.lineTo(-reticleR, -reticleR); ctx.lineTo(-reticleR + bLen, -reticleR);
        ctx.moveTo(reticleR - bLen, -reticleR); ctx.lineTo(reticleR, -reticleR); ctx.lineTo(reticleR, -reticleR + bLen);
        ctx.moveTo(-reticleR, reticleR - bLen); ctx.lineTo(-reticleR, reticleR); ctx.lineTo(-reticleR + bLen, reticleR);
        ctx.moveTo(reticleR - bLen, reticleR); ctx.lineTo(reticleR, reticleR); ctx.lineTo(reticleR, reticleR - bLen);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Label above target
        const canLand = t.isPlanet && dist < (t.r + 380);
        const pLabel = `${t.icon} ${t.name} [${Math.round(dist).toLocaleString()}u]`;
        const pSub = canLand ? '✨ 대기권 착륙 가능 // [E] 버튼 길게 누름' : '접근 중 // 펄스 부스트 가속';

        ctx.font = 'bold 11px Orbitron, sans-serif';
        const labelW = Math.max(ctx.measureText(pLabel).width, ctx.measureText(pSub).width) + 22;

        ctx.fillStyle = canLand ? 'rgba(6, 78, 59, 0.94)' : 'rgba(3, 10, 24, 0.9)';
        ctx.strokeStyle = canLand ? '#10b981' : t.color;
        ctx.lineWidth = canLand ? 2 : 1;
        ctx.beginPath();
        ctx.roundRect(-labelW / 2, -reticleR - 44, labelW, 36, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(pLabel, 0, -reticleR - 26);
        ctx.fillStyle = canLand ? '#34d399' : '#94a3b8';
        ctx.font = canLand ? 'bold 11px Rajdhani, sans-serif' : '10px Rajdhani, sans-serif';
        ctx.fillText(pSub, 0, -reticleR - 12);

        ctx.restore();
      }
    }
  }
}

export const game = new GameEngine();
