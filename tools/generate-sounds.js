#!/usr/bin/env node
/**
 * Synthesises Prismase's frontier sound effects into assets/sounds/*.wav (16-bit mono PCM):
 * real materials, no chiptune. A knuckle on wood, a coin set on a table, a slack banjo string,
 * spur rowels, a western whistle over an open guitar chord, coins dropping into a chest.
 * Run with `pnpm sounds`; tweak the recipes and re-run, never hand-edit the WAVs.
 */
const fs = require('fs');
const path = require('path');

const RATE = 22050;
const OUT = path.join(__dirname, '..', 'assets', 'sounds');

const note = (name) => {
  const semis = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
  return 440 * 2 ** ((semis[name[0]] + (Number(name.slice(-1)) - 4) * 12) / 12);
};

const len = (ms) => Math.round((RATE * ms) / 1000);

/** Sine partials with independent decays: the basis for metal (inharmonic) and wood (low). */
const partials = ({ ms, list, gain = 0.4, attack = 0.002 }) => {
  const n = len(ms);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    const t = i / RATE;
    const a = Math.min(1, t / attack);
    let v = 0;
    for (const [freq, amp, decay] of list)
      v += Math.sin(2 * Math.PI * freq * t) * amp * Math.exp(-decay * t);
    out[i] = v * a * gain;
  }
  return out;
};

/** A short band-limited noise burst (one-pole low-pass), for wood thuds and scrapes. */
const noise = ({ ms, gain = 0.4, decay = 40, cutoff = 0.2 }) => {
  const n = len(ms);
  const out = new Float32Array(n);
  let y = 0;
  for (let i = 0; i < n; i += 1) {
    y += cutoff * (Math.random() * 2 - 1 - y);
    out[i] = y * Math.exp((-decay * i) / RATE) * gain;
  }
  return out;
};

/** Karplus-Strong plucked string; `bright` (0..1) sets how twangy, `bend` slides the pitch. */
const pluck = ({ freq, ms, gain = 0.5, bright = 0.5, bend = 1 }) => {
  const n = len(ms);
  const out = new Float32Array(n);
  let period = Math.round(RATE / freq);
  let buf = Array.from({ length: period }, () => Math.random() * 2 - 1);
  let idx = 0;
  const damp = 0.5 + bright * 0.49;
  for (let i = 0; i < n; i += 1) {
    const next = (idx + 1) % buf.length;
    const v = buf[idx];
    buf[idx] = damp * 0.5 * (v + buf[next]) + (1 - damp) * buf[idx] * 0.5;
    out[i] = v * gain;
    idx = next;
    if (bend !== 1 && i % 400 === 0) {
      const target = Math.round(RATE / (freq * (1 + (bend - 1) * (i / n))));
      if (target !== period && target > 2) {
        period = target;
        buf = Array.from({ length: period }, (_, k) => buf[k % buf.length]);
        idx %= period;
      }
    }
  }
  return out;
};

/** A whistled note: pure tone with vibrato and a little breath. */
const whistle = ({ from, to = from, ms, gain = 0.3, vibrato = 0.012 }) => {
  const n = len(ms);
  const out = new Float32Array(n);
  let phase = 0;
  let y = 0;
  for (let i = 0; i < n; i += 1) {
    const t = i / n;
    const vib = 1 + vibrato * Math.sin((2 * Math.PI * 5.5 * i) / RATE) * Math.min(1, t * 2);
    phase += (2 * Math.PI * from * (to / from) ** Math.min(1, t * 4) * vib) / RATE;
    const env = Math.min(1, t * 12) * Math.min(1, (1 - t) * 6);
    y += 0.05 * (Math.random() * 2 - 1 - y);
    out[i] = (Math.sin(phase) + y * 0.6) * env * gain;
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

const coinRing = (gain = 0.25) =>
  partials({
    ms: 260,
    gain,
    list: [
      [2380, 1, 18],
      [3910, 0.6, 24],
      [5730, 0.35, 30],
      [7220, 0.2, 40],
    ],
  });

const RECIPES = {
  // A knuckle on a wooden crate.
  select: () =>
    mix(
      partials({
        ms: 90,
        gain: 0.5,
        list: [
          [190, 1, 55],
          [420, 0.4, 80],
          [870, 0.15, 120],
        ],
      }),
      noise({ ms: 40, gain: 0.35, decay: 120, cutoff: 0.35 }),
    ),
  // A coin slid across the table and set down.
  move: () =>
    concat(
      noise({ ms: 70, gain: 0.12, decay: 20, cutoff: 0.6 }),
      mix(
        partials({
          ms: 70,
          gain: 0.35,
          list: [
            [230, 1, 60],
            [520, 0.3, 90],
          ],
        }),
        coinRing(0.12),
      ),
    ),
  // A slack banjo string, twice, sagging down.
  invalid: () =>
    concat(
      pluck({ freq: note('D3'), ms: 150, gain: 0.55, bright: 0.85, bend: 0.94 }),
      pluck({ freq: note('A2'), ms: 260, gain: 0.55, bright: 0.85, bend: 0.9 }),
    ),
  // Spur rowels jingling as a crate fills up.
  complete: () =>
    mix(
      ...[0, 70, 125, 190].map((at, i) =>
        delay(
          at,
          partials({
            ms: 320,
            gain: 0.3 - i * 0.04,
            list: [
              [3100 + i * 170, 1, 14],
              [4870 + i * 210, 0.55, 18],
              [6900 + i * 90, 0.3, 26],
            ],
          }),
        ),
      ),
    ),
  // Showdown won: a whistled call over an open guitar chord.
  win: () =>
    mix(
      concat(
        whistle({ from: note('A5'), ms: 200 }),
        whistle({ from: note('A5'), to: note('D6'), ms: 260 }),
        whistle({ from: note('E6'), ms: 170 }),
        whistle({ from: note('A6') / 2 ** (2 / 12), to: note('A6'), ms: 620, vibrato: 0.02 }),
      ),
      delay(620, pluck({ freq: note('A2'), ms: 1100, gain: 0.32, bright: 0.6 })),
      delay(650, pluck({ freq: note('E3'), ms: 1050, gain: 0.26, bright: 0.6 })),
      delay(680, pluck({ freq: note('A3'), ms: 1000, gain: 0.22, bright: 0.6 })),
    ),
  // Doubloons dropping into a wooden chest.
  coin: () =>
    mix(
      coinRing(0.22),
      delay(70, coinRing(0.16)),
      delay(130, coinRing(0.1)),
      delay(
        30,
        partials({
          ms: 140,
          gain: 0.3,
          list: [
            [160, 1, 40],
            [340, 0.4, 60],
          ],
        }),
      ),
    ),
};

const toWav = (samples) => {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((v, i) =>
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), i * 2),
  );
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
