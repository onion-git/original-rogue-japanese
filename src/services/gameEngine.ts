/**
 * 元祖 ローグ (1980) ゲームエンジン
 * ターン管理、戦闘、アイテム、視界、状態異常、セーブ/ロード
 */

import { DungeonLevel, GameSettings, Item, LogMessage, MonsterInstance, PlayerStats, Position, ScreenMode } from '../types/rogue';
import { generateDungeonLevel, findSpawnPosition } from './dungeonGen';
import { MONSTER_DEFS } from './monsterData';
import { markAsIdentified, resetGlobalIdentities, WEAPON_TEMPLATES, ARMOR_TEMPLATES } from './itemsData';
import { sound } from './sound';

export interface GameState {
  player: PlayerStats;
  currentFloor: DungeonLevel;
  floors: Record<number, DungeonLevel>;
  log: LogMessage[];
  screenMode: ScreenMode;
  settings: GameSettings;
  gameOverReason?: string;
  isGameWon?: boolean;
  inspectTarget?: { x: number; y: number; text: string } | null;
}

export function createInitialGame(): GameState {
  resetGlobalIdentities();

  const firstFloor = generateDungeonLevel(1, false);
  const spawnPos = findSpawnPosition(firstFloor);

  // 初期装備
  const initialWeapon: Item = {
    id: 'init_mace',
    type: 'WEAPON',
    name: 'メイス +1',
    unidentifiedName: 'メイス +1',
    identified: true,
    char: ')',
    color: '#cbd5e1',
    value: 15,
    bonus: 1,
    slot: 'weapon',
    equipped: true,
    description: '冒険者ギルドから支給された愛用のメイス。'
  };

  const initialArmor: Item = {
    id: 'init_leather',
    type: 'ARMOR',
    name: '革の鎧',
    unidentifiedName: '革の鎧',
    identified: true,
    char: ']',
    color: '#b45309',
    value: 20,
    armorAc: 8,
    bonus: 0,
    slot: 'armor',
    equipped: true,
    description: 'しなやかな硬化革で作られた軽装鎧。'
  };

  const initialFood: Item = {
    id: 'init_food',
    type: 'FOOD',
    name: '保存食 (Food ration)',
    unidentifiedName: '保存食',
    identified: true,
    char: ':',
    color: '#fbbf24',
    value: 5,
    quantity: 1,
    description: 'ダンジョン探索用の栄養食。'
  };

  const player: PlayerStats = {
    name: '冒険者',
    x: spawnPos.x,
    y: spawnPos.y,
    hp: 12,
    maxHp: 12,
    str: 16,
    maxStr: 16,
    ac: 8,
    level: 1,
    exp: 0,
    nextExp: 10,
    gold: 0,
    hunger: 1200,
    hungerState: 'NORMAL',
    turns: 1,
    dungeonLevel: 1,
    maxDungeonLevel: 1,
    hasAmulet: false,
    confusedTurns: 0,
    blindTurns: 0,
    hallucinatingTurns: 0,
    hasteTurns: 0,
    equippedWeapon: initialWeapon,
    equippedArmor: initialArmor
  };

  const state: GameState = {
    player,
    currentFloor: firstFloor,
    floors: { 1: firstFloor },
    log: [
      {
        id: 'log_welcome',
        text: 'ドゥームダンジョンへようこそ！地下26階に眠る「イエンダーの魔除け」を手に入れ地上へ脱出せよ！',
        type: 'special',
        turn: 1
      },
      {
        id: 'log_controls',
        text: '【操作】キーボード(テンキー/矢印/Vim/hjklyubn)・マウス(クリック移動/右クリック調査)・ゲームパッドに対応。',
        type: 'system',
        turn: 1
      }
    ],
    screenMode: 'GAME',
    settings: {
      displayStyle: 'RETRO_DOS',
      crtEffect: false,
      soundEnabled: true,
      soundVolume: 0.6,
      autoPickup: true,
      fastWalk: true
    },
    inspectTarget: null
  };

  // 初期インベントリをウィンドウ用ストレージに保存
  inventoryStorage = [initialWeapon, initialArmor, initialFood];

  updateVisibility(state);
  return state;
}

// プレイヤーの所持品一覧
export let inventoryStorage: Item[] = [];

export function getInventory(): Item[] {
  return inventoryStorage;
}

export function setInventory(items: Item[]) {
  inventoryStorage = items;
}

