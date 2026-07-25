import { CatUnitData, PlayerUnitProgress, PassiveSkill } from '../types';
import { PASSIVE_SKILLS } from '../data/units';

/**
 * ユニットのレベルアップに必要なXPコストを計算（全画面で統一）
 */
export function getUnitLevelUpCost(level: number): number {
  return Math.floor(200 * Math.pow(1.25, level - 1));
}

export interface CalculatedUnitStats {
  displayEvolution: {
    stage: number;
    name: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    secondaryColor: string;
    hpMultiplier: number;
    attackMultiplier: number;
    speedMultiplier: number;
    specialTrait?: string;
  };
  hp: number;
  attack: number;
  movementSpeed: number;
  deployCost: number;
  critRate: number;
  equippedPassives: PassiveSkill[];
  // パッシブによるボーナス割合（UI表示用）
  passiveBonusAtkPercent: number;
  passiveBonusHpPercent: number;
  passiveBonusSpeedPercent: number;
  passiveBonusCostPercent: number;
}

/**
 * ユニットのレベル・形態・遺伝子パッシブ適用後の最終ステータスを共通計算
 */
export function calculateUnitStats(
  unit: CatUnitData,
  progress: PlayerUnitProgress
): CalculatedUnitStats {
  const stage = progress.currentStage || 1;
  let displayEvolution = unit.evolutions.stage1;

  if (stage === 2) {
    displayEvolution = unit.evolutions.stage2;
  } else if (stage === 3 && unit.evolutions.stage3Branches) {
    const branch = progress.selectedBranch || 'branchA';
    displayEvolution = unit.evolutions.stage3Branches[branch];
  }

  const levelMult = Math.pow(1.05, (progress.level || 1) - 1);
  let atkMult = displayEvolution.attackMultiplier * levelMult;
  let hpMult = displayEvolution.hpMultiplier * levelMult;
  let speedMult = displayEvolution.speedMultiplier;
  let costMult = 1.0;
  let critRate = 0;

  let passiveBonusAtkPercent = 0;
  let passiveBonusHpPercent = 0;
  let passiveBonusSpeedPercent = 0;
  let passiveBonusCostPercent = 0;

  const equippedPassives: PassiveSkill[] = [];

  (progress.equippedSkills || []).forEach((skId) => {
    const sk = PASSIVE_SKILLS.find((s) => s.id === skId);
    if (sk) {
      equippedPassives.push(sk);
      if (sk.bonusType === 'attack') {
        atkMult *= (1 + sk.value);
        passiveBonusAtkPercent += Math.round(sk.value * 100);
      }
      if (sk.bonusType === 'hp') {
        hpMult *= (1 + sk.value);
        passiveBonusHpPercent += Math.round(sk.value * 100);
      }
      if (sk.bonusType === 'speed') {
        speedMult *= (1 + sk.value);
        passiveBonusSpeedPercent += Math.round(sk.value * 100);
      }
      if (sk.bonusType === 'cost') {
        costMult *= (1 - sk.value);
        passiveBonusCostPercent += Math.round(sk.value * 100);
      }
      if (sk.bonusType === 'crit') {
        critRate += sk.value;
      }
    }
  });

  const finalHp = Math.floor(unit.baseHp * hpMult);
  const finalAttack = Math.floor(unit.baseAttack * atkMult);
  const finalSpeed = Math.round(unit.movementSpeed * speedMult);
  const finalCost = Math.max(10, Math.floor(unit.deployCost * costMult));

  return {
    displayEvolution,
    hp: finalHp,
    attack: finalAttack,
    movementSpeed: finalSpeed,
    deployCost: finalCost,
    critRate,
    equippedPassives,
    passiveBonusAtkPercent,
    passiveBonusHpPercent,
    passiveBonusSpeedPercent,
    passiveBonusCostPercent,
  };
}
