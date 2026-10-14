const STRINGS = {
  en: {
    title: 'Glow Sort',
    subtitle: 'Ball Sort Puzzle',
    play: 'Play',
    level: 'Level',
    undo: 'Undo',
    restart: 'Restart',
    addTube: '+Tube',
    hint: 'Hint',
    shop: 'Themes',
    settings: 'Settings',
    sound: 'Sound',
    vibration: 'Vibration',
    colorblind: 'Color-blind symbols',
    language: 'Language',
    privacy: 'Privacy policy',
    privacyOptions: 'Ad privacy options',
    close: 'Close',
    on: 'On',
    off: 'Off',
    levelComplete: 'Level complete!',
    next: 'Next',
    claimX3: 'Claim ×3',
    coinsEarned: 'coins earned',
    stuckTitle: 'No moves left',
    stuckText: 'Undo a few moves, add an extra tube, or start over.',
    tryAgain: 'Restart',
    dailyTitle: 'Daily gift',
    dailyText: 'Come back every day for free coins!',
    collect: 'Collect',
    collectX2: 'Collect ×2',
    owned: 'Owned',
    use: 'Use',
    inUse: 'In use',
    notEnough: 'Not enough coins',
    adUnavailable: 'No ad available right now. Try again later.',
    tubeAdded: 'Extra tube added!',
    tubeLimit: 'Only one extra tube per level',
    undosAdded: '+5 undos',
    noHint: 'No solution from here, try undo',
    tapToPlay: 'Tap a tube, then tap where the ball should go',
    watchAd: 'Watch ad',
    adUnavailableTitle: 'No ad available',
    payWithCoins: 'Ads are not available right now. Use {n} coins instead?',
    useCoins: 'Use {n} coins',
    cancel: 'Cancel',
    chooseLanguage: 'Choose language',
    languageBoth: 'Language / اللغة',
    howTo: 'How to play',
    skip: 'Skip',
    letsPlay: "Let's play!",
    step1Title: 'Pick up a ball',
    step1Text: 'Tap a tube to lift its top ball.',
    step2Title: 'Drop it',
    step2Text: 'Tap another tube to place it there. The tube must be empty, or have the same color on top.',
    step3Title: 'Sort every color',
    step3Text: 'Fill each tube with a single color to finish the level. Stuck? Use Undo, Hint or an extra tube.',
    themeNames: ['Midnight', 'Ocean', 'Sunset', 'Forest', 'Candy', 'Galaxy'],
  },
  ar: {
    title: 'جلو سورت',
    subtitle: 'لغز ترتيب الكرات',
    play: 'العب',
    level: 'المرحلة',
    undo: 'تراجع',
    restart: 'إعادة',
    addTube: 'أنبوب',
    hint: 'تلميح',
    shop: 'الثيمات',
    settings: 'الإعدادات',
    sound: 'الصوت',
    vibration: 'الاهتزاز',
    colorblind: 'رموز لعمى الألوان',
    language: 'اللغة',
    privacy: 'سياسة الخصوصية',
    privacyOptions: 'خيارات خصوصية الإعلانات',
    close: 'إغلاق',
    on: 'تشغيل',
    off: 'إيقاف',
    levelComplete: 'أحسنت! المرحلة اكتملت',
    next: 'التالي',
    claimX3: 'اجمع ×3',
    coinsEarned: 'عملة',
    stuckTitle: 'لا توجد حركات',
    stuckText: 'تراجع عن بعض الحركات، أو أضف أنبوباً إضافياً، أو ابدأ من جديد.',
    tryAgain: 'إعادة',
    dailyTitle: 'الهدية اليومية',
    dailyText: 'ارجع كل يوم لتحصل على عملات مجانية!',
    collect: 'اجمع',
    collectX2: 'اجمع ×2',
    owned: 'مملوك',
    use: 'استخدم',
    inUse: 'مستخدم',
    notEnough: 'العملات غير كافية',
    adUnavailable: 'لا يوجد إعلان متاح الآن. حاول لاحقاً.',
    tubeAdded: 'تمت إضافة أنبوب!',
    tubeLimit: 'أنبوب إضافي واحد فقط لكل مرحلة',
    undosAdded: '+5 تراجع',
    noHint: 'لا يوجد حل من هنا، جرّب التراجع',
    tapToPlay: 'اضغط على أنبوب، ثم على المكان الذي تريد نقل الكرة إليه',
    watchAd: 'شاهد إعلان',
    adUnavailableTitle: 'لا يوجد إعلان متاح',
    payWithCoins: 'الإعلانات غير متاحة حالياً. هل تريد استخدام {n} عملة بدلاً منها؟',
    useCoins: 'استخدم {n} عملة',
    cancel: 'إلغاء',
    chooseLanguage: 'اختر اللغة',
    languageBoth: 'Language / اللغة',
    howTo: 'طريقة اللعب',
    skip: 'تخطي',
    letsPlay: 'هيا نلعب!',
    step1Title: 'ارفع كرة',
    step1Text: 'اضغط على أنبوب لرفع الكرة العلوية.',
    step2Title: 'ضعها في أنبوب آخر',
    step2Text: 'اضغط على أنبوب آخر لوضعها فيه. يجب أن يكون الأنبوب فارغاً أو أن تكون الكرة العلوية فيه بنفس اللون.',
    step3Title: 'رتّب كل الألوان',
    step3Text: 'املأ كل أنبوب بلون واحد لتنهي المرحلة. علقت؟ استخدم التراجع أو التلميح أو أنبوباً إضافياً.',
    themeNames: ['منتصف الليل', 'المحيط', 'الغروب', 'الغابة', 'الحلوى', 'المجرة'],
  },
};

// Each language is always listed under its own name so players can find it
// even when the app is currently showing a language they cannot read.
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'العربية' },
];

let lang = 'en';

export function setLang(l) {
  lang = STRINGS[l] ? l : 'en';
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
}

export function getLang() {
  return lang;
}

export function detectLang() {
  const nav = (navigator.language || 'en').toLowerCase();
  return nav.startsWith('ar') ? 'ar' : 'en';
}

export function t(key) {
  return STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
}