export function addInventoryItem(item: Item): boolean {
  if (inventoryStorage.length >= 26) {
    return false; // 最大26種類 (a〜z)
  }
  // 食料のスタック
  if (item.type === 'FOOD') {
    const existing = inventoryStorage.find(i => i.type === 'FOOD' && i.name === item.name);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
      return true;
    }
  }
  inventoryStorage.push(item);
  return true;
}

export function removeInventoryItem(id: string): Item | undefined {
  const idx = inventoryStorage.findIndex(i => i.id === id);
  if (idx !== -1) {
    return inventoryStorage.splice(idx, 1)[0];
  }
  return undefined;
}

// ログ追加
export function addLog(state: GameState, text: string, type: LogMessage['type'] = 'info') {
  state.log.unshift({
    id: 'log_' + Math.random().toString(36).substring(2, 9),
    text,
    type,
    turn: state.player.turns
  });
  if (state.log.length > 80) {
    state.log.pop();
  }
}

// 視界更新
export function updateVisibility(state: GameState) {
  const { currentFloor, player } = state;
  const { width, height, tiles, rooms } = currentFloor;

  // 全マスを一旦 visible = false
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      currentFloor.visible[y][x] = false;
    }
  }

  // プレイヤーがどの部屋にいるかを探索
  const currentRoom = rooms.find(r => 
    player.x >= r.x && player.x < r.x + r.w &&
    player.y >= r.y && player.y < r.y + r.h
  );

  if (currentRoom && !currentRoom.isDark && !player.blindTurns) {
    // 明るい部屋にいる場合、部屋全体を視認
    for (let y = currentRoom.y; y < currentRoom.y + currentRoom.h; y++) {
      for (let x = currentRoom.x; x < currentRoom.x + currentRoom.w; x++) {
        if (y >= 0 && y < height && x >= 0 && x < width) {
          currentFloor.visible[y][x] = true;
          currentFloor.discovered[y][x] = true;
        }
      }
    }
  }

  // 通路、暗い部屋、または盲目時：プレイヤーの周囲8マス+自身を可視化
  const radius = player.blindTurns ? 0 : 1;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = player.x + dx;
      const ny = player.y + dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        currentFloor.visible[ny][nx] = true;
        currentFloor.discovered[ny][nx] = true;
      }
    }
  }
}

// レベルアップ計算
export function checkLevelUp(state: GameState) {
  const { player } = state;
  while (player.exp >= player.nextExp) {
    player.level += 1;
    player.nextExp = Math.floor(player.nextExp * 2.2);
    const hpGain = Math.floor(Math.random() * 6) + 5;
    player.maxHp += hpGain;
    player.hp += hpGain;
    addLog(state, `【祝】レベルが上がった！ 冒険者レベル ${player.level} (最大HP +${hpGain})`, 'special');
    sound.play('levelUp');
  }
}

// プレイヤーのアクション (移動・攻撃)
export function playerMoveOrAttack(state: GameState, dx: number, dy: number): boolean {
  if (state.screenMode !== 'GAME') return false;

  const { player, currentFloor } = state;

  // 混乱時は移動方向がランダムに曲がる
  let actualDx = dx;
  let actualDy = dy;
  if (player.confusedTurns > 0) {
    const randomDirs = [
      [-1, -1], [0, -1], [1, -1],
      [-1,  0],          [1,  0],
      [-1,  1], [0,  1], [1,  1]
    ];
    const pick = randomDirs[Math.floor(Math.random() * randomDirs.length)];
    actualDx = pick[0];
    actualDy = pick[1];
    addLog(state, '混乱していて足元がおぼつかない！', 'danger');
  }

  const targetX = player.x + actualDx;
  const targetY = player.y + actualDy;

  if (targetX < 0 || targetX >= currentFloor.width || targetY < 0 || targetY >= currentFloor.height) {
    sound.play('bump');
    addLog(state, 'ダンジョンの果てだ。これ以上進めない。', 'info');
    return false;
  }

  // 1. 移動先にモンスターがいる場合は攻撃！
  const monster = currentFloor.monsters.find(m => m.x === targetX && m.y === targetY);
  if (monster) {
    playerAttack(state, monster);
    endTurn(state);
    return true;
  }

  // 2. 地形判定
  const tile = currentFloor.tiles[targetY][targetX];

  if (tile === 'WALL' || tile === 'EMPTY') {
    sound.play('bump');
    addLog(state, '壁だ。そちらには進めない。', 'info');
    return false;
  }

  if (tile === 'DOOR_CLOSED') {
    currentFloor.tiles[targetY][targetX] = 'DOOR_OPEN';
    addLog(state, '扉を開けた。', 'info');
    sound.play('door');
    endTurn(state);
    return true;
  }

  // 移動実行
  player.x = targetX;
  player.y = targetY;
  sound.play('step');

  // 罠の踏破判定
  checkTraps(state, targetX, targetY);

  // 足元のアイテムチェック
  checkItemsAtFeet(state);

  endTurn(state);
  return true;
}

