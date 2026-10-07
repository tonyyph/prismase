import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { getPrismColor } from '../../game/constants';
import type { ContainerState } from '../../game/types';
import { colors } from '../../theme';
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
  const scale = useSharedValue(1);
  const lifted = useSharedValue(0);
  const shimmer = useSharedValue(-1);

  useEffect(() => {
    if (shakeSeq === undefined || reducedMotion) return;
    const d = slot * 0.14;
    shake.set(
      withSequence(
        withTiming(-d, { duration: 45 }),
        withTiming(d, { duration: 70 }),
        withTiming(-d * 0.6, { duration: 60 }),
        withTiming(d * 0.4, { duration: 50 }),
        withTiming(0, { duration: 45 }),
      ),
    );
  }, [shakeSeq, reducedMotion, shake, slot]);

  useEffect(() => {
    const spring = { damping: 15, stiffness: 260 };
    if (reducedMotion) {
      scale.set(1);
      lifted.set(selected ? 1 : 0);
      return;
    }
    scale.set(withSpring(selected ? 1.03 : 1, spring));
    lifted.set(withSpring(selected ? 1 : 0, spring));
  }, [selected, reducedMotion, scale, lifted]);

  useEffect(() => {
    if (!complete || reducedMotion) return;
    shimmer.set(-1);
    shimmer.set(withTiming(1, { duration: 900, easing: Easing.out(Easing.quad) }));
  }, [complete, reducedMotion, shimmer]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }, { scale: scale.value }],
  }));
  const liftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -lift * lifted.value }],
  }));
  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: shimmer.value > -1 && shimmer.value < 1 ? 1 : 0,
    transform: [{ translateY: shimmer.value * tubeHeight * 1.2 }, { rotate: '-20deg' }],
  }));

  const color = complete && container.items[0] ? getPrismColor(container.items[0].colorId) : null;
  const borderColor = selected
    ? colors.cyan
    : color
      ? color.base
      : container.isExtra
        ? 'rgba(167,139,250,0.45)'
        : 'rgba(255,255,255,0.20)';

  const label = container.items.length
    ? container.items.map((item) => getPrismColor(item.colorId).name).join(', ')
    : 'empty';

  return (
    <Animated.View
      style={[
        styles.container,
        { left: rect.x, top: rect.y, width: rect.width, height: rect.height },
        containerStyle,
      ]}
    >
      <Pressable
        onPress={() => onPress(container.id)}
        hitSlop={{ left: gapX / 2, right: gapX / 2, top: 4, bottom: 8 }}
        style={StyleSheet.absoluteFill}
        accessibilityRole="button"
        accessibilityLabel={`Prism ${index + 1}${complete ? ', complete' : ''}: ${label}`}
        accessibilityState={{ selected }}
      >
        <View
          style={[
            styles.tube,
            {
              top: liftSpace,
              width: tubeWidth,
              height: tubeHeight,
              borderColor,
              borderTopLeftRadius: tubeWidth * 0.22,
              borderTopRightRadius: tubeWidth * 0.22,
              borderBottomLeftRadius: tubeWidth / 2,
              borderBottomRightRadius: tubeWidth / 2,
              backgroundColor: color ? `${color.base}1F` : 'rgba(255,255,255,0.045)',
              shadowColor: selected ? colors.cyan : (color?.base ?? '#000'),
              shadowOpacity: selected || color ? 0.75 : 0,
              shadowRadius: selected ? 14 : 10,
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.16)', 'rgba(255,255,255,0.0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.sheen, { width: tubeWidth * 0.32 }]}
          />
          <View
            style={[
              styles.rim,
              { width: tubeWidth * 0.62, left: tubeWidth * 0.19 - 1.5 },
              selected && { backgroundColor: 'rgba(34,211,238,0.6)' },
            ]}
          />
        </View>

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
                borderBottomLeftRadius: tubeWidth / 2,
                borderBottomRightRadius: tubeWidth / 2,
              },
            ]}
          >
            <Animated.View
              style={[styles.shimmer, { width: tubeWidth * 2, left: -tubeWidth / 2 }, shimmerStyle]}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.45)', 'rgba(255,255,255,0)']}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: { position: 'absolute' },
  tube: {
    position: 'absolute',
    left: 0,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
  },
  sheen: { position: 'absolute', left: 3, top: 6, bottom: 12, borderRadius: 8 },
  rim: {
    position: 'absolute',
    top: -3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  item: { position: 'absolute' },
  shimmerClip: { position: 'absolute', left: 0, overflow: 'hidden' },
  shimmer: { position: 'absolute', top: '-30%', height: '30%' },
});
