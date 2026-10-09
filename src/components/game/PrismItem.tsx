import { memo } from 'react';
import { Image } from 'react-native';

import { PIECE_ART } from '../../game/pieceArt';

type Props = { colorId: string; size: number };

/**
 * One playing piece: Tony's painted brass medallion with an enamel face and a raised
 * emblem. The art's brass points reach the edge of its square, so its disc reads small;
 * it is scaled up a little (the points may overhang the slot).
 */
export const PrismItem = memo(function PrismItem({ colorId, size }: Props) {
  return (
    <Image
      source={PIECE_ART[colorId]}
      style={{ width: size, height: size, transform: [{ scale: 1.12 }] }}
      fadeDuration={0}
    />
  );
});
