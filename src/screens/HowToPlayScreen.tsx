import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CrateArt } from '../components/art/CrateArt';
import { WesternIcon } from '../components/art/WesternIcon';
import { PrismItem } from '../components/game/PrismItem';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Screen } from '../components/ui/Screen';
import { usePrismaseGame } from '../hooks/usePrismaseGame';
import { useGameStore } from '../store/gameStore';
import { colors, spacing } from '../theme';

/** A tiny static crate for the illustrations, items bottom to top. */
const MiniTube = ({ items, glow }: { items: string[]; glow?: string }) => (
  <View style={[styles.tube, glow ? { borderColor: glow } : null]}>
    <View style={StyleSheet.absoluteFill}>
      <CrateArt width={36} height={112} seed={items.length * 13 + 3} complete={undefined} />
    </View>
    <View style={styles.stack}>
      {items.map((colorId, i) => (
        <PrismItem key={i} colorId={colorId} size={24} />
      ))}
    </View>
  </View>
);

const CARDS: { title: string; body: string; art: () => ReactNode }[] = [
  {
    title: 'Tap a crate to pick',
    body: 'The top concho lifts out.',
    art: () => (
      <View style={styles.art}>
        <View style={styles.lifted}>
          <PrismItem colorId="blocks" size={24} />
          <MiniTube items={['lasso', 'saloon-doors']} glow={colors.gold} />
        </View>
        <MiniTube items={['saloon-doors', 'blocks']} />
      </View>
    ),
  },
  {
    title: 'Tap another to place',
    body: 'It must land on the same color, or in an empty crate.',
    art: () => (
      <View style={styles.art}>
        <MiniTube items={['lasso', 'blocks']} />
        <WesternIcon name="arrow" size={20} color={colors.textPrimary} />
        <MiniTube items={['saloon-doors', 'blocks', 'blocks']} />
        <MiniTube items={[]} />
      </View>
    ),
  },
  {
    title: 'Match colors',
    body: 'Fill each crate with four of a kind to collect the bounty.',
    art: () => (
      <View style={styles.art}>
        <MiniTube items={['lasso', 'lasso', 'lasso', 'lasso']} glow={colors.gold} />
        <MiniTube items={['laurel', 'laurel', 'laurel', 'laurel']} glow={colors.gold} />
      </View>
    ),
  },
  {
    title: 'Stuck? Undo or hint',
    body: 'Three free undos a level. The lantern shows a good move.',
    art: () => (
      <View style={styles.art}>
        {(['undo', 'hint', 'extra'] as const).map((icon) => (
          <View key={icon} style={styles.iconChip}>
            <WesternIcon name={icon} size={26} color={colors.textPrimary} />
          </View>
        ))}
      </View>
    ),
  },
];

export const HowToPlayScreen = () => {
  const game = usePrismaseGame();
  const hasLevel = useGameStore((s) => s.level !== null);
  return (
    <Screen title="How to Play" onBack={game.goBack}>
      <ScrollView contentContainerStyle={styles.content}>
        {CARDS.map((card, i) => (
          <Animated.View key={card.title} entering={FadeInDown.duration(300).delay(i * 70)}>
            <GlassPanel style={styles.card}>
              <View style={styles.step}>
                <AppText variant="caption" color={colors.textPrimary}>
                  {i + 1}
                </AppText>
              </View>
              {card.art()}
              <AppText variant="heading" align="center">
                {card.title}
              </AppText>
              <AppText color={colors.textSecondary} align="center">
                {card.body}
              </AppText>
            </GlassPanel>
          </Animated.View>
        ))}
        <AppButton
          variant="primary"
          label={hasLevel ? 'Back to game' : 'Got it'}
          onPress={game.goBack}
        />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  card: { alignItems: 'center', gap: spacing.sm },
  step: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brick,
  },
  art: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.md,
    height: 124,
    marginBottom: spacing.xs,
  },
  lifted: { alignItems: 'center', gap: 6 },
  tube: {
    width: 36,
    height: 112,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 6,
  },
  stack: {
    position: 'absolute',
    left: 0,
    right: 0,
    // Clear the painted crate's bottom band and rail (0.44 × its 36 pt width).
    bottom: 17,
    alignItems: 'center',
    flexDirection: 'column-reverse',
    gap: 1,
  },
  iconChip: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.wood,
    borderWidth: 1.5,
    borderColor: colors.borderGlassStrong,
  },
});
