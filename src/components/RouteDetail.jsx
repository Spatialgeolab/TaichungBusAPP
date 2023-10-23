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
      <div className='border border-3'>
        <h3 className='badge text-bg-warning d-block'>路線詳細資訊:
        {stops.length===0?'':direction=='0'?`往 ${stops[stops.length-1].StopName}`:`往 ${stops[0].StopName}`}
        </h3>
        <ul className='list-group '>
            <li className="list-group-item route-detail-header">
                <span className='bg-dark badge ' >站序</span>
                <span className='bg-dark badge '>簡碼</span>
                <span className='bg-dark badge '>站名</span>
                <span className='bg-dark badge '>預估時間</span>
                <span className='bg-dark badge '>進站公車</span>
            </li>
            {routeDetail.map((item)=>{
                    return (
                    <li className="route-detail-header list-group-item ">
                        <span className=''>{item.StopSequence}</span>
                        <span className='flex-md-wrap align-items-start w-10'>{item.StopID }</span>
                        <span className='item-stop-name flex-md-wrap' onClick={routeStopsSearch}>{item.StopName}</span>
                        {/* 透過剩餘到站時間進行樣式變化 */}
                        <span className={`text-center badge bg-${!item.EstimateTime?'secondary':(Math.round(item.EstimateTime)/60)<5?'danger':'primary'}`}>
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
        <div>{(()=>{
            let timeCountDown=30-Math.floor(Math.abs(lastUpdated.getTime()-dateNow.getTime())/1000)
            return(
                <div style={{margin:'10px'}}>
                    <span>{`剩餘更新時間: ${timeCountDown}`}</span>
                    <div className="progress" style={{ width: `${timeCountDown/30*100}%` }}></div>
                </div>
            )
        })()}</div>
    </div>
  )
}
export default RouteDetail

