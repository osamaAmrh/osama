# دليل نشر لعبة "جلو سورت" خطوة بخطوة

هذا الدليل للخطوات اللي لازم تعملها أنت بنفسك، لأنها مربوطة بهويتك وحساباتك. كل الباقي جاهز.

---

## 0) الملفات اللي استلمتها

| الملف | شو هو | شو تعمل فيه |
|---|---|---|
| `glow-sort-debug.apk` | نسخة تجريبية | نزّلها على موبايلك وجرّب اللعبة |
| `glow-sort-release.aab` | النسخة اللي بترفعها على Google Play | بترفعها بالخطوة 5 |
| `glowsort-upload.jks` | مفتاح التوقيع | **احفظه بمكان آمن**، مثل Google Drive ونسخة على فلاشة |
| `keystore.properties` | كلمة سر المفتاح | **احفظها مع المفتاح**. بدونها ما بتقدر تنزّل تحديثات |

> ⚠️ **لا ترفع ملف المفتاح ولا كلمة السر على GitHub أبداً، ولا ترسلهم لأي حدا.**

---

## 1) جرّب اللعبة على موبايلك (5 دقائق)

1. انقل ملف `glow-sort-debug.apk` لموبايلك الـ Android.
2. افتحه. إذا طلع لك تحذير "مصادر غير معروفة"، اسمح بالتثبيت.
3. العب كم مرحلة. الإعلانات اللي بتظهر هلأ **إعلانات تجريبية** من Google، ومكتوب عليها "Test Ad".

---

## 2) فعّل صفحة سياسة الخصوصية (دقيقتين)

Google Play بيطلب رابط لسياسة الخصوصية، وأنا كتبتها وجهّزتها.

1. افتح المستودع على GitHub: `github.com/osamaAmrh/osama`
2. روح على **Settings** ← **Pages**.
3. تحت **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: اختار `claude/mobile-game-monetization-609dy3` (أو `main` إذا دمجت التغييرات)، والمجلد **`/docs`**
   - اضغط **Save**
4. بعد دقيقة أو دقيقتين بتشتغل الصفحة على الرابط:
   `https://osamaamrh.github.io/osama/privacy.html`

> بالصفحة في كلمة `CONTACT_EMAIL`. احكيلي أي إيميل بدك يظهر للناس عشان أحطه مكانها، أو عدّلها بنفسك بملف `docs/privacy.html`.

---

## 3) افتح حساب مطور على Google Play

1. ادخل على <https://play.google.com/console/signup>
2. اختار نوع الحساب **Personal** (شخصي).
3. ادفع رسوم التسجيل: **25 دولار** مرة وحدة.
4. أكّد هويتك ببطاقة شخصية أو جواز سفر، وأكّد رقم الموبايل.
5. غالباً رح يطلب منك تنزّل تطبيق **Play Console** على موبايل Android عشان يتأكد إنك بتستخدم جهاز حقيقي.

⏳ التحقق من الهوية ممكن ياخد من يوم لعدة أيام.

---

## 4) افتح حساب AdMob وجهّز الإعلانات

1. ادخل على <https://admob.google.com> بنفس حساب Google.
2. عبّي معلوماتك: الدولة، والمنطقة الزمنية، والعملة.
3. من **Apps** ← **Add app**:
   - Platform: **Android**
   - "Is the app listed on a supported app store?": اختار **No**، لأنها لسا مش منشورة
   - App name: `Glow Sort`
4. بعد ما تنضاف اللعبة، انسخ **App ID**. شكله هيك: `ca-app-pub-1234567890123456~1234567890`
5. من **Ad units** ← **Add ad unit** اعمل 3 وحدات إعلانية:
   | النوع | الاسم المقترح |
   |---|---|
   | **Banner** | `glow_banner` |
   | **Interstitial** | `glow_interstitial` |
   | **Rewarded** (المكافأة: `1` و `reward`) | `glow_rewarded` |
6. انسخ **معرّف كل وحدة**. شكله هيك: `ca-app-pub-1234567890123456/1234567890`
7. من **Payments** عبّي معلومات الدفع والضرائب عشان توصلك الأرباح. Google بتدفع لما يوصل رصيدك **100 دولار**.

📩 **ابعتلي الـ App ID والمعرّفات الثلاث**، وأنا بحطهم باللعبة وببنيلك نسخة جديدة فيها إعلانات حقيقية.

> ⚠️ **لا تضغط أبداً على إعلاناتك الحقيقية** ولا تطلب من أصحابك يضغطوا عليها. Google بتكشف هالشي وبتسكّر الحساب بشكل نهائي.

---

## 5) أنشئ اللعبة على Play Console

1. **Create app**:
   - App name: `Glow Sort: Ball Sort Puzzle`
   - Default language: **English (United States) – en-US**
   - App or game: **Game**
   - Free or paid: **Free**
   - وافق على الإقرارات، واضغط **Create app**
