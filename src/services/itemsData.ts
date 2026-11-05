/**
 * 元祖 ローグ アイテム定義＆未識別名シャッフルシステム (日本語版)
 */

import { Item, ItemType } from '../types/rogue';

// ポーションの外見リスト
const POTION_COLORS = [
  'あかい くすり',
  'あおい くすり',
  'みどりの くすり',
  'きいろい くすり',
  'むらさきの くすり',
  'こはくの くすり',
  'くろい くすり',
  'しろい くすり',
  'ぎんいろの くすり',
  'きんいろの くすり'
];

// 巻物の呪文名リスト
const SCROLL_NAMES = [
  'ZELGO MER と かかれた巻物',
  'JUYED AWK YACC と かかれた巻物',
  'NR 9 と かかれた巻物',
  'FOOBIE BLETCH と かかれた巻物',
  'ELAM EBOW と かかれた巻物',
  'VERGAM TEP と かかれた巻物',
  'PRATYETI と かかれた巻物',
  'YUM YUM と かかれた巻物'
];

// 杖の素材リスト
const WAND_MATERIALS = [
  'かしの つえ',
  'くろたんの つえ',
  'ぎんの つえ',
  'てつの つえ',
  'すずの つえ',
  'プラチナの つえ',
  'ガラスの つえ',
  'こはくの つえ'
];

// 指輪の宝石リスト
const RING_GEMS = [
  'めのうの ゆびわ',
  'ルビーの ゆびわ',
  'サファイアの ゆびわ',
  'エメラルドの ゆびわ',
  'オパールの ゆびわ',
  'ダイヤモンドの ゆびわ',
  'こはくの ゆびわ'
];

