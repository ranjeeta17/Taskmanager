import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import EventForm from '../components/EventForm';
import EventList from '../components/EventList';


const EventPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [mode, setMode] = useState('list'); // 'list' | 'add' | 'edit' | 'calendar'
  const [filters, setFilters] = useState({ from: '', to: '', type: '', courseId: '', priority: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    if (!user?.token) {
      setError('Please login to view events');
      setEvents([]);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );

      const response = await axiosInstance.get('/api/events', {
        headers: { Authorization: `Bearer ${user.token}` },
        params: cleanFilters,
      });

      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setError(error.response?.data?.message || 'Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    if (user?.token && (mode === 'list' || mode === 'calendar')) {
      fetchEvents();
    }
  }, [user, filters, mode, fetchEvents]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await axiosInstance.delete(`/api/events/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEvents((prev) => prev.filter((e) => e._id !== id));
      fetchEvents();
    } catch (error) {
      fetchEvents();
    }
  }, [user, fetchEvents]);

  const handleFormSuccess = useCallback(() => {
    fetchEvents();
    setMode('list');
    setEditingEvent(null);
  }, [fetchEvents]);

  const handleSelectEvent = useCallback((event) => {
    setEditingEvent(event);
    setMode('edit');
  }, []);

  const handleEventDrop = useCallback(async ({ event, start, end }) => {
    try {
      const updatedEvent = {
        ...event,
        startAt: start.toISOString(),
        endAt: end.toISOString(),
      };
      await axiosInstance.patch(`/api/events/${event._id}`, updatedEvent, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setEvents((prev) =>
        prev.map((e) => (e._id === event._id ? { ...e, startAt: start, endAt: end } : e))
      );
    } catch (error) {
      fetchEvents();
    }
  }, [user, fetchEvents]);

  const eventStyleGetter = useCallback((event) => {
    const backgroundColor =
      event.priority === 'high' ? '#FF4C4C' :
      event.priority === 'medium' ? '#FFA500' : '#4CAF50';
    return { style: { backgroundColor, borderRadius: '5px', color: '#fff' } };
  }, []);

  if (!user) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-blue-500 text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Authentication Required</h2>
          <p className="text-blue-600">Please login to view and manage your events.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.name || 'User'}!</p>
        </div>
        <div className="flex space-x-2">
          {mode === 'list' || mode === 'calendar' ? (
            <>
              <button
                onClick={() => { setEditingEvent(null); setMode('add'); }}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
              >
                + Add Event
              </button>
              <button
                onClick={() => setMode(mode === 'list' ? 'calendar' : 'list')}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                {mode === 'list' ? 'Calendar View' : 'List View'}
              </button>
            </>
          ) : (
            <button
              onClick={() => { setMode('list'); setEditingEvent(null); }}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              ← Back to List
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-500 text-xl mr-3">⚠️</div>
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Events</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={() => fetchEvents()}
            className="mt-3 text-red-700 hover:text-red-900 text-sm font-medium"
          >
            Try Again →
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-3"></div>
          <p className="text-blue-600">Loading your events...</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {(mode === 'add' || mode === 'edit') ? (
            <EventForm
              events={events}
              setEvents={setEvents}
              editingEvent={editingEvent}
              setEditingEvent={setEditingEvent}
              onEdit={handleSelectEvent}
              setMode={setMode}
              onSuccess={handleFormSuccess}
              user={user}
            />
          )  : (
            <EventList
              events={events}
              setEvents={setEvents}
              setEditingEvent={setEditingEvent}
              setMode={setMode}
              handleDelete={handleDelete}
              filters={filters}
              setFilters={setFilters}
              fetchEvents={fetchEvents}
              loading={loading}
              user={user}
            />
          )}
        </>
      )}
    </div>
  );
};

export default EventPage;
