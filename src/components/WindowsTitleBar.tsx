/**
 * Windows スタイル タイトルバー
 */

import React from 'react';
import { Minus, Square, X, Shield, Maximize2, Monitor } from 'lucide-react';

interface Props {
  dungeonLevel: number;
  hasAmulet: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onMinimize?: () => void;
  onClose?: () => void;
}

export const WindowsTitleBar: React.FC<Props> = ({
  dungeonLevel,
  hasAmulet,
  isFullscreen,
  onToggleFullscreen,
  onMinimize,
  onClose
}) => {
  return (
    <div className="h-8 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 border-b border-slate-700 flex items-center justify-between px-2 text-xs font-sans select-none shrink-0 shadow-sm">
      {/* 左側: アイコン & ウィンドウタイトル */}
      <div className="flex items-center gap-2 text-white font-medium truncate">
        <div className="w-4 h-4 bg-amber-500 rounded-sm flex items-center justify-center text-slate-950 font-bold text-[10px] shadow">
          @
        </div>
        <span className="font-semibold tracking-wide">元祖 ローグ 日本語版 (Windows Edition)</span>
        <span className="text-blue-300 font-mono">
          - 地下 {dungeonLevel} 階
        </span>
        {hasAmulet && (
          <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-bold rounded text-[10px] animate-pulse">
            ★ 魔除け保持中！
          </span>
        )}
      </div>

      {/* 右側: 最小化・最大化・閉じるボタン */}
      <div className="flex items-center gap-1">
        <button
          onClick={onMinimize}
          title="最小化"
          className="w-6 h-5 flex items-center justify-center text-slate-300 hover:bg-blue-700 rounded transition-colors"
        >
          <Minus size={12} />
        </button>
        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? "ウィンドウ表示" : "全画面表示"}
          className="w-6 h-5 flex items-center justify-center text-slate-300 hover:bg-blue-700 rounded transition-colors"
        >
          {isFullscreen ? <Maximize2 size={11} /> : <Square size={11} />}
        </button>
        <button
          onClick={onClose}
          title="閉じる"
          className="w-6 h-5 flex items-center justify-center text-slate-300 hover:bg-rose-600 hover:text-white rounded transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
};
