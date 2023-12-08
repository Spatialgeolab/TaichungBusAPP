import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import OtherRoute from "./OtherRoute";
import { customIcon } from "./api/customIcon";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
const Lmap = ({ propsObj }) => {
  const lineOptions = { color: "blue", dashArray: "10, 10" };
  const { inputBus, direction, setInputBus, formattedTime, mapRef, showPopup } = propsObj;
  const { busPosition, busRoute, busStops } = useSelector((state) => state.bus);
  // 透過ref callback 將所有marker ref進行保存
  const markerRefs = new Map();
  console.log(showPopup);
  useEffect(() => {
    const popupItem = markerRefs.get(showPopup);
    if (popupItem) {
      popupItem.openPopup();
    }
  }, [showPopup]);
  return (
    <MapContainer center={[24.14427284629348, 120.67621054884772]} zoom={13} ref={mapRef}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png'
      />
      {/* 渲染公車位置 */}
      {busPosition.map((bus, index) => (
        <Marker
          key={index}
          position={[bus.BusPosition.PositionLat, bus.BusPosition.PositionLon]}
          icon={customIcon.Bus}
          zIndexOffset={1000 + index}>
          <Popup>
            <div>
              <ul>
                <li>路線: {inputBus}</li>
                <li>車牌:{bus.PlateNumb}</li>
              </ul>
            </div>
          </Popup>
        </Marker>
      ))}
      {/* 渲染公車路線 */}
      {busRoute.map((line, index) => (
        <Polyline
          pathOptions={
            direction === 0
              ? lineOptions
              : (() => {
                  lineOptions.color = "red";
                  return lineOptions;
                })()
          }
          positions={line}
          key={index}
        />
      ))}
      {/* 渲染公車站點 */}
      {busStops.map((stop, index) => (
        <Marker
          position={[stop.PositionLat, stop.PositionLon]}
          icon={customIcon.BusStopIcon}
          key={stop.StopName + "M"}
          ref={(ref) => {
            markerRefs.set(stop.StopName, ref);
          }}>
          <Popup minWidth={"500px"}>
            <div id={stop.StopName + "P"}>{stop.StopName + "P"}</div>
            <OtherRoute
              // key避免重複渲染
              key={stop.StopName}
              inputBus={inputBus}
              stop={stop}
              formattedTime={formattedTime}
              setInputBus={setInputBus}
            />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
export default Lmap;
