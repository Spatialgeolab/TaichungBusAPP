// @ts-nocheck
import "bootstrap/dist/css/bootstrap.css";
import "../index.css";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useRef, useCallback } from "react";
import { Route, Routes } from "react-router-dom";
import SearchBox from "./SearchBox";
import RouteDetail from "./RouteDetail";
import RouteNav from "./RouteNav";
import Lmap from "./Lmap";
import BusRouteFavorites from "./BusRouteFavorites/BusRouteFavorites";
import { setBusObj } from "./store/busSlice";
import { useSelector, useDispatch } from "react-redux";
import {
  useGetBusPositionQuery,
  useGetBusRouteQuery,
  useGetBusStopQuery,
  useGetBusRouteListQuery,
  useGetBusRouteDetailQuery,
} from "./store/busApi";
import { useGetTokenQuery } from "./api/authApi";
import { authSetToken } from "./store/authSlice";
import { addBusFavoriteItem } from "./store/busSlice.jsx";
export default function App() {
  // useSelector() 載入state數據
  const { token } = useSelector((state) => state.token);
  const { busPosition, busDetail, busRoute, busRouteList, busStops, busFavoriteItem } = useSelector(
    (state) => state.bus
  );
  const dispatch = useDispatch();
  // 以上練習redux
  const mapRef = useRef(null); // 地圖元素引用
  const [routeDetail, setRouteDetail] = useState([]); //使用useState來維護路線資訊的狀態
  const [stopName, setStopName] = useState(""); // 使用useState來維護站位的狀態
  const [inputBus, setInputBus] = useState("1"); //使用useState來當前查詢路線的狀態
  const [direction, setDirection] = useState(0);
  const lineOptions = { color: "blue", dashArray: "10, 10" };
  const [isGetToken, setisGetToken] = useState(Boolean(token));
  const [isUpdateData, setIsUpdateData] = useState(true);
  const [showFavorite, setShowFavorite] = useState(false);
  if (!isGetToken) {
    console.log("沒有token，進行獲取");
    const { data: tokenData, isLoading, isFetching } = useGetTokenQuery();
    // 將數據派發到 Redux store
    if (tokenData) {
      dispatch(
        authSetToken({
          token: tokenData.access_token,
        })
      );
      setisGetToken(true);
    }
  }
  const formatRouteLine = (res, direction) => {
    let routeNodes = res;
    console.log(direction);
    routeNodes = routeNodes[direction].Geometry.replace("LINESTRING(", "")
      .replace(")", "")
      .split(",");
    let routeLine = routeNodes.map((node) => [node.split(" ")[1], node.split(" ")[0]]);
    return [routeLine];
  };
  const formatRoutestops = (res, direction) => {
    let routeStops = res;
    // console.log('查詢路線:',routeName,'| 回傳站點資料:',routeStops)
    routeStops = routeStops[direction].Stops.map((stops) => {
      return {
        StopName: stops.StopName.Zh_tw,
        PositionLat: stops.StopPosition.PositionLat,
        PositionLon: stops.StopPosition.PositionLon,
      };
    });
    // 計算公車路線中心
    let startStop = routeStops[0];
    let endStop = routeStops[routeStops.length - 1];
    let map = mapRef.current;
    if (map) {
      map.setView(
        [
          (startStop.PositionLat + endStop.PositionLat) / 2,
          (startStop.PositionLon + endStop.PositionLon) / 2,
        ],
        12.5
      );
    }
    return routeStops;
  };
  const formatBusLocation = (res, direction) => {
    let busLocations = res;
    busLocations = busLocations.filter((item) => item.Direction === direction);
    return [...busLocations];
  };
  const formatRouteDetail = (res, direction) => {
    let routeDeatil = res.filter((route) => route.Direction === parseInt(direction));
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
        PlateNumb: item.PlateNumb,
      };
    });
  };
  const busData = [
    useGetBusPositionQuery(inputBus, direction),
    useGetBusRouteDetailQuery(inputBus, direction),
    useGetBusRouteQuery(inputBus, direction),
    useGetBusRouteListQuery(inputBus, direction),
    useGetBusStopQuery(inputBus, direction),
  ];
  const updateData = () => {
    for (let i of busData) {
      i.refetch();
    }
  };
  if (busData.filter((item) => item.status == "fulfilled").length == 5 && isUpdateData) {
    console.log("開始派發數據");
    dispatch(
      setBusObj({
        busId: inputBus,
        busPosition: formatBusLocation(busData[0].data, direction),
        busDetail: formatRouteDetail(busData[1].data, direction),
        busRoute: formatRouteLine(busData[2].data, direction),
        busRouteList: busData[3].data,
        busStops: formatRoutestops(busData[4].data, direction),
        busDirection: direction,
      })
    );
    setIsUpdateData(false);
  }
  useEffect(() => setIsUpdateData(true), [inputBus]);

  const formattedTime = useCallback((time) => {
    const datetimeString = time;
    const dateObj = new Date(datetimeString);
    // 提取小時和分鐘部分
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    // 格式化時間（加0是為了確保時間以兩位數表示）
    const formattedTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    return formattedTime;
  });
  //添加收藏路線
  const addFavoriteRoute = (RouteId = inputBus) => {
    console.log(
      "test",
      RouteId,
      `${busStops[0].StopName}-${busStops[busStops.length - 1].StopName}`
    );
    dispatch(
      addBusFavoriteItem({
        busFavoriteItem: {
          RouteId: RouteId,
          RouteName: `${busStops[0].StopName}-${busStops[busStops.length - 1].StopName}`,
        },
      })
    );
  };
  return (
    <>
      {/* 獲取到token後再進行mount */}
      {isGetToken && (
        <>
          <nav class='navbar navbar-light bg-light'>
            <h1
              className='text-dark d-block w-100 text-center'
              style={{ backgroundColor: "yellowgreen" }}>
              台中市即時公車地圖
            </h1>
            <button className='favorite-btn' onClick={() => setShowFavorite(true)}>
              我的收藏路線
            </button>
            {showFavorite && (
              <BusRouteFavorites
                setShowFavorite={setShowFavorite}
                busFavoriteItem={busFavoriteItem}
                addFavoriteRoute={addFavoriteRoute}
                setInputBus={setInputBus}></BusRouteFavorites>
            )}
          </nav>
          <div className='container-fluid'>
            {/* 響應式設計 > */}
            <div class='row flex-column-reverse flex-sm-row'>
              <div class='col-12 col-sm-4'>
                <div className='container'>
                  <SearchBox inputBus={inputBus} setInputBus={setInputBus} />
                  <RouteNav setDirection={setDirection} direction={direction} />
                  <Routes>
                    <Route
                      path='/'
                      element={
                        <RouteDetail
                          routeDetail={busDetail}
                          direction={direction}
                          mapRef={mapRef}
                          inputBus={inputBus}
                          updateData={updateData}
                          stops={busStops}
                          formattedTime={formattedTime}
                          setIsUpdateData={setIsUpdateData}
                          busFavoriteItem={busFavoriteItem}
                          addFavoriteRoute={addFavoriteRoute}
                        />
                      }
                    />
                    <Route
                      path='/inbound'
                      element={
                        <RouteDetail
                          routeDetail={busDetail}
                          direction={direction}
                          mapRef={mapRef}
                          inputBus={inputBus}
                          updateData={updateData}
                          stops={busStops}
                          formattedTime={formattedTime}
                          setIsUpdateData={setIsUpdateData}
                          busFavoriteItem={busFavoriteItem}
                          addFavoriteRoute={addFavoriteRoute}
                        />
                      }
                    />
                  </Routes>
                </div>
              </div>
              <div class='col-12 col-sm-8'>
                <div className='main-content'>
                  <Lmap propsObj={{ inputBus, direction, setInputBus, formattedTime, mapRef }} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
