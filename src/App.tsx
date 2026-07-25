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
import { ItemShopModal } from './components/ItemShopModal';
import { CatFoodShopModal } from './components/CatFoodShopModal';
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
  isTutorialCompleted: false,
};

export default function App() {
  // --- Offline & Online Energy Auto-Recovery Logic ---
  const ENERGY_REFILL_INTERVAL_MS = 15000; // 15 seconds per 1 energy

  // Helper function to calculate energy recovery based on timestamp
  const calculateEnergyRefill = (data: PlayerData): PlayerData => {
    const now = Date.now();
    const lastTimestamp = data.lastEnergyRefillTimestamp || now;
    const elapsed = now - lastTimestamp;

    if (data.energy >= data.maxEnergy) {
      if (data.lastEnergyRefillTimestamp !== now) {
        return { ...data, lastEnergyRefillTimestamp: now };
      }
      return data;
    }

    if (elapsed < ENERGY_REFILL_INTERVAL_MS) {
      return data;
    }

    const pointsToRecover = Math.floor(elapsed / ENERGY_REFILL_INTERVAL_MS);
    const needed = data.maxEnergy - data.energy;
    const actualRecovered = Math.min(needed, pointsToRecover);

    const newEnergy = data.energy + actualRecovered;
    const remainder = elapsed % ENERGY_REFILL_INTERVAL_MS;
    const newTimestamp = newEnergy >= data.maxEnergy ? now : now - remainder;

    return {
      ...data,
      energy: newEnergy,
      lastEnergyRefillTimestamp: newTimestamp,
    };
  };

  // Persistent storage with offline recovery calculation on boot
  const [playerData, setPlayerData] = useState<PlayerData>(() => {
    const saved = localStorage.getItem('nyanko_war_2_save');
    if (saved) {
      try {
        const parsed: PlayerData = JSON.parse(saved);
        return calculateEnergyRefill(parsed);
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
          lastEnergyRefillTimestamp: Date.now(),
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

  const handleSkipTutorial = () => {
    setPlayerData(prev => ({ ...prev, isTutorialCompleted: true }));
  };

  // --- Battle State ---
  const [activeStage, setActiveStage] = useState<StageData | null>(null);
  const [activeBattleItems, setActiveBattleItems] = useState<{
    catBon?: boolean;
    sniper?: boolean;
    cpu?: boolean;
    treasureRadar?: boolean;
  }>({});
  const sniperTimerRef = useRef<number>(0);
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
  const activeUnitsRef = useRef<ActiveBattleUnit[]>([]);
  useEffect(() => {
    activeUnitsRef.current = activeUnits;
  }, [activeUnits]);
  const [unitCooldowns, setUnitCooldowns] = useState<Record<string, number>>({});
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [particles, setParticles] = useState<ParticleEffect[]>([]);

  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [isAutoBattle, setIsAutoBattle] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const [battleResult, setBattleResult] = useState<'VICTORY' | 'DEFEAT' | null>(null);
  const [isHardMode, setIsHardMode] = useState<boolean>(false); // New state
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

  // CPU AI Commander Action Cooldown Ref
  const aiActionCooldownRef = useRef<number>(0);

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
      setPlayerData((prev) => calculateEnergyRefill(prev));
    }, 1000); // Check every second for smooth recovery & off-tab sync
    return () => clearInterval(interval);
  }, []);

  // Helper for Worker Cat max money & upgrade cost
  const WORKER_MAX_MONEY_TABLE = [200, 450, 800, 1400, 2400, 4000, 6000, 9000];
  const WORKER_UPGRADE_COST_TABLE = [60, 120, 200, 350, 600, 1000, 1600];

  const getWorkerMaxMoney = (level: number) => {
    return WORKER_MAX_MONEY_TABLE[Math.min(Math.max(0, level - 1), WORKER_MAX_MONEY_TABLE.length - 1)];
  };

  const getWorkerUpgradeCost = (level: number) => {
    return WORKER_UPGRADE_COST_TABLE[Math.min(Math.max(0, level - 1), WORKER_UPGRADE_COST_TABLE.length - 1)] || 9999;
  };

  // --- Start Battle Handler ---
  const handleStartBattle = (
    stage: StageData,
    hardMode: boolean, // <-- Updated
    activeItems?: { catBon?: boolean; sniper?: boolean; cpu?: boolean; treasureRadar?: boolean }
  ) => {
    if (playerData.energy < stage.energyCost) return;
    setIsHardMode(hardMode); // <-- Updated
    const itemsUsed = activeItems || {};
    setActiveBattleItems(itemsUsed);

    // Deduct Energy & Item inventory & track timestamp for refill
    setPlayerData((prev) => {
      const isWasFull = prev.energy >= prev.maxEnergy;
      const newEnergy = Math.max(0, prev.energy - stage.energyCost);
      const now = Date.now();

      const currentItems = { ...(prev.items || {}) };
      if (itemsUsed.catBon && (currentItems.catBon || 0) > 0) {
        currentItems.catBon = (currentItems.catBon || 0) - 1;
      }
      if (itemsUsed.sniper && (currentItems.sniper || 0) > 0) {
        currentItems.sniper = (currentItems.sniper || 0) - 1;
      }
      if (itemsUsed.cpu && (currentItems.cpu || 0) > 0) {
        currentItems.cpu = (currentItems.cpu || 0) - 1;
      }
      if (itemsUsed.treasureRadar && (currentItems.treasureRadar || 0) > 0) {
        currentItems.treasureRadar = (currentItems.treasureRadar || 0) - 1;
      }

      return {
        ...prev,
        energy: newEnergy,
        items: currentItems,
        lastEnergyRefillTimestamp: isWasFull ? now : (prev.lastEnergyRefillTimestamp || now),
      };
    });

    setActiveStage(stage);
    setPlayerCastleHp(stage.playerCastleHp);
    setPlayerCastleMaxHp(stage.playerCastleHp);
    setEnemyCastleHp(stage.enemyCastleHp);
    setEnemyCastleMaxHp(stage.enemyCastleHp);

    // CatBon item effect: Lv.8 Max Worker Cat & $7500 money start
    const startWorkerLevel = itemsUsed.catBon ? 8 : 1;
    const startMoney = itemsUsed.catBon ? 7500 : 100;
    setMoney(startMoney);
    setWorkerCatLevel(startWorkerLevel);

    // CPU item effect: Auto Battle enabled from start
    setIsAutoBattle(!!itemsUsed.cpu);

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
    sniperTimerRef.current = 0;

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
      const maxMoney = getWorkerMaxMoney(workerCatLevel);
      setMoney((prev) => Math.min(maxMoney, prev + dt * (15 + workerCatLevel * 20)));
      setCannonChargePercent((prev) => Math.min(100, prev + dt * 4));

      // 2. Update Unit Cooldowns
      setUnitCooldowns((prev) => {
        const next: Record<string, number> = {};
        for (const [id, cd] of Object.entries(prev) as [string, number][]) {
          if (cd > dt) next[id] = cd - dt;
        }
        return next;
      });

      // 2.5. Sniper Cat Auto Fire Item Logic
      if (activeBattleItems.sniper) {
        sniperTimerRef.current += dt;
        if (sniperTimerRef.current >= 6.5) {
          sniperTimerRef.current = 0;
          setActiveUnits((prevUnits) => {
            const enemyUnits = prevUnits.filter((u) => u.side === 'enemy' && u.hp > 0);
            if (enemyUnits.length === 0) return prevUnits;

            // Sort enemies by X ascending (closest enemy to player castle x=0)
            const sorted = [...enemyUnits].sort((a, b) => a.x - b.x);
            const target = sorted[0];

            soundManager.playKnockback();
            addFloatingText(target.x, '🎯 SNIPER! -350', '#f43f5e');

            return prevUnits.map((u) => {
              if (u.instanceId === target.instanceId) {
                return {
                  ...u,
                  hp: Math.max(0, u.hp - 350),
                  isKnockedBack: true,
                  knockbackTimer: 0.6,
                  x: Math.min(1000, u.x + 70),
                };
              }
              return u;
            });
          });
        }
      }

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
            if (isHardMode) spawnEnemyUnit(enemy); // Double spawns for Hard Mode

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
                for (let i = 0; i < 5; i++) {
                   addParticle(closestEnemy.x, (Math.random() - 0.5) * 50, '#facc15', (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, Math.random() * 5 + 2, 20);
                }
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

      // Update Particles
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 1,
          }))
          .filter((p) => p.life > 0)
      );

      // 5. Check Win / Loss Conditions
      if (enemyCastleHp <= 0 && battleResult === null) {
        handleVictory();
      } else if (playerCastleHp <= 0 && battleResult === null) {
        handleDefeat();
      }

      // 6. Smart Auto Battle AI Behavior (ニャンコCPU AI Commander)
      if (isAutoBattle && activeBattleItems.cpu && activeStage) {
        aiActionCooldownRef.current -= dt;

        if (aiActionCooldownRef.current <= 0) {
          const currentActiveUnits = activeUnitsRef.current;
          const enemyUnits = currentActiveUnits.filter((u) => u.side === 'enemy');
          const playerUnits = currentActiveUnits.filter((u) => u.side === 'player');

          // Relative progress ratio calculations (0.0 = player castle x=0, 1.0 = enemy castle x=1000)
          let closestEnemyX = 1000;
          enemyUnits.forEach((e) => {
            if (e.x < closestEnemyX) closestEnemyX = e.x;
          });

          let furthestPlayerX = 0;
          playerUnits.forEach((p) => {
            if (p.x > furthestPlayerX) furthestPlayerX = p.x;
          });

          // Enemy Advance Ratio: 0.0 (at enemy castle) to 1.0 (at player castle)
          const enemyAdvanceRatio = Math.max(0, Math.min(1, (1000 - closestEnemyX) / 1000));
          const playerPushRatio = Math.max(0, Math.min(1, furthestPlayerX / 1000));

          const castleHpRatio = playerCastleHp / playerCastleMaxHp;
          const isUnderPressure =
            enemyAdvanceRatio >= 0.65 || castleHpRatio < 0.5 || (enemyUnits.length >= 4 && enemyAdvanceRatio >= 0.45);

          // A. Strategic Cannon Firing
          if (cannonChargePercent >= 100 && (enemyAdvanceRatio >= 0.5 || enemyUnits.length >= 3)) {
            handleFireCannon();
            aiActionCooldownRef.current = 0.6;
          } else {
            // Gather all deck unit information with their calculated stats
            const deckUnitsStats = playerData.equippedDeck
              .map((unitId) => {
                const baseUnit = allUnits.find((u) => u.id === unitId);
                if (!baseUnit) return null;
                const progress = playerData.unlockedUnits[unitId] || {
                  unitId,
                  level: 1,
                  currentStage: 1,
                  equippedSkills: [],
                };
                const stats = calculateUnitStats(baseUnit, progress);
                const cd = unitCooldowns[unitId] || 0;
                return {
                  unitId,
                  baseUnit,
                  stats,
                  cooldown: cd,
                  isMeatshield: stats.deployCost <= 250,
                  isHeavy: stats.deployCost > 250,
                };
              })
              .filter((u): u is NonNullable<typeof u> => u !== null);

            // Active units count on field
            let activeMeatshieldCount = 0;
            let activeHeavyCount = 0;

            playerUnits.forEach((pu) => {
              const match = deckUnitsStats.find((d) => d.unitId === pu.unitId);
              if (match) {
                if (match.isMeatshield) activeMeatshieldCount++;
                if (match.isHeavy) activeHeavyCount++;
              } else {
                activeMeatshieldCount++;
              }
            });

            // Worker Cat Upgrade Cost & Target
            const workerUpgradeCost = getWorkerUpgradeCost(workerCatLevel);
            const maxMoney = getWorkerMaxMoney(workerCatLevel);

            // Check if any deck unit requires higher max money capacity
            const minCostForHeavyInDeck = Math.min(
              ...deckUnitsStats.filter((u) => u.isHeavy).map((u) => u.stats.deployCost),
              9999
            );
            const needsWorkerUpgradeForDeck = minCostForHeavyInDeck < 9999 && minCostForHeavyInDeck > maxMoney;

            // Worker Cat upgrade decision
            let shouldUpgradeWorker = false;
            if (workerCatLevel < 8 && money >= workerUpgradeCost) {
              if (needsWorkerUpgradeForDeck && !isUnderPressure) {
                shouldUpgradeWorker = true;
              } else if (!isUnderPressure) {
                if (workerCatLevel <= 3 && (enemyAdvanceRatio < 0.4 || activeMeatshieldCount >= 1)) {
                  shouldUpgradeWorker = true;
                } else if (money >= maxMoney * 0.85) {
                  shouldUpgradeWorker = true;
                }
              }
            }

            if (shouldUpgradeWorker) {
              handleUpgradeWorkerCat();
              aiActionCooldownRef.current = 0.5;
            } else {
              // Identify heavy attackers in deck that are off cooldown
              const readyHeavies = deckUnitsStats.filter((u) => u.isHeavy && u.cooldown <= 0);

              // Target heavy unit (prefer highest cost)
              const targetHeavyUnit = readyHeavies.sort((a, b) => b.stats.deployCost - a.stats.deployCost)[0];

              if (isUnderPressure) {
                // EMERGENCY DEFENSE MODE: Spawn cheapest ready units to build a wall immediately!
                const readyUnits = deckUnitsStats.filter((u) => u.cooldown <= 0 && money >= u.stats.deployCost);
                if (readyUnits.length > 0) {
                  readyUnits.sort((a, b) => a.stats.deployCost - b.stats.deployCost);
                  handleDeployUnit(readyUnits[0].unitId);
                  aiActionCooldownRef.current = 0.35;
                }
              } else if (targetHeavyUnit) {
                // STRATEGIC SAVING MODE for Heavy Unit
                if (money >= targetHeavyUnit.stats.deployCost) {
                  // Reached required funds! Deploy the heavy unit!
                  handleDeployUnit(targetHeavyUnit.unitId);
                  aiActionCooldownRef.current = 0.8;
                } else {
                  // Money is being saved for targetHeavyUnit.
                  // Only deploy 1 cheap meatshield if front line is completely empty, otherwise SAVE MONEY!
                  if (activeMeatshieldCount < 1 && enemyAdvanceRatio > 0.35) {
                    const cheapMeatshields = deckUnitsStats.filter(
                      (u) => u.isMeatshield && u.cooldown <= 0 && money >= u.stats.deployCost
                    );
                    if (cheapMeatshields.length > 0) {
                      handleDeployUnit(cheapMeatshields[0].unitId);
                      aiActionCooldownRef.current = 0.8; // Give long cooldown to allow money accumulating
                    } else {
                      aiActionCooldownRef.current = 0.2; // Hold money
                    }
                  } else {
                    // Front line has a defender or enemy is far away -> HOLD MONEY!
                    aiActionCooldownRef.current = 0.2;
                  }
                }
              } else {
                // NORMAL / PUSHING MODE
                const readyUnits = deckUnitsStats.filter((u) => u.cooldown <= 0 && money >= u.stats.deployCost);
                if (readyUnits.length > 0) {
                  const readyMeatshields = readyUnits.filter((u) => u.isMeatshield);
                  const readyHeavies = readyUnits.filter((u) => u.isHeavy);

                  if (activeMeatshieldCount < 1 && readyMeatshields.length > 0) {
                    handleDeployUnit(readyMeatshields[0].unitId);
                    aiActionCooldownRef.current = 0.5;
                  } else if (readyHeavies.length > 0) {
                    readyHeavies.sort((a, b) => b.stats.deployCost - a.stats.deployCost);
                    handleDeployUnit(readyHeavies[0].unitId);
                    aiActionCooldownRef.current = 0.7;
                  } else {
                    handleDeployUnit(readyUnits[0].unitId);
                    aiActionCooldownRef.current = 0.5;
                  }
                }
              }
            }
          }
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
    isHardMode, // Added
  ]);

  // Spawn Enemy Unit Helper
  const spawnEnemyUnit = (enemy: typeof ENEMIES[string]) => {
    const instanceId = `e_${Date.now()}_${Math.random()}`;
    const multiplier = isHardMode ? 2 : 1; // 2x stats
    const newEnemy: ActiveBattleUnit = {
      instanceId,
      unitId: enemy.id,
      side: 'enemy',
      x: 1000,
      y: (Math.random() - 0.5) * 20,
      hp: enemy.hp * multiplier,
      maxHp: enemy.hp * multiplier,
      attack: enemy.attack * multiplier,
      attackRange: enemy.attackRange,
      movementSpeed: enemy.movementSpeed,
      attackCooldown: 0,
      attackSpeedSeconds: enemy.attackSpeedSeconds / multiplier, // Faster attacks (smaller seconds)
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
    const cost = getWorkerUpgradeCost(workerCatLevel);
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

  const addParticle = (x: number, y: number, color: string, vx: number, vy: number, size: number, life: number) => {
    setParticles((prev) => [
      ...prev,
      {
        id: `p_${Date.now()}_${Math.random()}`,
        x,
        y,
        vx,
        vy,
        size,
        color,
        life,
        maxLife: life,
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
      const baseCatFood = isFirstClear ? activeStage.firstClearRewardCatFood : 20;
      const baseXp = isFirstClear ? activeStage.firstClearRewardXp : 800;
      const baseStones = 1;

      const hasRadar = !!activeBattleItems.treasureRadar;
      const finalCatFood = hasRadar ? baseCatFood * 2 + 10 : baseCatFood;
      const finalXp = hasRadar ? baseXp * 2 + 2000 : baseXp;
      const finalStones = hasRadar ? baseStones + 2 : baseStones;

      return {
        ...prev,
        clearedStages: Array.from(new Set([...prev.clearedStages, activeStage.id])),
        catFood: prev.catFood + finalCatFood,
        xp: prev.xp + finalXp,
        evolutionStones: prev.evolutionStones + finalStones,
        isTutorialCompleted: prev.isTutorialCompleted || activeStage.id === 'stage_tutorial_0',
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
    const legendPool = baseGachaPool.filter((u) => u.rarity === 'Legend');
    const superRarePool = baseGachaPool.filter((u) => u.rarity === 'SuperRare');
    const rarePool = baseGachaPool.filter((u) => u.rarity === 'Rare');
    const normalPool = baseGachaPool.filter((u) => u.rarity === 'Normal');

    // Probability thresholds based on gacha type
    // Nyanko Gacha: Legend = 1.0%, SuperRare = 9.0%, Rare = 25.0%, Normal = 65.0%
    // Rare Gacha: Legend = 3.0%, SuperRare = 15.0%, Rare = 35.0%, Normal = 47.0%
    const isRareGacha = gachaType === 'rare';
    const legendThreshold = isRareGacha ? 3.0 : 1.0;
    const superRareThreshold = legendThreshold + (isRareGacha ? 15.0 : 9.0);
    const rareThreshold = superRareThreshold + (isRareGacha ? 35.0 : 25.0);

    for (let i = 0; i < count; i++) {
      const roll = Math.random() * 100;
      let targetPool: CatUnitData[] = [];

      if (roll < legendThreshold && legendPool.length > 0) {
        targetPool = legendPool;
      } else if (roll < superRareThreshold && superRarePool.length > 0) {
        targetPool = superRarePool;
      } else if (roll < rareThreshold && rarePool.length > 0) {
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
            onSkipTutorial={handleSkipTutorial}
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
              isTutorialStage={activeStage.id === 'stage_tutorial_0'}
              money={money}
              maxMoney={getWorkerMaxMoney(workerCatLevel)}
              workerCatLevel={workerCatLevel}
              workerUpgradeCost={getWorkerUpgradeCost(workerCatLevel)}
              cannonChargePercent={cannonChargePercent}
              speedMultiplier={speedMultiplier}
              isAutoBattle={isAutoBattle}
              isPaused={isPaused}
              equippedUnits={allUnits.filter((u) => playerData.equippedDeck.includes(u.id))}
              playerProgress={playerData.unlockedUnits}
              unitCooldowns={unitCooldowns}
              activeWaveText={activeWaveText}
              activeBattleItems={activeBattleItems}
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

                {activeBattleItems.treasureRadar && (
                  <div className="px-3 py-1.5 rounded-xl bg-purple-950 border border-purple-500 text-purple-300 font-black text-xs animate-pulse flex items-center justify-center gap-1">
                    <span>👁️ トレジャーレーダー発動！クリア報酬100%確定＆豪華2倍！</span>
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-bold text-slate-200">
                  <p className="text-amber-300">
                    獲得猫缶: +
                    {activeBattleItems.treasureRadar
                      ? activeStage.firstClearRewardCatFood * 2 + 10
                      : activeStage.firstClearRewardCatFood}
                  </p>
                  <p className="text-amber-400">
                    獲得XP: +
                    {(activeBattleItems.treasureRadar
                      ? activeStage.firstClearRewardXp * 2 + 2000
                      : activeStage.firstClearRewardXp
                    ).toLocaleString()}{' '}
                    XP
                  </p>
                  <p className="text-cyan-400">
                    獲得素材: +{activeBattleItems.treasureRadar ? 3 : 1} 進化石
                  </p>
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
                
                // Find and set next stage
                if (activeStage) {
                    const currentIndex = STAGES.findIndex(s => s.id === activeStage.id);
                    if (currentIndex !== -1 && currentIndex < STAGES.length - 1) {
                        setActiveStage(STAGES[currentIndex + 1]);
                    }
                }

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

      {currentView === 'ITEM_SHOP' && (
        <ItemShopModal
          playerData={playerData}
          onUpdatePlayerData={(updater) => setPlayerData(updater)}
          onClose={() => setCurrentView('HOME')}
        />
      )}

      {currentView === 'CAT_FOOD_SHOP' && (
        <CatFoodShopModal
          playerData={playerData}
          onUpdatePlayerData={(updater) => setPlayerData(updater)}
          onClose={() => setCurrentView('HOME')}
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
        The-Battle-Cats2 - 本家再現ホーム画面＆AI生成
      </footer>
    </div>
  );
}
