import React, { useState } from 'react';
import axiosInstance from '../axiosConfig';

const AssignmentForm = ({
  fetchAssignments,     // optional: callback to refresh list
  setMode,              // optional: to switch back to list view
  assignments,          // unused here but often passed — safe to keep
  setAssignments,       // unused here but often passed — safe to keep
  editingAssignment,    // if present, we’re editing
  setEditingAssignment, // to clear after save
}) => {
  const [title, setTitle] = useState(editingAssignment?.title || '');
  const [description, setDescription] = useState(editingAssignment?.description || '');
  const [dueAt, setDueAt] = useState(
    editingAssignment?.dueAt ? new Date(editingAssignment.dueAt).toISOString().slice(0, 10) : ''
  );
  const [courseId, setCourseId] = useState(editingAssignment?.courseId || '');
  const [status, setStatus] = useState(editingAssignment?.status || 'todo');
  const [loading, setLoading] = useState(false);

  const isEditing = Boolean(editingAssignment?._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title,
      description,
      dueAt: dueAt ? new Date(dueAt).toISOString() : null,
      courseId,
      status,
    };

    try {
      if (isEditing) {
        await axiosInstance.put(`/api/assignments/${editingAssignment._id}`, payload);
      } else {
        await axiosInstance.post('/api/assignments', payload);
      }

      // refresh list if provided
      if (typeof fetchAssignments === 'function') {
        await fetchAssignments();
      }

      // reset edit state & go back to list
      if (typeof setEditingAssignment === 'function') setEditingAssignment(null);
      if (typeof setMode === 'function') setMode('list');
    } catch (error) {
      // ✅ Use the value (no unused var)
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to save assignment';
      alert(msg);
      console.error('Error submitting assignment:', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded border space-y-4">
      <h2 className="text-lg font-semibold">{isEditing ? 'Edit Assignment' : 'Add Assignment'}</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full border rounded p-2"
          placeholder="e.g., Week 4 Lab Report"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Optional details…"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input
            type="date"
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Course</label>
          <input
            type="text"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full border rounded p-2"
            placeholder="e.g., IFN580"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Saving…' : isEditing ? 'Update' : 'Save'}
        </button>
        {typeof setMode === 'function' && (
          <button
            type="button"
            onClick={() => setMode('list')}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default AssignmentForm;
