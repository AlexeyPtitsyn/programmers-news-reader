/**
 * @file Example component.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */
import React, { useState } from 'react';
import './ExampleComponent.scss';

export default function ExampleComponent() {
  const [isOpened, setIsOpened] = useState(false);

  const example1 = `const xmlDoc = (new DOMParser()).parseFromString(data, "application/xml");
const items = [...xmlDoc.querySelectorAll('channel>item')];

const results = [];

function getCleanContent (input) {
  const output = input.replace('<![CDATA[', '').replace(']]>', '');
  return output.trim();
}

items.forEach((item) => {
  results.push({
    name: getCleanContent(item.querySelector('title').innerHTML),
    description: getCleanContent(item.querySelector('description').innerHTML),
    link:  getCleanContent(item.querySelector('link').innerHTML)
  });
});

return results;`;

  const example2 = `const htmlDoc = (new DOMParser()).parseFromString(data, "text/html");
const headers = htmlDoc.querySelectorAll('article.post h2>a');

const results = [];

headers.forEach((header) => {
  const name = header.innerText.trim();
  const link = header.href;

  const description = '';
  let image = null;

  const picture = header.closest('article').querySelector('picture>img');
  if(picture) {
    image = picture.src;
  }

  results.push({
    name,
    link,
    description,
    image
  });
});

return results;`;

  return (
    <div className="example">
      <div className="example__header" onClick={() => { setIsOpened(!isOpened); }}>
        Examples of parse functions
        <span className={"example__button" + (isOpened ? ' example_opened' : '')}></span>
      </div>

      {isOpened &&
        <div className="example__spoiler">
          Example functions have access to <span className="example_highlighted">data</span> string, that contains content of the requested page.
          And also they should return array of objects with fields: <span className="example_highlighted">name</span>,
          <span className="example_highlighted">link</span>, <span className="example_highlighted">description</span>,
          <span className="example_highlighted">image</span> (optional).

          <div className="example__code">{ example1 }</div>
          <div className="example__code">{ example2 }</div>
        </div>
      }
    </div>
  );
};
