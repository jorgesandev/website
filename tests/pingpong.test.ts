import assert from "node:assert/strict";
import { test } from "node:test";
import {
  addPoint,
  correctPoint,
  isMatch,
  other,
  scoreMatch,
  undoPoint,
  type Match,
  type Player,
} from "../app/pingpong/core/match.ts";
import {
  tablePlane,
  validCorners,
  type Corners,
} from "../app/pingpong/vision/geometry.ts";
import {
  BallTracker,
  type Suggestion,
} from "../app/pingpong/vision/tracker.ts";
const base = (): Match => ({
  version: 1,
  id: "test",
  players: ["A", "B"],
  bestOf: 3,
  firstServer: 0,
  initialNear: 0,
  mode: "manual",
  points: [],
  created: 1,
});
function point(
  match: Match,
  winner: Player,
  id = `p${match.points.length}`,
): Match {
  return addPoint(match, {
    id,
    rallyId: id,
    winner,
    source: "manual",
    at: match.points.length + 1,
  });
}
function many(match: Match, winners: Player[]): Match {
  return winners.reduce((m, player) => point(m, player), match);
}
const corners: Corners = [
  { x: 0.1, y: 0.85 },
  { x: 0.9, y: 0.85 },
  { x: 0.9, y: 0.15 },
  { x: 0.1, y: 0.15 },
];

test("service rotates every two points, then every point at deuce", () => {
  let m = base();
  assert.equal(scoreMatch(m).server, 0);
  m = point(m, 0);
  assert.equal(scoreMatch(m).server, 0);
  m = point(m, 1);
  assert.equal(scoreMatch(m).server, 1);
  m = many(
    base(),
    Array.from({ length: 20 }, (_, i) => (i % 2) as Player),
  );
  assert.deepEqual(scoreMatch(m).points, [10, 10]);
  assert.equal(scoreMatch(m).server, 0);
  m = point(m, 0);
  assert.equal(scoreMatch(m).winner, null);
  assert.equal(scoreMatch(m).server, 1);
  m = point(m, 1);
  assert.equal(scoreMatch(m).server, 0);
  m = many(m, [1, 1]);
  assert.deepEqual(scoreMatch(m).games, [[11, 13]]);
});
test("a set requires an advantage of two and first server alternates between sets", () => {
  const m = many(base(), [
    ...Array<Player>(10).fill(0),
    ...Array<Player>(9).fill(1),
    0,
  ]);
  const score = scoreMatch(m);
  assert.deepEqual(score.games, [[11, 9]]);
  assert.deepEqual(score.points, [0, 0]);
  assert.equal(score.server, 1);
  assert.equal(score.near, 1);
});
test("match stops at the required sets; undo and correction can reopen it", () => {
  const m = many(base(), Array<Player>(22).fill(0));
  assert.equal(scoreMatch(m).winner, 0);
  assert.equal(point(m, 1), m);
  const undone = undoPoint(m);
  assert.equal(scoreMatch(undone).winner, null);
  assert.deepEqual(scoreMatch(undone).points, [10, 0]);
  const corrected = correctPoint(m);
  assert.equal(scoreMatch(corrected).winner, null);
  assert.deepEqual(scoreMatch(corrected).points, [10, 1]);
});
test("deciding-set side change happens exactly when either player reaches five", () => {
  let m = many(base(), [
    ...Array<Player>(11).fill(0),
    ...Array<Player>(11).fill(1),
  ]);
  assert.equal(scoreMatch(m).near, 0);
  m = many(m, [0, 1, 0, 1, 0, 1, 0, 1]);
  assert.equal(scoreMatch(m).near, 0);
  m = point(m, 1);
  assert.equal(scoreMatch(m).near, 1);
  assert.equal(scoreMatch(undoPoint(m)).near, 0);
});
test("duplicate rally IDs cannot add multiple points", () => {
  const m = point(base(), 0, "same-rally");
  assert.equal(point(m, 1, "same-rally"), m);
  assert.deepEqual(
    scoreMatch({ ...m, points: [...m.points, { ...m.points[0], winner: 1 }] })
      .points,
    [1, 0],
  );
});
test("finished matches cannot score; undo opens interrupted match", () => {
  const m = { ...point(base(), 0), finished: 3 };
  assert.equal(point(m, 1), m);
  assert.equal(undoPoint(m).finished, undefined);
});
test("import validator rejects malformed, nonfinite and oversized input", () => {
  assert.equal(isMatch(base()), true);
  assert.equal(isMatch(null), false);
  assert.equal(isMatch({ ...base(), players: ["A"] }), false);
  assert.equal(isMatch({ ...base(), firstServer: 9 }), false);
  assert.equal(isMatch({ ...base(), created: Infinity }), false);
  assert.equal(isMatch({ ...base(), points: [null] }), false);
  assert.equal(
    isMatch({
      ...point(base(), 0),
      points: [{ id: "x", rallyId: "x", winner: 4, source: "manual", at: 0 }],
    }),
    false,
  );
});
test("calibration rejects crossed, tiny and out-of-frame tables", () => {
  assert.equal(validCorners(corners), true);
  assert.equal(
    validCorners([corners[0], corners[2], corners[1], corners[3]]),
    false,
  );
  assert.equal(
    validCorners([
      { x: 0, y: 0 },
      { x: 0.01, y: 0 },
      { x: 0.01, y: 0.01 },
      { x: 0, y: 0.01 },
    ]),
    false,
  );
  assert.equal(validCorners([{ x: -1, y: 0 }, ...corners.slice(1)]), false);
});
test("table homography maps corners and centre correctly for a trapezoid", () => {
  const table: Corners = [
    { x: 0.1, y: 0.9 },
    { x: 0.9, y: 0.9 },
    { x: 0.7, y: 0.2 },
    { x: 0.3, y: 0.2 },
  ];
  const project = tablePlane(table);
  const targets = [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ];
  table.forEach((p, i) => {
    const mapped = project(p);
    assert.ok(Math.abs(mapped.u - targets[i][0]) < 1e-6);
    assert.ok(Math.abs(mapped.v - targets[i][1]) < 1e-6);
  });
  assert.ok(Math.abs(project({ x: 0.5, y: 0.5 }).u - 0.5) < 1e-6);
});
function frame(x?: number, y = 45, orange = false): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(160 * 90 * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = 20;
    pixels[i + 1] = 30;
    pixels[i + 2] = 40;
    pixels[i + 3] = 255;
  }
  if (x !== undefined)
    for (let py = y - 1; py <= y + 1; py++)
      for (let px = x - 1; px <= x + 1; px++) {
        const i = (py * 160 + px) * 4;
        pixels[i] = 255;
        pixels[i + 1] = orange ? 150 : 255;
        pixels[i + 2] = orange ? 20 : 255;
      }
  return pixels;
}
const tracker = (color: "white" | "orange" = "white") =>
  new BallTracker({ corners, color, sensitivity: 50, diameter: 9 });