// 罠チェック
function checkTraps(state: GameState, x: number, y: number) {
  const tile = state.currentFloor.tiles[y][x];
  if (!tile.startsWith('TRAP_')) return;

  sound.play('trap');

  switch (tile) {
    case 'TRAP_TRAPDOOR': {
      addLog(state, '落とし穴に落ちてしまった！', 'danger');
      descendStairs(state, true);
      break;
    }
    case 'TRAP_ARROW': {
      const dmg = Math.floor(Math.random() * 4) + 2;
      state.player.hp = Math.max(0, state.player.hp - dmg);
      addLog(state, `毒矢の罠が作動した！ 矢が命中し ${dmg} のダメージ！`, 'danger');
      if (Math.random() < 0.4 && state.player.str > 3) {
        state.player.str -= 1;
        addLog(state, '毒が回って筋力が低下した (STR -1)！', 'danger');
      }
      break;
    }
    case 'TRAP_TELEPORT': {
      addLog(state, 'テレポートの罠を踏んだ！ 周囲の空間が歪む！', 'special');
      const safePos = findSpawnPosition(state.currentFloor);
      state.player.x = safePos.x;
      state.player.y = safePos.y;
      break;
    }
    case 'TRAP_SLEEP': {
      addLog(state, '睡眠ガスの罠が破裂した！ 深い眠気に襲われる...', 'danger');
      state.player.confusedTurns += 3;
      break;
    }
    case 'TRAP_RUST': {
      if (state.player.equippedArmor) {
        state.player.equippedArmor.armorAc = (state.player.equippedArmor.armorAc || 8) + 1;
        state.player.ac = state.player.equippedArmor.armorAc;
        addLog(state, '酸の罠を浴びてしまった！ 鎧が錆びついて脆くなった！', 'danger');
      } else {
        addLog(state, '酸の蒸気を浴びたが、鎧を身につけていなかったため無事だった。', 'info');
      }
      break;
    }
  }

  if (state.player.hp <= 0) {
    handlePlayerDeath(state, '罠の餌食になった');
  }
}

// 足元のアイテムチェック
function checkItemsAtFeet(state: GameState) {
  const { currentFloor, player, settings } = state;
  const itemIdx = currentFloor.items.findIndex(it => it.x === player.x && it.y === player.y);

  if (itemIdx !== -1) {
    const item = currentFloor.items[itemIdx];

    // ゴールドなら無条件に拾う
    if (item.type === 'GOLD') {
      player.gold += item.value;
      currentFloor.items.splice(itemIdx, 1);
      addLog(state, `${item.name} を拾った！ (現在のゴールド: ${player.gold})`, 'item');
      sound.play('pickup');
      return;
    }

    // 自動拾得ONの場合
    if (settings.autoPickup) {
      if (inventoryStorage.length < 26) {
        currentFloor.items.splice(itemIdx, 1);
        addInventoryItem(item);
        addLog(state, `${item.identified ? item.name : item.unidentifiedName} を拾った。`, 'item');
        sound.play('pickup');
        if (item.type === 'AMULET') {
          player.hasAmulet = true;
          addLog(state, '【重要】伝説の「イエンダーの魔除け」を手に入れた！ 地上1階へ脱出して生還せよ！', 'special');
          sound.play('victory');
        }
      } else {
        addLog(state, `足元に ${item.identified ? item.name : item.unidentifiedName} があるが、持ち物がいっぱいだ。`, 'info');
      }
    } else {
      addLog(state, `足元に ${item.identified ? item.name : item.unidentifiedName} がある。(スペースキーで待機/拾うボタン)`, 'info');
    }
  }
}

