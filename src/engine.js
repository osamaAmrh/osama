// Pure game logic shared by the game and the offline level generator.
// A board is an array of strings; each string is a tube listed bottom→top,
// one character per ball ('a'..'l'). Empty tubes are ''.

export const CAPACITY = 4;
export const COLOR_KEYS = 'abcdefghijkl';

export function top(tube) {
  return tube[tube.length - 1];
}

export function canMove(board, from, to, cap = CAPACITY) {
  if (from === to) return false;
  const src = board[from];
  const dst = board[to];
  if (!src || !src.length) return false;
  if (dst.length >= cap) return false;
  return dst.length === 0 || top(dst) === top(src);
}

export function applyMove(board, from, to) {
  const next = board.slice();
  const ball = next[from][next[from].length - 1];
  next[from] = next[from].slice(0, -1);
  next[to] = next[to] + ball;
  return next;
}

function isUniform(tube) {
  for (let i = 1; i < tube.length; i++) if (tube[i] !== tube[0]) return false;
  return true;
}

export function isTubeDone(tube, cap = CAPACITY) {
  return tube.length === cap && isUniform(tube);
}

export function isSolved(board, cap = CAPACITY) {
  return board.every((t) => t.length === 0 || isTubeDone(t, cap));
}

// Moves worth considering: skips moves that can never help (moving a finished
// or uniform tube into an empty tube, or into an equivalent second empty tube).
export function usefulMoves(board, cap = CAPACITY) {
  const moves = [];
  for (let f = 0; f < board.length; f++) {
    const src = board[f];
    if (!src.length || isTubeDone(src, cap)) continue;
    let emptySeen = false;
    for (let t = 0; t < board.length; t++) {
      if (!canMove(board, f, t, cap)) continue;
      if (board[t].length === 0) {
        if (isUniform(src) || emptySeen) continue;
        emptySeen = true;
      }
      moves.push([f, t]);
    }
  }
  return moves;
}

export function hasUsefulMove(board, cap = CAPACITY) {
  return usefulMoves(board, cap).length > 0;
}

function keyOf(board) {
  return board.slice().sort().join('|');
}

// Scores a move so the DFS tries promising moves first.
function moveScore(board, [f, t], cap) {
  const src = board[f];
  const dst = board[t];
  const c = top(src);
  let run = 0;
  for (let i = src.length - 1; i >= 0 && src[i] === c; i--) run++;
  let s = 0;
  if (dst.length) {
    s += 10;
    if (isUniform(dst)) s += 10 + dst.length * 2;
  }
  if (run === src.length) s -= 5; // emptying a tube's single color elsewhere
  if (src.length - run === 0 && dst.length === 0) s -= 20;
  s += (cap - src.length);
  return s;
}

// Depth-first search with a visited set. Returns a list of [from, to] moves or
// null if no solution was found within `limit` expanded states.
export function solve(board, cap = CAPACITY, limit = 200000) {
  const seen = new Set();
  const path = [];
  let expanded = 0;

  function dfs(b) {
    if (isSolved(b, cap)) return true;
    if (expanded++ > limit) return false;
    const k = keyOf(b);
    if (seen.has(k)) return false;
    seen.add(k);
    const moves = usefulMoves(b, cap);
    moves.sort((m1, m2) => moveScore(b, m2, cap) - moveScore(b, m1, cap));
    for (const m of moves) {
      path.push(m);
      if (dfs(applyMove(b, m[0], m[1]))) return true;
      path.pop();
      if (expanded > limit) return false;
    }
    return false;
  }

  return dfs(board) ? path.slice() : null;
}

// Deterministic PRNG so level N is identical on every device.
export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function levelSpec(n) {
  if (n <= 1) return { colors: 2, empty: 1 };
  if (n === 2) return { colors: 3, empty: 2 };
  const colors = Math.min(12, 3 + Math.floor(Math.sqrt(n - 1) * 0.9));
  return { colors, empty: 2 };
}

function shuffled(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateLevel(n, cap = CAPACITY) {
  const { colors, empty } = levelSpec(n);
  const rand = rng(n * 7919 + 17);
  const balls = [];
  for (let c = 0; c < colors; c++) for (let i = 0; i < cap; i++) balls.push(COLOR_KEYS[c]);

  for (let attempt = 0; attempt < 200; attempt++) {
    const mixed = shuffled(balls, rand);
    const board = [];
    for (let c = 0; c < colors; c++) board.push(mixed.slice(c * cap, (c + 1) * cap).join(''));
    for (let e = 0; e < empty; e++) board.push('');
    // Reject boards that start with a tube already solved or nearly so.
    if (board.some((t) => t.length && (isTubeDone(t, cap) || new Set(t).size === 1))) continue;
    if (board.some((t) => t.length === cap && new Set(t).size === 2 && t[0] === t[1] && t[1] === t[2])) continue;
    const solution = solve(board, cap, 60000);
    if (!solution) continue;
    const minMoves = Math.min(4 + colors * 2, 20);
    if (solution.length < minMoves && n > 1) continue;
    return { board, cap, par: solution.length };
  }
  throw new Error(`could not generate level ${n}`);
}

export function encodeBoard(board) {
  return board.join('.');
}

export function decodeBoard(str) {
  return str.split('.');
}
