"use client"
import { useAppSelecter } from '@/store/hooks/hooks'
import { ArrowLeft, Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

interface PendingRequest {
  connectionId: string
  sender: {
    id: string
    name: string | null
    email: string
    avatar: string | null
  }
  createdAt: string
}

const ProfilePage = () => {
  const router = useRouter()
  const user = useAppSelecter((state) => state.user.user)
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/user/get-all-users-pending", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      })
      const data = await res.json()
      
      if (data.success) {
        setPendingRequests(data.data)
      }
      setLoading(false)
    } catch (error) {
      setError("Failed to fetch pending requests")
      setLoading(false)
    }
  }

  const handleAcceptReject = async (connectionId: string, status: 'ACCEPTED' | 'REJECTED',senderId:string) => {
    try {
      const res = await fetch("/api/user/update-connection-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status,senderId }),
        credentials: "include"
      })
      const data = await res.json()
      
      if (data.success) {
        // Remove the request from the list
        setPendingRequests(prev => prev.filter(req => req.connectionId !== connectionId))
        alert(`Connection ${status.toLowerCase()}!`)
      } else {
        alert(data.message || "Failed to update connection")
      }
    } catch (error) {
      alert("Error updating connection")
    }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center gap-4'>
          <button 
            onClick={() => router.push('/')}
            className='p-2 hover:bg-gray-100 rounded-full transition'
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className='text-2xl font-bold text-gray-900'>Profile</h1>
        </div>
      </div>

      {/* User Info Section */}
      <div className='max-w-4xl mx-auto px-6 py-8'>
        <div className='bg-white rounded-xl shadow-sm p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Your Information</h2>
          <div className='flex items-center gap-4'>
            <div className='w-20 h-20 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-4xl'>
              {user?.avatar || user?.name?.[0]?.toUpperCase() || '👤'}
            </div>
            <div>
              <h3 className='text-xl font-semibold text-gray-900'>{user?.name || 'Unknown'}</h3>
              <p className='text-gray-600'>{user?.email || 'No email'}</p>
            </div>
          </div>
        </div>

        {/* Pending Connection Requests */}
        <div className='bg-white rounded-xl shadow-sm p-6'>
          <h2 className='text-xl font-semibold mb-4'>
            Pending Connection Requests 
            {pendingRequests.length > 0 && (
              <span className='ml-2 text-sm bg-red-500 text-white px-2 py-1 rounded-full'>
                {pendingRequests.length}
              </span>
            )}
          </h2>

          {loading ? (
            <div className='text-center py-8 text-gray-500'>Loading...</div>
          ) : error ? (
            <div className='text-center py-8 text-red-500'>{error}</div>
          ) : pendingRequests.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              No pending connection requests
            </div>
          ) : (
            <div className='space-y-3'>
              {pendingRequests.map((request) => (
                <div 
                  key={request.connectionId}
                  className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition'
                >
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-2xl'>
                      {request.sender.avatar || request.sender.name?.[0]?.toUpperCase() || '👤'}
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900'>
                        {request.sender.name || 'Unknown'}
                      </h3>
                      <p className='text-sm text-gray-600'>{request.sender.email}</p>
                      <p className='text-xs text-gray-400 mt-1'>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleAcceptReject(request.connectionId, 'ACCEPTED',request.sender.id)}
                      className='p-2 bg-green-500 hover:bg-green-600 text-white rounded-full transition'
                      title='Accept'
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => handleAcceptReject(request.connectionId, 'REJECTED',request.sender.id)}
                      className='p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition'
                      title='Reject'
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
