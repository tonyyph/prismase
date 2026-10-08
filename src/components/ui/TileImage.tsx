import { type ReactNode, useState } from 'react';
import { Image, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';

const S = {
  tl: require('../../../assets/tile/tl.png'),
  t: require('../../../assets/tile/t.png'),
  tr: require('../../../assets/tile/tr.png'),
  l: require('../../../assets/tile/l.png'),
  c: require('../../../assets/tile/c.png'),
  r: require('../../../assets/tile/r.png'),
  bl: require('../../../assets/tile/bl.png'),
  b: require('../../../assets/tile/b.png'),
  br: require('../../../assets/tile/br.png'),
};

type Props = { style?: StyleProp<ViewStyle>; children?: ReactNode };

/**
 * Tony's brass-framed wooden tile at any size, nine-sliced: corners keep their chamfer and
 * frame thickness, edges and the plank centre stretch. Slices come from `pnpm assets`
 * (tools/slice-tile.js). Corner size follows the shorter side so small chips stay balanced.
 */
export const TileImage = ({ style, children }: Props) => {
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const corner = size ? Math.min(Math.min(size.w, size.h) * 0.3, 22) : 0;
  const img = (src: number, w: number | undefined, h: number | undefined, flex = false) => (
    <Image
      source={src}
      style={[{ width: w, height: h }, flex && styles.flex]}
      resizeMode="stretch"
      fadeDuration={0}
    />
  );
  return (
    <View
      style={style}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize((p) =>
          p && Math.abs(p.w - width) < 0.5 && Math.abs(p.h - height) < 0.5
            ? p
            : { w: width, h: height },
        );
      }}
    >
      {size ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={[styles.row, { height: corner }]}>
            {img(S.tl, corner, corner)}
            {img(S.t, undefined, corner, true)}
            {img(S.tr, corner, corner)}
          </View>
          <View style={[styles.row, styles.flex]}>
            {img(S.l, corner, undefined)}
            {img(S.c, undefined, undefined, true)}
            {img(S.r, corner, undefined)}
          </View>
          <View style={[styles.row, { height: corner }]}>
            {img(S.bl, corner, corner)}
            {img(S.b, undefined, corner, true)}
            {img(S.br, corner, corner)}
          </View>
        </View>
      ) : null}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  flex: { flex: 1, alignSelf: 'stretch' },
});
