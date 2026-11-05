/**
 * Windows スタイル 右側詳細ステータスパネル
 */

import React from 'react';
import { PlayerStats, Item } from '../types/rogue';
import { 
  Heart, Shield, Zap, Sparkles, Coins, Utensils, 
  Swords, Package, Gamepad2
} from 'lucide-react';
import { InputMonitorHud } from './InputMonitorHud';

interface Props {
  player: PlayerStats;
  inventory: Item[];
  onUseItem: (item: Item) => void;
  onOpenInventory: () => void;
  hasGamepad: boolean;
  gamepadName: string | null;
  gamepadSupported: boolean;
  onRescanGamepad: () => void;
  lastAction: string | null;
  activeDirection: string | null;
  onMove: (dx: number, dy: number) => void;
  onWait: () => void;
  onSearch: () => void;
  onPickup: () => void;
}

export const StatusPanel: React.FC<Props> = ({
  player,
  inventory,
  onUseItem,
  onOpenInventory,
  hasGamepad,
  gamepadName,
  gamepadSupported,
  onRescanGamepad,
  lastAction,
  activeDirection,
  onMove,
  onWait,
  onSearch,
  onPickup
}) => {
  // HP割合
  const hpPct = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const hpColor = hpPct > 50 ? 'bg-emerald-500' : (hpPct > 25 ? 'bg-amber-500' : 'bg-rose-600');

  // 満腹度表示
  const getHungerLabel = () => {
    switch (player.hungerState) {
      case 'FULL': return { text: '満腹', color: 'text-emerald-400' };
      case 'NORMAL': return { text: '普通', color: 'text-slate-300' };
      case 'HUNGRY': return { text: '空腹', color: 'text-amber-400 font-bold animate-pulse' };
      case 'WEAK': return { text: '飢餓', color: 'text-orange-500 font-bold animate-pulse' };
      case 'STARVING': return { text: '失神寸前', color: 'text-rose-500 font-bold animate-pulse' };
    }
  };
  const hungerInfo = getHungerLabel();

  // クイック使用可能アイテム (食料、ポーション)
  const quickItems = inventory.filter(i => i.type === 'FOOD' || i.type === 'POTION').slice(0, 4);

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col justify-between p-3 select-none text-xs font-sans text-slate-200 overflow-y-auto shrink-0">
      <div className="space-y-3">
        {/* キャラクター名 & 階層 */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded p-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
              <span className="w-4 h-4 bg-amber-500 text-slate-950 rounded text-center text-xs font-mono font-bold leading-4">@</span>
              {player.name}
            </span>
            <span className="px-2 py-0.5 bg-blue-950 border border-blue-800 text-blue-300 rounded text-[11px] font-mono font-semibold">
              地下 {player.dungeonLevel} 階
            </span>
          </div>

          {/* HPバー */}
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1 text-slate-300 font-medium">
                <Heart size={13} className="text-rose-400" /> 体力 (HP)
              </span>
              <span className="font-mono font-bold text-slate-100">
                {player.hp} / {player.maxHp}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div 
                className={`h-full rounded-full transition-all duration-200 ${hpColor}`}
                style={{ width: `${hpPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* 主要ステータスグリッド */}
        <div className="grid grid-cols-2 gap-2">
          {/* 防御力 AC */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded p-2 flex items-center gap-2">
            <Shield size={16} className="text-blue-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">防御力 (AC)</div>
              <div className="font-mono font-bold text-sm text-slate-100">{player.ac} <span className="text-[10px] text-slate-400 font-normal">(低値有利)</span></div>
            </div>
          </div>

          {/* 筋力 STR */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded p-2 flex items-center gap-2">
            <Zap size={16} className="text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">腕力 (STR)</div>
              <div className="font-mono font-bold text-sm text-slate-100">{player.str} / {player.maxStr}</div>
            </div>
          </div>

          {/* レベル & EXP */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded p-2 flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">冒険者 LV / 経験値</div>
              <div className="font-mono font-bold text-xs text-slate-100">
                Lv.{player.level} <span className="text-slate-400 font-normal">({player.exp}/{player.nextExp})</span>
              </div>
            </div>
          </div>

          {/* 所持ゴールド */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded p-2 flex items-center gap-2">
            <Coins size={16} className="text-yellow-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400">黄金 (Gold)</div>
              <div className="font-mono font-bold text-sm text-yellow-300">{player.gold}</div>
            </div>
          </div>
        </div>

        {/* 満腹度 & ターン数 */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded px-2.5 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Utensils size={13} className="text-amber-400" />
            <span className="text-slate-400">満腹度:</span>
            <span className={`font-semibold ${hungerInfo.color}`}>{hungerInfo.text}</span>
          </div>
          <div className="text-slate-400 font-mono text-[11px]">
            {player.turns} ターン経過
          </div>
        </div>

        {/* 状態異常表示 */}
        {(player.confusedTurns > 0 || player.blindTurns > 0 || player.hasteTurns > 0) && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded p-2 space-y-1">
            <div className="text-[10px] text-rose-300 font-semibold uppercase tracking-wider">状態異常</div>
            <div className="flex flex-wrap gap-1">
              {player.confusedTurns > 0 && (
                <span className="px-1.5 py-0.5 bg-rose-900 text-rose-200 rounded text-[10px] font-medium">
                  混乱中 ({player.confusedTurns}T)
                </span>
              )}
              {player.blindTurns > 0 && (
                <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-medium">
                  盲目 ({player.blindTurns}T)
                </span>
              )}
              {player.hasteTurns > 0 && (
                <span className="px-1.5 py-0.5 bg-cyan-900 text-cyan-200 rounded text-[10px] font-medium">
                  ヘイスト・倍速 ({player.hasteTurns}T)
                </span>
              )}
            </div>
          </div>
        )}

        {/* リアルタイム入力モニター & 8方向オンスクリーンコントローラー */}
        <InputMonitorHud
          lastAction={lastAction}
          activeDirection={activeDirection}
          onMove={onMove}
          onWait={onWait}
          onSearch={onSearch}
          onPickup={onPickup}
        />

        {/* 現在の装備品スロット */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded p-2.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <Swords size={13} className="text-cyan-400" /> 装備品
            </span>
            <button 
              onClick={onOpenInventory}
              className="text-[10px] text-blue-400 hover:text-blue-300 underline"
            >
              変更...
            </button>
          </div>

          <div className="space-y-1.5 text-[11px]">
            {/* 武器 */}
            <div className="flex items-center justify-between bg-slate-900/60 px-2 py-1 rounded">
              <span className="text-slate-400">武器:</span>
              <span className="font-medium text-slate-200 truncate max-w-[170px]" title={player.equippedWeapon?.name || '素手'}>
                {player.equippedWeapon ? (
                  <span className="text-slate-100">{player.equippedWeapon.char} {player.equippedWeapon.name}</span>
                ) : (
                  <span className="text-slate-500 italic">素手 (1d4)</span>
                )}
              </span>
            </div>

            {/* 防具 */}
            <div className="flex items-center justify-between bg-slate-900/60 px-2 py-1 rounded">
              <span className="text-slate-400">防具:</span>
              <span className="font-medium text-slate-200 truncate max-w-[170px]" title={player.equippedArmor?.name || '素肌'}>
                {player.equippedArmor ? (
                  <span className="text-slate-100">{player.equippedArmor.char} {player.equippedArmor.name}</span>
                ) : (
                  <span className="text-slate-500 italic">素肌 (AC 10)</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* クイックアイテムスロット (ワンクリック使用) */}
        <div className="bg-slate-800/50 border border-slate-700/60 rounded p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
              <Package size={13} className="text-amber-400" /> クイック使用
            </span>
            <span className="text-[10px] text-slate-400">所持: {inventory.length}/26</span>
          </div>

          {quickItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-1.5">
              {quickItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => onUseItem(item)}
                  className="px-2 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-600 rounded text-left truncate flex items-center gap-1.5 transition-colors group"
                  title={`${item.identified ? item.name : item.unidentifiedName} を使う`}
                >
                  <span style={{ color: item.color }} className="font-mono font-bold">{item.char}</span>
                  <span className="truncate text-[10px] text-slate-200 group-hover:text-white">
                    {item.identified ? item.name : item.unidentifiedName}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-[10px] text-slate-500 italic py-1 text-center">
              使用可能な薬・食料がありません
            </div>
          )}
        </div>
      </div>

      {/* フッター: ゲームパッド接続ステータス */}
      <div className="mt-3 pt-2.5 border-t border-slate-800 text-[10px] text-slate-400">
        <div className="flex items-center gap-1 text-slate-300 font-semibold mb-1">
          <Gamepad2 size={12} className={hasGamepad ? "text-emerald-400" : "text-slate-500"} />
          <span>ゲームパッド: {hasGamepad ? (gamepadName || '接続中') : '未検出 (USB/BT)'}</span>
        </div>
        <button
          type="button"
          onClick={onRescanGamepad}
          className="mb-1 rounded border border-slate-700 px-2 py-1 text-slate-300 hover:bg-slate-800"
        >
          ゲームパッドを再検出
        </button>
        <div className="text-slate-500 text-[10px]">
          {gamepadSupported ? '画面をクリックしてからパッドのボタンを押してください。' : 'このブラウザーでは Gamepad API を利用できません。'}
        </div>
      </div>
    </div>
  );
};
