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
        if (!window.indexedDB) {
            throw new Error('你的浏览器不支持indexDB，无法进行存储数据操作')
        }
        this.indexedDB = window.indexedDB.open('hym_websocket_indexeddb', 1)
        this.status = Status.PENDING
        this.fulfulledFn = []
        this.rejectedFn = []
        this.indexedDB.addEventListener('success', () => {
            console.log('indexedDB连接成功')
            this.status = Status.FULFILLED
            this.initTabel()
            this.fulfulledFn.forEach(fn => fn())
            this.fulfulledFn = []
            this.rejectedFn = []
        })
        this.indexedDB.addEventListener('error', () => {
            this.status = Status.REJECTED
            this.rejectedFn.forEach(fn => fn())
            this.rejectedFn = []
            this.fulfulledFn = []
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
            db.createObjectStore(Tabel.MESSAGE, { keyPath: 'id' })
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
     * 往某个表添加数据
     * @param tabelTag 表名
     * @param keyPath 主键值
     * @param success 成功回调
     * @param error 失败回调
     * @param action 行为
     */
    public addDataToTargetObjectStore(
        tabelTag: string,
        keyPath: string,
        success: (event: any) => void = () => { },
        error: (event: any) => void = () => { },
        action: 'readwrite' | 'readonly' = 'readwrite'
    ): void {
        const db = this.indexedDB.result
        const request = db.transaction([tabelTag], action)
            .objectStore(tabelTag)
            .add({ id: keyPath, data: [] })
        request.onsuccess = success
        request.onerror = error
    }
    /**
     * 修改某个表某条数据
     * @param tabelTag 表名
     * @param keyPath 主键值
     * @param handle 处理函数 第一个参数为未修改前的数据，第二个参数为修改器
     * @param success 成功回调
     * @param error 失败回调
     * @param action 行为
     */
    public putDataToTargetObjectStore(
        tabelTag: string,
        keyPath: string,
        handle: (prevData: any, next: (nextData: any) => void) => void,
        success: (event: any) => void = () => { },
        error: (event: any) => void = () => { },
        action: 'readwrite' | 'readonly' = 'readwrite'
    ): void {
        this.getDataToTargetObjectStore(
            tabelTag,
            keyPath,
            (e) => {
                handle(e.target.result?.data ?? [], (data) => {
                    const db = this.indexedDB.result
                    const request = db.transaction([tabelTag], action)
                        .objectStore(tabelTag)
                        .put({ id: keyPath, data })
                    request.onsuccess = success
                    request.onerror = error
                })
            }
        )
    }
    /**
     * 删除某个表某条数据
     * @param tabelTag 表名
     * @param keyPath 主键值
     * @param success 成功回调
     * @param error 失败回调
     * @param action 行为
     */
    public deleteDataToTargetObjectStore(
        tabelTag: string,
        keyPath: string,
        success: (event: any) => void = () => { },
        error: (event: any) => void = () => { },
        action: 'readwrite' | 'readonly' = 'readwrite'
    ): void {
        const db = this.indexedDB.result
        const request = db.transaction([tabelTag], action)
            .objectStore(tabelTag)
            .delete(keyPath)
        request.onsuccess = success
        request.onerror = error
    }
    /**
     * 获取某个表所有主键
     * @param tabelTag 表名
     * @param handle 处理函数
     */
    public getAllKeyToTargetObjectStore(
        tabelTag: string,
        handle: (data: string[]) => void = () => { },
    ): void {
        const db = this.indexedDB.result
        const objectStore = db.transaction(tabelTag).objectStore(tabelTag)
        const data: string[] = []

        objectStore.openCursor().onsuccess = function (event) {
            const cursor = this.result

            if (cursor) {
                data.push(cursor.key as string)
                cursor.continue()
            } else {
                handle(data)
            }
        }
    }
    /**
     * 获取某个表某条数据
     * @param tabelTag 表名
     * @param keyPath 主键值
     * @param success 成功回调
     * @param error 失败回调
     * @param action 行为
     */
    public getDataToTargetObjectStore(
        tabelTag: string,
        keyPath: string,
        success: (event: any) => void = () => { },
        error: (event: any) => void = () => { },
        action: 'readwrite' | 'readonly' = 'readwrite'
    ): void {
        const db = this.indexedDB.result
        const request = db.transaction([tabelTag], action)
            .objectStore(tabelTag)
            .get(keyPath)
        request.onsuccess = success
        request.onerror = error
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
