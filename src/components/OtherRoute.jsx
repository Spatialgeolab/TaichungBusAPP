// @ts-nocheck
import Button from "react-bootstrap/Button";
import axios from "axios";
import { useState, useEffect } from "react";
import { useGetBusRouteDetailByStopQuery } from "./store/busApi";
import { useSelector } from "react-redux";
const OtherRoute = ({ formattedTime, inputBus, setInputBus, stop }) => {
  const [stopName, setStopName] = useState("");
  const [otherRouteDeatil, setOtherRouteDeatil] = useState([]);
  //站點其他路線查詢
  const { data: RouteDetailData, status } = useGetBusRouteDetailByStopQuery(stopName);
  // 獲取redux中的靜態路線
  const { busListAll } = useSelector((state) => state.bus);
  const queryStationRoute = (routeName, direction) => {
    const data = busListAll.filter((item) => item.RouteName.Zh_tw === routeName);
    if (data.length === 0) return "數據待更新";
    const routeDirection =
      direction === 0 ? data[0].DepartureStopNameZh : data[0].DestinationStopNameZh;
    return routeDirection;
  };
  useEffect(() => {
    if (status === "fulfilled") {
      const data = RouteDetailData.map((item) => {
        return {
          StopName: item.StopName.Zh_tw,
          PlateNumb: item.PlateNumb,
          RouteID: item.RouteID,
          EstimateTime: item.EstimateTime,
          NextBusTime: item.NextBusTime,
          RouteName: item.RouteName.Zh_tw,
          Direction: item.Direction,
          RouteDirection: queryStationRoute(item.RouteName.Zh_tw, item.Direction),
        };
      });
      // 改成Redux先加載靜態路線，因此不需要檢查promise
      // 透過Promise.all確認所有資料處理完畢
      // Promise.all(data.map((item) => item.RouteDirection)).then((res) => {
      //   console.log("promiseAll RouteData");
      //   console.log(res);
      //   // 將原本的promise物件替換成處理好的值
      //   let readyData = data.map((item, index) => {
      //     item.RouteDirection = res[index];
      //     return item;
      //   });
      //   // 更改狀態進行新一次渲染
      //   console.log("readyData->", readyData);
      setOtherRouteDeatil(data);
    }
  }, [status]);
  return (
    <div>
      <div className='stop-info'>{stop.StopName}</div>
      <div className='stop-info'>目前路線:{inputBus}</div>
      {/* onClick先透過setStopName紀錄站位名子 */}
      <Button
        variant='success'
        className='col-12 p-10 '
        onClick={(e) => {
          console.log("設定按鈕");
          setStopName(stop.StopName);
        }}
        StopName={stop.StopName}>
        其他路線
      </Button>
      <ul className='other-route-list'>
        {/* 透過當前stop.StopName(popup)跟目前狀態中的路線資訊比較進行顯示設定 */}
        {otherRouteDeatil.length !== 0 &&
          otherRouteDeatil.map((item) => {
            return (
              <li
                className='list-group-item route-detail-header '
                key={item.RouteName + item.RouteDirection}>
                <span
                  className='btn btn-success w-25'
                  style={{ marginRight: "5px" }}
                  onClick={(e) => {
                    setInputBus(item.RouteName);
                  }}>
                  {item.RouteName}
                </span>
                <span className='w-50 text-left'>{" 往: " + item.RouteDirection}</span>
                <span
                  className={`text-right badge bg-${
                    !item.EstimateTime
                      ? "secondary"
                      : Math.round(item.EstimateTime) / 60 < 5
                        ? "danger"
                        : "primary"
                  }`}>
                  {item.EstimateTime
                    ? Math.round(item.EstimateTime / 60) + "分"
                    : (() => {
                        if (!item.NextBusTime) {
                          return "末班駛離";
                        }
                        return formattedTime(item.NextBusTime);
                      })()}
                </span>
              </li>
            );
          })}
      </ul>
    </div>
  );
};

export default OtherRoute;
