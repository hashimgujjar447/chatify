import ChatBox from '@/components/ChatBox'
import Header from '@/components/header'
import SideBar from '@/components/SideBar'
import React from 'react'

const page = () => {
  return (
    <div className='bg-white flex  h-screen'>
     <SideBar/>
     <ChatBox/>
    </div>
  )
}

export default page