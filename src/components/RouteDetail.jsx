import React from 'react'
import { useEffect,useState,useRef} from 'react'
export const RouteDetail = ({routeDetail,queryRouteDetail,direction,stops,mapRef,inputBus}) => {
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [dateNow,setDateNow]=useState(new Date())
    const prevRouteDetail = useRef(routeDetail);
    prevRouteDetail.current = routeDetail;
    //定時器更新hook
    useEffect(() => {
        // 定義更新計時器
        console.log('數據更新')
        const updateInterval = 1000; // 每秒更新時間
        const timer = setTimeout(() => {
        //倒數30秒調用setLastUpdated達到更新數據
        if(30-Math.floor(Math.abs(lastUpdated.getTime()-dateNow.getTime())/1000)<=0){
            setLastUpdated(new Date());
             }
        setDateNow(new Date())
        }, updateInterval);
        return () => {
        clearTimeout(timer);
      };
      }, [lastUpdated,dateNow]);
    //路線資訊更新hook
    useEffect(()=>{
        setLastUpdated(new Date());
        queryRouteDetail(inputBus,direction)
      },[direction])
    //點擊站名定位站點
    const routeStopsSearch = (e)=>{
        //透過leaflet Map元件的refHooks進行站點位置定位查詢
        console.log(e.target.innerText)
        let {PositionLat,PositionLon}=stops.filter((item)=>item.StopName===e.target.innerText)[0]
        let map = mapRef.current
        if (map){
            console.log(PositionLat,PositionLon)
            map.setView([PositionLat, PositionLon],25);
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
        <div>{(()=>{
            let timeCountDown=30-Math.floor(Math.abs(lastUpdated.getTime()-dateNow.getTime())/1000)
            return(
                <div style={{margin:'10px'}}>
                    <span>{`剩餘更新時間: ${timeCountDown}`}</span>
                    <div className="progress" style={{ width: `${timeCountDown/30*100}%` }}></div>
                </div>
            )
        })()}</div>
        <ul>
            {routeDetail.map((item)=>{
                    return (
                        <li className="route-detail-header">
                        <span lang="stopseq">{item.StopSequence}</span>
                        <span lang="ivrno">{item.StopID }</span>
                        <span lang="stopname" onClick={routeStopsSearch}>{item.StopName}</span>
                        <span>
                            <div lang="eta">{item.EstimateTime?Math.round(item.EstimateTime/60)+'分':(()=>{
                                if(!item.NextBusTime){
                                    return '末班駛離'
                                }
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

