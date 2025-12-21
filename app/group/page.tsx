"use client";
import React, { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Users, ImagePlus, X, Loader2, CheckCircle2 } from "lucide-react";

const CreateGroupPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    groupImage: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setError("");
    },
    []
  );

  const isFormValid = useMemo(
    () => formData.name.trim().length > 0,
    [formData.name]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Group name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/group/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          groupImage: formData.groupImage || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create group");
      }

      if (data.success) {
        alert("Group created successfully!");
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-3xl p-8 relative z-10 border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Create Group
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Start a new group conversation
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name - Required */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter group name"
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
              required
            />
            <p className="text-xs text-gray-500 mt-1.5 ml-1">Required field</p>
          </div>

          {/* Group Description - Optional */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add group description (optional)"
              rows={4}
              className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none bg-gray-50 focus:bg-white"
            />
            <p className="text-xs text-gray-500 mt-1.5 ml-1">Optional field</p>
          </div>

          {/* Group Image - Optional */}
          <div>
            <label
              htmlFor="groupImage"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Group Image URL
            </label>
            <div className="flex gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  id="groupImage"
                  name="groupImage"
                  value={formData.groupImage}
                  onChange={handleInputChange}
                  placeholder="Enter image URL (optional)"
                  className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              {formData.groupImage ? (
                <div className="w-16 h-16 border-2 border-teal-500 rounded-xl overflow-hidden shadow-md">
                  <img
                    src={formData.groupImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.alt = "Invalid";
                    }}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-xl flex items-center justify-center">
                  <ImagePlus size={28} className="text-gray-400" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1.5 ml-1">Optional field</p>
          </div>

          {/* Summary Box */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border border-teal-200 shadow-sm">
            <p className="text-sm font-semibold text-teal-700 mb-3 flex items-center gap-2">
              <CheckCircle2 size={18} />
              Group Summary
            </p>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex items-start">
                <span className="font-medium min-w-[100px]">Name:</span>
                <span className="text-gray-600">
                  {formData.name || "(Not set)"}
                </span>
              </p>
              <p className="flex items-start">
                <span className="font-medium min-w-[100px]">Description:</span>
                <span className="text-gray-600">
                  {formData.description || "(None)"}
                </span>
              </p>
              <p className="flex items-start">
                <span className="font-medium min-w-[100px]">Image:</span>
                <span className="text-gray-600">
                  {formData.groupImage ? "✓ Set" : "(None)"}
                </span>
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Users size={20} />
                  Create Group
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Note */}
        <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-xl">
          <p className="text-sm text-blue-800 flex items-start gap-2">
            <span className="font-semibold flex-shrink-0">💡 Note:</span>
            <span>
              You will be automatically added as the group admin. You can add
              members after creating the group.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPage;
