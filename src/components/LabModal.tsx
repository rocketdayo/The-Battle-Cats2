import React, { useState } from 'react';
import { FlaskConical, Sparkles, RefreshCw, Zap, Download, Upload, Ticket, Gift } from 'lucide-react';
import { soundManager } from '../utils/audio';
import { PlayerData } from '../types';
import { claimSerialCode } from '../utils/serialCodes';

interface LabModalProps {
  xp: number;
  catFood: number;
  stones: number;
  playerData: PlayerData;
  onImportSave: (saveData: PlayerData) => void;
  onUpdatePlayerData?: (updater: (prev: PlayerData) => PlayerData) => void;
  onClose: () => void;
  onConvertStonesToXp: (stoneAmount: number) => void;
  onRefillEnergy: () => void;
}

export const LabModal: React.FC<LabModalProps> = ({
  xp,
  catFood,
  stones,
  playerData,
  onImportSave,
  onUpdatePlayerData,
  onClose,
  onConvertStonesToXp,
  onRefillEnergy,
}) => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [serialInput, setSerialInput] = useState<string>('');

  const handleRedeemCode = () => {
    setErrorMsg(null);
    const { updatedPlayerData, result } = claimSerialCode(serialInput, playerData);

    if (result.success) {
      soundManager.playVictory();
      if (onUpdatePlayerData) {
        onUpdatePlayerData(() => updatedPlayerData);
      }
      setSuccessMsg(result.message);
      setSerialInput('');
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      soundManager.playClick();
      setErrorMsg(result.message);
      setTimeout(() => setErrorMsg(null), 3500);
    }
  };

  const handleStoneConvert = () => {
    if (stones < 1) return;
    soundManager.playLevelUp();
    onConvertStonesToXp(1);
    setSuccessMsg('進化石1個を 5,000 XPに変換しました！');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleEnergyRefill = () => {
    if (catFood < 30) return;
    soundManager.playVictory();
    onRefillEnergy();
    setSuccessMsg('猫缶30個を消費して統率力（エネルギー）を全回復しました！');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Export Save Data as JSON file
  const handleExportSave = () => {
    soundManager.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(playerData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `nyanko_war_2_save_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setSuccessMsg('セーブデータをファイル(JSON)としてダウンロード保存しました！');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Import Save Data from JSON file
  const handleImportSave = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && typeof parsed === 'object' && 'unlockedUnits' in parsed) {
            onImportSave(parsed as PlayerData);
            soundManager.playVictory();
            setSuccessMsg('セーブデータを読み込み、復元しました！');
            setTimeout(() => setSuccessMsg(null), 3000);
          } else {
            alert('無効なセーブデータファイルです');
          }
        } catch (err) {
          alert('ファイルの読み込みに失敗しました');
        }
      };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-cyan-500 shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-slate-950 font-black flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-slate-950" />
            <h2 className="text-lg">にゃんこ遺伝子研究所 (Cat Lab)</h2>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-slate-950/30 hover:bg-slate-950/50 text-white text-xs font-bold"
          >
            ✕ 閉じる
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-center">
          <p className="text-xs text-slate-300">
            あまりの素材を変換・研究し、戦闘を有利に進める実験室です。
          </p>

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold animate-bounce">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-400 text-rose-300 text-xs font-bold animate-pulse">
              {errorMsg}
            </div>
          )}

          <div className="space-y-3">
            {/* Serial Code Redemption Section */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/50 space-y-2.5">
              <div className="text-left flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <Ticket className="w-4 h-4 text-amber-400" />
                    <span>プレゼントシリアルコード入力</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    コードを入力して猫缶やプレゼント特典を無料で受け取りましょう！
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
                  <span>受け取る</span>
                </button>
              </div>

              <div className="text-[10px] text-slate-500 text-left font-bold flex items-center justify-between">
                <span>※大文字・小文字は自動調整されます</span>
                <span className="text-amber-400/80">サンプル: NYANKO50 / CATFOOD100</span>
              </div>
            </div>
            {/* Convert Evolution Stones to XP */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-xs font-black text-cyan-300">進化石の分解・XP還元</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">進化石1個 ➔ 5,000 XPに変換</p>
                <span className="text-xs font-bold text-amber-400">現在所持: 石{stones}個</span>
              </div>

              <button
                onClick={handleStoneConvert}
                disabled={stones < 1}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  stones >= 1
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                1個分解
              </button>
            </div>

            {/* Refill Energy using Cat Food */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="text-left">
                <h3 className="text-xs font-black text-amber-300">統率力（エネルギー）全回復</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">猫缶 30個で即時全回復</p>
                <span className="text-xs font-bold text-amber-400">現在所持: 猫缶{catFood}個</span>
              </div>

              <button
                onClick={handleEnergyRefill}
                disabled={catFood < 30}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  catFood >= 30
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer'
                    : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                }`}
              >
                全回復
              </button>
            </div>

            {/* Save Data File Backup & Restore */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-left">
                <h3 className="text-xs font-black text-purple-300">セーブデータのバックアップ / 復元 (ローカル保存)</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  ブラウザの自動保存(localStorage)に加えて、JSONファイルとしてPCに保存・読み込みできます。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleExportSave}
                  className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow"
                >
                  <Download className="w-4 h-4" />
                  <span>データ出力 (.json)</span>
                </button>

                <label className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow">
                  <Upload className="w-4 h-4" />
                  <span>データ復元</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportSave}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
