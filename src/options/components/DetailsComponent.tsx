/**
 * @file Details editor component.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */

import React, { useEffect, useState } from 'react';

import './DetailsComponent.scss';
import { ISourceObject } from '../../background/interfaces';

interface IDetailsComponentProps {
  item: ISourceObject,
  onUpdate: (item: ISourceObject) => void,
  onDelete: (id: number) => void
}

/**
 * Details component.
 */
function DetailsComponent(props: IDetailsComponentProps) {
  const [item, setItem] = useState({ ...props.item });

  useEffect(() => {
    setItem({
      ...props.item
    });
  }, [props.item]);

  return (
    <>
      <label className="details-label">
        Active:
        <input type="checkbox"
          className="checkbox"
          checked={item.isActive}
          onChange={()=>{
          setItem({
            ...item,
            isActive: !item.isActive
          });
        }} />
      </label>

      <label className="details-label">
        Name:
        <input type="text"
          className="text"
          value={item.name}
          onChange={(e)=>{
          setItem({
            ...item,
            name: e.target.value
          });
        }} />
      </label>

      <label className="details-label">
        URL:
        <input type="text"
          className="text"
          value={item.url}
          onChange={(e)=>{
          setItem({
            ...item,
            url: e.target.value
          });
        }} />
      </label>

      <label className="details-label">
        Parse function (TODO: instructions):
        <textarea value={item.processing}
          className="textarea"
          onChange={(e) => {
          setItem({
            ...item,
            processing: e.target.value
          });
        }}></textarea>
      </label>

      <div className="button-area">
        <button className="button" onClick={() => {
          props.onUpdate(item);
        }}>Save changes</button>

        {item.id != null &&
          <button className="button" onClick={() => {
            if(!confirm('Are you sure you want to delete this item?')) {
              return;
            }

            props.onDelete(item.id);
          }}>Delete item</button>
        }
      </div>
    </>
  );
}

export default DetailsComponent;
