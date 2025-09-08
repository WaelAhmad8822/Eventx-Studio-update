const express = require('express');
const { body, validationResult } = require('express-validator');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/tickets/book
// @desc    Book a ticket
// @access  Private
router.post('/book', [
  auth,
  body('eventId').isMongoId().withMessage('Valid event ID is required'),
  body('seatNumber').notEmpty().withMessage('Seat number is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventId, seatNumber } = req.body;

    // Check if event exists and has available seats
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.availableSeats <= 0) {
      return res.status(400).json({ message: 'No seats available' });
    }

    // Check if seat is already taken
    const existingTicket = await Ticket.findOne({ event: eventId, seatNumber });
    if (existingTicket) {
      return res.status(400).json({ message: 'Seat already taken' });
    }

    // Generate QR code data string
    const qrData = {
      ticketId: new Date().getTime().toString(),
      eventId: eventId,
      userId: req.user._id,
      seatNumber: seatNumber,
      timestamp: new Date().toISOString()
    };

    const qrCode = JSON.stringify(qrData);

    // Create ticket
    const ticket = new Ticket({
      event: eventId,
      user: req.user._id,
      seatNumber,
      price: event.price,
      qrCode,
      paymentId: `PAY_${Date.now()}`,
      paymentStatus: 'completed'
    });

    await ticket.save();

    // Update event available seats
    await Event.findByIdAndUpdate(eventId, {
      $inc: { availableSeats: -1 }
    });

    res.status(201).json(ticket);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tickets/my-tickets
// @desc    Get user's tickets
// @access  Private
router.get('/my-tickets', auth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.user._id })
      .populate('event', 'title date time venue price')
      .sort({ bookingDate: -1 });

    res.json(tickets);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tickets/:id
// @desc    Get single ticket
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('event', 'title date time venue')
      .populate('user', 'name email');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user owns the ticket or is admin
    if (ticket.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(ticket);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tickets/:id/check-in
// @desc    Check in ticket
// @access  Private (Admin)
router.put('/:id/check-in', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.status === 'used') {
      return res.status(400).json({ message: 'Ticket already used' });
    }

    ticket.status = 'used';
    ticket.checkInTime = new Date();
    await ticket.save();

    res.json(ticket);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tickets/:id
// @desc    Cancel ticket
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Check if user owns the ticket or is admin
    if (ticket.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (ticket.status === 'used') {
      return res.status(400).json({ message: 'Cannot cancel used ticket' });
    }

    // Update event available seats
    await Event.findByIdAndUpdate(ticket.event, {
      $inc: { availableSeats: 1 }
    });

    ticket.status = 'cancelled';
    await ticket.save();

    res.json({ message: 'Ticket cancelled successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
