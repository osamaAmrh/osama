import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { SplashScreen } from '@capacitor/splash-screen';
import {
  CAPACITY,
  applyMove,
  canMove,
  decodeBoard,
  generateLevel,
  hasUsefulMove,
  isSolved,
  isTubeDone,
  solve,
} from './engine.js';
import LEVELS from './levels.json';
import * as store from './storage.js';
import { detectLang, getLang, setLang, t } from './i18n.js';
import { buzz, play } from './audio.js';
import { initAds, isPrivacyOptionsRequired, maybeInterstitial, showPrivacyOptions, showRewarded } from './ads.js';
import { PRIVACY_URL } from './config.js';

const $ = (sel) => document.querySelector(sel);
const FREE_UNDOS = 5;
const WIN_COINS = 10;
const DAILY_COINS = 25;
const THEMES = [
  { price: 0, bg: ['#0b0f24', '#241a4d'] },
  { price: 100, bg: ['#031a2e', '#0a4a6e'] },
  { price: 200, bg: ['#2a0b2e', '#b8433b'] },
  { price: 300, bg: ['#06190f', '#1d5a3a'] },
  { price: 500, bg: ['#3b1d4a', '#ff8fb8'] },
  { price: 800, bg: ['#000005', '#1b1464'] },
];
const SYMBOLS = ['●', '▲', '■', '◆', '★', '✚', '♥', '✿', '☾', '⬢', '✖', '♠'].map((s) => s + '︎');

const G = {
  level: 1,
  cap: CAPACITY,
  initial: [],
  board: [],
  history: [],
  undos: FREE_UNDOS,
  extraTube: false,
  selected: -1,
  balls: [], // balls[tube] = array of DOM elements bottom→top
  tubeEls: [],
  layout: null,
  busy: false,
  won: false,
};

// ---------------------------------------------------------------- helpers

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 1800);
}

function refreshCoins() {
  document.querySelectorAll('.coin-count').forEach((el) => (el.textContent = store.get('coins')));
}

