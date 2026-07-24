import React, { useState } from 'react';
import { CatUnitData, PlayerUnitProgress } from '../types';
import { CAT_UNITS } from '../data/units';
import { BookOpen, Shield, Zap, Sparkles, ChevronRight } from 'lucide-react';

interface CodexModalProps {
  playerProgress: Record<string, PlayerUnitProgress>;
  onClose: () => void;
}

export const CodexModal: React.FC<CodexModalProps> = ({ playerProgress, onClose }) => {
  const [selectedUnit, setSelectedUnit] = useState<CatUnitData>(CAT_UNITS[0]);
  const [previewStage, setPreviewStage] = useState<1 | 2 | 3>(1);
  const [previewBranch, setPreviewBranch] = useState<'branchA' | 'branchB'>('branchA');

  const progress = playerProgress[selectedUnit.id];
  const isUnlocked = !!progress;

  let displayData = selectedUnit.evolutions.stage1;
  if (previewStage === 2) {
    displayData = selectedUnit.evolutions.stage2;
  } else if (previewStage === 3 && selectedUnit.evolutions.stage3Branches) {
    displayData = selectedUnit.evolutions.stage3Branches[previewBranch];
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-black">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-base">にゃんこ図鑑 (Character Codex)</h2>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
          >
            ✕ 閉じる
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 flex-1 overflow-hidden">
          {/* Left List */}
          <div className="p-3 border-r border-slate-800 overflow-y-auto space-y-2 bg-slate-950/40">
            {CAT_UNITS.map((unit) => {
              const unl = !!playerProgress[unit.id];
              return (
                <button
                  key={unit.id}
                  onClick={() => {
                    setSelectedUnit(unit);
                    setPreviewStage(1);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border text-left transition-all ${
                    selectedUnit.id === unit.id
                      ? 'bg-amber-500/10 border-amber-400 text-amber-300'
                      : unl
                      ? 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:bg-slate-800'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-600'
                  }`}
                >
                  <span className="text-2xl">{unl ? unit.evolutions.stage1.icon : '🔒'}</span>
                  <div>
                    <p className="text-xs font-extrabold">{unl ? unit.baseName : '？？？？'}</p>
                    <p className="text-[10px] text-slate-500">{unit.rarity}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Detail Pane */}
          <div className="p-6 md:col-span-2 overflow-y-auto space-y-5">
            {isUnlocked ? (
              <>
                {/* Stage Form Selector */}
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <button
                    onClick={() => setPreviewStage(1)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      previewStage === 1 ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    第1形態
                  </button>
                  <button
                    onClick={() => setPreviewStage(2)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      previewStage === 2 ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    第2形態
                  </button>
                  {selectedUnit.evolutions.stage3Branches && (
                    <button
                      onClick={() => setPreviewStage(3)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        previewStage === 3 ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      第3形態
                    </button>
                  )}
                </div>

                {/* Branch selector if stage 3 */}
                {previewStage === 3 && selectedUnit.evolutions.stage3Branches && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewBranch('branchA')}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold border transition-all ${
                        previewBranch === 'branchA'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      分岐A: {selectedUnit.evolutions.stage3Branches.branchA.name}
                    </button>
                    <button
                      onClick={() => setPreviewBranch('branchB')}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold border transition-all ${
                        previewBranch === 'branchB'
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      分岐B: {selectedUnit.evolutions.stage3Branches.branchB.name}
                    </button>
                  </div>
                )}

                {/* Card Character Showcase */}
                <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 text-center space-y-3">
                  <span className="text-6xl inline-block filter drop-shadow-lg animate-pulse">
                    {displayData.icon}
                  </span>
                  <div>
                    <h3 className="text-lg font-black text-amber-300">{displayData.name}</h3>
                    <p className="text-xs text-amber-400/80 font-bold">{displayData.title}</p>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                    {displayData.description}
                  </p>
                </div>

                {/* Stats Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold">
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="block text-[10px] text-slate-400">コスト</span>
                    <span className="text-amber-400">${selectedUnit.deployCost}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="block text-[10px] text-slate-400">基本HP</span>
                    <span className="text-emerald-400">
                      {Math.floor(selectedUnit.baseHp * displayData.hpMultiplier)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="block text-[10px] text-slate-400">基本攻撃力</span>
                    <span className="text-rose-400">
                      {Math.floor(selectedUnit.baseAttack * displayData.attackMultiplier)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="block text-[10px] text-slate-400">射程距離</span>
                    <span className="text-cyan-400">{selectedUnit.attackRange}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <span className="text-5xl mb-2">🔒</span>
                <p className="text-sm font-black">このキャラクターは未解放です</p>
                <p className="text-xs mt-1">ガチャで引き当てることで図鑑情報が解禁されます。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
