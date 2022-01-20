/**
 * @file Root component.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */

import React, { useEffect, useState } from 'react';

import './MainComponent.scss';
import ListItemsComponent from './ListItemsComponent.jsx';

function getContent() {
  return new Promise((resolve) => {
    chrome.runtime.getBackgroundPage((bg) => {
      const data = bg.news;
      resolve(data);
    });
  });
}

function MainComponent() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(null);

  useEffect(async function() {
    const content = await getContent();
    setData(content);
  }, []);

  const pagesList = data.map((item) => {
    return (
      <div key={ data.findIndex(el => el.name == item.name) } className={"main-component__tab" + (item.name == page ? ' tab_selected' : '')} onClick={() => { setPage(item.name); }}>
        { item.name }
      </div>
    );
  });

  return (
    <div className="main-component">
      <div className="main-component__left">
        { pagesList }
      </div>
      <div className="main-component__right">
        {page != null &&
          <ListItemsComponent items={ data.find(item => item.name == page).items } />
        }
      </div>
    </div>
  );
}

export default MainComponent;
