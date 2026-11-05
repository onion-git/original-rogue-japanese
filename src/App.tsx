/**
 * 元祖 ローグ 日本語版 (Windows Edition)
 * メインアプリケーションコンポーネント
 * (高レスポンス・物理キーコード直結・入力モニター完備)
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  createInitialGame, GameState, playerMoveOrAttack, playerSearch, playerWait, 
  pickupItem, descendStairs, ascendStairs, useItem, dropItem, getInventory, 
  setInventory, addLog
} from './services/gameEngine';
import { sound } from './services/sound';
import { useGamepad } from './hooks/useGamepad';
import { WindowsTitleBar } from './components/WindowsTitleBar';
import { WindowsMenuBar } from './components/WindowsMenuBar';
import { WindowsToolbar } from './components/WindowsToolbar';
import { DungeonCanvas } from './components/DungeonCanvas';
import { StatusPanel } from './components/StatusPanel';
import { MessageLog } from './components/MessageLog';
import { InventoryModal } from './components/InventoryModal';
import { HelpModal } from './components/HelpModal';
import { SaveLoadModal } from './components/SaveLoadModal';
import { GameOverModal } from './components/GameOverModal';
import { InspectModal } from './components/InspectModal';
import { TitleScreen } from './components/TitleScreen';
import { DisplayStyle, Item, Position } from './types/rogue';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialGame());
  const [inventory, setLocalInventory] = useState<Item[]>(() => getInventory());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1.1);

  // リアルタイム入力フィードバック
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [activeDirection, setActiveDirection] = useState<string | null>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  // モーダル開閉ステート
  const [showInventory, setShowInventory] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [inspectTarget, setInspectTarget] = useState<{ x: number; y: number; text: string } | null>(null);
  const [isTitleScreen, setIsTitleScreen] = useState(true);
  const [playerName, setPlayerName] = useState(() => {
    try { return localStorage.getItem('rogue_player_name') || 'ローグ'; } catch { return 'ローグ'; }
  });
  const playerNameRef = useRef(playerName);
  playerNameRef.current = playerName;

  // 最新のゲームステートとモーダル状態を常時参照できるRef
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const modalsRef = useRef({
    showInventory,
    showHelp,
    showSaveLoad,
    inspectTarget,
    isTitleScreen
  });
  modalsRef.current = {
    showInventory,
    showHelp,
    showSaveLoad,
    inspectTarget,
    isTitleScreen
  };

  // 入力フィードバックを光らせるヘルパー
  const triggerFeedback = useCallback((actionText: string, dirKey: string | null = null) => {
    setLastAction(actionText);
    setActiveDirection(dirKey);
    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = window.setTimeout(() => {
      setLastAction(null);
      setActiveDirection(null);
    }, 180);
  }, []);

  // 画面更新トリガー
  const syncState = useCallback(() => {
    setGameState({ ...stateRef.current });
    setLocalInventory([...getInventory()]);
  }, []);

  // 新規ゲーム
  const handleStartGame = useCallback(() => {
    const cleanName = (playerNameRef.current.trim() || 'ローグ').slice(0, 12);
    playerNameRef.current = cleanName;
    setPlayerName(cleanName);
    try { localStorage.setItem('rogue_player_name', cleanName); } catch { /* storage may be unavailable */ }
    const fresh = createInitialGame();
    fresh.player.name = cleanName;
    stateRef.current = fresh;
    setGameState(fresh);
    setLocalInventory([...getInventory()]);
    setShowInventory(false);
    setShowHelp(false);
    setShowSaveLoad(false);
    setInspectTarget(null);
    setIsTitleScreen(false);
    sound.unlock();
    triggerFeedback('新規冒険開始');
  }, [triggerFeedback]);

  const handleNewGame = useCallback(() => {
    const fresh = createInitialGame();
    fresh.player.name = playerNameRef.current.trim().slice(0, 12) || 'ローグ';
    stateRef.current = fresh;
    setGameState(fresh);
    setLocalInventory([...getInventory()]);
    setShowInventory(false);
    setShowHelp(false);
    setShowSaveLoad(false);
    setInspectTarget(null);
    setIsTitleScreen(true);
  }, []);

  const moveTitleFocus = useCallback((dx: number, dy: number) => {
    const panel = document.querySelector<HTMLElement>('[data-title-screen]');
    if (!panel) return;
    const controls = Array.from(panel.querySelectorAll<HTMLElement>('input:not([disabled]), button:not([disabled])'));
    if (!controls.length) return;
    const current = controls.indexOf(document.activeElement as HTMLElement);
    const delta = dy !== 0 ? dy : dx;
    const next = current < 0 ? 0 : (current + delta + controls.length) % controls.length;
    controls[next]?.focus();
  }, []);

  const confirmTitleFocus = useCallback(() => {
    const panel = document.querySelector<HTMLElement>('[data-title-screen]');
    const focused = document.activeElement as HTMLElement | null;
    if (!panel || !focused || !panel.contains(focused)) { handleStartGame(); return; }
    if (focused instanceof HTMLInputElement) { handleStartGame(); return; }
    focused.click();
  }, [handleStartGame]);
  // クイックセーブ (LocalStorage)
  const handleQuickSave = useCallback(() => {
    try {
      const saveData = {
        gameState: stateRef.current,
        inventory: getInventory(),
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('rogue_win_quicksave', JSON.stringify(saveData));
      addLog(stateRef.current, '【システム】クイックセーブを完了しました。(F5)', 'system');
      triggerFeedback('クイックセーブ (F5)');
      syncState();
    } catch {
      addLog(stateRef.current, '【警告】セーブに失敗しました。', 'danger');
      syncState();
    }
  }, [syncState, triggerFeedback]);

  // クイックロード (LocalStorage)
  const handleQuickLoad = useCallback(() => {
    try {
      const raw = localStorage.getItem('rogue_win_quicksave');
      if (!raw) {
        addLog(stateRef.current, '【情報】セーブデータが存在しません。', 'info');
        sound.play('error');
        syncState();
        return;
      }
      const data = JSON.parse(raw);
      setInventory(data.inventory);
      stateRef.current = data.gameState;
      setGameState(data.gameState);
      setLocalInventory([...data.inventory]);
      sound.play('stairs');
      addLog(data.gameState, '【システム】セーブデータを復元しました。(F9)', 'system');
      triggerFeedback('クイックロード (F9)');
    } catch {
      addLog(stateRef.current, '【警告】セーブデータの読み込みに失敗しました。', 'danger');
      syncState();
    }
  }, [syncState, triggerFeedback]);

  // JSONエクスポート (ファイルダウンロード)
  const handleExportJson = useCallback(() => {
    const saveData = {
      gameState: stateRef.current,
      inventory: getInventory(),
      version: '1.0.0-windows',
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(saveData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rogue_save_b${stateRef.current.player.dungeonLevel}f_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerFeedback('JSON書き出し');
  }, [triggerFeedback]);

  // JSONインポート
  const handleImportJson = useCallback((jsonStr: string) => {
    const parsed = JSON.parse(jsonStr);
    if (!parsed.gameState || !parsed.inventory) {
      throw new Error('Invalid format');
    }
    setInventory(parsed.inventory);
    stateRef.current = parsed.gameState;
    setGameState(parsed.gameState);
    setLocalInventory([...parsed.inventory]);
    sound.play('stairs');
    addLog(parsed.gameState, '【システム】外部ファイルから冒険を復元しました。', 'system');
    setShowSaveLoad(false);
    triggerFeedback('JSON復元完了');
  }, [triggerFeedback]);

  // 移動・アクション実行コア関数 (最新stateRefを操作し即時同期)
  const handleMove = useCallback((dx: number, dy: number, actionName?: string, dirKey?: string) => {
    sound.unlock();
    const st = stateRef.current;
    if (st.screenMode === 'GAME_OVER' || st.screenMode === 'VICTORY') return;
    const m = modalsRef.current;
    if (m.isTitleScreen || m.showInventory || m.showHelp || m.showSaveLoad || m.inspectTarget) return;

    let dirLabel = actionName;
    let dKey = dirKey;
    if (!dKey) {
      if (dy === -1 && dx === 0) { dirLabel = dirLabel || '上 (W/↑)'; dKey = 'N'; }
      else if (dy === 1 && dx === 0) { dirLabel = dirLabel || '下 (S/↓)'; dKey = 'S'; }
      else if (dy === 0 && dx === -1) { dirLabel = dirLabel || '左 (A/←)'; dKey = 'W'; }
      else if (dy === 0 && dx === 1) { dirLabel = dirLabel || '右 (D/→)'; dKey = 'E'; }
      else if (dy === -1 && dx === -1) { dirLabel = dirLabel || '左上 (Q/7)'; dKey = 'NW'; }
      else if (dy === -1 && dx === 1) { dirLabel = dirLabel || '右上 (E/9)'; dKey = 'NE'; }
      else if (dy === 1 && dx === -1) { dirLabel = dirLabel || '左下 (Z/1)'; dKey = 'SW'; }
      else if (dy === 1 && dx === 1) { dirLabel = dirLabel || '右下 (C/3)'; dKey = 'SE'; }
      else { dirLabel = dirLabel || '移動'; }
    }

    playerMoveOrAttack(st, dx, dy);

    // バッチ更新 (即座に反映)
    setLastAction(dirLabel || '移動');
    setActiveDirection(dKey || null);
    setGameState({ ...st });

    if (feedbackTimerRef.current) {
      window.clearTimeout(feedbackTimerRef.current);
    }
    feedbackTimerRef.current = window.setTimeout(() => {
      setLastAction(null);
      setActiveDirection(null);
    }, 180);
  }, []);

  const handleWait = useCallback(() => {
    sound.unlock();
    const st = stateRef.current;
    if (st.screenMode === 'GAME_OVER' || st.screenMode === 'VICTORY') return;
    const m = modalsRef.current;
    if (m.showInventory || m.showHelp || m.showSaveLoad) return;

    playerWait(st);
    setLastAction('その場で待機 (Space/5)');
    setActiveDirection('WAIT');
    setGameState({ ...st });

    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => {
      setLastAction(null);
      setActiveDirection(null);
    }, 180);
  }, []);

  const handleSearch = useCallback(() => {
    sound.unlock();
    const st = stateRef.current;
    if (st.screenMode === 'GAME_OVER' || st.screenMode === 'VICTORY') return;
    const m = modalsRef.current;
    if (m.showInventory || m.showHelp || m.showSaveLoad) return;

    playerSearch(st);
    setLastAction('周囲を探索 (F/X/s)');
    setGameState({ ...st });

    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => setLastAction(null), 180);
  }, []);

  const handlePickup = useCallback(() => {
    sound.unlock();
    const st = stateRef.current;
    if (st.screenMode === 'GAME_OVER' || st.screenMode === 'VICTORY') return;

    pickupItem(st);
    setLastAction('足元を拾う (G/, )');
    setGameState({ ...st });
    setLocalInventory([...getInventory()]);

    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => setLastAction(null), 180);
  }, []);

  const handleDescend = useCallback(() => {
    sound.unlock();
    const st = stateRef.current;
    if (st.screenMode === 'GAME_OVER' || st.screenMode === 'VICTORY') return;

    descendStairs(st);
    setLastAction('階段を降りる (>)');
    setGameState({ ...st });

    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => setLastAction(null), 180);
  }, []);

  const handleAscend = useCallback(() => {
    sound.unlock();
    const st = stateRef.current;
    if (st.screenMode === 'GAME_OVER' || st.screenMode === 'VICTORY') return;

    ascendStairs(st);
    setLastAction('階段を上る (<)');
    setGameState({ ...st });

    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => setLastAction(null), 180);
  }, []);

  const handleUseItem = useCallback((item: Item) => {
    sound.unlock();
    const st = stateRef.current;
    triggerFeedback(`アイテム使用: ${item.identified ? item.name : item.unidentifiedName}`);
    useItem(st, item);
    syncState();
  }, [triggerFeedback, syncState]);

  const handleDropItem = useCallback((item: Item) => {
    sound.unlock();
    const st = stateRef.current;
    triggerFeedback(`足元に置く: ${item.identified ? item.name : item.unidentifiedName}`);
    dropItem(st, item);
    syncState();
  }, [triggerFeedback, syncState]);

  // クイック回復ポーション使用
  const handleQuickPotion = useCallback(() => {
    sound.unlock();
    const pot = getInventory().find(i => i.type === 'POTION');
    if (pot) {
      handleUseItem(pot);
    } else {
      const food = getInventory().find(i => i.type === 'FOOD');
      if (food) {
        handleUseItem(food);
      } else {
        addLog(stateRef.current, '使用できる薬や食料がありません。', 'info');
        sound.play('error');
        syncState();
      }
    }
  }, [handleUseItem, syncState]);

  // マウスクリック時の移動 & 攻撃処理 (BFS最短経路)
  const handleTileClick = useCallback((targetX: number, targetY: number) => {
    sound.unlock();
    const st = stateRef.current;
    if (st.screenMode === 'GAME_OVER' || st.screenMode === 'VICTORY') return;
    const m = modalsRef.current;
    if (m.showInventory || m.showHelp || m.showSaveLoad) return;

    const { player, currentFloor } = st;

    // 隣接マスの場合は直接移動/攻撃
    const dx = targetX - player.x;
    const dy = targetY - player.y;
    if (Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
      if (dx === 0 && dy === 0) {
        handleWait();
      } else {
        handleMove(dx, dy, 'マウスクリック移動');
      }
      return;
    }

    // 離れたマスの場合はBFSで次の一歩を計算
    const queue: Position[] = [{ x: player.x, y: player.y }];
    const visited = Array.from({ length: currentFloor.height }, () => Array(currentFloor.width).fill(false));
    const parent = new Map<string, Position>();

    visited[player.y][player.x] = true;
    let found = false;

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr.x === targetX && curr.y === targetY) {
        found = true;
        break;
      }

      const neighbors = [
        { x: curr.x, y: curr.y - 1 },
        { x: curr.x, y: curr.y + 1 },
        { x: curr.x - 1, y: curr.y },
        { x: curr.x + 1, y: curr.y },
        { x: curr.x - 1, y: curr.y - 1 },
        { x: curr.x + 1, y: curr.y - 1 },
        { x: curr.x - 1, y: curr.y + 1 },
        { x: curr.x + 1, y: curr.y + 1 }
      ];

      for (const n of neighbors) {
        if (n.x >= 0 && n.x < currentFloor.width && n.y >= 0 && n.y < currentFloor.height && !visited[n.y][n.x]) {
          const tile = currentFloor.tiles[n.y][n.x];
          const isWalkable = tile === 'FLOOR' || tile === 'CORRIDOR' || tile === 'DOOR_OPEN' || tile === 'DOOR_CLOSED' || tile.startsWith('STAIRS') || (n.x === targetX && n.y === targetY);
          if (isWalkable && currentFloor.discovered[n.y][n.x]) {
            visited[n.y][n.x] = true;
            parent.set(`${n.x},${n.y}`, curr);
            queue.push(n);
          }
        }
      }
    }

    if (found) {
      let curr = { x: targetX, y: targetY };
      while (true) {
        const p = parent.get(`${curr.x},${curr.y}`);
        if (!p) break;
        if (p.x === player.x && p.y === player.y) {
          handleMove(curr.x - player.x, curr.y - player.y, 'マウス移動');
          break;
        }
        curr = p;
      }
    } else {
      sound.play('error');
    }
  }, [handleMove, handleWait]);

  // 右クリック詳細調査 (Inspect)
  const handleTileRightClick = useCallback((x: number, y: number) => {
    sound.unlock();
    const st = stateRef.current;
    const { currentFloor } = st;
    if (!currentFloor.discovered[y][x]) {
      setInspectTarget({ x, y, text: '未知の暗闇です。まだ足を踏み入れていません。' });
      return;
    }

    let text = '';
    const monster = currentFloor.monsters.find(m => m.x === x && m.y === y && currentFloor.visible[y][x]);
    const item = currentFloor.items.find(i => i.x === x && i.y === y && currentFloor.visible[y][x]);
    const tile = currentFloor.tiles[y][x];

    if (monster) {
      text = `【モンスター】${monster.def.japaneseName} (${monster.def.name}) [${monster.def.char}]\nHP: ${monster.hp}/${monster.maxHp} | AC: ${monster.def.ac} | EXP: ${monster.def.exp}\n解説: ${monster.def.description}`;
    } else if (item) {
      text = `【アイテム】${item.identified ? item.name : item.unidentifiedName} [${item.char}]\n種別: ${item.type} | 価値: ${item.value} Gold\n解説: ${item.description}`;
    } else {
      switch (tile) {
        case 'WALL': text = '【石壁】ダンジョンを支える頑強な岩盤の壁です。'; break;
        case 'FLOOR': text = '【床】部屋の床です。足元に注意して歩きましょう。'; break;
        case 'CORRIDOR': text = '【通路】部屋と部屋を繋ぐ狭い通路です。1対1の戦闘に有利です。'; break;
        case 'DOOR_CLOSED': text = '【閉じた扉】部屋の出入り口です。体当たりすれば開きます。'; break;
        case 'DOOR_OPEN': text = '【開いた扉】開け放たれた木の扉です。'; break;
        case 'STAIRS_DOWN': text = '【下り階段】さらに地下深くへと続く階段です。[>]キーで降ります。'; break;
        case 'STAIRS_UP': text = '【上り階段】上層へと続く階段です。魔除け入手後に[<]キーで登ります。'; break;
        case 'TRAP_TRAPDOOR': text = '【落とし穴の罠】踏むと下の階層へと落下してしまいます。'; break;
        case 'TRAP_ARROW': text = '【毒矢の罠】毒矢が発射されダメージを受けます。'; break;
        case 'TRAP_TELEPORT': text = '【テレポートの罠】フロアの別の場所へランダム転送されます。'; break;
        case 'TRAP_SLEEP': text = '【睡眠ガスの罠】数ターン眠気に襲われます。'; break;
        case 'TRAP_RUST': text = '【サビの罠】酸の蒸気により鎧が錆びついて脆くなります。'; break;
        default: text = '何もない空間です。'; break;
      }
    }
    setInspectTarget({ x, y, text });
  }, []);

  // 【最重要】超高速・物理コード直接判定キーボードリスナー (依存配列なしで1度だけ登録)
  useEffect(() => {
    // 画面ロード時に自動フォーカス
    window.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      sound.unlock();
      const m = modalsRef.current;

      if (m.isTitleScreen) {
        if (e.key === 'Enter') { e.preventDefault(); handleStartGame(); }
        return;
      }

      // 1. モーダル表示中の Escape 処理
      if (e.code === 'Escape' || e.key === 'Escape') {
        if (m.inspectTarget) { setInspectTarget(null); return; }
        if (m.showInventory) { setShowInventory(false); return; }
        if (m.showHelp) { setShowHelp(false); return; }
        if (m.showSaveLoad) { setShowSaveLoad(false); return; }
      }

      // モーダルが開いている時はゲームプレイキーを抑制
      if (m.isTitleScreen || m.showInventory || m.showHelp || m.showSaveLoad || m.inspectTarget) return;

      // 2. ファンクションキー (F1, F5, F9)
      if (e.code === 'F5') { e.preventDefault(); handleQuickSave(); return; }
      if (e.code === 'F9') { e.preventDefault(); handleQuickLoad(); return; }
      if (e.code === 'F1' || e.key === '?' || (e.code === 'Slash' && e.shiftKey)) { 
        e.preventDefault(); 
        setShowHelp(true); 
        return; 
      }

      // 3. 物理コード `e.code` を最優先判定 (IMEのON/OFF問わず確実に即時反応！)
      const code = e.code;
      const key = e.key;

      // 【上】(W / 8 / K / ArrowUp)
      if (code === 'KeyW' || code === 'Numpad8' || code === 'ArrowUp' || code === 'KeyK' || key === '8' || key === 'k') {
        e.preventDefault();
        handleMove(0, -1, '上移動 (W/↑/8)', 'N');
        return;
      }

      // 【下】(S / 2 / J / ArrowDown)
      if (code === 'KeyS' || code === 'Numpad2' || code === 'ArrowDown' || code === 'KeyJ' || key === '2' || key === 'j') {
        e.preventDefault();
        handleMove(0, 1, '下移動 (S/↓/2)', 'S');
        return;
      }

      // 【左】(A / 4 / H / ArrowLeft)
      if (code === 'KeyA' || code === 'Numpad4' || code === 'ArrowLeft' || code === 'KeyH' || key === '4' || key === 'h') {
        e.preventDefault();
        handleMove(-1, 0, '左移動 (A/←/4)', 'W');
        return;
      }

      // 【右】(D / 6 / L / ArrowRight)
      if (code === 'KeyD' || code === 'Numpad6' || code === 'ArrowRight' || code === 'KeyL' || key === '6' || key === 'l') {
        e.preventDefault();
        handleMove(1, 0, '右移動 (D/→/6)', 'E');
        return;
      }

      // 【左上】(Q / 7 / Y / Home)
      if (code === 'KeyQ' || code === 'Numpad7' || code === 'KeyY' || code === 'Home' || key === '7' || key === 'y') {
        e.preventDefault();
        handleMove(-1, -1, '左上 (Q/7/y)', 'NW');
        return;
      }

      // 【右上】(E / 9 / U / PageUp)
      if (code === 'KeyE' || code === 'Numpad9' || code === 'KeyU' || code === 'PageUp' || key === '9' || key === 'u') {
        e.preventDefault();
        handleMove(1, -1, '右上 (E/9/u)', 'NE');
        return;
      }

      // 【左下】(Z / 1 / B / End)
      if (code === 'KeyZ' || code === 'Numpad1' || code === 'KeyB' || code === 'End' || key === '1' || key === 'b') {
        e.preventDefault();
        handleMove(-1, 1, '左下 (Z/1/b)', 'SW');
        return;
      }

      // 【右下】(C / 3 / N / PageDown)
      if (code === 'KeyC' || code === 'Numpad3' || code === 'KeyN' || code === 'PageDown' || key === '3' || key === 'n') {
        e.preventDefault();
        handleMove(1, 1, '右下 (C/3/n)', 'SE');
        return;
      }

      // 【待機】(Space / Numpad5 / Period)
      if (code === 'Space' || code === 'Numpad5' || key === '5' || key === '.') {
        e.preventDefault();
        handleWait();
        return;
      }

      // 【探索】(F / X)
      if (code === 'KeyF' || code === 'KeyX') {
        e.preventDefault();
        handleSearch();
        return;
      }

      // 【持ち物】(I)
      if (code === 'KeyI' || key === 'i' || key === 'I') {
        e.preventDefault();
        setShowInventory(true);
        triggerFeedback('持ち物画面表示 (I)');
        return;
      }

      // 【足元を拾う】(G / Comma)
      if (code === 'KeyG' || (code === 'Comma' && !e.shiftKey) || key === 'g' || key === ',') {
        e.preventDefault();
        handlePickup();
        return;
      }

      // 【階段を降りる】(>)
      if ((code === 'Period' && e.shiftKey) || key === '>') {
        e.preventDefault();
        handleDescend();
        return;
      }

      // 【階段を上る】(<)
      if ((code === 'Comma' && e.shiftKey) || key === '<') {
        e.preventDefault();
        handleAscend();
        return;
      }

      // 【クイック薬/食料】(R)
      if (code === 'KeyR' || key === 'r' || key === 'R') {
        e.preventDefault();
        handleQuickPotion();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [
    handleMove, handleWait, handleSearch, handlePickup, handleDescend, 
    handleAscend, handleQuickPotion, handleQuickSave, handleQuickLoad, 
    handleStartGame, triggerFeedback
  ]);

  // ゲームパッド操作連携 (ポーリングは useGamepad 内部で常時高速稼働)
  const isAnyModalOpen = isTitleScreen || showInventory || showHelp || showSaveLoad || !!inspectTarget;
  const { connectedGamepadName, gamepadSupported, rescanGamepads } = useGamepad({
    onMove: (dx, dy) => handleMove(dx, dy, 'ゲームパッド移動'),
    onWait: handleWait,
    onSearch: handleSearch,
    onInventory: () => setShowInventory(prev => !prev),
    onSelect: handlePickup,
    onStairsDown: handleDescend,
    onStairsUp: handleAscend,
    onQuickPotion: handleQuickPotion,
    onMenu: () => setShowSaveLoad(prev => !prev),
    onHelp: () => setShowHelp(prev => !prev),
    onButtonFeedback: (label) => triggerFeedback(label),
    onTitleMove: moveTitleFocus,
    onTitleConfirm: confirmTitleFocus
  }, isAnyModalOpen, isTitleScreen);

  // フルスクリーン切り替え
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const currentTileAtPlayer = gameState.currentFloor.tiles[gameState.player.y][gameState.player.x];
  const canDescend = currentTileAtPlayer === 'STAIRS_DOWN';
  const canAscend = currentTileAtPlayer === 'STAIRS_UP';

  return (
    <div 
      onClick={() => { sound.unlock(); window.focus(); }}
      className={`w-screen h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none outline-none ${
        gameState.settings.crtEffect ? 'crt-overlay' : ''
      }`}
      tabIndex={0}
    >
      {isTitleScreen && <TitleScreen name={playerName} onNameChange={setPlayerName} onStart={handleStartGame} onOpenHelp={() => setShowHelp(true)} onOpenRecords={() => setShowSaveLoad(true)} onOpenOptions={() => setShowHelp(true)} />}
      {/* 1. Windows タイトルバー */}
      <WindowsTitleBar
        dungeonLevel={gameState.player.dungeonLevel}
        hasAmulet={gameState.player.hasAmulet}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onMinimize={() => {}}
        onClose={() => setShowSaveLoad(true)}
      />

      {/* 2. Windows メニューバー */}
      <WindowsMenuBar
        onNewGame={handleNewGame}
        onQuickSave={handleQuickSave}
        onQuickLoad={handleQuickLoad}
        onOpenSaveModal={() => setShowSaveLoad(true)}
        onOpenInventory={() => setShowInventory(true)}
        onOpenHelp={() => setShowHelp(true)}
        onOpenSettings={() => setShowHelp(true)}
        onSearch={handleSearch}
        onWait={handleWait}
        onDescend={handleDescend}
        onAscend={handleAscend}
        displayStyle={gameState.settings.displayStyle}
        onChangeDisplayStyle={(style: DisplayStyle) => {
          gameState.settings.displayStyle = style;
          syncState();
        }}
        crtEffect={gameState.settings.crtEffect}
        onToggleCrt={() => {
          gameState.settings.crtEffect = !gameState.settings.crtEffect;
          syncState();
        }}
        soundEnabled={gameState.settings.soundEnabled}
        onToggleSound={() => {
          const next = !gameState.settings.soundEnabled;
          gameState.settings.soundEnabled = next;
          sound.enabled = next;
          syncState();
        }}
        hasGamepad={!!connectedGamepadName}
        gamepadName={connectedGamepadName}
      />

      {/* 3. クイックツールバー */}
      <WindowsToolbar
        onSearch={handleSearch}
        onWait={handleWait}
        onPickup={handlePickup}
        onDescend={handleDescend}
        onAscend={handleAscend}
        onOpenInventory={() => setShowInventory(true)}
        onQuickSave={handleQuickSave}
        onQuickLoad={handleQuickLoad}
        onOpenHelp={() => setShowHelp(true)}
        soundEnabled={gameState.settings.soundEnabled}
        onToggleSound={() => {
          const next = !gameState.settings.soundEnabled;
          gameState.settings.soundEnabled = next;
          sound.enabled = next;
          syncState();
        }}
        zoom={zoom}
        onZoomIn={() => setZoom(prev => Math.min(1.6, +(prev + 0.1).toFixed(1)))}
        onZoomOut={() => setZoom(prev => Math.max(0.8, +(prev - 0.1).toFixed(1)))}
        canDescend={canDescend}
        canAscend={canAscend}
      />

      {/* 4. メッセージログ */}
      <MessageLog logs={gameState.log} />

      {/* 5. メインゲーム領域 (マップキャンバス + 右側ステータスパネル) */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* ダンジョンキャンバス */}
        <DungeonCanvas
          dungeon={gameState.currentFloor}
          player={gameState.player}
          displayStyle={gameState.settings.displayStyle}
          renderVersion={gameState}
          zoom={zoom}
          onTileClick={handleTileClick}
          onTileRightClick={handleTileRightClick}
          inspectTarget={inspectTarget}
        />

        {/* 右側ステータスパネル (リアルタイム入力HUD・オンスクリーンコントローラー内蔵) */}
        <StatusPanel
          player={gameState.player}
          inventory={inventory}
          onUseItem={handleUseItem}
          onOpenInventory={() => setShowInventory(true)}
          hasGamepad={!!connectedGamepadName}
          gamepadName={connectedGamepadName}
          gamepadSupported={gamepadSupported}
          onRescanGamepad={rescanGamepads}
          lastAction={lastAction}
          activeDirection={activeDirection}
          onMove={(dx, dy) => handleMove(dx, dy)}
          onWait={handleWait}
          onSearch={handleSearch}
          onPickup={handlePickup}
        />
      </div>

      {/* 6. モーダル群 */}
      {showInventory && (
        <InventoryModal
          inventory={inventory}
          onUseItem={handleUseItem}
          onDropItem={handleDropItem}
          onClose={() => setShowInventory(false)}
        />
      )}

      {showHelp && (
        <HelpModal onClose={() => setShowHelp(false)} />
      )}

      {showSaveLoad && (
        <SaveLoadModal
          onQuickSave={handleQuickSave}
          onQuickLoad={handleQuickLoad}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
          onClose={() => setShowSaveLoad(false)}
        />
      )}

      {inspectTarget && (
        <InspectModal
          target={inspectTarget}
          onClose={() => setInspectTarget(null)}
        />
      )}

      {(gameState.screenMode === 'GAME_OVER' || gameState.screenMode === 'VICTORY') && (
        <GameOverModal
          isWon={gameState.screenMode === 'VICTORY'}
          player={gameState.player}
          reason={gameState.gameOverReason}
          onRestart={handleNewGame}
          onOpenScores={() => {
            setShowSaveLoad(true);
          }}
        />
      )}
    </div>
  );
}
