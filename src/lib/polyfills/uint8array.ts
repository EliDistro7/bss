// lib/polyfills/uint8array.ts
//
// Polyfills for newer TC39 proposals that pdf.js 6.x depends on:
// - Uint8Array.prototype.toHex/fromHex/toBase64/fromBase64
//   (https://github.com/tc39/proposal-arraybuffer-base64)
// - Map.prototype.getOrInsertComputed / WeakMap.prototype.getOrInsertComputed
//   (https://github.com/tc39/proposal-upsert)
//
// Whether these are already declared in TS's lib types is inconsistent
// between editors (tsserver) and `next build` (tsc via the project's
// actual tsconfig), so rather than fight `declare global` conflicts in
// one direction or the other, we cast through `unknown` at the
// assignment site. This avoids "Property does not exist" errors when
// the lib lacks the type, and avoids "overload signatures must agree"
// errors when the lib already has it declared non-optionally.

type Uint8ArrayPolyfilled = Uint8Array & {
  toHex?: () => string
  toBase64?: () => string
}

type Uint8ArrayCtorPolyfilled = Uint8ArrayConstructor & {
  fromHex?: (hex: string) => Uint8Array
  fromBase64?: (base64: string) => Uint8Array
}

type MapPolyfilled = Map<unknown, unknown> & {
  getOrInsertComputed?: (key: unknown, callbackFn: (key: unknown) => unknown) => unknown
}

type WeakMapPolyfilled = WeakMap<WeakKey, unknown> & {
  getOrInsertComputed?: (key: WeakKey, callbackFn: (key: WeakKey) => unknown) => unknown
}

if (typeof window !== 'undefined') {
  const u8proto = Uint8Array.prototype as Uint8ArrayPolyfilled
  const u8ctor = Uint8Array as unknown as Uint8ArrayCtorPolyfilled
  const mapProto = Map.prototype as MapPolyfilled
  const weakMapProto = WeakMap.prototype as WeakMapPolyfilled

  if (!u8proto.toHex) {
    u8proto.toHex = function (this: Uint8Array) {
      return Array.from(this, (b) => b.toString(16).padStart(2, '0')).join('')
    }
  }

  if (!u8ctor.fromHex) {
    u8ctor.fromHex = function (hex: string) {
      const bytes = new Uint8Array(hex.length / 2)
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
      }
      return bytes
    }
  }

  if (!u8proto.toBase64) {
    u8proto.toBase64 = function (this: Uint8Array) {
      let binary = ''
      for (let i = 0; i < this.length; i++) binary += String.fromCharCode(this[i])
      return btoa(binary)
    }
  }

  if (!u8ctor.fromBase64) {
    u8ctor.fromBase64 = function (base64: string) {
      const binary = atob(base64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      return bytes
    }
  }

  if (!mapProto.getOrInsertComputed) {
    mapProto.getOrInsertComputed = function (this: Map<unknown, unknown>, key, callbackFn) {
      if (this.has(key)) return this.get(key)
      const value = callbackFn(key)
      this.set(key, value)
      return value
    }
  }

  if (!weakMapProto.getOrInsertComputed) {
    weakMapProto.getOrInsertComputed = function (this: WeakMap<WeakKey, unknown>, key, callbackFn) {
      if (this.has(key)) return this.get(key)
      const value = callbackFn(key)
      this.set(key, value)
      return value
    }
  }
}

export {}