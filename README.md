# Programmer's news reader

**This project is written bit-by-bit, so not all features are implemented.**

**Currently not implemented: Options page, that allows user to configure news sources.**

This Google Chrome extension allows you to read news feeds from sites even
if it has no RSS feed. However, you need to be a programmer to configure source.
Because writing of parse function is upon you.

## Installation

Install dependencies:

```bash
npm install
```

Run:

`npm run <script>`:

- `build-popup-dev` - build popup window application in watch mode,
- `build-popup-production` - build popup window applicatoin in production mode,

## Setting sources

To set news source you need to open Chrome Extension options page and add
sources.

Each source is need to be named, must have a valid url, and have parse content
function.

Each parse function have access to `data` string, that contains content
(requested by user-provided URL). Function must return array of *news*
items, that contain fields: `title`, `description`, `link`, `image`.
All of them are `string` type. `image` field is optional and may contain image
src attribute.

Example of such functions listed below.

Example of xml parse function:
```js
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
```

Example of HTML parse function:
```js
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
```
