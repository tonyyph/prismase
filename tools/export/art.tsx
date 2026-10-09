/**
 * Every SVG-built asset in the app, as SVG strings keyed by output path. Built from the app's
 * own art components (not copies), so the exported PNGs match what the game draws.
 */
import Svg from 'react-native-svg';

import { CrateArt, CrateMedallion } from '../../src/components/art/CrateArt';
import { Doubloon } from '../../src/components/art/Doubloon';
import { Emblem } from '../../src/components/art/Emblem';
import { WesternIcon, type WesternIconName } from '../../src/components/art/WesternIcon';
import { PrismItem } from '../../src/components/game/PrismItem';
import { Ribbon, Wordmark } from '../../src/components/ui/Wordmark';
import { PRISM_COLORS } from '../../src/game/constants';
import { colors } from '../../src/theme';
import { toSvg } from './serialize';

export type ArtJob = { svg: string; width: number; height: number };

const ICONS: WesternIconName[] = [
  'undo',
  'hint',
  'extra',
  'restart',
  'pause',
  'settings',
  'map',
  'chest',
  'help',
  'back',
  'play',
  'skip',
  'home',
  'lock',
  'star',
  'sound',
  'haptics',
  'motion',
  'trash',
  'arrow',
];

/** Point sizes; the driver renders each at @3x. */
export const buildArt = (): Record<string, ArtJob> => {
  const jobs: Record<string, ArtJob> = {};
  const add = (name: string, node: Parameters<typeof toSvg>[0], width: number, height: number) => {
    jobs[name] = { svg: toSvg(node), width, height };
  };

  // Crates: the board's typical slot is ~59 pt, which makes a 78 × 278 pt crate.
  const cw = 78;
  const ch = 278;
  add('crates/crate', <CrateArt width={cw} height={ch} seed={7} />, cw + 4, ch + 4);
  add('crates/crate-extra', <CrateArt width={cw} height={ch} seed={7} extra />, cw + 4, ch + 4);
  for (const c of PRISM_COLORS) {
    add(
      `crates/crate-complete-${c.id}`,
      <CrateArt width={cw} height={ch} seed={7} complete={c.base} />,
      cw + 4,
      ch + 4,
    );
    add(`crates/medallion-${c.id}`, <CrateMedallion size={64} color={c.base} />, 64, 64);
  }

  // Pieces and their emblems.
  PRISM_COLORS.forEach((c, i) => {
    const n = String(i + 1).padStart(2, '0');
    add(`pieces/${n}-${c.id}-concho`, <PrismItem colorId={c.id} size={96} />, 96, 96);
    for (const [tone, fill] of [
      ['cream', colors.textPrimary],
      ['ink', colors.ink],
    ] as const) {
      add(
        `pieces/emblems/${n}-${c.icon}-${tone}`,
        <Svg viewBox="0 0 100 100" width={96} height={96}>
          <Emblem name={c.icon} fill={fill} accent="none" />
        </Svg>,
        96,
        96,
      );
    }
  });

  // Currency, icons, wordmark.
  add('ui/doubloon', <Doubloon size={96} />, 96, 96);
  for (const name of ICONS) {
    add(
      `ui/icons/cream/${name}`,
      <WesternIcon name={name} size={48} color={colors.textPrimary} />,
      48,
      48,
    );
    add(`ui/icons/ink/${name}`, <WesternIcon name={name} size={48} color={colors.ink} />, 48, 48);
  }
  add('ui/wordmark', <Wordmark width={340} />, 340, Math.round(340 * 0.27));
  add(
    'ui/ribbon-sort-the-spectrum',
    <Ribbon label="SORT THE SPECTRUM" width={260} />,
    260,
    Math.round((260 * 40) / 290),
  );
  return jobs;
};
