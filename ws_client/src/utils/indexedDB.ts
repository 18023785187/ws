/**
 * 本地数据库
 */
enum Status {
    PENDING = 'pending',
    FULFILLED = 'fulfilled',
    REJECTED = 'rejected',
}

enum Tabel {
    MESSAGE = 'message'
}

class IndexedDB {
    public status: Status
    public indexedDB: IDBOpenDBRequest
    private fulfulledFn: (() => void)[]
    private rejectedFn: (() => void)[]
    constructor() {
        this.indexedDB = window.indexedDB.open('hym_websocket_indexeddb', 1)
        this.status = Status.PENDING
        this.fulfulledFn = []
        this.rejectedFn = []
        this.indexedDB.addEventListener('success', () => {
            this.status = Status.FULFILLED
            this.fulfulledFn.forEach(fn => fn())
            this.fulfulledFn = []
        })
        this.indexedDB.addEventListener('error', () => {
            this.status = Status.REJECTED
            this.rejectedFn.forEach(fn => fn())
            this.rejectedFn = []
        })
        this.indexedDB.addEventListener('upgradeneeded', () => {
            this.initTabel()
        })
    }
    /**
     * 初始化数据库表
     */
    public initTabel(): void {
        const db = this.indexedDB.result
        if (!this.definedObjectStore(Tabel.MESSAGE)) {
            db.createObjectStore(Tabel.MESSAGE, { autoIncrement: true })
        }
    }
    /**
     * 检测数据库是否存在该表
     * @param tabelTag 表名
     * @returns boolean
     */
    public definedObjectStore(tabelTag: string): boolean {
        const db = this.indexedDB.result
        return db.objectStoreNames.contains(tabelTag)
    }
    /**
     * 往某个表写入数据
     * @param tabelTag 表名
     * @param data 数据
     * @param success 成功回调
     * @param error 失败回调
     * @param action 行为
     */
    public addDataToTargetObjectStore<T>(
        tabelTag: string,
        data: T,
        success: (event: Event) => void = () => { },
        error: (event: Event) => void = () => { },
        action: 'readwrite' | 'readonly' = 'readwrite'
    ): void {
        const db = this.indexedDB.result
        const request = db.transaction([tabelTag], action)
            .objectStore(tabelTag)
            .add(data)
        request.onsuccess = success
        request.onerror = error
    }
    /**
     * 遍历指定表的所有值并以数组的形式返回
     * @param tabelTag 表名
     * @returns T[]
     */
    public getTargetObjectStoreData<T>(tabelTag: string, handle: (res: T[]) => void): void {
        if (!this.definedObjectStore(tabelTag)) {
            handle.call(this, [])
        } else {
            const objectStore = this.indexedDB.result.transaction(tabelTag).objectStore(tabelTag)
            const res: T[] = []
            objectStore.openCursor().onsuccess = function (e) {
                const cursor = this.result
                if (cursor) {
                    res.push(cursor.value as T)
                    cursor.continue()
                } else {
                    handle.call(this, res)
                }
            }
        }
    }
    public async(
        resolve?: () => void,
        reject?: () => void,
    ): void {
        resolve = typeof resolve === 'function' ? resolve : () => { }
        reject = typeof reject === 'function' ? reject : () => { }
        if (this.status === Status.FULFILLED) {
            resolve.call(this)
        } else if (this.status === Status.REJECTED) {
            reject.call(this)
        } else {
            this.fulfulledFn.push(resolve.bind(this))
            this.rejectedFn.push(reject.bind(this))
        }
    }
}

export default new IndexedDB()
export {
    Status,
    Tabel
}
