/**
 * @file Background script that always run.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */

import './interfaces.js';

const REQUEST_DELAY = 5; // TODO: move to settings.

import DB from "./background-db.js";

/**
 * @typedef {Array} IGlobals
 * @property {NewsItemList[]} news - news data.
 * 
 * @typedef {Window & IGlobals} ExtendedWindow
 */
/** @type {ExtendedWindow} */
const global = window;

/** @type {NewsItemList[]} */
global.news = [];

/**
 * Update cycle.
 * @async
 */
async function update() {
  global.news = [];

  const errorsCount = 0;

  const sourcesList = await DB.getActiveSourcesList();
  for(const id of sourcesList) {
    const source = await DB.read(id);

    const name = source.name;
    const url = source.url;
    const processing = source.processing;
    
    console.log(`Updating ${name} ( ${url} )...`);
    
    chrome.browserAction.setBadgeBackgroundColor({ color: '#888' });
    chrome.browserAction.setBadgeText({ text: '...' });
    
    try {
      const res = await fetch(url);
      const data = await res.text();
  
      const items = eval(`
        (function() {
          ${processing}
        })();
      `);
  
      global.news.push({
        name: name,
        items: items
      });
      console.log(`...received ${items.length} items.`);
    } catch(e) {
      console.error(e);
    }
  }

  chrome.browserAction.setBadgeBackgroundColor({ color: '#252' });
  chrome.browserAction.setBadgeText({ text: 'OK' });

  if(errorsCount > 0) {
    chrome.browserAction.setBadgeBackgroundColor({ color: '#a22' });
    chrome.browserAction.setBadgeText({ text: 'Error' });
  }
}

/**
 * Init:
 */
chrome.alarms.onAlarm.addListener((alarm) => {
  switch (alarm.name) {
    case 'updateAlarm':
      chrome.alarms.create('updateAlarm', {delayInMinutes: REQUEST_DELAY});
      update();
      break;
  }
});

chrome.alarms.create('updateAlarm', { delayInMinutes: REQUEST_DELAY });
update();
