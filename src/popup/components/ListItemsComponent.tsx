/**
 * @file List news items.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */

import React from 'react';
import { INewsItem } from '../../background/interfaces';
import './ListItemsComponent.scss';

interface IListItemsComponentProps {
  items: INewsItem[]
}

/**
 * Component for news items.
 */
function ListItemsComponent(props: IListItemsComponentProps) {
  const items = props.items;

  const elements = items.map((item) => {
    return (
      <div className="list-item">
        <div className="list-item__header">
          <a href={ item.link } target="_blank" className="list-item__header-link">{item.name}</a>
        </div>
        <div className="list-item__image">
          {typeof(item.image !== 'undefined') && item.image != null &&
            <img src={item.image} className="list-item__image-picture" />
          }
        </div>
        <div className="list-item__description">{ item.description }</div>
      </div>
    );
  });

  return (
    <div className="list">
      { elements }
    </div>
  );
}

export default ListItemsComponent;
