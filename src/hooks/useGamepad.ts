/**
 * HTML5 Gamepad API によるコントローラー入力フック
 * W3C標準のrequestAnimationFrame完全同期による最速・超低遅延エンジン
 */

import { useEffect, useRef, useState } from 'react';

export interface GamepadActionHandlers {
  onMove: (dx: number, dy: number) => void;
  onWait: () => void;
  onSearch: () => void;
  onInventory: () => void;
  onSelect: () => void;
  onStairsDown: () => void;
  onStairsUp: () => void;
  onQuickPotion: () => void;
  onMenu: () => void;
  onHelp: () => void;
  onButtonFeedback?: (btnLabel: string) => void;
  onTitleMove?: (dx: number, dy: number) => void;
  onTitleConfirm?: () => void;
}

export function useGamepad(handlers: GamepadActionHandlers, isModalOpen: boolean, isTitleScreen = false) {
  const [connectedGamepadName, setConnectedGamepadName] = useState<string | null>(null);
  const gamepadSupported = typeof navigator !== 'undefined' && typeof navigator.getGamepads === 'function';
  const connectedGamepadNameRef = useRef<string | null>(null);

  const updateConnectedGamepad = (name: string | null) => {
    if (connectedGamepadNameRef.current === name) return;
    connectedGamepadNameRef.current = name;
    setConnectedGamepadName(name);
  };

  const scanGamepads = () => {
    if (!gamepadSupported) return null;
    try {
      const pads = navigator.getGamepads();
      let activePad: Gamepad | null = null;
      for (let i = 0; i < pads.length; i++) {
        const pad = pads[i];
        if (pad?.connected) {
          activePad = pad;
          break;
        }
      }
      updateConnectedGamepad(activePad?.id ?? null);
      return activePad;
    } catch {
      updateConnectedGamepad(null);
      return null;
    }
  };

  // 移動のキーリピート管理
  const lastDir = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const moveStartTime = useRef<number>(0);
  const lastRepeatTime = useRef<number>(0);

  // ボタン状態管理 (前回フレームの押下状態)
  const lastButtons = useRef<boolean[]>([]);

  const handlersRef = useRef(handlers);
  const isModalOpenRef = useRef(isModalOpen);
  const isTitleScreenRef = useRef(isTitleScreen);

  handlersRef.current = handlers;
  isModalOpenRef.current = isModalOpen;
  isTitleScreenRef.current = isTitleScreen;

  useEffect(() => {
    let animId: number;

    const handleConnect = (e: GamepadEvent) => {
      updateConnectedGamepad(e.gamepad.id);
    };

    const handleDisconnect = () => {
      updateConnectedGamepad(null);
    };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);

    // 初回接続チェック
    scanGamepads();

    // W3C Gamepad API 準拠: requestAnimationFrame ごとに最新スナップショットを処理
    const loop = (timestamp: number) => {
      const gp = scanGamepads();

      if (gp) {
        const btns = gp.buttons.map(b => (typeof b === 'object' ? b.pressed : b === 1.0));
        const axisX = gp.axes[0] ?? 0;
        const axisY = gp.axes[1] ?? 0;

        let moveDx = 0;
        let moveDy = 0;

        // 1. D-Pad (ボタン 12:上, 13:下, 14:左, 15:右)
        if (btns[12]) moveDy = -1;
        if (btns[13]) moveDy = 1;
        if (btns[14]) moveDx = -1;
        if (btns[15]) moveDx = 1;

        // 2. 左スティック (デッドゾーン 0.22)
        if (Math.abs(axisX) > 0.22) moveDx = axisX > 0 ? 1 : -1;
        if (Math.abs(axisY) > 0.22) moveDy = axisY > 0 ? 1 : -1;

        // 3. POV ハットスイッチ対応
        if (moveDx === 0 && moveDy === 0 && gp.axes.length > 4) {
          const pov = gp.axes[9];
          if (pov !== undefined && pov >= -1.0 && pov <= 1.0) {
            if (pov >= -1.05 && pov <= -0.95) moveDy = -1;
            else if (pov >= 0.10 && pov <= 0.20) moveDx = 1;
            else if (pov >= 0.35 && pov <= 0.45) moveDy = 1;
            else if (pov >= 0.65 && pov <= 0.75) moveDx = -1;
          }
        }

        // --- 移動の即時発火 & リピート処理 ---
        if (moveDx !== 0 || moveDy !== 0) {
          if (isTitleScreenRef.current) {
            const isNewDir = (moveDx !== lastDir.current.dx || moveDy !== lastDir.current.dy);
            if (isNewDir) {
              handlersRef.current.onTitleMove?.(moveDx, moveDy);
              lastDir.current = { dx: moveDx, dy: moveDy };
              moveStartTime.current = timestamp;
              lastRepeatTime.current = timestamp;
            } else if (timestamp - moveStartTime.current > 350 && timestamp - lastRepeatTime.current > 180) {
              handlersRef.current.onTitleMove?.(moveDx, moveDy);
              lastRepeatTime.current = timestamp;
            }
          } else if (!isModalOpenRef.current) {
            const isNewDir = (moveDx !== lastDir.current.dx || moveDy !== lastDir.current.dy);

            if (isNewDir) {
              // ★【ニュートラルから倒した瞬間】即座に 0ms で実行！
              handlersRef.current.onMove(moveDx, moveDy);
              lastDir.current = { dx: moveDx, dy: moveDy };
              moveStartTime.current = timestamp;
              lastRepeatTime.current = timestamp;
            } else {
              // ★【長押しオートリピート】
              // 初動ディレイ 150ms、以降 70ms 間隔でサクサク連続移動
              const duration = timestamp - moveStartTime.current;
              if (duration > 150 && (timestamp - lastRepeatTime.current > 70)) {
                handlersRef.current.onMove(moveDx, moveDy);
                lastRepeatTime.current = timestamp;
              }
            }
          }
        } else {
          // スティック・十字キーを離したら即ニュートラル
          lastDir.current = { dx: 0, dy: 0 };
        }

        // --- 単発ボタン判定 (押した瞬間に即座に実行) ---
        const justPressed = (idx: number) => btns[idx] && !lastButtons.current[idx];

        if (isTitleScreenRef.current) {
          if (justPressed(0) || justPressed(9)) handlersRef.current.onTitleConfirm?.();
        } else {
          if (justPressed(0)) handlersRef.current.onSelect();
          if (justPressed(1)) handlersRef.current.onWait();
          if (justPressed(2)) handlersRef.current.onSearch();
          if (justPressed(3)) handlersRef.current.onInventory();
          if (justPressed(4)) handlersRef.current.onQuickPotion();
          if (justPressed(5)) handlersRef.current.onStairsUp();
          if (justPressed(6) || justPressed(7)) handlersRef.current.onStairsDown();
          if (justPressed(8)) handlersRef.current.onHelp();
          if (justPressed(9)) handlersRef.current.onMenu();
        }
        lastButtons.current = btns;
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
      cancelAnimationFrame(animId);
    };
  }, []);

  return { connectedGamepadName, gamepadSupported, rescanGamepads: scanGamepads };
}
