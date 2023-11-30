import { icon } from "leaflet";
export const customIcon = {
  Bus: icon({
    iconUrl: "https://www.svgrepo.com/show/513278/bus.svg", // 或者使用FontAwesomeIcon等其他圖示
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  BusStopIcon: icon({
    iconUrl: "https://www.svgrepo.com/show/401245/bus-stop.svg", // 或者使用FontAwesomeIcon等其他圖示
    iconSize: [30, 30],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
};
