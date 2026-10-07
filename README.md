# Prismase

**Sort the spectrum.** Prismase is a premium casual colour-sort puzzle for iOS and Android. Tap a
glass prism to lift its top crystal, tap another to place it, and fill every prism with four of
a kind. Offline, no account, levels generated on demand, monetised with player-initiated
rewarded ads and lightly paced interstitials.

## Tech stack

| Area      | Choice                                                                |
| --------- | --------------------------------------------------------------------- |
| App       | Expo SDK 57, React Native 0.86, TypeScript 6 (strict), React Compiler |
| State     | Zustand store wrapping a pure level reducer                           |
| Animation | React Native Reanimated 4                                             |
| Graphics  | react-native-svg (crystals, logo), expo-linear-gradient               |
| Storage   | AsyncStorage (versioned keys, sanitised on read)                      |
| Feedback  | expo-haptics, expo-audio (generated WAVs)                             |
| Fonts     | Sora (display), Manrope (UI)                                          |
| Quality   | Jest (jest-expo), ESLint (eslint-config-expo + Prettier)              |

## Getting started

Requires Node 22 and pnpm 10 (`corepack enable`). The project uses pnpm's hoisted linker
(`pnpm-workspace.yaml`), which React Native autolinking needs.

```bash
pnpm install
pnpm start            # Metro; press i / a, or scan with Expo Go (SDK 57)
```

### iOS

```bash
pnpm start            # then press i, or open exp://127.0.0.1:8081 in the simulator's Expo Go
pnpm ios              # native debug build (needs Xcode)
```

### Android

```bash
pnpm start            # then press a
pnpm android          # native debug build (needs Android Studio / SDK)
```

## Checks

```bash
pnpm test             # 110+ unit and integration tests
pnpm typecheck        # tsc --noEmit
pnpm lint             # expo lint (ESLint + Prettier)
pnpm verify           # all three
```

## Project structure

```txt
src/
  app/            App, AppProvider (fonts, boot, feedback), AppNavigator (status-driven)
  screens/        Boot, MainMenu, LevelSelect, Game, Settings, HowToPlay
  components/
    game/         PrismBoard, PrismContainer, PrismItem, FlyingItem, HintOverlay,
                  GameActionBar, TutorialCoach, boardLayout (pure geometry)
    overlays/     PauseModal, LevelCompleteModal, PurchaseSheet, ConfirmResetModal,
                  MockAdOverlay, Confetti, ModalShell
    ui/           AppButton, AppText, GlassPanel, Screen, IconButton, ToggleRow,
                  CoinPill, LogoMark, Wordmark, Backdrop, Toast, AdBadge
  game/           Pure logic: types, constants, levelConfig, levelGenerator,
                  moveRules, solverValidator, hint, reducer, economy, progress, selectors
  services/
    ads/          adTypes, adService (provider switch), mockAdService,
                  admobAdService (TODO), adFrequency (pure pacing rules)
    storage/      storageKeys, jsonStorage, progressStorage, settingsStorage
  store/          gameStore: wires reducer + economy + ads + persistence
  hooks/          usePrismaseGame, useHaptics, useSoundEffects, usePersistedSettings, useAds
  theme/          colors, spacing, typography, shadows
  utils/          seedRandom, shuffle, clamp, time
  dev/            devLinks: __DEV__-only deep links for QA
tools/            generate-assets.js (icons/splash), generate-sounds.js (WAVs)
```

Rules of the codebase: **game logic never imports React**, **ads never touch game state
directly** (the store asks the ad service, then applies the reward), **components never touch
storage** (the store persists), and **colours/spacing/type come from `src/theme`**.

## How the game works

- **Rules** (`game/moveRules.ts`): one crystal moves per tap; a move needs a non-empty source,
  a different target with room, and an empty target or a matching top colour. A prism is
  complete when it holds four of one colour; a level is complete when every non-empty prism is.
