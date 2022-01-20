/**
 * @file List news items.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */

import React from 'react';

import './ListItemsComponent.scss';

function ListItemsComponent(props) {
  const items = props.items;

  const elements = items.map((item) => {
    return (
      <div className="list-items__item">
        <a href={ item.link } target="_blank" className="list-items__item-link">{item.title}</a>
        <div className="list-items__item-image">
          {typeof(item.image !== 'undefined') && item.image != null &&
            <img src={item.image} />
          }
        </div>
        <div className="list-items__item-description">{ item.description }</div>
      </div>
    );
  });

  return (
    <div className="list-items">
      { elements }
    </div>
  );
}

export default ListItemsComponent;
