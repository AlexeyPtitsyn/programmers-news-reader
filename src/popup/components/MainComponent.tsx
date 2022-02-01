/**
 * @file Root component.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */

import React, { useEffect, useState } from 'react';
import { INewsItem, INewsItemList } from '../../background/interfaces';
import './MainComponent.scss';
import ListItemsComponent from './ListItemsComponent';

/**
 * Get content.
 */
function getContent(): Promise<INewsItemList[]> {
  return new Promise((resolve) => {
    chrome.runtime.getBackgroundPage((bg) => {
      const data = bg.news;
      resolve(data);
    });
  });
}

function MainComponent() {
  const [data, setData] = useState<INewsItemList[]>([]);
  const [page, setPage] = useState<string>(null);

  useEffect(() => {
    (async () => {
      const content = await getContent();
      setData(content);
    })();
  }, []);

  const pagesList = data.map((item) => {
    return (
      <div key={ data.findIndex(el => el.name == item.name) }
        className={"navigation__tab" + (item.name == page ? ' navigation_tab_selected' : '')}
        onClick={() => { setPage(item.name); }}>
        { item.name }
      </div>
    );
  });

  return (
    <div className="container">
      <div className="navigation">
        { pagesList }
      </div>
      <>
        {page != null &&
          <ListItemsComponent items={ data.find(item => item.name == page).items } />
        }
      </>
    </div>
  );
}

export default MainComponent;
