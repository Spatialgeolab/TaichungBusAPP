import {createSlice} from '@reduxjs/toolkit'

const authSlice = createSlice({
    name:"auth",
    initialState:()=>{
        const token = localStorage.getItem('token')
        const tokenTime = localStorage.getItem('tokenTime')
        // 計算token失效時間
        const timeDelta = Date.now()-tokenTime
        if(!token||(timeDelta/1000>86400)){
            console.log('沒有loacl token')
            return {
                token:null,
                getTokenTime:NaN
        }}
        console.log('有loacl token')
        return {
            token:token,
            getTokenTime:tokenTime
        }
    },
    reducers:{
        setToken(state,action){
            console.log('setToken->',action)
            state.token=action.payload.token;
            state.getTokenTime = Date.now()
            // 將數據儲存到localstorage
            localStorage.setItem('token',state.token)
            localStorage.setItem('tokenTime',String(state.getTokenTime))
        },
    }
})
export const {setToken:authSetToken} = authSlice.actions
export const {reducer:tokenReducer} = authSlice