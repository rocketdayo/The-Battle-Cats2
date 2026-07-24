import React, { useState } from 'react';
import { CatUnitData } from '../types';
import { CAT_UNITS } from '../data/units';
import { Sparkles, Dices, Award, Gift, ArrowRight } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface GachaModalProps {
  catFood: number;
  unlockedUnitIds: string[];
  onClose: () => void;
  onPerformGacha: (cost: number, pullCount: number) => { pulledUnits: CatUnitData[]; rewardsXp: number; rewardsStones: number };
}

export const GachaModal: React.FC<GachaModalProps> = ({
  catFood,
  unlockedUnitIds,
  onClose,
  onPerformGacha,
}) => {
  const [isSummoning, setIsSummoning] = useState(false);
  const [pullResults, setPullResults] = useState<{ units: CatUnitData[]; xp: number; stones: number } | null>(null);

  const SINGLE_COST = 100;
  const TEN_COST = 900; // Discounted!

  const handleSummon = (count: number, cost: number) => {
    if (catFood < cost) return;

    soundManager.playGacha();
    setIsSummoning(true);
    setPullResults(null);

    setTimeout(() => {
      const res = onPerformGacha(cost, count);
      setPullResults({
        units: res.pulledUnits,
        xp: res.rewardsXp,
        stones: res.rewardsStones,
      });
      setIsSummoning(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border-2 border-amber-500 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 font-black flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-slate-950" />
            <h2 className="text-lg">ニャンコ神社・神秘のガチャ</h2>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-slate-950/30 hover:bg-slate-950/50 text-white text-xs font-bold"
          >
            ✕ 閉じる
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-center">
          {/* Cat Food Display */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950 border border-amber-500/40 text-amber-400 font-black text-sm">
            <span>🐟 猫缶 (Cat Food):</span>
            <span className="text-lg">{catFood.toLocaleString()}</span>
          </div>

          {/* Shrine Shrine Visual Graphic */}
          <div className="relative py-8 px-4 rounded-3xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
            <div className="text-6xl animate-bounce mb-2">⛩️🐱</div>
            <h3 className="text-base font-extrabold text-amber-300">伝説のにゃんこを引き当てろ！</h3>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              重復したキャラクターは強化用【XP】や【進化石】に自動変換されます。
            </p>

            {isSummoning && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
                <p className="text-sm font-black text-amber-300 animate-pulse">ニャンコ神の宣託を受信中...</p>
              </div>
            )}
          </div>

          {/* Pull Results Display */}
          {pullResults && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3 animate-fadeIn">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">召喚結果</h4>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {pullResults.units.map((u, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center p-2.5 rounded-xl bg-slate-800 border border-slate-700 min-w-[80px]"
                  >
                    <span className="text-3xl">{u.evolutions.stage1.icon}</span>
                    <span className="text-[11px] font-bold text-slate-200 mt-1">{u.baseName}</span>
                    <span className="text-[9px] font-black text-amber-400">{u.rarity}</span>
                  </div>
                ))}
              </div>

              {(pullResults.xp > 0 || pullResults.stones > 0) && (
                <div className="text-xs text-slate-300 font-bold bg-slate-900 p-2 rounded-xl">
                  重複ボーナス獲得: +{pullResults.xp} XP / +{pullResults.stones} 進化石
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleSummon(1, SINGLE_COST)}
              disabled={catFood < SINGLE_COST || isSummoning}
              className={`py-3.5 px-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                catFood >= SINGLE_COST && !isSummoning
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Dices className="w-5 h-5" />
              1回ガチャ ($100 猫缶)
            </button>

            <button
              onClick={() => handleSummon(10, TEN_COST)}
              disabled={catFood < TEN_COST || isSummoning}
              className={`py-3.5 px-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                catFood >= TEN_COST && !isSummoning
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 shadow-lg cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              お得な10連ガチャ ($900 猫缶)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
