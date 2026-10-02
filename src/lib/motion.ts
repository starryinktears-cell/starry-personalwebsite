export const motion = {
  easeOutExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeInOut: 'cubic-bezier(0.76, 0, 0.24, 1)',
  easeSoft: 'cubic-bezier(0.22, 1, 0.36, 1)',
  duration: { xs: 200, s: 400, m: 800, l: 1200, xl: 1600 },
  stagger: 80,
} as const

export type MotionDuration = keyof typeof motion.duration
