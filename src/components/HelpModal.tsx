/**
 * Windows スタイル ヘルプ・操作マニュアル & モンスター図鑑
 */

import React, { useState } from 'react';
import { X, Keyboard, MousePointer, Gamepad2, BookOpen, Skull, Info, ShieldAlert } from 'lucide-react';
import { MONSTER_DEFS } from '../services/monsterData';

interface Props {
  onClose: () => void;
}

export const HelpModal: React.FC<Props> = ({ onClose }) => {
  const [tab, setTab] = useState<'CONTROLS' | 'BESTIARY' | 'RULES'>('CONTROLS');

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border-2 border-slate-600 rounded shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* ウィンドウタイトルバー */}
        <div className="h-8 bg-blue-900 border-b border-blue-700 px-3 flex items-center justify-between text-xs text-white font-sans select-none shrink-0">
          <div className="flex items-center gap-2 font-semibold">
            <BookOpen size={14} className="text-amber-400" />
            <span>元祖 ローグ 日本語版 (Windows Edition) - 公式ガイドブック</span>
          </div>
          <button
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center hover:bg-rose-600 rounded text-slate-300 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* ナビゲーションタブ */}
        <div className="bg-slate-800 border-b border-slate-700 px-3 py-1.5 flex items-center gap-2 text-xs shrink-0">
          <button
            onClick={() => setTab('CONTROLS')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
              tab === 'CONTROLS' ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Keyboard size={13} />
            <span>操作方法 (キーボード/マウス/パッド)</span>
          </button>
          <button
            onClick={() => setTab('BESTIARY')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
              tab === 'BESTIARY' ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Skull size={13} />
            <span>26種モンスター図鑑 (A-Z)</span>
          </button>
          <button
            onClick={() => setTab('RULES')}
            className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
              tab === 'RULES' ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Info size={13} />
            <span>ゲームの掟と攻略のヒント</span>
          </button>
        </div>

        {/* コンテンツ領域 */}
        <div className="flex-1 p-4 overflow-y-auto text-xs text-slate-200 leading-relaxed space-y-4">
          {tab === 'CONTROLS' && (
            <div className="space-y-4">
              {/* キーボード */}
              <div className="bg-slate-800/80 border border-slate-700 rounded p-3">
                <div className="flex items-center gap-2 font-bold text-amber-300 mb-2 text-sm">
                  <Keyboard size={16} />
                  <span>キーボード操作 (8方向対応)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                  <div className="space-y-1 bg-slate-900/60 p-2.5 rounded">
                    <div className="font-semibold text-slate-200 mb-1 text-[11px] text-blue-400">【8方向移動】</div>
                    <div className="flex justify-between"><span className="font-mono text-amber-400">テンキー (1〜9)</span><span>7:左上 8:上 9:右上 / 4:左 5:待機 6:右 / 1:左下 2:下 3:右下</span></div>
                    <div className="flex justify-between"><span className="font-mono text-amber-400">Vimキー</span><span>h:左 j:下 k:上 l:右 / y:左上 u:右上 b:左下 n:右下</span></div>
                    <div className="flex justify-between"><span className="font-mono text-amber-400">矢印キー (↑↓←→)</span><span>上下左右移動</span></div>
                  </div>

                  <div className="space-y-1 bg-slate-900/60 p-2.5 rounded">
                    <div className="font-semibold text-slate-200 mb-1 text-[11px] text-blue-400">【ショートカットアクション】</div>
                    <div className="flex justify-between"><span className="font-mono text-amber-400">i</span><span>持ち物 (インベントリ) 開閉</span></div>
                    <div className="flex justify-between"><span className="font-mono text-amber-400">s</span><span>周囲を探索 (隠し扉・罠の発見)</span></div>
                    <div className="flex justify-between"><span className="font-mono text-amber-400">. / Space</span><span>その場で1ターン待機</span></div>
                    <div className="flex justify-between"><span className="font-mono text-amber-400">&gt; (Shift+.)</span><span>下り階段を降りる</span></div>
                    <div className="flex justify-between"><span className="font-mono text-amber-400">&lt; (Shift+,)</span><span>上り階段を上る (魔除け所持時)</span></div>
                    <div className="flex justify-between"><span className="font-mono text-amber-400">F5 / F9</span><span>クイックセーブ / ロード</span></div>
                  </div>
                </div>
              </div>

              {/* マウス */}
              <div className="bg-slate-800/80 border border-slate-700 rounded p-3">
                <div className="flex items-center gap-2 font-bold text-cyan-300 mb-2 text-sm">
                  <MousePointer size={16} />
                  <span>マウス操作 (直感的なPC操作)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                  <div className="bg-slate-900/60 p-2.5 rounded space-y-1">
                    <div className="font-semibold text-blue-400">左クリック:</div>
                    <p>・マップ上の床や通路をクリックすると、障害物を自動で避けて目的地まで歩行します。</p>
                    <p>・隣接するモンスターをクリックすると直接武器で攻撃します。</p>
                  </div>
                  <div className="bg-slate-900/60 p-2.5 rounded space-y-1">
                    <div className="font-semibold text-blue-400">右クリック & ツールバー:</div>
                    <p>・右クリックしたマスの詳細情報（地形・敵・アイテム）を調査します。</p>
                    <p>・画面上部のツールバーで「待機」「探索」「拾う」「階段」をワンクリック実行できます。</p>
                  </div>
                </div>
              </div>

              {/* ゲームパッド */}
              <div className="bg-slate-800/80 border border-slate-700 rounded p-3">
                <div className="flex items-center gap-2 font-bold text-emerald-300 mb-2 text-sm">
                  <Gamepad2 size={16} />
                  <span>ゲームパッド操作 (Xbox / PS / USBコントローラー対応)</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-300">
                  <div className="bg-slate-900/60 p-2 rounded text-center">
                    <div className="font-mono text-amber-400 font-bold">D-Pad / 左スティック</div>
                    <div className="text-[11px] text-slate-400">8方向キャラクター移動</div>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded text-center">
                    <div className="font-mono text-cyan-400 font-bold">A ボタン</div>
                    <div className="text-[11px] text-slate-400">決定 / 攻撃 / 足元拾う</div>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded text-center">
                    <div className="font-mono text-rose-400 font-bold">B ボタン</div>
                    <div className="text-[11px] text-slate-400">その場で待機 (パス)</div>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded text-center">
                    <div className="font-mono text-purple-400 font-bold">X ボタン</div>
                    <div className="text-[11px] text-slate-400">周囲を探索 (Search)</div>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded text-center">
                    <div className="font-mono text-emerald-400 font-bold">Y ボタン</div>
                    <div className="text-[11px] text-slate-400">持ち物 (インベントリ) 開閉</div>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded text-center">
                    <div className="font-mono text-yellow-400 font-bold">LB / RB</div>
                    <div className="text-[11px] text-slate-400">クイック薬 / 上り階段</div>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded text-center">
                    <div className="font-mono text-blue-400 font-bold">LT / RT</div>
                    <div className="text-[11px] text-slate-400">下り階段を降りる</div>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded text-center">
                    <div className="font-mono text-slate-300 font-bold">Start ボタン</div>
                    <div className="text-[11px] text-slate-400">メニュー / セーブ画面</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'BESTIARY' && (
            <div className="space-y-3">
              <p className="text-slate-400">
                元祖ローグには A から Z までの 26 種類のモンスターが存在します。それぞれの出現階層と危険な特殊能力を把握することが生還の鍵です。
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.values(MONSTER_DEFS).map(mon => (
                  <div key={mon.char} className="bg-slate-800/60 border border-slate-700/80 rounded p-2.5 flex items-start gap-2.5">
                    <div
                      style={{ color: mon.color }}
                      className="w-8 h-8 rounded bg-slate-950 flex items-center justify-center font-mono font-bold text-lg shrink-0 border border-slate-700"
                    >
                      {mon.char}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100">{mon.japaneseName} ({mon.name})</span>
                        <span className="text-[10px] text-slate-400 font-mono">B{mon.minLevel}F〜B{mon.maxLevel}F</span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">{mon.description}</div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                        <span>HP: {mon.hp}</span>
                        <span>AC: {mon.ac}</span>
                        <span>EXP: {mon.exp}</span>
                        {mon.special && (
                          <span className="px-1 bg-rose-950 border border-rose-800 text-rose-300 rounded font-semibold">
                            特殊: {mon.special}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'RULES' && (
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700 rounded p-3 space-y-2">
                <h3 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <ShieldAlert size={15} /> 究極の目的: イエンダーの魔除けの奪還
                </h3>
                <p>
                  ドゥームダンジョン最深部（地下26階以降）のどこかに眠る伝説の秘宝「イエンダーの魔除け (Amulet of Yendor)」を発見し、それを手にした状態で階段を登り続け、地上1階の階段から脱出することが本作の究極目標です。
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-800/40 border border-slate-700/80 rounded p-3 space-y-1.5">
                  <div className="font-bold text-cyan-300 text-xs">1. 飢えの管理 (Hunger)</div>
                  <p className="text-slate-300 text-[11px]">
                    歩くごとに満腹度は減っていきます。空腹になると自然回復が止まり、飢餓状態に陥るとターン毎にHPが減って餓死します。保存食は計画的に食べましょう。
                  </p>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/80 rounded p-3 space-y-1.5">
                  <div className="font-bold text-cyan-300 text-xs">2. 未識別アイテムの恐怖と恩恵</div>
                  <p className="text-slate-300 text-[11px]">
                    薬や巻物は最初は効果がわかりません。飲んだり読んだりすることでその冒険における効果が判明します。時には呪われた武具や毒薬もあるため、識別(Identify)の巻物を活用しましょう。
                  </p>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/80 rounded p-3 space-y-1.5">
                  <div className="font-bold text-cyan-300 text-xs">3. 探索 (Search) の重要性</div>
                  <p className="text-slate-300 text-[11px]">
                    通路に行き止まりがある場合、そこには「隠し扉」がある可能性があります。<span className="font-mono text-amber-300">[s]</span> キーで周囲を何度か探索してみましょう。罠の発見にも有効です。
                  </p>
                </div>

                <div className="bg-slate-800/40 border border-slate-700/80 rounded p-3 space-y-1.5">
                  <div className="font-bold text-cyan-300 text-xs">4. 通路での各個撃破</div>
                  <p className="text-slate-300 text-[11px]">
                    広い部屋で多数の敵に囲まれると一瞬で命を落とします。敵を発見したら狭い通路（#）に誘い込み、1対1で戦うのがローグ鉄則の戦術です。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="h-10 bg-slate-800 border-t border-slate-700 px-4 flex items-center justify-between text-xs text-slate-400">
          <span>元祖 ローグ 日本語版 (Rogue 1980 Windows Port)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
