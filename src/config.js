// AdMob configuration.
// Release builds use the real Glow Sort ad units. Builds made with
// VITE_TEST_ADS=1 (the debug APK, see `npm run android:debug`) use Google's
// official test units instead, so the developer can play without risking
// invalid clicks on real ads.
// The AdMob *App ID* lives in android/app/src/main/res/values/strings.xml.

export const USE_TEST_ADS = import.meta.env.VITE_TEST_ADS === '1';

const TEST_IDS = {
  banner: 'ca-app-pub-3940256099942544/9214589741',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
};

const REAL_IDS = {
  banner: 'ca-app-pub-7357503997373423/1853006203',
  interstitial: 'ca-app-pub-7357503997373423/8960591609',
  rewarded: 'ca-app-pub-7357503997373423/4199219518',
};

export const AD_IDS = USE_TEST_ADS ? TEST_IDS : REAL_IDS;

// Interstitial pacing: never before this level, at most every N wins, and
// never twice within the cooldown.
export const INTERSTITIAL_FROM_LEVEL = 4;
export const INTERSTITIAL_EVERY = 3;
export const INTERSTITIAL_COOLDOWN_MS = 90_000;

export const PRIVACY_URL = 'https://osamaamrh.github.io/osama/privacy.html';
