#!/usr/bin/env node
/**
 * Synthesises Prismase's sound effects into assets/sounds/*.wav (16-bit mono PCM).
 * Glassy, bell-like tones to match the crystal theme. Run with `pnpm sounds`; tweak the
 * recipes and re-run, never hand-edit the WAVs.
 */
const fs = require('fs');
const path = require('path');

const RATE = 22050;
const OUT = path.join(__dirname, '..', 'assets', 'sounds');

const note = (name) => {
  const semis = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
  return 440 * 2 ** ((semis[name[0]] + (Number(name.slice(-1)) - 4) * 12) / 12);
};

/** A struck glass: fundamental plus slightly inharmonic partials, each decaying at its own rate. */
const glass = (phase) =>
  Math.sin(phase) + 0.35 * Math.sin(2.76 * phase) + 0.18 * Math.sin(5.4 * phase);

const tone = ({ from, to = from, ms, gain = 0.4, decay = 5, wave = glass, noise = 0 }) => {
  const n = Math.round((RATE * ms) / 1000);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i += 1) {
    const t = i / n;
    phase += (2 * Math.PI * from * (to / from) ** t) / RATE;
    const env = Math.min(1, i / (RATE * 0.004)) * Math.exp(-decay * t);
    const hiss = noise ? (Math.random() * 2 - 1) * noise : 0;
    out[i] = ((wave(phase) / 1.5) * (1 - noise) + hiss) * env * gain;
  }
  return out;
};

const concat = (...parts) => {
  const out = new Float32Array(parts.reduce((s, p) => s + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
};
const mix = (...parts) => {
  const out = new Float32Array(Math.max(...parts.map((p) => p.length)));
  for (const p of parts) p.forEach((v, i) => (out[i] += v));
  return out;
};
const delay = (ms, part) => concat(new Float32Array(Math.round((RATE * ms) / 1000)), part);

const RECIPES = {
  select: () => tone({ from: note('E6'), ms: 90, gain: 0.3, decay: 7 }),
  move: () =>
    mix(
      tone({ from: note('A5'), ms: 140, gain: 0.35, decay: 6 }),
      delay(35, tone({ from: note('E6'), ms: 120, gain: 0.22, decay: 7 })),
    ),
  invalid: () =>
    mix(
      tone({ from: 220, to: 180, ms: 140, gain: 0.4, decay: 6, wave: Math.sin }),
      tone({ from: 233, to: 190, ms: 140, gain: 0.3, decay: 6, wave: Math.sin }),
    ),
  complete: () =>
    mix(
      tone({ from: note('C6'), ms: 420, gain: 0.3, decay: 4 }),
      delay(60, tone({ from: note('E6'), ms: 380, gain: 0.26, decay: 4 })),
      delay(120, tone({ from: note('G6'), ms: 460, gain: 0.26, decay: 3.5 })),
    ),
  win: () =>
    mix(
      ...['C5', 'G5', 'C6', 'E6', 'G6', 'C7'].map((n, i) =>
        delay(i * 85, tone({ from: note(n), ms: 900 - i * 60, gain: 0.24, decay: 3 })),
      ),
    ),
  coin: () =>
    concat(
      tone({ from: note('B6'), ms: 60, gain: 0.25, decay: 5 }),
      tone({ from: note('E7'), ms: 220, gain: 0.25, decay: 5 }),
    ),
};

const toWav = (samples) => {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((v, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 2));
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write('WAVE', 8);
  h.write('fmt ', 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(RATE, 24);
  h.writeUInt32LE(RATE * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write('data', 36);
  h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
};

let seed = 7;
Math.random = () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

fs.mkdirSync(OUT, { recursive: true });
for (const [name, recipe] of Object.entries(RECIPES)) {
  fs.writeFileSync(path.join(OUT, `${name}.wav`), toWav(recipe()));
  console.log(`wrote assets/sounds/${name}.wav`);
}
