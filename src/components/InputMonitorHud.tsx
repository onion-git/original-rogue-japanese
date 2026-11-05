/**
 * 入力モニター HUD & 8方向オンスクリーンコントローラー
 * キーボード/ゲームパッドの入力時にリアルタイムで点灯し、
 * マウスでも直接クリックして操作可能な三位一体型HUD
 */

import React from 'react';
import { 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, 
  ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight,
  Footprints, Compass, Hand, Gamepad2, Keyboard
} from 'lucide-react';

interface Props {
  lastAction: string | null;
  activeDirection: string | null;
  onMove: (dx: number, dy: number) => void;
  onWait: () => void;
  onSearch: () => void;
  onPickup: () => void;
}

export const InputMonitorHud: React.FC<Props> = ({
  lastAction,
  activeDirection,
  onMove,
  onWait,
  onSearch,
  onPickup
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-2.5 shadow-xl flex flex-col items-center select-none backdrop-blur-sm">
      {/* 入力ログ通知バッジ (入力があった瞬間に光る) */}
      <div className="w-full flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[11px]">
        <div className="flex items-center gap-1 text-slate-400">
          <Keyboard size={12} className="text-cyan-400" />
          <span className="text-[10px] font-mono">操作入力:</span>
        </div>
        <div className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all duration-150 ${
          lastAction 
            ? 'bg-amber-500 text-slate-950 scale-105 shadow-sm' 
            : 'bg-slate-800 text-slate-400'
        }`}>
          {lastAction || '待機中 (キー/パッド入力可)'}
        </div>
      </div>

      {/* 8方向パッド グリッド (3x3) */}
      <div className="grid grid-cols-3 gap-1 w-36 h-36">
        {/* 左上 (7 / Y / Q) */}
        <button
          onClick={() => onMove(-1, -1)}
          title="左上 (Q / 7 / y)"
          className={`rounded flex flex-col items-center justify-center transition-all ${
            activeDirection === 'NW'
              ? 'bg-amber-400 text-slate-950 scale-95 font-bold shadow'
              : 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 border border-slate-700'
          }`}
        >
          <ArrowUpLeft size={16} />
          <span className="text-[9px] font-mono opacity-60">Q/7</span>
        </button>

        {/* 上 (8 / K / W / ↑) */}
        <button
          onClick={() => onMove(0, -1)}
          title="上 (W / 8 / k / ↑)"
          className={`rounded flex flex-col items-center justify-center transition-all ${
            activeDirection === 'N'
              ? 'bg-amber-400 text-slate-950 scale-95 font-bold shadow'
              : 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 border border-slate-700'
          }`}
        >
          <ArrowUp size={16} />
          <span className="text-[9px] font-mono opacity-60">W/8/↑</span>
        </button>

        {/* 右上 (9 / U / E) */}
        <button
          onClick={() => onMove(1, -1)}
          title="右上 (E / 9 / u)"
          className={`rounded flex flex-col items-center justify-center transition-all ${
            activeDirection === 'NE'
              ? 'bg-amber-400 text-slate-950 scale-95 font-bold shadow'
              : 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 border border-slate-700'
          }`}
        >
          <ArrowUpRight size={16} />
          <span className="text-[9px] font-mono opacity-60">E/9</span>
        </button>

        {/* 左 (4 / H / A / ←) */}
        <button
          onClick={() => onMove(-1, 0)}
          title="左 (A / 4 / h / ←)"
          className={`rounded flex flex-col items-center justify-center transition-all ${
            activeDirection === 'W'
              ? 'bg-amber-400 text-slate-950 scale-95 font-bold shadow'
              : 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 border border-slate-700'
          }`}
        >
          <ArrowLeft size={16} />
          <span className="text-[9px] font-mono opacity-60">A/4/←</span>
        </button>

        {/* 中央: 待機 (5 / Space / .) */}
        <button
          onClick={onWait}
          title="待機 (Space / 5 / .)"
          className={`rounded flex flex-col items-center justify-center transition-all ${
            activeDirection === 'WAIT'
              ? 'bg-emerald-400 text-slate-950 scale-95 font-bold shadow'
              : 'bg-blue-950/80 hover:bg-blue-900 active:bg-blue-800 text-blue-200 border border-blue-700/80'
          }`}
        >
          <Footprints size={15} />
          <span className="text-[9px] font-mono font-semibold">待機</span>
        </button>

        {/* 右 (6 / L / D / →) */}
        <button
          onClick={() => onMove(1, 0)}
          title="右 (D / 6 / l / →)"
          className={`rounded flex flex-col items-center justify-center transition-all ${
            activeDirection === 'E'
              ? 'bg-amber-400 text-slate-950 scale-95 font-bold shadow'
              : 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 border border-slate-700'
          }`}
        >
          <ArrowRight size={16} />
          <span className="text-[9px] font-mono opacity-60">D/6/→</span>
        </button>

        {/* 左下 (1 / B / Z) */}
        <button
          onClick={() => onMove(-1, 1)}
          title="左下 (Z / 1 / b)"
          className={`rounded flex flex-col items-center justify-center transition-all ${
            activeDirection === 'SW'
              ? 'bg-amber-400 text-slate-950 scale-95 font-bold shadow'
              : 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 border border-slate-700'
          }`}
        >
          <ArrowDownLeft size={16} />
          <span className="text-[9px] font-mono opacity-60">Z/1</span>
        </button>

        {/* 下 (2 / J / S / ↓) */}
        <button
          onClick={() => onMove(0, 1)}
          title="下 (S / 2 / j / ↓)"
          className={`rounded flex flex-col items-center justify-center transition-all ${
            activeDirection === 'S'
              ? 'bg-amber-400 text-slate-950 scale-95 font-bold shadow'
              : 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 border border-slate-700'
          }`}
        >
          <ArrowDown size={16} />
          <span className="text-[9px] font-mono opacity-60">S/2/↓</span>
        </button>

        {/* 右下 (3 / N / C) */}
        <button
          onClick={() => onMove(1, 1)}
          title="右下 (C / 3 / n)"
          className={`rounded flex flex-col items-center justify-center transition-all ${
            activeDirection === 'SE'
              ? 'bg-amber-400 text-slate-950 scale-95 font-bold shadow'
              : 'bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 border border-slate-700'
          }`}
        >
          <ArrowDownRight size={16} />
          <span className="text-[9px] font-mono opacity-60">C/3</span>
        </button>
      </div>

      {/* サブアクション行 */}
      <div className="w-full grid grid-cols-2 gap-1 mt-1.5">
        <button
          onClick={onSearch}
          title="探索 (F / X)"
          className="py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] rounded border border-slate-700 flex items-center justify-center gap-1"
        >
          <Compass size={11} />
          <span>探索(F)</span>
        </button>
        <button
          onClick={onPickup}
          title="足元を拾う (G)"
          className="py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-[10px] rounded border border-slate-700 flex items-center justify-center gap-1"
        >
          <Hand size={11} />
          <span>拾う(G)</span>
        </button>
      </div>
    </div>
  );
};
