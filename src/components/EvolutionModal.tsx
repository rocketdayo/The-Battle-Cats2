import React, { useState } from 'react';
import { CatUnitData, PlayerUnitProgress, PassiveSkill } from '../types';
import { PASSIVE_SKILLS } from '../data/units';
import { ArrowUpRight, Zap, Sparkles, Shield, ChevronRight, Check, Dna } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { calculateUnitStats, getUnitLevelUpCost } from '../utils/unitCalculator';

interface EvolutionModalProps {
  unit: CatUnitData;
  progress: PlayerUnitProgress;
  playerXp: number;
  playerStones: number;
  onClose: () => void;
  onLevelUp: (unitId: string, costXp: number) => void;
  onEvolveStage2: (unitId: string, costXp: number) => void;
  onSelectBranchStage3: (unitId: string, branch: 'branchA' | 'branchB', costXp: number, stonesNeeded: number) => void;
  onEquipSkill: (unitId: string, skillId: string) => void;
}

export const EvolutionModal: React.FC<EvolutionModalProps> = ({
  unit,
  progress,
  playerXp,
  playerStones,
  onClose,
  onLevelUp,
  onEvolveStage2,
  onSelectBranchStage3,
  onEquipSkill,
}) => {
  const [activeTab, setActiveTab] = useState<'EVOLUTION' | 'SKILLS'>('EVOLUTION');

  // Unified levelup cost formula
  const levelUpCost = getUnitLevelUpCost(progress.level);
  const canLevelUp = playerXp >= levelUpCost;

  const currentStats = calculateUnitStats(unit, progress);

  const stage1Data = unit.evolutions.stage1;
  const stage2Data = unit.evolutions.stage2;
  const stage3Branches = unit.evolutions.stage3Branches;

  const canEvolveStage2 = progress.level >= 10 && progress.currentStage === 1 && playerXp >= stage2Data.evolutionCostXp;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl filter drop-shadow">{currentStats.displayEvolution.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-amber-400">{currentStats.displayEvolution.name}</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/30">
                  第{progress.currentStage}形態
                </span>
              </div>
              <p className="text-xs text-slate-400">形態進化＆遺伝子パッシブ強化</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('EVOLUTION')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'EVOLUTION'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              進化ツリー
            </button>
            <button
              onClick={() => setActiveTab('SKILLS')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'SKILLS'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Dna className="w-3.5 h-3.5" />
              <span>遺伝子パッシブ</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold cursor-pointer"
            >
              ✕ 閉じる
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* XP & Resources Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-950 p-3 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-amber-400">Lv.{progress.level}</span>
              <span className="text-xs text-slate-400">| HP: <strong className="text-white">{currentStats.hp.toLocaleString()}</strong></span>
              <span className="text-xs text-slate-400">| ATK: <strong className="text-amber-300">{currentStats.attack.toLocaleString()}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="text-amber-300">保有XP: {playerXp.toLocaleString()} XP</span>
              <span className="text-cyan-400">進化石: {playerStones} 個</span>
            </div>
          </div>

          {activeTab === 'EVOLUTION' ? (
            <div className="space-y-6">
              {/* --- Level Up Action Box --- */}
              <div className="flex items-center justify-between rounded-2xl bg-slate-800/60 p-4 border border-slate-700">
                <div>
                  <h3 className="text-sm font-black text-slate-200">レベルアップ</h3>
                  <p className="text-xs text-slate-400">HP・攻撃力が約10%ずつ上昇します。</p>
                </div>

                <button
                  onClick={() => {
                    if (canLevelUp) {
                      soundManager.playLevelUp();
                      onLevelUp(unit.id, levelUpCost);
                    }
                  }}
                  disabled={!canLevelUp}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                    canLevelUp
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Lv.Up ({levelUpCost.toLocaleString()} XP)
                </button>
              </div>

              {/* --- Evolution Tree Path --- */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">進化形態一覧</h3>

                {/* Stage 1 Card */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    progress.currentStage === 1
                      ? 'bg-slate-800 border-amber-400 shadow-md ring-1 ring-amber-400'
                      : 'bg-slate-950/60 border-slate-800 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{stage1Data.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-400">第1形態</span>
                          <h4 className="text-sm font-extrabold text-slate-100">{stage1Data.name}</h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{stage1Data.description}</p>
                      </div>
                    </div>
                    {progress.currentStage === 1 && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black border border-amber-500/30">
                        現在の形態
                      </span>
                    )}
                  </div>
                </div>

                {/* Stage 2 Card */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    progress.currentStage === 2
                      ? 'bg-slate-800 border-amber-400 shadow-md ring-1 ring-amber-400'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{stage2Data.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-amber-400">第2形態</span>
                          <h4 className="text-sm font-extrabold text-slate-100">{stage2Data.name}</h4>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{stage2Data.description}</p>
                        {stage2Data.specialTrait && (
                          <span className="inline-block mt-2 px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-bold">
                            特性: {stage2Data.specialTrait}
                          </span>
                        )}
                      </div>
                    </div>

                    {progress.currentStage === 1 && (
                      <button
                        onClick={() => {
                          if (canEvolveStage2) {
                            soundManager.playLevelUp();
                            onEvolveStage2(unit.id, stage2Data.evolutionCostXp);
                          }
                        }}
                        disabled={!canEvolveStage2}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          canEvolveStage2
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        第2形態へ進化 ({stage2Data.evolutionCostXp} XP / Lv.10解禁)
                      </button>
                    )}

                    {progress.currentStage === 2 && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-black border border-amber-500/30">
                        現在の形態
                      </span>
                    )}
                  </div>
                </div>

                {/* Stage 3 Branching Evolution Paths */}
                {stage3Branches && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-xs font-black text-cyan-400">
                      <Sparkles className="w-4 h-4" />
                      <span>第3形態 分岐進化（分岐選択可能）</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Branch A */}
                      {renderBranchCard(
                        'branchA',
                        stage3Branches.branchA,
                        progress,
                        unit.id,
                        playerXp,
                        playerStones,
                        onSelectBranchStage3
                      )}

                      {/* Branch B */}
                      {renderBranchCard(
                        'branchB',
                        stage3Branches.branchB,
                        progress,
                        unit.id,
                        playerXp,
                        playerStones,
                        onSelectBranchStage3
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* --- Passive Skills Tab --- */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-cyan-950/70 border border-cyan-500/50 space-y-1.5 shadow">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                    <Dna className="w-4 h-4 text-cyan-400" />
                    <span>遺伝子パッシブ装着ステータス (最大2個)</span>
                  </h3>
                  <span className="text-[10px] font-bold text-amber-300">
                    現在適用中: {currentStats.equippedPassives.length}/2個
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  装着すると、このにゃんこの「HP」「攻撃力」「速度」「コスト」等にボーナス効果が即座に反映されます！
                </p>
                {currentStats.equippedPassives.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentStats.equippedPassives.map((sk) => (
                      <span
                        key={sk.id}
                        className="px-2.5 py-0.5 rounded-full bg-cyan-900 border border-cyan-400 text-cyan-200 text-[10px] font-black"
                      >
                        {sk.icon} {sk.name} ({sk.description})
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PASSIVE_SKILLS.map((skill) => {
                  const isEquipped = progress.equippedSkills.includes(skill.id);
                  return (
                    <div
                      key={skill.id}
                      onClick={() => {
                        soundManager.playClick();
                        onEquipSkill(unit.id, skill.id);
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isEquipped
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400'
                          : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl filter drop-shadow">{skill.icon}</span>
                        <div>
                          <p className="text-xs font-black text-white">{skill.name}</p>
                          <p className="text-[10px] text-amber-300 font-extrabold">{skill.description}</p>
                        </div>
                      </div>

                      {isEquipped ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow">
                          <Check className="w-3.5 h-3.5" />
                          装着中
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-lg bg-slate-700 text-slate-300 text-[10px] font-bold">
                          未装着
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function renderBranchCard(
  branchKey: 'branchA' | 'branchB',
  branchData: any,
  progress: PlayerUnitProgress,
  unitId: string,
  playerXp: number,
  playerStones: number,
  onSelectBranch: (unitId: string, branch: 'branchA' | 'branchB', costXp: number, stonesNeeded: number) => void
) {
  const isSelected = progress.currentStage === 3 && progress.selectedBranch === branchKey;
  const stonesNeeded = branchData.evolutionStonesNeeded || 3;
  const canEvolveBranch =
    progress.level >= 20 &&
    progress.currentStage >= 2 &&
    playerXp >= branchData.evolutionCostXp &&
    playerStones >= stonesNeeded;

  return (
    <div
      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
        isSelected
          ? 'bg-cyan-950/40 border-cyan-400 shadow-lg ring-1 ring-cyan-400'
          : 'bg-slate-950/80 border-slate-800'
      }`}
    >
      <div>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{branchData.icon}</span>
          <div>
            <h4 className="text-xs font-extrabold text-cyan-300">{branchData.name}</h4>
            <p className="text-[10px] text-slate-400">{branchData.title}</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 mt-2">{branchData.description}</p>

        {branchData.specialTrait && (
          <div className="mt-2 text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-1 rounded">
            特性: {branchData.specialTrait}
          </div>
        )}
      </div>

      <div>
        {isSelected ? (
          <span className="block text-center py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 text-xs font-black border border-cyan-500/40">
            選択中の究極形態
          </span>
        ) : (
          <button
            onClick={() => {
              if (canEvolveBranch) {
                soundManager.playVictory();
                onSelectBranch(unitId, branchKey, branchData.evolutionCostXp, stonesNeeded);
              }
            }}
            disabled={!canEvolveBranch}
            className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
              canEvolveBranch
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md hover:brightness-110 cursor-pointer'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            進化選択 ({branchData.evolutionCostXp} XP / 石{stonesNeeded}個 / Lv.20解禁)
          </button>
        )}
      </div>
    </div>
  );
}
