/**
 * Web Audio API によるレトロPC/PC-98/DOS風シンセサイザー効果音
 * 超低遅延・高レスポンス設計
 */

class SoundService {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public volume: number = 0.5;
  private isUnlocked: boolean = false;
  private resumePromise: Promise<void> | null = null;

  public unlock() {
    if (this.isUnlocked && this.ctx && this.ctx.state === 'running') return;
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        if (!this.resumePromise) {
          const pending = this.ctx.resume().then(() => undefined).catch(() => undefined);
          this.resumePromise = pending;
          void pending.then(() => {
            if (this.resumePromise === pending) this.resumePromise = null;
          });
        }
      }
      this.isUnlocked = true;
    } catch {
      // ignore
    }
  }

  public play(type: 'step' | 'door' | 'hit' | 'miss' | 'bump' | 'monsterHit' | 'monsterDie' | 'pickup' | 'drop' | 'potion' | 'scroll' | 'wand' | 'stairs' | 'levelUp' | 'trap' | 'error' | 'gameOver' | 'victory') {
    if (!this.enabled || this.volume <= 0) return;
    try {
      // 入力イベントの中で同期的に AudioContext を起動し、ブラウザーの自動再生制限を避ける。
      this.unlock();
      if (!this.ctx) return;
      if (this.ctx.state !== 'running') {
        const context = this.ctx;
        const pending = this.resumePromise ?? context.resume().then(() => undefined).catch(() => undefined);
        this.resumePromise = pending;
        void pending.then(() => {
          if (this.resumePromise === pending) this.resumePromise = null;
          if (context.state === 'running') this.play(type);
        });
        return;
      }

      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume * 0.65, now);
      masterGain.connect(this.ctx.destination);

      switch (type) {
        case 'step': {
          // カサッという小気味よい足音
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.04);
          break;
        }

        case 'door': {
          // 木の扉がきしみながら開く音と、最後の小さな掛け金の音。
          const creak = this.ctx.createOscillator();
          const creakGain = this.ctx.createGain();
          creak.type = 'triangle';
          creak.frequency.setValueAtTime(330, now);
          creak.frequency.exponentialRampToValueAtTime(145, now + 0.24);
          creakGain.gain.setValueAtTime(0.001, now);
          creakGain.gain.linearRampToValueAtTime(0.34, now + 0.035);
          creakGain.gain.exponentialRampToValueAtTime(0.001, now + 0.27);
          creak.connect(creakGain);
          creakGain.connect(masterGain);
          creak.start(now);
          creak.stop(now + 0.28);

          const latch = this.ctx.createOscillator();
          const latchGain = this.ctx.createGain();
          latch.type = 'square';
          latch.frequency.setValueAtTime(115, now + 0.22);
          latchGain.gain.setValueAtTime(0.001, now);
          latchGain.gain.setValueAtTime(0.22, now + 0.22);
          latchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.31);
          latch.connect(latchGain);
          latchGain.connect(masterGain);
          latch.start(now + 0.22);
          latch.stop(now + 0.32);
          break;
        }

        case 'bump': {
          // 壁にぶつかった音 (鈍い低音)
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(90, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }

        case 'hit': {
          // 剣撃・打撃音
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(500, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
          gain.gain.setValueAtTime(0.45, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        }

        case 'miss': {
          // 空振り
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(350, now);
          osc.frequency.exponentialRampToValueAtTime(190, now + 0.08);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }

        case 'monsterHit': {
          // プレイヤー被弾
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(240, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
          gain.gain.setValueAtTime(0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        case 'monsterDie': {
          // 撃破
          [380, 300, 220, 140].forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const t = now + idx * 0.035;
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(t);
            osc.stop(t + 0.05);
          });
          break;
        }

        case 'pickup': {
          // アイテム拾得
          [523.25, 659.25, 783.99].forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const t = now + idx * 0.04;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(t);
            osc.stop(t + 0.07);
          });
          break;
        }

        case 'drop': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(260, now);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.07);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.07);
          break;
        }

        case 'potion': {
          [320, 440, 380, 520].forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const t = now + idx * 0.05;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(t);
            osc.stop(t + 0.07);
          });
          break;
        }

        case 'scroll': {
          [440, 554.37, 659.25, 880].forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const t = now + idx * 0.06;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(t);
            osc.stop(t + 0.2);
          });
          break;
        }

        case 'wand': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.linearRampToValueAtTime(300, now + 0.12);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.12);
          break;
        }

        case 'stairs': {
          [220, 300, 400, 520].forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const t = now + idx * 0.05;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(t);
            osc.stop(t + 0.09);
          });
          break;
        }

        case 'levelUp': {
          const notes = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.5];
          const times = [0, 0.09, 0.18, 0.28, 0.38, 0.52];
          const durations = [0.07, 0.07, 0.07, 0.09, 0.12, 0.3];
          notes.forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const t = now + times[idx];
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.35, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + durations[idx]);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(t);
            osc.stop(t + durations[idx]);
          });
          break;
        }

        case 'trap': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
          gain.gain.setValueAtTime(0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        case 'error': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(110, now);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }

        case 'gameOver': {
          const notes = [392, 349.23, 329.63, 261.63];
          notes.forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const t = now + idx * 0.22;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(t);
            osc.stop(t + 0.3);
          });
          break;
        }

        case 'victory': {
          const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
          const times = [0, 0.12, 0.24, 0.38, 0.54, 0.72];
          notes.forEach((freq, idx) => {
            const osc = this.ctx!.createOscillator();
            const gain = this.ctx!.createGain();
            const t = now + times[idx];
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            osc.connect(gain);
            gain.connect(masterGain);
            osc.start(t);
            osc.stop(t + 0.25);
          });
          break;
        }
      }
      // 発音終了後に GainNode を切断し、長時間プレイでノードが残らないようにする。
      window.setTimeout(() => masterGain.disconnect(), 1200);
    } catch {
      // safe
    }
  }
}

export const sound = new SoundService();
