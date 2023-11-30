// @ts-nocheck
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/dist/query/react";
// application/x-www-form-urlencoded 要採用URLSearchParams進行解析
const postData = new URLSearchParams({
  grant_type: "client_credentials",
  client_id: "alt41450-f8e4d4b4-4612-4c08",
  client_secret: "08462b91-86d6-46c0-9e73-13d94698d8af",
});
// 創造取得API_token bby RTK query
export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://tdx.transportdata.tw/auth/realms/TDXConnect/",
  }),
  endpoints(build) {
    return {
      getToken: build.query({
        query() {
          return {
            url: "protocol/openid-connect/token",
            method: "post",
            header: {
              "Content-Type": "application/x-www-form-urlencoded",
              host: "127.0.0.1",
            },
            body: postData,
          };
        },
      }),
    };
  },
});

export const { useGetTokenQuery } = authApi;
