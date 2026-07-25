import React, { useState } from 'react';
import { ShoppingBag, Zap, Sparkles, Check, Gift, ShieldAlert } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { PlayerData } from '../types';

interface ItemShopModalProps {
  playerData: PlayerData;
  onUpdatePlayerData: (updater: (prev: PlayerData) => PlayerData) => void;
  onClose: () => void;
}

interface ShopItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  catFoodCost?: number;
  xpCost?: number;
  type: 'instant_energy' | 'instant_xp' | 'instant_stone' | 'inventory_item';
  rewardAmount?: number;
}

const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'energy_refill',
    name: '統率力（エネルギー）全回復',
    icon: '⚡',
    description: '統率力を即時に最大値まで全回復します！',
    catFoodCost: 30,
    type: 'instant_energy',
  },
  {
    id: 'xp_pack',
    name: 'XP大量発掘パック',
    icon: '✨',
    description: 'キャラクター強化に使える 50,000 XP を即座に獲得！',
    catFoodCost: 50,
    type: 'instant_xp',
    rewardAmount: 50000,
  },
  {
    id: 'stone_pack',
    name: 'レア進化石パック',
    icon: '💎',
    description: '第3形態への進化に必要な「進化石」を 3個 獲得！',
    catFoodCost: 50,
    type: 'instant_stone',
    rewardAmount: 3,
  },
  {
    id: 'catBon',
    name: 'ネコボン',
    icon: '💣',
    description: '戦闘開始時から働きネコのレベルが最大(Lv.8)でスタート！',
    catFoodCost: 30,
    xpCost: 15000,
    type: 'inventory_item',
  },
  {
    id: 'sniper',
    name: 'スニャイパー',
    icon: '🎯',
    description: '戦闘中に自動で遠距離狙撃を行い、敵をノックバック＆ダメージ！',
    catFoodCost: 25,
    xpCost: 12000,
    type: 'inventory_item',
  },
  {
    id: 'cpu',
    name: 'ニャンコCPU',
    icon: '🤖',
    description: '高精度AIが完璧な判断で働きネコ強化・ネコ連続出撃を自動化！',
    catFoodCost: 40,
    xpCost: 30000,
    type: 'inventory_item',
  },
  {
    id: 'treasureRadar',
    name: 'トレジャーレーダー',
    icon: '👁️',
    description: 'ステージクリア時のドロップ報酬（猫缶・XP・進化石）が100%確定・豪華2倍獲得！',
    catFoodCost: 50,
    xpCost: 40000,
    type: 'inventory_item',
  },
];

export const ItemShopModal: React.FC<ItemShopModalProps> = ({
  playerData,
  onUpdatePlayerData,
  onClose,
}) => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inventory = playerData.items || {};

  const handleBuyWithCatFood = (item: ShopItem) => {
    if (!item.catFoodCost || playerData.catFood < item.catFoodCost) {
      soundManager.playClick();
      setErrorMsg('猫缶が足りにゃい！猫缶補充ショップで補充してね！');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    soundManager.playVictory();
    onUpdatePlayerData((prev) => {
      const currentItems = { ...(prev.items || {}) };
      let newCatFood = prev.catFood - item.catFoodCost!;
      let newEnergy = prev.energy;
      let newXp = prev.xp;
      let newStones = prev.evolutionStones;

      if (item.type === 'instant_energy') {
        newEnergy = prev.maxEnergy;
      } else if (item.type === 'instant_xp') {
        newXp += item.rewardAmount || 0;
      } else if (item.type === 'instant_stone') {
        newStones += item.rewardAmount || 0;
      } else if (item.type === 'inventory_item') {
        currentItems[item.id] = (currentItems[item.id] || 0) + 1;
      }

      return {
        ...prev,
        catFood: newCatFood,
        energy: newEnergy,
        xp: newXp,
        evolutionStones: newStones,
        items: currentItems,
      };
    });

    setSuccessMsg(`「${item.name}」を購入しました！`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleBuyWithXp = (item: ShopItem) => {
    if (!item.xpCost || playerData.xp < item.xpCost) {
      soundManager.playClick();
      setErrorMsg('経験値(XP)が足りません！');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    soundManager.playLevelUp();
    onUpdatePlayerData((prev) => {
      const currentItems = { ...(prev.items || {}) };
      currentItems[item.id] = (currentItems[item.id] || 0) + 1;

      return {
        ...prev,
        xp: prev.xp - item.xpCost!,
        items: currentItems,
      };
    });

    setSuccessMsg(`「${item.name}」を 1個 購入しました！`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border-2 border-amber-500 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-slate-950 font-black flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-slate-950" />
            <h2 className="text-lg tracking-wide">にゃんこアイテムショップ</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs bg-slate-950/80 px-2.5 py-1 rounded-xl text-amber-300 border border-amber-400/40">
              🐟 猫缶: <span className="font-mono text-white font-bold">{playerData.catFood}</span>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-xl bg-slate-950/40 hover:bg-slate-950/60 text-white text-xs font-bold cursor-pointer transition-all"
            >
              ✕ 閉じる
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4">
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

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SHOP_ITEMS.map((item) => {
              const ownedCount = inventory[item.id] || 0;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-amber-500/60 transition-all shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-2xl flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-amber-300">{item.name}</h3>
                        {item.type === 'inventory_item' && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30">
                            所持: {ownedCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                    {item.catFoodCost && (
                      <button
                        onClick={() => handleBuyWithCatFood(item)}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>🐟 {item.catFoodCost}</span>
                      </button>
                    )}

                    {item.xpCost && (
                      <button
                        onClick={() => handleBuyWithXp(item)}
                        className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-slate-950 font-black text-xs transition-all shadow cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>✨ {item.xpCost.toLocaleString()} XP</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
