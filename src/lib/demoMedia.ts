// Keep local preview files out of localStorage. Only stable references are saved
// with settings/projects; each browser document resolves them to its own Blob URLs.
const referencePrefix = 'studio-demo-media:'
let database: Promise<IDBDatabase> | undefined
const urls = new Map<string, Promise<string>>()
const references = new Map<string, string>()

function storageError(error: unknown) {
  if (error instanceof DOMException && error.name === 'QuotaExceededError') return new Error('浏览器本地存储空间不足，请释放站点存储空间后重试，或使用线上后台上传。')
  return new Error('无法保存本地媒体，请允许此站点使用浏览器存储后重试。')
}

function openDatabase() {
  if (!database) database = new Promise<IDBDatabase>((resolve, reject) => {
    if (!globalThis.indexedDB) { reject(new Error('此浏览器不支持本地媒体存储，请使用支持 IndexedDB 的浏览器或线上后台。')); return }
    const request = indexedDB.open('studio-demo-media', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('files')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(storageError(request.error))
  }).catch(error => { database = undefined; throw error })
  return database
}

async function fileRequest<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('files', mode)
    const request = action(transaction.objectStore('files'))
    // Report success only after the file has actually committed to browser storage.
    transaction.oncomplete = () => resolve(request.result)
    transaction.onabort = () => reject(storageError(transaction.error ?? request.error))
    transaction.onerror = () => reject(storageError(transaction.error ?? request.error))
  })
}

async function mediaUrl(id: string) {
  let pending = urls.get(id)
  if (!pending) {
    pending = fileRequest<Blob | undefined>('readonly', store => store.get(id)).then(file => {
      if (!file) throw new Error('本地媒体文件已不存在，请重新上传；原有文字和项目不会被覆盖。')
      const url = URL.createObjectURL(file)
      references.set(url, `${referencePrefix}${id}`)
      return url
    }).catch(error => { urls.delete(id); throw error })
    urls.set(id, pending)
  }
  return pending
}

export async function storeDemoMedia(id: string, file: File, onProgress: (percent: number) => void) {
  onProgress(0)
  await fileRequest('readwrite', store => store.put(file, id))
  onProgress(90)
  return mediaUrl(id)
}

export function serializeDemoMedia(value: unknown) {
  return JSON.stringify(value, (_key, item) => typeof item === 'string' ? references.get(item) ?? item : item)
}

export async function resolveDemoMedia<T>(value: T): Promise<T> {
  const resolve = async (item: unknown): Promise<unknown> => {
    if (typeof item === 'string' && item.startsWith(referencePrefix)) return mediaUrl(item.slice(referencePrefix.length))
    if (Array.isArray(item)) return Promise.all(item.map(resolve))
    if (item && typeof item === 'object') return Object.fromEntries(await Promise.all(Object.entries(item).map(async ([key, child]) => [key, await resolve(child)])))
    return item
  }
  return await resolve(value) as T
}
