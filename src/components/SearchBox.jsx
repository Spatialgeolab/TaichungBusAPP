// @ts-nocheck
import { useState, useEffect, useRef } from "react";
export default function SearchBox({ inputBus, setInputBus, AllRoute }) {
  const [routeFilter, setRouteFilter] = useState([]);
  const [routeQueryId, setRouteQueryId] = useState(inputBus);
  const [isShowRouteList, setIsShowRouteList] = useState(false);
  const routeListAll = useRef();
  const regex = new RegExp(routeQueryId);
  const getRouteList = () => {
    if (!AllRoute) return;
    console.log("test", AllRoute);
    const data = AllRoute;
    routeListAll.current = data.map((item) => {
      return {
        RouteID: item.RouteID,
        Headsign: item.SubRoutes[0].Headsign,
        RouteName: item.RouteName.Zh_tw,
      };
    });
    routeListAll.current.sort((a, b) => parseInt(a.RouteID) - parseInt(b.RouteID));
    // console.log("routeListAll->", routeListAll.current);
  };
  const showList = () => {
    const routeListFilter = routeListAll.current.filter((item) => {
      return regex.test(item.RouteID);
    });
    setRouteFilter(routeListFilter);
    console.log(routeFilter);
  };
  const searchByClick = (e) => {
    let routeId = e.target.getAttribute("routeId");
    console.log("查詢:", routeId);
    setInputBus(routeId);
    setRouteQueryId(routeId);
    setIsShowRouteList(false);
  };
  // query路線資訊&顯示路線資訊
  useEffect(() => {
    const timer = setTimeout(() => {
      showList();
      console.log("執行showList()");
    }, 300);
    return () => {
      console.log("clear timer");
      clearTimeout(timer);
    };
  }, [routeQueryId]);

  useEffect(() => {
    getRouteList();
    console.log("執行getRouteList()取的靜態路線資料");
  }, [AllRoute]);
  useEffect(() => {
    setRouteQueryId(inputBus);
  }, [inputBus]);
  return (
    <div className='form-outline'>
      <form className='row'>
        <div className='form-floating'>
          <input
            type='text'
            className='form-control'
            id='typeText'
            value={routeQueryId}
            onChange={(e) => {
              setRouteQueryId(e.target.value);
              setIsShowRouteList(true);
            }}
            onFocus={() => {
              setRouteQueryId("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setInputBus(e.target.value);
                setIsShowRouteList(false);
              }
            }}
          />
          <label className='text-center' htmlFor='typeText'>
            請輸入公車路線
          </label>
        </div>
      </form>
      <ul className='list-group list-group-light route-list-item w-100 ' id='route-list-ul'>
        {/* 動態創建搜尋路線資訊表 */}
        {isShowRouteList &&
          routeFilter.map((routeItem) => {
            return (
              <li
                className='list-group-item d-flex justify-content-between align-items-center list-group-item-action list-group-item-info'
                routeId={routeItem.RouteName}
                onClick={searchByClick}>
                <div
                  className='"badge badge-primary rounded-pill px-3 border-0 rounded-3 mb-2'
                  routeId={routeItem.RouteName}>{`${routeItem.RouteName}`}</div>
                <div
                  className='"badge badge-primary rounded-pill px-3 border-0 rounded-3 mb-2'
                  routeId={routeItem.RouteName}>{`${routeItem.Headsign}`}</div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