// プレイヤーによる攻撃
function playerAttack(state: GameState, monster: MonsterInstance) {
  const { player } = state;
  monster.sleeping = false;

  // 命中判定
  const roll = Math.floor(Math.random() * 20) + 1;
  const hitBonus = player.level + (player.equippedWeapon?.bonus || 0);
  const targetAc = monster.def.ac;

  if (roll + hitBonus >= 10 - targetAc) {
    // 命中！ダメージ計算
    let baseDmg = Math.floor(Math.random() * 6) + 1; // 素手
    if (player.equippedWeapon) {
      // 武器のダイスロール
      const wBonus = player.equippedWeapon.bonus || 0;
      baseDmg = Math.floor(Math.random() * 8) + 2 + wBonus;
    }
    const strBonus = Math.max(0, Math.floor((player.str - 14) / 2));
    const totalDmg = Math.max(1, baseDmg + strBonus);

    monster.hp -= totalDmg;
    sound.play('hit');
    addLog(state, `${monster.def.japaneseName} に攻撃！ ${totalDmg} のダメージを与えた。`, 'combat');

    if (monster.hp <= 0) {
      // モンスター撃破！
      sound.play('monsterDie');
      addLog(state, `${monster.def.japaneseName} を倒した！ (EXP +${monster.def.exp})`, 'special');
      player.exp += monster.def.exp;
      checkLevelUp(state);

      // モンスター削除
      const idx = state.currentFloor.monsters.findIndex(m => m.id === monster.id);
      if (idx !== -1) {
        state.currentFloor.monsters.splice(idx, 1);
      }
    }
  } else {
    sound.play('miss');
    addLog(state, `${monster.def.japaneseName} への攻撃は外れた！`, 'info');
  }
}

// 周囲の探索 (Search)
export function playerSearch(state: GameState) {
  const { player, currentFloor } = state;
  addLog(state, '周囲を慎重に探索した...', 'info');
  sound.play('step');

  let foundSomething = false;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = player.x + dx;
      const ny = player.y + dy;
      if (nx >= 0 && nx < currentFloor.width && ny >= 0 && ny < currentFloor.height) {
        const tile = currentFloor.tiles[ny][nx];
        if (tile.startsWith('TRAP_')) {
          currentFloor.discovered[ny][nx] = true;
          addLog(state, '罠を発見した！', 'special');
          foundSomething = true;
        }
      }
    }
  }
  if (!foundSomething) {
    addLog(state, '何も見つからなかった。', 'info');
  }
  endTurn(state);
}

// 待機 (Pass turn)
export function playerWait(state: GameState) {
  addLog(state, 'その場で1ターン様子を見た。', 'info');
  endTurn(state);
}

// 足元のアイテムを拾う手動アクション
export function pickupItem(state: GameState): boolean {
  const { currentFloor, player } = state;
  const idx = currentFloor.items.findIndex(it => it.x === player.x && it.y === player.y);
  if (idx === -1) {
    addLog(state, '足元には何もない。', 'info');
    sound.play('error');
    return false;
  }
  const item = currentFloor.items[idx];
  if (addInventoryItem(item)) {
    currentFloor.items.splice(idx, 1);
    addLog(state, `${item.identified ? item.name : item.unidentifiedName} を拾った。`, 'item');
    sound.play('pickup');
    if (item.type === 'AMULET') {
      player.hasAmulet = true;
      addLog(state, '【重要】伝説の「イエンダーの魔除け」を手に入れた！ 地上1階へ脱出して生還せよ！', 'special');
      sound.play('victory');
    }
    endTurn(state);
    return true;
  } else {
    addLog(state, '持ち物がいっぱいで拾えない！', 'danger');
    sound.play('error');
    return false;
  }
}

// 階段を降りる (>)
export function descendStairs(state: GameState, forced: boolean = false): boolean {
  const { player, currentFloor } = state;
  const isStairs = currentFloor.tiles[player.y][player.x] === 'STAIRS_DOWN';

  if (!isStairs && !forced) {
    addLog(state, 'ここには下り階段はない。', 'info');
    sound.play('error');
    return false;
  }

  const nextLvl = player.dungeonLevel + 1;
  player.dungeonLevel = nextLvl;
  player.maxDungeonLevel = Math.max(player.maxDungeonLevel, nextLvl);

  sound.play('stairs');
  addLog(state, `地下 ${nextLvl} 階へ降りた。`, 'special');

  let newFloor = state.floors[nextLvl];
  if (!newFloor) {
    newFloor = generateDungeonLevel(nextLvl, player.hasAmulet);
    state.floors[nextLvl] = newFloor;
  }
  state.currentFloor = newFloor;

  const spawn = findSpawnPosition(newFloor);
  player.x = spawn.x;
  player.y = spawn.y;

  updateVisibility(state);
  return true;
}

