import { createSlice } from "@reduxjs/toolkit";

//使用rtk構建Slice_Store 傳入obj作為參數
const busSlice = createSlice({
  name: "bus",
  initialState: {
    busId: null,
    busPosition: [],
    busDetail: [],          
    busRoute: [],
    busRouteList: [],
    busStops: [],
    busDirection: 0,
    busListAll: [],
  },
  reducers: {
    setBusObj(state, action) {
      // state是原本state的代理對象 => 不需要shallow copy
      state.busId = action.payload.busId;
      state.busPosition = action.payload.busPosition;
      state.busDetail = action.payload.busDetail;
      state.busRoute = action.payload.busRoute;
      state.busRouteList = action.payload.busRouteList;
      state.busStops = action.payload.busStops;
      state.busDirection = action.payload.busDirection;
    },
    setBusListAll(state, action) {
      state.busListAll = action.payload.busListAll;
    },
  },
});

// creatSlice 會自動設置type
export const { setBusObj, setBusListAll } = busSlice.actions;
export const { reducer: busReducer } = busSlice;
