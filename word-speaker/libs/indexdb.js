export class IndexedDB {
    constructor(databaseName, objectStoreName, version = 1) {
        this.dbName = databaseName;
        this.storeName = objectStoreName;
        this.version = version;
        this.db = null;
      
        this.onError = null; // 错误回调函数
    }
	isOpened(){
		return this.db
	}
    open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = event => {
                if (this.onError) {
                    this.onError(event.target.errorCode);
                }
                reject(event.target.error);
            };

            request.onupgradeneeded = event => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
                }
            };

            request.onsuccess = event => {
                this.db = event.target.result;
                resolve(this);
            };
        });
    }

    add(id,data) {
        return new Promise((resolve, reject) => {
            if (!this.db) reject(new Error('Database not opened!'));

            const objectStore = this.db.transaction([this.storeName], 'readwrite').objectStore(this.storeName);
            const request = objectStore.add({id,data});

            request.onerror = event => {
              if (this.onError) {
                  this.onError(event.target.errorCode);
              }
              reject(event.target.error);
            };

            request.onsuccess = event => {
                resolve(event.target.result);
            };
        });
    }

	update(id, item) {
		return new Promise((resolve, reject) => {
			if (!this.db) reject(new Error('Database not opened!'));
	
			const objectStore = this.db.transaction([this.storeName], 'readwrite').objectStore(this.storeName);
			const request = objectStore.put(item, id);
	
			request.onerror = event => {
				if (this.onError) {
					this.onError(event.target.errorCode);
				}
				reject(event.target.error);
			};
	
			request.onsuccess = event => {
				resolve(event.target.result);
			};
		});
	}
	

    delete(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) reject(new Error('Database not opened!'));

            const objectStore = this.db.transaction([this.storeName], 'readwrite').objectStore(this.storeName);
            const request = objectStore.delete(id);

            request.onerror = event => {
                if (this.onError) {
                    this.onError(event.target.errorCode);
                }
                reject(event.target.error);
            };

            request.onsuccess = event => {
                resolve(event.target.result);
            };
        });
    }

    get(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) reject(new Error('Database not opened!'));

            const objectStore = this.db.transaction([this.storeName], 'readonly').objectStore(this.storeName);
            const request = objectStore.get(id);

            request.onerror = event => {
                if (this.onError) {
                    this.onError(event.target.errorCode);
                }
                reject(event.target.error);
            };

            request.onsuccess = event => {
                resolve(event.target.result);
            };
        });
    }

    getAll() {
        return new Promise((resolve, reject) => {
            if (!this.db) reject(new Error('Database not opened!'));

            const objectStore = this.db.transaction([this.storeName], 'readonly').objectStore(this.storeName);
            const request = objectStore.getAll();

            request.onerror = event => {
                if (this.onError) {
                    this.onError(event.target.errorCode);
                }
                reject(event.target.error);
            };

            request.onsuccess = event => {
                resolve(event.target.result);
            };
        });
    }
}

