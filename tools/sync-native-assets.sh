#!/bin/sh
# The ios/ folder is generated (it is gitignored) and only picks up app.json assets such as the
# icon and splash when prebuild runs. `expo run:ios` reuses an existing ios/ folder without
# re-running prebuild, so a new icon would never reach local builds. Re-sync after every
# `pnpm assets`. EAS builds are unaffected: .easignore excludes ios/ and EAS prebuilds fresh.
set -e
if [ -d ios ]; then
  npx expo prebuild --platform ios --no-install
fi
if [ -d android ]; then
  npx expo prebuild --platform android --no-install
fi
