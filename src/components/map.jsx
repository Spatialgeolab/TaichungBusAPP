import axios from "axios";
import "leaflet/dist/leaflet.css";
import { icon } from 'leaflet';
import { useEffect, useState } from 'react';
import { BrowserRouter, Route,Routes } from "react-router-dom";
import {MapContainer,TileLayer, Marker, Popup, Polyline } from "react-leaflet" 
import SearchBox from "./SearchBox";
import RouteDetail  from "./RouteDetail";
import RouteNav from "./RouteNav";
export default function Busmap(){
    //透過useEffect執行token取得
    const routeUrl = 'https://ptx.transportdata.tw/MOTC/v2/Bus/Shape/City/Taichung?$format=JSON'
    const stopUrl = 'https://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/Taichung?$format=JSON'
    const busUrl = 'https://ptx.transportdata.tw/MOTC/v2/Bus/RealTimeByFrequency/City/Taichung?$format=JSON'
    const customIcon = icon({
        iconUrl: 'https://www.svgrepo.com/show/513278/bus.svg', // 或者使用FontAwesomeIcon等其他圖示
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
    const BusStopIcon = icon({
        iconUrl: 'https://www.svgrepo.com/show/401245/bus-stop.svg', // 或者使用FontAwesomeIcon等其他圖示
        iconSize: [50,50],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
    });
    const [routeDetail,setRouteDetail]=useState([]) //使用useState來維護路線資訊的狀態
    const [routes, setRoutes] = useState([]); // 使用useState來維護路線的狀態
    const [stops, setStops] = useState([]); // 使用useState來維護路線的狀態
    const [bus, setBus] = useState([]); // 使用useState來維護路線的狀態
    const [inputBus,setInputBus] =useState(3)
    const routeDetailUrl =`https://tdx.transportdata.tw/api/basic/v2/Bus/EstimatedTimeOfArrival/City/Taichung/${inputBus}?$format=JSON`
    const limeOptions = { color: 'blue' }
    const addRouteLine = ()=>{
        // 添加公車路線
        axios({
            method: 'get',
            url: routeUrl,
            })
            .then(function (response) {
                // console.log("HTTP 狀態碼:", response.status);
                // console.log("data:", response.data);
                // console.log('Geometry:',response.data[0].Geometry)
                let routeNodes = response.data.filter((route)=>route.RouteID===inputBus)
                console.log('回傳資料:',routeNodes)
                // 0去程 1回程
                routeNodes = routeNodes[0].Geometry.replace('LINESTRING(','').replace(')','').split(',')
                let routeLine = routeNodes.map(node=>[node.split(' ')[1],node.split(' ')[0]])
                setRoutes([routeLine]);
            });

    }
    const addRoutestops = ()=>{
        axios({
            method: 'get',
            url: stopUrl,
            })
            .then(function (response) {
                let routeStops =response.data.filter((route)=>route.RouteID===inputBus)
                // console.log('查詢路線:',inputBus,'| 回傳資料:',routeStops)
                // routeStops[0] 0去程 1回程
                routeStops = routeStops[0].Stops.map((stops)=>{return {
                    StopName: stops.StopName.Zh_tw,
                    PositionLat: stops.StopPosition.PositionLat,
                    PositionLon: stops.StopPosition.PositionLon,
                }
                })
                setStops([...routeStops]);
                console.log(stops)
            });
    }
    const addBusLocation = (e)=>{
            e.preventDefault()
            addRoutestops()
            addRouteLine()
            queryRouteDetail()
            axios({
                method: 'get',
                url: busUrl,
                })
                .then(function (response) {
                    // console.log("HTTP 狀態碼:", response.status);
                    console.log(inputBus)
                    console.log("data:", response.data.filter((bus)=>bus.RouteID===inputBus));
                    let busLocations = response.data.filter((bus)=>bus.RouteID===inputBus)
                    setBus([...busLocations]);
                });
    }
    const queryRouteDetail = (direction=0)=>{
        axios({
            method: 'get',
            url: routeDetailUrl,
            headers:{
                'Authorization':`Bearer ${token}`
            }
            })
            .then(function (response) {
                // console.log("HTTP 狀態碼:", response.status);
                let routeDeatil=response.data.filter(route=>route.RouteID===inputBus&route.Direction===parseInt(direction))
                routeDeatil.sort((a, b) => a.StopSequence - b.StopSequence);
                console.log("回傳路線資料",routeDeatil)
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
    const queryAPItoken = ()=>{
        axios({
            method:"POST",
            url:'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token',
            header:{'Content-Type': 'application/x-www-form-urlencoded',
                    'Host':'127.0.0.1'},
            data:`grant_type=client_credentials&client_id=alt41450-f8e4d4b4-4612-4c08&client_secret=08462b91-86d6-46c0-9e73-13d94698d8af`
        }).then(function(response){
            setToken(response.data.access_token)
        })
    }
    const [token,setToken] = useState(queryAPItoken)
    return(

        <div className="main-content">
            {/* <button onClick={addRouteLine}>搜尋公車路徑</button>
            <button onClick={addRoutestops}>添加站點位置</button>
        <button onClick={addBusLocation}>添加公車位置</button> */}
            <SearchBox 
                    inputBus={inputBus}
                    setInputBus={setInputBus}
                    addBusLocation={addBusLocation}
                    />
            <RouteNav />    
            {/* <RouteDetail
                inputBus={inputBus}
                routeDetail={routeDetail}
            /> */}
            <Routes>
                <Route path="/" element={<RouteDetail routeDetail={routeDetail} direction='0' queryRouteDetail={queryRouteDetail}/>} />
                <Route path="/inbound" element={<RouteDetail routeDetail={routeDetail} direction='1' queryRouteDetail={queryRouteDetail}/>} />
            </Routes>
            <MapContainer center={[24.14427284629348, 120.67621054884772]} zoom={13}>
                <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {routes.map((line,index)=>
                <Polyline pathOptions={limeOptions} positions={line} key={index}/>)
                }
                {
                stops.map((stop,index)=>
                    <Marker key={index} position={[stop.PositionLat,stop.PositionLon]} icon={BusStopIcon}>
                            <Popup>{stop.StopName}</Popup>
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