// 階段を登る (<)
export function ascendStairs(state: GameState): boolean {
  const { player, currentFloor } = state;
  const isStairs = currentFloor.tiles[player.y][player.x] === 'STAIRS_UP';

  if (!isStairs) {
    addLog(state, 'ここには上り階段はない。', 'info');
    sound.play('error');
    return false;
  }

  if (player.dungeonLevel === 1) {
    if (player.hasAmulet) {
      // 完全勝利！
      state.isGameWon = true;
      state.screenMode = 'VICTORY';
      sound.play('victory');
      addLog(state, '【大勝利】イエンダーの魔除けを手にダンジョンからの生還を果たした！', 'special');
      return true;
    } else {
      addLog(state, 'イエンダーの魔除けを持たずに逃げ出すわけにはいかない！', 'danger');
      sound.play('error');
      return false;
    }
  }

  const prevLvl = player.dungeonLevel - 1;
  player.dungeonLevel = prevLvl;

  sound.play('stairs');
  addLog(state, `地下 ${prevLvl} 階へ登った。`, 'special');

  let prevFloor = state.floors[prevLvl];
  if (!prevFloor) {
    prevFloor = generateDungeonLevel(prevLvl, player.hasAmulet);
    state.floors[prevLvl] = prevFloor;
  }
  state.currentFloor = prevFloor;

  if (prevFloor.stairsDownPos) {
    player.x = prevFloor.stairsDownPos.x;
    player.y = prevFloor.stairsDownPos.y;
  } else {
    const spawn = findSpawnPosition(prevFloor);
    player.x = spawn.x;
    player.y = spawn.y;
  }

  updateVisibility(state);
  return true;
}

