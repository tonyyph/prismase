import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useRewardedReady } from '../../hooks/useAds';
import { useReducedMotion } from '../../hooks/usePersistedSettings';
import { usePrismaseGame } from '../../hooks/usePrismaseGame';
import { colors, motion, spacing } from '../../theme';
import { AdBadge } from '../ui/AdBadge';
import { AppButton } from '../ui/AppButton';

/**
 * Tony's pause board on long ropes, trimmed to 900 × 1546. The ropes run from the top of the
 * art down to the board, which starts at BOARD_TOP; the buttons sit on its blank plank body.
 */
const ART = require('../../../assets/brand/pause-drop.png');
const RATIO = 1546 / 900;
const BOARD_TOP = 463 / 1453;
const BODY = { top: 0.555, bottom: 0.06, side: 0.09 };
/** A plain stretch of both ropes (900 × 319), repeated above the art on tall screens. */
const ROPE_TILE = require('../../../assets/brand/pause-rope-tile.png');
const ROPE_TILE_RATIO = 319 / 900;

/**
 * The pause board is lowered on its ropes from above the screen: it slides down, settles
 * without bouncing, and sways once on the ropes before coming to rest. The ropes always run
 * off the top of the screen, so it reads as hanging from the rafters.
 */
const usePauseGeometry = () => {
  const { width: W, height: H } = useWindowDimensions();
  const artW = Math.min(W - spacing.md * 2, 420, (H - 120) / (RATIO * (1 - BOARD_TOP)));
  const artH = artW * RATIO;
  const ropeH = artH * BOARD_TOP;
  const boardH = artH - ropeH;
  // Board centred a little below the middle; the art's top (rope ends) sits above that.
  const boardTop = Math.max(60, (H - boardH) / 2 + 16);
  const artTop = boardTop - ropeH;
  const tileH = artW * ROPE_TILE_RATIO;
  const tiles = artTop > 0 ? Math.ceil(artTop / tileH) + 1 : 0;
  return { W, H, artW, artH, ropeH, boardH, boardTop, artTop, tileH, tiles };
};

/**
 * Renders the pause art invisibly while a level is open, so the large PNGs are decoded and
 * cached before the first pause. Without it the board pops in blank and flickers on first use.
 */
export const PauseArtPreload = () => {
  const { artW, artH, tileH } = usePauseGeometry();
  return (
    <View pointerEvents="none" style={styles.preload}>
      <Image source={ART} style={{ width: artW, height: artH }} fadeDuration={0} />
      <Image source={ROPE_TILE} style={{ width: artW, height: tileH }} fadeDuration={0} />
    </View>
  );
};

export const PauseModal = () => {
  const game = usePrismaseGame();
  const reducedMotion = useReducedMotion();
  const skipReady = useRewardedReady('reward_skip_level');
  const { W, artW, artH, boardH, boardTop, artTop, tileH, tiles } = usePauseGeometry();

  const bodyH = artH * (1 - BODY.top - BODY.bottom);
  const gap = Math.max(6, bodyH * 0.035);
  const rowH = Math.min(60, (bodyH - gap * 5) / 4);

  const drop = useSharedValue(reducedMotion ? 0 : -(boardTop + boardH + 40));
  const sway = useSharedValue(0);
  useEffect(() => {
    if (reducedMotion) return;
    drop.set(withTiming(0, { duration: 620, easing: motion.settle }));
    sway.set(
      withDelay(
        380,
        withSequence(
          withTiming(1.4, { duration: 260, easing: Easing.out(Easing.sin) }),
          withTiming(-0.7, { duration: 420, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 380, easing: Easing.inOut(Easing.sin) }),
        ),
      ),
    );
  }, [reducedMotion, drop, sway]);

  // Swing about the point where the ropes leave the top of the screen: shift to that pivot,
  // rotate, shift back (a manual transform origin, which animates reliably on iOS).
  const pivot = artH / 2 + artTop;
  const hang = useAnimatedStyle(() => ({
    transform: [
      { translateY: drop.value },
      { translateY: -pivot },
      { rotate: `${sway.value}deg` },
      { translateY: pivot },
    ],
  }));

  return (
    <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
      {/* The scrim fades on its own layer; the board carries only its drop transform. */}
      <Animated.View
        entering={FadeIn.duration(motion.duration.fade)}
        exiting={FadeOut.duration(200)}
        style={[StyleSheet.absoluteFill, styles.scrim]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={game.resumeGame} accessible={false} />
      </Animated.View>
      <Animated.View
        style={[
          styles.hang,
          { left: (W - artW) / 2, top: artTop, width: artW, height: artH },
          hang,
        ]}
      >
        {Array.from({ length: tiles }, (_, i) => (
          <Image
            key={i}
            source={ROPE_TILE}
            style={[styles.tile, { top: -tileH * (i + 1) + 1, width: artW, height: tileH }]}
            resizeMode="stretch"
            fadeDuration={0}
          />
        ))}
        <Image
          source={ART}
          style={{ width: artW, height: artH }}
          resizeMode="stretch"
          fadeDuration={0}
        />
        <View
          style={[
            styles.body,
            {
              top: artH * BODY.top,
              bottom: artH * BODY.bottom,
              left: artW * BODY.side,
              right: artW * BODY.side,
              gap,
              paddingVertical: gap,
            },
          ]}
        >
          <AppButton
            variant="primary"
            height={rowH}
            icon="play"
            label="Back to It"
            onPress={game.resumeGame}
          />
          <AppButton
            height={rowH}
            icon="restart"
            label="Restart"
            onPress={() => {
              game.resumeGame();
              void game.restartLevel();
            }}
          />
          <AppButton
            height={rowH}
            icon="skip"
            label="Skip level"
            accessory={<AdBadge />}
            disabled={!skipReady}
            accessibilityHint="Watch an ad to unlock the next level"
            onPress={() => void game.skipLevel()}
          />
          <View style={[styles.row, { gap }]}>
            <View style={styles.half}>
              <AppButton
                compact
                height={rowH}
                label="Settings"
                onPress={() => game.navigate('settings')}
              />
            </View>
            <View style={styles.half}>
              <AppButton compact height={rowH} label="Menu" onPress={game.backToMenu} />
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrim: { backgroundColor: colors.scrim },
  // No shadow here: on a large transparent image iOS recomputes it every frame of the drop.
  hang: { position: 'absolute' },
  preload: { position: 'absolute', left: 0, top: 0, opacity: 0 },
  tile: { position: 'absolute', left: 0 },
  body: { position: 'absolute', justifyContent: 'center' },
  row: { flexDirection: 'row' },
  half: { flex: 1 },
});
