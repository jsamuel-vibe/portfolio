import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = await readFile(resolve(root, 'games/penalty-rules.js'), 'utf8');
const sandbox = {};
vm.runInNewContext(source, sandbox);
const Rules = sandbox.PenaltyRules;

// Objects made inside the vm have another realm's prototype; copy before deepEqual.
const plain = (value) => (value ? { ...value } : value);
const seeded = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

test('a round is five shots', () => {
  assert.equal(Rules.SHOTS, 5);
});

test('a top-corner shot beats a keeper who dived the right way', () => {
  assert.equal(Rules.resolveShot({ x: 0.95, y: 0.9 }, 'right'), 'goal');
});

test('a low centre shot is saved by a keeper who stayed in the middle', () => {
  assert.equal(Rules.resolveShot({ x: 0.5, y: 0.2 }, 'centre'), 'save');
});

test('a keeper who guessed the wrong side concedes', () => {
  assert.equal(Rules.resolveShot({ x: 0.2, y: 0.3 }, 'right'), 'goal');
});

test('shots wide or over the bar are misses whatever the dive', () => {
  for (const dive of ['left', 'centre', 'right']) {
    assert.equal(Rules.resolveShot({ x: -0.05, y: 0.5 }, dive), 'miss');
    assert.equal(Rules.resolveShot({ x: 1.05, y: 0.5 }, dive), 'miss');
    assert.equal(Rules.resolveShot({ x: 0.5, y: 1.05 }, dive), 'miss');
  }
});

test('clicks count within a margin around the goal, and grass clicks shoot along the ground', () => {
  assert.deepEqual(plain(Rules.toTarget(-0.1, 0.5)), { x: -0.1, y: 0.5 });
  assert.deepEqual(plain(Rules.toTarget(0.5, -0.1)), { x: 0.5, y: 0 });
  assert.equal(Rules.toTarget(-0.2, 0.5), null);
  assert.equal(Rules.toTarget(1.2, 0.5), null);
  assert.equal(Rules.toTarget(0.5, 1.2), null);
  assert.equal(Rules.toTarget(0.5, -0.2), null);
});

test('with no history the keeper picks by base weights 0.4 / 0.2 / 0.4', () => {
  assert.equal(Rules.pickDive([], () => 0.1), 'left');
  assert.equal(Rules.pickDive([], () => 0.5), 'centre');
  assert.equal(Rules.pickDive([], () => 0.9), 'right');
});

test('the keeper leans toward the side the shooter keeps using', () => {
  const right = [{ x: 0.9, y: 0.5 }, { x: 0.85, y: 0.2 }, { x: 0.8, y: 0.7 }];
  // Weights become 0.4 / 0.2 / 0.7 (total 1.3); 0.5 * 1.3 = 0.65 lands on right.
  assert.equal(Rules.pickDive(right, () => 0.5), 'right');

  const rand = seeded(42);
  const counts = { left: 0, centre: 0, right: 0 };
  for (let i = 0; i < 2000; i++) counts[Rules.pickDive(right, rand)]++;
  assert.ok(counts.right > counts.left * 1.5, JSON.stringify(counts));
});

test('shots into the middle third add no bias', () => {
  assert.equal(Rules.pickDive([{ x: 0.5, y: 0.5 }], () => 0.5), 'centre');
});

test('scoreLine reports goals out of five with a line for each score', () => {
  const round = (goals) => Array.from({ length: 5 }, (_, i) => (i < goals ? 'goal' : 'save'));
  assert.equal(Rules.scoreLine(round(5)), '5 / 5: Perfect');
  assert.equal(Rules.scoreLine(round(4)), '4 / 5: Nice finish');
  assert.equal(Rules.scoreLine(round(3)), '3 / 5: Not bad');
  assert.equal(Rules.scoreLine(round(2)), '2 / 5: Unlucky');
  assert.equal(Rules.scoreLine(round(1)), "1 / 5: The keeper's having a day");
  assert.equal(Rules.scoreLine(round(0)), '0 / 5: Try another corner');
  assert.equal(Rules.scoreLine(['goal', 'miss', 'goal', 'save', 'goal']), '3 / 5: Not bad');
});

test('idle targets always land inside the click margin', () => {
  const rand = seeded(7);
  for (let i = 0; i < 500; i++) {
    const t = Rules.randomTarget(rand);
    assert.notEqual(Rules.toTarget(t.x, t.y), null, JSON.stringify(t));
  }
});
