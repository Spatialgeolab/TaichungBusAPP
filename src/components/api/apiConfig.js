const apiUrl = "https://tdx.transportdata.tw/api/basic/v2/Bus/";
// busMapApi管理API-path
export const busMapApi = {
  route: "Shape/City/Taichung/",
  stop: "StopOfRoute/City/Taichung/",
  realTime: "RealTimeByFrequency/City/Taichung/",
  routeList: "Route/City/Taichung?$format=JSON",
  routeDetail: "EstimatedTimeOfArrival/City/Taichung/",
};
// 回傳full-URL
export const getApiUrl = (endpoint) => `${apiUrl}${endpoint}`;
