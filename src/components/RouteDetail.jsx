import React from 'react'
import { useEffect } from 'react'
export const RouteDetail = ({routeDetail,queryRouteDetail,direction,stops,mapRef}) => {
    useEffect(() => {
        //組件加載時、切換頁面時觸發查詢
        queryRouteDetail(direction);
      }, [direction]);
    const routeStopsSearch = (e)=>{
        //透過leaflet Map元件的refHooks進行站點位置定位查詢
        console.log(e.target.innerText)
        let {PositionLat,PositionLon}=stops.filter((item)=>item.StopName===e.target.innerText)[0]
        let map = mapRef.current
        if (map){
            console.log(PositionLat,PositionLon)
            map.setView([PositionLat, PositionLon],30);
        }

    }
  return (
      <div className='route-content'>
        <h2 style={{ textAlign: 'center'}}>路線詳細資訊:{direction=='0'?'去程':'回程'}</h2>
        <ul>
            <li className="route-detail-header list-header">
                <span >站序</span>
                <span >簡碼</span>
                <span >站名</span>
                <span>
                    <div id="eta">預估時間</div>
                </span>
                <span lang="stopname">進站公車</span>
            </li>
        </ul>
        <ul>
            {routeDetail.map((item)=>{
                    return (
                        <li className="route-detail-header">
                        <span lang="stopseq">{item.StopSequence}</span>
                        <span lang="ivrno">{item.StopID }</span>
                        <span lang="stopname" onClick={routeStopsSearch}>{item.StopName}</span>
                        <span>
                            <div lang="eta">{item.EstimateTime?Math.round(item.EstimateTime/60)+'分':(()=>{
                                const datetimeString = item.NextBusTime;
                                const dateObj = new Date(datetimeString);
                                // 提取小時和分鐘部分
                                const hours = dateObj.getHours();
                                const minutes = dateObj.getMinutes();
                                // 格式化時間（加0是為了確保時間以兩位數表示）
                                const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                                return formattedTime
                                })()}</div>
                        </span>
                        <span className='platenumb'>{Number(item.EstimateTime)<=180?item.PlateNumb:''}</span>
                    </li>
                    )
                }
             )
            } 
        </ul>
    </div>
  )
}
export default RouteDetail

