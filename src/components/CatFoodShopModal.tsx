import React, { useState } from 'react';
import { Ticket, Gift, Tv, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { PlayerData } from '../types';
import { claimSerialCode } from '../utils/serialCodes';

interface CatFoodShopModalProps {
  playerData: PlayerData;
  onUpdatePlayerData: (updater: (prev: PlayerData) => PlayerData) => void;
  onClose: () => void;
}

export const CatFoodShopModal: React.FC<CatFoodShopModalProps> = ({
  playerData,
  onUpdatePlayerData,
  onClose,
}) => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [serialInput, setSerialInput] = useState<string>('');
  const [isWatchingAd, setIsWatchingAd] = useState<boolean>(false);

  // Check 24 hour cooldown for daily bonus
  const now = Date.now();
  const lastDaily = playerData.lastDailyCatFoodTimestamp || 0;
  const canClaimDaily = now - lastDaily >= 24 * 60 * 60 * 1000;
  const hoursLeft = Math.ceil((24 * 60 * 60 * 1000 - (now - lastDaily)) / (1000 * 60 * 60));

  // Handle Serial Code Claim
  const handleRedeemCode = () => {
    setErrorMsg(null);
    const { updatedPlayerData, result } = claimSerialCode(serialInput, playerData);

    if (result.success) {
      soundManager.playVictory();
      onUpdatePlayerData(() => updatedPlayerData);
      setSuccessMsg(result.message);
      setSerialInput('');
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      soundManager.playClick();
      setErrorMsg(result.message);
      setTimeout(() => setErrorMsg(null), 3500);
    }
  };

  // Handle Daily Bonus
  const handleClaimDailyBonus = () => {
    if (!canClaimDaily) return;

    soundManager.playVictory();
    onUpdatePlayerData((prev) => ({
      ...prev,
      catFood: prev.catFood + 30,
      lastDailyCatFoodTimestamp: Date.now(),
    }));

    setSuccessMsg('デイリーボーナス！猫缶 30個を無料で受領しました！');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // Handle Video Ad Watch
  const handleWatchAd = () => {
    if (isWatchingAd) return;
    setIsWatchingAd(true);
    soundManager.playClick();

    setTimeout(() => {
      soundManager.playVictory();
      setIsWatchingAd(false);
      onUpdatePlayerData((prev) => ({
        ...prev,
        catFood: prev.catFood + 20,
      }));
      setSuccessMsg('CM動画の視聴完了！猫缶 20個をGETしました！');
      setTimeout(() => setSuccessMsg(null), 3500);
    }, 2000);
  };

  // Handle XP to Cat Food Exchange
  const handleXpExchange = () => {
    if (playerData.xp < 50000) {
      soundManager.playClick();
      setErrorMsg('経験値(XP)が不足しています！ (50,000 XP必要)');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    soundManager.playLevelUp();
    onUpdatePlayerData((prev) => ({
      ...prev,
      xp: prev.xp - 50000,
      catFood: prev.catFood + 30,
    }));

    setSuccessMsg('50,000 XPを消費して 猫缶 30個と交換しました！');
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-amber-500 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐟</span>
            <h2 className="text-lg tracking-wide">ネコカン補充＆プレゼントショップ</h2>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 text-white text-xs font-bold cursor-pointer transition-all"
          >
            ✕ 閉じる
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Current Cat Food Display */}
          <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/60 flex items-center justify-between shadow-inner">
            <span className="text-xs font-black text-amber-300">現在の所持ネコカン</span>
            <div className="flex items-center gap-1.5 text-xl font-black text-white">
              <span>🐟</span>
              <span>{playerData.catFood} 個</span>
            </div>
          </div>

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold text-center animate-bounce">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-400 text-rose-300 text-xs font-bold text-center animate-pulse">
              {errorMsg}
            </div>
          )}

          {/* 1. Serial Code Section */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/50 space-y-2.5">
            <div className="text-left flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Ticket className="w-4 h-4 text-amber-400" />
                  <span>プレゼントシリアルコード入力</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  公式配布コードを入力して猫缶や特典を無料で手に入れよう！
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="例: NYANKO50, CATFOOD100"
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRedeemCode()}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-black text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-400 uppercase tracking-wide"
              />
              <button
                onClick={handleRedeemCode}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow cursor-pointer flex items-center gap-1"
              >
                <Gift className="w-4 h-4" />
                <span>受領</span>
              </button>
            </div>

            <div className="text-[10px] text-slate-500 text-left font-bold flex items-center justify-between">
              <span>※コード: NYANKO50 / CATFOOD100 / PREMIUM2026</span>
            </div>
          </div>

          {/* 2. Daily Free Bonus */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-emerald-400" />
                <span>デイリーネコカンプレゼント</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">24時間に1回、無料で 猫缶 30個 獲得！</p>
            </div>

            <button
              onClick={handleClaimDailyBonus}
              disabled={!canClaimDaily}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                canClaimDaily
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {canClaimDaily ? '受取る (無料)' : `あと${hoursLeft}時間`}
            </button>
          </div>

          {/* 3. Watch Video Ad */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                <Tv className="w-4 h-4 text-cyan-400" />
                <span>CM動画を視聴してネコカンGET</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">短い動画CMを見て 猫缶 20個 を獲得！</p>
            </div>

            <button
              onClick={handleWatchAd}
              disabled={isWatchingAd}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1"
            >
              {isWatchingAd ? (
                <span className="animate-pulse">視聴中...</span>
              ) : (
                <span>視聴する (+20)</span>
              )}
            </button>
          </div>

          {/* 4. XP Exchange */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>XPをネコカンと交換</span>
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">50,000 XP ➔ 猫缶 30個</p>
            </div>

            <button
              onClick={handleXpExchange}
              disabled={playerData.xp < 50000}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                playerData.xp >= 50000
                  ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md cursor-pointer'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              交換する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
