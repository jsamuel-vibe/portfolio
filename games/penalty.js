// Penalty shootout for the footer game stage, against the computer. Draws the goal, keeper and striker
// on a pitch that ends the page, seen from behind the striker. On your kick, tapping the goal shoots there;
// on theirs, tapping the left, middle or right of the goal picks your dive. penalty-rules.js decides the
// dives, the computer's aim, whether a shot scores and who wins.
(function () {
  var Rules = window.PenaltyRules;
  var RUNUP = 360, FLIGHT = 500, RESULT = 1500, REPLAY = 700;
  var SIDE = { left: -1, centre: 0, right: 1 };
  var C = {
    frame: '#111111', net: 'rgba(17, 17, 17, .14)', muted: 'rgba(17, 17, 17, .6)', page: '#FFFFFF',
    grass: '#7DB956', grassAlt: '#76B24F', line: 'rgba(255, 255, 255, .75)',
    keeper: '#F2683C', gloves: '#FFE14D', kit: '#1F2A44',
    striker: '#2F5BD3', skin: '#E0A37A', hair: '#2B1D14', ink: '#111111',
    slot: 'rgba(17, 17, 17, .25)', scored: '#22A55B', failed: '#E5484D'
  };
  // Your side wears blue, the computer's red; each keeper has its own colour.
  var KITS = {
    you: { striker: '#2F5BD3', keeper: '#1FAE98' },
    them: { striker: '#D64545', keeper: '#F2683C' }
  };
  var CONFETTI = ['#FFE14D', '#2F5BD3', '#F2683C', '#22A55B', '#E5484D', '#FFFFFF'];

  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function clamp01(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }

  // A theme stylesheet can restyle the goal and the text above it through --game-* properties.
  // Re-read on every theme switch; anything the theme doesn't set goes back to the light default.
  var BASE = {};
  Object.keys(C).forEach(function (k) { BASE[k] = C[k]; });
  function themed() {
    var css = getComputedStyle(document.documentElement);
    [['page', '--game-page'], ['frame', '--game-frame'], ['net', '--game-net'], ['muted', '--game-muted'],
     ['grass', '--game-grass'], ['grassAlt', '--game-grass-alt'], ['lights', '--game-lights'],
     ['slot', '--game-slot'], ['scored', '--game-scored'], ['failed', '--game-failed']].forEach(function (p) {
      var v = css.getPropertyValue(p[1]).trim();
      C[p[0]] = v || BASE[p[0]];
    });
  }

  GameStage.register('penalty', function (container) {
    themed();
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    // Screen readers hear each result; the canvas itself is decorative.
    var live = document.createElement('p');
    live.className = 'visually-hidden';
    live.setAttribute('aria-live', 'polite');
    container.append(canvas, live);

    var W = 0, H = 0, DPR = 1, L = null;
    // Phases: 'ready' (waiting for your kick), 'dive' (their striker waits until you pick a side),
    // 'runup', 'flight', 'result', and 'final' once the shootout is decided.
    var phase = 'ready', t = 0, clock = 0;
    // Progress (the match you're on, your best and your stars) is kept in this browser between visits.
    // Storage can be missing or blocked; the game then just starts at match 1 each time.
    var STORE = 'penalty-shootout-progress';
    function loadProgress() {
      try { return Rules.readProgress(window.localStorage.getItem(STORE)); } catch (e) { return Rules.readProgress(null); }
    }
    function saveProgress() {
      try { window.localStorage.setItem(STORE, JSON.stringify(progress)); } catch (e) { /* not saved */ }
    }
    var progress = loadProgress();
    // The ladder: which match you're on, how hard it is (Rules.difficulty) and its objective.
    var level = progress.level, D = Rules.difficulty(level), objective = Rules.objectiveFor(level);
    // shots keeps where your kicks went, for the corner objectives; met turns true once the objective is done.
    function freshMatch() { return { level: level, you: [], them: [], shots: [], over: null, met: false, star: false }; }
    var match = freshMatch();
    var shot = null, history = [], confetti = [];
    var raf = 0, last = 0, running = false;

    // Scene geometry, all derived from the goal size so it scales to any stage.
    // gw0/gh0 are the goal seen from the penalty spot; they size everything near you (striker, ball,
    // score dots, text). Later matches move the ball further out, so the goal itself (gw/gh) and the
    // keeper in it shrink by the match's distance.
    function layout() {
      var gw0 = Math.min(W * (W < 560 ? 0.86 : 0.6), H * 1.2), gh0 = gw0 / 3;
      var gw = gw0 / D.distance, gh = gw / 3;
      var gy = H * 0.58;
      // The grass is a wide, gentle dome that runs off both edges, tall enough that the posts stand on it.
      var grx = Math.max(W * 0.75, gw0 * 1.2);
      var gry = (H - gy + gh0 * 0.08) / Math.sqrt(1 - Math.pow(gw0 / 2 / grx, 2));
      return {
        gw0: gw0, gh0: gh0, gw: gw, gh: gh, gx: (W - gw) / 2, gy: gy, grx: grx, gry: gry,
        bx: W / 2, by: gy + (H - gy) * 0.62, r0: gw0 * 0.028, r1: gw * 0.016
      };
    }

    function toScreen(target) {
      return { x: L.gx + target.x * L.gw, y: L.gy - target.y * L.gh };
    }

    function circle(x, y, r) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    function rrect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
      ctx.fill();
    }

    // ---- State ----

    function setPhase(p) { phase = p; t = 0; }

    function kicker() { return Rules.nextKicker(match.you, match.them); }

    // Your kick. Their keeper reads your recent aims (history); the ball goes where it actually lands.
    function shoot(aim) {
      var dive = Rules.pickDive(history.slice(-Rules.SHOTS), Math.random, D.lean);
      var target = Rules.scatter(aim, Math.random, D.wobble);
      shot = { by: 'you', target: target, dive: dive, outcome: Rules.resolveShot(target, dive, D.reach) };
      history.push(aim);
      setPhase('runup');
    }

    // Their kick. The aim is fixed now, before you choose, so your dive is a real guess; the striker
    // only runs up once you've picked a side.
    function theirKick() {
      shot = { by: 'them', target: Rules.scatter(Rules.pickShot(Math.random, D.accuracy), Math.random), dive: null, outcome: null };
      setPhase('dive');
    }

    function newMatch() {
      match = freshMatch();
      shot = null;
      D = Rules.difficulty(level);
      objective = Rules.objectiveFor(level);
      if (W) L = layout();
      live.textContent = 'Match ' + level + '. Objective: ' + objective.text + '.';
      setPhase('ready');
    }

    // Once met, an objective stays met for the rest of the match.
    function checkObjective() {
      if (match.met) return false;
      match.met = objective.met({ you: match.you, them: match.them, shots: match.shots, result: match.over });
      return match.met;
    }

    function score() {
      return Rules.goals(match.you) + '–' + Rules.goals(match.them);
    }

    function update(dt) {
      t += dt;
      if (phase === 'runup' && t >= RUNUP) {
        if (shot.by === 'them') shot.outcome = Rules.resolveShot(shot.target, shot.dive);
        setPhase('flight');
      } else if (phase === 'flight' && t >= FLIGHT) {
        match[shot.by].push(shot.outcome);
        if (shot.by === 'you') match.shots.push({ target: shot.target, outcome: shot.outcome });
        var said = resultText();
        live.textContent = said + (/[.!]$/.test(said) ? ' ' : '. ') +
          'You ' + Rules.goals(match.you) + ', them ' + Rules.goals(match.them) + '.' +
          (checkObjective() ? ' Objective done.' : '');
        setPhase('result');
      } else if (phase === 'result' && t >= RESULT) {
        shot = null;
        match.over = Rules.shootoutResult(match.you, match.them);
        if (match.over) {
          checkObjective();
          var stars = progress.stars.length;
          progress = Rules.recordMatch(progress, match.over, match.met);
          match.star = progress.stars.length > stars;
          level = progress.level;
          saveProgress();
          live.textContent = (match.over === 'win' ? 'You win ' : 'You lose ') + score() + '.' +
            (match.star ? ' Star earned.' : '') + ' Tap to play match ' + level + '.';
          if (match.over === 'win') celebrate();
          setPhase('final');
        } else if (kicker() === 'them') {
          theirKick();
        } else {
          setPhase('ready');
        }
      }
      confetti = confetti.filter(function (c) {
        c.vy += 0.0011 * dt;
        c.vx *= Math.pow(0.998, dt);
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.rot += c.vr * dt;
        return c.y < H + 20;
      });
    }

    // A won shootout: a burst of confetti from the goal mouth. Skipped for reduced motion.
    function celebrate() {
      if (GameStage.reduceMotion) return;
      for (var i = 0; i < 160; i++) {
        var a = -Math.PI / 2 + (Math.random() * 2 - 1) * 1.1, v = 0.45 + Math.random() * 0.7;
        confetti.push({
          x: W / 2 + (Math.random() * 2 - 1) * L.gw * 0.3, y: L.gy - L.gh * 0.4,
          vx: Math.cos(a) * v, vy: Math.sin(a) * v,
          rot: Math.random() * Math.PI, vr: (Math.random() * 2 - 1) * 0.012,
          w: 5 + Math.random() * 5, h: 3 + Math.random() * 3,
          color: CONFETTI[i % CONFETTI.length]
        });
      }
    }

    function drawConfetti() {
      confetti.forEach(function (c) {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h * Math.abs(Math.cos(c.rot * 2)) + 1);
        ctx.restore();
      });
    }

    // ---- Poses ----

    function diveProgress() {
      if (phase === 'flight') return ease(clamp01(t / (FLIGHT * 0.9)));
      return phase === 'result' ? 1 : 0;
    }

    // The dive itself: p runs 0 (set) to 1 (full stretch).
    function keeperPose(p) {
      var side = shot && shot.dive ? SIDE[shot.dive] : 0;
      return {
        x: L.gx + (0.5 + side * 0.1 * p) * L.gw,
        y: L.gy - (side ? Math.sin(p * Math.PI * 0.6) : p * 0.5) * L.gh * 0.24,
        angle: side * p * 1.15,
        reach: p > 0
      };
    }

    // The keeper as drawn: the dive, plus how he waits and how he reacts.
    //   Waiting: sways side to side and claps his gloves every couple of seconds.
    //   Ball in the air: wide eyes.
    //   Saved: gets up holding the ball over his head and jumps, grinning.
    //   Beaten: ends up flat on the grass thumping it, or slumps if he stayed in the middle.
    //   Missed: a relieved little hop.
    // mood sets his face; clap, thump and slump move his arms.
    function keeperNow() {
      var k = keeperPose(diveProgress()), still = GameStage.reduceMotion;
      k.mood = 'neutral'; k.clap = 0; k.thump = 0; k.slump = 0;
      if (phase === 'flight') k.mood = 'surprised';
      if (phase !== 'flight' && phase !== 'result') {
        if (!still) {
          k.x += Math.sin(clock * 0.0035) * L.gw * 0.035;
          var beat = clock % 1900;
          k.clap = beat < 260 ? Math.sin(Math.PI * beat / 260) : 0;
        }
        return k;
      }
      if (phase !== 'result' || !shot) return k;
      var side = shot.dive ? SIDE[shot.dive] : 0;
      var hop = still ? 0 : Math.abs(Math.sin(Math.max(0, t - 650) * 0.011)) * L.gh * 0.12;
      if (shot.outcome === 'save') {
        var up = ease(clamp01((t - 350) / 300));
        k.angle *= 1 - up;
        k.y = lerp(k.y, L.gy - (t > 650 ? hop : 0), up);
        k.mood = up > 0.3 ? 'happy' : 'surprised';
      } else if (shot.outcome === 'goal') {
        var down = ease(clamp01((t - 150) / 350));
        if (side) {
          k.angle = lerp(k.angle, side * 1.45, down);
          k.y = lerp(k.y, L.gy - L.gh * 0.08, down);
          k.thump = t > 600 && !still ? Math.abs(Math.sin((t - 600) * 0.018)) : 0;
        } else {
          k.slump = down;
          k.reach = down < 0.5;
        }
        k.mood = 'sad';
      } else {
        var back = ease(clamp01((t - 300) / 300));
        k.angle *= 1 - back;
        k.y = lerp(k.y, L.gy - (t > 650 ? hop * 0.6 : 0), back);
        k.reach = back < 0.5;
        k.mood = back > 0.3 ? 'happy' : 'surprised';
      }
      return k;
    }

    // Where the gloves are; a saved ball ends up here.
    function handPoint(k) {
      var d = L.gh * 0.62 * 1.32;
      return { x: k.x + d * Math.sin(k.angle), y: k.y - d * Math.cos(k.angle) };
    }

    function strikerPose() {
      var rest = { x: L.bx - L.gw0 * 0.16, y: L.by + (H - L.by) * 0.4 };
      var kick = { x: L.bx - L.gw0 * 0.07, y: L.by + (H - L.by) * 0.15 };
      // A steady run-up all the way to the ball (no slowing down before the strike).
      var p = phase === 'runup' ? clamp01(t / RUNUP) : phase === 'flight' || phase === 'result' ? 1 : 0;
      var still = GameStage.reduceMotion, y = lerp(rest.y, kick.y, p);
      // Waiting for the kick: up on his toes.
      if ((phase === 'ready' || phase === 'dive') && !still) y -= Math.abs(Math.sin(clock * 0.009)) * L.gh0 * 0.03;
      // After it: a goal sends both arms up and him jumping; anything else, hands on his head.
      var cheer = 0, despair = 0;
      if (phase === 'result' && shot) {
        var r = ease(clamp01((t - 450) / 250));
        if (shot.outcome === 'goal') {
          cheer = r;
          if (!still && t > 700) y -= Math.abs(Math.sin((t - 700) * 0.012)) * L.gh0 * 0.1;
        } else {
          despair = r;
        }
      }
      return {
        x: lerp(rest.x, kick.x, p),
        y: y,
        running: phase === 'runup',
        kick: strike(),
        cheer: cheer,
        despair: despair
      };
    }

    // The strike, shaped by where the ball is going (Rules.kickPose). Timed so the foot meets the
    // ball the instant it leaves: the leg cocks back while he's still running in (55-80% of the
    // run-up), swings down to the ball by the end of it, follows through as the ball flies, holds,
    // then settles back to standing.
    var FOLLOW = 120;
    function strike() {
      if (!shot || phase === 'ready' || phase === 'dive') return null;
      var r = t / RUNUP;
      var q = phase === 'runup' ? (r < 0.8 ? 0.35 * clamp01((r - 0.55) / 0.25) : 0.35 + 0.35 * clamp01((r - 0.8) / 0.2))
        : phase === 'flight' ? 0.7 + 0.3 * clamp01(t / FOLLOW) : 1;
      var k = Rules.kickPose(shot.target, q);
      var settle = phase === 'result' ? 1 - ease(clamp01((t - 350) / 400)) : 1;
      return { leg: k.leg * settle, lift: k.lift * settle, lean: k.lean * settle, arm: k.arm * settle };
    }

    function ballState(rp, keeper) {
      var b = { x: L.bx, y: L.by, r: L.r0, alpha: 1, ground: L.by };
      if (!shot || (phase !== 'flight' && phase !== 'result')) return b;
      var q = phase === 'flight' ? clamp01(t / FLIGHT) : 1;
      var end = shot.outcome !== 'save' ? toScreen(shot.target)
        : handPoint(phase === 'result' ? keeper : keeperPose(1));
      var cx = (L.bx + end.x) / 2 + (shot.target.x - 0.5) * L.gw * 0.15;
      var cy = Math.min(L.by, end.y) - L.gh * 0.2;
      var u = 1 - q;
      b.x = u * u * L.bx + 2 * u * q * cx + q * q * end.x;
      b.y = u * u * L.by + 2 * u * q * cy + q * q * end.y;
      b.r = lerp(L.r0, L.r1, q);
      b.ground = lerp(L.by, L.gy, q);
      if (shot.outcome === 'goal') b.y = lerp(b.y, L.gy - L.r1, ease(rp));
      if (shot.outcome === 'miss') {
        var wide = shot.target.x < 0 ? -1 : shot.target.x > 1 ? 1 : 0;
        b.x += wide * rp * L.gw * 0.3;
        b.y -= (wide ? 0 : L.gh * 0.4) * rp;
        b.alpha = 1 - rp;
      }
      return b;
    }

    // ---- Drawing ----

    // The pitch the page ends on: soft mowing stripes and the penalty spot.
    function drawGround() {
      var g = L, top = H - g.gry, i;
      if (C.lights) drawMasts();
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(W / 2, H, g.grx, g.gry, 0, Math.PI, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      for (i = 0; i < 6; i++) {
        var y0 = top + (H - top) * Math.pow(i / 6, 1.4);
        var y1 = top + (H - top) * Math.pow((i + 1) / 6, 1.4);
        ctx.fillStyle = i % 2 ? C.grassAlt : C.grass;
        ctx.fillRect(0, y0, W, y1 - y0 + 1);
      }
      if (C.lights) drawPool();
      ctx.restore();
      if (C.lights) drawBeams();
      ctx.fillStyle = C.line;
      ctx.beginPath();
      ctx.ellipse(g.bx, g.by + g.r0 * 0.8, g.r0 * 0.5, g.r0 * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // The net mesh is pulled toward the ball when a goal goes in.
    function drawGoal(dent) {
      var g = L, top = g.gy - g.gh, cols = 24, rows = 8, i, j;
      function mesh(at, steps) {
        for (var k = 0; k <= steps; k++) {
          var p = at(k / steps);
          if (dent) {
            var dx = dent.x - p[0], dy = dent.y - p[1];
            var f = dent.k * Math.exp(-(dx * dx + dy * dy) / (g.gh * g.gh * 0.08));
            p = [p[0] + dx * f, p[1] + dy * f];
          }
          if (k) ctx.lineTo(p[0], p[1]);
          else ctx.moveTo(p[0], p[1]);
        }
      }
      if (C.page !== 'transparent') {
        ctx.fillStyle = C.page;
        ctx.fillRect(g.gx, top, g.gw, g.gh);
      }
      ctx.strokeStyle = C.net;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (i = 0; i <= cols; i++) mesh(function (s) { return [g.gx + g.gw * i / cols, top + g.gh * s]; }, rows);
      for (j = 0; j <= rows; j++) mesh(function (s) { return [g.gx + g.gw * s, top + g.gh * j / rows]; }, cols);
      ctx.stroke();
      ctx.strokeStyle = C.frame;
      ctx.lineWidth = Math.max(3, g.gw * 0.012);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(g.gx, g.gy); ctx.lineTo(g.gx, top);
      ctx.lineTo(g.gx + g.gw, top); ctx.lineTo(g.gx + g.gw, g.gy);
      ctx.stroke();
    }

    // ---- Sticker characters ----
    // Flat cartoon players with a white die-cut border and a hard drop shadow, like a sheet of
    // stickers. Both are drawn from a simple skeleton (hips, knees, feet, shoulders, elbows, hands,
    // head) that follows the pose, so the run-up, the strike and the dive all come from the joints.

    // Darken (k < 0) or lighten (k > 0) a #RRGGBB colour.
    function shade(hex, k) {
      var n = parseInt(hex.slice(1), 16), out = '#';
      [16, 8, 0].forEach(function (b) {
        var c = (n >> b) & 255;
        c = Math.round(k > 0 ? c + (255 - c) * k : c * (1 + k));
        out += ('0' + c.toString(16)).slice(-2);
      });
      return out;
    }

    // A polyline through [[x, y], ...] with round ends and joints.
    function poly(pts, w) {
      ctx.lineWidth = w;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      pts.forEach(function (pt, i) { if (i) ctx.lineTo(pt[0], pt[1]); else ctx.moveTo(pt[0], pt[1]); });
      ctx.stroke();
    }

    // Elbows bow outward from the line shoulder-to-hand.
    function elbow(a, b, side) {
      return [(a[0] + b[0]) / 2 + side * 0.06, (a[1] + b[1]) / 2 + 0.02];
    }

    // Joints are written in body units, then scaled to pixels.
    function scaled(J, u) {
      Object.keys(J).forEach(function (n) { if (Array.isArray(J[n])) J[n] = [J[n][0] * u, J[n][1] * u]; });
      J.headR *= u;
      J.u = u;
      return J;
    }

    // Facing you, in the keeper's own (rotated) frame. Reaching, the hands go up past the head;
    // handPoint uses the same spot, so a saved ball ends up between the gloves.
    function keeperJoints(k) {
      var hx = k.reach ? 0.14 : 0.4, hy = k.reach ? -1.32 : -0.46;
      // Clapping brings the gloves together in front; slumping drops them to his sides.
      if (!k.reach && k.clap) { hx = lerp(hx, 0.06, k.clap); hy = lerp(hy, -0.66, k.clap); }
      if (k.slump) { hx = lerp(hx, 0.24, k.slump); hy = lerp(hy, -0.3, k.slump); }
      // Thumping the grass: the gloves beat down towards his body.
      if (k.thump) hy += k.thump * 0.16;
      var J = {
        hipL: [-0.07, -0.42], hipR: [0.07, -0.42], kneeL: [-0.11, -0.21], kneeR: [0.11, -0.21],
        footL: [-0.12, -0.02], footR: [0.12, -0.02], shL: [-0.16, -0.78], shR: [0.16, -0.78],
        handL: [-hx, hy], handR: [hx, hy], head: [0, -0.99], headR: 0.11
      };
      J.elL = elbow(J.shL, J.handL, -1);
      J.elR = elbow(J.shR, J.handR, 1);
      return scaled(J, L.gh * 0.62);
    }

    // Seen from behind. Legs swing on the run-up; on the strike the right leg follows the shot
    // (Rules.kickPose: sideways swing, plus lift, which shortens it as it swings towards the goal)
    // and the left arm reaches out for balance.
    function strikerJoints(s) {
      var swing = s.running ? Math.sin(clock * 0.03) * 0.35 : 0, k = s.kick, arm = k ? k.arm : 0;
      function leg(x, a, lift) {
        var len = 0.42 * (1 - 0.5 * (lift || 0));
        return { hip: [x, -0.42], knee: [x + Math.sin(-a) * len / 2, -0.42 + Math.cos(a) * len / 2],
          foot: [x + Math.sin(-a) * len, -0.42 + Math.cos(a) * len] };
      }
      var l = leg(-0.07, k ? 0 : swing), r = leg(0.07, k ? k.leg : -swing, k ? k.lift : 0);
      var J = {
        hipL: l.hip, kneeL: l.knee, footL: l.foot, hipR: r.hip, kneeR: r.knee, footR: r.foot,
        shL: [-0.16, -0.8], shR: [0.16, -0.8],
        handL: [lerp(-0.27, -0.42, arm), lerp(-0.48 + swing * 0.1, -0.84, arm)],
        handR: [lerp(0.27, 0.22, arm), lerp(-0.48 - swing * 0.1, -0.48, arm)],
        head: [0, -1.03], headR: 0.12
      };
      // Both arms up to cheer, or both hands to his head.
      [['handL', -1], ['handR', 1]].forEach(function (h) {
        var c = s.cheer || 0, d = s.despair || 0, at = J[h[0]];
        if (c) J[h[0]] = [lerp(at[0], h[1] * 0.22, c), lerp(at[1], -1.4, c)];
        if (d) J[h[0]] = [lerp(at[0], h[1] * 0.15, d), lerp(at[1], -1.1, d)];
      });
      J.elL = elbow(J.shL, J.handL, -1);
      J.elR = elbow(J.shR, J.handR, 1);
      return scaled(J, L.gh0 * 0.7);
    }

    // One player. Every piece is drawn three times: as a dark shadow nudged down, as a white
    // border (the piece fattened), then in its own colours with the face or shirt number on top.
    function sticker(J, shirt, keeper, mood) {
      var u = J.u, o = Math.max(1.5, u * 0.035);
      var head = J.head, hr = J.headR * 1.3, top = head[1] - hr;
      function pieces(pass) {
        var grow = pass === 'color' ? 0 : o, solid = pass === 'shadow' ? 'rgba(0, 0, 0, .32)' : '#FFFFFF';
        function fill(c) { ctx.fillStyle = pass === 'color' ? c : solid; }
        function line(c) { ctx.strokeStyle = pass === 'color' ? c : solid; }
        function round(x, y, w, h, r) {
          ctx.beginPath();
          ctx.roundRect(x - grow, y - grow, w + 2 * grow, h + 2 * grow, r + grow);
          ctx.fill();
        }
        function arms() {
          line(shirt);
          poly([J.shL, J.elL, J.handL], 0.1 * u + 2 * grow);
          poly([J.shR, J.elR, J.handR], 0.1 * u + 2 * grow);
          fill(keeper ? C.gloves : C.skin);
          circle(J.handL[0], J.handL[1], (keeper ? 0.075 : 0.05) * u + grow);
          circle(J.handR[0], J.handR[1], (keeper ? 0.075 : 0.05) * u + grow);
        }
        // Legs (keepers wear long socks in their shirt colour), boots, shorts.
        line(keeper ? shade(shirt, -0.15) : C.skin);
        poly([J.hipL, J.kneeL, J.footL], 0.11 * u + 2 * grow);
        poly([J.hipR, J.kneeR, J.footR], 0.11 * u + 2 * grow);
        fill('#1C1C1C');
        circle(J.footL[0], J.footL[1], 0.06 * u + grow);
        circle(J.footR[0], J.footR[1], 0.06 * u + grow);
        fill(C.kit);
        round(-0.17 * u, -0.52 * u, 0.34 * u, 0.15 * u, 0.05 * u);
        // The striker's arms go behind his body (we see his back); the keeper's go in front.
        if (!keeper) arms();
        // Body, ears (seen from behind), head.
        fill(shirt);
        round(-0.18 * u, -0.84 * u, 0.36 * u, 0.36 * u, 0.09 * u);
        if (keeper) arms();
        if (!keeper) {
          fill(C.skin);
          circle(-hr * 0.95, head[1] + 0.01 * u, 0.04 * u + grow);
          circle(hr * 0.95, head[1] + 0.01 * u, 0.04 * u + grow);
        }
        fill(keeper ? C.skin : C.hair);
        circle(head[0], head[1], hr + grow);
        if (pass !== 'color') return;
        if (keeper) {
          // Hair over the top of the head, then two eyes, rosy cheeks and a small smile.
          ctx.save();
          ctx.beginPath(); ctx.rect(-hr * 1.2, top - u, hr * 2.4, u + hr * 0.75); ctx.clip();
          fill(C.hair); circle(head[0], head[1], hr);
          ctx.restore();
          face(head, u, mood);
        } else {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '700 ' + Math.round(0.15 * u) + 'px "Plus Jakarta Sans", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('10', 0, -0.66 * u);
        }
      }
      ctx.save(); ctx.translate(0, o * 1.6); pieces('shadow'); ctx.restore();
      pieces('edge');
      pieces('color');
    }

    // The keeper's face: neutral (dot eyes, small smile), surprised (wide eyes, an 'o'),
    // happy (smiling eyes, a big open grin) or sad (a frown).
    function face(head, u, mood) {
      var ey = head[1] + 0.02 * u, my = head[1] + 0.06 * u;
      ctx.fillStyle = 'rgba(232, 112, 112, .55)';
      circle(-0.1 * u, my, 0.025 * u);
      circle(0.1 * u, my, 0.025 * u);
      ctx.fillStyle = '#1C1C1C';
      ctx.strokeStyle = '#1C1C1C';
      ctx.lineWidth = Math.max(1, 0.016 * u);
      ctx.lineCap = 'round';
      if (mood === 'happy') {
        [-1, 1].forEach(function (sd) {
          ctx.beginPath(); ctx.arc(sd * 0.055 * u, ey + 0.01 * u, 0.022 * u, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke();
        });
        ctx.fillStyle = '#7A3B2E';
        ctx.beginPath(); ctx.arc(0, my - 0.005 * u, 0.045 * u, 0, Math.PI); ctx.closePath(); ctx.fill();
        return;
      }
      var er = mood === 'surprised' ? 0.028 : 0.02;
      circle(-0.055 * u, ey, er * u);
      circle(0.055 * u, ey, er * u);
      ctx.strokeStyle = '#7A3B2E';
      ctx.beginPath();
      if (mood === 'surprised') ctx.arc(0, my + 0.015 * u, 0.022 * u, 0, Math.PI * 2);
      else if (mood === 'sad') ctx.arc(0, my + 0.045 * u, 0.035 * u, 1.15 * Math.PI, 1.85 * Math.PI);
      else ctx.arc(0, my, 0.035 * u, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
    }

    function drawKeeper(k, shirt) {
      ctx.save();
      ctx.translate(k.x, k.y);
      ctx.rotate(k.angle);
      sticker(keeperJoints(k), shirt, true, k.mood);
      ctx.restore();
    }

    // The whole body leans (about the standing foot) away from the kicking leg.
    function drawStriker(s, shirt) {
      ctx.save();
      ctx.translate(s.x, s.y);
      if (s.kick) ctx.rotate(s.kick.lean);
      sticker(strikerJoints(s), shirt, false);
      ctx.restore();
    }

    function drawBall(b) {
      ctx.globalAlpha = b.alpha;
      ctx.fillStyle = C.lights ? 'rgba(0, 0, 0, .4)' : 'rgba(17, 17, 17, .18)';
      ctx.beginPath();
      ctx.ellipse(b.x, b.ground + b.r * 0.6, b.r * 1.1, b.r * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      circle(b.x, b.y, b.r);
      ctx.strokeStyle = 'rgba(17, 17, 17, .35)';
      ctx.lineWidth = Math.max(1, b.r * 0.12);
      ctx.stroke();
      ctx.fillStyle = C.ink;
      circle(b.x, b.y, b.r * 0.35);
      ctx.globalAlpha = 1;
    }

    // Said from your side: your goals and their misses are the good news.
    function resultText() {
      if (shot.by === 'you') return shot.outcome === 'goal' ? 'GOAL!' : shot.outcome === 'save' ? 'Saved' : 'Miss';
      return shot.outcome === 'save' ? 'SAVED!' : shot.outcome === 'goal' ? 'They score' : 'They miss!';
    }

    // Above the crossbar, a row of dots per side, as on a TV shootout tracker: empty until the kick
    // is taken, then green for a goal and red for a save or a miss. Sudden death adds dots.
    // The side to kick next has its label lit.
    function drawHud() {
      var r = Math.max(5, L.gh0 * 0.04), gap = r * 3.2;
      var count = Math.max(Rules.SHOTS, match.you.length, match.them.length);
      var x0 = W / 2 - gap * (count - 1) / 2;
      var size = Math.max(11, Math.min(14, r * 2.4));
      var turn = match.over ? null : kicker();
      [['you', 'You'], ['them', 'Them']].forEach(function (row, n) {
        var kicks = match[row[0]], y = L.gy - L.gh - r * (n ? 3 : 6.2);
        ctx.font = '500 ' + Math.round(size) + 'px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = turn === row[0] ? C.frame : C.muted;
        ctx.fillText(row[1], x0 - r * 2.4, y);
        // Right of the dots: your best match on the top row, your stars on the bottom one.
        var side = n ? (progress.stars.length ? '\u2605 ' + progress.stars.length : '')
          : (progress.best > 1 ? 'Best ' + progress.best : '');
        if (side) {
          ctx.textAlign = 'left';
          ctx.fillStyle = C.muted;
          ctx.fillText(side, x0 + gap * (count - 1) + r * 2.4, y);
        }
        // Above the dots, one line: the match, then its objective with a hollow star that fills
        // in green once it's done.
        if (!n) {
          var head = 'Match ' + match.level + '  \u00b7  ';
          var aim = (match.met ? '\u2605 ' : '\u2606 ') + objective.text;
          var hw = ctx.measureText(head).width, hx = W / 2 - (hw + ctx.measureText(aim).width) / 2;
          ctx.textAlign = 'left';
          ctx.fillStyle = C.muted;
          ctx.fillText(head, hx, y - r * 3.4);
          ctx.fillStyle = match.met ? C.scored : C.frame;
          ctx.fillText(aim, hx + hw, y - r * 3.4);
        }
        for (var i = 0; i < count; i++) {
          var res = kicks[i], x = x0 + i * gap;
          if (!res) {
            ctx.strokeStyle = C.slot;
            ctx.lineWidth = Math.max(1.5, r * 0.3);
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.stroke();
            continue;
          }
          ctx.save();
          ctx.fillStyle = res === 'goal' ? C.scored : C.failed;
          if (C.lights) { ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = r * 1.6; }
          circle(x, y, r);
          ctx.restore();
        }
      });
    }

    // On their kick, the goal splits into three faint zones (left, middle, right) until you pick one;
    // the one you picked stays lit.
    function drawDiveZones() {
      if (!shot || shot.by !== 'them' || (phase !== 'dive' && phase !== 'runup')) return;
      var top = L.gy - L.gh, third = L.gw / 3, pulse = (1 + Math.sin(clock * 0.006)) / 2;
      var tint = C.lights ? '255, 255, 255' : '17, 17, 17', k = C.lights ? 1 : 0.6;
      ['left', 'centre', 'right'].forEach(function (side, i) {
        var picked = shot.dive === side;
        if (shot.dive && !picked) return;
        var alpha = (picked ? 0.2 : 0.07 + 0.07 * pulse) * k;
        ctx.fillStyle = 'rgba(' + tint + ', ' + alpha + ')';
        ctx.fillRect(L.gx + third * i + 3, top + 3, third - 6, L.gh - 6);
      });
      // While you're choosing, two dividers mark the thirds.
      if (!shot.dive) {
        ctx.strokeStyle = 'rgba(' + tint + ', ' + 0.35 * k + ')';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 5]);
        ctx.beginPath();
        for (var i = 1; i < 3; i++) {
          ctx.moveTo(L.gx + third * i, top + 6);
          ctx.lineTo(L.gx + third * i, L.gy - 6);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // The shootout's result stays in the goal mouth until the next tap starts a new match.
    function drawVerdict() {
      var text = (match.over === 'win' ? 'You win ' : 'You lose ') + score();
      var size = L.gh0 * 0.24 * (0.85 + 0.15 * ease(clamp01(t / 300)));
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '600 ' + Math.round(size) + 'px "Plus Jakarta Sans", sans-serif';
      ctx.lineJoin = 'round';
      ctx.lineWidth = size * 0.12;
      ctx.strokeStyle = C.ink;
      ctx.strokeText(text, W / 2, L.gy - L.gh * 0.6);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(text, W / 2, L.gy - L.gh * 0.6);
      if (t > REPLAY) {
        ctx.globalAlpha = clamp01((t - REPLAY) / 300);
        ctx.font = '500 ' + Math.round(Math.max(13, size * 0.38)) + 'px "Plus Jakarta Sans", sans-serif';
        ctx.lineWidth = size * 0.08;
        var next = (match.star ? '\u2605 Star earned  ·  ' : '') + 'Tap to play match ' + level;
        ctx.strokeText(next, W / 2, L.gy - L.gh * 0.3);
        ctx.fillText(next, W / 2, L.gy - L.gh * 0.3);
        ctx.globalAlpha = 1;
      }
    }

    function drawResultText(rp) {
      var text = resultText();
      var size = L.gh0 * 0.32 * (0.8 + 0.2 * ease(clamp01(rp * 4)));
      ctx.globalAlpha = 1 - clamp01((rp - 0.4) * 3.5);
      ctx.font = '600 ' + Math.round(size) + 'px "Plus Jakarta Sans", sans-serif';
      var fit = L.gw0 * 0.9 / ctx.measureText(text).width;
      if (fit < 1) {
        size *= fit;
        ctx.font = '600 ' + Math.round(size) + 'px "Plus Jakarta Sans", sans-serif';
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = size * 0.12;
      ctx.strokeStyle = C.ink;
      ctx.strokeText(text, W / 2, L.gy - L.gh * 0.55);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(text, W / 2, L.gy - L.gh * 0.55);
      ctx.globalAlpha = 1;
    }

    // ---- Night match (dark theme only) ----
    // Two floodlight masts stand far behind the goal; their beams meet in one pool of light
    // on the penalty area, and the players cast faint shadows away from each mast.

    function lightRig() {
      // The masts belong to the stadium, so they stay put as the ball moves back.
      var g = L, lampW = Math.max(22, g.gw0 * 0.06), lampH = lampW * 0.45;
      // The light lands on the goal mouth, not the penalty spot, so the striker stands at its edge.
      var spot = { x: W / 2, y: g.gy + (H - g.gy) * 0.06, rx: g.gw * 0.55 };
      spot.ry = spot.rx * 0.22;
      var masts = [-1, 1].map(function (side) {
        return { x: W / 2 + side * Math.min(W * 0.43, g.gw0 * 0.85), y: Math.max(lampH / 2 + 6, g.gy - g.gh0 * 2.2) };
      }).filter(function (m) {
        // Narrow stages have no room beside the goal; the lit pitch carries the night look alone.
        return Math.abs(m.x - W / 2) >= g.gw0 / 2 + lampW;
      });
      return { lampW: lampW, lampH: lampH, spot: spot, masts: masts };
    }

    // Behind the pitch: the masts end on the far touchline, so they read as distant and tall.
    function drawMasts() {
      var rig = lightRig(), w = rig.lampW, h = rig.lampH;
      rig.masts.forEach(function (m) {
        ctx.fillStyle = '#444444';
        ctx.fillRect(m.x - 1, m.y, 2, L.gy + L.gh * 0.05 - m.y);
        ctx.fillStyle = '#2E2E2E';
        rrect(m.x - w / 2, m.y - h / 2, w, h, 2);
        ctx.fillStyle = '#FFF8DC';
        var cols = 4, rows = 2, pad = h * 0.18, r = Math.max(1.2, (h - pad * 3) / 4);
        for (var i = 0; i < cols; i++) {
          for (var j = 0; j < rows; j++) {
            circle(m.x - w / 2 + pad + r + i * (w - 2 * pad - 2 * r) / (cols - 1),
              m.y - h / 2 + pad + r + j * (h - 2 * pad - 2 * r), r);
          }
        }
      });
    }

    // On the pitch (inside the ground clip): the pool where the beams land, flattened by perspective.
    function drawPool() {
      var s = lightRig().spot;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.scale(1, s.ry / s.rx);
      var pool = ctx.createRadialGradient(0, 0, 0, 0, 0, s.rx);
      pool.addColorStop(0, 'rgba(255, 250, 225, .2)');
      pool.addColorStop(0.6, 'rgba(255, 250, 225, .08)');
      pool.addColorStop(1, 'rgba(255, 250, 225, 0)');
      ctx.fillStyle = pool;
      ctx.fillRect(-s.rx, -s.rx, s.rx * 2, s.rx * 2);
      ctx.restore();
    }

    // Each beam fans out from its lamp towards the pool, but dissolves in the air: it is gone by
    // about crossbar height, so it never reaches the goal or the grass.
    function drawBeams() {
      var rig = lightRig(), s = rig.spot;
      rig.masts.forEach(function (m) {
        var beam = ctx.createLinearGradient(m.x, m.y, lerp(m.x, s.x, 0.45), lerp(m.y, s.y, 0.45));
        beam.addColorStop(0, 'rgba(255, 250, 225, .14)');
        beam.addColorStop(0.5, 'rgba(255, 250, 225, .05)');
        beam.addColorStop(1, 'rgba(255, 250, 225, 0)');
        ctx.fillStyle = beam;
        ctx.beginPath();
        ctx.moveTo(m.x - rig.lampW / 2, m.y);
        ctx.lineTo(m.x + rig.lampW / 2, m.y);
        ctx.lineTo(s.x + s.rx * 0.45, s.y);
        ctx.lineTo(s.x - s.rx * 0.45, s.y);
        ctx.closePath();
        ctx.fill();
      });
    }

    // A dark contact shadow under the feet and a faint one thrown away from each mast.
    function drawShadow(x, y, w) {
      if (!C.lights) return;
      ctx.fillStyle = 'rgba(0, 0, 0, .32)';
      ctx.beginPath();
      ctx.ellipse(x, y, w, w * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0, 0, 0, .14)';
      lightRig().masts.forEach(function (m) {
        var away = x > m.x ? 1 : -1;
        ctx.beginPath();
        ctx.ellipse(x + away * w * 1.1, y + w * 0.04, w * 1.3, w * 0.16, away * 0.06, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function draw() {
      if (!L) return;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var rp = phase === 'result' ? clamp01(t / RESULT) : 0;
      var kp = keeperNow(), b = ballState(rp, kp);
      var inNet = shot && phase === 'result' && shot.outcome === 'goal';
      ctx.clearRect(0, 0, W, H);
      drawGround();
      drawGoal(inNet ? { x: b.x, y: b.y, k: 0.4 * (1 - rp) } : null);
      if (inNet) drawBall(b);
      drawDiveZones();
      // The kicking side's striker faces the other side's keeper.
      var by = shot ? shot.by : kicker(), keeperSide = by === 'you' ? 'them' : 'you';
      var sp = strikerPose();
      drawShadow(kp.x, L.gy, L.gh * 0.62 * 0.22);
      drawKeeper(kp, KITS[keeperSide].keeper);
      if (!inNet) drawBall(b);
      drawShadow(sp.x, sp.y, L.gh0 * 0.7 * 0.24);
      drawStriker(sp, KITS[by].striker);
      drawHud();
      if (phase === 'result') drawResultText(rp);
      if (phase === 'final') drawVerdict();
      drawConfetti();
    }

    // ---- Loop ----

    function frame(now) {
      var dt = Math.min(50, now - last);
      last = now;
      clock += dt;
      update(dt);
      draw();
      if (running) raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }

    function halt() {
      running = false;
      cancelAnimationFrame(raf);
    }

    // The light/dark toggle: pick up the new colours and redraw straight away, even while paused.
    document.addEventListener('themechange', function () { themed(); draw(); });

    // ---- Input ----

    function goalPoint(e) {
      var r = canvas.getBoundingClientRect();
      return Rules.toTarget((e.clientX - r.left - L.gx) / L.gw, (L.gy - (e.clientY - r.top)) / L.gh);
    }

    // On their kick, any tap picks a dive by which third of the goal it lines up with.
    function divePoint(e) {
      var r = canvas.getBoundingClientRect();
      return Rules.sideOf(clamp01((e.clientX - r.left - L.gx) / L.gw));
    }

    function canDive() {
      return phase === 'dive';
    }

    canvas.addEventListener('pointerdown', function (e) {
      if (!L) return;
      if (phase === 'final' && t > REPLAY) return newMatch();
      if (canDive()) {
        shot.dive = divePoint(e);
        setPhase('runup');
        return;
      }
      if (phase !== 'ready') return;
      var target = goalPoint(e);
      if (target) shoot(target);
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!L) return;
      canvas.style.cursor = phase === 'ready' && goalPoint(e) ? 'crosshair'
        : canDive() || (phase === 'final' && t > REPLAY) ? 'pointer' : '';
    });

    return {
      resize: function (w, h) {
        if (!w || !h) return;
        W = w;
        H = h;
        // Capped at 2x: denser screens would draw much bigger frames for no visible gain.
        DPR = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.round(w * DPR);
        canvas.height = Math.round(h * DPR);
        L = layout();
        draw();
      },
      pause: halt,
      resume: start
    };
  });
})();
