import React, { useState, useEffect } from 'react';
import { CatUnitData } from '../types';
import { Sparkles, Dices, Crown, Zap, ArrowRight, Percent } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface GachaModalProps {
  catFood: number;
  unlockedUnitIds: string[];
  allUnits: CatUnitData[];
  initialTab?: 'nyanko' | 'rare';
  onClose: () => void;
  onPerformGacha: (
    cost: number,
    pullCount: number,
    gachaType?: 'nyanko' | 'rare'
  ) => { pulledUnits: CatUnitData[]; rewardsXp: number; rewardsStones: number };
}

export const GachaModal: React.FC<GachaModalProps> = ({
  catFood,
  unlockedUnitIds,
  allUnits,
  initialTab = 'nyanko',
  onClose,
  onPerformGacha,
}) => {
  const [selectedTab, setSelectedTab] = useState<'nyanko' | 'rare'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setSelectedTab(initialTab);
    }
  }, [initialTab]);
  const [pullResults, setPullResults] = useState<{ units: CatUnitData[]; xp: number; stones: number } | null>(null);
  const [cutsceneStage, setCutsceneStage] = useState<'IDLE' | 'CHARGING' | 'CAPSULE_READY' | 'REVEAL_SINGLE' | 'DONE'>('IDLE');
  const [highestRarity, setHighestRarity] = useState<'Normal' | 'Rare' | 'SuperRare' | 'Legend'>('Normal');
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0);

  const singleCost = selectedTab === 'nyanko' ? 50 : 100;
  const tenCost = selectedTab === 'nyanko' ? 450 : 900;

  const handleStartSummon = (count: number, cost: number) => {
    if (catFood < cost) return;

    soundManager.playGacha();
    const res = onPerformGacha(cost, count, selectedTab);

    // Determine highest pulled rarity for teaser aura
    let maxRarity: 'Normal' | 'Rare' | 'SuperRare' | 'Legend' = 'Normal';
    for (const u of res.pulledUnits) {
      if (u.rarity === 'Legend') maxRarity = 'Legend';
      else if (u.rarity === 'SuperRare' && maxRarity !== 'Legend') maxRarity = 'SuperRare';
      else if (u.rarity === 'Rare' && maxRarity === 'Normal') maxRarity = 'Rare';
    }

    setHighestRarity(maxRarity);
    setPullResults({
      units: res.pulledUnits,
      xp: res.rewardsXp,
      stones: res.rewardsStones,
    });

    // Start Cutscene
    setCutsceneStage('CHARGING');
    setTimeout(() => {
      setCutsceneStage('CAPSULE_READY');
    }, 1000);
  };

  const handleTapCapsule = () => {
    soundManager.playVictory();
    setCutsceneStage('REVEAL_SINGLE');
    setCurrentRevealIndex(0);
  };

  const handleNextUnit = () => {
    soundManager.playClick();
    if (pullResults && currentRevealIndex < pullResults.units.length - 1) {
      setCurrentRevealIndex((prev) => prev + 1);
    } else {
      setCutsceneStage('DONE');
    }
  };

  const handleSkipAll = () => {
    soundManager.playClick();
    setCutsceneStage('DONE');
  };

  const currentUnit = pullResults?.units[currentRevealIndex];
  const totalUnits = pullResults?.units.length || 0;
  const isNewUnit = currentUnit ? !unlockedUnitIds.includes(currentUnit.id) : false;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
      {/* --- CUTSCENE / SINGLE REVEAL OVERLAY --- */}
      {cutsceneStage !== 'IDLE' && cutsceneStage !== 'DONE' && (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-purple-950 via-slate-950 to-purple-950 flex flex-col items-center justify-between p-4 md:p-8 overflow-hidden select-none">
          {/* Background Ambient Aura */}
          <div
            className={`absolute inset-0 opacity-40 blur-3xl transition-all duration-1000 ${
              highestRarity === 'Legend'
                ? 'bg-gradient-to-r from-pink-500 via-amber-400 to-cyan-500 animate-pulse'
                : highestRarity === 'SuperRare'
                ? 'bg-amber-500'
                : 'bg-cyan-600'
            }`}
          />

          {/* Stage 1: Summoning Portal Charging */}
          {cutsceneStage === 'CHARGING' && (
            <div className="my-auto relative z-10 flex flex-col items-center space-y-6 text-center animate-fadeIn">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-amber-400 border-dashed animate-spin" />
                <div className="text-7xl animate-bounce">⛩️</div>
              </div>
              <h2 className="text-2xl font-black text-amber-300 animate-pulse tracking-wider">
                ニャンコ神殿の封印が開放される…！
              </h2>
            </div>
          )}

          {/* Stage 2: Interactive Capsule Drop */}
          {cutsceneStage === 'CAPSULE_READY' && (
            <div className="my-auto relative z-10 flex flex-col items-center space-y-8 text-center animate-fadeIn">
              {/* Rarity Teaser Banner */}
              {highestRarity === 'Legend' ? (
                <div className="px-6 py-2 rounded-full bg-gradient-to-r from-pink-500 via-amber-400 to-cyan-500 text-slate-950 font-black text-sm tracking-widest shadow-2xl animate-bounce">
                  ⚡ 虹色神光発生！ 超激レア（伝説）降臨確定！？ ⚡
                </div>
              ) : highestRarity === 'SuperRare' ? (
                <div className="px-6 py-2 rounded-full bg-amber-400 text-slate-950 font-black text-sm tracking-widest shadow-xl animate-bounce">
                  🔥 黄金オーラ噴出！ 激レア出現確定！？ 🔥
                </div>
              ) : (
                <div className="px-6 py-2 rounded-full bg-cyan-400 text-slate-950 font-black text-sm tracking-widest shadow-lg">
                  ✨ 神秘のカプセル降臨！ ✨
                </div>
              )}

              {/* Capsule Graphic */}
              <div
                onClick={handleTapCapsule}
                className={`relative cursor-pointer transition-transform hover:scale-110 active:scale-95 ${
                  highestRarity === 'Legend' ? 'animate-pulse' : ''
                }`}
              >
                <div className="w-48 h-48 rounded-full bg-slate-900 border-4 border-amber-400 flex items-center justify-center shadow-2xl relative overflow-hidden">
                  <div className="text-8xl">🔮</div>
                  {highestRarity === 'Legend' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-500/40 via-amber-300/30 to-transparent animate-spin" />
                  )}
                </div>
              </div>

              {/* Tap Request Button */}
              <button
                onClick={handleTapCapsule}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 text-slate-950 font-black text-lg tracking-wider shadow-2xl animate-pulse flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-6 h-6 fill-slate-950" />
                <span>TAP TO RELEASE（カプセルを開封！）</span>
              </button>
            </div>
          )}

          {/* Stage 3: Official Battle Cats Style Result Screen (1 unit by 1 unit) */}
          {cutsceneStage === 'REVEAL_SINGLE' && currentUnit && (
            <div className="w-full max-w-4xl h-full flex flex-col justify-between relative z-10 py-2">
              {/* Top Banner (Header & Currency) */}
              <div className="flex items-center justify-between w-full border-b-2 border-amber-500/30 pb-2">
                <div className="text-xl md:text-2xl font-black text-amber-300 tracking-wider drop-shadow-md flex items-center gap-2">
                  <span>{selectedTab === 'nyanko' ? 'にゃんこガチャ' : 'レアガチャ'}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300">
                    {currentRevealIndex + 1} / {totalUnits} 体目
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSkipAll}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-600 cursor-pointer"
                  >
                    全部スキップ
                  </button>
                </div>
              </div>

              {/* Center Main Stage (Rarity Header & Huge Character) */}
              <div className="my-auto flex flex-col items-center justify-center space-y-4 py-4 animate-fadeIn">
                {/* Huge Rarity Banner with Battle Cats Styling */}
                <div className="text-center">
                  {currentUnit.rarity === 'Legend' && (
                    <h1 className="text-4xl md:text-6xl font-black italic bg-gradient-to-r from-pink-400 via-amber-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_5px_15px_rgba(245,158,11,0.8)] tracking-widest animate-pulse">
                      超 激 レ ア ！！
                    </h1>
                  )}
                  {currentUnit.rarity === 'SuperRare' && (
                    <h1 className="text-4xl md:text-6xl font-black italic text-amber-400 drop-shadow-[0_4px_12px_rgba(245,158,11,0.9)] tracking-widest">
                      超 激 レ ア ！！
                    </h1>
                  )}
                  {currentUnit.rarity === 'Rare' && (
                    <h1 className="text-3xl md:text-5xl font-black italic text-cyan-300 drop-shadow-[0_4px_10px_rgba(6,182,212,0.8)] tracking-widest">
                      激 レ ア ！！
                    </h1>
                  )}
                  {currentUnit.rarity === 'Normal' && (
                    <h1 className="text-3xl md:text-5xl font-black italic text-slate-100 drop-shadow-[0_4px_8px_rgba(255,255,255,0.6)] tracking-widest">
                      レ ア ！！
                    </h1>
                  )}
                </div>

                {/* Character Main Portrait Display */}
                <div className="relative py-6">
                  <div className="text-9xl md:text-[140px] drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] animate-bounce transition-transform">
                    {currentUnit.evolutions.stage1.icon}
                  </div>
                  {/* Aura rings */}
                  <div className="absolute inset-0 -z-10 rounded-full bg-amber-400/20 blur-2xl animate-pulse" />
                </div>

                {/* Character Name Plate (Black Box with White Border like Battle Cats) */}
                <div className="w-full max-w-lg flex items-center justify-center gap-3 px-4">
                  {isNewUnit && (
                    <div className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-black text-xs md:text-sm border-2 border-white shadow-lg animate-bounce tracking-wider">
                      NEW!
                    </div>
                  )}

                  <div className="flex-1 py-3 px-6 bg-slate-950 border-2 border-slate-200 rounded-xl shadow-2xl text-center">
                    <span className="text-lg md:text-2xl font-black text-slate-100 tracking-wide">
                      {currentUnit.baseName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="flex items-center justify-between w-full pt-4 border-t border-slate-800">
                <div className="text-xs font-bold text-slate-400">
                  {currentUnit.evolutions.stage1.title}
                </div>

                {/* Yellow OK / Next Button matching Battle Cats */}
                <button
                  onClick={handleNextUnit}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-black text-lg md:text-xl border-2 border-white shadow-[0_4px_15px_rgba(245,158,11,0.5)] cursor-pointer flex items-center gap-2"
                >
                  <span>{currentRevealIndex < totalUnits - 1 ? `次へ (${currentRevealIndex + 1}/${totalUnits})` : 'OK'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- MAIN GACHA MODAL WINDOW --- */}
      <div className={`w-full max-w-xl rounded-3xl border-2 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh] transition-all duration-300 ${
        selectedTab === 'rare' ? 'bg-slate-950 border-amber-400 shadow-amber-500/20' : 'bg-slate-900 border-amber-500'
      }`}>
        {/* Header */}
        <div className={`p-4 font-black flex items-center justify-between shadow-md ${
          selectedTab === 'rare'
            ? 'bg-gradient-to-r from-amber-500 via-purple-600 to-amber-500 text-amber-200'
            : 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950'
        }`}>
          <div className="flex items-center gap-2">
            {selectedTab === 'rare' ? <Crown className="w-6 h-6 text-amber-300 animate-bounce" /> : <Sparkles className="w-6 h-6 text-slate-950" />}
            <h2 className="text-lg tracking-wide">
              {selectedTab === 'rare' ? '👑 超激レア確定・極上レアガチャ神社' : '🐾 ニャンコ神社・標準ガチャ'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 text-white text-xs font-bold cursor-pointer border border-white/20"
          >
            ✕ 閉じる
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-center flex-1">
          {/* CatFood Info */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-slate-950 border border-amber-500/40 text-amber-300 font-bold text-sm">
            <span>🐟 所持猫缶:</span>
            <span className="text-lg">{catFood.toLocaleString()}</span>
          </div>

          {/* Gacha Selector Tabs (Page Switcher) */}
          <div className="flex items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              onClick={() => {
                soundManager.playClick();
                setSelectedTab('nyanko');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedTab === 'nyanko'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-100 ring-2 ring-amber-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>🐾 にゃんこガチャ</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-900/50 font-bold">50猫缶 / 1%</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                setSelectedTab('rare');
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedTab === 'rare'
                  ? 'bg-gradient-to-r from-amber-400 via-purple-500 to-amber-400 text-white shadow-xl scale-100 ring-2 ring-amber-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>👑 レアガチャ (確率UP!)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-900/50 font-bold">100猫缶 / 3%</span>
            </button>
          </div>

          {/* Shrine Visual Banner (Dynamic Page Banner) */}
          {selectedTab === 'rare' ? (
            <div className="relative py-6 px-4 rounded-3xl bg-gradient-to-b from-purple-950 via-slate-900 to-purple-950 border-2 border-amber-400 flex flex-col items-center justify-center overflow-hidden shadow-2xl animate-fadeIn">
              <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider animate-pulse">
                超激レア＆伝説 確率3倍！！
              </div>
              <div className="text-5xl animate-bounce mb-1">⛩️👑🔥</div>
              <h3 className="text-xl font-black bg-gradient-to-r from-amber-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
                【極・レアガチャ】伝説降臨の刻
              </h3>
              <p className="text-xs text-amber-200/90 max-w-sm mt-1 font-bold">
                超激レア・伝説キャラの排出確率が大幅アップ！強力な伝説のニャンコ神を狙え！
              </p>
            </div>
          ) : (
            <div className="relative py-5 px-4 rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-inner animate-fadeIn">
              <div className="text-4xl animate-bounce mb-1">🐱🐾</div>
              <h3 className="text-base font-extrabold text-amber-300">
                【にゃんこガチャ】ノーマル＆レア基本召喚
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-0.5">
                お手頃な50猫缶で引ける基本召喚。重複キャラは自動的に【XP】や【進化石】に変換！
              </p>
            </div>
          )}

          {/* Drop Rates Transparency Box */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-amber-400" />
                <span>{selectedTab === 'nyanko' ? 'にゃんこガチャ' : 'レアガチャ'} 排出確率表</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                公式ガチャ専用
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
              <div className="p-2 rounded-xl bg-gradient-to-b from-amber-500/20 to-amber-950/40 border border-amber-400/40">
                <div className="font-black text-amber-300 text-[10px]">👑 超激/伝説</div>
                <div className="text-sm font-black text-amber-400 mt-0.5">
                  {selectedTab === 'nyanko' ? '1.0%' : '3.0%'}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
                <div className="font-black text-cyan-300 text-[10px]">🔥 激レア</div>
                <div className="text-sm font-black text-cyan-400 mt-0.5">
                  {selectedTab === 'nyanko' ? '9.0%' : '15.0%'}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-700">
                <div className="font-black text-slate-300 text-[10px]">✨ レア</div>
                <div className="text-sm font-black text-slate-200 mt-0.5">
                  {selectedTab === 'nyanko' ? '25.0%' : '35.0%'}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-700">
                <div className="font-black text-slate-400 text-[10px]">🐾 ノーマル</div>
                <div className="text-sm font-black text-slate-300 mt-0.5">
                  {selectedTab === 'nyanko' ? '65.0%' : '47.0%'}
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight pt-0.5">
              ※自作AIキャラは「研究ラボ」にて直接生成・獲得されるため、本ガチャからは排出されません。
            </p>
          </div>

          {/* Final Summary Display after cutscene */}
          {pullResults && (cutsceneStage === 'IDLE' || cutsceneStage === 'DONE') && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/40 space-y-3 animate-fadeIn">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>最終獲得召喚結果</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {pullResults.units.map((u, i) => {
                  const isNew = !unlockedUnitIds.includes(u.id);
                  return (
                    <div
                      key={i}
                      className={`relative flex flex-col items-center p-2.5 rounded-xl border ${
                        u.rarity === 'Legend'
                          ? 'bg-gradient-to-b from-slate-900 to-amber-950/80 border-amber-400'
                          : u.rarity === 'SuperRare'
                          ? 'bg-slate-900 border-amber-500/60'
                          : 'bg-slate-800/80 border-slate-700'
                      }`}
                    >
                      {isNew && (
                        <span className="absolute -top-1.5 -right-1 px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[8px] font-black">
                          NEW!
                        </span>
                      )}
                      <span className="text-3xl my-1">{u.evolutions.stage1.icon}</span>
                      <span className="text-[11px] font-bold text-slate-200 truncate w-full">{u.baseName}</span>
                      <span className="text-[9px] font-black text-amber-400">{u.rarity}</span>
                    </div>
                  );
                })}
              </div>

              {(pullResults.xp > 0 || pullResults.stones > 0) && (
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  重複ボーナス獲得: +{pullResults.xp.toLocaleString()} XP / +{pullResults.stones} 進化石
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => handleStartSummon(1, singleCost)}
              disabled={catFood < singleCost}
              className={`py-3.5 px-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                catFood >= singleCost
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Dices className="w-5 h-5" />
              1回ガチャ ({singleCost} 猫缶)
            </button>

            <button
              onClick={() => handleStartSummon(10, tenCost)}
              disabled={catFood < tenCost}
              className={`py-3.5 px-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                catFood >= tenCost
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 shadow-lg cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-5 h-5 text-slate-950" />
              お得な10連ガチャ ({tenCost} 猫缶)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