test("moving white ball is tracked; static white pixels are not a rally", () => {
  const t = tracker();
  t.process(frame(60), 160, 90, 100);
  t.process(frame(65), 160, 90, 133);
  const result = t.process(frame(70), 160, 90, 166);
  assert.ok(result.ball);
  assert.ok(Math.abs(result.ball.x - 70 / 160) < 0.01);
  const still = tracker();
  for (let i = 0; i < 40; i++) {
    const r = still.process(frame(70), 160, 90, i * 33);
    assert.equal(r.suggestion, null);
  }
});
test("orange mode filters white balls and detects moving orange", () => {
  const t = tracker("orange");
  t.process(frame(60, 45, true), 160, 90, 100);
  t.process(frame(65, 45, true), 160, 90, 133);
  assert.ok(t.process(frame(70, 45, true), 160, 90, 166).ball);
  t.reset();
  t.process(frame(60), 160, 90, 100);
  t.process(frame(65), 160, 90, 133);
  assert.equal(t.process(frame(70), 160, 90, 166).ball, null);
});
test("losing the ball without observed crossings never assigns a winner", () => {
  const t = tracker();
  for (let i = 0; i < 15; i++)
    t.process(frame(35 + i * 4, 65), 160, 90, 100 + i * 33);
  for (let i = 0; i < 50; i++) {
    const r = t.process(frame(), 160, 90, 600 + i * 33);
    assert.equal(r.suggestion, null);
  }
});
test("a missing ball after a rally requires human confirmation, not an automatic winner", () => {
  const t = tracker();
  let result;
  for (let i = 0; i < 40; i++) {
    const y = Math.round(60 - 30 * Math.sin((i / 39) * Math.PI));
    result = t.process(frame(60 + i, y), 160, 90, 100 + i * 33);
  }
  for (let i = 0; i < 40; i++)
    result = t.process(frame(), 160, 90, 1420 + i * 33);
  assert.ok(result?.suggestion);
  assert.equal(result.suggestion.strong, false);
  assert.equal(result.suggestion.loserSide, null);
});
test("long capture gaps reset evidence and never imply a point", () => {
  const t = tracker();
  t.process(frame(60), 160, 90, 100);
  t.process(frame(65), 160, 90, 133);
  t.process(frame(70), 160, 90, 166);
  const r = t.process(frame(75), 160, 90, 1000);
  assert.equal(r.suggestion, null);
  assert.equal(r.phase, "waiting");
});
test("other player helper is stable", () => {
  assert.equal(other(0), 1);
  assert.equal(other(1), 0);
});

test("two compatible bounce reversals after crossings produce one experimental proposal", () => {
  const t = tracker();
  const ys: number[] = [];
  for (let i = 0; i < 15; i++) ys.push(65 - i * 3);
  for (let i = 0; i < 15; i++) ys.push(23 + i * 3);
  ys.push(67, 70, 73, 76, 73, 70, 67, 64, 62, 65, 68, 71, 74, 71, 68);
  let proposal: Suggestion | null = null;
  for (const [i, y] of ys.entries()) {
    const r = t.process(frame(60 + i, y), 160, 90, 100 + i * 33);
    if (r.suggestion) proposal = r.suggestion;
  }
  assert.ok(proposal);
  assert.equal(proposal.strong, true);
  assert.equal(proposal.loserSide, 0);
  const repeated = t.process(frame(), 160, 90, 1600);
  assert.equal(repeated.suggestion?.id, proposal.id);
  t.reset();
  assert.equal(t.process(frame(), 160, 90, 1633).suggestion, null);
});
