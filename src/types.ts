export type EvolutionStage = 1 | 2 | 3;

export interface PassiveSkill {
  id: string;
  name: string;
  description: string;
  icon: string;
  bonusType: 'attack' | 'hp' | 'speed' | 'cost' | 'range' | 'crit';
  value: number; // e.g. 0.15 for +15%
}

export interface UnitEvolution {
  stage: EvolutionStage;
  name: string;
  title: string;
  description: string;
  icon: string; // Emoji or SVG drawing type
  color: string;
  secondaryColor: string;
  hpMultiplier: number;
  attackMultiplier: number;
  speedMultiplier: number;
  specialTrait?: string;
  requiredLevel: number;
  evolutionCostXp: number;
  evolutionStonesNeeded?: number;
}

export interface UnitBranchChoice {
  branchId: 'alpha' | 'beta';
  branchName: string;
  evolution: UnitEvolution;
}

export interface CatUnitData {
  id: string;
  baseName: string;
  rarity: 'Normal' | 'Rare' | 'SuperRare' | 'Legend';
  deployCost: number;
  cooldownSeconds: number;
  attackRange: number;
  movementSpeed: number;
  attackSpeedSeconds: number;
  baseHp: number;
  baseAttack: number;
  isAreaAttack: boolean;
  knockbackCount: number;
  evolutions: {
    stage1: UnitEvolution;
    stage2: UnitEvolution;
    stage3Branches?: {
      branchA: UnitEvolution;
      branchB: UnitEvolution;
    };
  };
}

export interface PlayerUnitProgress {
  unitId: string;
  level: number;
  currentStage: EvolutionStage;
  selectedBranch?: 'branchA' | 'branchB';
  unlockedBranches?: ('branchA' | 'branchB')[];
  equippedSkills: string[]; // PassiveSkill IDs
}

export interface EnemyData {
  id: string;
  name: string;
  description: string;
  hp: number;
  attack: number;
  attackRange: number;
  movementSpeed: number;
  attackSpeedSeconds: number;
  isAreaAttack: boolean;
  rewardXp: number;
  rewardCatFood: number;
  color: string;
  secondaryColor: string;
  shape: 'dog' | 'pig' | 'gorilla' | 'robot' | 'dragon' | 'ufo' | 'ghost';
  sizeScale: number;
  isBoss?: boolean;
}

export interface StageEnemySpawn {
  enemyId: string;
  spawnTimeSeconds: number;
  repeatIntervalSeconds?: number;
  maxSpawns?: number;
  isBossTrigger?: boolean;
  castleHpPercentTrigger?: number; // Trigger spawn when castle HP falls below this %
  waveName?: string; // e.g. '第一陣', '第二陣', '最終防衛線'
}

export interface StageData {
  id: string;
  chapterId: number;
  chapterName: string;
  stageNumber: number;
  name: string;
  description: string;
  energyCost: number;
  enemyCastleHp: number;
  playerCastleHp: number;
  castleColor: string;
  enemySpawns: StageEnemySpawn[];
  firstClearRewardCatFood: number;
  firstClearRewardXp: number;
  bgGradient: [string, string];
  groundColor: string;
  isSecretStage?: boolean;
}

export interface ActiveBattleUnit {
  instanceId: string;
  unitId: string;
  side: 'player' | 'enemy';
  x: number; // Position on 0 to 1000 scale
  y: number;
  hp: number;
  maxHp: number;
  attack: number;
  attackRange: number;
  movementSpeed: number;
  attackCooldown: number;
  attackSpeedSeconds: number;
  isAreaAttack: boolean;
  knockbackCount: number;
  currentKnockbacks: number;
  isKnockedBack: boolean;
  knockbackTimer: number;
  sizeScale: number;
  color: string;
  secondaryColor: string;
  shape: string;
  name: string;
  level: number;
  rarity?: 'Normal' | 'Rare' | 'SuperRare' | 'Legend';
  isBoss?: boolean;
  isAttacking?: boolean;
  // Animation properties
  walkFrame: number;
  attackAnimTimer: number;
  hitEffectTimer: number;
  traitBadge?: string;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
  scale: number;
  vy: number;
}

export interface ParticleEffect {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface SerialCode {
  code: string;
  rewardCatFood: number;
  rewardXp?: number;
  description: string;
  isActive: boolean;
  createdAt?: number;
}

export interface PlayerData {
  catFood: number;
  xp: number;
  energy: number;
  maxEnergy: number;
  lastEnergyRefillTimestamp: number;
  clearedStages: string[]; // stage IDs
  unlockedUnits: Record<string, PlayerUnitProgress>;
  equippedDeck: string[]; // up to 8 unit IDs
  cannonLevel: number;
  workerCatLimitLevel: number;
  evolutionStones: number;
  customUnits?: CatUnitData[];
  usedSerialCodes?: string[]; // Used serial code strings
  items?: Record<string, number>; // Item inventory e.g. { catBon: 3, sniper: 2, cpu: 5, treasureRadar: 1 }
  lastDailyCatFoodTimestamp?: number;
}

export type GameView = 'HOME' | 'STAGE_SELECT' | 'DECK_BUILDER' | 'POWER_UP' | 'BATTLE' | 'GACHA' | 'CODEX' | 'LAB' | 'ITEM_SHOP' | 'CAT_FOOD_SHOP' | 'AI_CAT';
