import React, { useState } from 'react';
import { PlayerData, SerialCode } from '../types';
import { Wrench, ShieldCheck, Zap, Sparkles, Check, RefreshCw, Trophy, Key, Plus, ChevronRight, Ticket, Trash2, Copy, Share2 } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { getAllSerialCodes, getCustomSerialCodes, saveCustomSerialCodes, generateUniversalRewardCode } from '../utils/serialCodes';

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

  // Serial code creator state
  const [codesList, setCodesList] = useState<SerialCode[]>(getAllSerialCodes());
  const [newCodeName, setNewCodeName] = useState<string>('');
  const [newCodeCatFood, setNewCodeCatFood] = useState<string>('50');
  const [newCodeXp, setNewCodeXp] = useState<string>('0');
  const [newCodeDesc, setNewCodeDesc] = useState<string>('運営配布プレゼント！');

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

  // Serial Code Creation & Management Handlers
  const handleAddCustomCode = () => {
    const trimmed = newCodeName.trim().toUpperCase();
    if (!trimmed) {
      alert('コード文字列を入力してください（例: GIFT100）');
      return;
    }
    const catFoodNum = parseInt(newCodeCatFood) || 0;
    const xpNum = parseInt(newCodeXp) || 0;

    const newCodeItem: SerialCode = {
      code: trimmed,
      rewardCatFood: catFoodNum,
      rewardXp: xpNum,
      description: newCodeDesc || '特製シリアルコード特典',
      isActive: true,
      createdAt: Date.now(),
    };

    const currentCustoms = getCustomSerialCodes();
    const updatedCustoms = [...currentCustoms.filter((c) => c.code.toUpperCase() !== trimmed), newCodeItem];
    saveCustomSerialCodes(updatedCustoms);
    setCodesList(getAllSerialCodes());
    setNewCodeName('');
    showMsg(`シリアルコード【${trimmed}】（猫缶+${catFoodNum}個）を発行保存しました！`);
  };

  const handleToggleCodeActive = (targetCode: string) => {
    const currentCustoms = getCustomSerialCodes();
    const existing = codesList.find((c) => c.code.toUpperCase() === targetCode.toUpperCase());
    if (!existing) return;

    const updatedCodeItem: SerialCode = {
      ...existing,
      isActive: !existing.isActive,
    };

    const updatedCustoms = [...currentCustoms.filter((c) => c.code.toUpperCase() !== targetCode.toUpperCase()), updatedCodeItem];
    saveCustomSerialCodes(updatedCustoms);
    setCodesList(getAllSerialCodes());
    showMsg(`コード【${targetCode}】の有効状態を切り替えました！`);
  };

  const handleDeleteCustomCode = (targetCode: string) => {
    const currentCustoms = getCustomSerialCodes();
    const updatedCustoms = currentCustoms.filter((c) => c.code.toUpperCase() !== targetCode.toUpperCase());
    saveCustomSerialCodes(updatedCustoms);
    setCodesList(getAllSerialCodes());
    showMsg(`カスタムコード【${targetCode}】を削除しました！`);
  };

  const handleResetUsedCodes = () => {
    onUpdatePlayerData({ usedSerialCodes: [] });
    showMsg('プレイヤーのシリアルコード受領履歴をリセットしました！（全コード再入力可能）');
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

          {/* 6. SERIAL CODE MANAGEMENT (シリアルコード発行・管理) */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/50 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-900/50 pb-2">
              <h3 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-amber-400" />
                <span>プレゼントシリアルコード発行・管理（全端末共通）</span>
              </h3>
              <button
                onClick={handleResetUsedCodes}
                className="px-2.5 py-1 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-[10px] font-bold cursor-pointer"
              >
                受領履歴リセット
              </button>
            </div>

            {/* Create Code Form */}
            <div className="space-y-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <span className="text-[11px] font-extrabold text-amber-300 block">
                ✨ 新規シリアルコード発行
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-0.5">コード文字列:</span>
                  <input
                    type="text"
                    placeholder="例: CATFOOD100"
                    value={newCodeName}
                    onChange={(e) => setNewCodeName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-black text-amber-200 uppercase focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-0.5">付与猫缶数:</span>
                  <input
                    type="number"
                    placeholder="50"
                    value={newCodeCatFood}
                    onChange={(e) => setNewCodeCatFood(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-black text-amber-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-0.5">付与XP (任意):</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={newCodeXp}
                    onChange={(e) => setNewCodeXp(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs font-black text-amber-200 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold block mb-0.5">説明文:</span>
                <input
                  type="text"
                  placeholder="例: 運営からの感謝プレゼント！猫缶100個"
                  value={newCodeDesc}
                  onChange={(e) => setNewCodeDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                onClick={handleAddCustomCode}
                className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>シリアルコードを新規登録・保存</span>
              </button>
            </div>

            {/* Existing Codes List */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-400 block">
                  📋 現在有効なシリアルコード一覧 ({codesList.length}件)
                </span>
                <span className="text-[10px] text-amber-400 font-bold">
                  ※スマホ・別端末へは「共有用コード」をコピペして使用可能！
                </span>
              </div>
              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                {codesList.map((item) => {
                  const isUsed = (playerData.usedSerialCodes || []).includes(item.code.toUpperCase());
                  const universalCode = generateUniversalRewardCode(item.code, item.rewardCatFood, item.rewardXp || 0);

                  return (
                    <div
                      key={item.code}
                      className={`p-2.5 rounded-xl border space-y-1.5 ${
                        item.isActive
                          ? 'bg-slate-900 border-amber-500/40 text-amber-200'
                          : 'bg-slate-950 border-slate-800 text-slate-500 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-amber-300 tracking-wider">{item.code}</span>
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                              猫缶 +{item.rewardCatFood}個
                            </span>
                            {item.rewardXp ? (
                              <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                                XP +{item.rewardXp.toLocaleString()}
                              </span>
                            ) : null}
                            {isUsed && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 text-[9px] font-black">
                                受領済
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400">{item.description}</p>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleCodeActive(item.code)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer ${
                              item.isActive
                                ? 'bg-emerald-900/60 border border-emerald-500/50 text-emerald-300'
                                : 'bg-slate-800 border border-slate-700 text-slate-400'
                            }`}
                          >
                            {item.isActive ? '有効' : '無効'}
                          </button>

                          <button
                            onClick={() => handleDeleteCustomCode(item.code)}
                            title="削除"
                            className="p-1 rounded-lg hover:bg-rose-950 text-rose-400 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Universal Share Code Row */}
                      <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1 text-slate-400 font-mono">
                          <Share2 className="w-3 h-3 text-cyan-400" />
                          <span>スマホ全端末共有コード:</span>
                          <strong className="text-cyan-300 select-all">{universalCode}</strong>
                        </div>

                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(universalCode);
                            showMsg(`スマホ共有用コード【${universalCode}】をクリップボードにコピーしました！`);
                          }}
                          className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Copy className="w-3 h-3" />
                          <span>共有コードコピー</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
