// components/AssignmentList.jsx
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
  loading,
  user,
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
    if (!dueAt) return 'bg-gray-100 text-gray-800';
    const dueDate = new Date(dueAt);
    const now = new Date();
    const diffHours = (dueDate - now) / (1000 * 60 * 60);
    if (dueDate < now) return 'bg-red-100 text-red-800';
    if (diffHours <= 24) return 'bg-yellow-100 text-yellow-800';
    if (diffHours <= 72) return 'bg-orange-100 text-orange-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getStatusText = (dueAt, status) => {
    if (status === 'submitted') return 'Submitted';
    if (status === 'graded') return 'Graded';
    if (status === 'in-progress') return 'In Progress';
    if (!dueAt) return 'To Do';
    const dueDate = new Date(dueAt);
    const now = new Date();
    if (dueDate < now) return 'Overdue';
    return 'To Do';
  };

  const handleFilterChange = (key, value) => {
    console.log('Filter changed:', key, value);
    setFilters({ ...filters, [key]: value });
  };

  const clearAllFilters = () => {
    console.log('Clearing all filters');
    setFilters({ status: '', courseId: '', due: '' });
  };

  const getTimeUntilDue = (dueAt) => {
    if (!dueAt) return null;
    const dueDate = new Date(dueAt);
    const now = new Date();
    const diffMs = dueDate - now;
    if (diffMs < 0) {
      const overdueDays = Math.abs(Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      if (overdueDays === 0) return 'Overdue (today)';
      return `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`;
    }
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (diffDays === 0) {
      if (diffHours <= 1) return 'Due in less than 1 hour';
      return `Due in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    }
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 7) return `Due in ${diffDays} days`;
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Filter Assignments</h3>
          <span className="text-sm text-gray-500">
            {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} found
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <input
              type="text"
              placeholder="Filter by course..."
              value={filters.courseId}
              onChange={(e) => handleFilterChange('courseId', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <select
              value={filters.due}
              onChange={(e) => handleFilterChange('due', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Due Dates</option>
              <option value="today">Due Today</option>
              <option value="tomorrow">Due Tomorrow</option>
              <option value="week">Due This Week</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="flex flex-col justify-end">
            <div className="flex space-x-2">
              <button
                onClick={fetchAssignments}
                disabled={loading}
                className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
              >
                {loading ? '🔄' : '↻'} Refresh
              </button>
              <button
                onClick={clearAllFilters}
                className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-300 transition-colors text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading your assignments...</p>
        </div>
      )}

      {!loading && (!assignments || assignments.length === 0) && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {Object.values(filters).some((f) => f !== '') ? 'No assignments match your filters' : 'No assignments yet'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {Object.values(filters).some((f) => f !== '')
              ? 'Try adjusting your filters to see more assignments, or create a new one to get started.'
              : 'Create your first assignment to start tracking your academic work and deadlines.'}
          </p>
          <div className="space-x-3">
            <button
              onClick={() => setMode('add')}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Create Your First Assignment
            </button>
            {Object.values(filters).some((f) => f !== '') && (
              <button
                onClick={clearAllFilters}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && assignments && assignments.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignment Details
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
                {assignments.map((assignment, index) => {
                  const timeUntilDue = getTimeUntilDue(assignment.dueAt);
                  return (
                    <tr key={assignment._id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.title || 'Untitled Assignment'}
                        </div>
                        {assignment.description && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {assignment.description}
                          </div>
                        )}
                        {timeUntilDue && (
                          <div className="text-xs text-gray-400 mt-1">{timeUntilDue}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{assignment.courseId || 'No course'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {assignment.dueAt
                            ? moment(assignment.dueAt).format('MMM DD, YYYY')
                            : 'No due date'}
                        </div>
                        {assignment.dueAt && (
                          <div className="text-xs text-gray-500">
                            {moment(assignment.dueAt).format('h:mm A')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getBadgeClass(
                            assignment.dueAt,
                            assignment.status
                          )}`}
                        >
                          {getStatusText(assignment.dueAt, assignment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                        <button
                            onClick={() => {
                              console.log('Edit button clicked for1:', assignment._id);
                              handleEdit(assignment);
                            }}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Edit assignment"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteWithToast(assignment._id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete assignment"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && assignments && assignments.length > 0 && (
        <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
          <div>
            Showing {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}{' '}
            {Object.values(filters).some((f) => f !== '') && '(filtered)'}
          </div>
          <div className="flex space-x-4">
            {assignments.filter(
              (a) =>
                new Date(a.dueAt) < new Date() && a.status !== 'submitted' && a.status !== 'graded'
            ).length > 0 && (
              <span className="text-red-600 font-medium">
                {
                  assignments.filter(
                    (a) =>
                      new Date(a.dueAt) < new Date() &&
                      a.status !== 'submitted' &&
                      a.status !== 'graded'
                  ).length
                }{' '}
                overdue
              </span>
            )}
            {assignments.filter((a) => a.status === 'submitted').length > 0 && (
              <span className="text-green-600">
                {assignments.filter((a) => a.status === 'submitted').length} submitted
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentList;