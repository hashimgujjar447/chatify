import { Search, UserRoundPlus } from 'lucide-react'
import React from 'react'

const SideBar = () => {
  const chatList = [
    { id: 1, name: 'Sarah Wilson', avatar: '👩', lastMessage: 'See you tomorrow! 😊', time: '10:30 AM', unread: 2, online: true },
    { id: 2, name: 'Team Alpha', avatar: '👥', lastMessage: 'John: Great work everyone!', time: '9:15 AM', unread: 5, isGroup: true },
    { id: 3, name: 'David Chen', avatar: '👨', lastMessage: 'Thanks for the update', time: 'Yesterday', unread: 0, online: false },
    { id: 4, name: 'Lisa Martinez', avatar: '👩‍💼', lastMessage: 'The files are ready', time: 'Yesterday', unread: 1, online: true },
    { id: 5, name: 'Family Group', avatar: '👨‍👩‍👧‍👦', lastMessage: 'Mom: Dinner at 7?', time: 'Tuesday', unread: 0, isGroup: true },
    { id: 6, name: 'Alex Johnson', avatar: '🧑', lastMessage: 'Perfect! Let\'s do it', time: 'Monday', unread: 0, online: true },
    { id: 7, name: 'Emily Brown', avatar: '👩‍🦰', lastMessage: 'Check the latest design', time: 'Monday', unread: 3, online: true },
    { id: 8, name: 'Dev Team', avatar: '💻', lastMessage: 'Mike: Push to staging?', time: 'Sunday', unread: 0, isGroup: true },
    { id: 9, name: 'Robert Lee', avatar: '👨‍💼', lastMessage: 'Meeting at 3 PM', time: 'Saturday', unread: 0, online: false },
    { id: 10, name: 'Jessica Kim', avatar: '👩‍🎨', lastMessage: 'Love the new colors!', time: 'Friday', unread: 2, online: true },
    { id: 11, name: 'Marketing Team', avatar: '📱', lastMessage: 'Sarah: Campaign ready', time: 'Friday', unread: 0, isGroup: true },
    { id: 12, name: 'Chris Anderson', avatar: '🧑‍💻', lastMessage: 'Code reviewed ✓', time: 'Thursday', unread: 0, online: false },
  ];

  return (
    <div className='min-w-sm border-r border-bColor flex flex-col h-screen'>
      <div className='px-4 py-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-lg text-black font-bold'>Chatify</h1>
          <UserRoundPlus />
        </div>
       
        <div className='relative w-full px-2 py-2 mt-5 bg-bgInput rounded-full'>
           <Search size={18} className='absolute left-4 top-3' />
           <input className='border-none pl-10 bg-bgInput outline-none w-full' placeholder='Search chats...' />
        </div>
      </div>
      
      <div className='flex-1 overflow-y-auto px-4 py-3'>
        {chatList.map((chat) => (
          <div 
            key={chat.id}
            className='flex items-center gap-3 px-1 py-3  cursor-pointer hover:bg-gray-100   border-gray-100  transition'
          >
            <div className='relative shrink-0'>
              <div className='w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-2xl'>
                {chat.avatar}
              </div>
              {chat.online && (
                <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full'></div>
              )}
            </div>
            
            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between mb-1'>
                <h3 className='font-semibold text-gray-900 dark:text-white truncate'>{chat.name}</h3>
                <span className='text-xs text-gray-500 dark:text-gray-400 shrink-0 ml-2'>{chat.time}</span>
              </div>
              <div className='flex items-center justify-between'>
                <p className='text-sm text-gray-600 dark:text-gray-400 truncate'>{chat.lastMessage}</p>
                {chat.unread > 0 && (
                  <span className='bg-[#25D366] text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center ml-2 shrink-0'>
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
export default SideBar

