import { memo } from 'react';
import Svg, { Circle, Ellipse, G, Path, Polygon, Rect, Text } from 'react-native-svg';

import { colors, fonts } from '../../theme';
import { f1, starPoints } from './geometry';

export type WesternIconName =
  | 'undo'
  | 'hint'
  | 'extra'
  | 'restart'
  | 'pause'
  | 'settings'
  | 'map'
  | 'chest'
  | 'help'
  | 'back'
  | 'play'
  | 'skip'
  | 'home'
  | 'lock'
  | 'star'
  | 'sound'
  | 'haptics'
  | 'motion'
  | 'trash'
  | 'arrow';

type Props = { name: WesternIconName; size?: number; color?: string };

/** Hole colour cut into solid icons (reads as wood showing through). */
const HOLE = '#c79a5e';

const glyph = (name: WesternIconName, c: string) => {
  switch (name) {
    case 'undo':
      // A lasso swinging back.
      return (
        <G>
          <Path
            d="M19 18 C20 10 14 6.5 7 9"
            stroke={c}
            strokeWidth={2.2}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M10.5 4.8 L6.5 9.2 L11 12.2"
            stroke={c}
            strokeWidth={2.2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Ellipse cx={19} cy={19.4} rx={2.6} ry={1.6} stroke={c} strokeWidth={1.6} fill="none" />
        </G>
      );
    case 'hint':
      // A storm lantern.
      return (
        <G>
          <Path d="M9 5.5 Q12 1.5 15 5.5" stroke={c} strokeWidth={1.6} fill="none" />
          <Rect x={7.5} y={5} width={9} height={2.5} rx={0.8} fill={c} />
          <Path
            d="M8.3 7.5 Q6.4 12.8 8.3 18 H15.7 Q17.6 12.8 15.7 7.5"
            stroke={c}
            strokeWidth={1.8}
            fill="none"
          />
          <Path d="M12 10 Q14.6 13.2 12 16 Q9.4 13.2 12 10 Z" fill="#e48a1a" />
          <Rect x={6.5} y={18} width={11} height={2.6} rx={0.8} fill={c} />
        </G>
      );
    case 'extra':
      return (
        <G>
          <Rect
            x={3.5}
            y={7.5}
            width={12}
            height={12}
            rx={1}
            stroke={c}
            strokeWidth={2}
            fill="none"
          />
          <Path d="M3.5 11.5 H15.5 M3.5 15.5 H15.5" stroke={c} strokeWidth={1.2} />
          <Path d="M19.5 2.5 V9.5 M16 6 H23" stroke={c} strokeWidth={2.2} strokeLinecap="round" />
        </G>
      );
    case 'restart':
      // A revolver cylinder spinning back to the start.
      return (
        <G>
          <Circle cx={12} cy={12.5} r={5.6} fill={c} />
          {Array.from({ length: 6 }, (_, i) => {
            const a = ((-90 + i * 60) * Math.PI) / 180;
            return (
              <Circle
                key={i}
                cx={f1(12 + 3 * Math.cos(a))}
                cy={f1(12.5 + 3 * Math.sin(a))}
                r={1.15}
                fill={HOLE}
              />
            );
          })}
          <Path
            d="M20.2 9 A8.6 8.6 0 1 0 20.6 15"
            stroke={c}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M21 4.5 V9.3 H16.2"
            stroke={c}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      );
    case 'pause':
      return (
        <G>
          <Rect x={6.5} y={4.5} width={4} height={15} rx={0.8} fill={c} />
          <Rect x={13.5} y={4.5} width={4} height={15} rx={0.8} fill={c} />
        </G>
      );
    case 'settings':
      // A spur rowel.
      return (
        <G>
          <Polygon points={starPoints(13.5, 12, 8.5, 3.6, 8, -90)} fill={c} />
          <Circle cx={13.5} cy={12} r={2.2} fill={HOLE} />
          <Path d="M1.5 12 H5.5" stroke={c} strokeWidth={2.4} strokeLinecap="round" />
        </G>
      );
    case 'map':
      return (
        <G>
          <Path
            d="M3 6.5 L9 4.5 L15 6.5 L21 4.5 V17.5 L15 19.5 L9 17.5 L3 19.5 Z"
            stroke={c}
            strokeWidth={1.8}
            fill="none"
            strokeLinejoin="round"
          />
          <Path d="M9 4.5 V17.5 M15 6.5 V19.5" stroke={c} strokeWidth={1} />
          <Path
            d="M16 8.5 L19 11.5 M19 8.5 L16 11.5"
            stroke={colors.stamp}
            strokeWidth={1.8}
            strokeLinecap="round"
          />
        </G>
      );
    case 'chest':
      return (
        <G>
          <Path d="M3 11 Q3 4.5 12 4.5 Q21 4.5 21 11 Z" fill={c} />
          <Rect x={3} y={11} width={18} height={9} rx={1} fill={c} />
          <Path d="M3 11 H21 M8 4.9 V20 M16 4.9 V20" stroke={HOLE} strokeWidth={1.1} />
          <Rect x={10.5} y={10} width={3} height={4} rx={0.6} fill="#e9b83c" />
        </G>
      );
    case 'help':
      return (
        <G>
          <Path
            d="M5 4 H17 Q19.5 4 19.5 6.5 V20 H7 Q5 20 5 18 Z"
            stroke={c}
            strokeWidth={1.8}
            fill="none"
          />
          <Text
            x={12.3}
            y={16.6}
            textAnchor="middle"
            fontFamily={fonts.western}
            fontSize={11}
            fill={c}
          >
            ?
          </Text>
        </G>
      );
    case 'back':
      // A signpost pointing left.
      return (
        <G>
          <Path d="M21 8 H8.5 L4 12 L8.5 16 H21 Z" fill={c} />
          <Path d="M14 16 V22" stroke={c} strokeWidth={2.4} />
        </G>
      );
    case 'play':
      return <Path d="M7 4.5 L19.5 12 L7 19.5 Z" fill={c} strokeLinejoin="round" />;
    case 'skip':
      return (
        <G>
          <Path d="M4 5 L13 12 L4 19 Z M12 5 L21 12 L12 19 Z" fill={c} />
        </G>
      );
    case 'home':
      // A saloon front.
      return (
        <G>
          <Path d="M3 9 H21 V20 H3 Z" stroke={c} strokeWidth={1.8} fill="none" />
          <Path d="M5 9 V5 H19 V9" stroke={c} strokeWidth={1.8} fill="none" />
          <Path d="M9.5 20 V14 H14.5 V20 M12 14 V20" stroke={c} strokeWidth={1.4} fill="none" />
        </G>
      );
    case 'lock':
      return (
        <G>
          <Path d="M8 11 V8 A4 4 0 0 1 16 8 V11" stroke={c} strokeWidth={2} fill="none" />
          <Rect x={6} y={11} width={12} height={9} rx={1.5} fill={c} />
          <Circle cx={12} cy={15} r={1.4} fill={HOLE} />
        </G>
      );
    case 'star':
      return <Polygon points={starPoints(12, 12.5, 9.5, 4)} fill={c} />;
    case 'sound':
      // A bugle.
      return (
        <G>
          <Path d="M3 10 H9 L18 5 V19 L9 14 H3 Z" fill={c} />
          <Path
            d="M20.5 9 Q22 12 20.5 15"
            stroke={c}
            strokeWidth={1.6}
            fill="none"
            strokeLinecap="round"
          />
        </G>
      );
    case 'haptics':
      // A horseshoe striking.
      return (
        <G>
          <Path
            d="M8 5 C4 11 6 19 12 19 C18 19 20 11 16 5"
            stroke={c}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M2 9 L4 10 M2 15 L4 14 M22 9 L20 10 M22 15 L20 14"
            stroke={c}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
        </G>
      );
    case 'motion':
      // A tumbleweed at rest.
      return (
        <G>
          <Circle cx={12} cy={12} r={7.5} stroke={c} strokeWidth={1.6} fill="none" />
          <Path
            d="M6 9 Q12 14 18 9 M6 15 Q12 10 18 15 M9 5.5 Q13 12 9 18.5 M15 5.5 Q11 12 15 18.5"
            stroke={c}
            strokeWidth={1.1}
            fill="none"
          />
        </G>
      );
    case 'trash':
      // A barrel.
      return (
        <G>
          <Path d="M6 4 H18 Q20 12 18 20 H6 Q4 12 6 4 Z" fill={c} />
          <Path d="M5.2 8 H18.8 M5.2 16 H18.8" stroke={HOLE} strokeWidth={1.3} />
        </G>
      );
    case 'arrow':
      return (
        <Path
          d="M4 12 H18 M13 7 L18 12 L13 17"
          stroke={c}
          strokeWidth={2.4}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
  }
};

/** Frontier icon set, drawn in a 24 box. Replaces generic UI icons everywhere in the game. */
export const WesternIcon = memo(function WesternIcon({
  name,
  size = 24,
  color = colors.textPrimary,
}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {glyph(name, color)}
    </Svg>
  );
});
