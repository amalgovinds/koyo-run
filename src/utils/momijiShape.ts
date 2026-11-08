// src/utils/momijiShape.ts
//
// Procedural Japanese maple (Acer palmatum, "momiji") leaf in unit space:
// the palm centre is (0, 0), the leaf points up (-y), the petiole hangs down (+y),
// and the tallest lobe tip sits near y = -1.1.
//
// Anatomy modelled here:
//   - palmate: 7 lobes fanning out from one point, the middle lobe the longest
//   - deeply divided: the sinuses between lobes cut a third of the way to the centre
//   - each lobe is lanceolate with a pointed tip and finely serrated edges
//   - one midrib per lobe, a heart-shaped base, and a slightly curved petiole

export interface PathLike {
  moveTo(x: number, y: number): void
  lineTo(x: number, y: number): void
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void
  closePath(): void
}

interface Lobe {
  angle: number // degrees from straight up, clockwise
  length: number
}

const LOBES: Lobe[] = [
  { angle: -112, length: 0.62 },
  { angle: -74, length: 0.9 },
  { angle: -37, length: 1.05 },
  { angle: 0, length: 1.12 },
  { angle: 37, length: 1.05 },
  { angle: 74, length: 0.9 },
  { angle: 112, length: 0.62 },
]

const SINUS_DEPTH = 0.31 // sinus radius as a fraction of the neighbouring lobes' mean length
const EDGE_BULGE = 0.05 // how far lobe edges bow outwards
const TOOTH_DEPTH = 0.04 // serration height at the base of a lobe; tapers to ~0 at the tip
const TOOTH_SPACING = 0.16 // approximate distance between teeth along an edge
const BASAL_ANGLE = 148 // direction of the two sinuses beside the petiole
const BASAL_RADIUS = 0.34
const NOTCH = { x: 0, y: 0.17 } // where the two basal edges meet, at the petiole

interface Pt {
  x: number
  y: number
}

interface Node extends Pt {
  lobe: number // index of the lobe this node belongs to; -1 for sinuses
}

const rad = (deg: number): number => (deg * Math.PI) / 180
const polar = (deg: number, r: number): Pt => ({
  x: Math.sin(rad(deg)) * r,
  y: -Math.cos(rad(deg)) * r,
})

function lerp(a: Pt, b: Pt, t: number): Pt {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

function buildNodes(): Node[] {
  const nodes: Node[] = [{ ...polar(-BASAL_ANGLE, BASAL_RADIUS), lobe: -1 }]
  LOBES.forEach((lobe, i) => {
    nodes.push({ ...polar(lobe.angle, lobe.length), lobe: i })
    const next = LOBES[i + 1]
    if (next) {
      const mid = (lobe.angle + next.angle) / 2
      const radius = ((lobe.length + next.length) / 2) * SINUS_DEPTH
      nodes.push({ ...polar(mid, radius), lobe: -1 })
    }
  })
  nodes.push({ ...polar(BASAL_ANGLE, BASAL_RADIUS), lobe: -1 })
  return nodes
}

// Draws one lobe edge from a to b: a gently bowed curve with small teeth
// that lean toward the lobe tip.
function addEdge(path: PathLike, a: Node, b: Node, lobeIndex: number, towardTip: boolean): void {
  const lobe = LOBES[lobeIndex]
  if (!lobe) return

  const mid = lerp(a, b, 0.5)
  const axis = polar(lobe.angle, 1)
  const along = mid.x * axis.x + mid.y * axis.y
  // Outward normal: from the lobe's axis toward this edge
  let nx = mid.x - axis.x * along
  let ny = mid.y - axis.y * along
  const nLen = Math.hypot(nx, ny) || 1
  nx /= nLen
  ny /= nLen

  const control: Pt = { x: mid.x + nx * EDGE_BULGE, y: mid.y + ny * EDGE_BULGE }
  const onCurve = (t: number): Pt => {
    const u = 1 - t
    return {
      x: u * u * a.x + 2 * u * t * control.x + t * t * b.x,
      y: u * u * a.y + 2 * u * t * control.y + t * t * b.y,
    }
  }

  const teeth = Math.max(2, Math.round(Math.hypot(b.x - a.x, b.y - a.y) / TOOTH_SPACING))
  const lean = towardTip ? 0.75 : 0.25 // where the tooth tip sits inside its segment
  for (let j = 0; j < teeth; j++) {
    const t = (j + lean) / teeth
    // 0 at the sinus, 1 at the lobe tip: teeth shrink so the tip ends in a clean point
    const progress = towardTip ? t : 1 - t
    const depth = TOOTH_DEPTH * (1 - 0.9 * progress)
    const tip = onCurve(t)
    path.lineTo(tip.x + nx * depth, tip.y + ny * depth)
    const valley = j === teeth - 1 ? b : onCurve((j + 1) / teeth)
    path.lineTo(valley.x, valley.y)
  }
}

export function buildMomijiPaths<P extends PathLike>(
  createPath: () => P,
): { leaf: P; veins: P; petiole: P } {
  const leaf = createPath()
  const veins = createPath()
  const petiole = createPath()

  // Outline: notch -> left basal sinus -> lobes (left to right) -> right basal sinus -> notch
  const nodes = buildNodes()
  const first = nodes[0]
  if (first) {
    leaf.moveTo(NOTCH.x, NOTCH.y)
    leaf.lineTo(first.x, first.y)
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodes[i]
      const b = nodes[i + 1]
      if (!a || !b) continue
      // A sinus -> tip edge belongs to b's lobe; a tip -> sinus edge belongs to a's lobe.
      if (b.lobe >= 0) addEdge(leaf, a, b, b.lobe, true)
      else if (a.lobe >= 0) addEdge(leaf, a, b, a.lobe, false)
      else leaf.lineTo(b.x, b.y)
    }
    leaf.closePath()
  }

  // One midrib per lobe, stopping just short of the tip
  for (const lobe of LOBES) {
    const end = polar(lobe.angle, lobe.length * 0.9)
    veins.moveTo(0, 0.04)
    veins.lineTo(end.x, end.y)
  }

  // Petiole: a slightly curved stalk from the notch
  petiole.moveTo(NOTCH.x, NOTCH.y - 0.04)
  petiole.quadraticCurveTo(0.06, 0.6, 0.02, 1.0)

  return { leaf, veins, petiole }
}