// アイテム使用 (Use / Quaff / Read / Eat)
export function useItem(state: GameState, item: Item): boolean {
  const { player } = state;

  switch (item.type) {
    case 'FOOD': {
      player.hunger = Math.min(2000, player.hunger + 800);
      player.hungerState = 'NORMAL';
      sound.play('pickup');
      addLog(state, '保存食を食べた。腹が満たされた！', 'heal');
      if (item.quantity && item.quantity > 1) {
        item.quantity -= 1;
      } else {
        removeInventoryItem(item.id);
      }
      endTurn(state);
      return true;
    }

    case 'POTION': {
      sound.play('potion');
      removeInventoryItem(item.id);
      markAsIdentified(item.id);
      item.identified = true;

      if (item.name.includes('かいふく') || item.name.includes('HEAL')) {
        const healAmt = item.name.includes('だい') ? 35 : 16;
        player.hp = Math.min(player.maxHp, player.hp + healAmt);
        if (item.name.includes('だい')) {
          player.maxHp += 2;
        }
        addLog(state, `薬を飲んだ。傷が癒えた！ (HP: ${player.hp}/${player.maxHp})`, 'heal');
      } else if (item.name.includes('ちから')) {
        player.str = Math.min(player.maxStr + 1, player.str + 2);
        player.maxStr = Math.max(player.maxStr, player.str);
        addLog(state, `薬を飲んだ。全身に力がみなぎる！ (STR: ${player.str}/${player.maxStr})`, 'heal');
      } else if (item.name.includes('かせい') || item.name.includes('ヘイスト')) {
        player.hasteTurns += 20;
        addLog(state, '素早く動けるようになった！ (ヘイスト状態)', 'special');
      } else if (item.name.includes('どく')) {
        player.str = Math.max(3, player.str - 1);
        addLog(state, '毒薬だった！ 筋力が衰えてしまった (STR -1)！', 'danger');
      } else {
        // その他回復
        player.hp = Math.min(player.maxHp, player.hp + 12);
        addLog(state, `薬を飲んだ。体調が戻った。`, 'heal');
      }

      endTurn(state);
      return true;
    }

    case 'SCROLL': {
      sound.play('scroll');
      removeInventoryItem(item.id);
      markAsIdentified(item.id);
      item.identified = true;

      if (item.name.includes('ちず') || item.name.includes('MAP')) {
        for (let y = 0; y < state.currentFloor.height; y++) {
          for (let x = 0; x < state.currentFloor.width; x++) {
            if (state.currentFloor.tiles[y][x] !== 'EMPTY') {
              state.currentFloor.discovered[y][x] = true;
            }
          }
        }
        addLog(state, '地図の巻物を読んだ。フロア全体の構造が頭に浮かんだ！', 'special');
      } else if (item.name.includes('テレポート') || item.name.includes('TELEPORT')) {
        const spawn = findSpawnPosition(state.currentFloor);
        player.x = spawn.x;
        player.y = spawn.y;
        addLog(state, 'テレポートの巻物を読んだ！ 別の場所へ転送された！', 'special');
      } else if (item.name.includes('ぶききょうか') || item.name.includes('WEAPON')) {
        if (player.equippedWeapon) {
          player.equippedWeapon.bonus = (player.equippedWeapon.bonus || 0) + 1;
          player.equippedWeapon.name = player.equippedWeapon.name.replace(/\+\d+/, `+${player.equippedWeapon.bonus}`);
          addLog(state, `武器強化の巻物を読んだ！ 装備中の武器が青白く輝いた (+${player.equippedWeapon.bonus})！`, 'special');
        } else {
          addLog(state, '武器を装備していなかったため、魔法は霧散した。', 'info');
        }
      } else if (item.name.includes('よろいきょうか') || item.name.includes('ARMOR')) {
        if (player.equippedArmor) {
          player.equippedArmor.armorAc = Math.max(0, (player.equippedArmor.armorAc || 8) - 1);
          player.ac = player.equippedArmor.armorAc;
          addLog(state, `鎧強化の巻物を読んだ！ 鎧の防御力が高まった (AC: ${player.ac})！`, 'special');
        } else {
          addLog(state, '鎧を装備していなかったため、魔法は霧散した。', 'info');
        }
      } else {
        addLog(state, '巻物を読んだ。周囲のモンスターが眠りに落ちた！', 'special');
        state.currentFloor.monsters.forEach(m => m.sleeping = true);
      }

      endTurn(state);
      return true;
    }

    case 'WEAPON': {
      if (player.equippedWeapon?.id === item.id) {
        addLog(state, `${item.name} は既に装備している。`, 'info');
        return false;
      }
      if (player.equippedWeapon) {
        player.equippedWeapon.equipped = false;
      }
      player.equippedWeapon = item;
      item.equipped = true;
      item.identified = true;
      addLog(state, `${item.name} を装備した。`, 'special');
      sound.play('pickup');
      endTurn(state);
      return true;
    }

    case 'ARMOR': {
      if (player.equippedArmor?.id === item.id) {
        addLog(state, `${item.name} は既に身につけている。`, 'info');
        return false;
      }
      if (player.equippedArmor) {
        player.equippedArmor.equipped = false;
      }
      player.equippedArmor = item;
      item.equipped = true;
      item.identified = true;
      player.ac = item.armorAc || 8;
      addLog(state, `${item.name} を身につけた (AC: ${player.ac})。`, 'special');
      sound.play('pickup');
      endTurn(state);
      return true;
    }

    case 'WAND': {
      sound.play('wand');
      item.charges = (item.charges || 3) - 1;
      addLog(state, `${item.name} を振った！ ビームが直線上に放たれた！`, 'special');
      // 最も近い視界内のモンスターにダメージ
      const visibleMon = state.currentFloor.monsters.find(m => state.currentFloor.visible[m.y][m.x]);
      if (visibleMon) {
        visibleMon.hp -= 18;
        visibleMon.sleeping = false;
        addLog(state, `光弾が ${visibleMon.def.japaneseName} に直撃し 18 の大ダメージ！`, 'combat');
        if (visibleMon.hp <= 0) {
          sound.play('monsterDie');
          addLog(state, `${visibleMon.def.japaneseName} を消滅させた！`, 'special');
          player.exp += visibleMon.def.exp;
          checkLevelUp(state);
          const mIdx = state.currentFloor.monsters.findIndex(m => m.id === visibleMon.id);
          if (mIdx !== -1) state.currentFloor.monsters.splice(mIdx, 1);
        }
      }
      if ((item.charges || 0) <= 0) {
        addLog(state, '杖の魔力が尽きた。', 'info');
      }
      endTurn(state);
      return true;
    }

    default:
      addLog(state, 'そのアイテムは直接使うことはできない。', 'info');
      sound.play('error');
      return false;
  }
}

