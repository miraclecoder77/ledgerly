/** Safe localStorage helpers — the app still works if storage is blocked. */
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : structuredClone(fallback)
  } catch {
    return structuredClone(fallback)
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full or unavailable — keep in memory */
  }
}
