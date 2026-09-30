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
    themeNames: ['منتصف الليل', 'المحيط', 'الغروب', 'الغابة', 'الحلوى', 'المجرة'],
  },
};

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
