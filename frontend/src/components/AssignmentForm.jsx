import React, { useState } from 'react';
import axiosInstance from '../axiosConfig';

const AssignmentForm = ({ fetchAssignments, setMode }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('');
  const [type, setType] = useState('');
  const [courseId, setCourseId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosInstance.post('/assignments', {
        title,
        description,
        dueDate,
        priority,
        type,
        courseId,
      });

      // refresh list after save
      if (fetchAssignments) {
        fetchAssignments();
      }

      setMode('list'); // go back to list view
    } catch (error) {
      // FIX: Instead of unused variable, show the message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to save assignment';

      alert(errorMessage); // you can replace with toast.error(errorMessage)
      console.error('Error submitting assignment:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full border p-2 rounded"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
        className="w-full border p-2 rounded"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        required
        className="w-full border p-2 rounded"
      >
        <option value="">Select Priority</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        required
        className="w-full border p-2 rounded"
      >
        <option value="">Select Type</option>
        <option value="Homework">Homework</option>
        <option value="Project">Project</option>
        <option value="Exam">Exam</option>
      </select>
      <input
        type="text"
        placeholder="Course ID"
        value={courseId}
        onChange={(e) => setCourseId(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Assignment'}
      </button>
    </form>
  );
};

export default AssignmentForm;
