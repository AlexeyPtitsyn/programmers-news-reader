/**
 * @file Details editor component.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */

import React, { useEffect, useState } from 'react';

import './DetailsComponent.scss';

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
      <div>
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
