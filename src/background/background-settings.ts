/**
 * @file Setting async interface. This file is shared with React application
 *       that should be built.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */

import { IDefaultSettings } from "./interfaces";

class Settings {
  /**
   * Initialize settings. If they are not set.
   */
  static async init(defaultSettings: IDefaultSettings) {
    console.info('Checking default settings...');

    for(let key in defaultSettings) {
      const value = await this.get('requestDelay');
      if(value == null) {
        console.info(`Writing default value for ${key}: ${defaultSettings[key]}.`);
        await this.set(key, defaultSettings[key]);
      }
    }

    console.info('...default settings checked.');
  }

  /**
   * Get data from storage.
   */
  static get(variable: string): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get([variable], (data) => {
        if(typeof data[variable] === 'undefined') {
          return resolve(null);
        }

        resolve(data[variable]);
      });
    });
  }

  /**
   * Set data to the storage.
   */
  static set(variable: string, value: any): Promise<any> {
    interface IObj {
      [key: string]: any
    }

    let obj: IObj = {};
    obj[variable] = value;

    return new Promise((resolve, reject) => {
      chrome.storage.sync.set(obj, () => {
        resolve(value);
      });
    });
  }
}

export default Settings;
