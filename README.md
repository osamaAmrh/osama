# Glow Sort – Ball Sort Puzzle

A mobile ball-sort puzzle game for Android, built with HTML5/JavaScript + [Capacitor](https://capacitorjs.com), monetized with Google AdMob (banner, interstitial, rewarded).

📘 **Arabic step-by-step publishing guide:** [PUBLISHING_GUIDE_AR.md](PUBLISHING_GUIDE_AR.md)

## Project layout

| Path | What it is |
|---|---|
| `src/engine.js` | Pure game rules, solver and level generator |
| `src/levels.json` | 2000 precomputed, verified-solvable levels (`npm run levels`) |
| `src/main.js` | UI, gameplay, screens, coins, themes, daily gift |
| `src/ads.js` | AdMob wrapper (consent, banner, interstitial pacing, rewarded) |
| `src/config.js` | **Ad unit IDs** and pacing – switch `USE_TEST_ADS` off for release |
| `android/` | Native Android project (Capacitor) |
| `assets/` | Icon & splash sources (`node scripts/render-art.cjs`, then `npx capacitor-assets generate --android`) |
| `store/` | Play Store texts and graphics |
| `docs/` | Privacy policy + `app-ads.txt`, served with GitHub Pages |

## Develop

```bash
npm install
npm run dev        # play in the browser (ads are simulated)
npm test           # rules + verifies every level is solvable
```

## Build for Android

Requirements: JDK 21, Android SDK 36.

```bash
npm run build && npx cap sync android
cd android
./gradlew assembleDebug     # app/build/outputs/apk/debug/app-debug.apk
./gradlew bundleRelease     # app/build/outputs/bundle/release/app-release.aab
```

Release signing reads `android/keystore.properties` (never committed):

```
storeFile=glowsort-upload.jks
storePassword=...
keyAlias=upload
keyPassword=...
```

The GitHub Actions workflow builds the same outputs; add repository secrets `KEYSTORE_BASE64` and `KEYSTORE_PASSWORD` to get a signed bundle.

## Going live with real ads

1. `src/config.js`: set the three real ad unit IDs and `USE_TEST_ADS = false`.
2. `android/app/src/main/res/values/strings.xml`: set `admob_app_id` to the real AdMob App ID.
3. Bump `versionCode` / `versionName` in `android/app/build.gradle`, rebuild the `.aab`.
