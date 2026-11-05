/**
 * Windows スタイル クイックツールバー
 */

import React from 'react';
import { 
  Footprints, Compass, Hand, ArrowDown, ArrowUp, 
  Backpack, Save, FolderOpen, HelpCircle, Volume2, VolumeX,
  ZoomIn, ZoomOut
} from 'lucide-react';

interface Props {
  onSearch: () => void;
  onWait: () => void;
  onPickup: () => void;
  onDescend: () => void;
  onAscend: () => void;
  onOpenInventory: () => void;
  onQuickSave: () => void;
  onQuickLoad: () => void;
  onOpenHelp: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  canDescend: boolean;
  canAscend: boolean;
}

export const WindowsToolbar: React.FC<Props> = ({
  onSearch,
  onWait,
  onPickup,
  onDescend,
  onAscend,
  onOpenInventory,
  onQuickSave,
  onQuickLoad,
  onOpenHelp,
  soundEnabled,
  onToggleSound,
  zoom,
  onZoomIn,
  onZoomOut,
  canDescend,
  canAscend
}) => {
  return (
    <div className="h-9 bg-slate-800/90 border-b border-slate-700/80 px-2 flex items-center justify-between gap-1 text-xs select-none shrink-0 shadow-inner">
      {/* 主要アクションボタングループ */}
      <div className="flex items-center gap-1">
        <button
          onClick={onWait}
          title="その場で1ターン待機 (Space / .)"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-slate-100 rounded border border-slate-600 shadow-sm transition-colors"
        >
          <Footprints size={14} className="text-amber-400" />
          <span className="font-medium text-xs">待機</span>
        </button>

        <button
          onClick={onSearch}
          title="周囲を探索 (s)"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-slate-100 rounded border border-slate-600 shadow-sm transition-colors"
        >
          <Compass size={14} className="text-cyan-400" />
          <span className="font-medium text-xs">探索</span>
        </button>

        <button
          onClick={onPickup}
          title="足元のアイテムを拾う (, / g)"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 active:bg-slate-500 text-slate-100 rounded border border-slate-600 shadow-sm transition-colors"
        >
          <Hand size={14} className="text-emerald-400" />
          <span className="font-medium text-xs">拾う</span>
        </button>

        <div className="h-4 w-px bg-slate-600 mx-1" />

        <button
          onClick={onDescend}
          disabled={!canDescend}
          title="階段を降りる (>)"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border shadow-sm transition-colors ${
            canDescend
              ? 'bg-blue-600 hover:bg-blue-500 text-white border-blue-400 animate-pulse'
              : 'bg-slate-800/60 text-slate-500 border-slate-700 cursor-not-allowed'
          }`}
        >
          <ArrowDown size={14} />
          <span className="font-medium text-xs">降りる</span>
        </button>

        <button
          onClick={onAscend}
          disabled={!canAscend}
          title="階段を上る (<)"
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded border shadow-sm transition-colors ${
            canAscend
              ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400 animate-pulse'
              : 'bg-slate-800/60 text-slate-500 border-slate-700 cursor-not-allowed'
          }`}
        >
          <ArrowUp size={14} />
          <span className="font-medium text-xs">上る</span>
        </button>

        <div className="h-4 w-px bg-slate-600 mx-1" />

        <button
          onClick={onOpenInventory}
          title="持ち物ウィンドウを開く (i)"
          className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-900/80 hover:bg-indigo-800 text-indigo-100 rounded border border-indigo-700 shadow-sm transition-colors"
        >
          <Backpack size={14} className="text-indigo-300" />
          <span className="font-medium text-xs">持ち物</span>
        </button>
      </div>

      {/* 右側機能ボタン: セーブ・音・ズーム・ヘルプ */}
      <div className="flex items-center gap-1">
        <button
          onClick={onQuickSave}
          title="クイックセーブ (F5)"
          className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded border border-slate-600 transition-colors"
        >
          <Save size={14} />
        </button>
        <button
          onClick={onQuickLoad}
          title="クイックロード (F9)"
          className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded border border-slate-600 transition-colors"
        >
          <FolderOpen size={14} />
        </button>

        <div className="h-4 w-px bg-slate-600 mx-1" />

        <button
          onClick={onZoomOut}
          title="マップ縮小"
          disabled={zoom <= 0.8}
          className="p-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 rounded border border-slate-600 transition-colors"
        >
          <ZoomOut size={13} />
        </button>
        <span className="text-[10px] font-mono text-slate-400 w-8 text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={onZoomIn}
          title="マップ拡大"
          disabled={zoom >= 1.6}
          className="p-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 rounded border border-slate-600 transition-colors"
        >
          <ZoomIn size={13} />
        </button>

        <div className="h-4 w-px bg-slate-600 mx-1" />

        <button
          onClick={onToggleSound}
          title={soundEnabled ? "効果音: ON" : "効果音: OFF"}
          className={`p-1.5 rounded border transition-colors ${
            soundEnabled
              ? 'bg-slate-700 hover:bg-slate-600 text-cyan-300 border-slate-600'
              : 'bg-rose-950/60 text-rose-400 border-rose-800'
          }`}
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>

        <button
          onClick={onOpenHelp}
          title="ヘルプ・操作ガイド (? / F1)"
          className="p-1.5 bg-slate-700 hover:bg-slate-600 text-amber-300 rounded border border-slate-600 transition-colors ml-1"
        >
          <HelpCircle size={14} />
        </button>
      </div>
    </div>
  );
};
