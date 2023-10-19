import axios from "axios";
import "leaflet/dist/leaflet.css";
import { icon } from 'leaflet';
import { useEffect, useState,useRef } from 'react';
import {Route,Routes } from "react-router-dom";
import {MapContainer,TileLayer, Marker, Popup, Polyline } from "react-leaflet" 
import SearchBox from "./SearchBox";
import RouteDetail  from "./RouteDetail";
import RouteNav from "./RouteNav";
export default function Busmap(){
    const routeUrl = 'https://ptx.transportdata.tw/MOTC/v2/Bus/Shape/City/Taichung/'
    const stopUrl = 'https://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/Taichung/'
    // todo 測試是否改成routeName查詢
    const busUrl = 'https://ptx.transportdata.tw/MOTC/v2/Bus/RealTimeByFrequency/City/Taichung/'
    const routeListUrl = 'https://tdx.transportdata.tw/api/basic/v2/Bus/Route/City/Taichung?$format=JSON'
    const customIcon = icon({
        iconUrl: 'https://www.svgrepo.com/show/513278/bus.svg', // 或者使用FontAwesomeIcon等其他圖示
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
    const BusStopIcon = icon({
        iconUrl: 'https://www.svgrepo.com/show/401245/bus-stop.svg', // 或者使用FontAwesomeIcon等其他圖示
        iconSize: [30,30],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
    const mapRef = useRef(null); // 地圖元素引用
    const [routeDetail,setRouteDetail]=useState([]) //使用useState來維護路線資訊的狀態
    const [routes, setRoutes] = useState([]); // 使用useState來維護路線的狀態
    const [stops, setStops] = useState([]); // 使用useState來維護路線的狀態
    const [bus, setBus] = useState([]); // 使用useState來維護路線的狀態
    const [stopName,setStopName]=useState('')
    const [inputBus,setInputBus] =useState('1')
    const [otherRouteDeatil,setOtherRouteDeatil]=useState([{}])
    const routeDetailUrl =`https://tdx.transportdata.tw/api/basic/v2/Bus/EstimatedTimeOfArrival/City/Taichung/`
    const limeOptions = { color: 'blue',dashArray: '10, 10'}
    const [token,setToken] = useState('123')
    useEffect(()=>{
            console.log('queryAPItoken')
            axios({
                method:"POST",
                url:'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token',
                header:{'Content-Type': 'application/x-www-form-urlencoded',
                        'Host':'127.0.0.1'},
                data:`grant_type=client_credentials&client_id=alt41450-f8e4d4b4-4612-4c08&client_secret=08462b91-86d6-46c0-9e73-13d94698d8af`
            }).then(function(response){
                setToken(response.data.access_token)
            })
            console.log(token)}
    ,[])
    const addRouteLine = (routeName=inputBus)=>{
        // 添加公車路線
        axios({
            method: 'get',
            url: routeUrl+`${routeName}?$format=JSON`+`&$filter=RouteName/Zh_tw eq '${routeName}'`,
            headers:{
                'Authorization':`Bearer ${token}`
            }
            })
            .then(function (response) {
                console.log("HTTP 狀態碼:", response.status);
                // console.log("data:", response.data);
                // console.log('Geometry:',response.data[0].Geometry)
                let routeNodes = response.data
                // console.log('回傳資料:',routeNodes)
                // 0去程 1回程
                routeNodes = routeNodes[0].Geometry.replace('LINESTRING(','').replace(')','').split(',')
                let routeLine = routeNodes.map(node=>[node.split(' ')[1],node.split(' ')[0]])
                setRoutes([routeLine]);
            });

    }
    const addRoutestops = (routeName=inputBus)=>{
        console.log('addRoutestops',routeName)
        axios({
            method: 'get',
            url: stopUrl+`${routeName}?$format=JSON`+`&$filter=RouteName/Zh_tw eq '${routeName}'`,
            headers:{
                'Authorization':`Bearer ${token}`
            }
            })
            .then(function (response) {
                // console.log(response.data)
                let routeStops =response.data
                // console.log('查詢路線:',routeName,'| 回傳站點資料:',routeStops)
                // routeStops[0] 0去程 1回程
                routeStops = routeStops[0].Stops.map((stops)=>{return {
                    StopName: stops.StopName.Zh_tw,
                    PositionLat: stops.StopPosition.PositionLat,
                    PositionLon: stops.StopPosition.PositionLon,
                }
                 })
                // 計算公車路線中心
                let startStop=routeStops[0]
                let endStop=routeStops[routeStops.length-1]
                let map = mapRef.current
                if (map){
                    map.setView([(startStop.PositionLat+endStop.PositionLat)/2, (startStop.PositionLon+endStop.PositionLon)/2],12.5);
                }
                setStops(routeStops);
            });
    }
    const addBusLocation = (e,routeName=inputBus)=>{
            e.preventDefault()
            console.log('addBusLocation',routeName)
            addRoutestops(routeName)
            addRouteLine(routeName)
            queryRouteDetail(routeName)
            axios({
                method: 'get',
                url: busUrl+`${routeName}?$format=JSON`+`&$filter=RouteName/Zh_tw eq '${routeName}'`,
                })
                .then(function (response) {
                    // console.log("HTTP 狀態碼:", response.status);
                    let busLocations = response.data
                    setBus([...busLocations]);
                });
    }
    const queryRouteDetail = (routeName=inputBus,direction=0)=>{
        axios({
            method: 'get',
            url: routeDetailUrl+`${routeName}?$format=JSON`+`&$filter=RouteName/Zh_tw eq '${routeName}'`,
            headers:{
                'Authorization':`Bearer ${token}`
            }
            })
            .then(function (response) {
                let routeDeatil=response.data.filter(route=>route.Direction===parseInt(direction))
                routeDeatil.sort((a, b) => a.StopSequence - b.StopSequence);
                // console.log('查詢路線:',routeName,"回傳路線資料:",routeDeatil)
                setRouteDetail(()=>{
                    return routeDeatil.map((item)=>{
                        return{
                            StopName: item.StopName.Zh_tw,
                            StopSequence: item.StopSequence,
                            StopStatus: item.StopStatus,
                            NextBusTime: item.NextBusTime,  
                            StopID: item.StopID,    
                            EstimateTime: item.EstimateTime,     
                            PlateNumb : item.PlateNumb             
                        }
                    })
                })
            });
    }
    // 新增站位其他路線查詢
    const queryStationRoute=(e)=>{
        let station = stopName
        // 讀取檔案為異步處理會回傳promise物件
        const getRouteList= async (routeName,direction)=>{
            const response = await axios.get('TaichungRouteList.json');
            const data = response.data.filter(item => item.RouteName.Zh_tw === routeName);
            const routeDirection = direction === 0 ? data[0].DepartureStopNameZh : data[0].DestinationStopNameZh;
            return routeDirection;
            }
         axios({
            method: 'get',
            url: routeDetailUrl+`?$format=JSON`+`&$filter=StopName/Zh_tw eq '${station}'`,
            headers:{
                'Authorization':`Bearer ${token}`}
            }).then((response)=>{
                console.log(response.data)
                let data = response.data.map((item)=>{
                    return {
                        StopName:item.StopName.Zh_tw,
                        PlateNumb:item.PlateNumb,
                        EstimateTime:item.EstimateTime,
                        NextBusTime:item.NextBusTime,
                        RouteName:item.RouteName.Zh_tw,
                        Direction:item.Direction,
                        RouteDirection:getRouteList(item.RouteName.Zh_tw,item.Direction)
                        }
                })
                return data
            }).then((data)=>{
                ((d)=>{
                    // 透過Promise.all確認所有資料處理完畢
                    Promise.all(d.map(item=>item.RouteDirection)).then((res)=>{
                        console.log('promiseAll RouteData')
                        // 將原本的promise物件替換成處理好的值
                        let readyData=d.map((item,index)=>{
                            item.RouteDirection=res[index]
                            return item})
                        // 更改狀態進行新一次渲染
                        setOtherRouteDeatil(readyData)
                    })
                })(data)
            })
        // 获取具有类名".station-routes-wrap"的元素
        const stationRoutesWrap = document.querySelector(".station-routes-wrap");
        // 修改元素的样式
        if (stationRoutesWrap) {
        stationRoutesWrap.style.display='block'
            }
    }
    useEffect(()=>{
        queryStationRoute()
    },[stopName])
    return(
        <div className="main-content">
            <SearchBox 
                    inputBus={inputBus}
                    setInputBus={setInputBus}
                    addBusLocation={addBusLocation}
                    routeListUrl={routeListUrl}
                    token={token}
                    />
            <RouteNav />    
            <Routes>
                <Route path="/" element={<RouteDetail routeDetail={routeDetail} direction='0' queryRouteDetail={queryRouteDetail} stops={stops} mapRef={mapRef} inputBus={inputBus}/>} />
                <Route path="/inbound" element={<RouteDetail routeDetail={routeDetail} direction='1' queryRouteDetail={queryRouteDetail} stops={stops} mapRef={mapRef} inputBus={inputBus}/>} />
            </Routes>
            <MapContainer center={[24.14427284629348, 120.67621054884772]} zoom={13} ref={mapRef}>
                <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {routes.map((line,index)=>
                <Polyline pathOptions={limeOptions} positions={line} key={index}/>)
                }
                {
                stops.map((stop,index)=>
                    <Marker key={index} position={[stop.PositionLat,stop.PositionLon]} icon={BusStopIcon}>
                            <Popup>
                                <div>{stop.StopName}</div>
                                <div>
                                    {/* onClick先透過setStopName紀錄站位名子 */}
                                    <div style={{margin:'10px'}} onClick={(e)=>{setStopName(e.target.getAttribute('StopName'))}} StopName={stop.StopName}>經過路線</div>
                                    <ul className="station-routes-wrap" >
                                        {/* 透過當前stop.StopName(popup)跟目前狀態中的路線資訊比較進行顯示設定 */}
                                        {otherRouteDeatil[0].StopName===stop.StopName?otherRouteDeatil.map((item)=>{
                                            return (
                                                <li className="station-routes-list">
                                                    <span className="station-routes-list-item">{item.RouteName}</span>
                                                    <span className="station-routes-list-item">{item.EstimateTime?Math.round(item.EstimateTime/60)+'分':
                                                        (()=>{
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
                                                            })()}
                                                    </span>
                                                    <span className="station-routes-list-item">{' 往: '+item.RouteDirection}</span>
                                                </li>
                                            )
                                        }):null}
                                    </ul>
                                </div>
                            </Popup>
                    </Marker>)
                }
                {
                bus.map((bus,index)=>
                    <Marker key={index} position={[bus.BusPosition.PositionLat
                        ,bus.BusPosition.PositionLon]} icon={customIcon}>
                            <Popup>{bus.PlateNumb}</Popup>
                    </Marker>)
                }
            </MapContainer>
        </div>
    )
}
