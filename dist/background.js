/**
 * @file Background script that always run.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */

import DB from "./background-db.js";

/**
 * @typedef {Object} NewsItem
 * @property {string} title - News title.
 * @property {string} description - News description.
 * @property {string} link - News href.
 */

/**
 * @typedef {Object} NewsList
 * @property {string} name - Source name.
 * @property {NewsItem[]} items - news items.
 */

/**
 * @typedef {Array} IGlobals
 * @property {NewsList[]} news - news data.
 * 
 * @typedef {Window & IGlobals} ExtendedWindow
 */
/** @type {ExtendedWindow} */
const global = window;

global.news = [];

/**
 * @typedef {Object} SourceConfig
 * @property {string} name - Source name.
 * @property {string} url - Source url.
 * @property {string} processing - JS-code that uses `data` variable and returns `NewsItem[]`.
 */

/**
 * @typedef {Array} SourcesList
 * @property {SourceConfig[]}
 */

// Life cycle:
async function update() {
  global.news = [];

  const errorsCount = 0;

  const sourcesList = await DB.Sources.getSourcesList();
  for(const id of sourcesList) {
    const source = await DB.Sources.read(id);

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

chrome.alarms.onAlarm.addListener((alarm) => {
  switch (alarm.name) {
    case 'updateAlarm':
      chrome.alarms.create('updateAlarm', {delayInMinutes: 5.0});
      update();
      break;
  }
});

chrome.alarms.create('updateAlarm', { delayInMinutes: 5.0 });
update();
