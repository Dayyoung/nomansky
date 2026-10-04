export type GameStateEnum = 'SPACE' | 'PLANET' | 'WARP';

export type ShipType = 'MECHANICAL' | 'LIVING' | 'INTERCEPTOR' | 'SOLAR' | 'CUSTOM' | 'UTOPIA_SPEEDER' | 'BOUNDARY_HERALD';
export type ShipClass = 'C' | 'B' | 'A' | 'S';
export type ToolMode = 'MINING BEAM' | 'TERRAIN MANIPULATOR' | 'BOLTCASTER' | 'VOLTAIC STAFF';

export interface StarEntity {
  x: number;
  y: number;
  z: number;
  size: number;
}

export interface DepositEntity {
  id: string;
  lx: number;
  ly: number;
  type: 'carbon' | 'sodium' | 'oxygen' | 'dihydrogen' | 'ferrite';
  hp: number;
  size: number;
  isFlora: boolean;
  latinName: string;
  commonName: string;
  isScanned: boolean;
}

export interface FaunaSpecies {
  id: string;
  latinName: string;
  commonName: string;
  classType: string;
  diet: string;
  temperament: string;
  height: string;
  weight: number;
  color: string;
  isDiscovered: boolean;
}

export interface FaunaEntity {
  id: string;
  speciesRef: FaunaSpecies;
  lx: number;
  ly: number;
  vx: number;
  vy: number;
  targetLx: number;
  targetLy: number;
  facing: number;
  walkCycle: number;
  state: 'IDLE' | 'WANDER' | 'FLEE' | 'TAMED' | 'MOUNTED' | 'FOLLOW';
  timer: number;
  hp: number;
  maxHp: number;
  isScanned: boolean;
  isTamed?: boolean;
  trust?: number;
}

export interface WaterBody {
  id: string;
  cx: number;
  cy: number;
  r: number;
  color: string;
  waveOffset: number;
  trapPots: unknown[];
}

export interface MonolithRiddle {
  race: 'KORVAX' | 'VYKEEN' | 'GEK';
  title: string;
  narrative: string;
  dialogue: string;
  choices: {
    text: string;
    correct: boolean;
    rewardMsg: string;
    reward: () => void;
  }[];
  answered?: boolean;
}

export interface KnowledgeStone {
  id: string;
  lx: number;
  ly: number;
  race: 'KORVAX' | 'VYKEEN' | 'GEK';
  word: string;
  isCollected: boolean;
}

export interface StormCrystal {
  id: string;
  lx: number;
  ly: number;
  isHarvested: boolean;
}

export interface FloatingIsland {
  id: string;
  cx: number;
  cy: number;
  width: number;
  height: number;
  waterfallY: number;
  floraColor: string;
}

export interface JuicyGrub {
  id: string;
  x: number;
  y: number;
  hp: number;
  isCrushed: boolean;
  animTimer: number;
}

export interface MountainEntity {
  id: string;
  lx: number;
  ly: number;
  r: number;
  height: number;
  color: string;
  isVolcano?: boolean;
  lavaTimer?: number;
}

export interface CaveEntity {
  id: string;
  lx: number;
  ly: number;
  r: number;
  name: string;
  crystalType: string;
}

export interface FloraEntity {
  id: string;
  lx: number;
  ly: number;
  type: 'TREE' | 'MUSHROOM' | 'CORAL' | 'SPIRE' | 'FLOWER';
  size: number;
  color: string;
  swayOffset: number;
}

export interface PlanetSentinelEntity {
  id: string;
  lx: number;
  ly: number;
  vx: number;
  vy: number;
  state: 'PATROL' | 'INVESTIGATE' | 'ATTACK';
  scanTimer: number;
  hp: number;
  maxHp: number;
}

export interface PlanetEntity {
  name: string;
  x: number;
  y: number;
  r: number;
  color: string;
  type: string;
  hazardType: string;
  craters: unknown[];
  deposits: DepositEntity[];
  faunaSpecies: FaunaSpecies[];
  fauna: FaunaEntity[];
  waterBodies: WaterBody[];
  mountains?: MountainEntity[];
  caves?: CaveEntity[];
  flora?: FloraEntity[];
  planetSentinels?: PlanetSentinelEntity[];
  monolith?: {
    lx: number;
    ly: number;
    race: 'KORVAX' | 'VYKEEN' | 'GEK';
    title: string;
    narrative: string;
    dialogue: string;
    choices: MonolithRiddle['choices'];
    answered: boolean;
  };
  knowledgeStones?: KnowledgeStone[];
  stormCrystals?: StormCrystal[];
  floatingIslands?: FloatingIsland[];
  juicyGrubs?: JuicyGrub[];
  settlementX?: number;
  settlementY?: number;
  settlementCitizens?: Array<{ name: string; race: string; offX: number; offY: number; dir: number }>;
  portalX?: number;
  portalY?: number;
}

export interface GalacticStar {
  id: string;
  name: string;
  gx: number;
  gy: number;
  gz: number;
  class: string;
  color: string;
  race: string;
  raceName: string;
  economy: string;
  economyLevel: string;
  conflict: string;
  planetsCount: number;
  moonsCount: number;
  desc: string;
  isOutlaw?: boolean;
  isDissonant?: boolean;
  isBlackHole?: boolean;
  isAtlas?: boolean;
  isCore?: boolean;
}

