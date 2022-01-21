/**
 * @file IndexedDB database interaction.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */

class DB {
  static _dbInstance = null;

  static getInstance() {
    return new Promise((resolve, reject) => {
      if(this._dbInstance != null) {
        return resolve(this._dbInstance);
      }

      let openRequest = indexedDB.open('db', 1);
      openRequest.onupgradeneeded = () => {
        console.info('Database upgrade needed.');
        let db = openRequest.result;
        switch(db.version) {
          case 0:
          case 1:
            console.info('Database is not created. Let\'s create one...');
            db.createObjectStore('sources', { keyPath: 'id', autoIncrement: true });
            break;
          // case 2:
          //   // update from version 1...
          //   break;
        }
      };
      openRequest.onerror = () => {
        return reject(openRequest.error);
      };
      openRequest.onsuccess = () => {
        let db = openRequest.result;
        this._dbInstance = db;

        return resolve(this._dbInstance);
      };
    });
  }

  static create(name, url, processing) {
    const item = {
      name,
      url,
      processing
    };

    return new Promise((resolve, reject) => {
      this.getInstance()
        .then(db => {
          let transaction = db.transaction('sources', 'readwrite');
          return transaction.objectStore('sources');
        })
        .then(sources => {
          let request = sources.add(item);
          
          request.onsuccess = () => {
            return resolve(true);
          };
          request.onerror = () => {
            return reject(request.error);
          }
        });
    });
  }

  static read(id) {
    return new Promise((resolve, reject) => {
      this.getInstance()
        .then(db => {
          let transaction = db.transaction('sources', 'readonly');
          return transaction.objectStore('sources');
        })
        .then(sources => {
          let request = sources.get(id);
          
          request.onsuccess = () => {
            return resolve(request.result);
          };
          request.onerror = () => {
            return reject(request.error);
          }
        });
    });
  }

  static update(id, name, url, processing) {
    return new Promise((resolve, reject) => {
      this.getInstance()
        .then(db => {
          let transaction = db.transaction('sources', 'readwrite');
          return transaction.objectStore('sources');
        })
        .then(sources => {
          let request = sources.put({
            id,
            name,
            url,
            processing
          });
          
          request.onsuccess = () => {
            return resolve(true);
          };
          request.onerror = () => {
            return reject(request.error);
          }
        });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      this.getInstance()
        .then(db => {
          let transaction = db.transaction('sources', 'readwrite');
          return transaction.objectStore('sources');
        })
        .then(sources => {
          let request = sources.delete(id);
          
          request.onsuccess = () => {
            return resolve(true);
          };
          request.onerror = () => {
            return reject(request.error);
          }
        });
    });
  }

  /**
   * Returns array of objects with fields {id, name}.
   */
  static getList() {
    return new Promise((resolve, reject) => {
      this.getInstance()
        .then(db => {
          let transaction = db.transaction('sources', 'readonly');
          return transaction.objectStore('sources');
        })
        .then(sources => {
          let request = sources.openCursor();

          let collected = [];

          request.onsuccess = () => {
            let cursor = request.result;

            if(cursor) {
              const key = cursor.key;
              const value = cursor.value;
              collected.push({
                id: key,
                name: value.name
              });
              cursor.continue();
            } else {
              return resolve(collected);
            }
          };
          request.onerror = () => {
            return reject(request.error);
          }
        });
    });
  }
}

export default DB;
