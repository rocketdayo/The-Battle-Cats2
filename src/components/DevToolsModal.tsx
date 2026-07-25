import React, { useState } from 'react';
import { PlayerData } from '../types';
import { Wrench, ShieldCheck, Zap, Sparkles, Check, RefreshCw, Trophy, Key, Plus, ChevronRight } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface DevToolsModalProps {
  playerData: PlayerData;
  onUpdatePlayerData: (updater: Partial<PlayerData> | ((prev: PlayerData) => PlayerData)) => void;
  onUnlockAllStages: () => void;
  onUnlockAllUnits: () => void;
  onClose: () => void;
}

export const DevToolsModal: React.FC<DevToolsModalProps> = ({
  playerData,
  onUpdatePlayerData,
  onUnlockAllStages,
  onUnlockAllUnits,
  onClose,
}) => {
  const [catFoodInput, setCatFoodInput] = useState<string>(String(playerData.catFood));
  const [xpInput, setXpInput] = useState<string>(String(playerData.xp));
  const [energyInput, setEnergyInput] = useState<string>(String(playerData.energy));
  const [maxEnergyInput, setMaxEnergyInput] = useState<string>(String(playerData.maxEnergy));
  const [stonesInput, setStonesInput] = useState<string>(String(playerData.evolutionStones || 0));

  const [notification, setNotification] = useState<string | null>(null);

  const showMsg = (msg: string) => {
    setNotification(msg);
    soundManager.playVictory();
    setTimeout(() => {
      setNotification(null);
    }, 2500);
  };

  // Direct Updates
  const handleApplyCatFood = (val: number) => {
    const num = Math.max(0, val);
    setCatFoodInput(String(num));
    onUpdatePlayerData({ catFood: num });
    showMsg(`ネコカンを ${num.toLocaleString()} 個に変更しました！`);
  };

  const handleApplyXp = (val: number) => {
    const num = Math.max(0, val);
    setXpInput(String(num));
    onUpdatePlayerData({ xp: num });
    showMsg(`経験値 (XP) を ${num.toLocaleString()} に変更しました！`);
  };

  const handleApplyEnergy = (val: number, maxVal?: number) => {
    const energyNum = Math.max(0, val);
    const maxNum = maxVal !== undefined ? Math.max(1, maxVal) : playerData.maxEnergy;
    setEnergyInput(String(energyNum));
    if (maxVal !== undefined) setMaxEnergyInput(String(maxNum));
    onUpdatePlayerData({ energy: energyNum, maxEnergy: maxNum });
    showMsg(`統率力を ${energyNum} / ${maxNum} に変更しました！`);
  };

  const handleApplyStones = (val: number) => {
    const num = Math.max(0, val);
    setStonesInput(String(num));
    onUpdatePlayerData({ evolutionStones: num });
    showMsg(`進化石を ${num.toLocaleString()} 個に変更しました！`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border-2 border-amber-500 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh] font-sans">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 border-b border-amber-500/50 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 text-amber-400 font-black">
            <Wrench className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
            <h2 className="text-base tracking-wide">デベロッパーツール（ステータス＆数値変更）</h2>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            ✕ 閉じる
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Active Notification */}
          {notification && (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-black text-center animate-fadeIn flex items-center justify-center gap-2 shadow-lg">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{notification}</span>
            </div>
          )}

          {/* 1. CAT FOOD EDIT (ネコカン) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <span>🐟 ネコカン (Cat Food)</span>
              </label>
              <span className="text-[11px] font-bold text-amber-400/80">
                現在: {playerData.catFood.toLocaleString()} 個
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={catFoodInput}
                onChange={(e) => setCatFoodInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-black text-amber-200 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={() => handleApplyCatFood(parseInt(catFoodInput) || 0)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow cursor-pointer"
              >
                反映
              </button>
            </div>
            {/* Quick Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                onClick={() => handleApplyCatFood(playerData.catFood + 1000)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-300 hover:bg-slate-800 text-[11px] font-bold cursor-pointer"
              >
                +1,000
              </button>
              <button
                onClick={() => handleApplyCatFood(playerData.catFood + 10000)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-300 hover:bg-slate-800 text-[11px] font-bold cursor-pointer"
              >
                +10,000
              </button>
              <button
                onClick={() => handleApplyCatFood(99999)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400 text-amber-300 hover:bg-amber-500/30 text-[11px] font-black cursor-pointer"
              >
                99,999 (MAX)
              </button>
            </div>
          </div>

          {/* 2. XP EDIT (経験値) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-cyan-300 flex items-center gap-1.5">
                <span>✨ 経験値 (XP)</span>
              </label>
              <span className="text-[11px] font-bold text-cyan-400/80">
                現在: {playerData.xp.toLocaleString()} XP
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={xpInput}
                onChange={(e) => setXpInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-black text-cyan-200 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => handleApplyXp(parseInt(xpInput) || 0)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow cursor-pointer"
              >
                反映
              </button>
            </div>
            {/* Quick Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                onClick={() => handleApplyXp(playerData.xp + 100000)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-slate-800 text-[11px] font-bold cursor-pointer"
              >
                +100,000
              </button>
              <button
                onClick={() => handleApplyXp(playerData.xp + 10000000)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-slate-800 text-[11px] font-bold cursor-pointer"
              >
                +10,000,000
              </button>
              <button
                onClick={() => handleApplyXp(99999999)}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/30 text-[11px] font-black cursor-pointer"
              >
                99,999,999 (MAX)
              </button>
            </div>
          </div>

          {/* 3. ENERGY EDIT (統率力 & 最大統率力) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                <span>⚡ 統率力 (Energy)</span>
              </label>
              <span className="text-[11px] font-bold text-emerald-400/80">
                現在: {playerData.energy} / {playerData.maxEnergy}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block mb-1">現在の統率力:</span>
                <input
                  type="number"
                  value={energyInput}
                  onChange={(e) => setEnergyInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-black text-emerald-200 focus:outline-none focus:border-emerald-400"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block mb-1">最大統率力:</span>
                <input
                  type="number"
                  value={maxEnergyInput}
                  onChange={(e) => setMaxEnergyInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-black text-emerald-200 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                onClick={() => handleApplyEnergy(parseInt(energyInput) || 0, parseInt(maxEnergyInput) || 500)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow cursor-pointer"
              >
                適用
              </button>
              <button
                onClick={() => handleApplyEnergy(playerData.maxEnergy)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 hover:bg-slate-800 text-[11px] font-bold cursor-pointer"
              >
                ⚡ 統率力全回復
              </button>
              <button
                onClick={() => handleApplyEnergy(999, 999)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 hover:bg-emerald-500/30 text-[11px] font-black cursor-pointer"
              >
                999/999 (MAX)
              </button>
            </div>
          </div>

          {/* 4. EVOLUTION STONES (進化石) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                <span>💎 進化石 (Evolution Stones)</span>
              </label>
              <span className="text-[11px] font-bold text-rose-400/80">
                現在: {playerData.evolutionStones} 個
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={stonesInput}
                onChange={(e) => setStonesInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-black text-rose-200 focus:outline-none focus:border-rose-400"
              />
              <button
                onClick={() => handleApplyStones(parseInt(stonesInput) || 0)}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs transition-all shadow cursor-pointer"
              >
                反映
              </button>
              <button
                onClick={() => handleApplyStones(playerData.evolutionStones + 100)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-rose-500/40 text-rose-300 hover:bg-slate-800 text-xs font-bold cursor-pointer"
              >
                +100
              </button>
            </div>
          </div>

          {/* 5. ONE-CLICK ADVANCED CHEATS (一括解放＆章進行操作) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/40 space-y-3">
            <h3 className="text-xs font-black text-purple-300 flex items-center gap-1.5 border-b border-purple-900/50 pb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>ワンクリック一括デバッグ・章進捗操作</span>
            </h3>

            {/* Character & All Stage Unlock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onUnlockAllUnits();
                  showMsg('全基本・ガチャネコを一括解禁（Lv.10）に設定しました！');
                }}
                className="p-3 rounded-xl bg-purple-950/80 hover:bg-purple-900/90 border border-purple-500/60 text-purple-200 font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer shadow-lg"
              >
                <span>🐱 全ネコキャラ一括解放 (Lv.10)</span>
                <ChevronRight className="w-4 h-4 text-purple-400" />
              </button>

              <button
                onClick={() => {
                  onUnlockAllStages();
                  showMsg('全ステージ（隠しステージ含む）を一括クリア済みに設定しました！');
                }}
                className="p-3 rounded-xl bg-purple-950/80 hover:bg-purple-900/90 border border-purple-500/60 text-purple-200 font-extrabold text-xs flex items-center justify-between transition-all cursor-pointer shadow-lg"
              >
                <span>🚩 全ステージ一括完全全開放</span>
                <ChevronRight className="w-4 h-4 text-purple-400" />
              </button>
            </div>

            {/* Stage Jump Buttons per Chapter */}
            <div className="space-y-2 pt-1 border-t border-slate-800">
              <span className="text-[11px] font-extrabold text-amber-300 block">
                🗺️ 章別ワンクリック進行ショートカット
              </span>

              {/* Chapter 1 Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const ids: string[] = [];
                    for (let i = 1; i <= 49; i++) ids.push(`stage_1_${i}`);
                    onUpdatePlayerData((prev) => ({
                      ...prev,
                      clearedStages: Array.from(new Set([...prev.clearedStages, ...ids])),
                    }));
                    showMsg('【第1章】Stage 1〜49を一括クリア！（Stage 50ボス直前）');
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-amber-950/50 border border-amber-500/40 text-amber-200 font-extrabold text-[11px] flex items-center justify-between transition-all cursor-pointer shadow"
                >
                  <span>🗾 第1章: Stage 49までクリア</span>
                  <span className="text-amber-400 text-[10px]">49/50</span>
                </button>

                <button
                  onClick={() => {
                    const ids: string[] = [];
                    for (let i = 1; i <= 50; i++) ids.push(`stage_1_${i}`);
                    onUpdatePlayerData((prev) => ({
                      ...prev,
                      clearedStages: Array.from(new Set([...prev.clearedStages, ...ids])),
                    }));
                    showMsg('【第1章】全コンプリート！（第2章＆第1章裏ボス出現！）');
                  }}
                  className="p-2.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-400/60 text-amber-300 font-black text-[11px] flex items-center justify-between transition-all cursor-pointer shadow"
                >
                  <span>👑 第1章全コンプ (裏ボス&第2章解禁)</span>
                  <span className="text-amber-300 text-[10px]">50/50</span>
                </button>
              </div>

              {/* Chapter 2 Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const ids: string[] = [];
                    for (let i = 1; i <= 50; i++) ids.push(`stage_1_${i}`);
                    for (let i = 1; i <= 49; i++) ids.push(`stage_2_${i}`);
                    onUpdatePlayerData((prev) => ({
                      ...prev,
                      clearedStages: Array.from(new Set([...prev.clearedStages, ...ids])),
                    }));
                    showMsg('【第2章】Stage 1〜49を一括クリア！（Stage 50ボス直前）');
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-purple-950/50 border border-purple-500/40 text-purple-200 font-extrabold text-[11px] flex items-center justify-between transition-all cursor-pointer shadow"
                >
                  <span>🪐 第2章: Stage 49までクリア</span>
                  <span className="text-purple-400 text-[10px]">49/50</span>
                </button>

                <button
                  onClick={() => {
                    const ids: string[] = [];
                    for (let i = 1; i <= 50; i++) ids.push(`stage_1_${i}`);
                    for (let i = 1; i <= 50; i++) ids.push(`stage_2_${i}`);
                    onUpdatePlayerData((prev) => ({
                      ...prev,
                      clearedStages: Array.from(new Set([...prev.clearedStages, ...ids])),
                    }));
                    showMsg('【第2章】全コンプリート！（第3章＆第2章裏ボス出現！）');
                  }}
                  className="p-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-400/60 text-purple-300 font-black text-[11px] flex items-center justify-between transition-all cursor-pointer shadow"
                >
                  <span>👑 第2章全コンプ (裏ボス&第3章解禁)</span>
                  <span className="text-purple-300 text-[10px]">50/50</span>
                </button>
              </div>

              {/* Chapter 3 Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const ids: string[] = [];
                    for (let i = 1; i <= 50; i++) ids.push(`stage_1_${i}`);
                    for (let i = 1; i <= 50; i++) ids.push(`stage_2_${i}`);
                    for (let i = 1; i <= 49; i++) ids.push(`stage_3_${i}`);
                    onUpdatePlayerData((prev) => ({
                      ...prev,
                      clearedStages: Array.from(new Set([...prev.clearedStages, ...ids])),
                    }));
                    showMsg('【第3章】Stage 1〜49を一括クリア！（Stage 50ボス直前）');
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 border border-rose-500/40 text-rose-200 font-extrabold text-[11px] flex items-center justify-between transition-all cursor-pointer shadow"
                >
                  <span>🌌 第3章: Stage 49までクリア</span>
                  <span className="text-rose-400 text-[10px]">49/50</span>
                </button>

                <button
                  onClick={() => {
                    const ids: string[] = [];
                    for (let i = 1; i <= 50; i++) ids.push(`stage_1_${i}`);
                    for (let i = 1; i <= 50; i++) ids.push(`stage_2_${i}`);
                    for (let i = 1; i <= 50; i++) ids.push(`stage_3_${i}`);
                    onUpdatePlayerData((prev) => ({
                      ...prev,
                      clearedStages: Array.from(new Set([...prev.clearedStages, ...ids])),
                    }));
                    showMsg('【第3章】全コンプリート！（第3章最高峰裏ボス出現！）');
                  }}
                  className="p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-400/60 text-rose-300 font-black text-[11px] flex items-center justify-between transition-all cursor-pointer shadow"
                >
                  <span>👑 第3章全コンプ (最高峰裏ボス解禁)</span>
                  <span className="text-rose-300 text-[10px]">50/50</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
