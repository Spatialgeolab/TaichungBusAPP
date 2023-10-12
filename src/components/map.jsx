import axios from "axios";
import "leaflet/dist/leaflet.css";
import { icon } from 'leaflet';
import { useState } from 'react';
import {MapContainer,TileLayer, Marker, Popup, Polyline } from "react-leaflet" 
export default function Busmap(){
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
    const [routes, setRoutes] = useState([]); // 使用useState來維護路線的狀態
    const [stops, setStops] = useState([]); // 使用useState來維護路線的狀態
    const [bus, setBus] = useState([]); // 使用useState來維護路線的狀態
    const [inputBus,setInputBus] =useState(1)
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
    return(
    <div>
      <form onSubmit={addBusLocation}>
        <label>
          輸入路線:
          <input type="text" value={inputBus} onChange={(e)=>{setInputBus(e.target.value)}} />
        </label>
        <input type="submit" value="Submit" />
      </form>
        {/* <button onClick={addRouteLine}>搜尋公車路徑</button>
        <button onClick={addRoutestops}>添加站點位置</button>
        <button onClick={addBusLocation}>添加公車位置</button> */}
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
