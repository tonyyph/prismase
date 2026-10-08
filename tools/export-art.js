#!/usr/bin/env node
/**
 * Exports every SVG-drawn asset to PNG under art-export/ (backdrops, crates, conchos, emblems,
 * doubloon, icons, wordmark, plus the plank buttons, panels and posters). Run with
 * `pnpm export:art`.
 *
 * App art comes from the real components: esbuild bundles tools/export/art.tsx with
 * react-native-svg swapped for a tiny shim that emits plain SVG tags, then resvg renders each
 * string at @3x with the game's fonts. Plank buttons and panels are React Native views in the
 * app, so those come from the approved mockup's SVG drawings (docs/design/asset-review.html).
 */
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const { Resvg } = require('@resvg/resvg-js');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'art-export');
const SCALE = 3;

const fontFiles = [
  'rye/400Regular/Rye_400Regular.ttf',
  'pirata-one/400Regular/PirataOne_400Regular.ttf',
  'bitter/500Medium/Bitter_500Medium.ttf',
  'bitter/600SemiBold/Bitter_600SemiBold.ttf',
  'bitter/700Bold/Bitter_700Bold.ttf',
].map((f) => path.join(ROOT, 'node_modules/@expo-google-fonts', f));

const renderPng = (svg, width) =>
  new Resvg(svg, {
    fitTo: { mode: 'width', value: Math.round(width * SCALE) },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: 'Bitter' },
  })
    .render()
    .asPng();

const save = (name, svg, width) => {
  const file = path.join(OUT, `${name}.png`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, renderPng(svg, width));
  return file;
};

/** Bundles and loads the app art builders. */
const loadAppArt = () => {
  const outfile = path.join(OUT, '.cache', 'art.cjs');
  esbuild.buildSync({
    entryPoints: [path.join(__dirname, 'export', 'art.tsx')],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    jsx: 'automatic',
    outfile,
    logLevel: 'error',
    alias: {
      'react-native-svg': path.join(__dirname, 'export', 'svgShim.tsx'),
      'react-native-reanimated': path.join(__dirname, 'export', 'reanimatedShim.ts'),
    },
    external: ['react'],
  });
  return require(outfile);
};

/** Pulls the SVG string builders out of the approved asset sheet. */
const loadMockupKit = () => {
  const html = fs.readFileSync(path.join(ROOT, 'docs/design/asset-review.html'), 'utf8');
  const js = html.slice(html.indexOf('<script>') + 8, html.indexOf('</script>'));
  const body = js.slice(0, js.indexOf('// ---------- render ----------'));
  const factory = new Function(
    `${body}\nreturn { plankButton, woodTile, coinPill, wanted, hangingSign, actionTile, freeTag, adStamp, planks, torn, C };`,
  );
  return factory();
};

const wrap = (w, h, inner) =>
  // The app's UI font is Bitter; the mockup was drawn with Zilla Slab before that switch.
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${inner.replace(/Zilla Slab/g, 'Bitter')}</svg>`;

const main = () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  let count = 0;

  const { buildArt } = loadAppArt();
  for (const [name, job] of Object.entries(buildArt())) {
    save(name, job.svg, job.width);
    count += 1;
  }

  const kit = loadMockupKit();
  const ui = {
    'ui/buttons/primary-ride-out': [300, 64, kit.plankButton(2, 2, 296, 56, 'Ride Out')],
    'ui/buttons/primary-blank': [300, 64, kit.plankButton(2, 2, 296, 56, '')],
    'ui/buttons/secondary-level-select': [
      300,
      60,
      kit.plankButton(2, 2, 296, 52, 'LEVEL SELECT', { variant: 'secondary' }),
    ],
    'ui/buttons/secondary-blank': [
      300,
      60,
      kit.plankButton(2, 2, 296, 52, '', { variant: 'secondary' }),
    ],
    'ui/buttons/secondary-with-ad': [
      300,
      60,
      kit.plankButton(2, 2, 296, 52, 'SKIP LEVEL', { variant: 'secondary', ad: true }),
    ],
    'ui/wood-tile': [96, 96, kit.woodTile(4, 4, 88, 84)],
    'ui/coin-pouch': [104, 44, kit.coinPill(2, 2, 52)],
    'ui/tag-free': [56, 20, kit.freeTag(2, 2, '3 FREE')],
    'ui/stamp-ad': [
      40,
      28,
      `<g transform="translate(5 16)">${kit.adStamp(0, 0).replace(/<g transform="translate\(0 0\) rotate\(-4\)">/, '<g transform="rotate(-4)">')}</g>`,
    ],
    'ui/panels/hanging-sign-paused': [300, 160, kit.hangingSign(10, 76, 280)],
    'ui/panels/wanted-poster': [
      340,
      520,
      kit.wanted(10, 14, 320, 490).replace('DOUBLE THE BOUNTY', 'DOUBLE IT'),
    ],
  };
  for (const [name, [w, h, inner]] of Object.entries(ui)) {
    save(name, wrap(w, h, inner), w);
    count += 1;
  }

  fs.rmSync(path.join(OUT, '.cache'), { recursive: true, force: true });
  console.log(`exported ${count} PNGs at @${SCALE}x to ${path.relative(process.cwd(), OUT)}/`);
};

main();
