"use client"
import React, { useEffect, useState } from 'react'
import Header from './header'
import { MessageSquare, Users, Lock, Zap } from 'lucide-react'
import { useAppSelecter } from '@/store/hooks/hooks';
import { NextResponse } from 'next/server';

export interface ChatBoxProps {
  selectedUser?: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
    isOnline:boolean | null
  } | null;
}

interface Chat {
  chatId: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  dateSent?: string;
}

const ChatBox = ({ selectedUser = null }: ChatBoxProps) => {
  const[message,setMessage]=useState("")
  const[chats,setChats]=useState<Chat[]>([])
  const user=useAppSelecter((state) => state.user.user)
  const loginUserId=user?.userId


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
   try {
    if(!message){
      alert("Message is required")
      return
    }
     const res=await fetch("/api/chat/SendMessage",{
      method:"POST",
      headers:{
        "Content-type":"application/json"
      },
      body:JSON.stringify({receiverId:selectedUser?.id,message:message})
     })
     if(!res){
      alert("Failed to send chat")
      return
     }

     const data=await res.json()
     chats.push(data.chat)
     setMessage("")
     

   } catch (error) {
    alert("Failed error message")
    return
    
   }
  
}

useEffect(()=>{
  const getData=async ()=>{
    if(!selectedUser){
      return
    }
    console.log(selectedUser)
    try {
      const response = await fetch("/api/chat/get-chat-with-current-user",{
        method:"POST",
        body:JSON.stringify({
          receiverId: selectedUser.id
        }),
        headers:{
          "Content-Type":"application/json"
        }
      })
      const data = await response.json()
      if(data.success) {
        setChats(data.data)
      }
      console.log(data)
    } catch (error) {
      console.error("Get chats error:", error)
    }
  }
  getData()
},[selectedUser])

  // If no user is selected, show welcome screen
  if (!selectedUser) {
    return (
      <div className='flex-1 flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
        <div className='flex-1 flex items-center justify-center p-8'>
          <div className='text-center max-w-md'>
            <div className='mb-8 relative'>
              <div className='w-48 h-48 mx-auto bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl'>
                <MessageSquare size={80} className='text-white' strokeWidth={1.5} />
              </div>
              <div className='absolute top-0 right-20 w-20 h-20 bg-blue-400 rounded-full opacity-20 animate-pulse'></div>
              <div className='absolute bottom-0 left-20 w-16 h-16 bg-green-400 rounded-full opacity-20 animate-pulse delay-75'></div>
            </div>
            
            <h1 className='text-4xl font-bold text-gray-800 mb-4'>
              Welcome to Chatify
            </h1>
            
            <p className='text-gray-600 text-lg mb-8'>
              Connect with your friends and start chatting instantly
            </p>
            
            <div className='grid grid-cols-1 gap-4 text-left bg-white rounded-2xl p-6 shadow-lg'>
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0'>
                  <Users size={20} className='text-teal-600' />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-800'>Select a Contact</h3>
                  <p className='text-sm text-gray-600'>Choose someone from your contacts to start chatting</p>
                </div>
              </div>
              
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'>
                  <Zap size={20} className='text-blue-600' />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-800'>Instant Messaging</h3>
                  <p className='text-sm text-gray-600'>Send and receive messages in real-time</p>
                </div>
              </div>
              
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0'>
                  <Lock size={20} className='text-green-600' />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-800'>Private & Secure</h3>
                  <p className='text-sm text-gray-600'>Your conversations are protected and encrypted</p>
                </div>
              </div>
            </div>
            
            <p className='text-gray-500 text-sm mt-6'>
              👈 Select a contact from the sidebar to begin
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 flex flex-col h-screen'>
        <Header selectedChatUser={selectedUser}/>
    <div className='flex-1 px-4 py-2 overflow-y-auto'>
    
      <div className='flex flex-col gap-y-2'>
   {chats.length > 0 ? chats.map((chat, index)=>(
        <div key={chat.chatId || index} className={`flex ${chat.senderId===loginUserId?"justify-end":"justify-start"}`}>
          <div className={`max-w-[65%] px-3 py-2 rounded-lg shadow-sm ${chat.senderId===loginUserId?"bg-chat-sent rounded-br-none":"bg-chat-received rounded-bl-none"}`}>
            <p className='text-sm break-words'>
              {chat.message}
            </p>
            <p className='text-xs text-gray-600 dark:text-gray-400 mt-1 text-right'>
              <span>
                {getDate(chat.createdAt)}
              </span>
          </p>
          </div>
        </div>
      )) : <div className='text-black text-center'>No chats found</div>}
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