function applyTexts() {
  document.querySelectorAll('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  $('#play-level').textContent = `${t('level')} ${store.get('level')}`;
}

function applyTheme() {
  document.body.className = document.body.className.replace(/theme-\d/g, '').trim();
  document.body.classList.add(`theme-${store.get('theme')}`);
  document.body.classList.toggle('colorblind', !!store.get('colorblind'));
}

function levelBoard(n) {
  if (n <= LEVELS.length) return decodeBoard(LEVELS[n - 1]);
  return generateLevel(n).board;
}

// ---------------------------------------------------------------- layout

function computeLayout() {
  const board = $('#board');
  const W = board.clientWidth;
  const H = board.clientHeight;
  const n = G.board.length;
  const rows = n <= 5 ? 1 : 2;
  const perRow = Math.ceil(n / rows);
  const cap = G.cap;
  // Everything is expressed in ball-size units (b).
  const pad = 0.14;
  const tubeW = 1 + pad * 2;
  const gap = 0.5;
  const lift = 1.25;
  const tubeH = cap + pad * 2 + 0.25;
  const rowGap = 0.4;
  const bW = (W * 0.96) / (perRow * tubeW + (perRow - 1) * gap);
  const bH = H / (rows * (lift + tubeH) + (rows - 1) * rowGap);
  const b = Math.floor(Math.min(bW, bH, 64));
  const totalH = rows * (lift + tubeH) * b + (rows - 1) * rowGap * b;
  const top0 = Math.max(0, (H - totalH) / 2);
  const tubes = [];
  for (let i = 0; i < n; i++) {
    const r = Math.floor(i / perRow);
    const inRow = r === rows - 1 ? n - perRow * (rows - 1) : perRow;
    const c = i - r * perRow;
    const rowW = inRow * tubeW * b + (inRow - 1) * gap * b;
    const x = (W - rowW) / 2 + c * (tubeW + gap) * b;
    const y = top0 + r * (lift + tubeH + rowGap) * b + lift * b;
    tubes.push({ x, y, w: tubeW * b, h: tubeH * b });
  }
  return { b, pad: pad * b, tubes, lift: lift * b };
}

function slotPos(tube, index) {
  const L = G.layout;
  const tl = L.tubes[tube];
  return { x: tl.x + tl.w / 2, y: tl.y + tl.h - L.pad - L.b * (index + 0.5) - 2 };
}

function liftPos(tube) {
  const L = G.layout;
  const tl = L.tubes[tube];
  return { x: tl.x + tl.w / 2, y: tl.y - L.lift * 0.55 };
}

function place(el, p) {
  const b = G.layout.b;
  el._p = p;
  el.style.transform = `translate(${p.x - b / 2}px, ${p.y - b / 2}px)`;
}

function animateBall(el, points, duration) {
  const b = G.layout.b;
  const frames = [el._p, ...points].map((p) => ({ transform: `translate(${p.x - b / 2}px, ${p.y - b / 2}px)` }));
  place(el, points[points.length - 1]);
  const anim = el.animate(frames, { duration, easing: 'cubic-bezier(.3,.7,.4,1)' });
  return anim.finished.catch(() => {});
}

function render() {
  const boardEl = $('#board');
  boardEl.innerHTML = '';
  G.layout = computeLayout();
  const b = G.layout.b;
  G.tubeEls = [];
  G.balls = G.board.map(() => []);
  G.board.forEach((tube, i) => {
    const tl = G.layout.tubes[i];
    const el = document.createElement('div');
    el.className = 'tube';
    el.style.cssText = `left:${tl.x}px;top:${tl.y}px;width:${tl.w}px;height:${tl.h}px;border-radius:0 0 ${tl.w / 2}px ${tl.w / 2}px`;
    if (tube.length && isTubeDone(tube, G.cap)) el.classList.add('done');
    boardEl.appendChild(el);
    G.tubeEls.push(el);
    const hit = document.createElement('div');
    hit.className = 'tube-hit';
    hit.style.cssText = `left:${tl.x - 6}px;top:${tl.y - G.layout.lift}px;width:${tl.w + 12}px;height:${tl.h + G.layout.lift + 8}px`;
    hit.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      onTube(i);
    });
    boardEl.appendChild(hit);
    [...tube].forEach((color, j) => {
      const ball = document.createElement('div');
      ball.className = `ball c-${color}`;
      ball.dataset.sym = SYMBOLS['abcdefghijkl'.indexOf(color)];
      ball.style.width = ball.style.height = `${b}px`;
      ball.style.fontSize = `${b}px`;
      place(ball, slotPos(i, j));
      boardEl.appendChild(ball);
      G.balls[i].push(ball);
    });
  });
  if (G.selected >= 0) {
    const s = G.selected;
    G.tubeEls[s].classList.add('selected');
    place(G.balls[s][G.balls[s].length - 1], liftPos(s));
  }
  updateControls();
}

// ---------------------------------------------------------------- gameplay

function startLevel(n) {
  G.level = n;
  G.initial = levelBoard(n);
  G.board = G.initial.slice();
  G.history = [];
  G.undos = FREE_UNDOS;
  G.extraTube = false;
  G.selected = -1;
  G.busy = false;
  G.won = false;
  $('#level-num').textContent = n;
  $('#tutorial').classList.toggle('hidden', n > 2);
  showScreen('game');
  render();
  if (n === 1) showHint(false);
}

function updateControls() {
  $('#undo-count').textContent = G.undos > 0 ? G.undos : 'AD';
  $('#undo-count').classList.toggle('ad', G.undos === 0);
  $('#btn-undo').disabled = G.history.length === 0;
  $('#btn-tube').disabled = G.extraTube;
}

function clearHints() {
  G.tubeEls.forEach((el) => el.classList.remove('hint-from', 'hint-to'));
}

