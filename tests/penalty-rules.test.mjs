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

test('a correct guess saves a high shot that is only a little inside the frame', () => {
  assert.equal(Rules.resolveShot({ x: 0.1, y: 0.85 }, 'left'), 'save');
  assert.equal(Rules.resolveShot({ x: 0.9, y: 0.85 }, 'right'), 'save');
});

test('only a shot tight to the corner beats a correct guess', () => {
  assert.equal(Rules.resolveShot({ x: 0.03, y: 0.97 }, 'left'), 'goal');
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

test('the ball lands within 0.06 of where you aim, never below the ground', () => {
  assert.deepEqual(plain(Rules.scatter({ x: 0.5, y: 0.5 }, () => 0.5)), { x: 0.5, y: 0.5 });
  const edge = plain(Rules.scatter({ x: 0.5, y: 0.02 }, () => 0));
  assert.ok(Math.abs(edge.x - 0.44) < 1e-9, JSON.stringify(edge));
  assert.equal(edge.y, 0);

  const rand = seeded(3);
  for (let i = 0; i < 500; i++) {
    const s = Rules.scatter({ x: 0.3, y: 0.4 }, rand);
    assert.ok(Math.abs(s.x - 0.3) <= 0.06 && Math.abs(s.y - 0.4) <= 0.06, JSON.stringify(s));
  }
});

test('aiming tight to the corner sometimes goes wide or over', () => {
  const rand = seeded(11);
  let misses = 0;
  for (let i = 0; i < 1000; i++) {
    const s = Rules.scatter({ x: 0.97, y: 0.95 }, rand);
    if (Rules.resolveShot(s, 'left') === 'miss') misses++;
  }
  // About 31% expected: 25% wide (x > 1) or 8% over (y > 1).
  assert.ok(misses > 200 && misses < 450, `misses: ${misses}`);
});

// ---- Shootout against the computer ----
const G = 'goal', S = 'save', M = 'miss';

test('you take the first kick, then the sides alternate', () => {
  assert.equal(Rules.nextKicker([], []), 'you');
  assert.equal(Rules.nextKicker([G], []), 'them');
  assert.equal(Rules.nextKicker([G], [S]), 'you');
});

test('a shootout is undecided while both sides can still win it', () => {
  assert.equal(Rules.shootoutResult([], []), null);
  assert.equal(Rules.shootoutResult([G, G], [S, G]), null);
  assert.equal(Rules.shootoutResult([G, G, G, G, G], [G, G, G, G]), null);
});

test('a shootout ends early once one side cannot catch up', () => {
  // You lead 3-0 and they have two kicks left: they can reach 2 at most.
  assert.equal(Rules.shootoutResult([G, G, G], [S, M, S]), 'win');
  // They lead 3-0 with your two kicks left.
  assert.equal(Rules.shootoutResult([S, M, S], [G, G, G]), 'lose');
  // 4-2 after your fifth kick, before their fifth: they can only reach 3.
  assert.equal(Rules.shootoutResult([G, G, S, G, G], [G, S, G, M]), 'win');
});

test('level after five each goes to sudden death, settled after each pair', () => {
  const five = [G, G, G, S, S];
  assert.equal(Rules.shootoutResult(five, five), null);
  assert.equal(Rules.shootoutResult([...five, G], five), null, 'they still get their kick');
  assert.equal(Rules.shootoutResult([...five, G], [...five, S]), 'win');
  assert.equal(Rules.shootoutResult([...five, M], [...five, G]), 'lose');
  assert.equal(Rules.shootoutResult([...five, G], [...five, G]), null);
});

test('the computer aims inside the frame most of the time and only sometimes misses', () => {
  const rand = seeded(42);
  let outside = 0;
  for (let i = 0; i < 2000; i++) {
    const aim = Rules.pickShot(rand);
    if (aim.x < 0 || aim.x > 1 || aim.y > 1) outside++;
    else assert.ok(aim.y >= 0.1 && aim.y <= 0.85 && aim.x >= 0.08 && aim.x <= 0.92, JSON.stringify(aim));
  }
  assert.ok(outside > 100 && outside < 400, `misses: ${outside}`);
});

// ---- The ladder ----
test('a win moves you up a match, a loss down one, never below the first', () => {
  assert.equal(Rules.nextLevel(1, 'win'), 2);
  assert.equal(Rules.nextLevel(4, 'lose'), 3);
  assert.equal(Rules.nextLevel(1, 'lose'), 1);
});

test('match 1 plays exactly like the plain penalty rules', () => {
  const d = Rules.difficulty(1);
  assert.equal(d.reach, 1);
  assert.equal(d.lean, 0.1);
  assert.equal(d.accuracy, 0);
  assert.equal(d.distance, 1);
  const shot = { x: 0.3, y: 0.5 };
  assert.equal(Rules.resolveShot(shot, 'left', d.reach), Rules.resolveShot(shot, 'left'));
});

test('every setting gets harder up the ladder, then holds at the top', () => {
  const keys = ['reach', 'lean', 'accuracy', 'distance', 'wobble'];
  for (let level = 1; level < 8; level++) {
    const a = Rules.difficulty(level), b = Rules.difficulty(level + 1);
    for (const k of keys) assert.ok(b[k] > a[k], `${k} at ${level + 1}`);
  }
  assert.deepEqual(plain(Rules.difficulty(12)), plain(Rules.difficulty(8)));
});

test('a keeper with more reach saves a shot that beats a plain one', () => {
  const shot = { x: 0.38, y: 0.4 };
  assert.equal(Rules.resolveShot(shot, 'left'), 'goal');
  assert.equal(Rules.resolveShot(shot, 'left', Rules.difficulty(8).reach), 'save');
});

test('a sharper striker misses less', () => {
  const misses = (accuracy) => {
    const rand = seeded(7);
    let n = 0;
    for (let i = 0; i < 4000; i++) {
      const aim = Rules.pickShot(rand, accuracy);
      if (aim.x < 0 || aim.x > 1 || aim.y > 1) n++;
    }
    return n;
  };
  assert.ok(misses(1) < misses(0) * 0.5, `${misses(1)} vs ${misses(0)}`);
});

// ---- Objectives and saved progress ----
const shot = (x, y, outcome) => ({ target: { x, y }, outcome });
const objective = (id) => Rules.OBJECTIVES.find((o) => o.id === id);
const state = (o) => ({ you: [], them: [], shots: [], result: null, ...o });

test('each match has an objective, cycling through the list', () => {
  assert.equal(Rules.objectiveFor(1).id, Rules.OBJECTIVES[0].id);
  assert.equal(Rules.objectiveFor(2).id, Rules.OBJECTIVES[1].id);
  assert.equal(Rules.objectiveFor(Rules.OBJECTIVES.length + 1).id, Rules.OBJECTIVES[0].id);
  for (const o of Rules.OBJECTIVES) assert.ok(o.text.length > 0 && o.text.length <= 40, o.text);
});

test('save objectives count saves on their kicks, not misses', () => {
  assert.equal(objective('save-one').met(state({ them: ['goal', 'miss'] })), false);
  assert.equal(objective('save-one').met(state({ them: ['goal', 'save'] })), true);
  assert.equal(objective('save-two').met(state({ them: ['save', 'goal', 'save'] })), true);
});

test('first three and clean three need all three', () => {
  assert.equal(objective('first-three').met(state({ you: [G, G] })), false);
  assert.equal(objective('first-three').met(state({ you: [G, G, G, S] })), true);
  assert.equal(objective('first-three').met(state({ you: [G, S, G] })), false);
  assert.equal(objective('clean-three').met(state({ them: [S, M, S] })), true);
  assert.equal(objective('clean-three').met(state({ them: [S, G, S] })), false);
});

test('corner objectives use where your goals went in', () => {
  const sides = [shot(0.1, 0.3, G), shot(0.5, 0.3, G), shot(0.9, 0.3, G)];
  assert.equal(objective('every-side').met(state({ shots: sides })), true);
  assert.equal(objective('every-side').met(state({ shots: [shot(0.1, 0.3, G), shot(0.5, 0.3, S), shot(0.9, 0.3, G)] })), false);
  assert.equal(objective('top-corners').met(state({ shots: [shot(0.1, 0.9, G), shot(0.9, 0.8, G)] })), true);
  assert.equal(objective('top-corners').met(state({ shots: [shot(0.1, 0.9, G), shot(0.9, 0.3, G)] })), false);
});

test('winning objectives only pass once the match is won', () => {
  assert.equal(objective('by-two').met(state({ you: [G, G, G], them: [S, S, M] })), false);
  assert.equal(objective('by-two').met(state({ you: [G, G, G], them: [S, S, M], result: 'win' })), true);
  assert.equal(objective('no-miss').met(state({ you: [G, G, G, G, G], them: [G, G, G, G, S], result: 'win' })), true);
  assert.equal(objective('no-miss').met(state({ you: [G, S, G, G, G], them: [S, S, G, M, S], result: 'win' })), false);
});

test('saved progress starts fresh from nothing or junk', () => {
  const fresh = { level: 1, best: 1, stars: [] };
  for (const raw of [null, '', 'not json', '{"level":-3}', '[]']) {
    const p = Rules.readProgress(raw);
    assert.deepEqual({ ...p, stars: [...p.stars] }, fresh, String(raw));
  }
  const read = Rules.readProgress('{"level":4,"best":6,"stars":[1,2,"x",3.5]}');
  assert.equal(read.level, 4);
  assert.equal(read.best, 6);
  assert.deepEqual([...read.stars], [1, 2]);
});

test('a match moves you on the ladder, keeps your best and adds a star once', () => {
  let p = Rules.readProgress(null);
  p = Rules.recordMatch(p, 'win', true);
  assert.deepEqual({ ...p, stars: [...p.stars] }, { level: 2, best: 2, stars: [1] });
  p = Rules.recordMatch(p, 'lose', false);
  assert.deepEqual({ ...p, stars: [...p.stars] }, { level: 1, best: 2, stars: [1] });
  p = Rules.recordMatch(p, 'win', true);
  assert.deepEqual([...p.stars], [1], 'no second star for the same match');
});

// ---- The strike ----
test('the leg starts at rest and cocks back the opposite way before the strike', () => {
  assert.equal(Rules.kickPose({ x: 0.9, y: 0.5 }, 0).leg, 0);
  const back = Rules.kickPose({ x: 0.9, y: 0.5 }, 0.35).leg;
  const through = Rules.kickPose({ x: 0.9, y: 0.5 }, 1).leg;
  assert.ok(back > 0 && through < 0, `back ${back}, through ${through}`);
});

test('shooting left sweeps the leg across the body; shooting right opens it out', () => {
  assert.ok(Rules.kickPose({ x: 0.1, y: 0.4 }, 1).leg > 0.3);
  assert.ok(Rules.kickPose({ x: 0.9, y: 0.4 }, 1).leg < -0.6);
});

test('a high shot gets a bigger follow-through than a low one to the same side', () => {
  const high = Math.abs(Rules.kickPose({ x: 0.9, y: 0.9 }, 1).leg);
  const low = Math.abs(Rules.kickPose({ x: 0.9, y: 0.1 }, 1).leg);
  assert.ok(high > low * 1.3, `${high} vs ${low}`);
});

test('every strike swings the leg forward, a high one most; a central shot is nearly all forward', () => {
  assert.equal(Rules.kickPose({ x: 0.5, y: 0.9 }, 0.35).lift, 0, 'no lift while cocking back');
  const high = Rules.kickPose({ x: 0.5, y: 0.9 }, 1), low = Rules.kickPose({ x: 0.5, y: 0.1 }, 1);
  assert.ok(high.lift > low.lift && low.lift > 0.3, `${high.lift} vs ${low.lift}`);
  assert.ok(Math.abs(high.leg) < 0.2 && high.lift > 0.8, 'down the middle: forward, not sideways');
  assert.ok(high.arm > 0.4, 'the arm still swings out for balance');
});

test('the body leans away from the leg and the other arm swings out with it', () => {
  const k = Rules.kickPose({ x: 0.9, y: 0.6 }, 1);
  assert.ok(Math.sign(k.lean) === Math.sign(k.leg) && Math.abs(k.lean) < Math.abs(k.leg));
  assert.ok(k.arm > 0.5 && k.arm <= 1);
  assert.equal(Rules.kickPose({ x: 0.9, y: 0.6 }, 0).arm, 0);
});
