// Generates Google Play screenshots (1080x1920) and the feature graphic (1024x500).
// Needs the built game served locally: `npx vite preview --port 4173` then
// `node scripts/store-shots.cjs`.
const path = require('path');
const fs = require('fs');
const pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const URL = 'http://localhost:4173/';
const OUT = path.join(__dirname, '..', 'store', 'graphics');
const RAW = path.join(OUT, 'raw');

const CAPTIONS = {
  en: ['Sort the glowing balls', 'Hundreds of relaxing levels', 'Stuck? Get a hint!', 'Unlock beautiful themes'],
  ar: ['رتّب الكرات المضيئة', 'مئات المراحل الممتعة', 'علقت؟ خذ تلميحاً!', 'افتح ثيمات رائعة'],
};

async function rawShots(browser, lang) {
  const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, locale: lang });
  const page = await ctx.newPage();
  await page.addInitScript((l) => {
    localStorage.setItem('glowsort.v1', JSON.stringify({ level: 37, coins: 1240, lang: l, lastDaily: new Date().getFullYear() + '-' + (new Date().getMonth() + 1) + '-' + new Date().getDate(), ownedThemes: [0, 1, 2] }));
  }, lang);
  await page.goto(URL);
  await page.addStyleTag({ content: 'body.fake-banner #fake-banner{display:none!important} :root{--banner-h:0px!important}' });
  await page.evaluate(() => document.documentElement.style.setProperty('--banner-h', '0px'));
  await page.waitForTimeout(500);
  const shots = [];
  const f = (n) => path.join(RAW, `${lang}-${n}.png`);

  // 1: mid-game with a ball lifted
  await page.evaluate(() => window.__glow.startLevel(37));
  await page.waitForTimeout(300);
  let hits = await page.$$('.tube-hit');
  await hits[2].dispatchEvent('pointerdown');
  await page.waitForTimeout(300);
  await page.screenshot({ path: f(1) });
  shots.push(f(1));

  // 2: a big level
  await page.evaluate(() => window.__glow.startLevel(160));
  await page.waitForTimeout(300);
  await page.screenshot({ path: f(2) });
  shots.push(f(2));

  // 3: hint on a mid level, in the ocean theme
  await page.evaluate(() => {
    document.body.className = document.body.className.replace(/theme-\d/, 'theme-1');
    window.__glow.startLevel(12);
  });
  await page.waitForTimeout(300);
  await page.click('#btn-hint');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: f(3) });
  shots.push(f(3));

  // 4: theme shop
  await page.evaluate(() => (document.body.className = document.body.className.replace(/theme-\d/, 'theme-5')));
  await page.click('#btn-home');
  await page.click('#btn-shop');
  await page.waitForTimeout(400);
  await page.screenshot({ path: f(4) });
  shots.push(f(4));
  await ctx.close();
  return shots;
}

function frameHtml(img, caption, lang) {
  const data = fs.readFileSync(img).toString('base64');
  return `<!doctype html><html dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><style>
    body{margin:0;width:1080px;height:1920px;overflow:hidden;background:radial-gradient(120% 70% at 50% 0%,#4a2fb0,#140f3a 55%,#0b0f24);
      font-family:system-ui,'Noto Sans Arabic',sans-serif;color:#fff;display:flex;flex-direction:column;align-items:center}
    h1{font-size:86px;line-height:1.15;text-align:center;margin:110px 60px 70px;font-weight:900;
      text-shadow:0 0 40px #7c5cffaa}
    img{width:760px;border-radius:56px;border:10px solid #ffffff22;box-shadow:0 30px 80px #0009}
  </style></head><body><h1>${caption}</h1><img src="data:image/png;base64,${data}"></body></html>`;
}

(async () => {
  fs.mkdirSync(RAW, { recursive: true });
  const browser = await pw.chromium.launch();
  for (const lang of ['en', 'ar']) {
    const shots = await rawShots(browser, lang);
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    for (let i = 0; i < shots.length; i++) {
      await page.setContent(frameHtml(shots[i], CAPTIONS[lang][i], lang));
      await page.screenshot({ path: path.join(OUT, `screenshot-${lang}-${i + 1}.png`) });
    }
    await page.close();
  }

  // Feature graphic 1024x500
  const icon = fs.readFileSync(path.join(__dirname, '..', 'assets', 'icon-only.png')).toString('base64');
  const page = await browser.newPage({ viewport: { width: 1024, height: 500 } });
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>
    body{margin:0;width:1024px;height:500px;overflow:hidden;display:flex;align-items:center;gap:56px;padding:0 70px;box-sizing:border-box;
      background:radial-gradient(90% 120% at 30% 50%,#4a2fb0,#140f3a 60%,#0b0f24);font-family:system-ui,sans-serif;color:#fff}
    img{width:300px;height:300px;border-radius:64px;box-shadow:0 20px 60px #000a}
    h1{margin:0;font-size:92px;white-space:nowrap;font-weight:900;background:linear-gradient(90deg,#22d3ee,#9d86ff,#ff5fcf);-webkit-background-clip:text;color:transparent}
    p{margin:8px 0 0;font-size:38px;opacity:.85}
  </style></head><body><img src="data:image/png;base64,${icon}"><div><h1>Glow Sort</h1><p>Ball Sort Puzzle</p></div></body></html>`);
  await page.screenshot({ path: path.join(OUT, 'feature-graphic.png') });
  // 512x512 hi-res icon for the store listing
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(`<body style="margin:0"><img style="width:512px;height:512px;display:block" src="data:image/png;base64,${icon}"></body>`);
  await page.screenshot({ path: path.join(OUT, 'icon-512.png') });
  await browser.close();
  fs.rmSync(RAW, { recursive: true, force: true });
})();