function select(i) {
  G.selected = i;
  G.tubeEls[i].classList.add('selected');
  const ball = G.balls[i][G.balls[i].length - 1];
  animateBall(ball, [liftPos(i)], 120);
  play('pick');
  buzz();
}

function deselect() {
  const i = G.selected;
  if (i < 0) return;
  G.tubeEls[i].classList.remove('selected');
  const ball = G.balls[i][G.balls[i].length - 1];
  animateBall(ball, [slotPos(i, G.balls[i].length - 1)], 120);
  G.selected = -1;
}

function onTube(i) {
  if (G.busy || G.won || !$('#modal').classList.contains('hidden')) return;
  clearHints();
  const s = G.selected;
  if (s < 0) {
    if (!G.board[i].length || isTubeDone(G.board[i], G.cap)) return;
    select(i);
    return;
  }
  if (s === i) {
    deselect();
    return;
  }
  if (canMove(G.board, s, i, G.cap)) {
    doMove(s, i);
    return;
  }
  // Illegal target: switch selection if it has balls, otherwise shake.
  if (G.board[i].length && !isTubeDone(G.board[i], G.cap)) {
    deselect();
    select(i);
  } else {
    play('error');
    G.tubeEls[i].classList.remove('shake');
    void G.tubeEls[i].offsetWidth;
    G.tubeEls[i].classList.add('shake');
  }
}

async function doMove(from, to) {
  G.busy = true;
  G.tubeEls[from].classList.remove('selected');
  G.selected = -1;
  G.history.push(G.board);
  G.board = applyMove(G.board, from, to);
  const ball = G.balls[from].pop();
  G.balls[to].push(ball);
  await animateBall(ball, [liftPos(to), slotPos(to, G.balls[to].length - 1)], 230);
  play('drop');
  G.busy = false;
  updateControls();

  if (isTubeDone(G.board[to], G.cap)) {
    G.tubeEls[to].classList.add('done');
    play('tube');
    buzz(true);
  }
  if (isSolved(G.board, G.cap)) {
    win();
  } else if (!hasUsefulMove(G.board, G.cap)) {
    setTimeout(showStuck, 350);
  } else if (G.level === 1) {
    showHint(false);
  }
}

function undo() {
  if (!G.history.length || G.busy) return;
  if (G.undos <= 0) {
    rewardThen(() => {
      G.undos += FREE_UNDOS;
      toast(t('undosAdded'));
      updateControls();
    });
    return;
  }
  G.undos--;
  G.board = G.history.pop();
  G.selected = -1;
  clearHints();
  render();
  play('pick');
}

function restart() {
  if (G.busy) return;
  G.board = G.initial.slice();
  if (G.extraTube) G.board.push('');
  G.history = [];
  G.selected = -1;
  render();
}

function addTube() {
  if (G.extraTube) {
    toast(t('tubeLimit'));
    return;
  }
  rewardThen(() => {
    G.extraTube = true;
    G.board = G.board.concat(['']);
    G.history = G.history.map((b) => b.concat(['']));
    G.selected = -1;
    closeModal();
    render();
    toast(t('tubeAdded'));
  });
}

function showHint(viaAd = true) {
  const go = () => {
    const sol = solve(G.board, G.cap, 150000);
    if (!sol || !sol.length) {
      toast(t('noHint'));
      return;
    }
    if (G.selected >= 0) deselect();
    const [f, to] = sol[0];
    G.tubeEls[f].classList.add('hint-from');
    G.tubeEls[to].classList.add('hint-to');
  };
  viaAd ? rewardThen(go) : go();
}

async function rewardThen(fn) {
  const ok = await showRewarded();
  if (ok) fn();
  else toast(t('adUnavailable'));
}

