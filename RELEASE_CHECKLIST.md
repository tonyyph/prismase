# Prismase release checklist (v1.0.0)

## Identity and config

- [ ] Replace bundle ids `com.yourcompany.prismase` (iOS and Android) in `app.json` with the real
      reverse-DNS id, and check it is free in App Store Connect / Play Console.
- [ ] Set `owner` and run `eas init` to add `extra.eas.projectId` to `app.json`.
- [ ] Version `1.0.0`, iOS `buildNumber` 1, Android `versionCode` 1 (EAS `autoIncrement` is on
      for production builds).
- [ ] Portrait only; `supportsTablet: false` (decide whether iPad should be supported).
- [ ] Remove or keep the dev deep links: they are `__DEV__`-only and inert in release builds.

## Assets

- [ ] `pnpm assets` and `pnpm sounds` run clean; icon.png is 1024×1024 RGB (no alpha).
- [ ] Android adaptive icon checked under circle and squircle masks; monochrome layer present.
- [ ] Splash checked on a small (iPhone SE) and a large (Pro Max) device.
- [ ] Store screenshots: 6.9" and 6.5" iPhone; Android phone. Menu, early level, mid level,
      level complete, level select.

## Quality gates

- [ ] `pnpm verify` (typecheck, lint, tests) passes.
- [ ] `npx expo-doctor` reports no issues.
- [ ] Release build on a real iPhone and a real Android phone (`eas build --profile preview`).
- [ ] Play levels 1-6 from a fresh install: tutorial appears on 1-3 only; no ads before level 6.
- [ ] Kill and relaunch mid-game: progress, coins and settings persist.
- [ ] Sound, haptics, reduced motion and hint animation toggles all take effect.
- [ ] Hint, undo (free → coins/ad), extra prism (once), restart, skip (ad) all work.
- [ ] VoiceOver / TalkBack read prism contents and button labels.
- [ ] Airplane mode: the whole game works.

## Ads (only if shipping real ads in this version)

- [ ] Implement `AdMobAdService` (see TODO list in the file) and set `EXPO_PUBLIC_ADS_PROVIDER=admob`.
- [ ] Real ad unit ids in production builds, test ids in development.
- [ ] UMP consent flow for EEA/UK; ATT prompt on iOS if using IDFA.
- [ ] Update `PRIVACY.md`, App Store privacy nutrition label, Play Data safety form, and
      `privacyManifests` in `app.json` (AdMob ships its own manifest).
- [ ] Verify pacing on device: interstitial at most every 3 wins and 90 s, never after a rewarded ad.
- [ ] Add `app-ads.txt` to the developer website.

## Store

- [ ] Copy from `docs/STORE_LISTING.md`.
- [ ] Privacy policy URL (host `PRIVACY.md`) and support URL.
- [ ] Age rating questionnaire (no violence; ads: "contains ads" once real ads ship).
- [ ] iOS: export compliance answered (`usesNonExemptEncryption: false`).
- [ ] Android: content rating, target audience, Data safety (no data collected in v1).

## Build and submit

```bash
eas build --platform ios --profile production
eas build --platform android --profile production
eas submit --platform ios --latest
eas submit --platform android --latest
```
