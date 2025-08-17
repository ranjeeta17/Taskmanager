import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import { toast } from 'react-toastify';

const EventForm = ({ events, setEvents, editingEvent, setEditingEvent, setMode, onSuccess, user }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'other',
    startAt: '',
    endAt: '',
    courseId: '',
    notes: '',
    location: '',
    priority: 'medium',
    isRecurring: false,
    recurrencePattern: { frequency: 'none', interval: 1, endDate: '' },
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title || '',
        type: editingEvent.type || 'other',
        startAt: editingEvent.startAt ? new Date(editingEvent.startAt).toISOString().slice(0, 16) : '',
        endAt: editingEvent.endAt ? new Date(editingEvent.endAt).toISOString().slice(0, 16) : '',
        courseId: editingEvent.courseId || '',
        notes: editingEvent.notes || '',
        location: editingEvent.location || '',
        priority: editingEvent.priority || 'medium',
        isRecurring: editingEvent.isRecurring || false,
        recurrencePattern: {
          frequency: editingEvent.recurrencePattern?.frequency || 'none',
          interval: editingEvent.recurrencePattern?.interval || 1,
          endDate: editingEvent.recurrencePattern?.endDate
            ? new Date(editingEvent.recurrencePattern.endDate).toISOString().slice(0, 16)
            : '',
        },
      });
    } else {
      setFormData({
        title: '',
        type: 'other',
        startAt: '',
        endAt: '',
        courseId: '',
        notes: '',
        location: '',
        priority: 'medium',
        isRecurring: false,
        recurrencePattern: { frequency: 'none', interval: 1, endDate: '' },
      });
    }
    setErrors({});
  }, [editingEvent]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('recurrencePattern.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        recurrencePattern: { ...prev.recurrencePattern, [field]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.courseId.trim()) newErrors.courseId = 'Course ID is required';
    if (!formData.startAt) newErrors.startAt = 'Start date is required';
    if (!formData.endAt) newErrors.endAt = 'End date is required';
    else if (new Date(formData.endAt) <= new Date(formData.startAt)) {
      newErrors.endAt = 'End date must be after start date';
    }
    if (formData.isRecurring && !formData.recurrencePattern.endDate) {
      newErrors['recurrencePattern.endDate'] = 'Recurrence end date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        ...formData,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
        recurrencePattern: formData.isRecurring
          ? { ...formData.recurrencePattern, endDate: new Date(formData.recurrencePattern.endDate).toISOString() }
          : { frequency: 'none', interval: 1 },
      };

      let response;
      if (editingEvent) {
        response = await axiosInstance.patch(`/api/events/${editingEvent._id}`, submitData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setEvents(events.map((e) => (e._id === editingEvent._id ? response.data : e)));
        toast.success('Event updated successfully');
      } else {
        response = await axiosInstance.post('/api/events', submitData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setEvents([...events, response.data]);
        toast.success('Event created successfully');
      }

      setFormData({
        title: '',
        type: 'other',
        startAt: '',
        endAt: '',
        courseId: '',
        notes: '',
        location: '',
        priority: 'medium',
        isRecurring: false,
        recurrencePattern: { frequency: 'none', interval: 1, endDate: '' },
      });
      setEditingEvent(null);
      if (onSuccess) onSuccess();
      else setMode('list');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      type: 'other',
      startAt: '',
      endAt: '',
      courseId: '',
      notes: '',
      location: '',
      priority: 'medium',
      isRecurring: false,
      recurrencePattern: { frequency: 'none', interval: 1, endDate: '' },
    });
    setEditingEvent(null);
    setErrors({});
    setMode('list');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">
          {editingEvent ? 'Edit Event' : 'Create New Event'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter event title"
              disabled={loading}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="lecture">Lecture</option>
              <option value="exam">Exam</option>
              <option value="meeting">Meeting</option>
              <option value="assignment">Assignment</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="startAt" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              id="startAt"
              name="startAt"
              value={formData.startAt}
              onChange={handleChange}
              className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.startAt ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.startAt && <p className="mt-1 text-sm text-red-600">{errors.startAt}</p>}
          </div>

          <div>
            <label htmlFor="endAt" className="block text-sm font-medium text-gray-700 mb-2">
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              id="endAt"
              name="endAt"
              value={formData.endAt}
              onChange={handleChange}
              className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.endAt ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.endAt && <p className="mt-1 text-sm text-red-600">{errors.endAt}</p>}
          </div>

          <div>
            <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-2">
              Course ID *
            </label>
            <input
              type="text"
              id="courseId"
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.courseId ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., CS101, MATH201"
              disabled={loading}
            />
            {errors.courseId && <p className="mt-1 text-sm text-red-600">{errors.courseId}</p>}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows="4"
              value={formData.notes}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter event notes (optional)"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Room 101, Online"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="isRecurring" className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <input
                type="checkbox"
                id="isRecurring"
                name="isRecurring"
                checked={formData.isRecurring}
                onChange={handleChange}
                className="mr-2"
                disabled={loading}
              />
              Recurring Event
            </label>
          </div>

          {formData.isRecurring && (
            <div className="space-y-4 border-l-4 border-blue-200 pl-4">
              <div>
                <label htmlFor="recurrencePattern.frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency
                </label>
                <select
                  id="recurrencePattern.frequency"
                  name="recurrencePattern.frequency"
                  value={formData.recurrencePattern.frequency}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label htmlFor="recurrencePattern.interval" className="block text-sm font-medium text-gray-700 mb-2">
                  Repeat Every
                </label>
                <input
                  type="number"
                  id="recurrencePattern.interval"
                  name="recurrencePattern.interval"
                  value={formData.recurrencePattern.interval}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="recurrencePattern.endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Ends On *
                </label>
                <input
                  type="date"
                  id="recurrencePattern.endDate"
                  name="recurrencePattern.endDate"
                  value={formData.recurrencePattern.endDate}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors['recurrencePattern.endDate'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors['recurrencePattern.endDate'] && (
                  <p className="mt-1 text-sm text-red-600">{errors['recurrencePattern.endDate']}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? editingEvent
                  ? 'Updating...'
                  : 'Creating...'
                : editingEvent
                ? 'Update Event'
                : 'Create Event'}
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

export default EventForm;