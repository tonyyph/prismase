/**
 * Every SVG-built asset in the app, as SVG strings keyed by output path. Built from the app's
 * own art components (not copies), so the exported PNGs match what the game draws.
 */

import { CrateMedallion } from '../../src/components/art/CrateMedallion';
import { Doubloon } from '../../src/components/art/Doubloon';
import { WesternIcon, type WesternIconName } from '../../src/components/art/WesternIcon';
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

  // Crates are Tony's painted art now (assets/crate); only the medallions are SVG.
  for (const c of PRISM_COLORS) {
    add(`crates/medallion-${c.id}`, <CrateMedallion size={64} color={c.base} />, 64, 64);
  }

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
