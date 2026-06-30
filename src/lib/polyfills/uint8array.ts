// lib/polyfills/uint8array.ts
//
// Polyfills for TC39's Uint8Array base64/hex methods
// (https://github.com/tc39/proposal-arraybuffer-base64).
// pdf.js's internal code calls these directly, and support is still
// rolling out across browsers, so we shim them in globally before
// anything that depends on them runs — including main-thread pdf.js
// calls, not just the worker.

declare global {
  interface Uint8Array {
    toHex(): string
    toBase64(): string
  }
  interface Uint8ArrayConstructor {
    fromHex(hex: string): Uint8Array
    fromBase64(base64: string): Uint8Array
  }
}

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
}

export {}