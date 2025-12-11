import { createSlice,PayloadAction } from "@reduxjs/toolkit";
import { Socket } from "socket.io-client";

interface ISocket{
    socket:Socket | null
}

const initialState:ISocket={
    socket:null
}

const socketSlice=createSlice({
    name:"socket",
    initialState,
    reducers:{
         setSocket:(state,action:PayloadAction<Socket>)=>{
             state.socket = action.payload as any;
         },
          clearSocket: (state) => {
      state.socket = null;
    },
    }
})


export const{setSocket,clearSocket}=socketSlice.actions
export default socketSlice.reducer