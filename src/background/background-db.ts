/**
 * @file Background script and options page database interaction. This file
 *       is shared with React application that should be built.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */

import { INamesListItem, ISourceObject } from './interfaces';

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
  static _dbInstance: IDBDatabase = null;

  /**
   * Get database instance or initialize it and return instance.
   */
  static getInstance(): Promise<IDBDatabase> {
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
          
          const addItem = function(index: number) {
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
   */
  static create(name: string, url: string, processing: string, isActive: boolean): Promise<boolean> {
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
   */
  static read(id: number): Promise<ISourceObject> {
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
   */
  static update(id: number, name: string, url: string, processing: string, isActive: boolean): Promise<boolean> {
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
   */
  static delete(id: number): Promise<boolean> {
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
   */
  static getActiveSourcesList(): Promise<number[]> {
    return new Promise((resolve, reject) => {
      this.getInstance()
        .then(db => {
          let transaction = db.transaction('sources', 'readonly');
          return transaction.objectStore('sources');
        })
        .then(sources => {
          let request = sources.openCursor();

          let collected: number[] = [];

          request.onsuccess = () => {
            let cursor = request.result;

            if(cursor) {
              let key = cursor.key;
              
              if(cursor.value.isActive == true) {
                collected.push(key as number);
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
   * Returns array of objects with names.
   */
     static getNamesList(): Promise<INamesListItem[]> {
      return new Promise((resolve, reject) => {
        this.getInstance()
          .then(db => {
            let transaction = db.transaction('sources', 'readonly');
            return transaction.objectStore('sources');
          })
          .then(sources => {
            let request = sources.openCursor();
  
            let collected: INamesListItem[] = [];
  
            request.onsuccess = () => {
              let cursor = request.result;
  
              if(cursor) {
                const key = cursor.key;
                const value = cursor.value;
                collected.push({
                  id: key as number,
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
