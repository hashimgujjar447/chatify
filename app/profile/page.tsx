"use client";
import { useAppSelecter } from "@/store/hooks/hooks";
import { ArrowLeft, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface PendingRequest {
  connectionId: string;
  sender: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
  createdAt: string;
}

const ProfilePage = () => {
  const router = useRouter();
  const user = useAppSelecter((state) => state.user.user);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/get-all-users-pending", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setPendingRequests(data.data);
      }
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch pending requests");
      setLoading(false);
    }
  };

  const handleAcceptReject = async (
    connectionId: string,
    status: "ACCEPTED" | "REJECTED",
    senderId: string
  ) => {
    try {
      const res = await fetch("/api/user/update-connection-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, senderId }),
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        // Remove the request from the list
        setPendingRequests((prev) =>
          prev.filter((req) => req.connectionId !== connectionId)
        );
        alert(`Connection ${status.toLowerCase()}!`);
      } else {
        alert(data.message || "Failed to update connection");
      }
    } catch (error) {
      alert("Error updating connection");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-cyan-50/30">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="p-2.5 hover:bg-teal-50 rounded-xl transition-all hover:scale-110 group"
          >
            <ArrowLeft
              size={24}
              className="text-gray-700 group-hover:text-teal-600 transition"
            />
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Profile
          </h1>
        </div>
      </div>

      {/* User Info Section */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Your Information
          </h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-4xl shadow-lg transform transition-transform hover:scale-105">
                {user?.avatar || user?.name?.[0]?.toUpperCase() || "👤"}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {user?.name || "Unknown"}
              </h3>
              <p className="text-gray-600 flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
                {user?.email || "No email"}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Connection Requests */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-3">
            <span className="text-gray-800">Pending Connection Requests</span>
            {pendingRequests.length > 0 && (
              <span className="text-sm bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full shadow-md animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <X size={32} className="text-red-500" />
              </div>
              <p className="text-red-500 font-medium">{error}</p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Check size={40} className="text-teal-600" />
              </div>
              <p className="text-gray-500 text-lg">
                No pending connection requests
              </p>
              <p className="text-gray-400 text-sm mt-2">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request, index) => (
                <div
                  key={request.connectionId}
                  className="flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-cyan-50/50 transition-all hover:shadow-md hover:border-teal-200 group animate-in slide-in-from-bottom duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
                        {request.sender.avatar ||
                          request.sender.name?.[0]?.toUpperCase() ||
                          "👤"}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg group-hover:text-teal-600 transition">
                        {request.sender.name || "Unknown"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {request.sender.email}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        handleAcceptReject(
                          request.connectionId,
                          "ACCEPTED",
                          request.sender.id
                        )
                      }
                      className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-110 active:scale-95 group/btn"
                      title="Accept"
                    >
                      <Check
                        size={20}
                        className="group-hover/btn:rotate-12 transition-transform"
                      />
                    </button>
                    <button
                      onClick={() =>
                        handleAcceptReject(
                          request.connectionId,
                          "REJECTED",
                          request.sender.id
                        )
                      }
                      className="p-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-110 active:scale-95 group/btn"
                      title="Reject"
                    >
                      <X
                        size={20}
                        className="group-hover/btn:rotate-90 transition-transform"
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
