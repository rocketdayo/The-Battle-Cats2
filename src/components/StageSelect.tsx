import React, { useState } from 'react';
import { CatUnitData, PlayerData, StageData } from '../types';
import { STAGES } from '../data/stages';
import { CAT_UNITS } from '../data/units';
import {
  Play,
  Sparkles,
  BookOpen,
  FlaskConical,
  Wand2,
  Shield,
  Plus,
  Check,
  ArrowLeft,
  MapPin,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface StageSelectProps {
  playerData: PlayerData;
  onSelectStage: (stage: StageData) => void;
  onOpenEvolution: (unit: CatUnitData) => void;
  onOpenGacha: () => void;
  onOpenCodex: () => void;
  onOpenLab: () => void;
  onOpenAiGenerator: () => void;
  onOpenDeckBuilder: () => void;
  onBackToHome: () => void;
}

export const StageSelect: React.FC<StageSelectProps> = ({
  playerData,
  onSelectStage,
  onOpenEvolution,
  onOpenGacha,
  onOpenCodex,
  onOpenLab,
  onOpenAiGenerator,
  onOpenDeckBuilder,
  onBackToHome,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<number>(1);

  const chapterStages = STAGES.filter((s) => s.chapterId === selectedChapter);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 font-sans text-slate-100 select-none pb-8">
      {/* Top Header Navigation */}
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
              <MapPin className="w-5 h-5 text-amber-400" />
              ステージ選択マップ
            </h2>
            <p className="text-[11px] text-slate-400 font-bold">
              攻略するステージを選択して日本・世界・宇宙を侵略しよう！
            </p>
          </div>
        </div>

        {/* Resources Badges */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-slate-950 border border-emerald-500/40 text-emerald-400 font-black text-xs md:text-sm">
            <span>⚡ 統率力:</span>
            <span>
              {playerData.energy} / {playerData.maxEnergy}
            </span>
          </div>

          <button
            onClick={onOpenDeckBuilder}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold text-xs transition-all cursor-pointer"
          >
            <Shield className="w-4 h-4" />
            <span>編成変更</span>
          </button>
        </div>
      </div>

      {/* Chapter Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {[
          { id: 1, name: '第1章: 日本侵攻編' },
          { id: 2, name: '第2章: 宇宙エイリアン編' },
          { id: 3, name: '第3章: 神々との対決編' },
        ].map((ch) => (
          <button
            key={ch.id}
            onClick={() => {
              soundManager.playClick();
              setSelectedChapter(ch.id);
            }}
            className={`px-5 py-2.5 rounded-2xl text-xs md:text-sm font-black transition-all cursor-pointer ${
              selectedChapter === ch.id
                ? 'bg-amber-500 text-slate-950 shadow-xl shadow-amber-500/20 scale-105 border-2 border-amber-300'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {ch.name}
          </button>
        ))}
      </div>

      {/* Stage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chapterStages.map((stage) => {
          const isCleared = playerData.clearedStages.includes(stage.id);
          const hasEnergy = playerData.energy >= stage.energyCost;

          return (
            <div
              key={stage.id}
              className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-4 shadow-xl ${
                isCleared
                  ? 'bg-slate-900/90 border-emerald-500/40'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                    STAGE {stage.stageNumber}
                  </span>
                  {isCleared && (
                    <span className="flex items-center gap-1 text-[11px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      <Check className="w-3 h-3" /> CLEAR
                    </span>
                  )}
                </div>

                <h3 className="text-base font-black text-slate-100 mt-2">{stage.name}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{stage.description}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="text-xs font-bold text-slate-400">
                  <span>消費統率力: </span>
                  <span className={hasEnergy ? 'text-cyan-400' : 'text-rose-400'}>
                    ⚡ {stage.energyCost}
                  </span>
                </div>

                <button
                  onClick={() => {
                    if (hasEnergy) {
                      soundManager.playSpawn();
                      onSelectStage(stage);
                    }
                  }}
                  disabled={!hasEnergy}
                  className={`px-5 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 ${
                    hasEnergy
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 shadow-lg shadow-amber-500/20 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>出撃開始</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Deck Preview Strip */}
      <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-amber-400 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            出撃予定デッキ ({playerData.equippedDeck.length}体)
          </h3>
          <button
            onClick={onOpenDeckBuilder}
            className="text-xs font-black text-amber-300 hover:underline cursor-pointer"
          >
            デッキを編集する ➔
          </button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {playerData.equippedDeck.map((unitId) => {
            const unit = CAT_UNITS.find((u) => u.id === unitId);
            if (!unit) return null;
            const progress = playerData.unlockedUnits[unitId];

            let displayData = unit.evolutions.stage1;
            if (progress?.currentStage === 2) {
              displayData = unit.evolutions.stage2;
            } else if (progress?.currentStage === 3 && unit.evolutions.stage3Branches) {
              const branch = progress.selectedBranch || 'branchA';
              displayData = unit.evolutions.stage3Branches[branch];
            }

            return (
              <div
                key={unitId}
                className="flex flex-col items-center p-2 rounded-xl bg-slate-950 border border-slate-800 min-w-[64px]"
              >
                <span className="text-2xl">{displayData.icon}</span>
                <span className="text-[9px] font-black text-slate-300 truncate max-w-[56px]">
                  {displayData.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
