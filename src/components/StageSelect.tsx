import React, { useState, useRef, useEffect } from 'react';
import { CatUnitData, PlayerData, StageData } from '../types';
import { STAGES } from '../data/stages';
import { CAT_UNITS } from '../data/units';
import { ENEMIES } from '../data/enemies';
import {
  Play,
  Shield,
  Check,
  ArrowLeft,
  MapPin,
  Lock,
  Star,
  Zap,
  Swords,
  Gift,
  X,
  Compass,
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
  onOpenDeckBuilder,
  onBackToHome,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [activeStage, setActiveStage] = useState<StageData | null>(null);
  const mapScrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Helper to check if a stage is unlocked
  const isStageUnlocked = (stage: StageData): boolean => {
    if (stage.isSecretStage) {
      if (stage.chapterId === 1) return playerData.clearedStages.includes('stage_1_50');
      if (stage.chapterId === 2) return playerData.clearedStages.includes('stage_2_50');
      if (stage.chapterId === 3) return playerData.clearedStages.includes('stage_3_50');
    }
    if (stage.stageNumber === 1) {
      if (stage.chapterId === 1) return true;
      if (stage.chapterId === 2) return isCh2Unlocked;
      if (stage.chapterId === 3) return isCh3Unlocked;
    }
    const prevStageId = `stage_${stage.chapterId}_${stage.stageNumber - 1}`;
    return playerData.clearedStages.includes(prevStageId);
  };

  // Check chapter unlocked status
  const isCh2Unlocked = playerData.clearedStages.includes('stage_1_50') || playerData.clearedStages.includes('stage_1_6');
  const isCh3Unlocked = playerData.clearedStages.includes('stage_2_50') || playerData.clearedStages.includes('stage_2_6');

  const getChapterLockStatus = (chId: number) => {
    if (chId === 1) return { unlocked: true };
    if (chId === 2) return { unlocked: isCh2Unlocked, req: '第1章最終ステージクリアで開放' };
    if (chId === 3) return { unlocked: isCh3Unlocked, req: '第2章最終ステージクリアで開放' };
    return { unlocked: false, req: '' };
  };

  // Secret stage is hidden until Stage 50 of that chapter is cleared
  const chapterStages = STAGES.filter((s) => {
    if (s.chapterId !== selectedChapter) return false;
    if (s.isSecretStage) {
      if (s.chapterId === 1 && !playerData.clearedStages.includes('stage_1_50')) return false;
      if (s.chapterId === 2 && !playerData.clearedStages.includes('stage_2_50')) return false;
      if (s.chapterId === 3 && !playerData.clearedStages.includes('stage_3_50')) return false;
    }
    return true;
  });

  // Dynamic Map node coordinates calculation in percentages for any stage count
  const getNodePosition = (index: number, totalCount: number) => {
    if (totalCount <= 1) return { x: 50, y: 50 };
    // Distribute nodes evenly from 2% to 98%
    const x = 2 + (index / (totalCount - 1)) * 96;
    // Smooth alternating S-curve wave for y between 25% and 75% to prevent vertical overlap
    const wave = Math.sin((index / (totalCount - 1)) * Math.PI * 6);
    const y = 50 + wave * 25;
    return { x, y };
  };

  const nodePositions = chapterStages.map((_, idx) =>
    getNodePosition(idx, chapterStages.length)
  );

  // Auto select active stage when chapter changes if active stage not set or from different chapter
  const currentSelectedStage =
    activeStage && activeStage.chapterId === selectedChapter
      ? activeStage
      : chapterStages.find((s) => !playerData.clearedStages.includes(s.id)) ||
        chapterStages[0];

  const totalClearedInChapter = chapterStages.filter((s) =>
    playerData.clearedStages.includes(s.id)
  ).length;

  // Calculate visible/unlocked total stage count dynamically (starts at 150, increases to 151, 152, 153 as secret stages unlock)
  const totalVisibleStagesCount = STAGES.filter((s) => {
    if (!s.isSecretStage) return true;
    if (s.chapterId === 1) return playerData.clearedStages.includes('stage_1_50');
    if (s.chapterId === 2) return playerData.clearedStages.includes('stage_2_50');
    if (s.chapterId === 3) return playerData.clearedStages.includes('stage_3_50');
    return false;
  }).length;

  // Auto-scroll map container to keep current selected stage centered
  useEffect(() => {
    if (!mapScrollContainerRef.current || !currentSelectedStage) return;
    const stageIdx = chapterStages.findIndex((s) => s.id === currentSelectedStage.id);
    if (stageIdx === -1) return;

    const pos = nodePositions[stageIdx];
    if (pos) {
      const container = mapScrollContainerRef.current;
      const scrollableWidth = container.scrollWidth - container.clientWidth;
      if (scrollableWidth > 0) {
        const targetScrollLeft = (pos.x / 100) * container.scrollWidth - container.clientWidth / 2;
        container.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: 'smooth',
        });
      }
    }
  }, [currentSelectedStage?.id, selectedChapter]);

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
              <Compass
                className="w-5 h-5 text-amber-400 animate-spin"
                style={{ animationDuration: '12s' }}
              />
              世界侵略マップ（全{totalVisibleStagesCount}ステージ）
            </h2>
            <p className="text-[11px] text-slate-400 font-bold">
              マップを左右にスクロールして拠点を選択し、敵城を攻略せよ！
            </p>
          </div>
        </div>

        {/* Resources Badges & Progress */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-2xl bg-slate-950 border border-amber-500/40 text-amber-300 font-black text-xs">
            🏆 章クリア率: {totalClearedInChapter}/{chapterStages.length}
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-slate-950 border border-emerald-500/40 text-emerald-400 font-black text-xs md:text-sm">
            <Zap className="w-4 h-4" />
            <span>
              統率力: {playerData.energy} / {playerData.maxEnergy}
            </span>
            {playerData.energy < playerData.maxEnergy && (
              <span className="text-[10px] text-emerald-400/90 font-mono font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30 ml-0.5">
                +{Math.max(1, Math.ceil((15000 - ((Date.now() - (playerData.lastEnergyRefillTimestamp || Date.now())) % 15000)) / 1000))}s
              </span>
            )}
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

      {/* Chapter Navigation Tabs */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {[
          { id: 1, name: '第1章: 日本侵攻編', icon: '🏯' },
          { id: 2, name: '第2章: 宇宙エイリアン編', icon: '🪐' },
          { id: 3, name: '第3章: 神々との対決編', icon: '⛩️' },
        ].map((ch) => {
          const status = getChapterLockStatus(ch.id);
          const isSelected = selectedChapter === ch.id;

          return (
            <button
              key={ch.id}
              onClick={() => {
                soundManager.playClick();
                if (status.unlocked) {
                  setSelectedChapter(ch.id);
                  const firstStageOfCh = STAGES.find((s) => s.chapterId === ch.id);
                  if (firstStageOfCh) setActiveStage(firstStageOfCh);
                }
              }}
              disabled={!status.unlocked}
              className={`px-5 py-2.5 rounded-2xl text-xs md:text-sm font-black transition-all flex items-center gap-2 ${
                isSelected
                  ? 'bg-amber-500 text-slate-950 shadow-xl shadow-amber-500/20 scale-105 border-2 border-amber-300 cursor-pointer'
                  : status.unlocked
                  ? 'bg-slate-900/80 text-slate-300 hover:text-amber-300 border border-slate-800 cursor-pointer'
                  : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed opacity-60'
              }`}
            >
              <span>{ch.icon}</span>
              {!status.unlocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
              <span>{ch.name}</span>
            </button>
          );
        })}
      </div>

      {/* --- SCROLLABLE STAGE SELECT RIBBON BAR --- */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-bold text-amber-300/90 px-1">
          <span>🚩 関門クイック選択（横スクロール可能）</span>
          <span className="text-[10px] text-slate-400">👈 左右スワイプで全ステージ確認 ➔</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-amber-500 scrollbar-track-slate-900">
          {chapterStages.map((stg) => {
            const unlocked = isStageUnlocked(stg);
            const cleared = playerData.clearedStages.includes(stg.id);
            const isSelected = currentSelectedStage?.id === stg.id;
            const isBoss = stg.stageNumber === 10 || stg.enemySpawns.some((e) => e.isBossTrigger);

            return (
              <button
                key={stg.id}
                onClick={() => {
                  if (unlocked) {
                    soundManager.playClick();
                    setActiveStage(stg);
                  }
                }}
                disabled={!unlocked}
                className={`flex-shrink-0 px-3.5 py-2 rounded-2xl border-2 transition-all flex items-center gap-2 cursor-pointer min-w-[140px] text-left ${
                  stg.isSecretStage
                    ? 'bg-gradient-to-r from-red-950 via-slate-900 to-rose-950 border-rose-500 shadow-xl shadow-rose-600/30 text-rose-300 animate-pulse ring-2 ring-rose-500/80'
                    : isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-lg scale-105 ring-2 ring-amber-300/60'
                    : cleared
                    ? 'bg-slate-900/90 border-emerald-500/60 text-emerald-300 hover:border-emerald-400'
                    : unlocked
                    ? 'bg-slate-900/90 border-amber-500/60 text-amber-200 hover:border-amber-400'
                    : 'bg-slate-950 border-slate-800 text-slate-600 opacity-50 cursor-not-allowed'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                    stg.isSecretStage
                      ? 'bg-rose-950 text-rose-400 border border-rose-500 animate-bounce'
                      : isSelected
                      ? 'bg-slate-950 text-amber-400'
                      : cleared
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500'
                      : 'bg-slate-950 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  {stg.isSecretStage ? '💀' : isBoss ? '☠️' : stg.stageNumber}
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-extrabold text-xs truncate max-w-[90px]">{stg.name}</span>
                  <span className="text-[10px] font-bold opacity-80">
                    {stg.isSecretStage ? '⚠️ 裏ボス' : cleared ? '✓ クリア' : !unlocked ? '🔒 未開放' : `⚡ ${stg.energyCost}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- SCROLLABLE BATTLE CATS AUTHENTIC MAP CANVAS --- */}
      <div
        ref={mapScrollContainerRef}
        className="relative w-full rounded-3xl border-4 border-amber-500/60 shadow-2xl overflow-x-auto bg-slate-950 select-none scrollbar-thin scrollbar-thumb-amber-500 scrollbar-track-slate-900"
      >
        {/* Top Scroll Helper Banner Overlay & Secret Stage Alert */}
        <div className="absolute top-2 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="px-3 py-1 rounded-full bg-slate-950/80 border border-amber-500/40 text-[10px] md:text-xs font-black text-amber-300 backdrop-blur-md shadow-lg flex items-center gap-1.5">
            <span>🗺️ 左右にスクロールしてマップ全体を探索</span>
            <span className="animate-pulse text-amber-400">◄►</span>
          </div>

          {selectedChapter === 1 && playerData.clearedStages.includes('stage_1_50') && (
            <div className="px-4 py-1 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 text-white font-black text-xs md:text-sm border-2 border-amber-300 shadow-2xl animate-pulse flex items-center gap-1.5 pointer-events-auto">
              <span>⚠️【異次元の歪み出現】富士山頂の隣に第1章裏ボス「ステージ？？？」が出現！</span>
            </div>
          )}

          {selectedChapter === 2 && playerData.clearedStages.includes('stage_2_50') && (
            <div className="px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600 text-white font-black text-xs md:text-sm border-2 border-amber-300 shadow-2xl animate-pulse flex items-center gap-1.5 pointer-events-auto">
              <span>⚠️【銀河特異点出現】ブラックホールの隣に第2章裏ボス「ステージ？？？」が出現！</span>
            </div>
          )}

          {selectedChapter === 3 && playerData.clearedStages.includes('stage_3_50') && (
            <div className="px-4 py-1 rounded-full bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 text-white font-black text-xs md:text-sm border-2 border-amber-300 shadow-2xl animate-pulse flex items-center gap-1.5 pointer-events-auto">
              <span>⚠️【神域崩壊出現】ゼウスの隣に最高峰裏ボス「ステージ？？？」が出現！</span>
            </div>
          )}
        </div>

        {/* Wide Map Canvas Inner Wrapper */}
        <div className="relative min-w-[4800px] md:min-w-[5500px] h-80 md:h-96">
          {/* Chapter Background Styling */}
          {selectedChapter === 1 && (
            <div className="absolute inset-0 bg-gradient-to-br from-amber-950/60 via-slate-950 to-rose-950/50 opacity-90">
              <div className="absolute top-4 left-6 text-7xl opacity-20 pointer-events-none">🗻</div>
              <div className="absolute bottom-6 right-8 text-8xl opacity-20 pointer-events-none">🏯</div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl opacity-10 pointer-events-none font-black italic">
                JAPAN
              </div>
            </div>
          )}

          {selectedChapter === 2 && (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 opacity-90">
              <div className="absolute top-6 right-10 text-8xl opacity-20 pointer-events-none">🪐</div>
              <div className="absolute bottom-8 left-10 text-8xl opacity-20 pointer-events-none">🛰️</div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl opacity-10 pointer-events-none font-black italic">
                SPACE
              </div>
            </div>
          )}

          {selectedChapter === 3 && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-slate-950 to-amber-950 opacity-90">
              <div className="absolute top-6 left-12 text-8xl opacity-20 pointer-events-none">⛩️</div>
              <div className="absolute bottom-6 right-10 text-8xl opacity-20 pointer-events-none">👑</div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl opacity-10 pointer-events-none font-black italic">
                HEAVEN
              </div>
            </div>
          )}

          {/* SVG Route Path Line Connecting Map Nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <path
              d={`M ${nodePositions.map((pos) => `${pos.x}% ${pos.y}%`).join(' L ')}`}
              fill="none"
              stroke="rgba(245, 158, 11, 0.4)"
              strokeWidth="4"
              strokeDasharray="8 6"
              className="animate-pulse"
            />
          </svg>

          {/* Map Nodes (Stages) */}
          {chapterStages.map((stage, idx) => {
            const pos = nodePositions[idx] || { x: 50, y: 50 };
            const unlocked = isStageUnlocked(stage);
            const isCleared = playerData.clearedStages.includes(stage.id);
            const isCurrentActive = currentSelectedStage?.id === stage.id;
            const isBossStage =
              stage.stageNumber === 10 || stage.enemySpawns.some((e) => e.isBossTrigger);
            const isSecret = stage.isSecretStage;

            return (
              <div
                key={stage.id}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => {
                  if (unlocked) {
                    soundManager.playClick();
                    setActiveStage(stage);
                  }
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center cursor-pointer transition-transform hover:scale-110 active:scale-95 ${
                  !unlocked ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {/* Bouncing Cat Pin on current selected node */}
                {isCurrentActive && unlocked && (
                  <div className="absolute -top-10 text-2xl animate-bounce drop-shadow-[0_4px_10px_rgba(245,158,11,0.8)] z-30 flex flex-col items-center">
                    <span>🐱</span>
                    <div className="w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                  </div>
                )}

                {/* Node Circle Pin */}
                <div
                  className={`relative w-12 h-12 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center shadow-2xl transition-all ${
                    isSecret
                      ? 'bg-gradient-to-b from-red-600 via-slate-900 to-black border-rose-500 shadow-[0_0_30px_rgba(239,68,68,0.9)] animate-pulse ring-2 ring-rose-400'
                      : isCurrentActive
                      ? 'border-amber-300 ring-4 ring-amber-400/50 scale-110'
                      : isCleared
                      ? 'bg-slate-900/90 border-emerald-400/80 text-emerald-400'
                      : unlocked
                      ? 'bg-slate-900/90 border-amber-400 text-amber-300 animate-pulse'
                      : 'bg-slate-950 border-slate-700 text-slate-600'
                  } ${
                    isBossStage && !isSecret
                      ? 'bg-gradient-to-b from-rose-950 to-slate-900 border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.6)]'
                      : ''
                  }`}
                >
                  {/* Boss or Normal Icon */}
                  {isSecret ? (
                    <span className="text-xl md:text-2xl animate-bounce">💀</span>
                  ) : isBossStage ? (
                    <span className="text-xl md:text-2xl animate-pulse">☠️</span>
                  ) : isCleared ? (
                    <Check className="w-6 h-6 text-emerald-400" />
                  ) : !unlocked ? (
                    <Lock className="w-5 h-5 text-slate-600" />
                  ) : (
                    <span className="font-black text-sm md:text-base">{stage.stageNumber}</span>
                  )}

                  {/* Stage Number Label Badge */}
                  <div
                    className={`absolute -bottom-5 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider whitespace-nowrap shadow-md border ${
                      isSecret
                        ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
                        : isCleared
                        ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300'
                        : unlocked
                        ? 'bg-amber-950 border-amber-500/50 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-600'
                    }`}
                  >
                    {isSecret ? '⚠️ 裏ボス' : isBossStage ? 'BOSS' : `STAGE ${stage.stageNumber}`}
                  </div>
                </div>

                {/* Stage Name Hover Label */}
                <span
                  className={`mt-6 text-[10px] md:text-xs font-black px-2 py-0.5 rounded-lg border whitespace-nowrap shadow-md ${
                    isSecret
                      ? 'text-rose-300 bg-slate-950/90 border-rose-500/80 shadow-rose-900/50'
                      : 'text-slate-200 bg-slate-950/90 border-slate-800'
                  }`}
                >
                  {stage.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- SELECTED STAGE DETAIL DRAWER (BATTLE CATS SORTIE PANEL) --- */}
      {currentSelectedStage && (
        <div
          className={`p-5 rounded-3xl border-2 shadow-2xl space-y-4 animate-fadeIn relative ${
            currentSelectedStage.isSecretStage
              ? 'bg-gradient-to-b from-slate-950 via-red-950/40 to-slate-950 border-rose-500 shadow-rose-900/50'
              : 'bg-slate-900/95 border-amber-500/80'
          }`}
        >
          <div className="flex items-start justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full font-black text-xs border ${
                    currentSelectedStage.isSecretStage
                      ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
                      : 'bg-amber-500/20 border-amber-400 text-amber-300'
                  }`}
                >
                  {currentSelectedStage.isSecretStage
                    ? '⚠️ 隠し極悪ステージ'
                    : `${currentSelectedStage.chapterName} - STAGE ${currentSelectedStage.stageNumber}`}
                </span>
                {playerData.clearedStages.includes(currentSelectedStage.id) && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 font-black text-xs flex items-center gap-1">
                    <Check className="w-3 h-3" /> クリア済み
                  </span>
                )}
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-100 mt-1 flex items-center gap-2">
                <span>{currentSelectedStage.name}</span>
              </h3>
              <p
                className={`text-xs mt-1 ${
                  currentSelectedStage.isSecretStage
                    ? 'text-rose-300 font-bold bg-rose-950/40 p-2 rounded-xl border border-rose-800/50'
                    : 'text-slate-400'
                }`}
              >
                {currentSelectedStage.description}
              </p>
            </div>

            {/* Energy Cost Pill */}
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400">出撃必要エネルギー</span>
              <div className="px-3 py-1 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-400 font-black text-sm md:text-base flex items-center gap-1 mt-0.5">
                <Zap className="w-4 h-4" />
                <span>⚡ {currentSelectedStage.energyCost}</span>
              </div>
            </div>
          </div>

          {/* First Clear Reward & Enemy Lineup Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Reward Box */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-black text-amber-400 flex items-center gap-1.5 text-xs">
                <Gift className="w-4 h-4 text-amber-400" /> 初回クリア報酬
              </span>
              <div className="flex items-center gap-3 pt-1">
                <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                  🐟 猫缶: +{currentSelectedStage.firstClearRewardCatFood}
                </span>
                <span className="px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
                  ✨ XP: +{currentSelectedStage.firstClearRewardXp.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Enemy Lineup Box */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="font-black text-rose-400 flex items-center gap-1.5 text-xs">
                <Swords className="w-4 h-4 text-rose-400" /> 出現敵軍団予告
              </span>
              <div className="flex items-center gap-2 overflow-x-auto pt-1">
                {currentSelectedStage.enemySpawns.map((spawn, i) => {
                  const enemy = ENEMIES[spawn.enemyId];
                  if (!enemy) return null;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-bold whitespace-nowrap ${
                        enemy.isBoss
                          ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="text-xs">{enemy.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Big Yellow Battle Start Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                if (playerData.energy >= currentSelectedStage.energyCost) {
                  soundManager.playSpawn();
                  onSelectStage(currentSelectedStage);
                }
              }}
              disabled={playerData.energy < currentSelectedStage.energyCost}
              className={`w-full md:w-auto px-10 py-4 rounded-2xl font-black text-lg md:text-xl transition-all flex items-center justify-center gap-3 border-2 border-white shadow-[0_4px_20px_rgba(245,158,11,0.5)] cursor-pointer ${
                playerData.energy >= currentSelectedStage.energyCost
                  ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950'
                  : 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed shadow-none'
              }`}
            >
              <Play className="w-6 h-6 fill-current" />
              <span>いざ出撃！（⚡ {currentSelectedStage.energyCost} 消費）</span>
            </button>
          </div>
        </div>
      )}

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
