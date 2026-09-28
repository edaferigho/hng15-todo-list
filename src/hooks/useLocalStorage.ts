import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { readJSON, writeJSON } from '../lib/storage'

/**
 * `useState` that transparently persists to `localStorage` under `key`.
 * Persistence failures never break rendering — see `lib/storage.ts`.
 *
 * `normalize` runs once, on hydration, so stored data can be validated or
 * coerced before it reaches the component tree.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  normalize?: (value: T) => T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const stored = readJSON(key, initialValue)
    return normalize ? normalize(stored) : stored
  })

  useEffect(() => {
    writeJSON(key, value)
  }, [key, value])

  return [value, setValue]
}
