// @ts-nocheck
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { useEffect, useState,useRef,useCallback} from 'react';
import {Route,Routes} from "react-router-dom";
import {MapContainer,TileLayer, Marker, Popup, Polyline } from "react-leaflet" 
import { getApiUrl,busMapApi } from "./api/apiConfig";
import SearchBox from "./SearchBox";
import RouteDetail  from "./RouteDetail";
import RouteNav from "./RouteNav";
import Button from 'react-bootstrap/Button';
import {customIcon} from "./api/customIcon";
import { setBusObj } from "./store/busSlice";
import { useSelector,useDispatch } from "react-redux";
import { useGetBusPositionQuery,useGetBusRouteQuery,useGetBusStopQuery,useGetBusRouteListQuery,useGetBusRouteDetailQuery} from "./store/busApi";
import { useGetTokenQuery } from "./api/authApi";
import { authSetToken } from "./store/authSlice";
export default function Busmap(){
    // useSelector() 載入state數據
    const { token } = useSelector(state => state.token)
    const busState = useSelector(state=>state.bus)
    const dispatch = useDispatch()
    // 以上練習redux
    const routeUrl = getApiUrl(busMapApi.route);
    const stopUrl = getApiUrl(busMapApi.stop);
    const busUrl = getApiUrl(busMapApi.realTime);
    const routeListUrl = getApiUrl(busMapApi.routeList);
    const routeDetailUrl = getApiUrl(busMapApi.routeDetail);
    const mapRef = useRef(null); // 地圖元素引用
    const [routeDetail,setRouteDetail]=useState([]) //使用useState來維護路線資訊的狀態
    const [routes, setRoutes] = useState([]); // 使用useState來維護路線的狀態
    const [stops, setStops] = useState([]); // 使用useState來維護站牌的狀態
    const [bus, setBus] = useState([]); // 使用useState來維護公車定位的狀態
    const [stopName,setStopName]=useState('')// 使用useState來維護站位的狀態
    const [inputBus,setInputBus] =useState('1')//使用useState來當前查詢路線的狀態
    const [direction,setDirection]=useState(0)
    const [otherRouteDeatil,setOtherRouteDeatil]=useState([{}])
    const lineOptions = { color: 'blue',dashArray: '10, 10'}
    const [isGetToken, setisGetToken] = useState(Boolean(token))
    const [isUpdateData,setIsUpdateData] =useState(true)
    if (!isGetToken) {
        console.log('沒有token，進行獲取')
        const {data:tokenData, isLoading, isFetching } = useGetTokenQuery()
        // 將數據派發到 Redux store
        if(tokenData){
            dispatch(authSetToken({
                token:tokenData.access_token}));
            setisGetToken(true)
        }
    }
    const formatRouteLine=(res,direction) => {
        let routeNodes = res
        console.log(direction)
        routeNodes = routeNodes[direction].Geometry.replace('LINESTRING(','').replace(')','').split(',')
        let routeLine = routeNodes.map(node=>[node.split(' ')[1],node.split(' ')[0]])
        return [routeLine]; }
    const formatRoutestops = (res, direction) => {
        let routeStops =res
        // console.log('查詢路線:',routeName,'| 回傳站點資料:',routeStops)
        routeStops = routeStops[direction].Stops.map((stops)=>{return {
            StopName: stops.StopName.Zh_tw,
            PositionLat: stops.StopPosition.PositionLat,
            PositionLon: stops.StopPosition.PositionLon,
        }})
        // 計算公車路線中心
        let startStop=routeStops[0]
        let endStop=routeStops[routeStops.length-1]
        let map = mapRef.current
        if (map){
            map.setView([(startStop.PositionLat+endStop.PositionLat)/2, (startStop.PositionLon+endStop.PositionLon)/2],12.5);
        }
        return routeStops;
        
    }
    const formatBusLocation = (res, direction) => {
        let busLocations = res
        busLocations=busLocations.filter((item)=>item.Direction===direction)
        return [...busLocations]
    }
    const formatRouteDetail = (res, direction) => {
        let routeDeatil = res.filter(route => route.Direction === parseInt(direction))
        // 進行站點排序
        routeDeatil.sort((a, b) => a.StopSequence - b.StopSequence);
        // console.log('查詢路線:',routeName,"回傳路線資料:",routeDeatil)
        return routeDeatil.map((item) => {
            return {
                StopName: item.StopName.Zh_tw,
                StopSequence: item.StopSequence,
                StopStatus: item.StopStatus,
                NextBusTime: item.NextBusTime,
                StopID: item.StopID,
                EstimateTime: item.EstimateTime,
                PlateNumb: item.PlateNumb
            }
        })
    }
    const busData=[useGetBusPositionQuery(inputBus),
        useGetBusRouteDetailQuery(inputBus),
        useGetBusRouteQuery(inputBus),
        useGetBusRouteListQuery(inputBus),
        useGetBusStopQuery(inputBus)]
    if ((busData.filter((item) => item.status=="fulfilled").length == 5)&&isUpdateData) {
        console.log('開始派發數據')
        console.log(busData)
        dispatch(setBusObj({
            busId:inputBus,
            busPosition: formatBusLocation(busData[0].data,0),
            busDetail: formatRouteDetail(busData[1].data,0),
            busRoute: formatRouteLine(busData[2].data,0),
            busRouteList:busData[3].data,
            busStops: formatRoutestops(busData[4].data,0),
            busDirection:direction
        }))
        setIsUpdateData(false)
    }
    useEffect(()=>setIsUpdateData(true),[inputBus])
    const addRouteLine = (routeName=inputBus,dir_index=direction)=>{
        axios({
            method: 'get',
            url: routeUrl+`${routeName}?$format=JSON`+`&$filter=RouteName/Zh_tw eq '${routeName}'`,
            headers:{
                'Authorization':`Bearer ${token}`
            }
            })
            .then(function (response) {
                let routeNodes = response.data
                // 0去程 1回程
                routeNodes = routeNodes[direction].Geometry.replace('LINESTRING(','').replace(')','').split(',')
                let routeLine = routeNodes.map(node=>[node.split(' ')[1],node.split(' ')[0]])
                setRoutes([routeLine]);
            });

    }
    const addRoutestops = (routeName=inputBus,dir_index=direction)=>{
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
                routeStops = routeStops[dir_index].Stops.map((stops)=>{return {
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
    const addBusLocation = (e,routeName=inputBus,dir_index=direction)=>{
            e.preventDefault()
            setInputBus(routeName)
            console.log('addBusLocation',routeName)
            addRoutestops(routeName)
            addRouteLine(routeName)
            queryRouteDetail(routeName)
            axios({
                method: 'get',
                url: busUrl + `${routeName}?$format=JSON` + `&$filter=RouteName/Zh_tw eq '${routeName}'`,
                            headers:{
                'Authorization':`Bearer ${token}`
                    }
                })
                .then(function (response) {
                    let busLocations = response.data
                    busLocations=busLocations.filter((item)=>item.Direction===dir_index)
                    setBus([...busLocations]);
                });
    }
    const queryRouteDetail = (routeName=inputBus,dir_index=direction)=>{
        axios({
            method: 'get',
            url: routeDetailUrl+`${routeName}?$format=JSON`+`&$filter=RouteName/Zh_tw eq '${routeName}'`,
            headers:{
                'Authorization':`Bearer ${token}`
            }
            })
            .then(function (response) {
                let routeDeatil=response.data.filter(route=>route.Direction===parseInt(dir_index))
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
            const response = await axios({
                    method: 'get',
                    url: 'TaichungRouteList.json'})
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
        const stationRoutesWrap = document.querySelector(".station-routes-wrap");
        // 修改元素的样式
        if (stationRoutesWrap) {
        stationRoutesWrap.style.display='block'
            }
    }
    // useEffect(()=>{
    //     if(isGetToken){
    //         queryStationRoute()
    //     }
    // },[stopName])
    // useEffect(()=>{
    //     if(isGetToken){
    //         addRoutestops(inputBus)
    //         addRouteLine(inputBus)
    //         axios({
    //             method: 'get',
    //             url: busUrl+`${inputBus}?$format=JSON`+`&$filter=RouteName/Zh_tw eq '${inputBus}'`,
    //             headers:{
    //                 'Authorization':`Bearer ${token}`
    //             }
    //             })
    //             .then(function (response) {
    //                 let busLocations = response.data
    //                 busLocations=busLocations.filter((item)=>item.Direction===direction)
    //                 setBus([...busLocations]);
    //             });
    //     }
    // },[direction])
    // 時間格式化
    const formattedTime = useCallback((time)=>{
        const datetimeString = time;
        const dateObj = new Date(datetimeString);
        // 提取小時和分鐘部分
        const hours = dateObj.getHours();
        const minutes = dateObj.getMinutes();
        // 格式化時間（加0是為了確保時間以兩位數表示）
        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        return formattedTime
    })
    return(
        <>
        {isGetToken&&<>
            <nav class="navbar navbar-light bg-light">
                <h1 className="text-dark d-block w-100 text-center">台中市即時公車地圖</h1>
            </nav>
            <div className="container-fluid">
                {/* 響應式設計 > */}
                <div class="row flex-column-reverse flex-sm-row">
                    <div class="col-12 col-sm-4">
                        <div className="container">
                            <SearchBox
                                inputBus={inputBus}
                                setInputBus={setInputBus}
                                addBusLocation={addBusLocation}
                                routeListUrl={routeListUrl}
                                token={token}/>
                            <RouteNav setDirection={setDirection} direction={direction} />    
                            <Routes>
                                <Route path="/" element={<RouteDetail routeDetail={routeDetail} direction={direction} queryRouteDetail={queryRouteDetail} stops={stops} mapRef={mapRef} inputBus={inputBus}/>} />
                                <Route path="/inbound" element={<RouteDetail routeDetail={routeDetail} direction={direction} queryRouteDetail={queryRouteDetail} stops={stops} mapRef={mapRef} inputBus={inputBus}/>} />
                            </Routes>
                        </div>
                    </div>
                    <div class="col-12 col-sm-8">
                        <div className="main-content">
                            <MapContainer  center={[24.14427284629348, 120.67621054884772]} zoom={13} ref={mapRef}>
                                <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png" />
                                    {/* 渲染公車位置 */}
                                {
                                bus.map((bus,index)=>
                                    <Marker key={index} position={[bus.BusPosition.PositionLat
                                        ,bus.BusPosition.PositionLon]} icon={customIcon.Bus} zIndexOffset={1000 + index}>
                                            <Popup>{bus.PlateNumb}</Popup>
                                    </Marker>)
                                }
                                {/* 渲染公車路線 */}
                                {routes.map((line,index)=>
                                <Polyline pathOptions={direction===0?lineOptions:(()=>{lineOptions.color='red';return lineOptions})()} positions={line} key={index}/>)
                                }
                                {/* 渲染公車站點 */}
                                {
                                stops.map((stop,index)=>
                                    <Marker key={index} position={[stop.PositionLat,stop.PositionLon]} icon={customIcon.BusStopIcon}>
                                            {/* <Popup>
                                                <div>
                                                    <div className="stop-info">{stop.StopName}</div>
                                                    <div className="stop-info">路線:{inputBus}</div>
                                                    onClick先透過setStopName紀錄站位名子
                                                    <Button variant="success" className='col-12 p-10 ' onClick={(e)=>{setStopName(e.target.getAttribute('StopName'))}} StopName={stop.StopName}>其他路線</Button>{}
                                                    <ul className="other-route-list" >
                                                        透過當前stop.StopName(popup)跟目前狀態中的路線資訊比較進行顯示設定
                                                        {!otherRouteDeatil[0].StopName?'':otherRouteDeatil[0].StopName===stop.StopName?otherRouteDeatil.map((item)=>{
                                                            return (
                                                                    <li className="list-group-item route-detail-header ">
                                                                        <span className="btn btn-success w-25" style={{marginRight:'5px'}} onClick={(e)=>{
                                                                            addBusLocation(e,item.RouteName)}}>{item.RouteName}</span>
                                                                        <span className="w-50 text-left">{' 往: '+item.RouteDirection}</span>
                                                                        <span className={`text-right badge bg-${!item.EstimateTime?'secondary':(Math.round(item.EstimateTime)/60)<5?'danger':'primary'}`}>{item.EstimateTime?Math.round(item.EstimateTime/60)+'分':
                                                                            (()=>{
                                                                                if(!item.NextBusTime){
                                                                                    return '末班駛離'
                                                                                }
                                                                                return formattedTime(item.NextBusTime)
                                                                                })()}
                                                                        </span>
                                                                    </li>
                                                            )
                                                        }):null}
                                                    </ul>
                                                </div>
                                            </Popup> */}
                                    </Marker>)
                                }
                            </MapContainer>
                        </div>
                    </div>
                    </div>
            </div>
            </>
            }
        </>
    )
}
