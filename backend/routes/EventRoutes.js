const express = require('express');
const { getEvents, createEvent, updateEvent, deleteEvent } = require('../controllers/EventController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, getEvents)
  .post(protect, createEvent);

router.route('/:id')
  .patch(protect, updateEvent)
  .delete(protect, deleteEvent);

module.exports = router;