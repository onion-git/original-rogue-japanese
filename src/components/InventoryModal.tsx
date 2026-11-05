/**
 * Windows スタイル インベントリ (持ち物) ダイアログ
 */

import React, { useState, useEffect } from 'react';
import { Item, ItemType } from '../types/rogue';
import { X, Swords, Shield, Heart, Scroll, Wand2, Sparkles, Utensils, Package, Trash2, Check } from 'lucide-react';

interface Props {
  inventory: Item[];
  onUseItem: (item: Item) => void;
  onDropItem: (item: Item) => void;
  onClose: () => void;
}

export const InventoryModal: React.FC<Props> = ({
  inventory,
  onUseItem,
  onDropItem,
  onClose
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<Item | null>(inventory[0] || null);

  // a〜z のショートカットキー対応
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      const charCode = e.key.toLowerCase().charCodeAt(0);
      if (charCode >= 97 && charCode <= 122) { // a - z
        const index = charCode - 97;
        if (index < inventory.length) {
          const item = inventory[index];
          setSelectedItem(item);
          // EnterやSpaceで即使用できる
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inventory, onClose]);

  const filteredItems = inventory.filter(item => {
    if (filterType === 'ALL') return true;
    if (filterType === 'EQUIP') return item.type === 'WEAPON' || item.type === 'ARMOR' || item.type === 'RING';
    if (filterType === 'CONSUME') return item.type === 'POTION' || item.type === 'SCROLL' || item.type === 'FOOD' || item.type === 'WAND';
    return item.type === filterType;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-slate-600 rounded shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* ウィンドウタイトルバー */}
        <div className="h-8 bg-blue-900 border-b border-blue-700 px-3 flex items-center justify-between text-xs text-white font-sans select-none shrink-0">
          <div className="flex items-center gap-2 font-semibold">
            <Package size={14} className="text-amber-400" />
            <span>所持品一覧 (インベントリ) - 容量 {inventory.length} / 26</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center hover:bg-rose-600 rounded text-slate-300 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* フィルタカテゴリタブ */}
        <div className="bg-slate-800/80 border-b border-slate-700 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
          {[
            { id: 'ALL', label: 'すべて' },
            { id: 'EQUIP', label: '武器・防具' },
            { id: 'CONSUME', label: '消費アイテム' },
            { id: 'POTION', label: '薬' },
            { id: 'SCROLL', label: '巻物' },
            { id: 'WAND', label: '杖' },
            { id: 'FOOD', label: '食料' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-2.5 py-1 rounded text-xs transition-colors whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* メインコンテンツ: リスト & 詳細パネル */}
        <div className="flex-1 flex overflow-hidden min-h-[300px]">
          {/* 左側: アイテム一覧 */}
          <div className="w-7/12 border-r border-slate-800 p-2 overflow-y-auto space-y-1">
            {filteredItems.length === 0 ? (
              <div className="text-center text-slate-500 py-12 text-xs">
                該当するアイテムはありません
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const charLabel = String.fromCharCode(97 + inventory.indexOf(item)); // a, b, c...
                const isSelected = selectedItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-2 rounded border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? 'bg-blue-950/80 border-blue-600 text-white'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-amber-400 font-bold w-4 text-center">{charLabel})</span>
                      <span style={{ color: item.color }} className="font-mono font-bold text-sm">{item.char}</span>
                      <span className="truncate font-medium">
                        {item.identified ? item.name : item.unidentifiedName}
                        {item.quantity && item.quantity > 1 ? ` (×${item.quantity})` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {item.equipped && (
                        <span className="px-1.5 py-0.2 bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] rounded font-semibold">
                          装備中
                        </span>
                      )}
                      {item.cursed && item.identified && (
                        <span className="px-1.5 py-0.2 bg-rose-950 border border-rose-800 text-rose-300 text-[10px] rounded">
                          呪い
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 右側: 選択アイテムの詳細 & アクション */}
          <div className="w-5/12 p-3 bg-slate-900/50 flex flex-col justify-between text-xs overflow-y-auto">
            {selectedItem ? (
              <div className="space-y-3">
                <div className="border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span style={{ color: selectedItem.color }} className="font-mono text-xl font-bold">
                      {selectedItem.char}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-slate-100">
                        {selectedItem.identified ? selectedItem.name : selectedItem.unidentifiedName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {selectedItem.identified ? '【鑑定済み】' : '【未鑑定】外見から推測'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-slate-300 text-xs leading-relaxed">
                  {selectedItem.description}
                </div>

                {/* 性能詳細 */}
                <div className="bg-slate-800/60 rounded p-2 space-y-1 text-[11px] text-slate-300">
                  {selectedItem.armorAc !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">防御力 (AC):</span>
                      <span className="font-mono font-bold text-blue-300">{selectedItem.armorAc}</span>
                    </div>
                  )}
                  {selectedItem.charges !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">残り魔力 (回数):</span>
                      <span className="font-mono font-bold text-cyan-300">{selectedItem.charges} 回</span>
                    </div>
                  )}
                  {selectedItem.value !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">基本価値:</span>
                      <span className="font-mono font-bold text-amber-300">{selectedItem.value} Gold</span>
                    </div>
                  )}
                  {selectedItem.bonus !== undefined && selectedItem.bonus !== 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">強化補正:</span>
                      <span className="font-mono font-bold text-emerald-300">+{selectedItem.bonus}</span>
                    </div>
                  )}
                </div>

                {/* アクションボタン */}
                <div className="pt-2 space-y-1.5">
                  {(selectedItem.type === 'POTION' || selectedItem.type === 'SCROLL' || selectedItem.type === 'FOOD' || selectedItem.type === 'WAND') && (
                    <button
                      onClick={() => {
                        onUseItem(selectedItem);
                        onClose();
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold rounded text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
                    >
                      <Sparkles size={14} />
                      <span>{selectedItem.type === 'FOOD' ? '食べる' : (selectedItem.type === 'POTION' ? '飲む' : (selectedItem.type === 'SCROLL' ? '読む' : '振る'))}</span>
                    </button>
                  )}

                  {(selectedItem.type === 'WEAPON' || selectedItem.type === 'ARMOR' || selectedItem.type === 'RING') && (
                    <button
                      onClick={() => {
                        onUseItem(selectedItem);
                        onClose();
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded text-xs transition-colors flex items-center justify-center gap-1.5 shadow"
                    >
                      <Check size={14} />
                      <span>{selectedItem.equipped ? '装備中' : '装備する'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onDropItem(selectedItem);
                      onClose();
                    }}
                    className="w-full py-1.5 bg-slate-800 hover:bg-rose-900/60 active:bg-rose-900 text-slate-300 hover:text-rose-200 border border-slate-700 rounded text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={13} />
                    <span>足元に置く (捨てる)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 my-auto text-xs">
                アイテムを選択してください
              </div>
            )}

            <div className="mt-3 text-[10px] text-slate-500 text-center font-mono">
              [Esc] 閉じる / [a-z] アイテム選択
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
