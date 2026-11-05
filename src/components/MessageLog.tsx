/**
 * メッセージログコンソール (クラシックローグスタイルのメッセージ表示 & 履歴ログ)
 */

import React, { useState } from 'react';
import { LogMessage } from '../types/rogue';
import { History, ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  logs: LogMessage[];
}

export const MessageLog: React.FC<Props> = ({ logs }) => {
  const [expanded, setExpanded] = useState(false);

  const getLogStyle = (type: LogMessage['type']) => {
    switch (type) {
      case 'combat': return 'text-amber-300';
      case 'danger': return 'text-rose-400 font-semibold';
      case 'heal': return 'text-emerald-400 font-medium';
      case 'special': return 'text-cyan-300 font-bold';
      case 'item': return 'text-yellow-200';
      case 'system': return 'text-slate-400';
      default: return 'text-slate-200';
    }
  };

  const latest = logs[0] || { text: '静寂が漂っている...', type: 'info', turn: 1 };

  return (
    <div className="bg-slate-950 border-b border-slate-800 text-xs font-mono select-none relative z-20">
      {/* 1行サマリー表示 (常に最新の出来事を表示) */}
      <div className="h-7 px-3 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <span className="text-[10px] text-slate-500 font-mono">T.{latest.turn}</span>
          <span className={`truncate text-sm ${getLogStyle(latest.type)}`}>
            {latest.text}
          </span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px] px-2 py-0.5 rounded hover:bg-slate-800 transition-colors shrink-0"
        >
          <History size={12} />
          <span>履歴</span>
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* 展開された過去ログドロワー */}
      {expanded && (
        <div className="max-h-48 overflow-y-auto bg-slate-900/95 border-t border-slate-800 p-2 space-y-1 shadow-2xl">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 text-xs leading-relaxed">
              <span className="text-[10px] text-slate-500 shrink-0 mt-0.5 font-mono">T.{log.turn}</span>
              <span className={getLogStyle(log.type)}>{log.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
