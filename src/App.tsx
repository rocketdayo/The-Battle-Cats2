import React, { useState, useEffect, useRef } from 'react';
import {
  ActiveBattleUnit,
  CatUnitData,
  FloatingText,
  ParticleEffect,
  PlayerData,
  StageData,
  GameView,
} from './types';
import { CAT_UNITS, PASSIVE_SKILLS } from './data/units';
import { ENEMIES } from './data/enemies';
import { HomeBase } from './components/HomeBase';
import { DeckBuilder } from './components/DeckBuilder';
import { PowerUp } from './components/PowerUp';
import { BattleCanvas } from './components/BattleCanvas';
import { BattleUI } from './components/BattleUI';
import { StageSelect } from './components/StageSelect';
import { EvolutionModal } from './components/EvolutionModal';
import { GachaModal } from './components/GachaModal';
import { CodexModal } from './components/CodexModal';
import { LabModal } from './components/LabModal';
import { AiCatGeneratorModal } from './components/AiCatGeneratorModal';
import { DevToolsModal } from './components/DevToolsModal';
import { STAGES } from './data/stages';
import { soundManager } from './utils/audio';
import { calculateUnitStats } from './utils/unitCalculator';

const INITIAL_PLAYER_DATA: PlayerData = {
  catFood: 300,
  xp: 1500,
  energy: 100,
  maxEnergy: 100,
  lastEnergyRefillTimestamp: Date.now(),
  clearedStages: [],
  unlockedUnits: {
    u_chibi: { unitId: 'u_chibi', level: 1, currentStage: 1, equippedSkills: [] },
    u_shield: { unitId: 'u_shield', level: 1, currentStage: 1, equippedSkills: [] },
    u_ninja: { unitId: 'u_ninja', level: 1, currentStage: 1, equippedSkills: [] },
  },
  equippedDeck: ['u_chibi', 'u_shield', 'u_ninja'],
  cannonLevel: 1,
  workerCatLimitLevel: 1,
  evolutionStones: 5,
};

