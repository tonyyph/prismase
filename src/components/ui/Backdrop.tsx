import { memo, useMemo } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { useGameStore } from '../../store/gameStore';
import { desertSvg } from '../art/desertScene';
import { Planks } from './Planks';

/** Sun height on the menu; the main menu hangs the outlaw mark just under it. */
export const menuSunY = (height: number) => height * 0.1;

/**
 * The world behind every screen. The main menu is the open desert at high noon; everything
 * else happens indoors, on the saloon's plank floor and tables.
 */
export const Backdrop = memo(function Backdrop() {
  const { width, height } = useWindowDimensions();
  const status = useGameStore((s) => s.status);
  const outdoors = status === 'menu' || status === 'booting';
  const desert = useMemo(() => desertSvg(width, height, menuSunY(height)), [width, height]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {outdoors ? (
        <SvgXml xml={desert} width={width} height={height} />
      ) : (
        <Planks width={width} height={height} />
      )}
    </View>
  );
});
