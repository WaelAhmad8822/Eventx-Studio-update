// routes/events.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all public events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, status, search, page = 1, limit = 10 } = req.query;
    
    let query = { isPublic: true };
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'venue.name': { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/events
// @desc    Create event (Admin only)
// @access  Private (Admin)
router.post('/', [
  auth,
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('venue.name').notEmpty().withMessage('Venue name is required'),
  body('venue.address').notEmpty().withMessage('Venue address is required'),
  body('venue.city').notEmpty().withMessage('Venue city is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('totalSeats').isInt({ min: 1 }).withMessage('Total seats must be at least 1'),
  body('category').isIn(['conference', 'workshop', 'seminar', 'concert', 'sports', 'exhibition', 'other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      organizer: req.user._id,
      availableSeats: req.body.totalSeats
    };

    const event = new Event(eventData);
    await event.save();

    res.status(201).json(event);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event (Admin only)
// @access  Private (Admin)
router.put('/:id', [
  auth,
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('time').optional().notEmpty().withMessage('Time cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('totalSeats').optional().isInt({ min: 1 }).withMessage('Total seats must be at least 1'),
  body('category').optional().isIn(['conference', 'workshop', 'seminar', 'concert', 'sports', 'exhibition', 'other']).withMessage('Invalid category')
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Update available seats if total seats changed
    if (req.body.totalSeats && req.body.totalSeats !== event.totalSeats) {
      const seatsDifference = req.body.totalSeats - event.totalSeats;
      req.body.availableSeats = event.availableSeats + seatsDifference;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedEvent);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event (Admin only)
// @access  Private (Admin)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
