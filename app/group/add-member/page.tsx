"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  UserPlus,
  X,
  Check,
  Loader2,
  Users,
  Search,
  CheckCircle2,
} from "lucide-react";

interface User {
  id: string;
  name: string;
}

const AddMemberPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupId = searchParams.get("groupId");

  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch available users when component mounts
  const fetchAvailableUsers = useCallback(async () => {
    if (!groupId) {
      setError("Group ID is missing");
      setFetchingUsers(false);
      return;
    }

    try {
      setFetchingUsers(true);
      setError("");

      const response = await fetch("/api/group/get-all-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch users");
      }

      setAvailableUsers(data.availableUsers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setFetchingUsers(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchAvailableUsers();
  }, [fetchAvailableUsers]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return availableUsers;

    return availableUsers.filter((user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableUsers, searchQuery]);

  const toggleUserSelection = useCallback((userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
    setError("");
    setSuccess("");
  }, []);

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select at least one user");
      return;
    }

    if (!groupId) {
      setError("Group ID is missing");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/group/add-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId,
          userIds: selectedUsers,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.message || "Failed to add members");
      }

      setSuccess(data.message || "Members added successfully!");
      setSelectedUsers([]);

      // Refresh available users list
      setTimeout(() => {
        fetchAvailableUsers();
        setSuccess("");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add members");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Circles */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-4xl p-8 relative z-10 border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UserPlus size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Add Members
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Select users to add to the group
              </p>
            </div>
          </div>
          <button
            onClick={() => router.back()}
            className="p-2.5 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110 group"
            aria-label="Close"
          >
            <X
              size={24}
              className="text-gray-600 group-hover:text-red-500 transition-colors"
            />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start gap-3 animate-in slide-in-from-top duration-300">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <X size={18} className="text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-red-700 font-semibold text-sm">Error</p>
              <p className="text-red-600 text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-xl flex items-start gap-3 animate-in slide-in-from-top duration-300">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={18} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-green-700 font-semibold text-sm">Success</p>
              <p className="text-green-600 text-sm mt-0.5">{success}</p>
            </div>
          </div>
        )}

        {/* Selected Count & Search */}
        <div className="mb-6 space-y-4">
          {selectedUsers.length > 0 && (
            <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl flex items-center gap-2 shadow-sm">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {selectedUsers.length}
                </span>
              </div>
              <p className="text-sm text-teal-700 font-medium">
                user{selectedUsers.length > 1 ? "s" : ""} selected
              </p>
            </div>
          )}

          {/* Search Bar */}
          {!fetchingUsers && availableUsers.length > 0 && (
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white text-gray-800 placeholder:text-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {fetchingUsers && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-teal-200 rounded-full"></div>
              <Loader2 className="w-16 h-16 text-teal-500 animate-spin absolute top-0 left-0" />
            </div>
            <p className="text-gray-600 mt-6 font-medium">
              Loading available users...
            </p>
          </div>
        )}

        {/* No Users Available */}
        {!fetchingUsers && availableUsers.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-4">
              <Users size={40} className="text-gray-500" />
            </div>
            <p className="text-gray-700 text-lg font-semibold mb-2">
              No users available
            </p>
            <p className="text-gray-500 text-sm text-center max-w-sm">
              All users are already members of this group or no users exist in
              the system
            </p>
          </div>
        )}

        {/* No Search Results */}
        {!fetchingUsers &&
          filteredUsers.length === 0 &&
          availableUsers.length > 0 &&
          searchQuery && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <Search size={48} className="text-gray-400 mb-4" />
              <p className="text-gray-700 text-lg font-semibold mb-2">
                No users found
              </p>
              <p className="text-gray-500 text-sm">
                Try searching with a different name
              </p>
            </div>
          )}

        {/* Users List */}
        {!fetchingUsers && filteredUsers.length > 0 && (
          <>
            <div className="max-h-[420px] overflow-y-auto border border-gray-200 rounded-2xl shadow-inner bg-gray-50/50">
              {filteredUsers.map((user, index) => {
                const isSelected = selectedUsers.includes(user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => toggleUserSelection(user.id)}
                    style={{ animationDelay: `${index * 50}ms` }}
                    className={`flex items-center justify-between p-4 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 animate-in fade-in slide-in-from-left ${
                      isSelected
                        ? "bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100"
                        : "hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`relative ${
                          isSelected ? "scale-110" : ""
                        } transition-transform duration-200`}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                          <span className="text-white font-bold text-base">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center ring-2 ring-white">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-base truncate">
                          {user.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          ID: {user.id}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? "bg-teal-500 border-teal-500 scale-110"
                          : "border-gray-300 hover:border-teal-400"
                      }`}
                    >
                      {isSelected && (
                        <Check size={16} className="text-white font-bold" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddMembers}
                disabled={loading || selectedUsers.length === 0}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>
                      Add{" "}
                      {selectedUsers.length > 0 && `(${selectedUsers.length})`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddMemberPage;
