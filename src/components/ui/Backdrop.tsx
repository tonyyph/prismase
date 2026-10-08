import { memo } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';

import { useGameStore } from '../../store/gameStore';
import { Planks } from './Planks';

/** Painted desert at high noon (Tony's art): mesas, dunes, a beached pirate boat. */
const MENU_DESERT = require('../../../assets/backdrops/menu-desert.jpg');

/**
 * The world behind every screen. The main menu is the open desert at high noon; everything
 * else happens indoors, on the saloon's plank floor and tables.
 */
export const Backdrop = memo(function Backdrop() {
  const { width, height } = useWindowDimensions();
  const status = useGameStore((s) => s.status);
  const outdoors = status === 'menu' || status === 'booting';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {outdoors ? (
        <Image source={MENU_DESERT} style={{ width, height }} resizeMode="cover" fadeDuration={0} />
      ) : (
        <Planks width={width} height={height} />
      )}
    </View>
  );
});