- **Levels** (`game/levelConfig.ts`, `game/levelGenerator.ts`): the brief's curve (3 colours at
  level 1 up to 12 at level 211+, 2 or 3 empty prisms). Each level is seeded (`prismase-<n>`),
  so it is identical on every device. The generator deals full stacks at random and keeps the
  first deal the solver proves solvable, has no pre-completed prism and is not already solved.
  If 25 deals fail it falls back to scrambling a solved board with reverse legal moves, which
  is solvable by construction. Tests check all of levels 1-300; the slowest takes ~40 ms.
- **Hint** (`game/hint.ts`): asks the solver for a move that keeps the board solvable; if the
  board is already lost, falls back to: complete a prism → same colour on same colour → useful
  empty prism → any legal move.
- **Tutorial**: levels 1-3, one short line plus a glowing prism. Finishing level 3 sets
  `tutorialCompleted`.

## Economy

|                            | Coins                                               |
| -------------------------- | --------------------------------------------------- |
| Win a new level            | +10                                                 |
| Replay a cleared level     | +2                                                  |
| Double coins (rewarded ad) | ×2 the level's reward                               |
| Daily reward               | +25 per local day                                   |
| Hint                       | 20 or rewarded ad (1 free per level on levels 1-20) |
| Undo                       | 10 or rewarded ad (3 free per level)                |
| Extra prism                | 40 or rewarded ad (max 1 per level)                 |
| Skip level                 | rewarded ad only, no coins                          |

Charging order is: free per-level quota → banked boosters (`hints` / `undos` / `extraPrisms`
in progress, for future rewards) → a sheet offering coins or a rewarded ad. No IAP, no
subscription.

## Ads architecture

```txt
UI ──► gameStore ──► AdService (interface) ──► MockAdService   (default)
            │                               └─► AdMobAdService  (TODO stubs)
            └──► adFrequency.ts (pure pacing rules, persisted)
```

- `services/ads/adTypes.ts` defines `AdPlacement` and `AdService` exactly as specified.
- `MockAdService` shows a full-screen placeholder (`MockAdOverlay`) with a countdown. Rewarded
  ads pay out only if watched to the end. In tests it resolves immediately.
- `adFrequency.ts`: no interstitials before level 6; then at most one per 3 wins, at least 90 s
  apart, never within 60 s of a rewarded ad; restart interstitial after 4 restarts with the
  same caps. Interstitials only appear at transitions (Continue after a win, Restart), never
  mid-move. Rewarded ads only run when the player taps an ad option. No banners, no app-open ads.
- **Going live:** follow the numbered TODO at the top of `admobAdService.ts`, then set
  `EXPO_PUBLIC_ADS_PROVIDER=admob`. Update `PRIVACY.md` and the store privacy labels first.

## Assets

Icons, splash and sounds are generated, never hand-edited:

```bash
pnpm assets           # assets/icon.png, android-icon-*, splash-icon.png, favicon.png
pnpm sounds           # assets/sounds/*.wav
```

The mark is the same six-facet crystal as `LogoMark.tsx`. Opaque icons are written as RGB
without alpha (App Store requirement).

## Dev deep links (debug builds only)

`src/dev/devLinks.ts` lets you drive the app from a terminal without tapping, which is handy
for screenshots and QA:

```bash
xcrun simctl openurl booted "exp://127.0.0.1:8081/--/dev?unlock=150&level=150"
xcrun simctl openurl booted "exp://127.0.0.1:8081/--/dev?taps=c0,c3&action=hint"
xcrun simctl openurl booted "exp://127.0.0.1:8081/--/dev?action=solve"   # win the level
xcrun simctl openurl booted "exp://127.0.0.1:8081/--/dev?ad=claim"       # finish mock ad
```

The listener is only registered when `__DEV__` is true.

## Release

See [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md), [PRIVACY.md](PRIVACY.md) and the store copy in
[docs/STORE_LISTING.md](docs/STORE_LISTING.md).