// アイテムを足元に置く (Drop)
export function dropItem(state: GameState, item: Item): boolean {
  const { currentFloor, player } = state;
  if (currentFloor.items.some(i => i.x === player.x && i.y === player.y)) {
    addLog(state, '足元にはすでに別のアイテムがある！', 'danger');
    sound.play('error');
    return false;
  }

  if (item.equipped) {
    if (item.cursed) {
      addLog(state, '呪われていて外せない！', 'danger');
      sound.play('error');
      return false;
    }
    item.equipped = false;
    if (player.equippedWeapon?.id === item.id) player.equippedWeapon = undefined;
    if (player.equippedArmor?.id === item.id) {
      player.equippedArmor = undefined;
      player.ac = 10;
    }
  }

  removeInventoryItem(item.id);
  item.x = player.x;
  item.y = player.y;
  currentFloor.items.push(item);

  sound.play('drop');
  addLog(state, `${item.identified ? item.name : item.unidentifiedName} を足元に置いた。`, 'info');
  endTurn(state);
  return true;
}

// ターン終了処理 (モンスター行動 & 飢餓 & HP自然回復)
export function endTurn(state: GameState) {
  const { player, currentFloor } = state;
  player.turns += 1;

  // 1. 状態異常のカウント減少
  if (player.confusedTurns > 0) player.confusedTurns -= 1;
  if (player.blindTurns > 0) player.blindTurns -= 1;
  if (player.hasteTurns > 0) player.hasteTurns -= 1;

  // 2. 満腹度進行
  player.hunger = Math.max(0, player.hunger - 1);
  if (player.hunger <= 150 && player.hunger > 50) {
    if (player.hungerState !== 'HUNGRY') {
      player.hungerState = 'HUNGRY';
      addLog(state, 'お腹が空いてきた...', 'danger');
    }
  } else if (player.hunger <= 50 && player.hunger > 0) {
    if (player.hungerState !== 'WEAK') {
      player.hungerState = 'WEAK';
      addLog(state, '空腹のあまり体が震えてきた (飢餓状態)！', 'danger');
    }
  } else if (player.hunger <= 0) {
    player.hungerState = 'STARVING';
    if (player.turns % 3 === 0) {
      player.hp -= 1;
      addLog(state, '飢餓により体力が失われていく...', 'danger');
      if (player.hp <= 0) {
        handlePlayerDeath(state, '餓死した');
        return;
      }
    }
  } else {
    player.hungerState = 'NORMAL';
  }

  // 3. 自然治癒 (満腹時、数ターンに1回HP+1)
  if (player.hungerState === 'NORMAL' && player.turns % (player.level >= 8 ? 4 : 8) === 0) {
    if (player.hp < player.maxHp) {
      player.hp = Math.min(player.maxHp, player.hp + 1);
    }
  }

  // 4. モンスターAI行動
  updateVisibility(state);

  for (const monster of currentFloor.monsters) {
    // 睡眠中の場合、視界内に入ると確率で起きる
    if (monster.sleeping) {
      if (currentFloor.visible[monster.y][monster.x] && Math.random() < 0.4) {
        monster.sleeping = false;
        addLog(state, `${monster.def.japaneseName} が目を覚ました！`, 'info');
      } else {
        continue;
      }
    }

    const dist = Math.max(Math.abs(monster.x - player.x), Math.abs(monster.y - player.y));

    // 隣接しているなら攻撃！
    if (dist <= 1) {
      monsterAttackPlayer(state, monster);
      if (player.hp <= 0) {
        handlePlayerDeath(state, `${monster.def.japaneseName} に倒された`);
        return;
      }
    } else if (dist <= 8) {
      // プレイヤーを追尾移動
      const stepX = monster.x === player.x ? 0 : (player.x > monster.x ? 1 : -1);
      const stepY = monster.y === player.y ? 0 : (player.y > monster.y ? 1 : -1);

      const targetX = monster.x + stepX;
      const targetY = monster.y + stepY;

      // 移動先が通行可能かつ他のモンスターがいないか
      const tile = currentFloor.tiles[targetY]?.[targetX];
      const isBlocked = !tile || tile === 'WALL' || tile === 'EMPTY' ||
        currentFloor.monsters.some(other => other.id !== monster.id && other.x === targetX && other.y === targetY) ||
        (targetX === player.x && targetY === player.y);

      if (!isBlocked) {
        monster.x = targetX;
        monster.y = targetY;
      }
    }
  }

  updateVisibility(state);
}

