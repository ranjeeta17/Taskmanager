// components/AssignmentForm.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

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
    title: '',
    description: '',
    courseId: '',
    dueAt: '',
    status: 'todo',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Prefill when editing
  useEffect(() => {
    if (editingAssignment) {
      setFormData({
        title: editingAssignment.title || '',
        description: editingAssignment.description || '',
        courseId: editingAssignment.courseId || '',
        dueAt: editingAssignment.dueAt
          ? new Date(editingAssignment.dueAt).toISOString().slice(0, 16)
          : '',
        status: editingAssignment.status || 'todo',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        courseId: '',
        dueAt: '',
        status: 'todo',
      });
    }
    setErrors({});
  }, [editingAssignment]);

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'Title is required';
    if (formData.dueAt && Number.isNaN(new Date(formData.dueAt).getTime())) {
      e.dueAt = 'Invalid date';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (key) => (e) => {
    setFormData((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        courseId: formData.courseId.trim(),
        dueAt: formData.dueAt ? new Date(formData.dueAt).toISOString() : null,
        status: formData.status,
      };

      if (editingAssignment?._id) {
        await axiosInstance.put(`/api/assignments/${editingAssignment._id}`, payload, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
      } else {
        await axiosInstance.post('/api/assignments', payload, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
      }

      setFormData({ title: '', description: '', courseId: '', dueAt: '', status: 'todo' });
      setEditingAssignment(null);
      if (onSuccess) onSuccess();
      else setMode('list');
    } catch (error) {
      // ✅ no-unused-vars fixed: use the message directly
      const msg = error.response?.data?.message || error.message || 'Failed to save assignment';
      alert(msg);
      console.error('Error submitting assignment:', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ title: '', description: '', courseId: '', dueAt: '', status: 'todo' });
    setEditingAssignment(null);
    setMode?.('list');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingAssignment ? 'Edit Assignment' : 'Create Assignment'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={handleChange('title')}
              className="w-full border rounded-md p-2"
              placeholder="e.g., Week 4 Lab Report"
              required
            />
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={handleChange('description')}
              className="w-full border rounded-md p-2"
              rows={3}
              placeholder="Optional details…"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <input
                type="text"
                value={formData.courseId}
                onChange={handleChange('courseId')}
                className="w-full border rounded-md p-2"
                placeholder="e.g., IFN580"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due</label>
              <input
                type="datetime-local"
                value={formData.dueAt}
                onChange={handleChange('dueAt')}
                className="w-full border rounded-md p-2"
              />
              {errors.dueAt && <p className="text-sm text-red-600 mt-1">{errors.dueAt}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={handleChange('status')}
                className="w-full border rounded-md p-2"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? editingAssignment
                  ? 'Updating...'
                  : 'Creating...'
                : editingAssignment
                ? 'Update Assignment'
                : 'Create Assignment'}
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
