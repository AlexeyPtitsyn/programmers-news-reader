/**
 * @file Background script and options page database interaction. This file
 *       is shared with React application that should be built.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */

/**
 * @typedef {Object} SourceObject
 * @property {number} id - ID.
 * @property {boolean} isActive - Is source active?
 * @property {string} name - Source name.
 * @property {string} url - Source url.
 * @property {string} processing - Processing code as string.
 */

/**
 * Default examples of database.
 */
const DEFAULT_SOURCES = [
  {
    isActive: true,
    name: 'Nplus1',
    url: 'https://nplus1.ru/rss',
    processing: `
const xmlDoc = (new DOMParser()).parseFromString(data, "application/xml");
const items = [...xmlDoc.querySelectorAll('channel>item')];

const results = [];

function getCleanContent (input) {
  const output = input.replace('<![CDATA[', '').replace(']]>', '');
  return output.trim();
}

items.forEach((item) => {
  results.push({
    title: getCleanContent(item.querySelector('title').innerHTML),
    description: getCleanContent(item.querySelector('description').innerHTML),
    link:  getCleanContent(item.querySelector('link').innerHTML)
  });
});

return results;
    `
  },
  {
    isActive: true,
    name: 'ProgrammerHumor',
    url: 'https://programmerhumor.io/',
    processing: `
const xmlDoc = (new DOMParser()).parseFromString(data, "text/html");
const headers = xmlDoc.querySelectorAll('article.post h2>a');

const results = [];

headers.forEach((header) => {
  const title = header.innerText.trim();
  const link = header.href;

  const description = '';
  let image = null;

  const picture = header.closest('article').querySelector('picture>img');
  if(picture) {
    image = picture.src;
  }

  results.push({
    title,
    link,
    description,
    image
  });
});

return results;
    `
  }
];

class DB {
  static _dbInstance = null;

  /**
   * Get database instance or initialize it and return instance.
   * 
   * @return {Promise<IDBDatabase, Error>}
   */
  static getInstance() {
    return new Promise((resolve, reject) => {
      if(this._dbInstance != null) {
        return resolve(this._dbInstance);
      }

      let isDefaultShouldBeWritten = false;
      let openRequest = indexedDB.open('db', 1);
      openRequest.onupgradeneeded = () => {
        console.info('Database upgrade needed.');
        let db = openRequest.result;
        switch(db.version) {
          case 0:
          case 1:
            console.info('Database is not created. Let\'s create one...');
            db.createObjectStore('sources', { keyPath: 'id', autoIncrement: true });
            isDefaultShouldBeWritten = true;
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

        if(isDefaultShouldBeWritten) {
          let transaction = db.transaction('sources', 'readwrite');
          
          function addItem(index) {
            const item = DEFAULT_SOURCES[index];

            let request = transaction.objectStore('sources').add(item);
            request.onsuccess = () => {
              index++;
              if(index >= DEFAULT_SOURCES.length) {
                console.info(`Added ${index} default records.`);
                resolve(db);
                return;
              }
              addItem(index);
            };

            request.onerror = () => {
              reject(request.error);
            }
          }

          addItem(0);

          return;
        }

        return resolve(this._dbInstance);
      };
    });
  }

  /**
   * Create source record.
   * 
   * @param {String} name - Record name.
   * @param {String} url - Full url.
   * @param {String} processing - Processing script code.
   * @param {boolean} isActive - Is source active?
   * @return {Promise<bool, Error>} True if operation successfull.
   */
  static create(name, url, processing, isActive) {
    const item = {
      name,
      url,
      processing,
      isActive
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

  /**
   * Get all fields from record with id:
   * 
   * @param {number} id - ID number.
   * @returns {Promise<SourceObject, Error>}
   */
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

  /**
   * Update object ID.
   * 
   * @param {number} id - Object ID.
   * @param {string} name - Item name.
   * @param {string} url - Full URL.
   * @param {string} processing - Processing instructions.
   * @param {boolean} isActive - Is source active?
   * @returns {Promise<bool, Error>} True on request success.
   */
  static update(id, name, url, processing, isActive) {
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
            processing,
            isActive
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

  /**
   * Delete object with specified ID.
   * 
   * @param {number} id - Object ID.
   * @returns {Promise<boolean, Error>} True if request successful.
   */
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
   * Get only active sources list.
   * 
   * @returns {Promise<number[], Error>} Array of IDs.
   */
  static getActiveSourcesList() {
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
              let key = cursor.key;
              
              if(cursor.value.isActive == true) {
                collected.push(key);
              }

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

  /**
   * @typedef {Object} NamesListItem
   * @property {number} id - Object ID.
   * @property {string} name - Object name.
   * @property {boolean} isActive - Is source active?
   */

  /**
   * Returns array of objects with names.
   * 
   * @return {Promise<NamesListItem[], Error>}
   */
     static getNamesList() {
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
                  name: value.name,
                  isActive: value.isActive
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
