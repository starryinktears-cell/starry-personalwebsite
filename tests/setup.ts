import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'
import { File as NodeFile } from 'node:buffer'

// IndexedDB structured-clones real browser Blobs. jsdom's File shim is not
// structured-cloneable in Node; use its native equivalent in persistence tests.
globalThis.File = NodeFile as unknown as typeof File
URL.createObjectURL = () => `blob:test-${crypto.randomUUID()}`
