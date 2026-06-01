import type { EffectType } from '../types'

/** 互斥效果组：每组中只能选中一个，选中新效果自动取消组内其他效果 */
export const CONFLICT_GROUPS: EffectType[][] = [
  // Canvas 背景类：同时渲染会覆盖
  ['particles', 'matrixrain', 'noise', 'gradientorb', 'spiralgalaxy', 'caustics'],
  // 3D/空间类：定位冲突
  ['floatcube', 'depthcards', 'cube'],
  // 交互类：鼠标事件互相干扰
  ['magnet', 'parallaxtilt', 'dragrotate', 'confetti', 'pagetransition', 'customcursor', 'ripplebg'],
]

/** 查找效果所属的冲突组，返回冲突组中除自身外的其他效果 */
export function getConflictingEffects(effect: EffectType, active: EffectType[]): EffectType[] {
  for (const group of CONFLICT_GROUPS) {
    if (group.includes(effect)) {
      return active.filter((e) => e !== effect && group.includes(e))
    }
  }
  return []
}

/** 检查是否可以选中该效果（是否与已选中效果冲突） */
export function canSelectEffect(effect: EffectType, active: EffectType[]): boolean {
  // 如果已选中，允许取消
  if (active.includes(effect)) return true
  // 排查冲突组
  for (const group of CONFLICT_GROUPS) {
    if (group.includes(effect)) {
      const conflict = active.find((e) => group.includes(e))
      return !conflict // 无冲突时允许
    }
  }
  return true // 不属于任何冲突组，总是允许
}
