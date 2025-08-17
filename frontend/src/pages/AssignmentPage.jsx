import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import AssignmentForm from '../components/AssignmentForm';
import AssignmentList from '../components/AssignmentList';

const AssignmentPage = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [mode, setMode] = useState('list'); // 'list' | 'add' | 'edit'
  const [filters, setFilters] = useState({ status: '', courseId: '', due: '' });
  const [loading, setLoading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    if (!user?.token) {
      console.log('No user token available');
      return;
    }

    setLoading(true);
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      const response = await axiosInstance.get('/api/assignments', {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        params: cleanFilters,
      });

      let assignmentsData = response.data;
      if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        if (response.data.assignments) assignmentsData = response.data.assignments;
        else if (response.data.data) assignmentsData = response.data.data;
        else if (response.data.results) assignmentsData = response.data.results;
      }

      setAssignments(Array.isArray(assignmentsData) ? assignmentsData : []);
    } catch (error) {
      console.error('❌ Failed to fetch assignments:', error);
      if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        alert('API endpoint not found. Check your server.');
      } else if (error.response?.status >= 500) {
        alert('Server error. Please try again later.');
      } else {
        alert(`Failed to fetch assignments: ${error.response?.data?.message || error.message}`);
      }
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }, [user?.token, filters]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    if (mode === 'list') {
      fetchAssignments();
    }
  }, [mode, fetchAssignments]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await axiosInstance.delete(`/api/assignments/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      console.error('❌ Failed to delete assignment:', error);
      alert(`Failed to delete assignment: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleFormSuccess = () => {
    fetchAssignments();
    setMode('list');
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-gray-500">Please login to view assignments.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Assignments</h1>
        {mode === 'list' ? (
          <button
            onClick={() => {
              setEditingAssignment(null);
              setMode('add');
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Add Assignment
          </button>
        ) : (
          <button
            onClick={() => setMode('list')}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors"
          >
            Back to List
          </button>
        )}
      </div>

      {loading && (
        <div className="text-center py-4">
          <p className="text-blue-500">Loading assignments...</p>
        </div>
      )}

      {mode === 'add' || (mode === 'edit' && editingAssignment) ? (
        <AssignmentForm
          assignments={assignments}
          setAssignments={setAssignments}
          editingAssignment={editingAssignment}
          setEditingAssignment={setEditingAssignment}
          setMode={setMode}
          fetchAssignments={fetchAssignments}
          onSuccess={handleFormSuccess}
        />
      ) : (
        <AssignmentList
          assignments={assignments}
          setAssignments={setAssignments}
          setEditingAssignment={setEditingAssignment}
          setMode={setMode}
          handleDelete={handleDelete}
          filters={filters}
          setFilters={setFilters}
          fetchAssignments={fetchAssignments}
          loading={loading}
        />
      )}
    </div>
  );
};

export default AssignmentPage;
