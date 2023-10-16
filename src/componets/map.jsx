import React from 'react'
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { icon } from 'leaflet';
import {MapContainer,TileLayer, Marker, Popup, Polyline } from "react-leaflet" 
import { useState } from 'react';

export default function map() {
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
    const limeOptions = { color: 'blue' }
    const [routes, setRoutes] = useState([])
    const [inputBus,setInputBus] =useState('131') 
    const [bus,setBus] = useState([]);
    const [stops, setStops] = useState([]);
    const routeUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/Shape/City/Taichung/${inputBus}?$format=JSON`
    const stopUrl = `https://ptx.transportdata.tw/MOTC/v2/Bus/StopOfRoute/City/Taichung/${inputBus}?$format=JSON`
    const busUrl = 'https://ptx.transportdata.tw/MOTC/v2/Bus/RealTimeByFrequency/City/Taichung?$format=JSON'
    const addBusStops = ()=>{
        axios({
            method: 'get',
            url: stopUrl,
            })
            .then(function (response) {
                let routeStops =response.data.filter((item)=>item.RouteID===inputBus)
                console.log('查詢路線:',inputBus,'| 回傳資料:',routeStops)
                routeStops = routeStops[0].Stops.map((stops)=>{return {
                    StopName: stops.StopName.Zh_tw,
                    PositionLat: stops.StopPosition.PositionLat,
                    PositionLon: stops.StopPosition.PositionLon,}})
                setStops([...routeStops]);
            })
    }
    const addRouteLine = ()=>{
        // 添加公車路線
        axios({
            method: 'get',
            url: routeUrl,
            })
            .then(function (response) {
                let routeNodes = response.data.filter((item)=>item.RouteID===inputBus)
                console.log('回傳資料(線型):',routeNodes)
                routeNodes = routeNodes[0].Geometry.replace('LINESTRING(','').replace(')','').split(',')
                console.log(routeNodes)
                let routeLine = routeNodes.map(node=>[node.split(' ')[1],node.split(' ')[0]])
                console.log(routeLine)
                setRoutes([routeLine]);
            });

    }
    const addBusLocation = (e)=>{
        e.preventDefault()
        addBusStops()
        addRouteLine()
        axios({
            method: 'get',
            url: busUrl,
            })
            .then(function (response) {
                console.log("HTTP 狀態碼:", response.status);
                console.log('資料內容:',response.data)
                let busLocations = response.data.filter((bus)=>bus.RouteID===inputBus)
                setBus([...busLocations])
            });
    }

    
  return (
    <div>
    <form onSubmit={addBusLocation}>
        <label>
          輸入路線:
          <input type="text" value={inputBus} onChange={(e)=>{setInputBus(e.target.value)}} />
        </label>
        <input type="submit" value="Submit" />
      </form>
        {/* <button onClick={addBusLocation}>添加公車位置</button> 
        <button onClick={addBusStops}>添加站點位置</button>
        <button onClick={addRouteLine}>添加公車路線</button>  */}
        <MapContainer center={[24.14427284629348, 120.67621054884772]} zoom={13}>
            <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {   
                bus.map((bus)=> 
                <Marker key={bus.PlateNumb} position={[bus.BusPosition.PositionLat
                    ,bus.BusPosition.PositionLon]} icon={customIcon}>
                        <Popup>{bus.PlateNumb}</Popup>
                </Marker>)
            }
            {
                stops.map((stop,index)=>
                    <Marker key={index} position={[stop.PositionLat,stop.PositionLon]} icon={BusStopIcon}>
                            <Popup>{stop.StopName}</Popup>
                    </Marker>)
            }
            { 
                routes.map((line,index)=>
                <Polyline pathOptions={limeOptions} positions={line} key={index}/>)
            }
        </MapContainer>
    </div>
  )
}

