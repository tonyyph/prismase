import { memo, useCallback, useMemo, useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { isContainerComplete } from '../../game/moveRules';
import type { BoardEvent, ContainerState } from '../../game/types';
import { type BoardLayout, computeBoardLayout, liftCenter, slotCenter } from './boardLayout';
import { FlyingItem } from './FlyingItem';
import { type Highlight, HintOverlay } from './HintOverlay';
import { PrismContainer } from './PrismContainer';

type Props = {
  containers: ContainerState[];
  selectedId?: string;
  lastEvent?: BoardEvent;
  highlights: Highlight[];
  pulseHighlights: boolean;
  reducedMotion: boolean;
  onTapContainer: (id: string) => void;
};

type Flight = {
  seq: number;
  colorId: string;
  hiddenItemId: string;
  hiddenIn: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
};

/** Works out the item flight for a move or undo event, in board coordinates. */
const flightFor = (
  event: BoardEvent | undefined,
  containers: ContainerState[],
  layout: BoardLayout | null,
): Flight | null => {
  if (!event || !layout || (event.kind !== 'move' && event.kind !== 'undo')) return null;
  const index = new Map(containers.map((c, i) => [c.id, i]));
  const s = index.get(event.move.sourceId);
  const t = index.get(event.move.targetId);
  if (s === undefined || t === undefined) return null;
  const source = containers[s];
  const target = containers[t];
  const sRect = layout.rects[s];
  const tRect = layout.rects[t];
  if (!sRect || !tRect) return null;

  if (event.kind === 'move') {
    const item = target.items[target.items.length - 1];
    if (!item) return null;
    const from = liftCenter(layout);
    const to = slotCenter(layout, target.capacity, target.items.length - 1);
    return {
      seq: event.seq,
      colorId: item.colorId,
      hiddenItemId: item.id,
      hiddenIn: target.id,
      from: { x: sRect.x + from.x, y: sRect.y + from.y },
      to: { x: tRect.x + to.x, y: tRect.y + to.y },
    };
  }
  // Undo: the item has already returned to the source; fly it back from the target.
  const item = source.items[source.items.length - 1];
  if (!item) return null;
  const from = slotCenter(layout, target.capacity, target.items.length);
  const to = slotCenter(layout, source.capacity, source.items.length - 1);
  return {
    seq: event.seq,
    colorId: item.colorId,
    hiddenItemId: item.id,
    hiddenIn: source.id,
    from: { x: tRect.x + from.x, y: tRect.y + from.y },
    to: { x: sRect.x + to.x, y: sRect.y + to.y },
  };
};

export const PrismBoard = memo(function PrismBoard({
  containers,
  selectedId,
  lastEvent,
  highlights,
  pulseHighlights,
  reducedMotion,
  onTapContainer,
}: Props) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  // Events that happened before this board mounted (e.g. returning from Settings) never animate.
  const [doneSeq, setDoneSeq] = useState(lastEvent?.seq ?? 0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) =>
      prev && Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1
        ? prev
        : { width, height },
    );
  }, []);

  const capacity = containers[0]?.capacity ?? 4;
  const layout = useMemo(
    () => (size ? computeBoardLayout(containers.length, capacity, size.width, size.height) : null),
    [size, containers.length, capacity],
  );

  const flight =
    !reducedMotion && lastEvent && lastEvent.seq > doneSeq
      ? flightFor(lastEvent, containers, layout)
      : null;
  const finishFlight = useCallback(
    () => setDoneSeq((s) => Math.max(s, lastEvent?.seq ?? s)),
    [lastEvent?.seq],
  );

  const rectFor = useCallback(
    (id: string) => {
      const i = containers.findIndex((c) => c.id === id);
      return i >= 0 ? layout?.rects[i] : undefined;
    },
    [containers, layout],
  );

  const shakeTarget = lastEvent?.kind === 'invalid' ? lastEvent : null;

  return (
    <View style={styles.board} onLayout={onLayout}>
      {layout ? (
        <>
          <HintOverlay
            highlights={highlights}
            rectFor={rectFor}
            layout={layout}
            pulse={pulseHighlights}
          />
          {containers.map((container, i) => (
            <PrismContainer
              key={container.id}
              container={container}
              index={i}
              rect={layout.rects[i]}
              layout={layout}
              selected={container.id === selectedId}
              complete={isContainerComplete(container)}
              hiddenItemId={flight?.hiddenIn === container.id ? flight.hiddenItemId : undefined}
              shakeSeq={shakeTarget?.containerId === container.id ? shakeTarget.seq : undefined}
              reducedMotion={reducedMotion}
              onPress={onTapContainer}
            />
          ))}
          {flight ? (
            <FlyingItem
              key={flight.seq}
              colorId={flight.colorId}
              size={layout.slot * 0.88}
              from={flight.from}
              to={flight.to}
              onDone={finishFlight}
            />
          ) : null}
        </>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  board: { flex: 1, alignSelf: 'stretch' },
});
