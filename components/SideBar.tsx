"use client"
import { useAppSelecter } from '@/store/hooks/hooks';
import { Search, UserRoundPlus, Menu, UserCircle2, X, Bell } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

interface ChatContact {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  isOnline?: boolean;
}

interface SideBarProps {
  onSelectUser: (user: ChatContact) => void;
}

const SideBar = ({ onSelectUser }: SideBarProps) => {
  const router = useRouter()
  const[loading,setLoading]=useState(false)
  const[error,setError]=useState<string | null>(null)
  const[open,setOpen]=useState(false)
  const [chatLis,setChatList]=useState<ChatContact[]>([])
  const[email,setEmail]=useState("")
  const user = useAppSelecter((state)=> state.user.user)
  const userId = user?.userId
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileData, setProfileData] = useState({ name: user?.name || '', avatar: user?.avatar || '' })
  const menuRef = useRef<HTMLDivElement>(null)
  
  useEffect(()=>{
      async function fetchAllUsers(){
       try {
        setLoading(true)
        
         const res=await fetch("/api/user/get-all-users",{
          method:"GET",
            headers: { "Content-Type": "application/json" },
          credentials:"include"
        })
        const data=await res.json()
        console.log(data)
        if(data.success && data.data){
          // Transform the connections data to show the other user
          const contacts = data.data.map((connection: any) => {
            // Show sender or receiver based on who is the current user
            const contact = connection.sender.id === data.currentUserId 
              ? connection.receiver 
              : connection.sender;
            return contact;
          });
          setChatList(contacts)
          setLoading(false)
        } else {
          setLoading(false)
        }
       } catch (error) {
        setError((error as Error)?.message || "Failed to fetch your connections")
        setLoading(false)
       }
      }
      fetchAllUsers()
  },[])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

   const handleAdd = async() => {
    if (!email) return alert("Please enter email");

    try {
      const response = await fetch("/api/user/send-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email }),
        credentials: "include"
      });

      const data = await response.json();

      if (data.success) {
        alert("Connection request sent successfully!");
        setOpen(false);
        setEmail("");
      } else {
        alert(data.message || "Failed to send connection request");
      }
    } catch (error) {
      alert("Error sending connection request");
      console.error(error);
    }
  };

  const handleProfileUpdate = async() => {
    try {
      const response = await fetch("/api/user/update-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profileData),
        credentials: "include"
      });

      const data = await response.json();

      if (data.success) {
        alert("Profile updated successfully!");
        setProfileOpen(false);
      } else {
        alert(data.message || "Failed to update profile");
      }
    } catch (error) {
      alert("Error updating profile");
      console.error(error);
    }
  };

  return (
    <>
    <div className='min-w-sm border-r border-bColor flex flex-col h-screen'>
      <div className='px-4 py-4'>
        <div className='flex items-center justify-between'>
          <h1 className='text-lg text-black font-bold'>Chatify</h1>
          <div className='relative' ref={menuRef}>
            <div onClick={() => setMenuOpen(!menuOpen)} className='cursor-pointer p-2 hover:bg-gray-100 rounded-full'> 
              <Menu />
            </div>
            {menuOpen && (
              <div className='absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50'>
                <div 
                  onClick={() => {
                    setProfileOpen(true)
                    setMenuOpen(false)
                  }} 
                  className='flex items-center gap-2 px-4 py-3 hover:bg-gray-100 cursor-pointer'
                >
                  <UserCircle2 size={18} />
                  <span>Edit Profile</span>
                </div>
                <div 
                  onClick={() => {
                    router.push('/profile')
                    setMenuOpen(false)
                  }} 
                  className='flex items-center gap-2 px-4 py-3 hover:bg-gray-100 cursor-pointer border-t border-gray-200'
                >
                  <Bell size={18} />
                  <span>Connection Requests</span>
                </div>
                <div 
                  onClick={() => {
                    setOpen(true)
                    setMenuOpen(false)
                  }} 
                  className='flex items-center gap-2 px-4 py-3 hover:bg-gray-100 cursor-pointer border-t border-gray-200'
                >
                  <UserRoundPlus size={18} />
                  <span>Add Contact</span>
                </div>
              </div>
            )}
          </div>
        </div>
       
        <div className='relative w-full px-2 py-2 mt-5 bg-bgInput rounded-full'>
           <Search size={18} className='absolute left-4 top-3' />
           <input className='border-none pl-10 bg-bgInput outline-none w-full' placeholder='Search chats...' />
        </div>
      </div>
      
      <div className='flex-1 overflow-y-auto px-4 py-3'>
        {loading ? (
          <div className='text-center py-4'>Loading contacts...</div>
        ) : error ? (
          <div className='text-center py-4 text-red-500'>{error}</div>
        ) : chatLis.length === 0 ? (
          <div className='text-center py-4'>No contact found, please add by clicking add button</div>
        ) : (
          chatLis.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => {
                setSelectedChatId(chat.id);
                onSelectUser(chat);
              }}
              className={`flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-gray-100 rounded-lg transition ${
                selectedChatId === chat.id ? 'bg-gray-200' : ''
              }`}
            >
              <div className='relative shrink-0'>
                <div className='w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-2xl'>
                  {chat.avatar || chat.name?.[0]?.toUpperCase() || '👤'}
                </div>
                {chat.isOnline && (
                  <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full'></div>
                )}
              </div>
              
              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between mb-1'>
                  <h3 className='font-semibold text-gray-900 dark:text-white truncate'>
                    {chat.name || 'Unknown'}
                  </h3>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-400 truncate'>
                  {chat.email}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="bg-white p-6 rounded-xl w-80 shadow-lg">

            <h2 className="text-lg font-semibold mb-4">Add Contact</h2>

            <input
              type="email"
              placeholder="Enter email"
              className="border p-2 rounded w-full mb-4"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-green-600 text-white rounded"
                onClick={handleAdd}
              >
                Add
              </button>
            </div>

          </div>
        </div>
      )}

      {profileOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">User Profile</h2>
              <X 
                className="cursor-pointer hover:bg-gray-100 rounded" 
                onClick={() => setProfileOpen(false)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                className="border p-2 rounded w-full"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Avatar (Emoji)</label>
              <input
                type="text"
                placeholder="Enter emoji (e.g., 👤)"
                className="border p-2 rounded w-full text-2xl"
                maxLength={2}
                value={profileData.avatar}
                onChange={(e) => setProfileData({...profileData, avatar: e.target.value})}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="border p-2 rounded w-full bg-gray-100"
                value={user?.email || ''}
                disabled
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setProfileOpen(false)}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                onClick={handleProfileUpdate}
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SideBar

