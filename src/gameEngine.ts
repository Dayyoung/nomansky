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
  GameInventory
} from './types';

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

  public disengageAutoPilot() {
    if (!this.isAutoPilot) return;
    this.isAutoPilot = false;
    this.data.isPulseActive = false;
    AudioSys.playNote(440, 'sine', 0.15);
    this.spawnFloatText("🤖 조작 감지 // 오토파일럿 모드 종료 (수동 조종 복귀)", undefined, undefined, '#f59e0b');
    this.notify();
  }

  public engageAutoPilot() {
    if (this.isAutoPilot) return;
    this.isAutoPilot = true;
    this.autoPilotPlanetStartTime = Date.now();
    this.autoPilotResourceTimer = 0;
    this.autoPilotWanderAngle = Math.random() * Math.PI * 2;

    if (this.currState === 'PLANET' && this.data.activePlanet) {
      this.autoPilotTargetPlanet = this.data.activePlanet;
      AudioSys.playDiscoveryFanfare();
      this.spawnFloatText(`🤖 10초 미조작 // [${this.data.activePlanet.name}] 지표면 사람 모드 광석 채굴 시작!`, undefined, undefined, '#00e5ff');
    } else {
      this.selectRandomAutoPilotPlanet();
      AudioSys.playDiscoveryFanfare();
      this.spawnFloatText("🤖 10초 미조작 감지 // 오토파일럿 탐사 가동!", undefined, undefined, '#00e5ff');
      if (this.autoPilotTargetPlanet) {
        this.spawnFloatText(`🪐 목표: [${this.autoPilotTargetPlanet.name}] 도착 후 착륙하여 사람 모드 광석 채굴`, undefined, this.height / 2 - 25, '#10b981');
      }
    }
    this.notify();
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

  public triggerScanPulse() {
    AudioSys.playScanPulse();
    this.spawnFloatText("📡 스캐너 펄스 발동 // 지형 자원 탐지", undefined, undefined, '#00e5ff');
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
        // AUTOPILOT AUTONOMOUS NAVIGATION
        // Check if target is set
        if (!this.autoPilotTargetPlanet) {
          this.selectRandomAutoPilotPlanet();
          this.autoPilotPlanetStartTime = now;
        }

        const target = this.autoPilotTargetPlanet;
        if (target) {
          const dx = target.x - this.player.x;
          const dy = target.y - this.player.y;
          const dist = Math.hypot(dx, dy);

          if (dist > target.r * 0.75) {
            // Cruise / Pulse toward planet
            const directAngle = Math.atan2(dy, dx);
            let angleDiff = directAngle - this.player.angle;
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            this.player.angle += angleDiff * 0.09;

            const pulse = dist > target.r + 300;
            this.data.isPulseActive = pulse;
            const spd = pulse ? 28.0 : 8.5;
            this.player.vx = Math.cos(this.player.angle) * spd;
            this.player.vy = Math.sin(this.player.angle) * spd;
          } else {
            // Reached planet! Land and switch to human mode to mine ores!
            this.data.isPulseActive = false;
            this.landCurrentShip(target);
            this.autoPilotPlanetStartTime = now;
            this.autoPilotResourceTimer = 0;
            AudioSys.playDiscoveryFanfare();
            this.spawnFloatText(`🛬 [오토파일럿] ${target.name} 착륙 완료!`, undefined, undefined, '#10b981');
            this.spawnFloatText(`👤 사람(보행) 모드로 전환 // 지표면 광석 채굴 시작`, undefined, this.height / 2 - 25, '#00e5ff');
            return;
          }
        }
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
        // AUTOPILOT IN HUMAN MODE ON PLANET:
        // 1. Check if 3 minutes (180,000ms) on this planet have elapsed
        if (now - this.autoPilotPlanetStartTime >= 180000) {
          const shipDist = Math.hypot(this.parkedShip.x - this.player.px, this.parkedShip.y - this.player.py);
          if (shipDist > 55) {
            // Walk toward parked starship
            const angleToShip = Math.atan2(this.parkedShip.y - this.player.py, this.parkedShip.x - this.player.px);
            this.player.px += Math.cos(angleToShip) * 3.6;
            this.player.py += Math.sin(angleToShip) * 3.6;
            this.player.anim += 0.2;
            this.player.facing = Math.cos(angleToShip) > 0 ? 1 : -1;
            this.player.isMining = false;
          } else {
            // Board ship, launch into space, pick next random planet!
            const prevPlanetName = p.name;
            this.launchToOrbit();
            this.selectRandomAutoPilotPlanet(prevPlanetName);
            this.autoPilotPlanetStartTime = now;
            AudioSys.playDiscoveryFanfare();
            this.spawnFloatText(`⏱️ [오토파일럿] 3분 탐사 완료! 우주선 탑승 // 다음 행성 [${this.autoPilotTargetPlanet?.name}]으로 이동`, undefined, undefined, '#c084fc');
            return;
          }
        } else {
          // Within 3 minutes: AUTONOMOUS WALKING AND MINING ORE DEPOSITS!
          let nearestDep: DepositEntity | null = null;
          let minDist = Infinity;
          for (const d of p.deposits) {
            if (d.hp > 0) {
              const dDist = Math.hypot(d.lx - this.player.px, d.ly - this.player.py);
              if (dDist < minDist) {
                minDist = dDist;
                nearestDep = d;
              }
            }
          }

          if (nearestDep) {
            const dx = nearestDep.lx - this.player.px;
            const dy = nearestDep.ly - this.player.py;
            const dist = Math.hypot(dx, dy);

            if (dist > 85) {
              // Walk towards deposit
              const walkAngle = Math.atan2(dy, dx);
              this.player.px += Math.cos(walkAngle) * 3.2;
              this.player.py += Math.sin(walkAngle) * 3.2;
              this.player.anim += 0.2;
              this.player.facing = dx > 0 ? 1 : -1;
              this.player.isMining = false;
            } else {
              // Within mining range: face deposit and fire mining beam!
              this.player.facing = dx > 0 ? 1 : -1;
              this.player.anim = 0;
              this.player.isMining = true;

              this.autoPilotResourceTimer++;
              if (this.autoPilotResourceTimer % 6 === 0) {
                nearestDep.hp -= 3.0;
                AudioSys.playMineBeam();

                // Periodic environmental & weapon recharge
                this.data.lifeSupport = Math.min(100, this.data.lifeSupport + 0.5);
                this.data.hazard = Math.min(100, this.data.hazard + 0.5);

                if (nearestDep.hp <= 0) {
                  const resType = nearestDep.type as keyof typeof this.data.inv;
                  const yieldQty = Math.floor(18 + Math.random() * 18);
                  const creds = Math.floor(200 + Math.random() * 250);
                  const nanites = Math.floor(5 + Math.random() * 10);
                  if (this.data.inv[resType] !== undefined) {
                    this.data.inv[resType] += yieldQty;
                  }
                  this.data.units += creds;
                  this.data.nanites += nanites;
                  this.autoPilotTotalResourcesGained += yieldQty;

                  const names: Record<string, string> = {
                    ferrite: '페라이트 광석',
                    carbon: '탄소 농축물',
                    sodium: '나트륨 결정',
                    oxygen: '산소 캡슐',
                    dihydrogen: '이수소 결정'
                  };
                  this.spawnFloatText(`⛏️ 광석 채굴 완료: +${yieldQty} ${names[resType] || resType} (+${creds}₩, +${nanites}⬡)`, undefined, undefined, '#00e5ff');
                  AudioSys.playDiscoveryFanfare();
                  this.notify();
                }
              }
            }
          } else {
            // All deposits mined or none left: wander or respawn
            this.player.isMining = false;
            this.player.px += Math.cos(this.autoPilotWanderAngle) * 2.2;
            this.player.py += Math.sin(this.autoPilotWanderAngle) * 2.2;
            this.autoPilotWanderAngle += 0.025;
            this.player.anim += 0.15;
            if (p.deposits.every(d => d.hp <= 0)) {
              p.deposits.forEach(d => { d.hp = 10; });
            }
          }
        }
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
          this.data.lifeSupport = Math.max(0, this.data.lifeSupport - 0.04);
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

      // Hazard & Life support drain
      if (p.hazardType !== 'TEMPERATE') {
        this.data.hazard = Math.max(0, this.data.hazard - 0.02);
      }
      this.data.lifeSupport = Math.max(0, this.data.lifeSupport - 0.008);

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

    this.width = canvas.width = window.innerWidth;
    this.height = canvas.height = window.innerHeight;
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