function confetti() {
  const colors = ['#ff3b4f', '#ffe23f', '#2ed573', '#3d7bff', '#ff5fcf', '#22d3ee'];
  for (let i = 0; i < 60; i++) {
    const c = document.createElement('div');
    c.className = 'confetti';
    c.style.left = `${Math.random() * 100}vw`;
    c.style.background = colors[i % colors.length];
    document.body.appendChild(c);
    const x = (Math.random() - 0.5) * 200;
    c.animate(
      [
        { transform: 'translate(0,0) rotate(0)' },
        { transform: `translate(${x}px, ${window.innerHeight + 40}px) rotate(${Math.random() * 720}deg)` },
      ],
      { duration: 1400 + Math.random() * 1200, delay: Math.random() * 300, easing: 'cubic-bezier(.2,.6,.4,1)' },
    ).finished.then(() => c.remove());
  }
}

function win() {
  G.won = true;
  play('win');
  buzz(true);
  confetti();
  store.addCoins(WIN_COINS);
  store.set('level', G.level + 1);
  refreshCoins();
  setTimeout(() => {
    openModal(`
      <h2>${t('levelComplete')}</h2>
      <div class="reward"><span class="coin-icon"></span>+${WIN_COINS}</div>
      <div class="btn-row">
        <button class="btn ad" data-act="x3">${t('claimX3')}</button>
        <button class="btn primary" data-act="next">${t('next')}</button>
      </div>`, {
      x3: () =>
        rewardThen(() => {
          store.addCoins(WIN_COINS * 2);
          refreshCoins();
          play('coin');
          nextLevel(false);
        }),
      next: () => nextLevel(true),
    });
  }, 700);
}

async function nextLevel(allowInterstitial) {
  closeModal();
  if (allowInterstitial) await maybeInterstitial(G.level);
  startLevel(G.level + 1);
}

function showStuck() {
  if (G.won || !$('#modal').classList.contains('hidden')) return;
  openModal(`
    <h2>${t('stuckTitle')}</h2>
    <p>${t('stuckText')}</p>
    <div class="btn-row">
      ${G.history.length ? `<button class="btn" data-act="undo">${t('undo')}</button>` : ''}
      ${G.extraTube ? '' : `<button class="btn ad" data-act="tube">${t('addTube')}</button>`}
      <button class="btn primary" data-act="restart">${t('tryAgain')}</button>
    </div>`, {
    undo: () => {
      closeModal();
      undo();
    },
    tube: addTube,
    restart: () => {
      closeModal();
      restart();
    },
  });
}

// ---------------------------------------------------------------- screens & modals

function showScreen(name) {
  $('#home').classList.toggle('hidden', name !== 'home');
  $('#game').classList.toggle('hidden', name !== 'game');
  if (name === 'home') applyTexts();
}

function openModal(html, actions = {}) {
  const card = $('#modal-card');
  card.innerHTML = html;
  card.querySelectorAll('[data-act]').forEach((btn) => {
    btn.addEventListener('click', () => actions[btn.dataset.act]?.());
  });
  $('#modal').classList.remove('hidden');
}

function closeModal() {
  $('#modal').classList.add('hidden');
}

function openSettings() {
  const row = (key, label) => `
    <div class="setting-row"><span>${t(label)}</span>
      <button class="toggle ${store.get(key) ? 'on' : ''}" data-act="${key}">${store.get(key) ? t('on') : t('off')}</button></div>`;
  openModal(
    `<h2>${t('settings')}</h2>
    ${row('sound', 'sound')}${row('vibration', 'vibration')}${row('colorblind', 'colorblind')}
    <div class="setting-row"><span>${t('language')}</span>
      <button class="toggle on" data-act="lang">${getLang() === 'ar' ? 'العربية' : 'English'}</button></div>
    <button class="link-btn" data-act="privacy">${t('privacy')}</button>
    ${isPrivacyOptionsRequired() ? `<button class="link-btn" data-act="adprivacy">${t('privacyOptions')}</button>` : ''}
    <div class="btn-row"><button class="btn primary" data-act="close">${t('close')}</button></div>`,
    {
      sound: () => toggleSetting('sound'),
      vibration: () => toggleSetting('vibration'),
      colorblind: () => {
        toggleSetting('colorblind');
        applyTheme();
      },
      lang: () => {
        const next = getLang() === 'ar' ? 'en' : 'ar';
        store.set('lang', next);
        setLang(next);
        applyTexts();
        openSettings();
      },
      privacy: () => window.open(PRIVACY_URL, '_blank'),
      adprivacy: showPrivacyOptions,
      close: closeModal,
    },
  );
}

