const KEY = 'glowsort.v1';

const DEFAULTS = {
  level: 1,
  coins: 0,
  sound: true,
  vibration: true,
  colorblind: false,
  lang: null,
  theme: 0,
  ownedThemes: [0],
  lastDaily: '',
  seenTutorial: false,
};

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    // Storage unavailable or corrupt: start fresh.
  }
  return { ...DEFAULTS };
}

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Ignore: progress simply won't persist this session.
  }
}

export function get(key) {
  return state[key];
}

export function set(key, value) {
  state[key] = value;
  save();
}

export function addCoins(n) {
  set('coins', Math.max(0, state.coins + n));
}
