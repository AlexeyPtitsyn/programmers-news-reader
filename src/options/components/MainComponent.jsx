/**
 * @file Root options component.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */
import React, { useEffect, useState } from 'react';

import '../../background/interfaces.js';
import DB from '../../background/background-db.js';
import Settings from '../../background/background-settings.js';

import './MainComponent.scss';
import DetailsComponent from './DetailsComponent.jsx';

function MainComponent() {
  /** @type {[NamesListItem[], Function]} */
  const [list, setList] = useState([]);
  /** @type {[SourceObject, Function]} */
  const [selectedItem, setSelectedItem] = useState(null);
  /** @type {[number, Function]} */
  const [requestDelay, setRequestDelay] = useState(null);

  useEffect(async () => {
    if(requestDelay == null) return;

    Settings.set('requestDelay', requestDelay);
  }, [requestDelay]);

  /**
   * Read item from database.
   * @async
   * @param {number} id - Item id.
   */
  const getItem = async (id) => {
    const item = await DB.read(id);
    setSelectedItem(item);
  };

  /**
   * Update list of {id,name} from database.
   * @async
   */
  const updateList = async () => {
    const data = await DB.getNamesList();
    setList(data);
  };
  
  useEffect(async () => {
    updateList();

    setRequestDelay(await Settings.get('requestDelay'));
  }, []);

  /**
   * Create item in database.
   * @async
   * @param {SourceObject} item - Source object.
   */
  const onCreateItem = async (item) => {
    await DB.create(item.name, item.url, item.processing, item.isActive);
    await updateList();
    setSelectedItem(null);
    await updateList();
  };

  /**
   * Update item in database.
   * @async
   * @param {SourceObject} item - Source object with id.
   * @returns 
   */
  const onUpdateItem = async (item) => {
    if(item.id == null) {
      onCreateItem(item);
      return;
    }

    await DB.update(item.id, item.name, item.url, item.processing, item.isActive);
    const freshItem = await DB.read(item.id);
    setSelectedItem(freshItem);
    await updateList();
    
    console.log('Changes saved.'); // TODO: notify user that changes are saved.
  };

  /**
   * Delete item with some ID
   * @param {number} id - Item id.
   */
  const onDeleteItem = async (id) => {
    await DB.delete(id);
    await updateList();
    setSelectedItem(null);
  };

  const listItems = list.map((/** @type {NamesListItem} */ item) => {
    return (
      <div key={ item.id } className={"main-component__list-item" + (selectedItem != null && item.name == selectedItem.name ? ' item_selected' : '')}
        onClick={() => {
          getItem(item.id);
        }}>
        { item.name } ({item.isActive ? 'active' : 'not active'})
      </div>
    );
  });

  return (
    <div className="main-component">
      <div className="main-component__left">
        <div>
          <label>
            Request delay (minutes):
            <input type="text"
              type='text'
              value={requestDelay == null ? 0 : requestDelay}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if(!isNaN(value) && value > 0) {
                  setRequestDelay(value);
                }
              }} />
          </label>
        </div>

        <div>
          <b>Sources list:</b>
        </div>

        { listItems }

        <button onClick={() => {
          setSelectedItem({
            id: null,
            name: '',
            url: '',
            processing: '',
            isActive: false
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
