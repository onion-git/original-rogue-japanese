import React from 'react';
import { Compass, HelpCircle, Award, Settings, Dices, Sparkles, ShieldAlert } from 'lucide-react';

interface Props {
  name: string;
  onNameChange: (name: string) => void;
  onStart: () => void;
  onOpenHelp: () => void;
  onOpenRecords: () => void;
  onOpenOptions: () => void;
}

const candidates = ['ローグ', 'ロディ', 'シレン', 'トルネコ', 'アリス', 'レンジャー'];
const randomNames = ['ローグ', 'ロディ', 'シレン', 'トルネコ', 'アリス', 'レンジャー'];

export const TitleScreen: React.FC<Props> = ({ name, onNameChange, onStart, onOpenHelp, onOpenRecords, onOpenOptions }) => (
  <div data-title-screen="true" className="fixed inset-0 z-50 overflow-y-auto bg-[#090909] px-4 py-8 text-slate-100">
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col justify-center gap-5 font-sans">
      <header className="text-center font-mono">
        <pre className="mb-3 overflow-hidden text-[clamp(0.5rem,2.3vw,1.3rem)] font-black leading-[0.9] tracking-[0.02em] text-amber-400" aria-label="ROGUE">{`██████╗  ██████╗  ██████╗ ██╗   ██╗███████╗\n██╔══██╗██╔═══██╗██╔════╝ ██║   ██║██╔════╝\n██████╔╝██║   ██║██║  ███╗██║   ██║█████╗  \n██╔══██╗██║   ██║██║   ██║██║   ██║██╔══╝  \n██║  ██║╚██████╔╝╚██████╔╝╚██████╔╝███████╗\n╚═╝  ╚═╝ ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝`}</pre>
        <div className="text-sm font-bold tracking-widest text-slate-300">=== DUNGEONS OF DOOM (1980) ===</div>
        <div className="mt-1 text-sm text-slate-400">元祖 ローグ 日本語版 — 迷宮の探求者たち</div>
      </header>

      <section className="rounded-xl border border-neutral-800 bg-black/50 p-4 sm:p-5">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-300"><Compass size={18}/>冒険の掟（任務指令）</h2>
        <p className="text-sm leading-relaxed text-neutral-300">君は勇敢なる冒険者として、未踏の深淵『ドゥームの迷宮』の入口に立っている。迷宮の最深部・地下26階に眠る古代の秘宝『イエンダーの魔除け』を探し出し、生きて地上へ持ち帰らねばならない。</p>
        <p className="mt-3 flex items-center gap-2 text-sm text-red-400"><ShieldAlert size={17}/>一歩が生死を分けるターン制。一度命を落とせば、復活は叶わない。</p>
      </section>

      <section className="rounded-xl border border-neutral-700 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 font-bold text-slate-200"><Sparkles size={18} className="text-amber-300"/>冒険者のエントリーネーム</h2><span className="text-xs text-slate-500">最大12文字</span></div>
        <div className="flex gap-2">
          <input autoFocus value={name} maxLength={12} onChange={e => onNameChange(e.target.value)} aria-label="冒険者の名前" className="min-w-0 flex-1 rounded-md border border-amber-700 bg-neutral-900 px-3 py-2.5 text-lg outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400" />
          <button onClick={() => onNameChange(randomNames[Math.floor(Math.random() * randomNames.length)])} className="flex shrink-0 items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-3 text-sm hover:border-amber-500"><Dices size={18} className="text-amber-400"/><span className="hidden sm:inline">ランダム</span></button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">候補:{candidates.map(candidate => <button key={candidate} onClick={() => onNameChange(candidate)} className={`rounded border px-2 py-1 ${candidate === name ? 'border-amber-500 bg-amber-950/40 text-amber-300' : 'border-neutral-800 bg-neutral-900 hover:border-neutral-500'}`}>{candidate}</button>)}</div>
        <button onClick={onStart} className="mt-4 w-full rounded-lg bg-gradient-to-r from-amber-600 to-yellow-600 px-4 py-3.5 text-lg font-bold text-white shadow-lg hover:brightness-110 active:scale-[0.99]">迷宮の門をくぐる（Enter）</button>
      </section>

      <nav className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button onClick={onOpenHelp} className="flex items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-3 hover:border-cyan-700"><HelpCircle size={18} className="text-cyan-400"/>冒険の手引き</button>
        <button onClick={onOpenRecords} className="flex items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-3 hover:border-amber-700"><Award size={18} className="text-amber-400"/>冒険者の殿堂</button>
        <button onClick={onOpenOptions} className="flex items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-3 hover:border-amber-700"><Settings size={18} className="text-amber-400"/>オプション設定</button>
      </nav>
      <p className="text-center text-xs text-slate-600">名前はこのブラウザーに保存されます　·　Enterキーで冒険開始</p>
    </div>
  </div>
);
