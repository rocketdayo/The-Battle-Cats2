import React, { useState } from 'react';
import { Sparkles, Bot, Wand2 } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface AiCatGeneratorModalProps {
  onClose: () => void;
  onRewardXpAndCatFood: (xp: number, catFood: number) => void;
}

export const AiCatGeneratorModal: React.FC<AiCatGeneratorModalProps> = ({
  onClose,
  onRewardXpAndCatFood,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{
    name: string;
    icon: string;
    type: string;
    stage1Desc: string;
    stage2Desc: string;
    branchADesc: string;
    branchBDesc: string;
    specialMove: string;
  } | null>(null);

  const handleGenerate = () => {
    soundManager.playGacha();
    setIsGenerating(true);
    setResult(null);

    setTimeout(() => {
      // Create creative character design response
      const themes = [
        { name: 'たこ焼きニャンコ', icon: '🐙🐱', type: '火炎＆バインド', move: '熱々ソース大噴射' },
        { name: 'ドーナツリングニャンコ', icon: '🍩🐱', type: '超高耐久タンク', move: 'シュガーバリアシュート' },
        { name: 'ラーメン職人にゃんこ', icon: '🍜🐱', type: '範囲高速連打', move: '湯切り十段突き' },
        { name: 'ゲーマー配信者ニャンコ', icon: '🎮🐱', type: '遠距離電子波動', move: 'スパチャ集中砲火' },
      ];

      const picked = themes[Math.floor(Math.random() * themes.length)];

      setResult({
        name: prompt ? `${prompt}ニャンコ` : picked.name,
        icon: picked.icon,
        type: picked.type,
        stage1Desc: 'どこか愛くるしい新種のにゃんこ。好奇心旺盛で何にでも首を突っ込む。',
        stage2Desc: '特訓の末、内に秘めた能力が開花！攻撃力と攻撃スピードが格段に向上した。',
        branchADesc: '【分岐A: 漆黒型】暗黒エネルギーを纏い、敵城を直接狙撃する超高火力ストライカー。',
        branchBDesc: '【分岐B: 光輝型】神聖なオーラで味方の体力を自動回復させるハイパーサポーター。',
        specialMove: picked.move,
      });

      setIsGenerating(false);
      onRewardXpAndCatFood(1000, 50);
      soundManager.playVictory();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border-2 border-purple-500 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="text-base">AIオリジナルにゃんこ創造ラボ</h2>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-slate-950/30 hover:bg-slate-950/50 text-white text-xs font-bold"
          >
            ✕ 閉じる
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-center flex-1">
          <p className="text-xs text-slate-300 leading-relaxed">
            キーワードを入力すると、AIが世界に一匹だけの「新種にゃんこ」の進化ストーリーとデザイン案を創作します！（生成ごとにボーナスXP＆猫缶をプレゼント）
          </p>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例: たこ焼き、忍者、宇宙戦艦、抹茶..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold focus:outline-none focus:border-purple-400 text-slate-100"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <Wand2 className="w-4 h-4" />
              創造する
            </button>
          </div>

          {isGenerating && (
            <div className="py-8 space-y-3">
              <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-purple-300 font-bold animate-pulse">新種にゃんこの遺伝子コードを構築中...</p>
            </div>
          )}

          {result && !isGenerating && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-purple-500/40 text-left space-y-3 animate-fadeIn">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{result.icon}</span>
                <div>
                  <h3 className="text-base font-black text-purple-300">{result.name}</h3>
                  <p className="text-xs text-amber-400 font-bold">必殺技: {result.specialMove}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <p><strong>【第1形態】:</strong> {result.stage1Desc}</p>
                <p><strong>【第2形態】:</strong> {result.stage2Desc}</p>
                <p className="text-cyan-300"><strong>【第3形態 分岐A】:</strong> {result.branchADesc}</p>
                <p className="text-pink-300"><strong>【第3形態 分岐B】:</strong> {result.branchBDesc}</p>
              </div>

              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs text-center font-bold">
                🎁 創造ボーナス獲得: +1,000 XP & +50 猫缶！
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