2. **Store listing** (Grow ← Store presence ← Main store listing):
   - انسخ النصوص من ملف `store/listing.md`
   - ارفع الصور من مجلد `store/graphics/`: الأيقونة، وصورة الغلاف، و4 لقطات شاشة
   - من **Manage translations** ضيف **العربية** وانسخ النصوص العربية
3. **App content** (Policy ← App content)، وجاوب هيك:

| القسم | الجواب |
|---|---|
| Privacy policy | `https://osamaamrh.github.io/osama/privacy.html` |
| Ads | **Yes, my app contains ads** |
| App access | **All functionality is available without special access** |
| Content rating | عبّي الاستبيان: الفئة **Puzzle / Casual**، وجاوب **No** على كل أسئلة العنف والمحتوى الحساس. النتيجة المتوقعة **Everyone / PEGI 3** |
| Target audience | اختار **13-15، 16-17، 18+** فقط. ⚠️ **لا تختار أعمار تحت 13**، لأنها بتفرض قيود كبيرة على الإعلانات |
| News app | No |
| Government app | No |
| Financial features | My app doesn't provide any financial features |
| Health | لا شيء |
| Advertising ID | **Yes**. الغرض: **Advertising or marketing** |

4. **Data safety**، وجاوب هيك (هذه البيانات بتجمعها مكتبة AdMob):
   - Does your app collect or share any of the required user data types? **Yes**
   - Is all of the user data encrypted in transit? **Yes**
   - Do you provide a way for users to request that their data is deleted? **No**
   - أنواع البيانات:
     | النوع | Collected | Shared | الغرض |
     |---|---|---|---|
     | Location ← **Approximate location** | ✅ | ✅ | Advertising, Analytics |
     | App activity ← **App interactions** | ✅ | ✅ | Advertising, Analytics |
     | App info and performance ← **Crash logs** و **Diagnostics** | ✅ | ✅ | Analytics |
     | Device or other IDs | ✅ | ✅ | Advertising, Analytics, Fraud prevention |
   - لكل نوع: البيانات **not processed ephemerally**، وجمعها **Required**، يعني المستخدم ما بيقدر يلغيه

---

## 6) الاختبار المغلق (شرط إلزامي: 12 شخص لمدة 14 يوم)

Google بتطلب هالخطوة من كل حساب شخصي جديد قبل النشر العام.

1. روح على **Test and release** ← **Testing** ← **Closed testing** ← **Create track**.
2. **Testers**: اعمل قائمة إيميلات وضيف **12 شخص على الأقل**. لازم تكون إيميلات Gmail لأصحابك أو أهلك.
3. **Create new release**:
   - أول مرة رح يسألك عن **Play App Signing**. اختار الإعداد الافتراضي، يعني Google بتحتفظ بمفتاح التوقيع النهائي، والملف اللي معك هو "مفتاح الرفع"
   - ارفع ملف `glow-sort-release.aab`
   - Release notes: `First release`
   - اضغط **Save** ← **Review release** ← **Start rollout**
4. انسخ **رابط الانضمام** (Join on Android / web) وابعته للـ 12 شخص.
5. كل واحد منهم لازم **يقبل الدعوة وينزّل اللعبة ويخليها على جهازه 14 يوم متواصلين**. من الأفضل يفتحوها كل يوم أو يومين.

---

## 7) النشر العام (Production)

بعد 14 يوم:

1. من **Dashboard** اضغط **Apply for production**، وجاوب على الأسئلة عن تجربة الاختبار.
2. بعد الموافقة، بتلاقيها عادة خلال أيام، روح على **Production** ← **Create new release**.
3. ارفع **النسخة الجديدة اللي فيها الإعلانات الحقيقية** (بجهزها لما تبعتلي معرّفات AdMob من الخطوة 4).
4. **Countries**: اختار كل الدول (**Add all countries**).
5. **Start rollout to Production** 🎉

---

## 8) بعد النشر

1. **اربط اللعبة بـ AdMob**: من AdMob ← Apps ← Glow Sort ← **App settings** ← **Link to app store**، وابحث عن اللعبة.
2. **ملف app-ads.txt**: بيرفع ثقة المعلنين وبيزيد الأرباح. لازم ينحط على جذر موقع المطوّر اللي بتكتبه بصفحة المتجر. احكيلي وبساعدك تجهزه. عندك موقع WordPress، أو بنقدر نعمل مستودع `osamaamrh.github.io`.
3. **راقب الأرقام** بـ Play Console و AdMob:
   - **D1 retention**: الهدف 35% أو أكثر
   - **eCPM** و **ARPDAU**
4. ابعتلي الأرقام بعد أسبوعين، وبحللها معك وبنحسّن اللعبة.

---

## ملخص: شو المطلوب منك الآن؟

- [ ] جرّب ملف الـ APK على موبايلك
- [ ] فعّل GitHub Pages (الخطوة 2)
- [ ] احكيلي أي إيميل بدك يظهر بسياسة الخصوصية
- [ ] افتح حساب Google Play Console (الخطوة 3)
- [ ] افتح حساب AdMob وابعتلي المعرّفات (الخطوة 4)
- [ ] جهّز قائمة بـ 12 إيميل للمختبرين
