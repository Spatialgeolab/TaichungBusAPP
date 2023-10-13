import { useState } from 'react';
import RouteDetail from './RouteDetail';
export default function SearchBox ({ inputBus, setInputBus, addBusLocation }){
  return (
    <div className="SearchBox">
      <form onSubmit={addBusLocation}>
        <label>
          輸入路線:
          <input type="text" value={inputBus} onChange={(e)=>{setInputBus(e.target.value)}} />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
  )
}
