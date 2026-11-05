/**
 * ゲームオーバー & 勝利モーダル
 */

import React from 'react';
import { Skull, Trophy, RefreshCw, Award, ArrowRight } from 'lucide-react';
import { PlayerStats } from '../types/rogue';

interface Props {
  isWon: boolean;
  player: PlayerStats;
  reason?: string;
  onRestart: () => void;
  onOpenScores: () => void;
}

export const GameOverModal: React.FC<Props> = ({
  isWon,
  player,
  reason = 'ダンジョンに散った',
  onRestart,
  onOpenScores
}) => {
  const finalScore = player.gold + player.exp * 2 + player.dungeonLevel * 100 + (isWon ? 10000 : 0);

  if (!isWon) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/95 p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="game-over-title"
          className="relative my-auto flex min-h-[440px] w-full max-w-[320px] flex-col items-center justify-center bg-black px-5 pb-10 pt-14 text-center font-mono shadow-[0_0_28px_rgba(34,197,94,0.18)]"
        >
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M 1 33 L 30 1 H 70 L 99 33 V 99 H 1 Z"
              fill="none"
              stroke="#84cc16"
              strokeWidth="0.8"
              vectorEffect="non-scaling-stroke"
            />
            <path d="M -12 99 H 112" fill="none" stroke="#00d936" strokeWidth="0.45" vectorEffect="non-scaling-stroke" />
            <g fill="none" stroke="#00d936" strokeWidth="0.45" strokeLinecap="round" vectorEffect="non-scaling-stroke">
              <path d="M 18 99 Q 17 95 13 92 M 18 99 Q 19 94 22 91 M 18 99 V 93 M 18 97 Q 14 97 12 95 M 18 96 Q 21 96 23 94" />
              <path d="M 31 99 Q 29 96 27 94 M 31 99 Q 32 95 35 93 M 31 98 V 95 M 31 97 Q 28 97 26 96" />
              <path d="M 69 99 Q 68 95 65 93 M 69 99 Q 71 95 74 92 M 69 98 V 94 M 69 97 Q 65 97 63 95" />
              <path d="M 82 99 Q 80 95 78 93 M 82 99 Q 84 95 88 92 M 82 98 V 94 M 82 97 Q 79 97 77 95" />
            </g>
            <g fill="#e5e500" stroke="#e5e500" strokeWidth="0.3" vectorEffect="non-scaling-stroke">
              <path d="M 8 87 l 1.1 2.5 2.5 1.1 -2.5 1.1 -1.1 2.5 -1.1-2.5 -2.5-1.1 2.5-1.1z" />
              <path d="M 92 87 l 1.1 2.5 2.5 1.1 -2.5 1.1 -1.1 2.5 -1.1-2.5 -2.5-1.1 2.5-1.1z" />
            </g>
            <g fill="none" stroke="#84cc16" strokeWidth="0.5" vectorEffect="non-scaling-stroke">
              <circle cx="25" cy="91" r="1.1" /><circle cx="75" cy="90" r="1.1" />
              <path d="M 25 92.1 V 98 M 75 91.1 V 98" />
            </g>
          </svg>
          <div className="mb-2 text-xs tracking-[0.35em] text-lime-500" aria-hidden="true">
            * * * * * * * * *
          </div>
          <h2 id="game-over-title" className="text-xl font-bold leading-tight text-yellow-300">
            安らかに眠れ
          </h2>

          <div className="mt-4 space-y-1 text-sm text-slate-100">
            <p className="text-base font-bold">{player.name}</p>
            <p className="text-lime-300">Lv.{player.level} 冒険者</p>
            <p className="text-yellow-200">$ {player.gold.toLocaleString()}</p>
          </div>

          <div className="my-4 w-full border-t border-dashed border-lime-700" />

          <div className="space-y-1 text-sm text-slate-100">
            <p className="text-lime-300">地下 {player.dungeonLevel} 階にて</p>
            <p className="max-w-[250px] whitespace-normal">{reason}</p>
            <p>死亡</p>
            <p className="text-slate-400">{player.turns.toLocaleString()} ターン</p>
          </div>

          <div className="mt-3 text-sm font-bold text-yellow-200">
            最終スコア　{finalScore.toLocaleString()} 点
          </div>
          <div className="mb-3 mt-4 text-xs tracking-[0.35em] text-lime-500" aria-hidden="true">
            * * * * * * * * *
          </div>

          <div className="flex flex-wrap justify-center gap-2 font-sans">
            <button
              onClick={onRestart}
              className="flex items-center gap-2 border border-lime-500 px-3 py-2 text-xs font-bold text-lime-300 transition-colors hover:bg-lime-950"
            >
              <RefreshCw size={14} />
              <span>もう一度挑戦</span>
            </button>
            <button
              onClick={onOpenScores}
              className="flex items-center gap-1.5 border border-slate-600 px-3 py-2 text-xs text-slate-300 transition-colors hover:bg-slate-900"
            >
              <Award size={14} />
              <span>記録を見る</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-slate-700 rounded-lg shadow-2xl p-6 text-center space-y-5 select-none">
        <div className="flex justify-center">
          {isWon ? (
            <div className="w-16 h-16 bg-amber-500/20 border-2 border-amber-500 rounded-full flex items-center justify-center text-amber-400">
              <Trophy size={36} className="animate-bounce" />
            </div>
          ) : (
            <div className="w-16 h-16 bg-rose-950/60 border-2 border-rose-800 rounded-full flex items-center justify-center text-rose-500">
              <Skull size={36} />
            </div>
          )}
        </div>

        <div>
          <h2 className={`text-2xl font-bold tracking-wider ${isWon ? 'text-amber-300' : 'text-rose-500'}`}>
            {isWon ? '【生還大勝利】英雄の凱旋！' : '【無念】冒険の終わり'}
          </h2>
          <p className="text-slate-300 text-sm mt-1">
            {isWon ? (
              'イエンダーの魔除けを携え、漆黒のドゥームダンジョンから生還を果たした！'
            ) : (
              `地下 ${player.dungeonLevel} 階にて、${reason}。`
            )}
          </p>
        </div>

        {/* 最終スコアボード */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-2 text-left font-mono">
          <div className="flex justify-between text-xs text-slate-400 border-b border-slate-800 pb-1.5">
            <span>冒険者名:</span>
            <span className="text-slate-200 font-bold">{player.name} (Lv.{player.level})</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>到達階層:</span>
            <span className="text-slate-200">地下 {player.dungeonLevel} 階</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>獲得ゴールド:</span>
            <span className="text-yellow-400 font-bold">{player.gold} Gold</span>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>総ターン数:</span>
            <span className="text-slate-300">{player.turns} ターン</span>
          </div>
          {isWon && (
            <div className="flex justify-between text-xs text-amber-400 font-bold">
              <span>魔除けボーナス:</span>
              <span>+10,000 点</span>
            </div>
          )}
          <div className="border-t border-slate-800 pt-2 flex justify-between text-sm">
            <span className="text-slate-300 font-bold">最終スコア:</span>
            <span className="text-amber-300 font-bold text-base">{finalScore.toLocaleString()} 点</span>
          </div>
        </div>

        {/* ボタン群 */}
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={onRestart}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded shadow-lg transition-colors flex items-center gap-2 text-xs"
          >
            <RefreshCw size={14} />
            <span>新たな冒険を始める</span>
          </button>
          <button
            onClick={onOpenScores}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium border border-slate-700 transition-colors flex items-center gap-1.5 text-xs"
          >
            <Award size={14} />
            <span>殿堂入り記録</span>
          </button>
        </div>
      </div>
    </div>
  );
};
