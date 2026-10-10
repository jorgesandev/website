export type Player = 0 | 1;
export type Mode = "manual" | "assisted" | "automatic";
export type Point = {
  id: string;
  rallyId: string;
  winner: Player;
  source: "manual" | "camera";
  at: number;
};
export type Match = {
  version: 1;
  id: string;
  players: [string, string];
  bestOf: 1 | 3 | 5;
  firstServer: Player;
  initialNear: Player;
  mode: Mode;
  points: Point[];
  created: number;
  finished?: number;
};
export type Score = {
  points: [number, number];
  sets: [number, number];
  games: [number, number][];
  server: Player;
  winner: Player | null;
  near: Player;
  sideKey: string;
};
export const other = (player: Player): Player => (player === 0 ? 1 : 0);

export function scoreMatch(match: Match): Score {
  let points: [number, number] = [0, 0];
  const sets: [number, number] = [0, 0];
  const games: [number, number][] = [];
  let winner: Player | null = null;
  const seen = new Set<string>();
  for (const point of match.points) {
    if (winner !== null || seen.has(point.rallyId)) continue;
    seen.add(point.rallyId);
    points[point.winner] += 1;
    if (
      points[point.winner] >= 11 &&
      points[point.winner] - points[other(point.winner)] >= 2
    ) {
      sets[point.winner] += 1;
      games.push([...points]);
      if (sets[point.winner] >= Math.ceil(match.bestOf / 2)) {
        winner = point.winner;
      } else {
        points = [0, 0];
      }
    }
  }
  const gameIndex = winner === null ? games.length : games.length - 1;
  const first = gameIndex % 2 ? other(match.firstServer) : match.firstServer;
  const total = points[0] + points[1];
  const turns =
    points[0] >= 10 && points[1] >= 10 ? total - 20 : Math.floor(total / 2);
  const server = turns % 2 ? other(first) : first;
  const deciding = gameIndex === match.bestOf - 1 && Math.max(...points) >= 5;
  const swapped = (gameIndex + Number(deciding)) % 2;
  return {
    points,
    sets,
    games,
    server,
    winner,
    near: swapped ? other(match.initialNear) : match.initialNear,
    sideKey: `${gameIndex}:${Number(deciding)}`,
  };
}

export function addPoint(match: Match, point: Point): Match {
  if (
    match.finished ||
    scoreMatch(match).winner !== null ||
    match.points.some((item) => item.rallyId === point.rallyId)
  )
    return match;
  return { ...match, points: [...match.points, point] };
}

export function undoPoint(match: Match): Match {
  return { ...match, finished: undefined, points: match.points.slice(0, -1) };
}

export function correctPoint(match: Match): Match {
  if (!match.points.length) return match;
  const points = [...match.points];
  const last = points[points.length - 1];
  points[points.length - 1] = {
    ...last,
    winner: other(last.winner),
    source: "manual",
  };
  return { ...match, finished: undefined, points };
}

export function resultText(match: Match): string {
  const score = scoreMatch(match);
  const partial =
    score.winner === null ? ` · En curso ${score.points.join("–")}` : "";
  return `🏓 ${match.players[0]} ${score.sets[0]}–${score.sets[1]} ${match.players[1]} · ${score.games.map((game) => game.join("–")).join(", ")}${partial} · PingPong`;
}

export function isMatch(value: unknown): value is Match {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Match>;
  return (
    item.version === 1 &&
    typeof item.id === "string" &&
    Array.isArray(item.players) &&
    item.players.length === 2 &&
    item.players.every(
      (name) => typeof name === "string" && name.length <= 40,
    ) &&
    [1, 3, 5].includes(item.bestOf ?? 0) &&
    [0, 1].includes(item.firstServer ?? -1) &&
    [0, 1].includes(item.initialNear ?? -1) &&
    ["manual", "assisted", "automatic"].includes(item.mode ?? "") &&
    Number.isFinite(item.created) &&
    (item.finished === undefined || Number.isFinite(item.finished)) &&
    Array.isArray(item.points) &&
    item.points.length <= 10000 &&
    item.points.every(
      (point) =>
        point &&
        typeof point.id === "string" &&
        typeof point.rallyId === "string" &&
        [0, 1].includes(point.winner) &&
        ["manual", "camera"].includes(point.source) &&
        Number.isFinite(point.at),
    )
  );
}
