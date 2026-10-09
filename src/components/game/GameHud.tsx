import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../theme';
import { CoinPill } from '../ui/CoinPill';
import { IconButton } from '../ui/IconButton';
import { LevelPlaque, SIGN_BOARD_TOP, SIGN_RATIO, SIGN_ROPES } from './LevelPlaque';

const SIDE = 16;
const ROW_H = 44;
/** Widest the coin pouch gets with a 3-4 digit balance. */
const COIN_W = 112;
/** Dynamic Island: 126 pt wide, its bottom edge about 48 pt from the top of the screen. */
const ISLAND_BOTTOM = 48;

type Props = { level: number; detail: string; onPause: () => void };

/**
 * Gameplay header. The status bar is hidden, so on phones with a Dynamic Island (or notch)
 * the pause button and the doubloon pouch sit level with the island, and the level sign hangs
 * centred beneath it on two ropes that run up past either side of the island. Without a
 * cutout, the sign simply hangs below the pause/pouch row from its own rope loops.
 */
export const GameHud = ({ level, detail, onPause }: Props) => {
  const { width: W } = useWindowDimensions();

  const insets = useSafeAreaInsets();
  const cutout = insets.top >= 40;

  const rowTop = cutout ? 6 : Math.max(insets.top, 10);
  const rowBottom = rowTop + ROW_H;

  // Ropes must clear the pouch, which is the wider of the two corner items.
  const maxByPouch = (2 * (W - SIDE - COIN_W - 8 - W / 2)) / (SIGN_ROPES[1] - SIGN_ROPES[0]);
  const signW = Math.round(
    cutout ? Math.min(160, Math.max(150, maxByPouch)) : Math.min(110, W * 0.5),
  );

  const signH = signW * SIGN_RATIO;
  const boardTop = Math.max(rowBottom, cutout ? ISLAND_BOTTOM : 0) + 4;
  const signTop = cutout ? boardTop - signH * SIGN_BOARD_TOP : rowBottom + 2;
  const height = signTop + signH + 6;

  return (
    <View style={{ height }}>
      <View style={[styles.sign, { top: signTop + 12, left: W / 2 - signW / 2 }]}>
        <LevelPlaque level={level} detail={detail} width={signW} />
      </View>
      <View style={[styles.corner, { top: signTop, left: SIDE }]}>
        <IconButton icon="pause" label="Pause" onPress={onPause} />
      </View>
      <View style={[styles.corner, { top: signTop, right: SIDE }]}>
        <CoinPill />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rope: {
    position: 'absolute',
    top: 0,
    width: 6,
    borderRadius: 3,
    backgroundColor: colors.rope,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: '#6b4a24',
  },
  sign: {
    position: 'absolute',
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 5 },
  },
  corner: { position: 'absolute', height: ROW_H, justifyContent: 'center' },
});