function toggleSetting(key) {
  store.set(key, !store.get(key));
  openSettings();
}

function openShop() {
  const owned = store.get('ownedThemes');
  const cards = THEMES.map((th, i) => {
    const isOwned = owned.includes(i);
    const active = store.get('theme') === i;
    const label = active ? t('inUse') : isOwned ? t('use') : `<span class="theme-price"><span class="coin-icon"></span>${th.price}</span>`;
    return `<button class="theme-card ${active ? 'active' : ''}" data-act="t${i}">
      <span class="theme-swatch" style="background:radial-gradient(120% 90% at 50% 0%, ${th.bg[1]}, ${th.bg[0]} 75%)"></span>
      <span>${t('themeNames')[i]}</span>${label}</button>`;
  }).join('');
  const actions = { close: closeModal };
  THEMES.forEach((th, i) => {
    actions[`t${i}`] = () => {
      if (!store.get('ownedThemes').includes(i)) {
        if (store.get('coins') < th.price) {
          toast(t('notEnough'));
          return;
        }
        store.addCoins(-th.price);
        store.set('ownedThemes', [...store.get('ownedThemes'), i]);
        play('coin');
        refreshCoins();
      }
      store.set('theme', i);
      applyTheme();
      openShop();
    };
  });
  openModal(
    `<h2>${t('shop')}</h2><div class="themes">${cards}</div>
    <div class="btn-row"><button class="btn primary" data-act="close">${t('close')}</button></div>`,
    actions,
  );
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function maybeDailyGift() {
  if (store.get('lastDaily') === today()) return;
  if (store.get('level') <= 1) {
    store.set('lastDaily', today());
    return;
  }
  const grant = (mult) => {
    store.set('lastDaily', today());
    store.addCoins(DAILY_COINS * mult);
    refreshCoins();
    play('coin');
    closeModal();
  };
  openModal(
    `<h2>${t('dailyTitle')}</h2><p>${t('dailyText')}</p>
    <div class="reward"><span class="coin-icon"></span>+${DAILY_COINS}</div>
    <div class="btn-row">
      <button class="btn ad" data-act="x2">${t('collectX2')}</button>
      <button class="btn primary" data-act="one">${t('collect')}</button>
    </div>`,
    { x2: () => rewardThen(() => grant(2)), one: () => grant(1) },
  );
}

// ---------------------------------------------------------------- boot

function bindUI() {
  $('#btn-play').addEventListener('click', () => startLevel(store.get('level')));
  $('#btn-home').addEventListener('click', () => showScreen('home'));
  $('#btn-settings').addEventListener('click', openSettings);
  $('#btn-shop').addEventListener('click', openShop);
  $('#btn-undo').addEventListener('click', undo);
  $('#btn-restart').addEventListener('click', restart);
  $('#btn-tube').addEventListener('click', addTube);
  $('#btn-hint').addEventListener('click', () => showHint(true));
  $('#modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal' && !G.won) closeModal();
  });
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!$('#game').classList.contains('hidden')) render();
    }, 60);
  });
  App.addListener('backButton', () => {
    if (!$('#modal').classList.contains('hidden')) {
      if (!G.won) closeModal();
    } else if (!$('#game').classList.contains('hidden')) {
      showScreen('home');
    } else {
      App.exitApp();
    }
  });
}

function boot() {
  setLang(store.get('lang') || detectLang());
  applyTheme();
  applyTexts();
  refreshCoins();
  bindUI();
  showScreen('home');
  if (Capacitor.isNativePlatform()) SplashScreen.hide().catch(() => {});
  initAds().finally(maybeDailyGift);
}

boot();

// Exposed for automated UI tests.
window.__glow = { G, startLevel, solve };