export interface BaseStructure {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fuel?: number;
  recipe?: string;
  outputCount?: number;
  progress?: number;
  isRefining?: boolean;
}

export interface SpaceCargoEntity {
  x: number;
  y: number;
  rot: number;
  life: number;
}

export interface PirateEntity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  shield: number;
  maxShield: number;
  hull: number;
  maxHull: number;
  fireTimer: number;
}

export interface ProjectileEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  fromPlayer?: boolean;
  damage?: number;
  color?: string;
}

export interface ParticleEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size?: number;
}

export interface FrigateMember {
  id: string;
  name: string;
  type: 'COMBAT' | 'INDUSTRIAL' | 'EXPLORATION' | 'TRADE' | 'SUPPORT';
  rank: 'C' | 'B' | 'A' | 'S';
  combat: number;
  industry: number;
  discovery: number;
  trade: number;
  fuelCost: number;
  expeditions: number;
  xp: number;
}

export interface FleetExpedition {
  id: string;
  name: string;
  type: string;
  shipClass: string;
  icon: string;
  color: string;
  duration: number;
  timer: number;
  status: 'READY' | 'ACTIVE' | 'COMPLETED';
  desc: string;
  rewardDesc: string;
  reward: () => void;
  logs?: string[];
  primaryFrigateId?: string;
}

export interface GameInventory {
  oxygen: number;
  sodium: number;
  carbon: number;
  ferrite: number;
  silicate: number;
  pugneum: number;
  dihydrogen: number;
  tritium: number;
  chromaticMetal: number;
  warpCell: number;
  pureFerrite: number;
  condensedCarbon: number;
  diHydrogenJelly: number;
  portableRefiner: number;
  baseComputer: number;
  ancientArtifact: number;
  dreadnoughtAIFragment: number;
  microprocessor: number;
  metalPlating: number;
  stormCrystal: number;
  walkerBrain: number;
  voidEgg: number;
  creaturePellets: number;
  creatureEgg: number;
  broadcastReceiver: number;
  taintedMetal: number;
  repairKit: number;
  emergencyReceiver: number;
  cargoBulkhead: number;
  geknip: number;
  firstSpawnRelic: number;
  counterfeitCircuits: number;
  blackMarketArms?: number;
  blackMarketArmaments?: number;
  radiantShard: number;
  atlantideum: number;
  echoLocator: number;
  grubJuice?: number;
  vileHeart?: number;
  radon?: number;
  nitrogen?: number;
  sulphurine?: number;
  activatedCopper?: number;
  antimatter?: number;
  antimatterHousing?: number;
  basalt?: number;
  magmaCore?: number;
  thermicCondensate?: number;
  hypnoticEyes?: number;
  hadalPearls?: number;
  salvagedGlass?: number;
  voidDust?: number;
  [key: string]: number | undefined;
}

export interface NautilonSubmarineData {
  unlocked: boolean;
  boarded: boolean;
  oxygenLevel: number;
  fuel: number;
  livingPearls: number;
  hadalCores: number;
  hypnoticEyes: number;
  engineOverclock: boolean;
  torpedoLauncher: boolean;
  tethysMining: boolean;
  activeTab: 'specs' | 'sonar' | 'tech' | 'harvest';
}

export interface CombatWeaponItem {
  name: string;
  unlocked: boolean;
  supercharged: boolean;
  damage: number;
  rate: number;
  baseDps: number;
  dps: number;
  magSize: number;
  curMag: number;
  color: string;
}

export interface CombatWeaponsData {
  activeTab: number;
  activeWeapon: string;
  weapons: Record<string, CombatWeaponItem>;
  glassRefined: boolean;
  munitionsSupplied: boolean;
  overclockActive: boolean;
  grantClaimed: boolean;
}

export interface SecondaryWeaponsData {
  active: 'plasmaLauncher' | 'geologyCannon' | 'personalForcefield' | 'cloakingDevice' | 'paralysisMortar';
  ammo: Record<string, number>;
}

export type DemoShowcasePhase =
  | 'SPACE_PULSE'
  | 'STARSHIP_CYCLE'
  | 'GALAXY_MAP'
  | 'PLANET_APPROACH'
  | 'EXOSUIT_EXPLORE'
  | 'ANALYSIS_VISOR'
  | 'TOOL_MODES'
  | 'COMBAT_WEAPONS'
  | 'SECONDARY_ORDNANCE'
  | 'WEAPON_ARSENAL_MODAL'
  | 'INVENTORY_MODAL'
  | 'NAUTILON_SUBMARINE'
  | 'COMPANION_MOUNT'
  | 'LAUNCH_ORBIT';

export interface DemoShowcaseState {
  isActive: boolean;
  phase: DemoShowcasePhase;
  phaseIndex: number;
  totalPhases: number;
  title: string;
  description: string;
  subText: string;
  activeModal: string | null;
  modalTab?: string;
  phaseDuration: number;
  phaseElapsed: number;
}

