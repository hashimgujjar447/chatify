"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ImagePlus, X } from "lucide-react";

const CreateGroupPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    groupImage: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
            <Users size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Create Group</h1>
            <p className="text-gray-500 text-sm">
              Start a new group conversation
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <X size={20} className="text-red-500 mt-0.5" />
            <div>
              <p className="text-red-700 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Required field</p>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">Optional field</p>
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              {formData.groupImage && (
                <div className="w-14 h-14 border border-gray-300 rounded-lg overflow-hidden">
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
              )}
              {!formData.groupImage && (
                <div className="w-14 h-14 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
                  <ImagePlus size={24} className="text-gray-400" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Optional field</p>
          </div>

          {/* Summary Box */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Group Summary
            </p>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Name:</span>{" "}
                {formData.name || "(Not set)"}
              </p>
              <p>
                <span className="font-medium">Description:</span>{" "}
                {formData.description || "(None)"}
              </p>
              <p>
                <span className="font-medium">Image:</span>{" "}
                {formData.groupImage ? "✓ Set" : "(None)"}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 px-6 py-3 bg-teal-500 text-white font-medium rounded-lg hover:bg-teal-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </form>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Note:</span> You will be
            automatically added as the group admin. You can add members after
            creating the group.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPage;
