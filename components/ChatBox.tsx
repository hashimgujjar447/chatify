"use client"
import React, { useState } from 'react'
import Header from './header'
import { Span } from 'next/dist/trace'

const ChatBox = () => {
  const[message,setMessage]=useState("")
  const loginUserId="U202"
  const chats=[
  {
    senderId: "U202",
    receiverId: "U101",
    message: "Hey, I just saw your message.",
    dateSent: "2025-03-01 10:18:10"
  },
  {
    senderId: "U101",
    receiverId: "U202",
    message: "Yes, the update is pushed now.",
    dateSent: "2025-03-01 10:19:42"
  },
  {
    senderId: "U202",
    receiverId: "U101",
    message: "Let me know if anything breaks.",
    dateSent: "2025-03-01 10:20:15"
  }
  ,
  {
    senderId: "U202",
    receiverId: "U101",
    message: "Also, I fixed the login bug.",
    dateSent: "2025-03-01 10:22:01"
  },
  {
    senderId: "U202",
    receiverId: "U101",
    message: "We should test it once together.",
    dateSent: "2025-03-01 10:23:44"
  },
  {
    senderId: "U202",
    receiverId: "U101",
    message: "Also, I fixed the login bug.",
    dateSent: "2025-03-01 10:22:01"
  },
  {
    senderId: "U202",
    receiverId: "U101",
    message: "We should test it once together.",
    dateSent: "2025-03-01 10:23:44"
  },
  {
    senderId: "U202",
    receiverId: "U101",
    message: "Also, I fixed the login bug.",
    dateSent: "2025-03-01 10:22:01"
  },
  {
    senderId: "U202",
    receiverId: "U101",
    message: "We should test it once together.",
    dateSent: "2025-03-01 10:23:44"
  }
]

function getDate(date:string):string{
  const d=new Date(date)
  const getTime=d.toLocaleTimeString([],{
    hour:"2-digit",
    minute:"2-digit",
    hour12:false
  })

  return getTime

  
}

const handleSendMessage=async(message:string)=>{
   console.log(message)
   setMessage("")
}
  return (
    <div className='flex-1 flex flex-col h-screen'>
        <Header/>
    <div className='flex-1 px-4 py-2 overflow-y-auto'>
    
      <div className='flex flex-col gap-y-2'>
   {chats.map((chat,index)=>(
        <div key={index} className={`flex ${chat.senderId===loginUserId?"justify-end":"justify-start"}`}>
          <div className={`max-w-[65%] px-3 py-2 rounded-lg shadow-sm ${chat.senderId===loginUserId?"bg-chat-sent rounded-br-none":"bg-chat-received rounded-bl-none"}`}>
            <p className='text-sm break-words'>
              {chat.message}
            </p>
            <p className='text-xs text-gray-600 dark:text-gray-400 mt-1 text-right'>
            {
              chat.dateSent &&
               (<span>
                {getDate(chat.dateSent)}
               </span>)
              
            }
          </p>
          </div>
        </div>
      ))}
      </div>
    </div>
    
    <div className='bg-gray-100 px-4 py-3 border-t border-gray-200 '>
      <div className='flex items-center gap-2'>
        <button className='text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 p-2'>
          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
        </button>
        <input 
          type='text' 
          value={message}
          onChange={(e)=>{
            setMessage(e.target.value)
          }}
          placeholder='Type a message'
          className='flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg outline-none focus:ring-2 focus:ring-[#008069]'
        />
        <button onClick={()=>{
          handleSendMessage(message)
        }} className='bg-[#008069] text-white p-2 rounded-full hover:bg-[#007a5a]'>
          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 19l9 2-9-18-9 18 9-2zm0 0v-8' />
          </svg>
        </button>
      </div>
    </div>
    </div>
  )
}

export default ChatBox