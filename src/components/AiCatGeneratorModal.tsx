import React, { useState } from 'react';
import { Sparkles, Wand2, ShieldAlert, CheckCircle2, Sword } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { CatUnitData } from '../types';

interface AiCatGeneratorModalProps {
  catFood: number;
  onClose: () => void;
  onCreateCustomUnit: (cost: number, newUnit: CatUnitData) => boolean;
}

export const AiCatGeneratorModal: React.FC<AiCatGeneratorModalProps> = ({
  catFood,
  onClose,
  onCreateCustomUnit,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [createdUnit, setCreatedUnit] = useState<CatUnitData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const CREATION_COST = 30; // 30 CatFood to generate a unique custom unit

  const handleGenerate = () => {
    if (catFood < CREATION_COST) {
      setErrorMsg(`猫缶が不足しています！（必要: ${CREATION_COST} 猫缶）`);
      return;
    }

    setErrorMsg(null);
    soundManager.playGacha();
    setIsGenerating(true);
    setCreatedUnit(null);

    setTimeout(() => {
      const keyword = prompt.trim() || '新種';
      const unitId = `ai_custom_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      // Select icon emoji
      const icons = ['🐙🐱', '🍩🐱', '🍜🐱', '🎮🐱', '🍵🐱', '🍕🐱', '🍣🐱', '🛸🐱', '⚡🐱', '🎨🐱', '🐉🐱', '🤖🐱', '💎🐱'];
      const pickedIcon = icons[Math.floor(Math.random() * icons.length)];

      // Roll Rarity Rank
      const roll = Math.random() * 100;
      let rarity: 'Normal' | 'Rare' | 'SuperRare' | 'Legend' = 'Normal';
      let multiplier = 1.0;
      let rarityTitle = '通常・新種変異';
      let rarityColor = '#94a3b8';

      if (roll < 3.0) {
        rarity = 'Legend';
        multiplier = 2.5;
        rarityTitle = '👑【超激レア】神話創世特種';
        rarityColor = '#f59e0b';
      } else if (roll < 18.0) {
        rarity = 'SuperRare';
        multiplier = 1.8;
        rarityTitle = '🔥【激レア】覚醒変異特種';
        rarityColor = '#a855f7';
      } else if (roll < 53.0) {
        rarity = 'Rare';
        multiplier = 1.3;
        rarityTitle = '✨【レア】精鋭進化特種';
        rarityColor = '#06b6d4';
      } else {
        rarity = 'Normal';
        multiplier = 1.0;
        rarityTitle = '🐾【ノーマル】基本原種';
        rarityColor = '#94a3b8';
      }

      // Generate random stats multiplied by Rarity factor
      const deployCost = Math.floor((Math.random() * 8 + 3) * 50); // 150 ~ 500
      const attackRange = Math.floor((Math.random() * 18 + 8) * 10); // 80 ~ 260
      const movementSpeed = Math.floor(Math.random() * 10 + 10); // 10 ~ 20
      const baseHp = Math.floor((Math.random() * 30 + 20) * 10 * multiplier); // scaled
      const baseAttack = Math.floor((Math.random() * 18 + 8) * 10 * multiplier); // scaled
      const isArea = rarity === 'Legend' || rarity === 'SuperRare' || Math.random() > 0.5;

      const newUnit: CatUnitData = {
        id: unitId,
        baseName: `${keyword}ニャンコ`,
        rarity,
        deployCost,
        cooldownSeconds: rarity === 'Legend' ? 6.0 : 4.5,
        attackRange,
        movementSpeed,
        attackSpeedSeconds: 1.5,
        baseHp,
        baseAttack,
        isAreaAttack: isArea,
        knockbackCount: rarity === 'Legend' ? 3 : 2,
        evolutions: {
          stage1: {
            stage: 1,
            name: `${keyword}ニャンコ`,
            title: `${rarityTitle}『${keyword}』`,
            description: `プレイヤーのアイデアとDNA解析技術により解明された【${rarity}】ランクの特殊にゃんこ。${isArea ? '範囲攻撃で敵陣を粉砕！' : '強力な単体攻撃を放つ！'}`,
            icon: pickedIcon,
            color: rarityColor,
            secondaryColor: '#475569',
            hpMultiplier: 1.0,
            attackMultiplier: 1.0,
            speedMultiplier: 1.0,
            requiredLevel: 1,
            evolutionCostXp: 0,
          },
          stage2: {
            stage: 2,
            name: `覚醒・${keyword}ニャンコ`,
            title: `覚醒せし創世種`,
            description: `秘めたパワーが全開となり、ステータスが飛躍的にアップした状態！`,
            icon: `✨${pickedIcon}`,
            color: '#a855f7',
            secondaryColor: '#581c87',
            hpMultiplier: 1.7,
            attackMultiplier: 1.8,
            speedMultiplier: 1.2,
            specialTrait: '攻撃力＆移動速度大幅上昇',
            requiredLevel: 10,
            evolutionCostXp: 3000,
          },
          stage3Branches: {
            branchA: {
              stage: 3,
              name: `極・${keyword}マスター`,
              title: `究極極致形態`,
              description: `『${keyword}』の真意を極めた極致形態。圧倒的な破壊力を誇る！`,
              icon: `🔥${pickedIcon}`,
              color: '#f43f5e',
              secondaryColor: '#881337',
              hpMultiplier: 3.2,
              attackMultiplier: 3.5,
              speedMultiplier: 1.3,
              specialTrait: '超攻撃型メガブースト',
              requiredLevel: 20,
              evolutionCostXp: 10000,
              evolutionStonesNeeded: 5,
            },
            branchB: {
              stage: 3,
              name: `聖・${keyword}ガーディアン`,
              title: '神聖守護形態',
              description: `『${keyword}』の聖なるオーラで味方の戦線を支える鉄壁形態。`,
              icon: `👑${pickedIcon}`,
              color: '#38bdf8',
              secondaryColor: '#0369a1',
              hpMultiplier: 4.2,
              attackMultiplier: 2.5,
              speedMultiplier: 1.1,
              specialTrait: '超耐久＆広範囲ガード',
              requiredLevel: 20,
              evolutionCostXp: 10000,
              evolutionStonesNeeded: 5,
            },
          },
        },
      };

      const success = onCreateCustomUnit(CREATION_COST, newUnit);
      setIsGenerating(false);

      if (success) {
        setCreatedUnit(newUnit);
        soundManager.playVictory();
      } else {
        setErrorMsg('創作ユニットの保存に失敗しました');
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border-2 border-purple-500 shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white font-black flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="text-base">特注新種ニャンコ創生ラボ</h2>
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
            好きなキーワードを入力すると、DNA遺伝子解析技術が世界に一匹だけのオリジナルキャラクターを自動生成！
            作成したユニットは<strong className="text-purple-300">「デッキ編成」に組み込んで実際のバトルへ出撃可能</strong>になります！
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-purple-500/40 text-purple-300 font-bold text-xs">
            <span>🐟 創作必要コスト:</span>
            <span className="text-amber-400 font-black">{CREATION_COST} 猫缶</span>
            <span className="text-slate-500">（所持: {catFood}）</span>
          </div>

          {/* Generation Rarity Probabilities Box */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-purple-500/30 text-left space-y-2">
            <div className="flex items-center justify-between border-b border-purple-900/50 pb-1.5">
              <span className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>遺伝子創生レアリティ排出確率 ＆ ステータス倍率</span>
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
              <div className="p-2 rounded-xl bg-gradient-to-b from-amber-500/20 to-amber-950/40 border border-amber-400/40">
                <div className="font-black text-amber-300 text-[10px]">👑 超激レア</div>
                <div className="text-sm font-black text-amber-400 mt-0.5">3.0%</div>
                <div className="text-[9px] text-amber-300/80 font-bold">HP&攻 2.5倍</div>
              </div>
              <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30">
                <div className="font-black text-purple-300 text-[10px]">🔥 激レア</div>
                <div className="text-sm font-black text-purple-400 mt-0.5">15.0%</div>
                <div className="text-[9px] text-purple-300/80 font-bold">HP&攻 1.8倍</div>
              </div>
              <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
                <div className="font-black text-cyan-300 text-[10px]">✨ レア</div>
                <div className="text-sm font-black text-cyan-400 mt-0.5">35.0%</div>
                <div className="text-[9px] text-cyan-300/80 font-bold">HP&攻 1.3倍</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-700">
                <div className="font-black text-slate-400 text-[10px]">🐾 ノーマル</div>
                <div className="text-sm font-black text-slate-300 mt-0.5">47.0%</div>
                <div className="text-[9px] text-slate-400 font-bold">標準ステ</div>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例: たこ焼き、忍者、宇宙戦艦、抹茶、ラーメン..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold focus:outline-none focus:border-purple-400 text-slate-100"
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || catFood < CREATION_COST}
              className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg ${
                catFood >= CREATION_COST && !isGenerating
                  ? 'bg-purple-500 hover:bg-purple-400 text-slate-950'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              創生する
            </button>
          </div>

          {isGenerating && (
            <div className="py-8 space-y-3">
              <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-purple-300 font-bold animate-pulse">新種にゃんこのステータス＆形態データを構築中...</p>
            </div>
          )}

          {createdUnit && !isGenerating && (
            <div className="p-5 rounded-2xl bg-slate-950 border-2 border-purple-500 text-left space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{createdUnit.evolutions.stage1.icon}</span>
                  <div>
                    <h3 className="text-base font-black text-purple-300">{createdUnit.baseName}</h3>
                    <p className="text-[10px] text-amber-400 font-bold">{createdUnit.evolutions.stage1.title}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-500/50 text-purple-300 text-xs font-black">
                  {createdUnit.rarity}
                </span>
              </div>

              <p className="text-xs text-slate-300">{createdUnit.evolutions.stage1.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold text-slate-300 bg-slate-900 p-2.5 rounded-xl">
                <div>コスト: <span className="text-amber-400 font-black">${createdUnit.deployCost}</span></div>
                <div>HP: <span className="text-emerald-400 font-black">{createdUnit.baseHp}</span></div>
                <div>攻撃力: <span className="text-rose-400 font-black">{createdUnit.baseAttack}</span></div>
                <div>射程: <span className="text-cyan-400 font-black">{createdUnit.attackRange}</span></div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>獲得完了！「編成」でデッキにセットして出撃させよう！</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

