import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/auth/userSlice"
import socketReducer from "./features/socket/socketSlice"

export const store=configureStore({
    reducer:{
user:userReducer,
socket:socketReducer
    }
})

export type RootState=ReturnType<typeof store.getState>
export type AppDispatch=typeof store.dispatch