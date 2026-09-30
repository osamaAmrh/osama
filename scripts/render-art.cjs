// Renders assets/src/art.html into the source PNGs used by @capacitor/assets.
// Usage: node scripts/render-art.cjs   (needs Playwright with Chromium)
const path = require('path');
const pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

(async () => {
  const root = path.join(__dirname, '..');
  const browser = await pw.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  await page.goto('file://' + path.join(root, 'assets/src/art.html'));
  const shot = (file) => page.locator('#art').screenshot({ path: path.join(root, file), omitBackground: true });

  await shot('assets/icon-only.png');

  await page.evaluate(() => (document.getElementById('fgLayer').style.display = 'none'));
  await shot('assets/icon-background.png');

  // Adaptive icon foreground must fit the inner safe zone, on transparency.
  await page.evaluate(() => {
    const fg = document.getElementById('fgLayer');
    fg.style.display = '';
    fg.setAttribute('transform', 'translate(512 512) scale(.8) translate(-512 -458)');
    document.getElementById('bgLayer').style.display = 'none';
  });
  await shot('assets/icon-foreground.png');

  // Splash: small logo centered on the brand color.
  await page.setViewportSize({ width: 2732, height: 2732 });
  await page.evaluate(() => {
    const svg = document.getElementById('art');
    svg.setAttribute('width', 2732);
    svg.setAttribute('height', 2732);
    svg.setAttribute('viewBox', '-854 -854 2732 2732');
    const bg = document.getElementById('bgLayer');
    bg.innerHTML = '<rect x="-854" y="-854" width="2732" height="2732" fill="#0b0f24"/>';
    bg.style.display = '';
    document.getElementById('fgLayer').setAttribute('transform', 'translate(512 512) scale(.8) translate(-512 -458)');
  });
  await shot('assets/splash.png');
  await shot('assets/splash-dark.png');
  await browser.close();
})();
