import React, { useState } from 'react';
import { CatUnitData, PlayerData } from '../types';
import { CAT_UNITS } from '../data/units';
import { soundManager } from '../utils/audio';
import {
  Zap,
  ArrowLeft,
  Sparkles,
  Shield,
  Plus,
  ChevronRight,
  TrendingUp,
  Layers,
} from 'lucide-react';

interface PowerUpProps {
  playerData: PlayerData;
  onLevelUpUnit: (unitId: string, costXp: number) => void;
  onOpenEvolution: (unit: CatUnitData) => void;
  onBackToHome: () => void;
}

export const PowerUp: React.FC<PowerUpProps> = ({
  playerData,
  onLevelUpUnit,
  onOpenEvolution,
  onBackToHome,
}) => {
  const allUnits = [...CAT_UNITS, ...(playerData.customUnits || [])];

  const [selectedUnitId, setSelectedUnitId] = useState<string>(
    Object.keys(playerData.unlockedUnits)[0] || 'u_chibi'
  );

  const selectedUnit = allUnits.find((u) => u.id === selectedUnitId);
  const selectedProgress = playerData.unlockedUnits[selectedUnitId];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 font-sans text-slate-100 select-none pb-8">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-slate-900/90 border-2 border-amber-500/60 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onBackToHome();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ネコ基地へ</span>
          </button>

          <div>
            <h2 className="text-lg md:text-xl font-black text-amber-400 tracking-wide flex items-center gap-2">
              <Zap className="w-5 h-5" />
              パワーアップ (能力強化＆進化)
            </h2>
            <p className="text-[11px] text-slate-400 font-bold">
              XPを使ってキャラクターを強化・レベル10で強力な姿へ進化させよう！
            </p>
          </div>
        </div>

        {/* XP Badge */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950 border border-cyan-500/50 text-cyan-300 font-black text-sm">
          <span>✨ 所持 XP:</span>
          <span className="text-base text-white">{playerData.xp.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left: Unlocked Cats List */}
        <div className="md:col-span-5 p-5 rounded-3xl bg-slate-900/90 border-2 border-slate-800 shadow-2xl space-y-3">
          <h3 className="text-sm font-black text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
            <Layers className="w-4 h-4" />
            強化するにゃんこを選択
          </h3>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {Object.keys(playerData.unlockedUnits).map((unitId) => {
              const unit = allUnits.find((u) => u.id === unitId);
              if (!unit) return null;

              const progress = playerData.unlockedUnits[unitId];
              const isSelected = selectedUnitId === unitId;

              let displayData = unit.evolutions.stage1;
              if (progress.currentStage === 2) {
                displayData = unit.evolutions.stage2;
              } else if (progress.currentStage === 3 && unit.evolutions.stage3Branches) {
                const branch = progress.selectedBranch || 'branchA';
                displayData = unit.evolutions.stage3Branches[branch];
              }

              return (
                <div
                  key={unitId}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedUnitId(unitId);
                  }}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-950/70 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl filter drop-shadow">{displayData.icon}</span>
                    <div>
                      <h4 className="text-xs font-black text-white">{displayData.name}</h4>
                      <p className="text-[10px] text-amber-400 font-extrabold">
                        Lv.{progress.level} (第{progress.currentStage}形態)
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Power Up Inspector */}
        <div className="md:col-span-7 p-6 rounded-3xl bg-slate-900/90 border-2 border-slate-800 shadow-2xl space-y-5 flex flex-col justify-between">
          {selectedUnit && selectedProgress ? (
            (() => {
              let displayEvolution = selectedUnit.evolutions.stage1;
              if (selectedProgress.currentStage === 2) {
                displayEvolution = selectedUnit.evolutions.stage2;
              } else if (
                selectedProgress.currentStage === 3 &&
                selectedUnit.evolutions.stage3Branches
              ) {
                const branch = selectedProgress.selectedBranch || 'branchA';
                displayEvolution = selectedUnit.evolutions.stage3Branches[branch];
              }

              const levelMult = Math.pow(1.1, selectedProgress.level - 1);
              const hp = Math.floor(
                selectedUnit.baseHp * displayEvolution.hpMultiplier * levelMult
              );
              const atk = Math.floor(
                selectedUnit.baseAttack * displayEvolution.attackMultiplier * levelMult
              );

              // Next level stat preview
              const nextLevelMult = Math.pow(1.1, selectedProgress.level);
              const nextHp = Math.floor(
                selectedUnit.baseHp * displayEvolution.hpMultiplier * nextLevelMult
              );
              const nextAtk = Math.floor(
                selectedUnit.baseAttack * displayEvolution.attackMultiplier * nextLevelMult
              );

              const levelUpCostXp = Math.floor(1000 * Math.pow(1.25, selectedProgress.level - 1));
              const canAfford = playerData.xp >= levelUpCostXp;

              return (
                <div className="space-y-5">
                  {/* Unit Card Header */}
                  <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-3xl border border-slate-800">
                    <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-amber-400 flex items-center justify-center text-5xl shadow-inner">
                      {displayEvolution.icon}
                    </div>
                    <div>
                      <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        {selectedUnit.rarity}
                      </span>
                      <h3 className="text-xl font-black text-white mt-1">
                        {displayEvolution.name}
                      </h3>
                      <p className="text-xs text-amber-300 font-extrabold mt-0.5">
                        Lv.{selectedProgress.level} (第{selectedProgress.currentStage}形態)
                      </p>
                    </div>
                  </div>

                  {/* Level Up Stat Increase Comparison */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      レベルアップ上昇予測 (Lv.{selectedProgress.level} ➔ Lv.{selectedProgress.level + 1})
                    </h4>

                    <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">❤️ 体力</span>
                        <div className="flex items-center gap-1">
                          <span className="text-white">{hp}</span>
                          <span className="text-emerald-400">➔ {nextHp}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">⚔️ 攻撃力</span>
                        <div className="flex items-center gap-1">
                          <span className="text-white">{atk}</span>
                          <span className="text-amber-400">➔ {nextAtk}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-2">
                    {/* Level Up Button */}
                    <button
                      onClick={() => {
                        if (canAfford) {
                          soundManager.playLevelUp();
                          onLevelUpUnit(selectedUnit.id, levelUpCostXp);
                        }
                      }}
                      disabled={!canAfford}
                      className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <Zap className="w-5 h-5 fill-current" />
                      <span>
                        レベルアップ! (必要XP: {levelUpCostXp.toLocaleString()} XP)
                      </span>
                    </button>

                    {/* Open Evolution Tree Button */}
                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onOpenEvolution(selectedUnit);
                      }}
                      className="w-full py-3 rounded-2xl font-black bg-purple-900/80 hover:bg-purple-800 text-purple-200 border-2 border-purple-500/50 text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>進化ツリー＆分岐進化詳細を開く</span>
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              強化するユニットを左側から選択してください
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
