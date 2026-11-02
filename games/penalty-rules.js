// Penalty shootout rules: the keeper's dive and whether a shot scores. No DOM, so tests can run it in Node.
// Coordinates are normalised to the goal mouth: x 0 = left post, 1 = right post; y 0 = ground, 1 = crossbar.
(function (root) {
  var SHOTS = 5;
  var MARGIN = 0.15;
  var WOBBLE = 0.06;
  var DIVE_X = { left: 0.15, centre: 0.5, right: 0.85 };
  var REACH = { y: 0.4, rx: 0.2, ry: 0.5 };
  var LINES = ['Try another corner', "The keeper's having a day", 'Unlucky', 'Not bad', 'Nice finish', 'Perfect'];

  function sideOf(x) {
    return x < 1 / 3 ? 'left' : x > 2 / 3 ? 'right' : 'centre';
  }

  // A click on the goal, or null if it's too far outside to count as a shot.
  function toTarget(x, y) {
    if (x < -MARGIN || x > 1 + MARGIN || y < -MARGIN || y > 1 + MARGIN) return null;
    return { x: x, y: Math.max(0, y) };
  }

  // Where the ball actually goes: a little off the aim, so shots tight to the frame can go wide or over.
  // A longer kick wobbles more (wobble defaults to the penalty-spot value).
  function scatter(target, rand, wobble) {
    var w = wobble || WOBBLE;
    return {
      x: target.x + (rand() * 2 - 1) * w,
      y: Math.max(0, target.y + (rand() * 2 - 1) * w)
    };
  }

  // The keeper commits before seeing the ball, leaning toward the side used most this round.
  // lean is how much each past shot to a side pulls the dive there; better keepers lean harder.
  function pickDive(history, rand, lean) {
    var w = { left: 0.4, centre: 0.2, right: 0.4 }, pull = lean || 0.1;
    history.forEach(function (t) {
      var side = sideOf(t.x);
      if (side !== 'centre') w[side] += pull;
    });
    var r = rand() * (w.left + w.centre + w.right);
    if (r < w.left) return 'left';
    if (r < w.left + w.centre) return 'centre';
    return 'right';
  }

  // Outside the frame is a miss; inside the keeper's reach (an ellipse around the dive) is a save.
  // reach scales that ellipse: above 1 is a keeper who gets to more.
  function resolveShot(target, dive, reach) {
    if (target.x < 0 || target.x > 1 || target.y > 1) return 'miss';
    var k = reach || 1;
    var dx = (target.x - DIVE_X[dive]) / (REACH.rx * k);
    var dy = (target.y - REACH.y) / (REACH.ry * k);
    return dx * dx + dy * dy <= 1 ? 'save' : 'goal';
  }

  function scoreLine(results) {
    var goals = results.filter(function (r) { return r === 'goal'; }).length;
    return goals + ' / ' + SHOTS + ': ' + LINES[goals];
  }

  // ---- Shootout against the computer ----
  // Each side's kicks are a list of outcomes ('goal', 'save', 'miss'). You kick first, then the sides alternate.

  function goals(kicks) {
    return kicks.filter(function (k) { return k === 'goal'; }).length;
  }

  // Whose kick is next: yours whenever both sides have taken the same number.
  function nextKicker(you, them) {
    return you.length === them.length ? 'you' : 'them';
  }

  // 'win', 'lose', or null while undecided. In the first five each, it ends as soon as one side can't
  // catch up with the kicks it has left; after that it's sudden death, settled after each pair of kicks.
  function shootoutResult(you, them) {
    var a = goals(you), b = goals(them);
    if (you.length <= SHOTS && them.length <= SHOTS) {
      if (a > b + SHOTS - them.length) return 'win';
      if (b > a + SHOTS - you.length) return 'lose';
      return null;
    }
    if (you.length === them.length && a !== b) return a > b ? 'win' : 'lose';
    return null;
  }

  // Where the computer aims: mostly towards a corner, sometimes down the middle,
  // and now and then over the bar or wide. accuracy (0 to 1) tucks corner shots closer to the posts
  // and makes misses rarer.
  function pickShot(rand, accuracy) {
    var a = accuracy || 0, band = 0.22 * (1 - 0.5 * a);
    var side = rand(), r = rand(), aim = {
      x: side < 0.4 ? 0.08 + band * r : side < 0.8 ? 0.92 - band * r : 0.38 + 0.24 * r,
      y: 0.1 + 0.75 * rand()
    };
    if (rand() < 0.12 - 0.08 * a) {
      if (rand() < 0.5) aim.y = 1.08;
      else aim.x = aim.x < 0.5 ? -0.08 : 1.08;
    }
    return aim;
  }

  // ---- The ladder: each win moves you up a match, each loss down one ----
  var TOP = 8;

  function nextLevel(level, result) {
    return result === 'win' ? level + 1 : Math.max(1, level - 1);
  }

  // How hard a match is. Everything ramps from match 1 to match TOP, then holds.
  //   reach:    their keeper covers more of the goal
  //   lean:     their keeper reads your favourite side faster
  //   accuracy: their striker aims tighter and misses less
  //   distance: the ball sits further out, so the goal looks smaller
  //   wobble:   and your shot strays more from your aim
  function difficulty(level) {
    var t = Math.min(1, Math.max(0, (level - 1) / (TOP - 1)));
    return {
      reach: 1 + 0.3 * t,
      lean: 0.1 + 0.15 * t,
      accuracy: t,
      distance: 1 + 0.35 * t,
      wobble: WOBBLE * (1 + 0.5 * t)
    };
  }

  // ---- The strike: how a right-footed striker's body moves, seen from behind ----
  // aim is where the ball is going (goal coordinates); p runs 0 to 1 through the strike: the first
  // 35% cocks the leg back, the rest swings it through. Angles are in radians in the canvas sense:
  // positive turns the leg (hanging down from the hip) towards the left, negative towards the right.
  //   leg:  to the striker's left the leg sweeps across his body; to his right it follows through
  //         out to the right (open body). Higher shots get a bigger follow-through.
  //   lift: 0 to 1, how far the leg swings forward, towards the goal and away from the camera.
  //         Seen from behind that shortens it, foot rising; every strike has some, high ones most.
  //         A shot down the middle is nearly all lift and hardly any sideways swing.
  //   lean: the body leans away from the leg for balance.
  //   arm:  0 to 1, how far the opposite arm swings out.
  function kickPose(aim, p) {
    var x = Math.min(1.2, Math.max(-0.2, aim.x)), y = Math.min(1.2, Math.max(0, aim.y));
    var through = (0.7 - 1.6 * x) * (0.75 + 0.45 * y);
    var back = -through * 0.3;
    var q = Math.min(1, Math.max(0, p));
    var smooth = function (v) { return 1 - Math.pow(1 - v, 3); };
    var swing = q < 0.35 ? 0 : smooth((q - 0.35) / 0.65);
    var leg = q < 0.35 ? back * smooth(q / 0.35) : back + (through - back) * swing;
    var lift = Math.min(1, 0.45 + 0.5 * y) * swing;
    return { leg: leg, lift: lift, lean: 0.12 * leg, arm: Math.min(1, Math.max(Math.abs(leg), 0.6 * lift)) };
  }

  // ---- Objectives: one per match, for a star ----
  // Each check gets the match so far: you/them (outcomes), shots (your kicks: { target, outcome }) and
  // result ('win', 'lose' or null while playing). Ones that need a win only pass once the match is won.
  function isTop(t) { return t.y > 0.6; }
  var OBJECTIVES = [
    { id: 'save-one', text: 'Save a penalty', met: function (m) {
      return m.them.indexOf('save') >= 0;
    } },
    { id: 'first-three', text: 'Score your first three kicks', met: function (m) {
      return m.you.length >= 3 && m.you.slice(0, 3).every(function (k) { return k === 'goal'; });
    } },
    { id: 'clean-three', text: 'Keep them out for their first three', met: function (m) {
      return m.them.length >= 3 && m.them.slice(0, 3).indexOf('goal') < 0;
    } },
    { id: 'every-side', text: 'Score left, centre and right', met: function (m) {
      var seen = {};
      m.shots.forEach(function (s) { if (s.outcome === 'goal') seen[sideOf(s.target.x)] = true; });
      return !!(seen.left && seen.centre && seen.right);
    } },
    { id: 'save-two', text: 'Save two penalties', met: function (m) {
      return m.them.filter(function (k) { return k === 'save'; }).length >= 2;
    } },
    { id: 'top-corners', text: 'Score in both top corners', met: function (m) {
      var left = false, right = false;
      m.shots.forEach(function (s) {
        if (s.outcome !== 'goal' || !isTop(s.target)) return;
        if (sideOf(s.target.x) === 'left') left = true;
        if (sideOf(s.target.x) === 'right') right = true;
      });
      return left && right;
    } },
    { id: 'by-two', text: 'Win by two goals or more', met: function (m) {
      return m.result === 'win' && goals(m.you) - goals(m.them) >= 2;
    } },
    { id: 'no-miss', text: 'Win without missing a kick', met: function (m) {
      return m.result === 'win' && m.you.every(function (k) { return k === 'goal'; });
    } }
  ];

  // Match 1 gets the first objective, match 2 the second, and so on, round again after the last.
  function objectiveFor(level) {
    return OBJECTIVES[(level - 1) % OBJECTIVES.length];
  }

  // ---- Saved progress: { level, best, stars: [matches whose objective you've met] } ----

  // Whatever was stored (or nothing, or junk) becomes valid progress.
  function readProgress(raw) {
    var p = null;
    try { p = JSON.parse(raw); } catch (e) { p = null; }
    if (!p || typeof p !== 'object' || Array.isArray(p)) p = {};
    var level = Math.floor(p.level) >= 1 ? Math.floor(p.level) : 1;
    var best = Math.floor(p.best) >= level ? Math.floor(p.best) : level;
    var stars = Array.isArray(p.stars) ? p.stars.filter(function (n) {
      return typeof n === 'number' && Math.floor(n) === n && n >= 1;
    }) : [];
    return { level: level, best: best, stars: stars };
  }

  // After a match: move on the ladder, keep the best match reached, and add a star for this
  // match's objective the first time it's met.
  function recordMatch(progress, result, objectiveMet) {
    var level = nextLevel(progress.level, result);
    var stars = progress.stars.slice();
    if (objectiveMet && stars.indexOf(progress.level) < 0) stars.push(progress.level);
    return { level: level, best: Math.max(progress.best, level), stars: stars };
  }

  root.PenaltyRules = {
    SHOTS: SHOTS,
    toTarget: toTarget,
    scatter: scatter,
    pickDive: pickDive,
    resolveShot: resolveShot,
    scoreLine: scoreLine,
    sideOf: sideOf,
    goals: goals,
    nextKicker: nextKicker,
    shootoutResult: shootoutResult,
    pickShot: pickShot,
    nextLevel: nextLevel,
    difficulty: difficulty,
    kickPose: kickPose,
    OBJECTIVES: OBJECTIVES,
    objectiveFor: objectiveFor,
    readProgress: readProgress,
    recordMatch: recordMatch
  };
})(this);
