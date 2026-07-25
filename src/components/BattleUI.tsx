import React from 'react';
import { CatUnitData, PlayerUnitProgress, StageData } from '../types';
import { Zap, Play, Pause, FastForward, Bot, ShieldAlert, ArrowUpCircle, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface BattleUIProps {
  stage: StageData;
  money: number;
  maxMoney: number;
  workerCatLevel: number;
  workerUpgradeCost: number;
  cannonChargePercent: number; // 0-100
  speedMultiplier: number;
  isAutoBattle: boolean;
  isPaused: boolean;
  equippedUnits: CatUnitData[];
  playerProgress: Record<string, PlayerUnitProgress>;
  unitCooldowns: Record<string, number>; // remaining seconds
  activeWaveText?: string | null;
  onDeployUnit: (unitId: string) => void;
  onUpgradeWorkerCat: () => void;
  onFireCannon: () => void;
  onToggleSpeed: () => void;
  onToggleAuto: () => void;
  onTogglePause: () => void;
  onRetreat: () => void;
}

export const BattleUI: React.FC<BattleUIProps> = ({
  stage,
  money,
  maxMoney,
  workerCatLevel,
  workerUpgradeCost,
  cannonChargePercent,
  speedMultiplier,
  isAutoBattle,
  isPaused,
  equippedUnits,
  playerProgress,
  unitCooldowns,
  activeWaveText,
  onDeployUnit,
  onUpgradeWorkerCat,
  onFireCannon,
  onToggleSpeed,
  onToggleAuto,
  onTogglePause,
  onRetreat,
}) => {
  return (
    <div className="w-full space-y-3 font-sans select-none relative">
      {/* Wave Alert Banner */}
      {activeWaveText && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 px-6 py-2 rounded-full bg-gradient-to-r from-rose-600 via-amber-400 to-rose-600 text-slate-950 font-black text-xs md:text-sm border-2 border-amber-300 shadow-2xl animate-bounce tracking-widest whitespace-nowrap flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-950" />
          <span>{activeWaveText}</span>
        </div>
      )}

      {/* --- Top Control & Resource Bar --- */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-900/95 p-3 backdrop-blur-md border-2 border-amber-500/40 text-white shadow-2xl">
        {/* Stage Name */}
        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-300 border border-amber-400/50">
            {stage.chapterName.split(':')[0]}
          </span>
          <h2 className="text-sm md:text-base font-black text-slate-100 truncate max-w-[160px] sm:max-w-none">
            {stage.name}
          </h2>
        </div>

        {/* Money Counter & Worker Cat */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-1.5 rounded-2xl border border-amber-500/40 shadow-inner">
          <div className="text-amber-400 font-black text-base md:text-xl flex items-center gap-1.5">
            <span className="text-xl">💰</span>
            <span>
              {Math.floor(money).toLocaleString()} / <span className="text-amber-300/70 text-xs md:text-sm">{maxMoney.toLocaleString()}</span>
            </span>
          </div>

          <button
            onClick={() => {
              if (money >= workerUpgradeCost && workerCatLevel < 8) {
                soundManager.playLevelUp();
                onUpgradeWorkerCat();
              }
            }}
            disabled={money < workerUpgradeCost || workerCatLevel >= 8}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
              workerCatLevel >= 8
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                : money >= workerUpgradeCost
                ? 'bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-md shadow-amber-500/30 animate-pulse cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>
              働きネコ Lv.{workerCatLevel}
              {workerCatLevel < 8 ? ` ($${workerUpgradeCost})` : ' (MAX)'}
            </span>
          </button>
        </div>

        {/* Right Side Toggles: Cannon, Speed, Auto, Pause */}
        <div className="flex items-center gap-2">
          {/* Cannon Button */}
          <button
            onClick={() => {
              if (cannonChargePercent >= 100) {
                soundManager.playCannon();
                onFireCannon();
              }
            }}
            disabled={cannonChargePercent < 100}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs md:text-sm transition-all ${
              cannonChargePercent >= 100
                ? 'bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 text-slate-950 shadow-lg shadow-cyan-400/60 animate-bounce cursor-pointer border-2 border-white'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <Zap className="w-4 h-4 text-cyan-950" />
            <span>
              にゃんこ砲 {cannonChargePercent >= 100 ? 'READY!' : `${Math.floor(cannonChargePercent)}%`}
            </span>
          </button>

          {/* Speed Toggle Button */}
          <button
            onClick={onToggleSpeed}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 transition-colors flex items-center gap-1 text-xs font-black cursor-pointer shadow"
            title="ゲーム速度変更"
          >
            <FastForward className="w-4 h-4" />
            <span>x{speedMultiplier}</span>
          </button>

          {/* Auto Battle Button */}
          <button
            onClick={onToggleAuto}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1 border ${
              isAutoBattle
                ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-lg shadow-emerald-500/40 cursor-pointer'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 cursor-pointer'
            }`}
            title="オート戦闘"
          >
            <Bot className="w-4 h-4" />
            <span>{isAutoBattle ? 'AUTO ON' : 'AUTO'}</span>
          </button>

          {/* Pause Button */}
          <button
            onClick={onTogglePause}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* --- Bottom Unit Deployment Deck Cards --- */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 p-2.5 rounded-2xl bg-slate-950/90 border-2 border-amber-500/40 backdrop-blur-md shadow-2xl">
        {equippedUnits.map((unit) => {
          const progress = playerProgress[unit.id] || { level: 1, currentStage: 1 };
          
          let evolutionData = unit.evolutions.stage1;
          if (progress.currentStage === 2) {
            evolutionData = unit.evolutions.stage2;
          } else if (progress.currentStage === 3 && unit.evolutions.stage3Branches) {
            const branch = progress.selectedBranch || 'branchA';
            evolutionData = unit.evolutions.stage3Branches[branch];
          }

          const cooldown = unitCooldowns[unit.id] || 0;
          const isCoolingDown = cooldown > 0;
          const canAfford = money >= unit.deployCost;
          const isReady = !isCoolingDown && canAfford;

          const rarityBorder = unit.rarity === 'Legend' ? 'border-amber-400 shadow-amber-500/20' : unit.rarity === 'SuperRare' ? 'border-purple-400 shadow-purple-500/20' : 'border-slate-700';

          return (
            <button
              key={unit.id}
              onClick={() => {
                if (isReady) {
                  soundManager.playSpawn();
                  onDeployUnit(unit.id);
                }
              }}
              disabled={!isReady}
              className={`relative flex flex-col items-center justify-between p-2 rounded-2xl transition-all duration-150 border-2 text-left ${
                isReady
                  ? 'bg-slate-900 hover:bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-500/20 cursor-pointer transform active:scale-95 ring-1 ring-amber-300'
                  : 'bg-slate-950 border-slate-800 opacity-50 cursor-not-allowed'
              } ${rarityBorder}`}
            >
              {/* Icon & Level Badge */}
              <div className="flex items-center justify-between w-full">
                <span className="text-2xl md:text-3xl filter drop-shadow">{evolutionData.icon}</span>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-slate-950 text-amber-300 border border-amber-500/40">
                  Lv.{progress.level}
                </span>
              </div>

              {/* Unit Name & Cost */}
              <div className="w-full mt-1">
                <p className="text-[11px] font-black text-slate-100 truncate">{evolutionData.name}</p>
                <p
                  className={`text-[12px] font-black ${
                    canAfford ? 'text-amber-400' : 'text-slate-500'
                  }`}
                >
                  ${unit.deployCost}
                </p>
              </div>

              {/* Cooldown Overlay */}
              {isCoolingDown && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[1px] rounded-2xl flex items-center justify-center border border-slate-800">
                  <span className="text-xs font-black text-amber-300 animate-pulse">
                    {cooldown.toFixed(1)}s
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* --- Pause Modal --- */}
      {isPaused && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border-2 border-amber-500/60 p-6 text-center space-y-4 shadow-2xl">
            <h3 className="text-xl font-black text-amber-400 flex items-center justify-center gap-2">
              <Pause className="w-5 h-5 text-amber-400" />
              一時停止中
            </h3>
            <p className="text-xs text-slate-300">戦況を確認し、作戦を再開してください。</p>

            <div className="space-y-2 pt-2">
              <button
                onClick={onTogglePause}
                className="w-full py-3 rounded-2xl font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer shadow-lg"
              >
                戦闘を再開する
              </button>
              <button
                onClick={onRetreat}
                className="w-full py-2.5 rounded-2xl font-bold bg-slate-800 hover:bg-rose-950 hover:border-rose-700 text-rose-400 border border-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-4 h-4" />
                撤退する（マップに戻る）
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
