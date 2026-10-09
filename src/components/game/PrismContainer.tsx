import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { getPrismColor } from '../../game/constants';
import type { ContainerState } from '../../game/types';
import { colors, motion } from '../../theme';
import { CrateArt, CrateMedallion } from '../art/CrateArt';
import { type BoardLayout, type Rect, liftCenter, slotCenter } from './boardLayout';
import { PrismItem } from './PrismItem';

type Props = {
  container: ContainerState;
  index: number;
  rect: Rect;
  layout: BoardLayout;
  selected: boolean;
  complete: boolean;
  /** Item drawn by the flight overlay instead, while it travels here. */
  hiddenItemId?: string;
  /** Changes whenever this container should shake (invalid move). */
  shakeSeq?: number;
  reducedMotion: boolean;
  onPress: (id: string) => void;
};

const ITEM_SCALE = 0.88;

export const PrismContainer = memo(function PrismContainer({
  container,
  index,
  rect,
  layout,
  selected,
  complete,
  hiddenItemId,
  shakeSeq,
  reducedMotion,
  onPress,
}: Props) {
  const { slot, tubeWidth, tubeHeight, liftSpace, gapX } = layout;
  const itemSize = slot * ITEM_SCALE;
  const topIndex = container.items.length - 1;
  const topItem = container.items[topIndex];
  const itemFrame = (index: number) => {
    const center = slotCenter(layout, container.capacity, index);
    return {
      left: center.x - itemSize / 2,
      top: center.y - itemSize / 2,
      width: itemSize,
      height: itemSize,
    };
  };
  const lift =
    slotCenter(layout, container.capacity, Math.max(0, topIndex)).y - liftCenter(layout).y;

  const shake = useSharedValue(0);
  const lifted = useSharedValue(0);
  const shimmer = useSharedValue(-1);

  useEffect(() => {
    if (shakeSeq === undefined || reducedMotion) return;
    // One small nudge, not a wobble: enough to say "no" without shaking the board.
    const d = slot * 0.07;
    shake.set(
      withSequence(
        withTiming(-d, { duration: 80, easing: Easing.inOut(Easing.sin) }),
        withTiming(d, { duration: 110, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 120, easing: motion.settle }),
      ),
    );
  }, [shakeSeq, reducedMotion, shake, slot]);

  useEffect(() => {
    if (reducedMotion) {
      lifted.set(selected ? 1 : 0);
      return;
    }
    lifted.set(withSpring(selected ? 1 : 0, motion.spring.lift));
  }, [selected, reducedMotion, lifted]);

  useEffect(() => {
    if (!complete || reducedMotion) return;
    shimmer.set(-1);
    shimmer.set(withTiming(1, { duration: 1100, easing: motion.travel }));
  }, [complete, reducedMotion, shimmer]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
  }));
  const liftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -lift * lifted.value }],
  }));
  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value > -1 && shimmer.value < 1 ? 1 : 0,
    transform: [{ translateY: shimmer.value * tubeHeight * 1.2 }, { rotate: '-20deg' }],
  }));

  const color = complete && container.items[0] ? getPrismColor(container.items[0].colorId) : null;
  const medallion = slot * 0.62;

  const label = container.items.length
    ? container.items.map((item) => getPrismColor(item.colorId).name).join(', ')
    : 'empty';

  return (
    // Outer view owns the entrance (crates arrive one after another when a level opens);
    // inner view owns the shake, so the two animations never fight over `transform`.
    <Animated.View
      entering={
        reducedMotion
          ? undefined
          : FadeInDown.duration(420)
              .delay(Math.min(index, 12) * 40)
              .easing(motion.settle)
      }
      style={[
        styles.container,
        { left: rect.x, top: rect.y, width: rect.width, height: rect.height },
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, containerStyle]}>
        <Pressable
          onPress={() => onPress(container.id)}
          hitSlop={{ left: gapX / 2, right: gapX / 2, top: 4, bottom: 8 }}
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel={`Prism ${index + 1}${complete ? ', complete' : ''}: ${label}`}
          accessibilityState={{ selected }}
        >
          {selected ? (
            <View
              pointerEvents="none"
              style={[
                styles.selection,
                {
                  top: liftSpace - 4,
                  width: tubeWidth + 8,
                  height: tubeHeight + 8,
                  borderRadius: tubeWidth * 0.14,
                },
              ]}
            />
          ) : null}
          <View style={[styles.crate, { top: liftSpace - 2 }]}>
            <CrateArt
              width={tubeWidth}
              height={tubeHeight}
              seed={index * 31 + 7}
              complete={color?.base}
              extra={container.isExtra}
            />
          </View>
          {color ? (
            <Animated.View
              entering={reducedMotion ? undefined : FadeInDown.duration(480).easing(motion.settle)}
              pointerEvents="none"
              style={[
                styles.medallion,
                { top: liftSpace - medallion * 0.78, left: tubeWidth / 2 - medallion / 2 },
              ]}
            >
              <CrateMedallion size={medallion} color={color.base} />
            </Animated.View>
          ) : null}

          {container.items.slice(0, -1).map((item, i) =>
            item.id === hiddenItemId ? null : (
              <View key={item.id} style={[styles.item, itemFrame(i)]}>
                <PrismItem colorId={item.colorId} size={itemSize} />
              </View>
            ),
          )}
          {topItem ? (
            // The top item lives in one persistent animated view, so the lift style is never
            // detached from a view mid-animation (which would leave a stale transform behind).
            <Animated.View key="top" style={[styles.item, itemFrame(topIndex), liftStyle]}>
              {topItem.id === hiddenItemId ? null : (
                <PrismItem colorId={topItem.colorId} size={itemSize} />
              )}
            </Animated.View>
          ) : null}

          {complete && !reducedMotion ? (
            <View
              pointerEvents="none"
              style={[
                styles.shimmerClip,
                {
                  top: liftSpace,
                  width: tubeWidth,
                  height: tubeHeight,
                  borderRadius: tubeWidth * 0.1,
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.shimmer,
                  { width: tubeWidth * 2, left: -tubeWidth / 2 },
                  shimmerStyle,
                ]}
              >
                <LinearGradient
                  colors={['rgba(255,236,170,0)', 'rgba(255,236,170,0.5)', 'rgba(255,236,170,0)']}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
          ) : null}
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: { position: 'absolute' },
  crate: {
    position: 'absolute',
    left: -2,
    // Crates sit on the wall: a firm drop shadow lifts them off the bright planks.
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 7 },
  },
  selection: {
    position: 'absolute',
    left: -4,
    borderWidth: 3,
    borderColor: colors.gold,
    backgroundColor: 'rgba(242,201,76,0.16)',
    shadowColor: colors.gold,
    shadowOpacity: 0.7,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  medallion: { position: 'absolute' },
  item: { position: 'absolute' },
  shimmerClip: { position: 'absolute', left: 0, overflow: 'hidden' },
  shimmer: { position: 'absolute', top: '-30%', height: '30%' },
});
