import { Circle, G, Path, Polygon, Rect } from 'react-native-svg';

import type { Emblem as EmblemName } from '../../game/constants';
import { f1, starPoints } from './geometry';

type Props = { name: EmblemName; fill: string; accent: string };

const ring = (n: number, r: number, cy = 50, start = -90) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((start + (i * 360) / n) * Math.PI) / 180;
    return [f1(50 + r * Math.cos(a)), f1(cy + r * Math.sin(a))] as const;
  });

const pairs = (list: number[][], r: number, fill: string) =>
  list.map(([x, y]) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={fill} />);

/**
 * The twelve carved emblems, in a 100×100 box centred on 50,50. `fill` is the carving,
 * `accent` shows through the holes (the enamel colour).
 */
export const Emblem = ({ name, fill: f, accent: a }: Props) => {
  switch (name) {
    case 'star':
      return (
        <G>
          <Polygon points={starPoints(50, 52, 25, 11)} fill={f} />
          {pairs(
            ring(5, 26, 52).map(([x, y]) => [x, y]),
            3.8,
            f,
          )}
          <Circle cx={50} cy={52} r={4.5} fill={a} />
        </G>
      );
    case 'horseshoe':
      return (
        <G>
          <Path
            d="M33 31 C22 50 28 76 50 76 C72 76 78 50 67 31 L57 31 C63 48 60 66 50 66 C40 66 37 48 43 31 Z"
            fill={f}
          />
          <Rect x={29} y={26} width={16} height={7} rx={2} fill={f} />
          <Rect x={55} y={26} width={16} height={7} rx={2} fill={f} />
          {pairs(
            [
              [33, 44],
              [35, 58],
              [67, 44],
              [65, 58],
            ],
            1.9,
            a,
          )}
        </G>
      );
    case 'hat':
      return (
        <G>
          <Path d="M20 57 Q50 70 80 57 Q83 61 77 64 Q50 77 23 64 Q17 61 20 57 Z" fill={f} />
          <Path d="M33 60 Q31 38 40 31 Q50 38 60 31 Q69 38 67 60 Q50 64 33 60 Z" fill={f} />
          <Path d="M33 52 Q50 57 67 52 L67 57 Q50 61 33 57 Z" fill={a} />
        </G>
      );
    case 'cactus':
      return (
        <G>
          <Path
            d="M50 77 V27 M50 59 H39 V45 M50 51 H61 V37"
            stroke={f}
            strokeWidth={9}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path d="M34 78 H66" stroke={f} strokeWidth={3.5} strokeLinecap="round" />
        </G>
      );
    case 'anchor':
      return (
        <G>
          <Circle cx={50} cy={27} r={5} stroke={f} strokeWidth={4.5} fill="none" />
          <Path
            d="M50 32 V74 M38 41 H62"
            stroke={f}
            strokeWidth={5.5}
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M29 57 Q31 75 50 75 Q69 75 71 57"
            stroke={f}
            strokeWidth={5.5}
            strokeLinecap="round"
            fill="none"
          />
          <Path d="M23 61 L30 51 L36 61 Z M77 61 L70 51 L64 61 Z" fill={f} />
        </G>
      );
    case 'boot':
      return (
        <G>
          <Path d="M39 25 H58 L58 55 Q59 61 65 62 L74 64 Q80 66 79 72 V75 H39 Z" fill={f} />
          <Rect x={37} y={22} width={23} height={6} rx={2} fill={f} />
          <Path
            d="M44 33 Q48.5 41 53 33 M44 44 Q48.5 52 53 44"
            stroke={a}
            strokeWidth={2.2}
            fill="none"
          />
          <Rect x={39} y={75} width={11} height={4} rx={1} fill={f} />
          <Path d="M39 68 H31" stroke={f} strokeWidth={2.5} />
          <Polygon points={starPoints(28, 68, 6, 2.2, 6, 0)} fill={f} />
        </G>
      );
    case 'jolly':
      return (
        <G>
          <Path
            d="M28 76 L72 42 M28 42 L72 76"
            stroke={f}
            strokeWidth={6.5}
            strokeLinecap="round"
          />
          {pairs(
            [
              [24, 72],
              [31, 79],
              [69, 38],
              [76, 45],
              [24, 45],
              [31, 38],
              [69, 79],
              [76, 72],
            ],
            4.3,
            f,
          )}
          <Path
            d="M35 45 Q35 24 50 24 Q65 24 65 45 Q65 52 59 54 V61 H41 V54 Q35 52 35 45 Z"
            fill={f}
          />
          <Circle cx={43.5} cy={43} r={5.2} fill={a} />
          <Circle cx={56.5} cy={43} r={5.2} fill={a} />
          <Path d="M50 48 L47 54 H53 Z" fill={a} />
          <Path d="M45.5 57 V61 M50 57 V61 M54.5 57 V61" stroke={a} strokeWidth={1.6} />
        </G>
      );
    case 'longhorn':
      return (
        <G>
          <Path d="M44 40 C36 36 26 37 17 29 C19 40 30 47 44 48 Z" fill={f} />
          <Path d="M56 40 C64 36 74 37 83 29 C81 40 70 47 56 48 Z" fill={f} />
          <Path d="M40 37 H60 Q61 50 57 62 Q50 75 43 62 Q39 50 40 37 Z" fill={f} />
          {pairs(
            [
              [45, 47],
              [55, 47],
            ],
            3.4,
            a,
          )}
          {pairs(
            [
              [47.5, 65],
              [52.5, 65],
            ],
            1.5,
            a,
          )}
        </G>
      );
    case 'spade':
      return (
        <Path
          d="M50 24 C44 35 29 41 29 52 C29 61 38 65 46 59 L42 74 H58 L54 59 C62 65 71 61 71 52 C71 41 56 35 50 24 Z"
          fill={f}
        />
      );
    case 'compass':
      return (
        <G>
          <Circle cx={50} cy={50} r={25} stroke={f} strokeWidth={2.5} fill="none" />
          <Polygon points={starPoints(50, 50, 13, 3.5, 4, -45)} fill={f} opacity={0.55} />
          <Polygon points={starPoints(50, 50, 24, 5, 4, -90)} fill={f} />
          <Polygon points="50,26 54.5,45.5 50,50" fill={a} opacity={0.55} />
          <Polygon points="74,50 54.5,54.5 50,50" fill={a} opacity={0.55} />
          <Circle cx={50} cy={50} r={3} fill={a} />
        </G>
      );
    case 'wheel':
      return (
        <G>
          <Circle cx={50} cy={50} r={23} stroke={f} strokeWidth={6} fill="none" />
          {Array.from({ length: 8 }, (_, i) => {
            const t = (i * Math.PI) / 4;
            const d = `M${f1(50 + 6 * Math.cos(t))} ${f1(50 + 6 * Math.sin(t))} L${f1(50 + 21 * Math.cos(t))} ${f1(50 + 21 * Math.sin(t))}`;
            return <Path key={i} d={d} stroke={f} strokeWidth={3.6} strokeLinecap="round" />;
          })}
          <Circle cx={50} cy={50} r={7} fill={f} />
          <Circle cx={50} cy={50} r={2.4} fill={a} />
        </G>
      );
    case 'cylinder':
      return (
        <G>
          <Circle cx={50} cy={50} r={25} fill={f} />
          {pairs(
            ring(6, 13.5).map(([x, y]) => [x, y]),
            5.8,
            a,
          )}
          <Circle cx={50} cy={50} r={3.4} fill={a} />
        </G>
      );
  }
};
