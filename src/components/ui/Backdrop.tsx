import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { Image, StyleSheet, View, useWindowDimensions } from 'react-native';

import { useGameStore } from '../../store/gameStore';

/** Painted desert at high noon (Tony's art): mesas, dunes, a beached pirate boat. */
const MENU_DESERT = require('../../../assets/backdrops/menu-desert.jpg');

/** Lamp-lit saloon wall of nailed planks (Tony's art), behind the game and other indoor screens. */
const SALOON = require('../../../assets/backdrops/saloon-planks.jpg');

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
        <>
          <Image source={SALOON} style={{ width, height }} resizeMode="cover" fadeDuration={0} />
          {/* The painting is bright; deepen the top (HUD) and bottom (action bar) so text and
              pieces keep their contrast, and dim the middle a touch behind the crates. */}
          <LinearGradient
            colors={[
              'rgba(20,8,2,0.55)',
              'rgba(20,8,2,0.18)',
              'rgba(20,8,2,0.22)',
              'rgba(20,8,2,0.5)',
            ]}
            locations={[0, 0.22, 0.7, 1]}
            style={StyleSheet.absoluteFill}
          />
        </>
      )}
    </View>
  );
});
