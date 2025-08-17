const Event = require('../models/Event');
const asyncHandler = require('express-async-handler');

// GET all events
const getEvents = asyncHandler(async (req, res) => {
  const { from, to, type, courseId, priority } = req.query;
  let query = { userId: req.user._id };

  if (from) query.startAt = { ...query.startAt, $gte: new Date(from) };
  if (to) query.startAt = { ...query.startAt, $lte: new Date(to) };
  if (type) query.type = type;
  if (courseId) query.courseId = { $regex: courseId, $options: 'i' };
  if (priority) query.priority = priority;

  const events = await Event.find(query).sort({ startAt: 1 });
  console.log(`Fetched ${events.length} events for user ${req.user._id}`);
  res.json(events);
});

// CREATE new event
const createEvent = asyncHandler(async (req, res) => {
  const { title, type, startAt, endAt, courseId, notes, location, priority, isRecurring, recurrencePattern } = req.body;
  try {
    const event = await Event.create({
      title,
      type,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      courseId,
      notes,
      location,
      priority,
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : { frequency: 'none', interval: 1 },
      userId: req.user._id,
    });
    console.log(`Created event ${event._id} for user ${req.user._id}`);
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: error.message });
  }
});

// UPDATE event
const updateEvent = asyncHandler(async (req, res) => {
  const { title, type, startAt, endAt, courseId, notes, location, priority, isRecurring, recurrencePattern } = req.body;
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    event.title = title || event.title;
    event.type = type || event.type;
    event.startAt = startAt ? new Date(startAt) : event.startAt;
    event.endAt = endAt ? new Date(endAt) : event.endAt;
    event.courseId = courseId || event.courseId;
    event.notes = notes || event.notes;
    event.location = location || event.location;
    event.priority = priority || event.priority;
    event.isRecurring = isRecurring !== undefined ? isRecurring : event.isRecurring;
    event.recurrencePattern = isRecurring ? recurrencePattern || event.recurrencePattern : { frequency: 'none', interval: 1 };

    const updatedEvent = await event.save();
    console.log(`Updated event ${req.params.id} for user ${req.user._id}`);
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: error.message });
  }
});

// DELETE event
const deleteEvent = asyncHandler(async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    await event.deleteOne();
    console.log(`Deleted event ${req.params.id} for user ${req.user._id}`);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = { getEvents, createEvent, updateEvent, deleteEvent };