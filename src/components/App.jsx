import React from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { useEffect, useState,useRef,useCallback} from 'react';
import {Route,Routes} from "react-router-dom";
import {MapContainer,TileLayer, Marker, Popup, Polyline } from "react-leaflet" 
import { getApiUrl,busMapApi } from "./api/apiConfig";
import SearchBox from "./SearchBox";
import RouteDetail  from "./RouteDetail";
import RouteNav from "./RouteNav";
import Button from 'react-bootstrap/Button';
import {customIcon} from "./api/customIcon";
import { setBusObj } from "./store/busSlice";
import { useSelector,useDispatch } from "react-redux";
import { useGetBusPositionQuery,useGetBusRouteQuery,useGetBusStopQuery,useGetBusRouteListQuery,useGetBusRouteDetailQuery} from "./store/busApi";
import { useGetTokenQuery } from "./api/authApi";
import { authSetToken } from "./store/authSlice";
const App = () => {
    // useSelector() 載入state數據
    const {token} = useSelector(state=>state.token)
    const dispatch = useDispatch()
    // 以上練習redux
    const routeUrl = getApiUrl(busMapApi.route);
    const stopUrl = getApiUrl(busMapApi.stop);
    const busUrl = getApiUrl(busMapApi.realTime);
    const routeListUrl = getApiUrl(busMapApi.routeList);
    const routeDetailUrl = getApiUrl(busMapApi.routeDetail);
    const mapRef = useRef(null); // 地圖元素引用
    const [routeDetail,setRouteDetail]=useState([]) //使用useState來維護路線資訊的狀態
    const [routes, setRoutes] = useState([]); // 使用useState來維護路線的狀態
    const [stops, setStops] = useState([]); // 使用useState來維護站牌的狀態
    const [bus, setBus] = useState([]); // 使用useState來維護公車定位的狀態
    const [stopName,setStopName]=useState('')// 使用useState來維護站位的狀態
    const [inputBus,setInputBus] =useState('1')//使用useState來當前查詢路線的狀態
    const [direction,setDirection]=useState(0)
    const [otherRouteDeatil,setOtherRouteDeatil]=useState([{}])
    const lineOptions = { color: 'blue',dashArray: '10, 10'}
    const [isGetToken,setisGetToken] =useState(Boolean(token))
    if (!isGetToken) {
        console.log('沒有token進行獲取')
        const {data:tokenData, isLoading, isFetching } = useGetTokenQuery()
        // 將數據派發到 Redux store
        if(tokenData){
            dispatch(authSetToken({
                token:tokenData.access_token}));
            setisGetToken(true)
        }
    }
    return (
      <></>
  )
};

export default App;
