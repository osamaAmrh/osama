import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applyMove, canMove, decodeBoard, generateLevel, isSolved, solve, usefulMoves } from '../src/engine.js';

const LEVELS = JSON.parse(readFileSync(new URL('../src/levels.json', import.meta.url)));

test('move rules', () => {
  const b = ['ab', 'b', '', 'aaaa'];
  assert.equal(canMove(b, 0, 1), true); // b onto b
  assert.equal(canMove(b, 0, 2), true); // onto empty
  assert.equal(canMove(b, 0, 3), false); // full tube
  assert.equal(canMove(b, 2, 0), false); // from empty
  assert.equal(canMove(b, 1, 0), true); // b onto b
  assert.deepEqual(applyMove(b, 0, 1), ['a', 'bb', '', 'aaaa']);
});

test('solved detection', () => {
  assert.equal(isSolved(['aaaa', 'bbbb', '', '']), true);
  assert.equal(isSolved(['aaab', 'bbba', '', '']), false);
  assert.equal(isSolved(['aa', 'aa', 'bbbb']), false);
});

test('useful moves skip pointless ones', () => {
  // moving a uniform tube into an empty one is never useful
  assert.deepEqual(usefulMoves(['aa', 'bbbb', '']), []);
});

test('every shipped level is well-formed and solvable', () => {
  assert.ok(LEVELS.length >= 1000);
  LEVELS.forEach((enc, i) => {
    const board = decodeBoard(enc);
    const counts = {};
    for (const ch of board.join('')) counts[ch] = (counts[ch] || 0) + 1;
    for (const [c, n] of Object.entries(counts)) assert.equal(n, 4, `level ${i + 1} color ${c}`);
    const sol = solve(board, 4, 300000);
    assert.ok(sol, `level ${i + 1} unsolvable`);
    let b = board;
    for (const [f, t] of sol) {
      assert.ok(canMove(b, f, t), `level ${i + 1} bad move`);
      b = applyMove(b, f, t);
    }
    assert.ok(isSolved(b));
  });
});

test('levels are deterministic', () => {
  assert.deepEqual(generateLevel(42).board, decodeBoard(LEVELS[41]));
  assert.ok(generateLevel(2500).board.length >= 14);
});
