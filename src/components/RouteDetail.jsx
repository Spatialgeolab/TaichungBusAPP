import React from "react";
import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-regular-svg-icons";
import "./RouteDetail.css";
export const RouteDetail = ({
  formattedTime,
  routeDetail,
  direction,
  mapRef,
  updateData,
  stops,
  setIsUpdateData,
}) => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [dateNow, setDateNow] = useState(new Date());
  useEffect(() => {
    // 定義更新計時器
    const updateInterval = 1000; // 每秒更新時間
    const timer = setTimeout(() => {
      //倒數30秒調用setLastUpdated達到更新數據
      if (30 - Math.floor(Math.abs(lastUpdated.getTime() - dateNow.getTime()) / 1000) <= 0) {
        console.log("倒數完畢-數據更新");
        // 調用更新函數 useQuery-refetch,並打開flag
        updateData();
        setIsUpdateData(true);
        setLastUpdated(new Date());
      }
      setDateNow(new Date());
    }, updateInterval);
    return () => {
      // console.log("清除定時器");
      clearTimeout(timer);
    };
  }, [lastUpdated, dateNow]);
  //路線資訊更新hook
  useEffect(() => {
    setLastUpdated(new Date());
    setIsUpdateData(true);
    console.log("方向改變 觸發更新");
  }, [direction]);
  //點擊站名定位站點
  const routeStopsSearch = (e) => {
    //透過leaflet Map元件的refHooks進行站點位置定位查詢
    console.log(e.target.innerText);
    const { PositionLat, PositionLon } = stops.filter(
      (item) => item.StopName === e.target.innerText
    )[0];
    const map = mapRef.current;
    if (map) {
      console.log(PositionLat, PositionLon);
      map.setView([PositionLat, PositionLon], 25, { animate: true, duration: 1.3 });
    }
  };
  // 顯示更新時間倒數
  const conutDownUpdate = () => {
    let timeCountDown = 30 - Math.floor(Math.abs(lastUpdated.getTime() - dateNow.getTime()) / 1000);
    return (
      <div style={{ margin: "10px" }}>
        <span>{`剩餘更新時間: ${timeCountDown}`}</span>
        {/* 透過時間縮減寬度 */}
        <div className="progress" style={{ width: `${(timeCountDown / 30) * 100}%` }}></div>
      </div>
    );
  };
  return (
    <div className="border border-3">
      <h3 className="badge text-bg-warning d-block">
        路線詳細資訊:
        {/* 因路線也有更改只需抓最後一站即可知道方向 */}
        {`${stops.length === 0 ? "" : `往 ${stops[stops.length - 1].StopName}`}`}
      </h3>
      <ul className="list-group ">
        <li className="list-group-item route-detail-header">
          <span className="bg-dark badge ">站序</span>
          <span className="bg-dark badge ">簡碼</span>
          <span className="bg-dark badge ">站名</span>
          <span className="bg-dark badge ">預估時間</span>
          <span className="bg-dark badge ">進站公車</span>
        </li>
        {routeDetail.map((item) => {
          return (
            <li className="route-detail-header list-group-item ">
              <span className="">{item.StopSequence}</span>
              <span className="flex-md-wrap align-items-start w-10">{item.StopID}</span>
              <span className="item-stop-name flex-md-wrap" onClick={routeStopsSearch}>
                {item.StopName}
              </span>
              {/* 透過剩餘到站時間進行樣式變化 */}
              <span
                className={`text-center badge bg-${
                  !item.EstimateTime
                    ? "secondary"
                    : Math.round(item.EstimateTime) / 60 < 5
                      ? "danger"
                      : "primary"
                }`}>
                <div lang="eta">
                  {item.EstimateTime
                    ? Math.round(item.EstimateTime / 60) + "分"
                    : (() => {
                        if (!item.NextBusTime) {
                          return "末班駛離";
                        }
                        return formattedTime(item.NextBusTime);
                      })()}
                </div>
              </span>
              <span className="platenumb">
                {/* 小於三分鐘顯示進站公車 */}
                {Number(item.EstimateTime) <= 180 ? item.PlateNumb : ""}
              </span>
            </li>
          );
        })}
      </ul>
      <div>{conutDownUpdate()}</div>
    </div>
  );
};
export default RouteDetail;
