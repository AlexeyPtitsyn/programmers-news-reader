/**
 * @file Details editor component.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */

import '../../../dist/interfaces.js';

import React, { useEffect, useState } from 'react';

import './DetailsComponent.scss';

/**
 * @typedef {Object} DetailsComponentProps
 * @property {SourceObject} item - News object item.
 * @property {Function} onUpdate - Update callback.
 * @property {Function} onDelete - Delete callback.
 */

/**
 * Details component.
 * 
 * @param {DetailsComponentProps} props
 * @returns {JSX.Element}
 */
function DetailsComponent(props) {
  const [item, setItem] = useState({ ...props.item });

  useEffect(() => {
    setItem({
      ...props.item
    });
  }, [props.item]);

  return (
    <div className="details-component">
      <div>
        <label>
          Active:
          <input type="checkbox" checked={item.isActive} onChange={()=>{
            setItem({
              ...item,
              isActive: !item.isActive
            });
          }} />
        </label>
      </div>

      <div>
        <label>
          Name:
          <input type="text" value={item.name} onChange={(e)=>{
            setItem({
              ...item,
              name: e.target.value
            });
          }} />
        </label>
      </div>

      <div>
        <label>
          URL:
          <input type="text" value={item.url} onChange={(e)=>{
            setItem({
              ...item,
              url: e.target.value
            });
          }} />
        </label>
      </div>

      <div>
        <label>
          Parse function (TODO: instructions):
          <textarea value={item.processing} onChange={(e) => {
            setItem({
              ...item,
              processing: e.target.value
            });
          }}></textarea>
        </label>
      </div>

      <div className="details-component__buttons">
        <button className="details__btn-save" onClick={() => {
          props.onUpdate(item);
        }}>Save changes</button>

        {item.id != null &&
          <button className="details__btn-delete" onClick={() => {
            if(!confirm('Are you sure you want to delete this item?')) {
              return;
            }

            props.onDelete(item.id);
          }}>Delete item</button>
        }
      </div>
    </div>
  );
}

export default DetailsComponent;
