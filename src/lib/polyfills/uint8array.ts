// lib/polyfills/uint8array.ts
//
// Polyfills for newer TC39 proposals that pdf.js 6.x depends on:
// - Uint8Array.prototype.toHex/fromHex/toBase64/fromBase64
//   (https://github.com/tc39/proposal-arraybuffer-base64)
// - Map.prototype.getOrInsertComputed / WeakMap.prototype.getOrInsertComputed
//   (https://github.com/tc39/proposal-upsert)
//
// All of these are already declared (non-optionally) in TypeScript's
// lib.esnext.d.ts when "esnext" is in tsconfig's "lib" array — so no
// `declare global` augmentation is needed at all. TS knows the types;
// actual browsers just don't all implement them yet. This file only
// patches the runtime behavior, guarded by feature checks so it's a
// no-op wherever the browser already supports them natively.

if (typeof window !== 'undefined') {
  if (!Uint8Array.prototype.toHex) {
    Uint8Array.prototype.toHex = function (this: Uint8Array) {
      return Array.from(this, (b) => b.toString(16).padStart(2, '0')).join('')
    }
  }

  if (!Uint8Array.fromHex) {
    Uint8Array.fromHex = function (hex: string) {
      const bytes = new Uint8Array(hex.length / 2)
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
      }
      return bytes
    }
  }

  if (!Uint8Array.prototype.toBase64) {
    Uint8Array.prototype.toBase64 = function (this: Uint8Array) {
      let binary = ''
      for (let i = 0; i < this.length; i++) binary += String.fromCharCode(this[i])
      return btoa(binary)
    }
  }

  if (!Uint8Array.fromBase64) {
    Uint8Array.fromBase64 = function (base64: string) {
      const binary = atob(base64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      return bytes
    }
  }

  if (!Map.prototype.getOrInsertComputed) {
    Map.prototype.getOrInsertComputed = function (this: Map<unknown, unknown>, key, callbackFn) {
      if (this.has(key)) return this.get(key)
      const value = callbackFn(key)
      this.set(key, value)
      return value
    }
  }

  if (!WeakMap.prototype.getOrInsertComputed) {
    WeakMap.prototype.getOrInsertComputed = function (this: WeakMap<WeakKey, unknown>, key, callbackFn) {
      if (this.has(key)) return this.get(key)
      const value = callbackFn(key)
      this.set(key, value)
      return value
    }
  }
}

export {}