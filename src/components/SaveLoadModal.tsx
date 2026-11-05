/**
 * Windows スタイル セーブ/ロード & ハイスコア管理ダイアログ
 */

import React, { useState } from 'react';
import { X, Save, FolderOpen, Download, Upload, Trophy, AlertTriangle, Check } from 'lucide-react';
import { getHighScores } from '../services/gameEngine';

interface Props {
  onQuickSave: () => void;
  onQuickLoad: () => void;
  onExportJson: () => void;
  onImportJson: (jsonStr: string) => void;
  onClose: () => void;
}

export const SaveLoadModal: React.FC<Props> = ({
  onQuickSave,
  onQuickLoad,
  onExportJson,
  onImportJson,
  onClose
}) => {
  const [tab, setTab] = useState<'SAVE_LOAD' | 'SCORES'>('SAVE_LOAD');
  const [importText, setImportText] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const scores = getHighScores();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          try {
            onImportJson(content);
            setMsg('セーブデータを正常にインポートしました！');
          } catch {
            setMsg('ファイルの読み込みに失敗しました。正しいJSONセーブデータか確認してください。');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleManualImport = () => {
    if (!importText.trim()) return;
    try {
      onImportJson(importText);
      setMsg('セーブデータを復元しました！');
    } catch {
      setMsg('無効なセーブデータ形式です。');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-slate-600 rounded shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* ウィンドウタイトルバー */}
        <div className="h-8 bg-blue-900 border-b border-blue-700 px-3 flex items-center justify-between text-xs text-white font-sans select-none shrink-0">
          <div className="flex items-center gap-2 font-semibold">
            <Save size={14} className="text-amber-400" />
            <span>セーブデータ管理 & 歴代冒険者記録</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center hover:bg-rose-600 rounded text-slate-300 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* タブ切り替え */}
        <div className="bg-slate-800 border-b border-slate-700 px-3 py-1.5 flex items-center gap-2 text-xs shrink-0">
          <button
            onClick={() => setTab('SAVE_LOAD')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
              tab === 'SAVE_LOAD' ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FolderOpen size={13} />
            <span>セーブ & ロード (ファイル入出力)</span>
          </button>
          <button
            onClick={() => setTab('SCORES')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
              tab === 'SCORES' ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Trophy size={13} />
            <span>ハイスコアランキング</span>
          </button>
        </div>

        {/* メッセージ通知 */}
        {msg && (
          <div className="bg-emerald-950/80 border-b border-emerald-700 px-4 py-2 text-xs text-emerald-300 flex items-center gap-2">
            <Check size={14} />
            <span>{msg}</span>
          </div>
        )}

        {/* コンテンツ */}
        <div className="flex-1 p-4 overflow-y-auto text-xs text-slate-200 leading-relaxed space-y-4">
          {tab === 'SAVE_LOAD' ? (
            <div className="space-y-4">
              {/* ブラウザスロット */}
              <div className="bg-slate-800/70 border border-slate-700 rounded p-3 space-y-2">
                <div className="font-bold text-slate-200 text-xs">【スロットセーブ (LocalStorage)】</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onQuickSave();
                      setMsg('現在の冒険状態をクイックスロットに保存しました！ (F5)');
                    }}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Save size={14} />
                    <span>クイックセーブ (F5)</span>
                  </button>
                  <button
                    onClick={() => {
                      onQuickLoad();
                      setMsg('クイックスロットから冒険を復元しました！ (F9)');
                    }}
                    className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium flex items-center justify-center gap-2 transition-colors border border-slate-600"
                  >
                    <FolderOpen size={14} />
                    <span>クイックロード (F9)</span>
                  </button>
                </div>
              </div>

              {/* JSONファイルのエクスポート & インポート */}
              <div className="bg-slate-800/70 border border-slate-700 rounded p-3 space-y-3">
                <div className="font-bold text-slate-200 text-xs">【Windowsファイル入出力 (バックアップ/移行)】</div>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onExportJson();
                      setMsg('セーブデータファイル (rogue_save.json) を書き出しました！');
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download size={14} />
                    <span>セーブデータをJSONファイルとして保存 (エクスポート)</span>
                  </button>

                  <div className="flex items-center gap-2 pt-1">
                    <label className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded font-medium flex items-center justify-center gap-2 cursor-pointer border border-slate-600 transition-colors">
                      <Upload size={14} />
                      <span>JSONファイルを選択してロード</span>
                      <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/60">
                  <div className="text-[11px] text-slate-400 mb-1">またはJSON文字列を直接貼り付け:</div>
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="JSONデータをここに貼り付け..."
                    className="w-full h-16 bg-slate-950 border border-slate-700 rounded p-2 text-[10px] font-mono text-slate-300 resize-none"
                  />
                  <button
                    onClick={handleManualImport}
                    disabled={!importText.trim()}
                    className="mt-1 px-3 py-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 rounded text-xs transition-colors"
                  >
                    テキストから復元
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-slate-400 text-xs">
                ダンジョンに挑んだ歴代の冒険者たちの栄光の記録です。
              </div>

              {scores.length === 0 ? (
                <div className="text-center text-slate-500 py-10">
                  記録された冒険はまだありません
                </div>
              ) : (
                <div className="space-y-2">
                  {scores.map((sc: { name: string; score: number; gold: number; level: number; dungeonLevel: number; date: string; causeOfDeath: string; hasAmulet: boolean }, idx: number) => (
                    <div key={idx} className="bg-slate-800/60 border border-slate-700/80 rounded p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                          idx === 0 ? 'bg-amber-500 text-slate-950' : (idx === 1 ? 'bg-slate-300 text-slate-950' : (idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'))
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-100 flex items-center gap-2">
                            <span>{sc.name}</span>
                            {sc.hasAmulet && (
                              <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] rounded font-bold">
                                魔除け生還！
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {sc.causeOfDeath} (地下 {sc.dungeonLevel} 階) · {sc.date}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-amber-300 text-sm">
                          {sc.score.toLocaleString()} 点
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Gold: {sc.gold} / Lv.{sc.level}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="h-10 bg-slate-800 border-t border-slate-700 px-4 flex items-center justify-end text-xs">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded font-medium transition-colors border border-slate-600"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
