/**
 * @file Root options component.
 * @author Alexey Ptitsyn <alexey.ptitsyn@gmail.com>
 * @copyright Alexey Ptitsyn <alexey.ptitsyn@gmail.com>, 2022
 */

import React, { useEffect, useState } from 'react';

import DB from '../db.js';
import './MainComponent.scss';

function MainComponent() {
  const [list, setList] = useState([]);

  const updateList = async () => {
    const data = await DB.getList();
    setList(data);
  };

  useEffect(() => {
    updateList();
  }, []);


  const listItems = list.map((item) => {
    return (
      <div key={ item.id } className="main-component__list-item">
        { item.name }
      </div>
    );
  });

  return (
    <div className="main-component">
      <div className="main-component__left">
        { listItems }
      </div>
      <div className="main-component__right">

        <div>
          <label>
            Name:
            <input type="text" value={0} onChange={()=>{}} />
          </label>
        </div>

        <div>
          <label>
            URL:
            <input type="text" value={0} onChange={()=>{}} />
          </label>
        </div>

        <div>
          <label>
            Parse function (TODO: instructions):
            <textarea value={0} onChange={() => {}}></textarea>
          </label>
        </div>

      </div>
    </div>
  );
}

export default MainComponent;
