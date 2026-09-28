/**
 * Small, defensive wrappers around `localStorage`. Storage can throw (private
 * browsing, disabled cookies, quota errors), so every access is guarded and
 * falls back to an in-memory value.
 */
const memoryStore = new Map<string, string>()

function getStorage(): Storage | null {
  try {
    const probeKey = '__taskflow_probe__'
    window.localStorage.setItem(probeKey, '1')
    window.localStorage.removeItem(probeKey)
    return window.localStorage
  } catch {
    return null
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  const storage = getStorage()
  const raw = storage ? storage.getItem(key) : (memoryStore.get(key) ?? null)

  if (raw === null) {
    return fallback
  }

  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJSON<T>(key: string, value: T): void {
  const raw = JSON.stringify(value)
  const storage = getStorage()

  if (storage) {
    try {
      storage.setItem(key, raw)
      return
    } catch {
      // Fall through to the in-memory store.
    }
  }

  memoryStore.set(key, raw)
}