export interface ItemIdentityMap {
  potions: Record<string, string>;
  scrolls: Record<string, string>;
  wands: Record<string, string>;
  rings: Record<string, string>;
  identifiedItems: Set<string>;
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createNewIdentityMap(): ItemIdentityMap {
  const pColors = shuffle(POTION_COLORS);
  const sNames = shuffle(SCROLL_NAMES);
  const wMats = shuffle(WAND_MATERIALS);
  const rGems = shuffle(RING_GEMS);

  return {
    potions: {
      'HEAL': pColors[0],
      'EXTRA_HEAL': pColors[1],
      'RESTORE_STR': pColors[2],
      'GAIN_STR': pColors[3],
      'POISON': pColors[4],
      'CONFUSION': pColors[5],
      'BLINDNESS': pColors[6],
      'HASTE': pColors[7],
      'SEE_INVISIBLE': pColors[8] || 'とうめいな くすり',
      'HALLUCINATION': pColors[9] || 'にじいろの くすり'
    },
    scrolls: {
      'IDENTIFY': sNames[0],
      'TELEPORT': sNames[1],
      'MAP': sNames[2],
      'ENCHANT_WEAPON': sNames[3],
      'ENCHANT_ARMOR': sNames[4],
      'REMOVE_CURSE': sNames[5],
      'MONSTER_CONFUSION': sNames[6],
      'SLEEP': sNames[7]
    },
    wands: {
      'TELEPORT_AWAY': wMats[0],
      'SLOW_MONSTER': wMats[1],
      'LIGHTNING': wMats[2],
      'FIRE': wMats[3],
      'SLEEP': wMats[4],
      'POLYMORPH': wMats[5],
      'COLD': wMats[6],
      'MAGIC_MISSILE': wMats[7]
    },
    rings: {
      'PROTECTION': rGems[0],
      'STRENGTH': rGems[1],
      'SEARCH': rGems[2],
      'STEALTH': rGems[3],
      'SLOW_DIGESTION': rGems[4],
      'REGENERATION': rGems[5],
      'TELEPORT': rGems[6]
    },
    identifiedItems: new Set<string>()
  };
}

let globalIdentityMap = createNewIdentityMap();

export function resetGlobalIdentities() {
  globalIdentityMap = createNewIdentityMap();
}

export function markAsIdentified(key: string) {
  globalIdentityMap.identifiedItems.add(key);
}

export function isIdentified(key: string): boolean {
  return globalIdentityMap.identifiedItems.has(key);
}

// 武器リスト
export const WEAPON_TEMPLATES = [
  { name: 'メイス', unidentified: 'なめらかな こんぼう', damage: '2d4', bonus: 1, value: 8, char: ')', color: '#cbd5e1', desc: '頑丈な鉄の柄を持つ打撃武器。' },
  { name: 'ショートソード', unidentified: 'みじかい つるぎ', damage: '1d6', bonus: 0, value: 12, char: ')', color: '#e2e8f0', desc: '軽快に取り回せる短剣。' },
  { name: 'ロングソード', unidentified: 'おおきな つるぎ', damage: '1d8', bonus: 1, value: 25, char: ')', color: '#f8fafc', desc: '冒険者憧れの標準的な片手剣。' },
  { name: 'ツーハンデッドソード', unidentified: 'きょだいな つるぎ', damage: '3d6', bonus: 2, value: 50, char: ')', color: '#facc15', desc: '両手で振り下ろす超破壊力の重剣。' },
  { name: '短剣 (ダガー)', unidentified: 'ナイフ', damage: '1d4', bonus: 0, value: 4, char: ')', color: '#94a3b8', desc: '投擲にも適した小型の刃物。' }
];

// 防具リスト (AC値: 低いほど強固)
export const ARMOR_TEMPLATES = [
  { name: '革の鎧 (レザー)', unidentified: 'かわの よろい', ac: 8, bonus: 0, value: 20, char: ']', color: '#b45309', desc: 'しなやかな硬化革で作られた軽装鎧。' },
  { name: '鋲付き革鎧', unidentified: 'びょうつきの よろい', ac: 7, bonus: 0, value: 35, char: ']', color: '#d97706', desc: '金属鋲で補強された革の鎧。' },
  { name: '鎖帷子 (チェイン)', unidentified: 'くさりかたびら', ac: 5, bonus: 0, value: 75, char: ']', color: '#94a3b8', desc: '細かな鉄鎖を編み込んだ標準的な鎧。' },
  { name: 'スプリントメイル', unidentified: 'いたあわせの よろい', ac: 4, bonus: 1, value: 120, char: ']', color: '#cbd5e1', desc: '金属板を縦に重ね合わせた重装鎧。' },
  { name: 'プレートメイル', unidentified: 'きんぞくの よろい', ac: 3, bonus: 1, value: 250, char: ']', color: '#38bdf8', desc: '全身を硬質鋼板で覆う最高峰の甲冑。' }
];

// ポーションリスト
export const POTION_KEYS = [
  { key: 'HEAL', name: 'かいふくの薬', desc: 'HPを大きく回復する(10〜25)。最大HPが微増することもある。' },
  { key: 'EXTRA_HEAL', name: 'だいかいふくの薬', desc: '瀕死の傷をも完治させ、最大HPを恒久的に増加させる奇跡の霊薬。' },
  { key: 'RESTORE_STR', name: 'ちからのかいふく薬', desc: 'モンスターや毒で低下した筋力(STR)を元の最大値まで戻す。' },
  { key: 'GAIN_STR', name: 'ちからの薬', desc: '筋力(STR)の最大値を1上昇させる。' },
  { key: 'POISON', name: 'どくの薬', desc: '筋力(STR)を1〜2低下させる危険な毒液。' },
  { key: 'CONFUSION', name: 'こんらんの薬', desc: '意識が混濁し、足元がおぼつかなくなる。' },
  { key: 'BLINDNESS', name: 'もうもくの薬', desc: '一時的に視力を失い、周囲が見えなくなる。' },
  { key: 'HASTE', name: 'かせいの薬 (ヘイスト)', desc: '一時的に敏捷性が倍増し、2回行動できるようになる。' }
];

// 巻物リスト
export const SCROLL_KEYS = [
  { key: 'IDENTIFY', name: 'しきべつの巻物', desc: '所持品の中から1つのアイテムの真の名前・性質・呪いを鑑定する。' },
  { key: 'TELEPORT', name: 'テレポートの巻物', desc: '読んだ者を瞬時にフロア内のランダムな安全な場所へ転送する。' },
  { key: 'MAP', name: 'ちずの巻物', desc: 'このフロアのすべての部屋と通路の位置を心眼に映し出す。' },
  { key: 'ENCHANT_WEAPON', name: 'ぶききょうかの巻物', desc: '現在装備している武器の強化値を+1する。' },
  { key: 'ENCHANT_ARMOR', name: 'よろいきょうかの巻物', desc: '現在装備している鎧の強化値を+1し、錆びを防ぐ。' },
  { key: 'REMOVE_CURSE', name: 'のろいをとく巻物', desc: '現在身につけている呪われた装備の呪縛を解き放つ。' },
  { key: 'SLEEP', name: 'ねむりの巻物', desc: '部屋にいるモンスター全員を深い眠りに誘う。' }
];

// 杖リスト
export const WAND_KEYS = [
  { key: 'TELEPORT_AWAY', name: 'テレポートの杖', desc: '狙ったモンスターを遠くへテレポートさせる。' },
  { key: 'SLOW_MONSTER', name: 'げんそくの杖', desc: 'モンスターの移動速度を半減させる。' },
  { key: 'LIGHTNING', name: 'いなづまの杖', desc: '壁に反射する強力な電撃ビームを放つ(ダメージ20)。' },
  { key: 'FIRE', name: 'かえんの杖', desc: '一直線に灼熱の火球を放つ(ダメージ18)。' },
  { key: 'SLEEP', name: 'すいみんの杖', desc: 'モンスターを即座に眠らせる。' },
  { key: 'MAGIC_MISSILE', name: 'まほうのだんの杖', desc: '光の弾丸を撃ち出してダメージを与える(ダメージ10)。' }
];

// 指輪リスト
export const RING_KEYS = [
  { key: 'PROTECTION', name: 'しゅごの指輪', desc: '身を守る加護によりACを1改善する。' },
  { key: 'STRENGTH', name: 'わんりょくの指輪', desc: '筋力(STR)を+1増強する。' },
  { key: 'SEARCH', name: 'たんさくの指輪', desc: '隠し扉や罠を自動的に発見しやすくなる。' },
  { key: 'STEALTH', name: 'しのびの指輪', desc: '足音を消し、眠っているモンスターを起こしにくくする。' },
  { key: 'SLOW_DIGESTION', name: 'しょうかちえんの指輪', desc: '空腹の進行速度を大幅に遅らせる。' },
  { key: 'REGENERATION', name: 'さいせいの指輪', desc: 'HPの自然回復速度を2倍にする。' }
];

// アイテム生成ヘルパー
export function generateRandomItem(dungeonLevel: number): Item {
  const roll = Math.random();

  // 1. 食料 (約20%)
  if (roll < 0.20) {
    return {
      id: 'food_' + Math.random().toString(36).substring(2, 9),
      type: 'FOOD',
      name: '保存食 (Food ration)',
      unidentifiedName: '保存食',
      identified: true,
      char: ':',
      color: '#fbbf24',
      value: 5,
      quantity: 1,
      description: 'ダンジョン探索用の栄養満点な干し肉と堅パン。空腹を満たす。'
    };
  }

  // 2. ポーション (約22%)
  if (roll < 0.42) {
    const pDef = POTION_KEYS[Math.floor(Math.random() * POTION_KEYS.length)];
    const unId = globalIdentityMap.potions[pDef.key] || 'くすり';
    const isId = isIdentified(pDef.key);
    return {
      id: 'pot_' + pDef.key + '_' + Math.random().toString(36).substring(2, 9),
      type: 'POTION',
      name: pDef.name,
      unidentifiedName: unId,
      identified: isId,
      char: '!',
      color: '#a855f7',
      value: 15,
      description: pDef.desc
    };
  }

  // 3. 巻物 (約20%)
  if (roll < 0.62) {
    const sDef = SCROLL_KEYS[Math.floor(Math.random() * SCROLL_KEYS.length)];
    const unId = globalIdentityMap.scrolls[sDef.key] || '巻物';
    const isId = isIdentified(sDef.key);
    return {
      id: 'scr_' + sDef.key + '_' + Math.random().toString(36).substring(2, 9),
      type: 'SCROLL',
      name: sDef.name,
      unidentifiedName: unId,
      identified: isId,
      char: '?',
      color: '#f43f5e',
      value: 20,
      description: sDef.desc
    };
  }

  // 4. 武器 (約14%)
  if (roll < 0.76) {
    const wDef = WEAPON_TEMPLATES[Math.floor(Math.random() * WEAPON_TEMPLATES.length)];
    const cursed = Math.random() < 0.15;
    const bonus = cursed ? -1 : (Math.random() < 0.3 ? 1 : 0);
    return {
      id: 'wep_' + Math.random().toString(36).substring(2, 9),
      type: 'WEAPON',
      name: `${wDef.name} ${bonus >= 0 ? '+' + bonus : bonus}`,
      unidentifiedName: wDef.unidentified,
      identified: false,
      char: wDef.char,
      color: wDef.color,
      value: wDef.value + bonus * 10,
      bonus: bonus,
      cursed: cursed,
      slot: 'weapon',
      description: `${wDef.desc} (ダメージ: ${wDef.damage})`
    };
  }

  // 5. 防具 (約12%)
  if (roll < 0.88) {
    const aDef = ARMOR_TEMPLATES[Math.min(ARMOR_TEMPLATES.length - 1, Math.floor(Math.random() * (dungeonLevel > 5 ? 5 : 3)))];
    const cursed = Math.random() < 0.15;
    const bonus = cursed ? -1 : (Math.random() < 0.3 ? 1 : 0);
    return {
      id: 'arm_' + Math.random().toString(36).substring(2, 9),
      type: 'ARMOR',
      name: `${aDef.name} ${bonus >= 0 ? '+' + bonus : bonus}`,
      unidentifiedName: aDef.unidentified,
      identified: false,
      char: aDef.char,
      color: aDef.color,
      value: aDef.value + bonus * 15,
      armorAc: aDef.ac - bonus,
      bonus: bonus,
      cursed: cursed,
      slot: 'armor',
      description: `${aDef.desc} (基本AC: ${aDef.ac})`
    };
  }

  // 6. 杖 (約6%)
  if (roll < 0.94) {
    const wandDef = WAND_KEYS[Math.floor(Math.random() * WAND_KEYS.length)];
    const unId = globalIdentityMap.wands[wandDef.key] || 'つえ';
    const isId = isIdentified(wandDef.key);
    const charges = Math.floor(Math.random() * 5) + 3;
    return {
      id: 'wnd_' + wandDef.key + '_' + Math.random().toString(36).substring(2, 9),
      type: 'WAND',
      name: wandDef.name,
      unidentifiedName: unId,
      identified: isId,
      charges: charges,
      char: '/',
      color: '#06b6d4',
      value: 30,
      description: `${wandDef.desc} (残り使用回数: ${charges}回)`
    };
  }

  // 7. 指輪 (約6%)
  const rDef = RING_KEYS[Math.floor(Math.random() * RING_KEYS.length)];
  const unId = globalIdentityMap.rings[rDef.key] || 'ゆびわ';
  const isId = isIdentified(rDef.key);
  const cursed = Math.random() < 0.15;
  return {
    id: 'rng_' + rDef.key + '_' + Math.random().toString(36).substring(2, 9),
    type: 'RING',
    name: rDef.name,
    unidentifiedName: unId,
    identified: isId,
    cursed: cursed,
    char: '=',
    color: '#eab308',
    value: 50,
    slot: 'ring_left',
    description: rDef.desc
  };
}

// イエンダーの魔除けの生成 (26階以降)
export function createAmuletOfYendor(): Item {
  return {
    id: 'amulet_of_yendor',
    type: 'AMULET',
    name: 'イエンダーの魔除け (Amulet of Yendor)',
    unidentifiedName: 'きらめく 黄金のまよけ',
    identified: true,
    char: '*',
    color: '#fbbf24',
    value: 10000,
    description: '神話に謳われる究極の秘宝。これを持ってダンジョン地上1階から生還すれば、真の英雄となる！'
  };
}
