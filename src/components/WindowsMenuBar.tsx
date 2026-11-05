/**
 * Windows スタイル メニューバー
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Save, FolderOpen, RefreshCw, Eye, Sparkles, Volume2, 
  HelpCircle, Backpack, Compass, Footprints, ArrowDown, ArrowUp, 
  Check, Gamepad2, Settings as SettingsIcon, Award
} from 'lucide-react';
import { DisplayStyle } from '../types/rogue';

interface Props {
  onNewGame: () => void;
  onQuickSave: () => void;
  onQuickLoad: () => void;
  onOpenSaveModal: () => void;
  onOpenInventory: () => void;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
  onSearch: () => void;
  onWait: () => void;
  onDescend: () => void;
  onAscend: () => void;
  displayStyle: DisplayStyle;
  onChangeDisplayStyle: (style: DisplayStyle) => void;
  crtEffect: boolean;
  onToggleCrt: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hasGamepad: boolean;
  gamepadName: string | null;
}

export const WindowsMenuBar: React.FC<Props> = ({
  onNewGame,
  onQuickSave,
  onQuickLoad,
  onOpenSaveModal,
  onOpenInventory,
  onOpenHelp,
  onOpenSettings,
  onSearch,
  onWait,
  onDescend,
  onAscend,
  displayStyle,
  onChangeDisplayStyle,
  crtEffect,
  onToggleCrt,
  soundEnabled,
  onToggleSound,
  hasGamepad,
  gamepadName
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const close = () => setOpenMenu(null);

  return (
    <div ref={menuRef} className="h-6 bg-slate-900 border-b border-slate-700/80 flex items-center px-2 text-xs select-none relative z-40 text-slate-200">
      <div className="flex items-center gap-1">
        {/* ファイル (F) */}
        <div className="relative">
          <button
            onClick={() => toggle('file')}
            className={`px-2 py-0.5 rounded transition-colors ${openMenu === 'file' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
          >
            ファイル(<span className="underline">F</span>)
          </button>
          {openMenu === 'file' && (
            <div className="absolute top-full left-0 mt-0.5 w-56 bg-slate-800 border border-slate-600 rounded shadow-xl py-1 z-50 text-slate-100">
              <button
                onClick={() => { close(); onNewGame(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2"><RefreshCw size={13} /> 新規冒険を始める</span>
                <span className="text-[10px] text-slate-400">Ctrl+N</span>
              </button>
              <div className="my-1 border-t border-slate-700" />
              <button
                onClick={() => { close(); onQuickSave(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2"><Save size={13} /> クイックセーブ</span>
                <span className="text-[10px] text-slate-400">F5</span>
              </button>
              <button
                onClick={() => { close(); onQuickLoad(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2"><FolderOpen size={13} /> クイックロード</span>
                <span className="text-[10px] text-slate-400">F9</span>
              </button>
              <button
                onClick={() => { close(); onOpenSaveModal(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2"><FileText size={13} /> セーブデータ管理...</span>
              </button>
            </div>
          )}
        </div>

        {/* 操作 (C) */}
        <div className="relative">
          <button
            onClick={() => toggle('commands')}
            className={`px-2 py-0.5 rounded transition-colors ${openMenu === 'commands' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
          >
            操作(<span className="underline">C</span>)
          </button>
          {openMenu === 'commands' && (
            <div className="absolute top-full left-0 mt-0.5 w-52 bg-slate-800 border border-slate-600 rounded shadow-xl py-1 z-50 text-slate-100">
              <button
                onClick={() => { close(); onSearch(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2"><Compass size={13} /> 周囲を探索</span>
                <span className="text-[10px] text-slate-400">s / Xボタン</span>
              </button>
              <button
                onClick={() => { close(); onWait(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2"><Footprints size={13} /> その場で待機</span>
                <span className="text-[10px] text-slate-400">. / Space / B</span>
              </button>
              <div className="my-1 border-t border-slate-700" />
              <button
                onClick={() => { close(); onDescend(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2"><ArrowDown size={13} /> 階段を降りる</span>
                <span className="text-[10px] text-slate-400">&gt; / LT</span>
              </button>
              <button
                onClick={() => { close(); onAscend(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2"><ArrowUp size={13} /> 階段を上る</span>
                <span className="text-[10px] text-slate-400">&lt; / RT</span>
              </button>
            </div>
          )}
        </div>

        {/* 所持品 (I) */}
        <div className="relative">
          <button
            onClick={() => toggle('inventory')}
            className={`px-2 py-0.5 rounded transition-colors ${openMenu === 'inventory' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
          >
            持ち物(<span className="underline">I</span>)
          </button>
          {openMenu === 'inventory' && (
            <div className="absolute top-full left-0 mt-0.5 w-52 bg-slate-800 border border-slate-600 rounded shadow-xl py-1 z-50 text-slate-100">
              <button
                onClick={() => { close(); onOpenInventory(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2"><Backpack size={13} /> 持ち物一覧を開く</span>
                <span className="text-[10px] text-slate-400">i / Yボタン</span>
              </button>
            </div>
          )}
        </div>

        {/* 表示 (V) */}
        <div className="relative">
          <button
            onClick={() => toggle('view')}
            className={`px-2 py-0.5 rounded transition-colors ${openMenu === 'view' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
          >
            表示(<span className="underline">V</span>)
          </button>
          {openMenu === 'view' && (
            <div className="absolute top-full left-0 mt-0.5 w-60 bg-slate-800 border border-slate-600 rounded shadow-xl py-1 z-50 text-slate-100">
              <div className="px-3 py-1 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                レンダリングスタイル
              </div>
              <button
                onClick={() => { close(); onChangeDisplayStyle('RETRO_DOS'); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 flex items-center justify-between text-xs"
              >
                <span>DOS / PC-98 カラー</span>
                {displayStyle === 'RETRO_DOS' && <Check size={14} className="text-emerald-400" />}
              </button>
              <button
                onClick={() => { close(); onChangeDisplayStyle('CLASSIC_ASCII'); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 flex items-center justify-between text-xs"
              >
                <span>クラシック 1980 ASCII</span>
                {displayStyle === 'CLASSIC_ASCII' && <Check size={14} className="text-emerald-400" />}
              </button>
              <button
                onClick={() => { close(); onChangeDisplayStyle('GREEN_PHOSPHOR'); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 flex items-center justify-between text-xs"
              >
                <span>グリーン蛍光管 (CRT風)</span>
                {displayStyle === 'GREEN_PHOSPHOR' && <Check size={14} className="text-emerald-400" />}
              </button>
              <button
                onClick={() => { close(); onChangeDisplayStyle('MODERN_TILES'); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 flex items-center justify-between text-xs"
              >
                <span>モダン・ハイコントラスト</span>
                {displayStyle === 'MODERN_TILES' && <Check size={14} className="text-emerald-400" />}
              </button>
              <div className="my-1 border-t border-slate-700" />
              <button
                onClick={() => { close(); onToggleCrt(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2"><Sparkles size={13} /> CRT走査線エフェクト</span>
                {crtEffect && <Check size={14} className="text-emerald-400" />}
              </button>
              <button
                onClick={() => { close(); onToggleSound(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2"><Volume2 size={13} /> 効果音 (Web Audio)</span>
                {soundEnabled && <Check size={14} className="text-emerald-400" />}
              </button>
            </div>
          )}
        </div>

        {/* ヘルプ (H) */}
        <div className="relative">
          <button
            onClick={() => toggle('help')}
            className={`px-2 py-0.5 rounded transition-colors ${openMenu === 'help' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'}`}
          >
            ヘルプ(<span className="underline">H</span>)
          </button>
          {openMenu === 'help' && (
            <div className="absolute top-full left-0 mt-0.5 w-56 bg-slate-800 border border-slate-600 rounded shadow-xl py-1 z-50 text-slate-100">
              <button
                onClick={() => { close(); onOpenHelp(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2"><HelpCircle size={13} /> 操作マニュアル・図鑑</span>
                <span className="text-[10px] text-slate-400">? / F1</span>
              </button>
              <button
                onClick={() => { close(); onOpenSettings(); }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-600 flex items-center justify-between text-xs"
              >
                <span className="flex items-center gap-2"><SettingsIcon size={13} /> 設定</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 右側: ゲームパッド接続ステータス通知 */}
      <div className="ml-auto flex items-center gap-2 text-[11px] text-slate-400">
        {hasGamepad ? (
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded text-[10px]">
            <Gamepad2 size={12} />
            <span className="truncate max-w-[130px]">{gamepadName || 'パッド接続中'}</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 text-slate-500">
            <Gamepad2 size={12} />
            <span className="text-[10px]">パッド未検出</span>
          </span>
        )}
      </div>
    </div>
  );
};
