// components/AssignmentForm.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../axiosConfig";
import { toast } from "react-toastify";

const AssignmentForm = ({
  assignments,
  setAssignments,
  editingAssignment,
  setEditingAssignment,
  setMode,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    dueAt: "",
    status: "todo",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (editingAssignment) {
      setFormData({
        title: editingAssignment.title || "",
        description: editingAssignment.description || "",
        courseId: editingAssignment.courseId || "",
        dueAt: editingAssignment.dueAt
          ? new Date(editingAssignment.dueAt).toISOString().slice(0, 16)
          : "",
        status: editingAssignment.status || "todo",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        courseId: "",
        dueAt: "",
        status: "todo",
      });
    }
    setErrors({});
  }, [editingAssignment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.courseId.trim()) newErrors.courseId = "Course ID is required";
    if (!formData.dueAt) newErrors.dueAt = "Due date is required";
    else if (new Date(formData.dueAt) < new Date())
      newErrors.dueAt = "Due date cannot be in the past";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        dueAt: new Date(formData.dueAt).toISOString(),
      };

      let response;
      if (editingAssignment) {
        response = await axiosInstance.put(
          `/api/assignments/${editingAssignment._id}`,
          submitData,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        setAssignments((prev) =>
          prev.map((a) =>
            a._id === editingAssignment._id ? { ...a, ...response.data } : a
          )
        );
        toast.success("Assignment updated successfully");
      } else {
        response = await axiosInstance.post("/api/assignments", submitData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setAssignments((prev) => [...prev, response.data]);
        toast.success("Assignment created successfully");
      }

      setFormData({
        title: "",
        description: "",
        courseId: "",
        dueAt: "",
        status: "todo",
      });
      setEditingAssignment(null);
      if (onSuccess) onSuccess();
      else setMode("list");
    } catch (error) {
      console.error("Error submitting assignment:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save assignment";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      description: "",
      courseId: "",
      dueAt: "",
      status: "todo",
    });
    setEditingAssignment(null);
    setErrors({});
    setMode("list");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">
          {editingAssignment ? "Edit Assignment" : "Create New Assignment"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Assignment Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter assignment title"
              disabled={loading}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter assignment description (optional)"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="courseId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Course ID *
            </label>
            <input
              type="text"
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.courseId ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., CS101, MATH201"
              disabled={loading}
            />
            {errors.courseId && (
              <p className="mt-1 text-sm text-red-600">{errors.courseId}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="dueAt"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Due Date & Time *
            </label>
            <input
              type="datetime-local"
              id="dueAt"
              name="dueAt"
              value={formData.dueAt}
              onChange={handleChange}
              className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.dueAt ? "border-red-500" : "border-gray-300"
              }`}
              disabled={loading}
            />
            {errors.dueAt && (
              <p className="mt-1 text-sm text-red-600">{errors.dueAt}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
            </select>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? editingAssignment
                  ? "Updating..."
                  : "Creating..."
                : editingAssignment
                ? "Update Assignment"
                : "Create Assignment"}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentForm;
