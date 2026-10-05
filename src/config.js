// AdMob configuration.
// Until the real AdMob account is ready the game uses Google's official test
// ad units, which are safe to click. Replace the IDs below with the ones from
// your AdMob dashboard and set USE_TEST_ADS to false before a release build.
// The AdMob *App ID* also lives in android/app/src/main/res/values/strings.xml.

export const USE_TEST_ADS = true;

const TEST_IDS = {
  banner: 'ca-app-pub-3940256099942544/9214589741',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
};

const REAL_IDS = {
  banner: 'ca-app-pub-7357503997373423/1853006203',
  interstitial: 'ca-app-pub-7357503997373423/8960591609',
  rewarded: 'ca-app-pub-7357503997373423/XXXXXXXXXX',
};

export const AD_IDS = USE_TEST_ADS ? TEST_IDS : REAL_IDS;

// Interstitial pacing: never before this level, at most every N wins, and
// never twice within the cooldown.
export const INTERSTITIAL_FROM_LEVEL = 4;
export const INTERSTITIAL_EVERY = 3;
export const INTERSTITIAL_COOLDOWN_MS = 90_000;

export const PRIVACY_URL = 'https://osamaamrh.github.io/osama/privacy.html';
