import React from 'react';
import { toast } from 'react-toastify';
import moment from 'moment';

const EventList = ({
  events,
  setEvents,
  setEditingEvent,
  setMode,
  onEdit,
  handleDelete,
  filters,
  setFilters,
  fetchEvents,
  loading,
  user,
}) => {
  

  
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({ from: '', to: '', type: '', courseId: '', priority: '' });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Filter Events</h3>
          <span className="text-sm text-gray-500">
            {events.length} event{events.length !== 1 ? 's' : ''} found
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input
              type="date"
              name="from"
              value={filters.from}
              onChange={(e) => handleFilterChange('from', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="date"
              name="to"
              value={filters.to}
              onChange={(e) => handleFilterChange('to', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="lecture">Lecture</option>
              <option value="exam">Exam</option>
              <option value="meeting">Meeting</option>
              <option value="assignment">Assignment</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <input
              type="text"
              name="courseId"
              value={filters.courseId}
              onChange={(e) => handleFilterChange('courseId', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Filter by course..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              name="priority"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="flex space-x-2 mt-4">
          <button
            onClick={fetchEvents}
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

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading your events...</p>
        </div>
      )}

      {!loading && (!events || events.length === 0) && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {Object.values(filters).some((f) => f !== '') ? 'No events match your filters' : 'No events yet'}
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {Object.values(filters).some((f) => f !== '')
              ? 'Try adjusting your filters to see more events.'
              : 'Create your first event to start tracking your schedule.'}
          </p>
          <div className="space-x-3">
            <button
              onClick={() => setMode('add')}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Create Your First Event
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

      {!loading && events && events.length > 0 && (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                      {event.notes && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">{event.notes}</div>
                      )}
                      {event.location && (
                        <div className="text-xs text-gray-400 mt-1">Location: {event.location}</div>
                      )}
                      {event.isRecurring && (
                        <div className="text-xs text-gray-400 mt-1">
                          Recurring: {event.recurrencePattern.frequency} every {event.recurrencePattern.interval}{' '}
                          {event.recurrencePattern.frequency === 'daily'
                            ? 'day(s)'
                            : event.recurrencePattern.frequency === 'weekly'
                            ? 'week(s)'
                            : 'month(s)'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{event.courseId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{moment(event.startAt).format('MMM DD, YYYY h:mm A')}</div>
                      <div className="text-xs text-gray-500">to {moment(event.endAt).format('h:mm A')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityBadge(event.priority)}`}
                      >
                        {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}
                      </span>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;
