import { memo } from 'react';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { f1, mixSeed } from './plankMath';

type Props = { width: number; height: number; seed?: number; vignette?: boolean };

/** Nailed floorboards / saloon table top, generated once per size. */
export const Planks = memo(function Planks({
  width: w,
  height: h,
  seed = 12,
  vignette = true,
}: Props) {
  const rows = mixSeed(w, h, seed);
  return (
    <Svg width={w} height={h}>
      <Defs>
        <RadialGradient id="vig" cx="0.5" cy="0.45" r="0.75">
          <Stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <Stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </RadialGradient>
      </Defs>
      {rows.map((row) => (
        <Rect key={`p${row.y}`} x={0} y={row.y} width={w} height={row.h} fill={row.tone} />
      ))}
      {rows.flatMap((row) =>
        row.grain.map((g, i) => (
          <Path
            key={`g${row.y}-${i}`}
            d={g.d}
            stroke="#000"
            strokeOpacity={g.o}
            strokeWidth={g.w}
            fill="none"
          />
        )),
      )}
      {rows.map((row) =>
        row.knot ? (
          <Ellipse
            key={`k${row.y}`}
            cx={row.knot}
            cy={f1(row.y + row.h / 2)}
            rx={9}
            ry={4}
            fill="none"
            stroke="#2a160b"
            strokeOpacity={0.45}
            strokeWidth={1.2}
          />
        ) : null,
      )}
      {rows.map((row) => (
        <Path
          key={`s${row.y}`}
          d={`M0 ${row.y} H${w} M${row.joint} ${row.y} V${row.y + row.h}`}
          stroke="#1e0f07"
          strokeWidth={2.2}
        />
      ))}
      {rows.flatMap((row) =>
        [row.joint - 9, row.joint + 9].flatMap((nx) => [
          <Circle key={`n${row.y}-${nx}a`} cx={nx} cy={row.y + 9} r={2.2} fill="#24140a" />,
          <Circle key={`n${row.y}-${nx}b`} cx={nx} cy={row.y + row.h - 9} r={2.2} fill="#24140a" />,
        ]),
      )}
      {vignette ? <Rect width={w} height={h} fill="url(#vig)" /> : null}
    </Svg>
  );
});
