import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
import { busMapApi } from "../api/apiConfig";
// 建構API物件 createApi 創造 RTK-Query實例
const busApi = createApi({
  reducerPath: "busApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://tdx.transportdata.tw/api/basic/v2/Bus/",
    // 設置token
    prepareHeaders: (preHeader, { getState }) => {
      // 獲取使用者token getState()方法可以取得react-redux的狀態
      const token = getState().token.token;
      if (token) {
        preHeader.set("Authorization", `Bearer ${token}`);
      }
      return preHeader;
    },
  }),
  //endpoints指定API中的各種方法 build構造器
  endpoints(build) {
    return {
      // 公車目前位置
      getBusPosition: build.query({
        query(busId) {
          // 請求的子路徑
          const queryString = `?$format=JSON&$filter=RouteName/Zh_tw eq '${busId}'`;
          return busMapApi.realTime + queryString;
        },
      }),
      //公車路線線型
      getBusRoute: build.query({
        query(busId) {
          const queryString = `?$format=JSON&$filter=RouteName/Zh_tw eq '${busId}'`;
          return busMapApi.route + queryString;
        },
      }),
      //公車站牌位置
      getBusStop: build.query({
        query(busId) {
          const queryString = `?$format=JSON&$filter=RouteName/Zh_tw eq '${busId}'`;
          return busMapApi.stop + queryString;
        },
      }),
      //目前路線的站點資訊
      getBusRouteList: build.query({
        query(busId) {
          const queryString = `?$format=JSON&$filter=RouteName/Zh_tw eq '${busId}'`;
          return busMapApi.routeList + queryString;
        },
      }),
      // 目前路線的進站狀態
      getBusRouteDetail: build.query({
        query(busId) {
          const queryString = `?$format=JSON&$filter=RouteName/Zh_tw eq '${busId}'`;
          return busMapApi.routeDetail + queryString;
        },
      }),
      //目前路線的進站狀態
      getBusRouteDetailByStop: build.query({
        query(Stop) {
          const queryString = `?$format=JSON&$filter=StopName/Zh_tw eq '${Stop}'`;
          return busMapApi.routeDetail + queryString;
        },
      }),
    };
  },
});

// createApi 會自動生成hook function
// 命名規則為 getBusPosition -> useGetBusPositionQuery
export const {
  useGetBusPositionQuery,
  useGetBusRouteQuery,
  useGetBusStopQuery,
  useGetBusRouteListQuery,
  useGetBusRouteDetailQuery,
  useGetBusRouteDetailByStopQuery,
} = busApi;

export default busApi;
