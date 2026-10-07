import { memo } from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';

import { colors } from '../../theme';
import { darken } from '../../utils/color';
import { f1, seeded, starPoints } from './geometry';

type Props = {
  width: number;
  height: number;
  /** Seeds the wood grain so each crate looks a little different but never changes. */
  seed: number;
  complete?: string;
  extra?: boolean;
};

/** Inner opening of a crate, as fractions used by both the art and the board layout. */
export const crateInset = (w: number) => w * 0.13;

/**
 * An upright wooden crate with an open front: pine sides, dark interior with board seams,
 * forged iron bands, brass corner brackets. Complete crates get a brass top band; the bought
 * extra crate is lashed with rope.
 */
export const CrateArt = memo(function CrateArt({
  width: w,
  height: h,
  seed,
  complete,
  extra,
}: Props) {
  const t = crateInset(w);
  const r = w * 0.1;
  const inX = t;
  const inY = t * 1.5;
  const inW = w - 2 * t;
  const inH = h - t * 2.7;
  const rand = seeded(seed);
  const grain = Array.from({ length: 4 }, (_, i) => {
    const gx = inX + inW * (0.15 + i * 0.23) + rand() * 3;
    return `M${f1(gx)} ${f1(inY + 4)} C${f1(gx + 2)} ${f1(inY + inH * 0.35)} ${f1(gx - 2)} ${f1(inY + inH * 0.65)} ${f1(gx + 1)} ${f1(inY + inH - 4)}`;
  });
  const bandH = Math.max(3, h * 0.035);
  const rivet = Math.max(1.2, w * 0.025);
  const band = (by: number, brass: boolean) => (
    <>
      <Rect
        x={-1.5}
        y={by}
        width={w + 3}
        height={bandH}
        rx={1.5}
        fill={brass ? 'url(#brass)' : colors.iron}
        stroke={brass ? colors.brassDark : '#1d1a19'}
        strokeWidth={0.8}
      />
      {[t * 0.5, w - t * 0.5].map((rx) => (
        <Circle
          key={rx}
          cx={rx}
          cy={by + bandH / 2}
          r={rivet}
          fill={brass ? '#fff1b0' : '#9a938d'}
        />
      ))}
    </>
  );
  const bracket = (bx: number, flip: number) =>
    `M${f1(bx)} ${f1(h - 2)} h${f1(flip * w * 0.22)} v${f1(-w * 0.07)} h${f1(-flip * w * 0.15)} v${f1(-w * 0.15)} h${f1(-flip * w * 0.07)} Z`;

  return (
    <Svg width={w + 4} height={h + 4} viewBox={`-2 -2 ${w + 4} ${h + 4}`}>
      <Defs>
        <LinearGradient id="pine" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#5e361c" />
          <Stop offset="0.18" stopColor="#9a6435" />
          <Stop offset="0.5" stopColor="#b07a45" />
          <Stop offset="0.82" stopColor="#8c5a30" />
          <Stop offset="1" stopColor="#5a321a" />
        </LinearGradient>
        <LinearGradient id="inside" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#1f1009" />
          <Stop offset="0.5" stopColor="#3a2214" />
          <Stop offset="1" stopColor="#1f1009" />
        </LinearGradient>
        <LinearGradient id="topShade" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#000" stopOpacity="0.6" />
          <Stop offset="1" stopColor="#000" stopOpacity="0" />
        </LinearGradient>
        <LinearGradient id="brass" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#f7dd8c" />
          <Stop offset="1" stopColor="#a87420" />
        </LinearGradient>
      </Defs>
      <Rect
        x={0}
        y={0}
        width={w}
        height={h}
        rx={r}
        fill="url(#pine)"
        stroke={complete ? darken(complete, 0.2) : '#2b170c'}
        strokeWidth={complete ? 3 : 2}
      />
      <Rect x={inX} y={inY} width={inW} height={inH} rx={r * 0.4} fill="url(#inside)" />
      {grain.map((d) => (
        <Path key={d} d={d} stroke="#56331d" strokeOpacity={0.55} strokeWidth={0.9} fill="none" />
      ))}
      <Path
        d={`M${f1(inX + inW / 3)} ${f1(inY)} V${f1(inY + inH)} M${f1(inX + (2 * inW) / 3)} ${f1(inY)} V${f1(inY + inH)}`}
        stroke="#140904"
        strokeWidth={1.2}
        opacity={0.8}
      />
      <Rect x={inX} y={inY} width={inW} height={inH * 0.12} fill="url(#topShade)" />
      {band(h * 0.045, !!complete)}
      {band(h * 0.915, false)}
      <Path d={bracket(1, 1)} fill={colors.brass} stroke={colors.brassDark} strokeWidth={0.8} />
      <Path
        d={bracket(w - 1, -1)}
        fill={colors.brass}
        stroke={colors.brassDark}
        strokeWidth={0.8}
      />
      {extra ? (
        <>
          <Path
            d={`M-1 ${f1(h * 0.13)} L${w + 1} ${f1(h * 0.18)} M-1 ${f1(h * 0.16)} L${w + 1} ${f1(h * 0.21)}`}
            stroke="#7a5a2c"
            strokeWidth={5}
            strokeLinecap="round"
          />
          <Path
            d={`M-1 ${f1(h * 0.13)} L${w + 1} ${f1(h * 0.18)} M-1 ${f1(h * 0.16)} L${w + 1} ${f1(h * 0.21)}`}
            stroke={colors.rope}
            strokeWidth={3.2}
            strokeLinecap="round"
            strokeDasharray="3 2"
          />
          <Circle
            cx={w * 0.78}
            cy={h * 0.19}
            r={w * 0.08}
            fill={colors.rope}
            stroke="#7a5a2c"
            strokeWidth={1.2}
          />
        </>
      ) : null}
    </Svg>
  );
});

/** The sheriff medallion that hangs over a completed crate, in that crate's colour. */
export const CrateMedallion = memo(function CrateMedallion({
  size,
  color,
}: {
  size: number;
  color: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Circle cx={20} cy={20} r={18} fill={color} stroke={colors.brassDark} strokeWidth={2.4} />
      <Circle cx={20} cy={20} r={14} fill="none" stroke={colors.brassLight} strokeWidth={1.4} />
      <Polygon points={starPoints(20, 20.5, 10.5, 4.4)} fill={colors.textPrimary} />
    </Svg>
  );
});
