import React, { useState } from 'react';
import { CatUnitData, PlayerData } from '../types';
import { CAT_UNITS } from '../data/units';
import { soundManager } from '../utils/audio';
import { calculateUnitStats } from '../utils/unitCalculator';
import {
  Shield,
  ArrowLeft,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  Info,
  Layers,
  Sword,
  Target,
  Crosshair,
  Dna,
} from 'lucide-react';

interface DeckBuilderProps {
  playerData: PlayerData;
  onUpdateDeck: (newDeck: string[]) => void;
  onOpenEvolution: (unit: CatUnitData) => void;
  onBackToHome: () => void;
}

export const DeckBuilder: React.FC<DeckBuilderProps> = ({
  playerData,
  onUpdateDeck,
  onOpenEvolution,
  onBackToHome,
}) => {
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(
    playerData.equippedDeck[0] || null
  );
  const [rarityFilter, setRarityFilter] = useState<string>('ALL');

  const allUnits = [...CAT_UNITS, ...(playerData.customUnits || [])];

  const deckUnits = playerData.equippedDeck
    .map((id) => allUnits.find((u) => u.id === id))
    .filter((u): u is CatUnitData => u !== undefined);

  // Selected unit details
  const activeSelectedUnit = allUnits.find((u) => u.id === selectedUnitId);
  const activeUnitProgress = selectedUnitId ? playerData.unlockedUnits[selectedUnitId] : null;

  // Toggle unit in deck
  const handleToggleUnit = (unitId: string) => {
    soundManager.playClick();
    if (playerData.equippedDeck.includes(unitId)) {
      if (playerData.equippedDeck.length <= 1) return; // Keep at least 1
      onUpdateDeck(playerData.equippedDeck.filter((id) => id !== unitId));
    } else {
      if (playerData.equippedDeck.length >= 10) return; // Max 10 units!
      onUpdateDeck([...playerData.equippedDeck, unitId]);
    }
  };

  // Recommended Decks presets
  const handleApplyPreset = (type: 'BALANCED' | 'LOW_COST' | 'HIGH_DPS') => {
    soundManager.playLevelUp();
    const unlockedIds = Object.keys(playerData.unlockedUnits);
    let chosenIds: string[] = [];

    if (type === 'LOW_COST') {
      // Sort by cost ascending
      chosenIds = [...unlockedIds]
        .map((id) => CAT_UNITS.find((u) => u.id === id))
        .filter((u): u is CatUnitData => u !== undefined)
        .sort((a, b) => a.deployCost - b.deployCost)
        .slice(0, 10)
        .map((u) => u.id);
    } else if (type === 'HIGH_DPS') {
      // Sort by attack descending
      chosenIds = [...unlockedIds]
        .map((id) => CAT_UNITS.find((u) => u.id === id))
        .filter((u): u is CatUnitData => u !== undefined)
        .sort((a, b) => b.baseAttack - a.baseAttack)
        .slice(0, 10)
        .map((u) => u.id);
    } else {
      // Balanced: Take mix
      chosenIds = unlockedIds.slice(0, 10);
    }

    if (chosenIds.length > 0) {
      onUpdateDeck(chosenIds);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-5 font-sans text-slate-100 select-none pb-8">
      {/* --- TOP NAV & TITLE BAR --- */}
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
              <Shield className="w-5 h-5" />
              出撃キャラクター編成
            </h2>
            <p className="text-[11px] text-slate-400 font-bold">
              戦闘で召喚する出撃スロット（最大10体）を自由に組み換えられます
            </p>
          </div>
        </div>

        {/* Deck Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 mr-1">一括おすすめ:</span>
          <button
            onClick={() => handleApplyPreset('BALANCED')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-black transition-all cursor-pointer"
          >
            バランス
          </button>
          <button
            onClick={() => handleApplyPreset('LOW_COST')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-black transition-all cursor-pointer"
          >
            低コスト壁
          </button>
          <button
            onClick={() => handleApplyPreset('HIGH_DPS')}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 text-xs font-black transition-all cursor-pointer"
          >
            高攻撃力
          </button>
        </div>
      </div>

      {/* --- CURRENT EQUIPPED DECK SLOTS (2 ROWS OF 5 SLOTS = 10 SLOTS TOTAL) --- */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border-2 border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs">
              現在の出撃スロット
            </span>
            <span className="text-xs text-amber-300 font-bold">
              {playerData.equippedDeck.length} / 10体 編成中
            </span>
          </div>

          <p className="text-[11px] text-slate-400">
            スロット枠をタップすると、そのキャラクターを選択・外せます
          </p>
        </div>

        {/* 10 Slots Grid (5 columns on desktop, 2 rows) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, slotIdx) => {
            const unit = deckUnits[slotIdx];
            const isFilled = !!unit;

            let displayEvolution = unit?.evolutions.stage1;
            let level = 1;

            if (unit) {
              const progress = playerData.unlockedUnits[unit.id];
              level = progress?.level || 1;
              if (progress?.currentStage === 2) {
                displayEvolution = unit.evolutions.stage2;
              } else if (progress?.currentStage === 3 && unit.evolutions.stage3Branches) {
                const branch = progress.selectedBranch || 'branchA';
                displayEvolution = unit.evolutions.stage3Branches[branch];
              }
            }

            const isSelected = unit && unit.id === selectedUnitId;

            return (
              <div
                key={slotIdx}
                onClick={() => {
                  if (unit) setSelectedUnitId(unit.id);
                }}
                className={`relative min-h-[110px] p-3 rounded-2xl border-2 flex flex-col justify-between items-center transition-all cursor-pointer ${
                  isFilled
                    ? isSelected
                      ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-400/50 scale-105 shadow-xl'
                      : 'bg-slate-800/90 border-slate-700 hover:border-amber-400/80 shadow-md'
                    : 'bg-slate-950/50 border-dashed border-slate-800 flex items-center justify-center text-slate-600'
                }`}
              >
                {/* Slot Number Label */}
                <span className="absolute top-1.5 left-2 text-[9px] font-black text-slate-500">
                  #{slotIdx + 1}
                </span>

                {isFilled && displayEvolution ? (
                  <>
                    {/* Cost Badge */}
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-[10px]">
                      ${unit.deployCost}
                    </div>

                    <span className="text-3xl filter drop-shadow my-1">
                      {displayEvolution.icon}
                    </span>

                    <div className="text-center w-full">
                      <p className="text-xs font-bold text-slate-100 truncate">
                        {displayEvolution.name}
                      </p>
                      <p className="text-[10px] font-black text-amber-400">Lv.{level}</p>
                    </div>

                    {/* Quick Remove Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleUnit(unit.id);
                      }}
                      className="mt-1 w-full py-0.5 rounded-lg bg-rose-900/60 hover:bg-rose-600 border border-rose-500/40 text-[10px] font-black text-rose-200 transition-all"
                    >
                      外す
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 my-auto">
                    <Plus className="w-6 h-6 text-slate-600" />
                    <span className="text-[10px] font-bold text-slate-600">空きスロット</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* --- SELECTED UNIT DETAILS & UNLOCKED LIST GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left/Top: Selected Unit Inspector (4 columns) */}
        <div className="md:col-span-4 p-5 rounded-3xl bg-slate-900/90 border-2 border-slate-800 shadow-2xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
              <Info className="w-4 h-4" />
              ユニット詳細ステータス
            </h3>
          </div>

          {activeSelectedUnit && activeUnitProgress ? (
            (() => {
              const stats = calculateUnitStats(activeSelectedUnit, activeUnitProgress);
              const isEquipped = playerData.equippedDeck.includes(activeSelectedUnit.id);

              return (
                <div className="space-y-4">
                  {/* Avatar & Title */}
                  <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-inner relative">
                      {stats.displayEvolution.icon}
                      <span className="absolute bottom-0.5 right-0.5 text-[8px] font-black bg-amber-500 text-slate-950 px-1 rounded">
                        第{activeUnitProgress.currentStage}形態
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                        {activeSelectedUnit.rarity}
                      </span>
                      <h4 className="text-base font-black text-white mt-1">
                        {stats.displayEvolution.name}
                      </h4>
                      <p className="text-xs text-amber-300 font-extrabold">
                        Lv.{activeUnitProgress.level} (第{activeUnitProgress.currentStage}形態)
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 font-bold block text-[10px]">❤️ 体力</span>
                      <span className="text-emerald-400 font-black text-sm">{stats.hp.toLocaleString()}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 font-bold block text-[10px]">⚔️ 攻撃力</span>
                      <span className="text-amber-400 font-black text-sm">{stats.attack.toLocaleString()}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 font-bold block text-[10px]">💰 生産コスト</span>
                      <span className="text-cyan-400 font-black text-sm">${stats.deployCost}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 font-bold block text-[10px]">🎯 射程</span>
                      <span className="text-purple-300 font-black text-sm">
                        {activeSelectedUnit.attackRange}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 font-bold block text-[10px]">⚡ 再生産時間</span>
                      <span className="text-slate-200 font-black text-sm">
                        {activeSelectedUnit.cooldownSeconds}秒
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400 font-bold block text-[10px]">💥 攻撃タイプ</span>
                      <span className="text-orange-300 font-black text-sm">
                        {activeSelectedUnit.isAreaAttack ? '範囲攻撃' : '単体攻撃'}
                      </span>
                    </div>
                  </div>

                  {/* Equipped Passive Skills Display */}
                  {stats.equippedPassives.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-[10px] space-y-1">
                      <span className="text-cyan-300 font-black flex items-center gap-1">
                        <Dna className="w-3.5 h-3.5 text-cyan-400" />
                        遺伝子パッシブ適用中:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {stats.equippedPassives.map((sk) => (
                          <span key={sk.id} className="px-1.5 py-0.5 rounded bg-cyan-900 text-cyan-200 font-bold">
                            {sk.icon} {sk.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => handleToggleUnit(activeSelectedUnit.id)}
                      className={`w-full py-3 rounded-2xl font-black text-xs transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
                        isEquipped
                          ? 'bg-rose-600 hover:bg-rose-500 text-white'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span>デッキから外す</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>出撃スロットに加える</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        soundManager.playClick();
                        onOpenEvolution(activeSelectedUnit);
                      }}
                      className="w-full py-2.5 rounded-2xl font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>レベルアップ＆進化画面へ</span>
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              右の所持一覧からユニットを選択して詳細を表示できます
            </div>
          )}
        </div>

        {/* Right: All Unlocked Units Selector Grid (8 columns) */}
        <div className="md:col-span-8 p-5 rounded-3xl bg-slate-900/90 border-2 border-slate-800 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <h3 className="text-sm font-black text-amber-400 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              所持キャラクター一覧 ({Object.keys(playerData.unlockedUnits).length}体)
            </h3>

            {/* Rarity Tabs */}
            <div className="flex items-center gap-1">
              {['ALL', 'Normal', 'Rare', 'SuperRare', 'Legend'].map((rarity) => (
                <button
                  key={rarity}
                  onClick={() => setRarityFilter(rarity)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                    rarityFilter === rarity
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {rarity === 'ALL' ? '全レア度' : rarity}
                </button>
              ))}
            </div>
          </div>

          {/* Grid of Unlocked Cats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {allUnits.filter((u) => {
              const isUnlocked = !!playerData.unlockedUnits[u.id];
              if (!isUnlocked) return false;
              if (rarityFilter !== 'ALL' && u.rarity !== rarityFilter) return false;
              return true;
            }).map((unit) => {
              const progress = playerData.unlockedUnits[unit.id];
              const isEquipped = playerData.equippedDeck.includes(unit.id);
              const isSelected = selectedUnitId === unit.id;

              let displayData = unit.evolutions.stage1;
              if (progress.currentStage === 2) {
                displayData = unit.evolutions.stage2;
              } else if (progress.currentStage === 3 && unit.evolutions.stage3Branches) {
                const branch = progress.selectedBranch || 'branchA';
                displayData = unit.evolutions.stage3Branches[branch];
              }

              return (
                <div
                  key={unit.id}
                  onClick={() => {
                    setSelectedUnitId(unit.id);
                  }}
                  className={`relative p-3 rounded-2xl border-2 flex flex-col justify-between items-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-950/80 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                      : isEquipped
                      ? 'bg-slate-800 border-amber-500/60'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-80'
                  }`}
                >
                  {/* Equipped Tag */}
                  {isEquipped && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[9px]">
                      出撃中
                    </span>
                  )}

                  {/* Cost */}
                  <span className="absolute top-1.5 right-1.5 text-[10px] font-black text-amber-300">
                    ${unit.deployCost}
                  </span>

                  <span className="text-3xl filter drop-shadow my-2">{displayData.icon}</span>

                  <div className="text-center w-full">
                    <p className="text-xs font-bold text-slate-100 truncate">{displayData.name}</p>
                    <p className="text-[10px] font-extrabold text-amber-400">Lv.{progress.level}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleUnit(unit.id);
                    }}
                    className={`w-full mt-2 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                      isEquipped
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-rose-900/60 hover:text-rose-200'
                        : 'bg-slate-800 text-slate-200 hover:bg-amber-500 hover:text-slate-950'
                    }`}
                  >
                    {isEquipped ? '編成中 (タップで外す)' : '+ 編成に追加'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
