import { useState,useRef,useEffect } from 'react';
import RouteDetail from './RouteDetail';
import axios from 'axios';
export default function SearchBox ({ inputBus, setInputBus, addBusLocation,routeListUrl,token}){
  const [routeList,setRouteList]=useState([])
  const [routeFilter,setRouteFilter]=useState([])
  const [routeQueryId,setRouteQueryId]=useState(inputBus)
  const refRouteList=useRef(null)
  const regex = new RegExp(routeQueryId);
  const getRouteList=()=>{
    axios({
      method: 'get',
      url: routeListUrl,
      headers:{
          'Authorization':`Bearer ${token}`}
      })
      .then((response)=>{
        let data=response.data
        let list=data.map((item)=>{
          return {
            RouteID:item.RouteID,
            Headsign:item.SubRoutes[0].Headsign,
          }
        })
        list.sort((a, b) => parseInt(a.RouteID) - parseInt(b.RouteID))
        setRouteList([...list])
      })
      // refRouteList.current.style({display:'block'})
      refRouteList.current.style.display='block'
      refRouteList.current.style.height='400px'
      refRouteList.current.style.overflow='scroll'
      
  }
  const searchByClick=(e)=>{
    let routeId=e.target.getAttribute("routeId")
    setInputBus(routeId)
    addBusLocation(e)
    refRouteList.current.style.display='none'
  }
  const showList=()=>{
    setInputBus(routeQueryId)
    let routeListFilter=routeList.filter((item)=>{
      return regex.test(item.RouteID)
    })
    setRouteFilter(routeListFilter)
    refRouteList.current.style.display='block'
  }
  // query路線資訊&顯示路線資訊
  useEffect(()=>{getRouteList()},[])
  useEffect(()=>{showList()},[routeQueryId])

  return (
    <div className="SearchBox">
      <form onSubmit={addBusLocation}>
        <label>
          輸入路線:
          <input type="text" value={inputBus} onChange={(e)=>setRouteQueryId(e.target.value)} />
        </label>
        {/* <input type="submit" value="Submit" /> */}
      </form>
        <ul className='route-list' ref={refRouteList}>
          {/* 動態創建搜尋路線資訊表 */}
        {routeFilter.map((routeItem)=>{
          return(
              <li className='route-list-item' routeId={routeItem.RouteID} onClick={searchByClick} >
                <div routeId={routeItem.RouteID}>{`${routeItem.RouteID}`}</div>
                <div routeId={routeItem.RouteID}>{`${routeItem.Headsign}`}</div>
              </li>
          )
        })}
        </ul>
    </div>
  )
}
