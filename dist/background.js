/**
 * @file Background script that always run.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */

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

// TODO: Move this settings to the options page.
//       So user can create own processing scripts.
const sources = [
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

// Life cycle:
async function update() {
  global.news = [];

  const errorsCount = 0;

  for(let i = 0; i < sources.length; i++) {
    const source = sources[i];
    
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
      chrome.alarms.create('updateAlarm', {delayInMinutes: 1.0});
      update();
      break;
  }
});

chrome.alarms.create('updateAlarm', { delayInMinutes: 1.0 });
update();
