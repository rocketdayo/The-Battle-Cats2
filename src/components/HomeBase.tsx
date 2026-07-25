import React, { useState } from 'react';
import { PlayerData } from '../types';
import { soundManager } from '../utils/audio';
import {
  Swords,
  Zap,
  Users,
  BookOpen,
  FlaskConical,
  Wand2,
  Sparkles,
  ShoppingBag,
  Info,
  ChevronLeft,
  Volume2,
  VolumeX,
  Wrench,
} from 'lucide-react';

interface HomeBaseProps {
  playerData: PlayerData;
  onNavigate: (
    view: 'STAGE_SELECT' | 'POWER_UP' | 'DECK_BUILDER' | 'GACHA' | 'CODEX' | 'LAB' | 'AI_CAT',
    gachaTab?: 'nyanko' | 'rare'
  ) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

const CAT_ADVICES = [
  'アイテムのネコボンを使えば働きネコのレベルが最大の状態でステージを開始できるにゃ！詰まっているステージがあれば使ってみるといいにゃ！',
  '【キャラクター編成】で低コストの「ちびネコ」や「盾ネコ」を壁として大量生産し、後ろから長射程のネコで攻撃するのが勝利の鉄則だにゃ！',
  '【特注新種創生】では、自分だけのオリジナルネコを自由に生成してデッキに加えることができるにゃ！すごい時代になったにゃ〜！',
  '【パワーアップ】でXPを使ってネコをLv.10まで上げると、第2形態へ超進化するにゃ！さらに進化石で第3形態へ分岐進化するにゃ！',
  '敵城に攻撃を当てるとボスが出現することが多いにゃ！あらかじめ壁ネコを十分に溜めてから城を攻めるんだにゃ！',
  '神社ガチャで新しいレアネコを獲得すると戦力が大幅にアップするにゃ！猫缶が貯まったら引いてみるにゃ！',
  '統率力は15秒ごとに1ずつ回復するにゃ。ラボでネコカンを使って即時全回復することもできるにゃ！',
];

export const HomeBase: React.FC<HomeBaseProps> = ({
  playerData,
  onNavigate,
  onOpenDevTools,
  isMuted,
  onToggleMute,
}) => {
  const [adviceIndex, setAdviceIndex] = useState(0);

  // Calculate User Rank (Sum of all unlocked units' levels)
  const userRank = Object.values(playerData.unlockedUnits).reduce<number>(
    (sum, unit) => sum + ((unit as { level?: number })?.level || 1),
    0
  );

  const handleNextAdvice = () => {
    soundManager.playClick();
    setAdviceIndex((prev) => (prev + 1) % CAT_ADVICES.length);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-900/60 select-none font-sans min-h-[580px] flex flex-col justify-between bg-[#1b3d36] text-amber-100">
      {/* --- Japanese Traditional Karakusa / Pattern Background (SVG) --- */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="karakusa"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M30 0 C 45 0, 60 15, 60 30 C 60 45, 45 60, 30 60 C 15 60, 0 45, 0 30 C 0 15, 15 0, 30 0 Z"
                fill="none"
                stroke="#6ee7b7"
                strokeWidth="2"
              />
              <path
                d="M30 15 C 38 15, 45 22, 45 30 C 45 38, 38 45, 30 45 C 22 45, 15 38, 15 30 C 15 22, 22 15, 30 15 Z"
                fill="none"
                stroke="#a7f3d0"
                strokeWidth="1.5"
              />
              <circle cx="30" cy="30" r="4" fill="#6ee7b7" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#karakusa)" />
        </svg>
      </div>

      {/* --- TOP HEADER (Resource Bar & User Rank) --- */}
      <div className="relative z-10 p-3 md:p-4 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        {/* Top Left: Logo & User Rank */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="px-4 py-1.5 rounded-2xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 border-2 border-amber-300 shadow-lg text-amber-100 font-black tracking-widest text-lg md:text-xl transform -rotate-1">
              ネコ基地
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-amber-950/80 border-2 border-amber-500/80 shadow-md">
            <span className="text-[11px] md:text-xs font-black text-amber-400">ユーザーランク</span>
            <span className="text-base md:text-lg font-black text-white tracking-wider">
              {userRank}
            </span>
            <span className="text-xs text-amber-300 bg-amber-500/20 rounded-full px-1.5 py-0.2 border border-amber-400/40 font-bold">
              i
            </span>
          </div>
        </div>

        {/* Top Right: Resources & Audio Toggle */}
        <div className="flex items-center gap-2">
          {/* XP Bar */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-2xl bg-slate-950/90 border-2 border-cyan-500/80 shadow-md">
            <span className="text-xs font-black text-cyan-400">経験値 XP</span>
            <span className="text-sm md:text-base font-black text-cyan-200 tracking-wide">
              {playerData.xp.toLocaleString()}
            </span>
          </div>

          {/* Energy Bar */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-slate-950/90 border-2 border-emerald-500/80 shadow-md">
            <span className="text-xs font-black text-emerald-400">⚡ 統率力</span>
            <span className="text-xs font-black text-emerald-200">
              {playerData.energy}/{playerData.maxEnergy}
            </span>
            {playerData.energy < playerData.maxEnergy && (
              <span className="text-[10px] text-emerald-400/90 font-mono font-bold bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">
                +{Math.max(1, Math.ceil((15000 - ((Date.now() - (playerData.lastEnergyRefillTimestamp || Date.now())) % 15000)) / 1000))}s
              </span>
            )}
          </div>

          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-900/90 border border-amber-500/50 text-amber-400 hover:bg-slate-800 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* --- MIDDLE BODY CONTENT --- */}
      <div className="relative z-10 flex-1 px-4 md:px-8 py-2 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Left Column: Huge Classic Gold Command Buttons (3 Big Buttons) */}
        <div className="md:col-span-6 flex flex-col gap-3.5 my-auto">
          {/* 1. 戦闘開始!! */}
          <button
            onClick={() => {
              soundManager.playClick();
              onNavigate('STAGE_SELECT');
            }}
            className="group relative w-full py-3.5 md:py-4 px-6 rounded-3xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 border-4 border-amber-100 shadow-[0_8px_0_0_#78350f] hover:shadow-[0_4px_0_0_#78350f] hover:translate-y-1 active:translate-y-2 transition-all cursor-pointer text-center"
          >
            <div className="flex items-center justify-center gap-3">
              <Swords className="w-7 h-7 text-amber-950 filter drop-shadow group-hover:scale-110 transition-transform" />
              <span className="text-2xl md:text-3xl font-black text-amber-950 tracking-widest filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                戦闘開始!!
              </span>
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-900/30 border border-amber-950/40 flex items-center justify-center text-[10px] text-amber-950 font-bold">
              🐾
            </div>
          </button>

          {/* 2. パワーアップ */}
          <button
            onClick={() => {
              soundManager.playClick();
              onNavigate('POWER_UP');
            }}
            className="group relative w-full py-3.5 md:py-4 px-6 rounded-3xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 border-4 border-amber-100 shadow-[0_8px_0_0_#78350f] hover:shadow-[0_4px_0_0_#78350f] hover:translate-y-1 active:translate-y-2 transition-all cursor-pointer text-center"
          >
            <div className="flex items-center justify-center gap-3">
              <Zap className="w-7 h-7 text-amber-950 filter drop-shadow group-hover:scale-110 transition-transform" />
              <span className="text-2xl md:text-3xl font-black text-amber-950 tracking-widest filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                パワーアップ
              </span>
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-900/30 border border-amber-950/40 flex items-center justify-center text-[10px] text-amber-950 font-bold">
              🐾
            </div>
          </button>

          {/* 3. キャラクター編成 */}
          <button
            onClick={() => {
              soundManager.playClick();
              onNavigate('DECK_BUILDER');
            }}
            className="group relative w-full py-3.5 md:py-4 px-6 rounded-3xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 border-4 border-amber-100 shadow-[0_8px_0_0_#78350f] hover:shadow-[0_4px_0_0_#78350f] hover:translate-y-1 active:translate-y-2 transition-all cursor-pointer text-center"
          >
            <div className="flex items-center justify-center gap-3">
              <Users className="w-7 h-7 text-amber-950 filter drop-shadow group-hover:scale-110 transition-transform" />
              <span className="text-2xl md:text-3xl font-black text-amber-950 tracking-widest filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                キャラクター編成
              </span>
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-amber-900/30 border border-amber-950/40 flex items-center justify-center text-[10px] text-amber-950 font-bold">
              🐾
            </div>
          </button>

          {/* Sub Menu Icons (図鑑 / ラボ / AI新種創作) */}
          <div className="flex items-center justify-around gap-2 pt-2">
            <button
              onClick={() => {
                soundManager.playClick();
                onNavigate('CODEX');
              }}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border-2 border-amber-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-[11px] font-black text-amber-100 filter drop-shadow">メニュー/図鑑</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onNavigate('LAB');
              }}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border-2 border-cyan-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <FlaskConical className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="text-[11px] font-black text-cyan-100 filter drop-shadow">ガマトト/ラボ</span>
            </button>

            <button
              onClick={() => {
                soundManager.playClick();
                onNavigate('AI_CAT');
              }}
              className="relative flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-800 border-2 border-purple-300 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform animate-pulse">
                <Wand2 className="w-6 h-6 text-amber-300" />
              </div>
              <span className="absolute -top-2 -right-1 bg-rose-500 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-full border border-white animate-bounce">
                NEW!
              </span>
              <span className="text-[11px] font-black text-purple-200 filter drop-shadow">特注新種創生</span>
            </button>
          </div>
        </div>

        {/* Right Column: Cat Mascot with Speech Bubble (Advice) & Gacha Buttons */}
        <div className="md:col-span-6 flex flex-col items-center justify-between h-full space-y-3">
          {/* Advice Speech Bubble */}
          <div
            onClick={handleNextAdvice}
            className="relative w-full p-4 rounded-3xl bg-slate-900/95 border-4 border-slate-300 shadow-2xl cursor-pointer hover:border-amber-400 transition-all text-slate-100"
          >
            <p className="text-xs md:text-sm font-bold leading-relaxed text-amber-100">
              {CAT_ADVICES[adviceIndex]}
            </p>
            <div className="mt-2 text-right text-[10px] text-amber-400/80 font-bold">
              (タップでアドバイス切替 🐾)
            </div>

            {/* Bubble Tail Pointing Down-Right to the White Cat */}
            <div className="absolute -bottom-4 right-12 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[16px] border-t-slate-300" />
          </div>

          {/* Big White Cat Mascot Illustration */}
          <div className="relative flex items-center justify-center my-2">
            <div className="w-48 h-48 md:w-56 md:h-56 relative flex items-center justify-center">
              {/* Giant White Round Cat Body */}
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-white border-4 border-slate-900 shadow-2xl relative flex flex-col items-center justify-center">
                {/* Cat Ears */}
                <div className="absolute -top-5 left-6 w-8 h-8 bg-white border-t-4 border-l-4 border-slate-900 rounded-tl-xl transform -rotate-12" />
                <div className="absolute -top-5 right-6 w-8 h-8 bg-white border-t-4 border-r-4 border-slate-900 rounded-tr-xl transform rotate-12" />

                {/* Face Features */}
                <div className="flex items-center gap-12 -mt-4">
                  {/* Left Eye */}
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-900" />
                  {/* Right Eye */}
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-900" />
                </div>
                {/* Nose / Mouth */}
                <div className="text-xl font-bold text-slate-900 -mt-1 font-mono">ω</div>

                {/* Whiskers */}
                <div className="absolute left-2 top-20 w-5 h-0.5 bg-slate-900 transform -rotate-6" />
                <div className="absolute left-2 top-23 w-5 h-0.5 bg-slate-900 transform rotate-6" />
                <div className="absolute right-2 top-20 w-5 h-0.5 bg-slate-900 transform rotate-6" />
                <div className="absolute right-2 top-23 w-5 h-0.5 bg-slate-900 transform -rotate-6" />
              </div>
            </div>
          </div>

          {/* Bottom Right Gacha Icons Row */}
          <div className="w-full flex items-center justify-end gap-3 pt-2">
            {/* にゃんこガチャ */}
            <button
              onClick={() => {
                soundManager.playClick();
                onNavigate('GACHA', 'nyanko');
              }}
              className="relative px-4 py-2 rounded-2xl bg-lime-500 hover:bg-lime-400 border-2 border-lime-200 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-amber-400 border border-slate-900 flex items-center justify-center text-xs">
                🐱
              </div>
              <span>にゃんこガチャ</span>
              <span className="absolute -top-2 -right-2 bg-rose-600 text-white font-extrabold text-[10px] px-1.5 rounded-full border border-white">
                99
              </span>
            </button>

            {/* レアガチャ */}
            <button
              onClick={() => {
                soundManager.playClick();
                onNavigate('GACHA', 'rare');
              }}
              className="relative px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 border-2 border-amber-200 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>レアガチャ</span>
              <span className="absolute -top-2 -right-2 bg-rose-600 text-white font-extrabold text-[10px] px-1.5 rounded-full border border-white">
                99
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* --- BOTTOM FOOTER (Cat Food & Item Shop Bar) --- */}
      <div className="relative z-10 p-3 bg-amber-950/90 border-t-2 border-amber-700/80 flex items-center justify-between text-xs md:text-sm font-black">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('LAB')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-800 hover:bg-amber-700 border border-amber-400 text-amber-100 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-amber-300" />
            <span>アイテムショップ</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-amber-300">ネコカン</span>
          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-black/70 border border-amber-400 text-amber-300">
            <span>🐟</span>
            <span className="text-base text-white">{playerData.catFood}</span>
            <button
              onClick={() => onNavigate('LAB')}
              className="ml-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