export default function App() {
  // --- Persistent Storage ---
  const [playerData, setPlayerData] = useState<PlayerData>(() => {
    const saved = localStorage.getItem('nyanko_war_2_save');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse save data', e);
      }
    }
    return INITIAL_PLAYER_DATA;
  });

  useEffect(() => {
    localStorage.setItem('nyanko_war_2_save', JSON.stringify(playerData));
  }, [playerData]);

  // Sound Mute Toggle
  const [isMuted, setIsMuted] = useState(false);
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundManager.setMuted(next);
  };

  // --- Views & Modals ---
  const [currentView, setCurrentView] = useState<GameView>('HOME');
  const [gachaInitialTab, setGachaInitialTab] = useState<'nyanko' | 'rare'>('nyanko');
  const [selectedUnitForEvol, setSelectedUnitForEvol] = useState<CatUnitData | null>(null);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  const handleUpdatePlayerData = (
    updater: Partial<PlayerData> | ((prev: PlayerData) => PlayerData)
  ) => {
    setPlayerData((prev) => {
      if (typeof updater === 'function') {
        return updater(prev);
      }
      return { ...prev, ...updater };
    });
  };

  const handleUnlockAllStages = () => {
    const allStageIds = STAGES.map((s) => s.id);
    setPlayerData((prev) => ({
      ...prev,
      clearedStages: Array.from(new Set([...prev.clearedStages, ...allStageIds])),
    }));
  };

  const handleUnlockAllUnits = () => {
    setPlayerData((prev) => {
      const newUnlocked = { ...prev.unlockedUnits };
      CAT_UNITS.forEach((unit) => {
        if (!newUnlocked[unit.id]) {
          newUnlocked[unit.id] = {
            unitId: unit.id,
            level: 10,
            currentStage: 2,
            equippedSkills: [],
          };
        }
      });
      return { ...prev, unlockedUnits: newUnlocked };
    });
  };

  // --- Attach Developer Console Commands ---
  useEffect(() => {
    const nyankoDev = {
      open: () => {
        setIsDevToolsOpen(true);
        console.log('🐱 [NyankoDev] デベロッパーツール画面を起動しました！');
      },
      setCatFood: (amount: number) => {
        setPlayerData((prev) => ({ ...prev, catFood: Math.max(0, amount) }));
        console.log(`🐱 [NyankoDev] ネコカンを ${amount} 個に設定しました！`);
      },
      setXP: (amount: number) => {
        setPlayerData((prev) => ({ ...prev, xp: Math.max(0, amount) }));
        console.log(`✨ [NyankoDev] 経験値 (XP) を ${amount} に設定しました！`);
      },
      setEnergy: (energy: number, maxEnergy?: number) => {
        setPlayerData((prev) => ({
          ...prev,
          energy: Math.max(0, energy),
          maxEnergy: maxEnergy !== undefined ? Math.max(1, maxEnergy) : prev.maxEnergy,
        }));
        console.log(`⚡ [NyankoDev] 統率力を ${energy} に設定しました！`);
      },
      unlockAllStages: () => {
        handleUnlockAllStages();
        console.log('🚩 [NyankoDev] 全ステージを一括解放しました！');
      },
      unlockAllUnits: () => {
        handleUnlockAllUnits();
        console.log('🐱 [NyankoDev] 全キャラクターを一括解禁しました！');
      },
    };

    // Global Console Command Bindings
    (window as any).cheat = () => {
      setIsDevToolsOpen(true);
      return '🐱 デベロッパーツールを開きます！';
    };
    (window as any).openDevTools = () => {
      setIsDevToolsOpen(true);
      return '🐱 デベロッパーツールを開きます！';
    };
    (window as any).nyanko = nyankoDev;

    // Console Helper Message
    console.log(
      '%c🐱 [にゃんこ大戦争 デベロッパーコマンドが有効です]',
      'color: #f59e0b; font-size: 13px; font-weight: bold;'
    );
    console.log(
      '%c・ cheat() または openDevTools() または nyanko.open() と入力すると数値変更画面が開きます！',
      'color: #10b981; font-size: 11px; font-weight: bold;'
    );
    console.log(
      '%c・ 直接指定コマンド: nyanko.setCatFood(99999), nyanko.setXP(999999), nyanko.setEnergy(999)',
      'color: #06b6d4; font-size: 11px;'
    );
  }, []);

  const handleNavigate = (view: GameView, gachaTab?: 'nyanko' | 'rare') => {
    if (gachaTab) {
      setGachaInitialTab(gachaTab);
    }
    setCurrentView(view);
  };

  // --- Battle State ---
  const [activeStage, setActiveStage] = useState<StageData | null>(null);
  const [playerCastleHp, setPlayerCastleHp] = useState(1000);
  const [playerCastleMaxHp, setPlayerCastleMaxHp] = useState(1000);
  const [enemyCastleHp, setEnemyCastleHp] = useState(1000);
  const [enemyCastleMaxHp, setEnemyCastleMaxHp] = useState(1000);

  const [money, setMoney] = useState(100);
  const [workerCatLevel, setWorkerCatLevel] = useState(1);
  const [cannonChargePercent, setCannonChargePercent] = useState(0);
  const [isCannonFiring, setIsCannonFiring] = useState(false);
  const [cannonLaserX, setCannonLaserX] = useState<number | null>(null);

  const [activeUnits, setActiveUnits] = useState<ActiveBattleUnit[]>([]);
  const [unitCooldowns, setUnitCooldowns] = useState<Record<string, number>>({});
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [particles, setParticles] = useState<ParticleEffect[]>([]);

  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [isAutoBattle, setIsAutoBattle] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [battleResult, setBattleResult] = useState<'VICTORY' | 'DEFEAT' | null>(null);
  const [battleTimerSeconds, setBattleTimerSeconds] = useState(0);
  const [activeWaveText, setActiveWaveText] = useState<string | null>(null);

  // Enemy Spawn State Tracker Ref
  const enemySpawnStatesRef = useRef<{
    [spawnKey: string]: {
      spawnCount: number;
      lastSpawnTime: number;
      hpTriggerFired?: boolean;
    };
  }>({});

  // Combined base and custom units array
  const allUnits: CatUnitData[] = [...CAT_UNITS, ...(playerData.customUnits || [])];

  // --- Handle Custom Unit Creation from AI Generator ---
  const handleCreateCustomUnit = (cost: number, newUnit: CatUnitData) => {
    if (playerData.catFood < cost) return false;

    setPlayerData((prev) => ({
      ...prev,
      catFood: prev.catFood - cost,
      customUnits: [...(prev.customUnits || []), newUnit],
      unlockedUnits: {
        ...prev.unlockedUnits,
        [newUnit.id]: {
          unitId: newUnit.id,
          level: 1,
          currentStage: 1,
          equippedSkills: [],
        },
      },
    }));
    return true;
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerData((prev) => {
        if (prev.energy >= prev.maxEnergy) return prev;
        return { ...prev, energy: Math.min(prev.maxEnergy, prev.energy + 1) };
      });
    }, 15000); // 1 energy per 15s
    return () => clearInterval(interval);
  }, []);

  // --- Start Battle Handler ---
  const handleStartBattle = (stage: StageData) => {
    if (playerData.energy < stage.energyCost) return;

    // Deduct Energy
    setPlayerData((prev) => ({
      ...prev,
      energy: prev.energy - stage.energyCost,
    }));

    setActiveStage(stage);
    setPlayerCastleHp(stage.playerCastleHp);
    setPlayerCastleMaxHp(stage.playerCastleHp);
    setEnemyCastleHp(stage.enemyCastleHp);
    setEnemyCastleMaxHp(stage.enemyCastleHp);

    setMoney(100);
    setWorkerCatLevel(1);
    setCannonChargePercent(0);
    setIsCannonFiring(false);
    setCannonLaserX(null);

    setActiveUnits([]);
    setUnitCooldowns({});
    setFloatingTexts([]);
    setParticles([]);

    setBattleResult(null);
    setBattleTimerSeconds(0);
    setActiveWaveText(null);
    setIsPaused(false);
    enemySpawnStatesRef.current = {};

    setCurrentView('BATTLE');
    soundManager.startBgm();
  };

  // --- Main Battle Simulation Loop ---
  useEffect(() => {
    if (currentView !== 'BATTLE' || isPaused || battleResult !== null) return;

    const interval = setInterval(() => {
      const dt = 0.05 * speedMultiplier;
      setBattleTimerSeconds((prev) => prev + dt);

      // 1. Update Money & Cannon Charge
      const maxMoney = 100 + (workerCatLevel - 1) * 200;
      setMoney((prev) => Math.min(maxMoney, prev + dt * (18 + workerCatLevel * 12)));
      setCannonChargePercent((prev) => Math.min(100, prev + dt * 4));

      // 2. Update Unit Cooldowns
      setUnitCooldowns((prev) => {
        const next: Record<string, number> = {};
        for (const [id, cd] of Object.entries(prev) as [string, number][]) {
          if (cd > dt) next[id] = cd - dt;
        }
        return next;
      });

      // 3. Enemy Spawning Logic (Wave & Multi-Wave Continuous Spawns)
      if (activeStage) {
        const castleHpPct = (enemyCastleHp / enemyCastleMaxHp) * 100;

        activeStage.enemySpawns.forEach((spawn, idx) => {
          const enemy = ENEMIES[spawn.enemyId];
          if (!enemy) return;

          const spawnKey = `spawn_${idx}_${spawn.enemyId}`;
          if (!enemySpawnStatesRef.current[spawnKey]) {
            enemySpawnStatesRef.current[spawnKey] = {
              spawnCount: 0,
              lastSpawnTime: -999,
              hpTriggerFired: false,
            };
          }
          const state = enemySpawnStatesRef.current[spawnKey];

          // Check maxSpawns limit
          if (spawn.maxSpawns && state.spawnCount >= spawn.maxSpawns) return;

          let shouldSpawn = false;

          if (spawn.castleHpPercentTrigger) {
            // HP-based wave trigger
            if (!state.hpTriggerFired && castleHpPct <= spawn.castleHpPercentTrigger) {
              shouldSpawn = true;
              state.hpTriggerFired = true;
            } else if (
              state.hpTriggerFired &&
              spawn.repeatIntervalSeconds &&
              battleTimerSeconds - state.lastSpawnTime >= spawn.repeatIntervalSeconds
            ) {
              shouldSpawn = true;
            }
          } else {
            // Time-based wave trigger
            if (battleTimerSeconds >= spawn.spawnTimeSeconds) {
              if (state.spawnCount === 0) {
                shouldSpawn = true;
              } else if (
                spawn.repeatIntervalSeconds &&
                battleTimerSeconds - state.lastSpawnTime >= spawn.repeatIntervalSeconds
              ) {
                shouldSpawn = true;
              }
            }
          }

          if (shouldSpawn) {
            state.spawnCount += 1;
            state.lastSpawnTime = battleTimerSeconds;
            spawnEnemyUnit(enemy);

            if (spawn.waveName) {
              setActiveWaveText(spawn.waveName);
              setTimeout(() => {
                setActiveWaveText(null);
              }, 3000);
            }
          }
        });
      }

      // 4. Update Units Mechanics (Movement, Attack, Knockback)
      setActiveUnits((prevUnits) => {
        const updated = prevUnits.map((unit) => ({ ...unit }));

        updated.forEach((unit) => {
          if (unit.attackCooldown > 0) unit.attackCooldown -= dt;
          if (unit.knockbackTimer > 0) {
            unit.knockbackTimer -= dt;
            if (unit.knockbackTimer <= 0) unit.isKnockedBack = false;
          }
          unit.walkFrame += 1;

          const isPlayer = unit.side === 'player';
          const targetCastleX = isPlayer ? 1000 : 0;

          const enemiesInFront = updated.filter((other) => {
            if (other.side === unit.side) return false;
            return isPlayer ? other.x > unit.x : other.x < unit.x;
          });

          enemiesInFront.sort((a, b) => (isPlayer ? a.x - b.x : b.x - a.x));

          const closestEnemy = enemiesInFront[0];
          const distToEnemy = closestEnemy
            ? Math.abs(closestEnemy.x - unit.x)
            : Math.abs(targetCastleX - unit.x);

          if (distToEnemy <= unit.attackRange) {
            if (unit.attackCooldown <= 0) {
              unit.attackCooldown = unit.attackSpeedSeconds;
              unit.attackAnimTimer = 10;

              if (closestEnemy && Math.abs(closestEnemy.x - unit.x) <= unit.attackRange) {
                closestEnemy.hp -= unit.attack;
                closestEnemy.currentKnockbacks += 1;

                if (closestEnemy.currentKnockbacks % closestEnemy.knockbackCount === 0) {
                  closestEnemy.isKnockedBack = true;
                  closestEnemy.knockbackTimer = 0.4;
                  closestEnemy.x += isPlayer ? 40 : -40;
                  closestEnemy.x = Math.max(0, Math.min(1000, closestEnemy.x));
                  soundManager.playKnockback();
                } else {
                  soundManager.playHit();
                }

                addFloatingText(closestEnemy.x, unit.attack.toFixed(0), isPlayer ? '#facc15' : '#ef4444');
              } else {
                if (isPlayer) {
                  setEnemyCastleHp((hp) => Math.max(0, hp - unit.attack));
                  addFloatingText(1000, unit.attack.toFixed(0), '#facc15');
                } else {
                  setPlayerCastleHp((hp) => Math.max(0, hp - unit.attack));
                  addFloatingText(0, unit.attack.toFixed(0), '#ef4444');
                }
                soundManager.playHit();
              }
            }
          } else {
            if (!unit.isKnockedBack) {
              const moveDist = unit.movementSpeed * dt * 8;
              unit.x += isPlayer ? moveDist : -moveDist;
              unit.x = Math.max(0, Math.min(1000, unit.x));
            }
          }
        });

        return updated.filter((u) => u.hp > 0);
      });

      // Update Floating Damage Texts (float up and fade out within 1.5s)
      setFloatingTexts((prev) =>
        prev
          .map((ft) => ({
            ...ft,
            y: ft.y + ft.vy,
            opacity: ft.opacity - 0.04,
          }))
          .filter((ft) => ft.opacity > 0)
      );

      // 5. Check Win / Loss Conditions
      if (enemyCastleHp <= 0 && battleResult === null) {
        handleVictory();
      } else if (playerCastleHp <= 0 && battleResult === null) {
        handleDefeat();
      }

      // 6. Auto Battle AI Behavior
      if (isAutoBattle && activeStage) {
        const upgradeCost = Math.floor(100 * Math.pow(1.3, workerCatLevel - 1));
        if (money >= upgradeCost && workerCatLevel < 8) {
          handleUpgradeWorkerCat();
        } else {
          playerData.equippedDeck.forEach((unitId) => {
            const unit = CAT_UNITS.find((u) => u.id === unitId);
            if (
              unit &&
              money >= unit.deployCost &&
              (!unitCooldowns[unit.id] || unitCooldowns[unit.id] <= 0)
            ) {
              handleDeployUnit(unitId);
            }
          });
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [
    currentView,
    isPaused,
    speedMultiplier,
    battleResult,
    money,
    workerCatLevel,
    activeStage,
    enemyCastleHp,
    playerCastleHp,
    isAutoBattle,
    unitCooldowns,
  ]);

  // Spawn Enemy Unit Helper
  const spawnEnemyUnit = (enemy: typeof ENEMIES[string]) => {
    const instanceId = `e_${Date.now()}_${Math.random()}`;
    const newEnemy: ActiveBattleUnit = {
      instanceId,
      unitId: enemy.id,
      side: 'enemy',
      x: 1000,
      y: (Math.random() - 0.5) * 20,
      hp: enemy.hp,
      maxHp: enemy.hp,
      attack: enemy.attack,
      attackRange: enemy.attackRange,
      movementSpeed: enemy.movementSpeed,
      attackCooldown: 0,
      attackSpeedSeconds: enemy.attackSpeedSeconds,
      isAreaAttack: enemy.isAreaAttack,
      knockbackCount: 2,
      currentKnockbacks: 0,
      isKnockedBack: false,
      knockbackTimer: 0,
      sizeScale: enemy.sizeScale,
      color: enemy.color,
      secondaryColor: enemy.secondaryColor,
      shape: enemy.shape,
      name: enemy.name,
      level: 1,
      isBoss: enemy.isBoss,
      walkFrame: 0,
      attackAnimTimer: 0,
      hitEffectTimer: 0,
    };
    setActiveUnits((prev) => [...prev, newEnemy]);
  };

  // --- Deploy Unit Handler ---
  const handleDeployUnit = (unitId: string) => {
    const baseUnit = allUnits.find((u) => u.id === unitId);
    if (!baseUnit) return;

    const progress = playerData.unlockedUnits[unitId] || { unitId, level: 1, currentStage: 1, equippedSkills: [] };
    const stats = calculateUnitStats(baseUnit, progress);

    if (money < stats.deployCost) return;

    setMoney((prev) => prev - stats.deployCost);
    setUnitCooldowns((prev) => ({ ...prev, [unitId]: baseUnit.cooldownSeconds }));

    const newUnit: ActiveBattleUnit = {
      instanceId: `p_${Date.now()}_${Math.random()}`,
      unitId,
      side: 'player',
      x: 0,
      y: (Math.random() - 0.5) * 20,
      hp: stats.hp,
      maxHp: stats.hp,
      attack: stats.attack,
      attackRange: baseUnit.attackRange,
      movementSpeed: stats.movementSpeed,
      attackCooldown: 0,
      attackSpeedSeconds: baseUnit.attackSpeedSeconds,
      isAreaAttack: baseUnit.isAreaAttack,
      knockbackCount: baseUnit.knockbackCount,
      currentKnockbacks: 0,
      isKnockedBack: false,
      knockbackTimer: 0,
      sizeScale: 1.0,
      color: stats.displayEvolution.color,
      secondaryColor: stats.displayEvolution.secondaryColor,
      shape: stats.displayEvolution.icon,
      name: stats.displayEvolution.name,
      level: progress.level,
      rarity: baseUnit.rarity,
      walkFrame: 0,
      attackAnimTimer: 0,
      hitEffectTimer: 0,
      traitBadge: `第${progress.currentStage}形態`,
    };

    setActiveUnits((prev) => [...prev, newUnit]);
  };

  // --- Worker Cat Upgrade Handler ---
  const handleUpgradeWorkerCat = () => {
    const cost = Math.floor(100 * Math.pow(1.3, workerCatLevel - 1));
    if (money >= cost && workerCatLevel < 8) {
      setMoney((prev) => prev - cost);
      setWorkerCatLevel((prev) => prev + 1);
    }
  };

  // --- Fire Cannon Handler ---
  const handleFireCannon = () => {
    if (cannonChargePercent < 100) return;
    setCannonChargePercent(0);
    setIsCannonFiring(true);
    setCannonLaserX(1000);

    setActiveUnits((prev) =>
      prev.map((unit) => {
        if (unit.side === 'enemy') {
          return {
            ...unit,
            hp: Math.max(0, unit.hp - 500),
            isKnockedBack: true,
            knockbackTimer: 0.6,
            x: Math.min(1000, unit.x + 80),
          };
        }
        return unit;
      })
    );

    setEnemyCastleHp((hp) => Math.max(0, hp - 300));

    setTimeout(() => {
      setIsCannonFiring(false);
      setCannonLaserX(null);
    }, 800);
  };

  const addFloatingText = (x: number, text: string, color: string) => {
    setFloatingTexts((prev) => [
      ...prev,
      {
        id: `ft_${Date.now()}_${Math.random()}`,
        x,
        y: -10,
        text,
        color,
        opacity: 1.0,
        scale: 1.2,
        vy: -1.5,
      },
    ]);
  };

  const handleVictory = () => {
    if (!activeStage) return;
    setBattleResult('VICTORY');
    soundManager.stopBgm();
    soundManager.playVictory();

    setPlayerData((prev) => {
      const isFirstClear = !prev.clearedStages.includes(activeStage.id);
      return {
        ...prev,
        clearedStages: Array.from(new Set([...prev.clearedStages, activeStage.id])),
        catFood: prev.catFood + (isFirstClear ? activeStage.firstClearRewardCatFood : 20),
        xp: prev.xp + (isFirstClear ? activeStage.firstClearRewardXp : 800),
        evolutionStones: prev.evolutionStones + 1,
      };
    });
  };

  const handleDefeat = () => {
    setBattleResult('DEFEAT');
    soundManager.stopBgm();
    soundManager.playDefeat();
  };

  // Unit Operations
  const handleLevelUpUnit = (unitId: string, costXp: number) => {
    if (playerData.xp < costXp) return;
    setPlayerData((prev) => ({
      ...prev,
      xp: prev.xp - costXp,
      unlockedUnits: {
        ...prev.unlockedUnits,
        [unitId]: {
          ...prev.unlockedUnits[unitId],
          level: (prev.unlockedUnits[unitId]?.level || 1) + 1,
        },
      },
    }));
  };

  const handleEvolveStage2 = (unitId: string, costXp: number) => {
    if (playerData.xp < costXp) return;
    setPlayerData((prev) => ({
      ...prev,
      xp: prev.xp - costXp,
      unlockedUnits: {
        ...prev.unlockedUnits,
        [unitId]: {
          ...prev.unlockedUnits[unitId],
          currentStage: 2,
        },
      },
    }));
  };

  const handleSelectBranchStage3 = (
    unitId: string,
    branch: 'branchA' | 'branchB',
    costXp: number,
    stonesNeeded: number
  ) => {
    if (playerData.xp < costXp || playerData.evolutionStones < stonesNeeded) return;
    setPlayerData((prev) => ({
      ...prev,
      xp: prev.xp - costXp,
      evolutionStones: prev.evolutionStones - stonesNeeded,
      unlockedUnits: {
        ...prev.unlockedUnits,
        [unitId]: {
          ...prev.unlockedUnits[unitId],
          currentStage: 3,
          selectedBranch: branch,
        },
      },
    }));
  };

  const handleEquipSkill = (unitId: string, skillId: string) => {
    setPlayerData((prev) => {
      const current = prev.unlockedUnits[unitId]?.equippedSkills || [];
      const isAlready = current.includes(skillId);
      let updated = [...current];
      if (isAlready) {
        updated = updated.filter((s) => s !== skillId);
      } else {
        if (updated.length >= 2) updated.shift();
        updated.push(skillId);
      }
      return {
        ...prev,
        unlockedUnits: {
          ...prev.unlockedUnits,
          [unitId]: {
            ...prev.unlockedUnits[unitId],
            equippedSkills: updated,
          },
        },
      };
    });
  };

  const handlePerformGacha = (cost: number, count: number, gachaType: 'nyanko' | 'rare' = 'nyanko') => {
    setPlayerData((prev) => ({ ...prev, catFood: prev.catFood - cost }));

    const pulledUnits: CatUnitData[] = [];
    let rewardsXp = 0;
    let rewardsStones = 0;

    // Filter units strictly to official base units (CAT_UNITS only, excluding custom AI units)
    const baseGachaPool = CAT_UNITS;
    const legendSuperRarePool = baseGachaPool.filter((u) => u.rarity === 'Legend' || u.rarity === 'SuperRare');
    const rarePool = baseGachaPool.filter((u) => u.rarity === 'Rare');
    const normalPool = baseGachaPool.filter((u) => u.rarity === 'Normal');

    // Thresholds based on gacha type
    // Nyanko Gacha (50 cat food): SuperRare/Legend = 1.0%, SuperRare = 9.0%, Rare = 25.0%, Normal = 65.0%
    // Rare Gacha (100 cat food): SuperRare/Legend = 3.0%, SuperRare = 15.0%, Rare = 35.0%, Normal = 47.0%
    const isRareGacha = gachaType === 'rare';
    const legendRate = isRareGacha ? 3.0 : 1.0;
    const superRareRate = isRareGacha ? 18.0 : 10.0;
    const rareRate = isRareGacha ? 53.0 : 35.0;

    for (let i = 0; i < count; i++) {
      const roll = Math.random() * 100;
      let targetPool: CatUnitData[] = [];

      if (roll < legendRate && legendSuperRarePool.length > 0) {
        targetPool = legendSuperRarePool;
      } else if (roll < superRareRate && legendSuperRarePool.length > 0) {
        // Super Rare pool
        const superRareOnly = legendSuperRarePool.filter((u) => u.rarity === 'SuperRare');
        targetPool = superRareOnly.length > 0 ? superRareOnly : legendSuperRarePool;
      } else if (roll < rareRate && rarePool.length > 0) {
        targetPool = rarePool;
      } else if (normalPool.length > 0) {
        targetPool = normalPool;
      } else {
        targetPool = baseGachaPool;
      }

      const randomIndex = Math.floor(Math.random() * targetPool.length);
      const picked = targetPool[randomIndex] || baseGachaPool[0];
      pulledUnits.push(picked);

      if (playerData.unlockedUnits[picked.id]) {
        rewardsXp += 800;
        rewardsStones += 1;
      }
    }

    setPlayerData((prev) => {
      const updatedUnits = { ...prev.unlockedUnits };
      pulledUnits.forEach((u) => {
        if (!updatedUnits[u.id]) {
          updatedUnits[u.id] = { unitId: u.id, level: 1, currentStage: 1, equippedSkills: [] };
        }
      });

      return {
        ...prev,
        xp: prev.xp + rewardsXp,
        evolutionStones: prev.evolutionStones + rewardsStones,
        unlockedUnits: updatedUnits,
      };
    });

    return { pulledUnits, rewardsXp, rewardsStones };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col items-center justify-center p-2 md:p-6 select-none">
      {/* Main Game Screen View Controller */}
      <main className="w-full max-w-5xl my-2 flex-1 flex flex-col justify-center">
        {/* 1. HOME (ネコ基地) */}
        {currentView === 'HOME' && (
          <HomeBase
            playerData={playerData}
            onNavigate={handleNavigate}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {/* 2. STAGE SELECT (ステージ選択マップ) */}
        {currentView === 'STAGE_SELECT' && (
          <StageSelect
            playerData={playerData}
            onSelectStage={handleStartBattle}
            onOpenEvolution={(unit) => {
              setSelectedUnitForEvol(unit);
              setCurrentView('EVOLUTION');
            }}
            onOpenGacha={() => setCurrentView('GACHA')}
            onOpenCodex={() => setCurrentView('CODEX')}
            onOpenLab={() => setCurrentView('LAB')}
            onOpenAiGenerator={() => setCurrentView('AI_CAT')}
            onOpenDeckBuilder={() => setCurrentView('DECK_BUILDER')}
            onBackToHome={() => setCurrentView('HOME')}
          />
        )}

        {/* 3. DECK BUILDER (キャラクター編成) */}
        {currentView === 'DECK_BUILDER' && (
          <DeckBuilder
            playerData={playerData}
            onUpdateDeck={(newDeck) =>
              setPlayerData((prev) => ({ ...prev, equippedDeck: newDeck }))
            }
            onOpenEvolution={(unit) => {
              setSelectedUnitForEvol(unit);
              setCurrentView('EVOLUTION');
            }}
            onBackToHome={() => setCurrentView('HOME')}
          />
        )}

        {/* 4. POWER UP (パワーアップ/強化) */}
        {currentView === 'POWER_UP' && (
          <PowerUp
            playerData={playerData}
            onLevelUpUnit={handleLevelUpUnit}
            onOpenEvolution={(unit) => {
              setSelectedUnitForEvol(unit);
              setCurrentView('EVOLUTION');
            }}
            onBackToHome={() => setCurrentView('HOME')}
          />
        )}

        {/* 5. BATTLE (戦闘進行キャンバス) */}
        {currentView === 'BATTLE' && activeStage && (
          <div className="w-full space-y-4">
            <BattleCanvas
              stage={activeStage}
              units={activeUnits}
              playerCastleHp={playerCastleHp}
              playerCastleMaxHp={playerCastleMaxHp}
              enemyCastleHp={enemyCastleHp}
              enemyCastleMaxHp={enemyCastleMaxHp}
              cannonChargePercent={cannonChargePercent}
              isCannonFiring={isCannonFiring}
              cannonLaserX={cannonLaserX}
              speedMultiplier={speedMultiplier}
              isPaused={isPaused}
              floatingTexts={floatingTexts}
              particles={particles}
            />

            <BattleUI
              stage={activeStage}
              money={money}
              maxMoney={100 + (workerCatLevel - 1) * 200}
              workerCatLevel={workerCatLevel}
              workerUpgradeCost={Math.floor(100 * Math.pow(1.3, workerCatLevel - 1))}
              cannonChargePercent={cannonChargePercent}
              speedMultiplier={speedMultiplier}
              isAutoBattle={isAutoBattle}
              isPaused={isPaused}
              equippedUnits={allUnits.filter((u) => playerData.equippedDeck.includes(u.id))}
              playerProgress={playerData.unlockedUnits}
              unitCooldowns={unitCooldowns}
              activeWaveText={activeWaveText}
              onDeployUnit={handleDeployUnit}
              onUpgradeWorkerCat={handleUpgradeWorkerCat}
              onFireCannon={handleFireCannon}
              onToggleSpeed={() =>
                setSpeedMultiplier((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : 1))
              }
              onToggleAuto={() => setIsAutoBattle((prev) => !prev)}
              onTogglePause={() => setIsPaused((prev) => !prev)}
              onRetreat={() => {
                soundManager.stopBgm();
                setCurrentView('STAGE_SELECT');
              }}
            />
          </div>
        )}
      </main>

      {/* --- Victory / Defeat Overlay Modals --- */}
      {battleResult && activeStage && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border-2 border-amber-500 p-6 text-center space-y-5 shadow-2xl animate-fadeIn">
            {battleResult === 'VICTORY' ? (
              <>
                <div className="text-6xl animate-bounce">🏆🐱</div>
                <h2 className="text-2xl font-black text-amber-400">完全勝利！城を攻め落とした！</h2>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-bold text-slate-200">
                  <p className="text-amber-300">獲得猫缶: +{activeStage.firstClearRewardCatFood}</p>
                  <p className="text-amber-400">獲得XP: +{activeStage.firstClearRewardXp.toLocaleString()} XP</p>
                  <p className="text-cyan-400">獲得素材: +1 進化石</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl">💀😿</div>
                <h2 className="text-2xl font-black text-rose-500">敗北... にゃんこ城陥落</h2>
                <p className="text-xs text-slate-400">
                  キャラクターをレベルアップ・進化させてリベンジしよう！
                </p>
              </>
            )}

            <button
              onClick={() => {
                soundManager.stopBgm();
                setBattleResult(null);
                setCurrentView('STAGE_SELECT');
              }}
              className="w-full py-3.5 rounded-2xl font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl transition-all cursor-pointer"
            >
              ステージ選択へ戻る
            </button>
          </div>
        </div>
      )}

      {/* Sub Modals */}
      {currentView === 'EVOLUTION' && selectedUnitForEvol && (
        <EvolutionModal
          unit={selectedUnitForEvol}
          progress={
            playerData.unlockedUnits[selectedUnitForEvol.id] || {
              level: 1,
              currentStage: 1,
              equippedSkills: [],
            }
          }
          playerXp={playerData.xp}
          playerStones={playerData.evolutionStones}
          onClose={() => setCurrentView('HOME')}
          onLevelUp={handleLevelUpUnit}
          onEvolveStage2={handleEvolveStage2}
          onSelectBranchStage3={handleSelectBranchStage3}
          onEquipSkill={handleEquipSkill}
        />
      )}

      {currentView === 'GACHA' && (
        <GachaModal
          catFood={playerData.catFood}
          unlockedUnitIds={Object.keys(playerData.unlockedUnits)}
          allUnits={allUnits}
          initialTab={gachaInitialTab}
          onClose={() => setCurrentView('HOME')}
          onPerformGacha={handlePerformGacha}
        />
      )}

      {currentView === 'CODEX' && (
        <CodexModal
          playerProgress={playerData.unlockedUnits}
          customUnits={playerData.customUnits}
          onClose={() => setCurrentView('HOME')}
        />
      )}

      {currentView === 'LAB' && (
        <LabModal
          xp={playerData.xp}
          catFood={playerData.catFood}
          stones={playerData.evolutionStones}
          playerData={playerData}
          onImportSave={(newSave) => setPlayerData(newSave)}
          onUpdatePlayerData={(updater) => setPlayerData(updater)}
          onClose={() => setCurrentView('HOME')}
          onConvertStonesToXp={(amt) => {
            setPlayerData((prev) => ({
              ...prev,
              evolutionStones: prev.evolutionStones - amt,
              xp: prev.xp + amt * 5000,
            }));
          }}
          onRefillEnergy={() => {
            setPlayerData((prev) => ({
              ...prev,
              catFood: prev.catFood - 30,
              energy: prev.maxEnergy,
            }));
          }}
        />
      )}

      {currentView === 'AI_CAT' && (
        <AiCatGeneratorModal
          catFood={playerData.catFood}
          onClose={() => setCurrentView('HOME')}
          onCreateCustomUnit={handleCreateCustomUnit}
        />
      )}

      {isDevToolsOpen && (
        <DevToolsModal
          playerData={playerData}
          onUpdatePlayerData={handleUpdatePlayerData}
          onUnlockAllStages={handleUnlockAllStages}
          onUnlockAllUnits={handleUnlockAllUnits}
          onClose={() => setIsDevToolsOpen(false)}
        />
      )}

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center pt-2 text-[11px] text-slate-500">
        The-Battle-Cats2 - 本家再現ホーム画面＆特注新種創生
      </footer>
    </div>
  );
}
