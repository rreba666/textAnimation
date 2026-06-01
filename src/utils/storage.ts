// localStorage 统一读写工具

const PREFIX = 'dashboard_'

/**
 * 从 localStorage 读取数据
 * @param key 存储键名（不含前缀）
 * @param fallback 默认值
 */
export function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/**
 * 向 localStorage 写入数据
 * @param key 存储键名（不含前缀）
 * @param value 要存储的值
 */
export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch (e) {
    console.error('localStorage 写入失败:', e)
  }
}

/**
 * 从 localStorage 删除数据
 * @param key 存储键名（不含前缀）
 */
export function removeItem(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch (e) {
    console.error('localStorage 删除失败:', e)
  }
}

/**
 * 生成唯一 ID（简化版 UUID）
 */
export function generateId(): string {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
