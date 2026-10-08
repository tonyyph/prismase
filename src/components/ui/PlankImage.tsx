import { type ReactNode, useState } from 'react';
import { Image, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

import meta from '../../../assets/buttons/meta.json';

const SLICES = {
  red: {
    l: require('../../../assets/buttons/red-l.png'),
    m: require('../../../assets/buttons/red-m.png'),
    r: require('../../../assets/buttons/red-r.png'),
    cap: meta.red.cap,
  },
  pine: {
    l: require('../../../assets/buttons/pine-l.png'),
    m: require('../../../assets/buttons/pine-m.png'),
    r: require('../../../assets/buttons/pine-r.png'),
    cap: meta.pine.cap,
  },
  chip: {
    l: require('../../../assets/buttons/chip-l.png'),
    m: require('../../../assets/buttons/chip-m.png'),
    r: require('../../../assets/buttons/chip-r.png'),
    cap: meta.chip.cap,
  },
  label: {
    l: require('../../../assets/buttons/label-l.png'),
    m: require('../../../assets/buttons/label-m.png'),
    r: require('../../../assets/buttons/label-r.png'),
    cap: meta.label.cap,
  },
};

export type PlankTone = keyof typeof SLICES;

type Props = { tone: PlankTone; style?: StyleProp<ViewStyle>; children?: ReactNode };

/**
 * Tony's painted button art drawn at any size: the caps (rivet + bevelled corner) keep their
 * proportions and only the plain wood in the middle stretches. Slices come from
 * `pnpm assets` (tools/slice-buttons.js).
 */
export const PlankImage = ({ tone, style, children }: Props) => {
  const [height, setHeight] = useState(0);
  const s = SLICES[tone];
  const cap = height * s.cap;
  return (
    <View
      style={style}
      onLayout={(e) => {
        const h = Math.round(e.nativeEvent.layout.height);
        setHeight((prev) => (prev === h ? prev : h));
      }}
    >
      {height ? (
        <View style={[StyleSheet.absoluteFill, styles.row]} pointerEvents="none">
          <Image
            source={s.l}
            style={{ width: cap, height }}
            resizeMode="stretch"
            fadeDuration={0}
          />
          <Image
            source={s.m}
            style={[styles.mid, { height }]}
            resizeMode="stretch"
            fadeDuration={0}
          />
          <Image
            source={s.r}
            style={{ width: cap, height }}
            resizeMode="stretch"
            fadeDuration={0}
          />
        </View>
      ) : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  mid: { flex: 1 },
});
