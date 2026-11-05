/**
 * 元祖 ローグ 日本語版 (Windows Edition)
 * 型定義ファイル
 */

export type TileType = 
  | 'EMPTY'        // 何もない（岩盤）
  | 'FLOOR'        // 部屋の床 '.'
  | 'CORRIDOR'     // 通路 '#'
  | 'WALL'         // 壁 '|' または '-'
  | 'DOOR_CLOSED'  // 閉じた扉 '+'
  | 'DOOR_OPEN'    // 開いた扉 '\''
  | 'STAIRS_DOWN'  // 下り階段 '>'
  | 'STAIRS_UP'    // 上り階段 '<'
  | 'TRAP_TRAPDOOR'// 落とし穴 '^'
  | 'TRAP_ARROW'   // 毒矢の罠 '^'
  | 'TRAP_TELEPORT'// テレポートの罠 '^'
  | 'TRAP_SLEEP'   // 睡眠ガスの罠 '^'
  | 'TRAP_RUST';   // サビの罠 '^'

export interface Position {
  x: number;
  y: number;
}

export type ItemType = 
  | 'WEAPON' 
  | 'ARMOR' 
  | 'POTION' 
  | 'SCROLL' 
  | 'WAND' 
  | 'RING' 
  | 'FOOD' 
  | 'AMULET' 
  | 'GOLD';

export interface Item {
  id: string;
  type: ItemType;
  name: string;             // 判明時の本名 (例: "かいふくのくすり", "ロングソード")
  unidentifiedName: string; // 未識別時の外見 (例: "あかい くすり", "おおきな けん")
  identified: boolean;      // 識別済みか
  char: string;             // ASCII表示文字
  color: string;            // 表示色
  value: number;            // 価値/ゴールド額
  bonus?: number;           // 強化値 (+1, +2 など)
  armorAc?: number;         // 防具のAC値
  charges?: number;         // 杖の残り回数
  cursed?: boolean;         // 呪われているか
  description: string;      // 説明文
  equipped?: boolean;       // 装備中か
  quantity?: number;        // 個数 (矢や食料など)
  slot?: 'weapon' | 'armor' | 'ring_left' | 'ring_right';
  x?: number;
  y?: number;
}

export interface MonsterDef {
  char: string;
  name: string;
  japaneseName: string;
  hp: number;
  exp: number;
  ac: number;
  damage: string; // 例: "1d6", "2d8"
  speed: number;  // 1: 普通, 2: 俊敏, 0.5: 鈍足
  minLevel: number;
  maxLevel: number;
  color: string;
  special?: 'RUST' | 'STEAL_GOLD' | 'STEAL_ITEM' | 'DRAIN_HP' | 'DRAIN_EXP' | 'POISON' | 'CONFUSE' | 'FREEZE' | 'HOLD' | 'FIRE_BREATH' | 'TELEPORT';
  description: string;
}

export interface MonsterInstance {
  id: string;
  def: MonsterDef;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  sleeping: boolean;
  confusedTurns: number;
  frozenTurns: number;
  heldTurns: number;
}

export type HungerState = 'STARVING' | 'WEAK' | 'HUNGRY' | 'NORMAL' | 'FULL';

export interface PlayerStats {
  name: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  str: number;
  maxStr: number;
  ac: number;
  level: number;
  exp: number;
  nextExp: number;
  gold: number;
  hunger: number; // 0 - 2000
  hungerState: HungerState;
  turns: number;
  dungeonLevel: number;
  maxDungeonLevel: number;
  hasAmulet: boolean;
  confusedTurns: number;
  blindTurns: number;
  hallucinatingTurns: number;
  hasteTurns: number;
  equippedWeapon?: Item;
  equippedArmor?: Item;
  equippedRingLeft?: Item;
  equippedRingRight?: Item;
}

export interface Room {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  isDark: boolean;
  connected: number[];
}

export interface DungeonLevel {
  level: number;
  width: number;
  height: number;
  tiles: TileType[][];
  discovered: boolean[][]; // プレイヤーが一度でも視認したか
  visible: boolean[][];    // 現在視界内にあるか
  rooms: Room[];
  monsters: MonsterInstance[];
  items: Item[];
  stairsDownPos: Position;
  stairsUpPos?: Position;
}

export interface LogMessage {
  id: string;
  text: string;
  type: 'info' | 'combat' | 'danger' | 'heal' | 'item' | 'system' | 'special';
  turn: number;
}

export type ScreenMode = 'GAME' | 'INVENTORY' | 'HELP' | 'SETTINGS' | 'SAVE_LOAD' | 'GAME_OVER' | 'VICTORY' | 'MAP_FULL';

export type DisplayStyle = 'RETRO_DOS' | 'CLASSIC_ASCII' | 'GREEN_PHOSPHOR' | 'MODERN_TILES';

export interface GameSettings {
  displayStyle: DisplayStyle;
  crtEffect: boolean;
  soundEnabled: boolean;
  soundVolume: number; // 0.0 - 1.0
  autoPickup: boolean;
  fastWalk: boolean;
}

export interface HighScoreRecord {
  name: string;
  score: number;
  gold: number;
  level: number;
  dungeonLevel: number;
  date: string;
  causeOfDeath: string;
  hasAmulet: boolean;
}
