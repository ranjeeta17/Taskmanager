import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import EventForm from '../components/EventForm';
import EventList from '../components/EventList';
import { toast } from 'react-toastify';

const EventPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/events', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setEvents(response.data);
      } catch (err) {
        setError('Failed to fetch events');
        toast.error('Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchEvents();
  }, [user]);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Manage Events</h1>

      {/* Event Form */}
      <EventForm
        events={events}
        setEvents={setEvents}
        editingEvent={editingEvent}
        setEditingEvent={setEditingEvent}
      />

      {/* Event List */}
      {loading ? (
        <p className="text-center mt-4">Loading events...</p>
      ) : error ? (
        <p className="text-center text-red-500 mt-4">{error}</p>
      ) : (
        <EventList
          events={events}
          setEvents={setEvents}
          setEditingEvent={setEditingEvent}
        />
      )}
    </div>
  );
};

export default EventPage;