// モンスターのプレイヤー攻撃
function monsterAttackPlayer(state: GameState, monster: MonsterInstance) {
  const { player } = state;
  const roll = Math.floor(Math.random() * 20) + 1;
  const targetAc = player.ac;

  if (roll >= 10 - targetAc) {
    // 命中！
    const dmg = Math.floor(Math.random() * 5) + 1;
    player.hp = Math.max(0, player.hp - dmg);
    sound.play('monsterHit');
    addLog(state, `${monster.def.japaneseName} の攻撃が直撃！ ${dmg} のダメージを受けた！`, 'danger');

    // 特殊能力発動判定
    if (monster.def.special) {
      applyMonsterSpecial(state, monster);
    }
  } else {
    addLog(state, `${monster.def.japaneseName} の攻撃を間一髪かわした！`, 'info');
  }
}

// モンスターの特殊攻撃
function applyMonsterSpecial(state: GameState, monster: MonsterInstance) {
  const { player } = state;
  switch (monster.def.special) {
    case 'RUST': {
      if (player.equippedArmor) {
        player.equippedArmor.armorAc = (player.equippedArmor.armorAc || 8) + 1;
        player.ac = player.equippedArmor.armorAc;
        addLog(state, 'アクエイターの分泌液で鎧が錆びついた！ (AC低下)', 'danger');
      }
      break;
    }
    case 'POISON': {
      if (player.str > 3 && Math.random() < 0.5) {
        player.str -= 1;
        addLog(state, 'ガラガラヘビの猛毒が回った！ 筋力が衰える (STR -1)！', 'danger');
      }
      break;
    }
    case 'FREEZE': {
      player.confusedTurns += 2;
      addLog(state, 'アイスモンスターの冷気で体が凍りついた！', 'danger');
      break;
    }
    case 'CONFUSE': {
      player.confusedTurns += 4;
      addLog(state, 'メデューサの妖しい瞳を見て混乱してしまった！', 'danger');
      break;
    }
    case 'STEAL_GOLD': {
      if (player.gold > 0) {
        const stolen = Math.min(player.gold, Math.floor(Math.random() * 50) + 20);
        player.gold -= stolen;
        addLog(state, `レプラコーンに金貨 ${stolen} 枚を盗まれた！`, 'danger');
        // テレポートして逃走
        const safe = findSpawnPosition(state.currentFloor);
        monster.x = safe.x;
        monster.y = safe.y;
      }
      break;
    }
    case 'DRAIN_HP': {
      player.maxHp = Math.max(5, player.maxHp - 1);
      addLog(state, 'ヴァンパイアに生気を吸い取られた！ 最大HPが永続的に減少した！', 'danger');
      break;
    }
    case 'DRAIN_EXP': {
      if (player.level > 1) {
        player.level -= 1;
        addLog(state, 'レイスに魂の経験を奪われた！ レベルが低下した！', 'danger');
      }
      break;
    }
  }
}

// 死亡処理
function handlePlayerDeath(state: GameState, reason: string) {
  state.gameOverReason = reason;
  state.screenMode = 'GAME_OVER';
  sound.play('gameOver');
  addLog(state, `【無念】${reason}。冒険はここで幕を閉じた...`, 'danger');
  saveHighScore(state, reason);
}

// ハイスコア保存
export function saveHighScore(state: GameState, cause: string) {
  try {
    const raw = localStorage.getItem('rogue_win_highscores');
    const scores = raw ? JSON.parse(raw) : [];
    const newRecord = {
      name: state.player.name,
      score: state.player.gold + state.player.exp * 2 + state.player.dungeonLevel * 100,
      gold: state.player.gold,
      level: state.player.level,
      dungeonLevel: state.player.dungeonLevel,
      date: new Date().toLocaleDateString('ja-JP'),
      causeOfDeath: cause,
      hasAmulet: state.player.hasAmulet
    };
    scores.push(newRecord);
    scores.sort((a: { score: number }, b: { score: number }) => b.score - a.score);
    localStorage.setItem('rogue_win_highscores', JSON.stringify(scores.slice(0, 10)));
  } catch {
    // local storage error ignore
  }
}

export function getHighScores() {
  try {
    const raw = localStorage.getItem('rogue_win_highscores');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
