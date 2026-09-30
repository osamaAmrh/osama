// AdMob wrapper. On Android it uses the real SDK; in a desktop browser it
// shows a short fake ad so the reward flows can be tested without a phone.
import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  AdmobConsentStatus,
  BannerAdPluginEvents,
  BannerAdPosition,
  BannerAdSize,
  RewardAdPluginEvents,
} from '@capacitor-community/admob';
import {
  AD_IDS,
  INTERSTITIAL_COOLDOWN_MS,
  INTERSTITIAL_EVERY,
  INTERSTITIAL_FROM_LEVEL,
  USE_TEST_ADS,
} from './config.js';

const native = Capacitor.isNativePlatform();
let ready = false;
let canRequest = false;
let privacyRequired = false;
let interstitialLoaded = false;
let rewardedLoaded = false;
let lastFullscreenAt = 0;
let winsSinceInterstitial = 0;

function setBannerHeight(px) {
  document.documentElement.style.setProperty('--banner-h', `${Math.ceil(px)}px`);
  window.dispatchEvent(new Event('resize'));
}

export async function initAds() {
  if (!native) {
    ready = canRequest = true;
    setBannerHeight(50);
    document.body.classList.add('fake-banner');
    return;
  }
  try {
    await AdMob.initialize({ initializeForTesting: USE_TEST_ADS });
    let info = await AdMob.requestConsentInfo();
    if (info.isConsentFormAvailable && info.status === AdmobConsentStatus.REQUIRED) {
      info = await AdMob.showConsentForm();
    }
    canRequest = info.canRequestAds !== false;
    privacyRequired = info.privacyOptionsRequirementStatus === 'REQUIRED';
  } catch (e) {
    console.warn('AdMob init/consent failed', e);
    canRequest = true;
  }
  ready = true;
  if (!canRequest) return;

  AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size) => setBannerHeight(size.height || 0));

  showBanner();
  preloadInterstitial();
  preloadRewarded();
}

export function isPrivacyOptionsRequired() {
  return privacyRequired;
}

export async function showPrivacyOptions() {
  if (!native) return;
  try {
    await AdMob.showPrivacyOptionsForm();
  } catch (e) {
    console.warn(e);
  }
}

async function showBanner() {
  try {
    await AdMob.showBanner({
      adId: AD_IDS.banner,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: USE_TEST_ADS,
    });
  } catch (e) {
    console.warn('banner failed', e);
  }
}

async function preloadInterstitial() {
  if (!native || !canRequest || interstitialLoaded) return;
  try {
    await AdMob.prepareInterstitial({ adId: AD_IDS.interstitial, isTesting: USE_TEST_ADS });
    interstitialLoaded = true;
  } catch {
    interstitialLoaded = false;
  }
}

async function preloadRewarded() {
  if (!native || !canRequest || rewardedLoaded) return;
  try {
    await AdMob.prepareRewardVideoAd({ adId: AD_IDS.rewarded, isTesting: USE_TEST_ADS });
    rewardedLoaded = true;
  } catch {
    rewardedLoaded = false;
  }
}

function fakeAd(label) {
  return new Promise((resolve) => {
    const el = document.createElement('div');
    el.className = 'fake-ad';
    el.textContent = `${label} (test ad)`;
    document.body.appendChild(el);
    setTimeout(() => {
      el.remove();
      resolve();
    }, 1200);
  });
}

// Called after every level win; shows an interstitial when pacing allows.
export async function maybeInterstitial(level) {
  winsSinceInterstitial++;
  if (!ready || !canRequest) return;
  if (level < INTERSTITIAL_FROM_LEVEL) return;
  if (winsSinceInterstitial < INTERSTITIAL_EVERY) return;
  if (Date.now() - lastFullscreenAt < INTERSTITIAL_COOLDOWN_MS) return;
  if (native && !interstitialLoaded) {
    preloadInterstitial();
    return;
  }
  winsSinceInterstitial = 0;
  lastFullscreenAt = Date.now();
  if (!native) return fakeAd('Interstitial');
  try {
    interstitialLoaded = false;
    await AdMob.showInterstitial();
  } catch (e) {
    console.warn(e);
  } finally {
    preloadInterstitial();
  }
}

// Resolves true only if the player watched the rewarded ad to the end.
export async function showRewarded() {
  if (!ready || !canRequest) return false;
  if (!native) {
    await fakeAd('Rewarded');
    lastFullscreenAt = Date.now();
    return true;
  }
  if (!rewardedLoaded) {
    await preloadRewarded();
    if (!rewardedLoaded) return false;
  }
  rewardedLoaded = false;
  // showRewardVideoAd() only resolves when a reward is earned, so completion
  // is tracked through the Dismissed / FailedToShow events instead.
  return new Promise((resolve) => {
    let rewarded = false;
    let finished = false;
    const subs = [];
    const done = () => {
      if (finished) return;
      finished = true;
      subs.forEach((s) => s.remove());
      lastFullscreenAt = Date.now();
      preloadRewarded();
      resolve(rewarded);
    };
    Promise.all([
      AdMob.addListener(RewardAdPluginEvents.Rewarded, () => (rewarded = true)),
      AdMob.addListener(RewardAdPluginEvents.Dismissed, done),
      AdMob.addListener(RewardAdPluginEvents.FailedToShow, done),
    ]).then((handles) => {
      subs.push(...handles);
      AdMob.showRewardVideoAd()
        .then(() => (rewarded = true))
        .catch(done);
    });
  });
}

