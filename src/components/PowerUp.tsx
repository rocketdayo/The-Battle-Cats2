import React, { useState } from 'react';
import { CatUnitData, PlayerData } from '../types';
import { CAT_UNITS } from '../data/units';
import { soundManager } from '../utils/audio';
import { calculateUnitStats, getUnitLevelUpCost } from '../utils/unitCalculator';
import {
  Zap,
  ArrowLeft,
  Sparkles,
  Shield,
  Plus,
  ChevronRight,
  TrendingUp,
  Layers,
  Dna,
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
              パワーアップ (能力強化＆形態進化)
            </h2>
            <p className="text-[11px] text-slate-400 font-bold">
              XPを使ってレベルアップ！ Lv.10・Lv.20で新しい姿（形態）へ劇的に変化進化！
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

              const stats = calculateUnitStats(unit, progress);

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
                    <span className="text-3xl filter drop-shadow">{stats.displayEvolution.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-black text-white">{stats.displayEvolution.name}</h4>
                        {progress.currentStage > 1 && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black border border-amber-500/30">
                            第{progress.currentStage}形態
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-amber-400 font-extrabold flex items-center gap-1 mt-0.5">
                        <span>Lv.{progress.level}</span>
                        {stats.equippedPassives.length > 0 && (
                          <span className="text-cyan-300 flex items-center gap-0.5 bg-cyan-950 px-1 rounded">
                            <Dna className="w-2.5 h-2.5" />
                            遺伝子{stats.equippedPassives.length}個
                          </span>
                        )}
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
              const currentStats = calculateUnitStats(selectedUnit, selectedProgress);

              // Next level stats calculation
              const nextLevelProgress = { ...selectedProgress, level: selectedProgress.level + 1 };
              const nextStats = calculateUnitStats(selectedUnit, nextLevelProgress);

              // Unified level up cost
              const levelUpCostXp = getUnitLevelUpCost(selectedProgress.level);
              const canAfford = playerData.xp >= levelUpCostXp;

              return (
                <div className="space-y-5">
                  {/* Unit Card Header with Form Badge */}
                  <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-3xl border border-slate-800 relative overflow-hidden">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-400 flex items-center justify-center text-5xl shadow-inner relative">
                      {currentStats.displayEvolution.icon}
                      <span className="absolute bottom-1 right-1 text-[9px] font-black bg-amber-500 text-slate-950 px-1 rounded">
                        第{selectedProgress.currentStage}形態
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                          {selectedUnit.rarity}
                        </span>
                        <span className="text-[10px] font-black text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                          {currentStats.displayEvolution.title || `第${selectedProgress.currentStage}形態`}
                        </span>
                      </div>

                      <h3 className="text-xl font-black text-white">
                        {currentStats.displayEvolution.name}
                      </h3>

                      <p className="text-xs text-slate-400 leading-tight">
                        {currentStats.displayEvolution.description}
                      </p>

                      <p className="text-xs text-amber-300 font-extrabold flex items-center gap-2 pt-1">
                        <span>現在のレベル: Lv.{selectedProgress.level}</span>
                      </p>
                    </div>
                  </div>

                  {/* Level Up Stat Comparison */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        ステータス詳細 (Lv.{selectedProgress.level} ➔ Lv.{selectedProgress.level + 1})
                      </h4>
                      <span className="text-[10px] text-amber-400 font-bold">
                        1Lvごとに基本性能約10%UP
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">❤️ 体力 (HP)</span>
                        <div className="flex items-center gap-1">
                          <span className="text-white">{currentStats.hp.toLocaleString()}</span>
                          <span className="text-emerald-400">➔ {nextStats.hp.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">⚔️ 攻撃力 (ATK)</span>
                        <div className="flex items-center gap-1">
                          <span className="text-white">{currentStats.attack.toLocaleString()}</span>
                          <span className="text-amber-400">➔ {nextStats.attack.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">💰 出撃コスト</span>
                        <span className="text-amber-300">{currentStats.deployCost} 円</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">⚡ 移動速度</span>
                        <span className="text-cyan-300">{currentStats.movementSpeed}</span>
                      </div>
                    </div>

                    {/* Applied Passive Gene Bonuses Display Section */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                      <span className="text-[11px] font-black text-cyan-300 flex items-center gap-1">
                        <Dna className="w-3.5 h-3.5 text-cyan-400" />
                        装着中の遺伝子パッシブ効果（自動反映中）
                      </span>

                      {currentStats.equippedPassives.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {currentStats.equippedPassives.map((sk) => (
                            <span
                              key={sk.id}
                              className="px-2.5 py-1 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-200 text-[10px] font-bold flex items-center gap-1"
                            >
                              <span>{sk.icon}</span>
                              <span>{sk.name}</span>
                              <span className="text-amber-300">({sk.description})</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-500">
                          遺伝子パッシブは未装着です。「進化ツリー」のパッシブタブから最大2個装着できます。
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-1">
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
                      <span>形態変化＆進化ツリー詳細を見る</span>
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

