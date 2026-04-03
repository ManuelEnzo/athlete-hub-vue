export interface EventStyle {
  color: string
  border: string
  bg: string
  dot: string
  icon?: any
}

export const EVENT_CONFIG: Record<string, EventStyle> = {
  Strength: { color: 'red', border: 'border-red-500', bg: 'bg-red-500/10', dot: 'bg-red-500' },
  Endurance: { color: 'green', border: 'border-green-500', bg: 'bg-green-500/10', dot: 'bg-green-500' },
  Test: { color: 'purple', border: 'border-purple-500', bg: 'bg-purple-500/10', dot: 'bg-purple-500' },
  Recovery: { color: 'yellow', border: 'border-yellow-500', bg: 'bg-yellow-500/10', dot: 'bg-yellow-500' },
  Checkup: { color: 'blue', border: 'border-blue-500', bg: 'bg-blue-500/10', dot: 'bg-blue-500' },
  Conditioning: { color: 'orange', border: 'border-orange-500', bg: 'bg-orange-500/10', dot: 'bg-orange-500' },
  Match: { color: 'black', border: 'border-black', bg: 'bg-slate-500/10', dot: 'bg-black' },
  Technical: { color: 'teal', border: 'border-teal-500', bg: 'bg-teal-500/10', dot: 'bg-teal-500' },
}

export const EVENT_TYPES = Object.keys(EVENT_CONFIG)
