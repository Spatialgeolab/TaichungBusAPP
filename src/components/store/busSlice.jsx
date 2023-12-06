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
    busFavoriteItem: JSON.parse(localStorage.getItem("busFavoriteItem")) || [],
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
    addBusFavoriteItem(state, action) {
      const newFavoriteRoute = action.payload.busFavoriteItem;
      if (state.busFavoriteItem.some((item) => item.RouteId === newFavoriteRoute.RouteId)) {
        state.busFavoriteItem = state.busFavoriteItem.filter(
          (item) => item.RouteId !== newFavoriteRoute.RouteId
        );
      } else {
        state.busFavoriteItem.push(action.payload.busFavoriteItem);
      }
      localStorage.setItem("busFavoriteItem", JSON.stringify(state.busFavoriteItem));
    },
    clearBusFavoriteItem(state, action) {
      state.busFavoriteItem = [];
    },
  },
});

// creatSlice 會自動設置type
export const { setBusObj, setBusListAll, addBusFavoriteItem, clearBusFavoriteItem } =
  busSlice.actions;
export const { reducer: busReducer } = busSlice;
