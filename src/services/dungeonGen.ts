/**
 * 元祖 ローグ ダンジョン生成アルゴリズム (3x3グリッド分割クラシック方式)
 */

import { DungeonLevel, Item, MonsterInstance, Position, Room, TileType } from '../types/rogue';
import { MONSTER_DEFS } from './monsterData';
import { createAmuletOfYendor, generateRandomItem } from './itemsData';

const DUNGEON_WIDTH = 76;
const DUNGEON_HEIGHT = 22;

export function generateDungeonLevel(dungeonLevel: number, hasAmulet: boolean = false): DungeonLevel {
  // 1. マップ配列初期化
  const tiles: TileType[][] = Array.from({ length: DUNGEON_HEIGHT }, () =>
    Array.from({ length: DUNGEON_WIDTH }, () => 'EMPTY')
  );
  const discovered: boolean[][] = Array.from({ length: DUNGEON_HEIGHT }, () =>
    Array.from({ length: DUNGEON_WIDTH }, () => false)
  );
  const visible: boolean[][] = Array.from({ length: DUNGEON_HEIGHT }, () =>
    Array.from({ length: DUNGEON_WIDTH }, () => false)
  );

  // 2. 3x3 グリッド区画の計算
  const cellWidth = Math.floor(DUNGEON_WIDTH / 3);
  const cellHeight = Math.floor(DUNGEON_HEIGHT / 3);

  const rooms: Room[] = [];
  const roomCenters: Position[] = [];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const roomId = row * 3 + col;
      // たまに部屋のない「通路のみ」の区画を作る（元祖ローグの不完全部屋仕様）
      const isGone = Math.random() < 0.12 && roomId !== 4; // 中央は必ず残す

      const minW = 6;
      const maxW = cellWidth - 4;
      const minH = 4;
      const maxH = cellHeight - 3;

      const w = isGone ? 2 : Math.floor(Math.random() * (maxW - minW + 1)) + minW;
      const h = isGone ? 2 : Math.floor(Math.random() * (maxH - minH + 1)) + minH;

      const startX = col * cellWidth + Math.floor(Math.random() * (cellWidth - w - 2)) + 1;
      const startY = row * cellHeight + Math.floor(Math.random() * (cellHeight - h - 2)) + 1;

      const room: Room = {
        id: roomId,
        x: startX,
        y: startY,
        w: w,
        h: h,
        isDark: dungeonLevel > 2 && Math.random() < 0.2,
        connected: []
      };

      rooms.push(room);
      roomCenters.push({
        x: Math.floor(startX + w / 2),
        y: Math.floor(startY + h / 2)
      });

      if (!isGone) {
        // 部屋の床と壁を描画
        for (let y = startY; y < startY + h; y++) {
          for (let x = startX; x < startX + w; x++) {
            if (y === startY || y === startY + h - 1 || x === startX || x === startX + w - 1) {
              tiles[y][x] = 'WALL';
            } else {
              tiles[y][x] = 'FLOOR';
            }
          }
        }
      }
    }
  }

  // 3. 通路の接続 (MST風隣接接続: 9部屋を確実に連結)
  const connections: [number, number][] = [
    [0, 1], [1, 2],
    [3, 4], [4, 5],
    [6, 7], [7, 8],
    [0, 3], [3, 6],
    [1, 4], [4, 7],
    [2, 5], [5, 8]
  ];

  // ランダムにいくつか選んで網状に通路を掘る
  const selectedEdges = connections.sort(() => Math.random() - 0.5).slice(0, 8);

  // 必ず全連結になるよう最低限のスパニングツリーを保証
  const guaranteedEdges: [number, number][] = [
    [0, 1], [1, 2], [2, 5], [5, 4], [4, 3], [3, 6], [6, 7], [7, 8]
  ];
  const allEdges = Array.from(new Set([...guaranteedEdges.map(e => `${e[0]}-${e[1]}`), ...selectedEdges.map(e => `${e[0]}-${e[1]}`)]))
    .map(str => str.split('-').map(Number) as [number, number]);

  allEdges.forEach(([from, to]) => {
    rooms[from].connected.push(to);
    rooms[to].connected.push(from);

    const c1 = roomCenters[from];
    const c2 = roomCenters[to];

    let currX = c1.x;
    let currY = c1.y;

    // 水平に通路を掘る
    while (currX !== c2.x) {
      if (tiles[currY][currX] === 'EMPTY') {
        tiles[currY][currX] = 'CORRIDOR';
      } else if (tiles[currY][currX] === 'WALL') {
        tiles[currY][currX] = 'DOOR_CLOSED';
      }
      currX += (c2.x > currX ? 1 : -1);
    }

    // 垂直に通路を掘る
    while (currY !== c2.y) {
      if (tiles[currY][currX] === 'EMPTY') {
        tiles[currY][currX] = 'CORRIDOR';
      } else if (tiles[currY][currX] === 'WALL') {
        tiles[currY][currX] = 'DOOR_CLOSED';
      }
      currY += (c2.y > currY ? 1 : -1);
    }
  });

  // 4. 階段の配置
  const availableFloorTiles: Position[] = [];
  for (let y = 1; y < DUNGEON_HEIGHT - 1; y++) {
    for (let x = 1; x < DUNGEON_WIDTH - 1; x++) {
      if (tiles[y][x] === 'FLOOR') {
        availableFloorTiles.push({ x, y });
      }
    }
  }

  // シャッフル
  const shuffledFloors = [...availableFloorTiles].sort(() => Math.random() - 0.5);

  let stairsDownPos: Position = { x: 5, y: 5 };
  if (shuffledFloors.length > 0) {
    stairsDownPos = shuffledFloors.pop()!;
    // 26階以上かつ魔除け入手前の場合は階段が最深部を示す
    tiles[stairsDownPos.y][stairsDownPos.x] = 'STAIRS_DOWN';
  }

  let stairsUpPos: Position | undefined;
  if (dungeonLevel > 1) {
    if (shuffledFloors.length > 0) {
      stairsUpPos = shuffledFloors.pop()!;
      tiles[stairsUpPos.y][stairsUpPos.x] = 'STAIRS_UP';
    }
  }

  // 5. 罠の配置 (地下3階以降、ランダムに1〜3個)
  if (dungeonLevel >= 3) {
    const trapCount = Math.floor(Math.random() * 3) + 1;
    const trapTypes: TileType[] = ['TRAP_TRAPDOOR', 'TRAP_ARROW', 'TRAP_TELEPORT', 'TRAP_SLEEP', 'TRAP_RUST'];
    for (let i = 0; i < trapCount && shuffledFloors.length > 0; i++) {
      const pos = shuffledFloors.pop()!;
      const selectedTrap = trapTypes[Math.floor(Math.random() * trapTypes.length)];
      tiles[pos.y][pos.x] = selectedTrap;
    }
  }

  // 6. アイテムの配置 (各フロア3〜7個)
  const items: Item[] = [];

  // 地下26階で魔除け未所持なら、必ず「イエンダーの魔除け」をフロア中央付近の部屋に配置！
  if (dungeonLevel >= 26 && !hasAmulet && shuffledFloors.length > 0) {
    const amulet = createAmuletOfYendor();
    const pos = shuffledFloors.pop()!;
    amulet.x = pos.x;
    amulet.y = pos.y;
    items.push(amulet);
  }

  const itemCount = Math.floor(Math.random() * 4) + 3;
  for (let i = 0; i < itemCount && shuffledFloors.length > 0; i++) {
    const pos = shuffledFloors.pop()!;
    // 30%の確率でゴールド
    if (Math.random() < 0.35) {
      const goldAmt = Math.floor(Math.random() * 40 * dungeonLevel) + 10;
      items.push({
        id: 'gold_' + Math.random().toString(36).substring(2, 9),
        type: 'GOLD',
        name: `${goldAmt} 枚のゴールド`,
        unidentifiedName: 'きらめく金貨',
        identified: true,
        char: '*',
        color: '#facc15',
        value: goldAmt,
        description: 'ダンジョンに散らばる黄金。スコアとなる。',
        x: pos.x,
        y: pos.y
      });
    } else {
      const it = generateRandomItem(dungeonLevel);
      it.x = pos.x;
      it.y = pos.y;
      items.push(it);
    }
  }

  // 7. モンスターの配置 (各フロア4〜8体)
  const monsters: MonsterInstance[] = [];
  const candidateMonsterChars = Object.keys(MONSTER_DEFS).filter(char => {
    const def = MONSTER_DEFS[char];
    return dungeonLevel >= def.minLevel && dungeonLevel <= def.maxLevel + 2;
  });

  const finalChars = candidateMonsterChars.length > 0 ? candidateMonsterChars : ['K', 'B', 'S'];
  const monsterCount = Math.min(8, Math.floor(Math.random() * 4) + 3 + Math.floor(dungeonLevel / 3));

  for (let i = 0; i < monsterCount && shuffledFloors.length > 0; i++) {
    const pos = shuffledFloors.pop()!;
    const char = finalChars[Math.floor(Math.random() * finalChars.length)];
    const def = MONSTER_DEFS[char] || MONSTER_DEFS['K'];

    monsters.push({
      id: 'mon_' + char + '_' + Math.random().toString(36).substring(2, 9),
      def: def,
      x: pos.x,
      y: pos.y,
      hp: def.hp,
      maxHp: def.hp,
      sleeping: Math.random() < 0.65, // 65%のモンスターは最初は眠っている
      confusedTurns: 0,
      frozenTurns: 0,
      heldTurns: 0
    });
  }

  return {
    level: dungeonLevel,
    width: DUNGEON_WIDTH,
    height: DUNGEON_HEIGHT,
    tiles,
    discovered,
    visible,
    rooms,
    monsters,
    items,
    stairsDownPos,
    stairsUpPos
  };
}

export function findSpawnPosition(dungeon: DungeonLevel): Position {
  // 部屋の床でモンスターや階段と重ならない場所
  for (const room of dungeon.rooms) {
    if (room.w > 2 && room.h > 2) {
      for (let y = room.y + 1; y < room.y + room.h - 1; y++) {
        for (let x = room.x + 1; x < room.x + room.w - 1; x++) {
          if (
            dungeon.tiles[y][x] === 'FLOOR' &&
            !dungeon.monsters.some(m => m.x === x && m.y === y) &&
            !(dungeon.stairsDownPos.x === x && dungeon.stairsDownPos.y === y)
          ) {
            return { x, y };
          }
        }
      }
    }
  }
  return { x: 10, y: 10 };
}
