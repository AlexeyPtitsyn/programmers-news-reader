/**
 * @file Background script database interaction.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */

/**
 * Default examples of database.
 */
const DEFAULT_SOURCES = [
  {
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

class Sources {
  static _dbInstance = null;

  /**
   * Get database instance or initialize it and return instance.
   * @return {Promise<IDBDatabase|Error>}
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
   * @param {String} name - Record name.
   * @param {String} url - Full url.
   * @param {String} processing - Processing script code.
   * @return {Promise<bool|Error>} True if operation successfull.
   */
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

  static getSourcesList() {
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
              // const value = cursor.value;
              collected.push(key);
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

export default {
  Sources
};
