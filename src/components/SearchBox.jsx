import { useState,useRef,useEffect } from 'react';
import axios from 'axios';
export default function SearchBox ({ inputBus, setInputBus, addBusLocation,routeListUrl,token}){
  const [routeList,setRouteList]=useState([])
  const [routeFilter,setRouteFilter]=useState([])
  const [routeQueryId,setRouteQueryId]=useState(inputBus)
  const refRouteList=useRef(null)
  const regex = new RegExp(routeQueryId);
  const getRouteList=(direction)=>{
    axios({
      method: 'get',
      url: 'TaichungRouteList.json'})
      .then((response)=>{
        let data=response.data
        let list=data.map((item)=>{
          return {
            RouteID:item.RouteID,
            Headsign:item.SubRoutes[0].Headsign,
            RouteName:item.RouteName.Zh_tw
          }
        })
        list.sort((a, b) => parseInt(a.RouteID) - parseInt(b.RouteID))
        setRouteList(list)
      })
      refRouteList.current.style.display='none'
  }
  const showList=()=>{
    setInputBus(routeQueryId)
    let routeListFilter=routeList.filter((item)=>{
      return regex.test(item.RouteID)
    })
    setRouteFilter(routeListFilter)
    // 確保執行順序是先display:none->block
    refRouteList.current.style.overflow='scroll'
    refRouteList.current.style.display='block'
  }
  const searchByClick=(e)=>{
    let routeId=e.target.getAttribute("routeId")
    console.log('查詢:',routeId)
    setInputBus(routeId)
    // 直接調用會造成異步渲染還未更新
    addBusLocation(e,routeId)
    refRouteList.current.style.display='none'
  }
  // query路線資訊&顯示路線資訊
  useEffect(()=>{showList();console.log('執行showList()')},[routeQueryId])
  useEffect(()=>{getRouteList();
  console.log('執行getRouteList()取的靜態路線資料')},[])
  return (
    <div className="SearchBox">
      <form onSubmit={addBusLocation}>
        <label>
          輸入路線:
          <input type="text" value={inputBus} onChange={(e)=>setRouteQueryId(e.target.value)}
           onFocus={()=>{setInputBus('')}}/>
        </label>
        {/* <input type="submit" value="Submit" /> */}
      </form>
        <ul className='route-list' ref={refRouteList}>
          {/* 動態創建搜尋路線資訊表 */}
        {routeFilter.map((routeItem)=>{
          return(
              <li className='route-list-item' routeId={routeItem.RouteName} onClick={searchByClick} >
                <div routeId={routeItem.RouteName}>{`${routeItem.RouteName}`}</div>
                <div routeId={routeItem.RouteName}>{`${routeItem.Headsign}`}</div>
              </li>
          )
        })}
        </ul>
    </div>
  )
}
