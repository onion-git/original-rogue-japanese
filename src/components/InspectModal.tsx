/**
 * 右クリック調査 (Inspect) ダイアログ
 */

import React from 'react';
import { X, Search } from 'lucide-react';

interface Props {
  target: { x: number; y: number; text: string };
  onClose: () => void;
}

export const InspectModal: React.FC<Props> = ({ target, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-slate-600 rounded shadow-2xl p-4 select-none text-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <Search size={14} />
            <span>詳細調査 (X:{target.x}, Y:{target.y})</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        </div>

        <div className="py-3 text-slate-200 leading-relaxed font-sans">
          {target.text}
        </div>

        <div className="pt-2 border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
