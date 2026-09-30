import '@testing-library/jest-dom'

const storage = new Map<string, string>()

const localStorageMock: Storage = {
  getItem: (key) => storage.get(key) ?? null,

  setItem: (key, value) => {
    storage.set(key, value)
  },

  removeItem: (key) => {
    storage.delete(key)
  },

  clear: () => {
    storage.clear()
  },

  key: (index) => {
    return Array.from(storage.keys())[index] ?? null
  },

  get length() {
    return storage.size
  },
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
})
