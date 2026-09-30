// Tiny synthesized sound effects: no audio files to ship or license.
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import * as store from './storage.js';

let ctx = null;

function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, dur, { type = 'sine', gain = 0.15, slide = 0 } = {}) {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + start;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(freq * slide, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const SOUNDS = {
  pick: () => tone(520, 0, 0.08, { type: 'triangle', slide: 1.4 }),
  drop: () => tone(300, 0, 0.1, { type: 'triangle', slide: 0.7, gain: 0.18 }),
  error: () => tone(140, 0, 0.15, { type: 'square', gain: 0.06 }),
  tube: () => [660, 880, 1100].forEach((f, i) => tone(f, i * 0.06, 0.18, { gain: 0.1 })),
  win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.09, 0.3, { type: 'triangle', gain: 0.12 })),
  coin: () => [988, 1319].forEach((f, i) => tone(f, i * 0.07, 0.15, { type: 'square', gain: 0.05 })),
};

export function play(name) {
  if (!store.get('sound')) return;
  try {
    SOUNDS[name]?.();
  } catch {
    // Audio is decorative; never let it break gameplay.
  }
}

export function buzz(strong = false) {
  if (!store.get('vibration')) return;
  Haptics.impact({ style: strong ? ImpactStyle.Medium : ImpactStyle.Light }).catch(() => {});
}
