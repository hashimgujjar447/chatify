"use client"
import ChatBox from '@/components/ChatBox'
import Header from '@/components/header'
import SideBar from '@/components/SideBar'
import React, { useEffect, useState } from 'react'
import { refreshUser } from '@/store/features/auth/userSlice'
import { useAppDispatch } from '@/store/hooks/hooks'

interface SelectedUser {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
}

const page = () => {
  const dispatch=useAppDispatch()
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null)
  
  useEffect(()=>{
   dispatch(refreshUser())
  },[dispatch])
  
  return (
    <div className='bg-white flex  h-screen'>
     <SideBar onSelectUser={setSelectedUser} />
     <ChatBox selectedUser={selectedUser} />
    </div>
  )
}

export default page