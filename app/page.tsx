"use client"
import ChatBox from '@/components/ChatBox'
import Header from '@/components/header'
import SideBar from '@/components/SideBar'
import React, { useEffect } from 'react'
import { refreshUser } from '@/store/features/auth/userSlice'
import { useAppDispatch } from '@/store/hooks/hooks'

const page = () => {
  const dispatch=useAppDispatch()
  useEffect(()=>{
   dispatch(refreshUser())
  },[])
  return (
    <div className='bg-white flex  h-screen'>
     <SideBar/>
     <ChatBox/>
    </div>
  )
}

export default page