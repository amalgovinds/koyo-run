<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { buildMomijiPaths } from '@/utils/momijiShape'
import type { LeafMode } from '@/types'

const props = withDefaults(defineProps<{ mode?: LeafMode }>(), { mode: 'breeze' })

interface Leaf {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  swayAmp: number
  swayFreq: number
  angle: number
  spin: number
  flip: number
  flipSpeed: number
  color: string
  opacity: number
}

interface LeafShape {
  leaf: Path2D
  veins: Path2D
  petiole: Path2D
}

const LEAF_COUNT = 32

// Japanese maple (momiji) autumn shades only
const MOMIJI_COLORS = ['#C83E2B', '#B22D1D', '#D95B27', '#A43820', '#E07A2E']
const VEIN_COLOR = 'rgba(40, 8, 4, 0.3)'

const canvas = ref<HTMLCanvasElement | null>(null)

// Animation state is plain variables on purpose: it changes every frame,
// so it should not be reactive.
let raf = 0
let ctx: CanvasRenderingContext2D | null = null
let shape: LeafShape | null = null
let width = 0
let height = 0
let tick = 0
let leaves: Leaf[] = []
let reduceMotion = false

const rand = (min: number, max: number): number => min + Math.random() * (max - min)

function createLeaf(): Leaf {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: rand(10, 20),
    speedY: rand(0.4, 1.15),
    speedX: (Math.random() - 0.4) * 0.5,
    swayAmp: rand(0.45, 1.35),
    swayFreq: rand(0.008, 0.022),
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 0.018,
    flip: Math.random() * Math.PI,
    flipSpeed: rand(0.012, 0.03),
    color: MOMIJI_COLORS[Math.floor(Math.random() * MOMIJI_COLORS.length)] ?? '#C83E2B',
    opacity: rand(0.35, 0.75),
  }
}

function resize(): void {
  const el = canvas.value
  if (!el) return
  width = el.width = window.innerWidth
  height = el.height = window.innerHeight
}

function loop(): void {
  raf = requestAnimationFrame(loop)
  const c = ctx
  const s = shape
  if (!c || !s) return

  c.clearRect(0, 0, width, height)

  // Honour the OS "reduce motion" setting by drawing nothing.
  const mode: LeafMode = reduceMotion ? 'paused' : props.mode
  if (mode === 'paused') return

  tick += 1
  const mult = mode === 'breeze' ? 1 : 0.45

  for (const lf of leaves) {
    lf.y += lf.speedY * mult
    lf.x += (lf.speedX + Math.sin(tick * lf.swayFreq + lf.size) * lf.swayAmp) * mult
    lf.angle += lf.spin * mult
    lf.flip += lf.flipSpeed * mult

    // Wrap around the edges
    if (lf.y > height + 25) {
      lf.y = -25
      lf.x = Math.random() * width
    }
    if (lf.x > width + 25) lf.x = -25
    if (lf.x < -25) lf.x = width + 25

    c.save()
    c.translate(lf.x, lf.y)
    c.rotate(lf.angle)
    c.scale(1, Math.max(0.28, Math.abs(Math.cos(lf.flip)))) // tumbling "flip"
    c.scale(lf.size, lf.size) // the shape is defined in unit space
    c.globalAlpha = lf.opacity

    c.fillStyle = lf.color
    c.fill(s.leaf)

    c.lineCap = 'round'
    c.strokeStyle = lf.color
    c.lineWidth = 0.07
    c.stroke(s.petiole)

    c.strokeStyle = VEIN_COLOR
    c.lineWidth = 0.03
    c.stroke(s.veins)
    c.restore()
  }
}

onMounted(() => {
  const el = canvas.value
  if (!el) return
  ctx = el.getContext('2d')
  if (!ctx) return

  // Build the leaf outline once; every leaf reuses it.
  shape = buildMomijiPaths(() => new Path2D())
  reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resize()
  leaves = Array.from({ length: LEAF_COUNT }, createLeaf)
  window.addEventListener('resize', resize)
  loop()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <canvas ref="canvas" class="pointer-events-none fixed inset-0 z-20" aria-hidden="true" />
</template>
