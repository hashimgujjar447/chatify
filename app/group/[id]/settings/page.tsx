"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

interface Member {
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface GroupInfo {
  id: string;
  name: string;
  groupDescription: string | null;
  groupImage: string | null;
  createdAt: string;
  createdBy: string;
}

const GroupSettingsPage = () => {
  const [allGroupMembers, setAllGroupMembers] = useState<Member[]>([]);
  const [groupInfo, setGroupInfo] = useState<GroupInfo | null>(null);
  const [activeSection, setActiveSection] = useState<string>("info");
  const [loading, setLoading] = useState(true);
  const [hoveredMemberId, setHoveredMemberId] = useState<string | null>(null);
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    async function fetchGroupData() {
      try {
        setLoading(true);

        // Fetch group members and group info in one call
        const membersRes = await fetch(
          `/api/group/get-all-group-members?groupId=${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        const membersData = await membersRes.json();
        if (membersData.success) {
          setAllGroupMembers(membersData.data.members);
          setGroupInfo(membersData.data.group);
        }
      } catch (error) {
        console.error("Error fetching group data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchGroupData();
  }, [id]);

  const handleLeaveGroup = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;

    try {
      const response = await fetch(`/api/group/delete`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId: id }),
      });

      const data = await response.json();
      if (data.success) {
        alert("You have left the group successfully");
        router.push("/group");
      } else {
        alert(data.message || "Failed to leave group");
      }
    } catch (error) {
      console.error("Error leaving group:", error);
      alert("Failed to leave group");
    }
  };

  const handlePromoteMember = async (userId: string) => {
    try {
      const response = await fetch(`/api/group/promote-member`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId: id, userId }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Member promoted to admin successfully");
        // Refresh the members list
        window.location.reload();
      } else {
        alert(data.message || "Failed to promote member");
      }
    } catch (error) {
      console.error("Error promoting member:", error);
      alert("Failed to promote member");
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (
      !confirm(`Are you sure you want to remove ${userName} from this group?`)
    )
      return;

    try {
      const response = await fetch(`/api/group/remove-member`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId: id, userId }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Member removed successfully");
        // Refresh the members list
        window.location.reload();
      } else {
        alert(data.message || "Failed to remove member");
      }
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member");
    }
  };

  const handleDemoteMember = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to demote ${userName} from admin?`))
      return;

    try {
      const response = await fetch(`/api/group/demote-member`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupId: id, userId }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Admin demoted successfully");
        // Refresh the members list
        window.location.reload();
      } else {
        alert(data.message || "Failed to demote admin");
      }
    } catch (error) {
      console.error("Error demoting admin:", error);
      alert("Failed to demote admin");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6">
          {/* Group Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center mb-4">
              {groupInfo?.groupImage ? (
                <img
                  src={groupInfo.groupImage}
                  alt={groupInfo.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                  {groupInfo?.name?.charAt(0).toUpperCase() || "G"}
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
              {groupInfo?.name || "Group Name"}
            </h1>
            <p className="text-sm text-gray-500 text-center">
              {allGroupMembers.length} members
            </p>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            <button
              onClick={() => setActiveSection("info")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                activeSection === "info"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">Group Info</span>
              </div>
            </button>

            <button
              onClick={() => setActiveSection("members")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                activeSection === "members"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="font-medium">All Members</span>
              </div>
            </button>

            <button
              onClick={() => setActiveSection("settings")}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                activeSection === "settings"
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="font-medium">Settings</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Group Info Section */}
          {activeSection === "info" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Group Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Group Name
                  </label>
                  <div className="text-lg text-gray-800 bg-gray-50 px-4 py-3 rounded-lg">
                    {groupInfo?.name || "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Description
                  </label>
                  <div className="text-gray-700 bg-gray-50 px-4 py-3 rounded-lg min-h-[80px]">
                    {groupInfo?.groupDescription || "No description available"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Created On
                  </label>
                  <div className="text-gray-700 bg-gray-50 px-4 py-3 rounded-lg">
                    {groupInfo?.createdAt
                      ? new Date(groupInfo.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Total Members
                  </label>
                  <div className="text-gray-700 bg-gray-50 px-4 py-3 rounded-lg">
                    {allGroupMembers.length} members
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Members Section */}
          {activeSection === "members" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                All Members ({allGroupMembers.length})
              </h2>
              <div className="space-y-3">
                {allGroupMembers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No members found
                  </p>
                ) : (
                  allGroupMembers.map((member, index) => (
                    <div
                      key={member.user.id}
                      className="relative flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                      onMouseEnter={() => setHoveredMemberId(member.user.id)}
                      onMouseLeave={() => setHoveredMemberId(null)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {member.user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {member.user.name || "Unknown User"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {member.user.email || "No email"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            member.role === "admin"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {member.role}
                        </span>

                        {/* Dropdown Menu for all members */}
                        {hoveredMemberId === member.user.id && (
                          <div className="absolute right-4 top-15 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 min-w-[200px]">
                            {member.role === "admin" ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleDemoteMember(
                                      member.user.id,
                                      member.user.name
                                    )
                                  }
                                  className="w-full text-left px-4 py-2 hover:bg-orange-50 text-gray-700 hover:text-orange-600 transition-colors flex items-center space-x-2"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium">
                                    Demote from Admin
                                  </span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    handlePromoteMember(member.user.id)
                                  }
                                  className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors flex items-center space-x-2"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium">
                                    Promote to Admin
                                  </span>
                                </button>
                                <button
                                  onClick={() =>
                                    handleRemoveMember(
                                      member.user.id,
                                      member.user.name
                                    )
                                  }
                                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors flex items-center space-x-2"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium">
                                    Remove Member
                                  </span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === "settings" && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Group Settings
              </h2>
              <div className="space-y-4">
                <button
                  onClick={() => router.push(`/group/${id}`)}
                  className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Back to Group Chat
                      </h3>
                      <p className="text-sm text-gray-500">
                        Return to group conversation
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>

                <button
                  onClick={() => router.push(`/group/add-member?groupId=${id}`)}
                  className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Add Members
                      </h3>
                      <p className="text-sm text-gray-500">
                        Invite new people to this group
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </button>

                <div className="border-t border-gray-200 my-6"></div>

                <button
                  onClick={handleLeaveGroup}
                  className="w-full text-left px-4 py-3 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-red-600">
                        Leave Group
                      </h3>
                      <p className="text-sm text-red-500">
                        You will no longer receive messages from this group
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupSettingsPage;
