import 'bootstrap/dist/css/bootstrap.css';
import { useState,useRef,useEffect } from 'react';
import axios from 'axios';
export default function SearchBox ({ inputBus, setInputBus, addBusLocation}){
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
  useEffect(() => {
    const timer = setTimeout(() => {
      showList();
      console.log('執行showList()')
    }, 500);
      return ()=>{console.log('clear timer');clearTimeout(timer)}}
      ,[routeQueryId])


  useEffect(()=>{getRouteList();
      console.log('執行getRouteList()取的靜態路線資料')
    },[])
  return (
    
    <div className="form-outline">
      <form onSubmit={addBusLocation} className='row'>
        <div className="form-floating">
          <input type="text" className='form-control' id='typeText' value={routeQueryId}
            onChange={(e) => setRouteQueryId(e.target.value)}
            onFocus={() => { setRouteQueryId('') }} onKeyDown={(e) => { if (e.key === 'Enter') { setInputBus(e.target.value) } } }/>
          <label className="text-center" for="typeText">請輸入公車路線</label>
        </div>
      </form>
        <ul className='list-group list-group-light route-list-item w-100 ' ref={refRouteList}>
          {/* 動態創建搜尋路線資訊表 */}
        {routeFilter.map((routeItem)=>{
          return(
              <li className='list-group-item d-flex justify-content-between align-items-center list-group-item-action list-group-item-info'  routeId={routeItem.RouteName} onClick={searchByClick} >
                <div className='"badge badge-primary rounded-pill px-3 border-0 rounded-3 mb-2'  routeId={routeItem.RouteName}>{`${routeItem.RouteName}`}</div>
                <div className='"badge badge-primary rounded-pill px-3 border-0 rounded-3 mb-2' routeId={routeItem.RouteName}>{`${routeItem.Headsign}`}</div>
              </li>
          )
        })}
        </ul>
    </div>
  )
}
