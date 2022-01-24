/**
 * @file Root options component.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */
import React, { useEffect, useState } from 'react';

import DB from '../db.js';
import './MainComponent.scss';
import DetailsComponent from './DetailsComponent.jsx';

function MainComponent() {
  const [list, setList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const getItem = async (id) => {
    const item = await DB.read(id);
    setSelectedItem(item);
  };
  
  const updateList = async () => {
    const data = await DB.getList();
    setList(data);
  };
  
  useEffect(() => {
    updateList();
  }, []);

  const onCreateItem = async (item) => {
    await DB.create(item.name, item.url, item.processing);
    await updateList();
    setSelectedItem(null);
  };

  const onUpdateItem = async (item) => {
    if(item.id == null) {
      onCreateItem(item);
      return;
    }

    await DB.update(item.id, item.name, item.url, item.processing);
    const freshItem = await DB.read(item.id);
    setSelectedItem(freshItem);
    console.log('Changes saved.');
  };

  const onDeleteItem = async (id) => {
    await DB.delete(id);
    await updateList();
    setSelectedItem(null);
  };

  const listItems = list.map((item) => {
    return (
      <div key={ item.id } className={"main-component__list-item" + (selectedItem != null && item.name == selectedItem.name ? ' item_selected' : '')}
        onClick={() => {
          getItem(item.id);
        }}>
        { item.name }
      </div>
    );
  });

  return (
    <div className="main-component">
      <div className="main-component__left">
        { listItems }

        <button onClick={() => {
          setSelectedItem({
            id: null,
            name: '',
            url: '',
            processing: ''
          });
        }}>Create new</button>
      </div>
      <div className="main-component__right">
        {selectedItem != null &&
          <DetailsComponent item={selectedItem}
            onUpdate={onUpdateItem}
            onDelete={onDeleteItem} />
        }
        {selectedItem == null &&
          <div>(Select item from the list on the left, or create a new one)</div>
        }
      </div>
    </div>
  );
}

export default MainComponent;
