export type XY = { x: number; y: number };
export type Corners = [XY, XY, XY, XY];
export type Plane = { u: number; v: number; inside: boolean };

export function validCorners(points: XY[]): points is Corners {
  if (
    points.length !== 4 ||
    points.some(
      (p) =>
        !Number.isFinite(p.x) ||
        !Number.isFinite(p.y) ||
        p.x < 0 ||
        p.x > 1 ||
        p.y < 0 ||
        p.y > 1,
    )
  )
    return false;
  const crosses = points.map((p, i) => {
    const q = points[(i + 1) % 4];
    const r = points[(i + 2) % 4];
    return (q.x - p.x) * (r.y - q.y) - (q.y - p.y) * (r.x - q.x);
  });
  const area =
    Math.abs(
      points.reduce((sum, p, i) => {
        const q = points[(i + 1) % 4];
        return sum + p.x * q.y - p.y * q.x;
      }, 0),
    ) / 2;
  return (
    area > 0.04 &&
    (crosses.every((c) => c > 0.001) || crosses.every((c) => c < -0.001))
  );
}

// Invert the projective mapping from unit table coordinates to image coordinates.
// This maps observations onto a plane; it does not recover the ball's 3D height.
export function tablePlane(corners: Corners): (point: XY) => Plane {
  const [p0, p1, p2, p3] = corners;
  const dx1 = p1.x - p2.x,
    dx2 = p3.x - p2.x;
  const dy1 = p1.y - p2.y,
    dy2 = p3.y - p2.y;
  const dx3 = p0.x - p1.x + p2.x - p3.x;
  const dy3 = p0.y - p1.y + p2.y - p3.y;
  const det = dx1 * dy2 - dx2 * dy1;
  const g = Math.abs(det) < 1e-9 ? 0 : (dx3 * dy2 - dx2 * dy3) / det;
  const h = Math.abs(det) < 1e-9 ? 0 : (dx1 * dy3 - dx3 * dy1) / det;
  const a = p1.x - p0.x + g * p1.x,
    b = p3.x - p0.x + h * p3.x;
  const d = p1.y - p0.y + g * p1.y,
    e = p3.y - p0.y + h * p3.y;
  return (p) => {
    const A = a - p.x * g,
      B = b - p.x * h;
    const D = d - p.y * g,
      E = e - p.y * h;
    const C = p.x - p0.x,
      F = p.y - p0.y;
    const denominator = A * E - B * D;
    if (Math.abs(denominator) < 1e-9) return { u: -99, v: -99, inside: false };
    const u = (C * E - B * F) / denominator,
      v = (A * F - C * D) / denominator;
    return { u, v, inside: u >= 0 && u <= 1 && v >= 0 && v <= 1 };
  };
}
