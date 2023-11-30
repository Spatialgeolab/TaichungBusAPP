import { createSlice, configureStore } from "@reduxjs/toolkit";
import { busReducer } from "./busSlice";
import { tokenReducer } from "./authSlice";
import busApi from "./busApi";
import { authApi } from "../api/authApi";
// 創建store
const store = configureStore({
  reducer: {
    bus: busReducer,
    [busApi.reducerPath]: busApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    token: tokenReducer,
  },
  // middleware 用來支持API 執行非同步操作
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(busApi.middleware, authApi.middleware),
});

export default store;
