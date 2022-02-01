/**
 * @file Root options component.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */
import React, { useEffect, useState } from 'react';
import DB from '../../background/background-db';
import Settings from '../../background/background-settings';
import { INamesListItem, ISourceObject } from '../../background/interfaces';
import './MainComponent.scss';
import DetailsComponent from './DetailsComponent';

function MainComponent() {
  const [list, setList] = useState<INamesListItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ISourceObject>(null);
  const [requestDelay, setRequestDelay] = useState<number>(null);

  useEffect(() => {
    (async () => {
      if(requestDelay == null) return;

      Settings.set('requestDelay', requestDelay);
    })();
  }, [requestDelay]);

  /**
   * Read item from database.
   */
  const getItem = async (id: number) => {
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
  
  useEffect(() => {
    (async () => {
      updateList();

      setRequestDelay(await Settings.get('requestDelay'));
    })();
  }, []);

  /**
   * Create item in database.
   */
  const onCreateItem = async (item: ISourceObject) => {
    await DB.create(item.name, item.url, item.processing, item.isActive);
    await updateList();
    setSelectedItem(null);
    await updateList();
  };

  /**
   * Update item in database.
   */
  const onUpdateItem = async (item: ISourceObject) => {
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
   */
  const onDeleteItem = async (id: number) => {
    await DB.delete(id);
    await updateList();
    setSelectedItem(null);
  };

  const listItems = list.map((item) => {
    return (
      <div key={ item.id } className={"sources-list__item" + (selectedItem != null && item.name == selectedItem.name ? ' sources_list_item_selected' : '')}
        onClick={() => {
          getItem(item.id);
        }}>
        { item.name } ({item.isActive ? 'active' : 'not active'})
      </div>
    );
  });

  return (
    <div className="container">
      <div className="container__left">
        <label className="request-delay">
          Request delay<br />(in minutes):
          <input type="text"
            className="request-delay__input"
            value={requestDelay == null ? 0 : requestDelay}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              if(!isNaN(value) && value > 0) {
                setRequestDelay(value);
              }
            }} />
        </label>

        <div className="sources-list">
          <div className="sources-list__header">Sources list:</div>

          { listItems }

          <div className="button-area">
            <button className="button"
              onClick={() => {
              setSelectedItem({
                id: null,
                name: '',
                url: '',
                processing: '',
                isActive: false
              });
            }}>Create new</button>
          </div>
        </div>
      </div>
      <div className="container__right">
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
