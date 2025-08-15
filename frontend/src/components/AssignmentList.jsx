import React from 'react';
import { toast } from 'react-toastify';
import moment from 'moment';

const AssignmentList = ({ 
  assignments, 
  setAssignments, 
  setEditingAssignment, 
  setMode, 
  handleDelete,
  filters,
  setFilters,
  fetchAssignments,
  loading 
}) => {
  
  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setMode('edit');
  };

  const handleDeleteWithToast = async (id) => {
    try {
      await handleDelete(id);
      toast.success('Assignment deleted successfully');
    } catch (error) {
      toast.error('Failed to delete assignment');
    }
  };

  const getBadgeClass = (dueAt, status) => {
    if (status === 'submitted' || status === 'graded') return 'bg-green-100 text-green-800';
    const dueDate = new Date(dueAt);
    const now = new Date();
    const diffHours = (dueDate - now) / (1000 * 60 * 60);
    if (dueDate < now) return 'bg-red-100 text-red-800';
    if (diffHours <= 24) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    setFilters({ status: '', courseId: '', due: '' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Debug Section - Remove this after fixing the issue */}
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="font-semibold text-yellow-800 mb-2">🔧 Debug Information</h3>
        <div className="text-sm space-y-1">
          <p><strong>Assignments loaded:</strong> {assignments?.length || 0}</p>
          <p><strong>Loading state:</strong> {loading ? 'Yes' : 'No'}</p>
          <p><strong>Current filters:</strong> {JSON.stringify(filters)}</p>
          <p><strong>Raw assignments data:</strong></p>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-32">
            {JSON.stringify(assignments, null, 2)}
          </pre>
        </div>
        <button
          onClick={clearAllFilters}
          className="mt-2 bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
        >
          Clear All Filters
        </button>
      </div>

      {/* Filters Section */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
          </select>

          <input
            type="text"
            placeholder="Filter by Course ID"
            value={filters.courseId}
            onChange={(e) => handleFilterChange('courseId', e.target.value)}
            className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <select
            value={filters.due}
            onChange={(e) => handleFilterChange('due', e.target.value)}
            className="p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Due Dates</option>
            <option value="today">Due Today</option>
            <option value="upcoming">Upcoming (Next 7 days)</option>
            <option value="overdue">Overdue</option>
          </select>

          <button
            onClick={fetchAssignments}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
        
        <div className="mt-3 flex space-x-2">
          <button
            onClick={clearAllFilters}
            className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Loading assignments...</p>
        </div>
      )}

      {/* Assignments Table */}
      {!loading && (
        <>
          {!assignments || assignments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
              <p className="text-gray-500 mb-4">
                {Object.values(filters).some(f => f !== '') 
                  ? 'Try adjusting your filters or clearing them to see all assignments.' 
                  : 'Get started by creating your first assignment.'}
              </p>
              <button
                onClick={() => setMode('add')}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Create Assignment
              </button>
            </div>
          ) : (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assignment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments.map((assignment, index) => (
                      <tr key={assignment._id || index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {assignment.title || 'Untitled Assignment'}
                          </div>
                          {assignment.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {assignment.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assignment.courseId || assignment.course || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assignment.dueAt || assignment.dueDate 
                            ? moment(assignment.dueAt || assignment.dueDate).format('MMM DD, YYYY HH:mm')
                            : 'No due date'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            getBadgeClass(assignment.dueAt || assignment.dueDate, assignment.status)
                          }`}>
                            {assignment.status || 'todo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                          <button
                            onClick={() => handleEdit(assignment)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteWithToast(assignment._id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Summary */}
      {!loading && assignments && assignments.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default AssignmentList;