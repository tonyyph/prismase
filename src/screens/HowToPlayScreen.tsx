import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PrismItem } from '../components/game/PrismItem';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { GlassPanel } from '../components/ui/GlassPanel';
import { Screen } from '../components/ui/Screen';
import { usePrismaseGame } from '../hooks/usePrismaseGame';
import { useGameStore } from '../store/gameStore';
import { colors, spacing } from '../theme';

/** A tiny static tube for the illustrations. */
const MiniTube = ({ items, glow }: { items: string[]; glow?: string }) => (
  <View
    style={[
      styles.tube,
      glow ? { borderColor: glow, shadowColor: glow, shadowOpacity: 0.8 } : null,
    ]}
  >
    {items.map((colorId, i) => (
      <PrismItem key={i} colorId={colorId} size={22} />
    ))}
  </View>
);

const CARDS: { title: string; body: string; art: () => ReactNode }[] = [
  {
    title: 'Tap a prism to pick',
    body: 'The top crystal lifts out.',
    art: () => (
      <View style={styles.art}>
        <View style={styles.lifted}>
          <PrismItem colorId="pink" size={22} />
          <MiniTube items={['cyan', 'amber']} glow={colors.cyan} />
        </View>
        <MiniTube items={['amber', 'pink']} />
      </View>
    ),
  },
  {
    title: 'Tap another to place',
    body: 'It must land on the same color, or in an empty prism.',
    art: () => (
      <View style={styles.art}>
        <MiniTube items={['cyan', 'amber']} />
        <Ionicons name="arrow-forward" size={18} color={colors.textSecondary} />
        <MiniTube items={['amber', 'pink', 'pink']} />
        <MiniTube items={[]} />
      </View>
    ),
  },
  {
    title: 'Match colors',
    body: 'Fill each prism with four of a kind to clear the level.',
    art: () => (
      <View style={styles.art}>
        <MiniTube items={['violet', 'violet', 'violet', 'violet']} glow={colors.violet} />
        <MiniTube items={['emerald', 'emerald', 'emerald', 'emerald']} glow={colors.emerald} />
      </View>
    ),
  },
  {
    title: 'Stuck? Undo or hint',
    body: 'Three free undos per level. Hints light up a good move.',
    art: () => (
      <View style={styles.art}>
        {(['arrow-undo', 'bulb-outline', 'add-circle-outline'] as const).map((icon) => (
          <View key={icon} style={styles.iconChip}>
            <Ionicons name={icon} size={22} color={colors.textPrimary} />
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
                <AppText variant="caption" color={colors.cyan}>
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(34,211,238,0.12)',
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
    width: 32,
    height: 104,
    paddingBottom: 5,
    gap: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column-reverse',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
  },
  iconChip: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceGlass,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.borderGlass,
  },
});
