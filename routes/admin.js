// routes/admin.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    // Get total events
    const totalEvents = await Event.countDocuments();
    
    // Get total tickets sold
    const totalTicketsSold = await Ticket.countDocuments({ status: { $ne: 'cancelled' } });
    
    // Get total revenue
    const revenueData = await Ticket.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$price' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
    
    // Get total attendees
    const totalAttendees = await User.countDocuments({ role: 'user' });
    
    // Get recent events
    const recentEvents = await Event.find()
      .populate('organizer', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Get upcoming events (respect event status)
    const upcomingEvents = await Event.find({
      date: { $gte: new Date() },
      status: 'upcoming'
    }).sort({ date: 1 }).limit(5);
    
    // Get events by status
    const eventsByStatus = await Event.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const revenueByMonth = await Ticket.aggregate([
      { 
        $match: { 
          status: { $ne: 'cancelled' },
          bookingDate: { $gte: sixMonthsAgo }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$bookingDate' },
            month: { $month: '$bookingDate' }
          },
          revenue: { $sum: '$price' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalEvents,
      totalTicketsSold,
      totalRevenue,
      totalAttendees,
      recentEvents,
      upcomingEvents,
      eventsByStatus,
      revenueByMonth
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/events
// @desc    Get all events for admin
// @access  Private (Admin)
router.get('/events', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 })
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

// @route   GET /api/admin/tickets
// @desc    Get all tickets for admin
// @access  Private (Admin)
router.get('/tickets', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, eventId } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (eventId) query.event = eventId;

    const tickets = await Ticket.find(query)
      .populate('event', 'title date venue')
      .populate('user', 'name email')
      .sort({ bookingDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ticket.countDocuments(query);

    res.json({
      tickets,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get analytics data
// @access  Private (Admin)
router.get('/analytics', adminAuth, async (req, res) => {
  try {
    // Attendee demographics
    let attendeeDemographics = [];
    try {
      attendeeDemographics = await User.aggregate([
        { $match: { role: 'user' } },
        {
          $project: {
            genderLabel: {
              $switch: {
                branches: [
                  { case: { $eq: [{ $toLower: '$gender' }, 'male'] }, then: 'Male' },
                  { case: { $eq: [{ $toLower: '$gender' }, 'female'] }, then: 'Female' },
                  { case: { $eq: [{ $toLower: '$gender' }, 'other'] }, then: 'Other' }
                ],
                default: 'Other'
              }
            }
          }
        },
        { $group: { _id: '$genderLabel', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
    } catch (error) {
      console.log('Demographics aggregation failed:', error.message);
      attendeeDemographics = [
        { _id: 'Male', count: 0 },
        { _id: 'Female', count: 0 },
        { _id: 'Other', count: 0 }
      ];
    }

    // Age groups - compute accurately from stored Date or String and return labeled buckets
    let ageGroups = [];
    try {
      ageGroups = await User.aggregate([
        { $match: { role: 'user', dateOfBirth: { $exists: true, $ne: null } } },
        {
          $addFields: {
            // Normalize dateOfBirth to a Date regardless of stored type
            _dobDate: {
              $cond: [
                { $eq: [ { $type: '$dateOfBirth' }, 'date' ] },
                '$dateOfBirth',
                { $dateFromString: { dateString: '$dateOfBirth', onError: new Date('1990-01-01') } }
              ]
            }
          }
        },
        {
          $addFields: {
            ageYears: {
              $floor: {
                $divide: [ { $subtract: [ new Date(), '$_dobDate' ] }, 31557600000 ]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            bucket: {
              $switch: {
                branches: [
                  { case: { $lt: ['$ageYears', 18] }, then: '0-17' },
                  { case: { $and: [ { $gte: ['$ageYears', 18] }, { $lt: ['$ageYears', 25] } ] }, then: '18-24' },
                  { case: { $and: [ { $gte: ['$ageYears', 25] }, { $lt: ['$ageYears', 35] } ] }, then: '25-34' },
                  { case: { $and: [ { $gte: ['$ageYears', 35] }, { $lt: ['$ageYears', 45] } ] }, then: '35-44' },
                  { case: { $and: [ { $gte: ['$ageYears', 45] }, { $lt: ['$ageYears', 55] } ] }, then: '45-54' },
                  { case: { $and: [ { $gte: ['$ageYears', 55] }, { $lt: ['$ageYears', 65] } ] }, then: '55-64' }
                ],
                default: '65+'
              }
            }
          }
        },
        { $group: { _id: '$bucket', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);
    } catch (dateError) {
      console.log('Age aggregation failed:', dateError.message);
      ageGroups = [];
    }

    // Popular categories
    let popularCategories = [];
    try {
      popularCategories = await Event.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);
    } catch (error) {
      console.log('Categories aggregation failed:', error.message);
      popularCategories = [];
    }

    // Top events by ticket sales
    let topEvents = [];
    try {
      topEvents = await Ticket.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        {
          $group: {
            _id: '$event',
            ticketCount: { $sum: 1 },
            revenue: { $sum: '$price' }
          }
        },
        { $sort: { ticketCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'events',
            localField: '_id',
            foreignField: '_id',
            as: 'event'
          }
        },
        { $unwind: '$event' }
      ]);
    } catch (error) {
      console.log('Top events aggregation failed:', error.message);
      topEvents = [];
    }

    // Location distribution
    let locationDistribution = [];
    try {
      locationDistribution = await User.aggregate([
        { $match: { role: 'user', 'location.city': { $exists: true } } },
        {
          $group: {
            _id: '$location.city',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
    } catch (error) {
      console.log('Location distribution aggregation failed:', error.message);
      locationDistribution = [];
    }

    res.json({
      attendeeDemographics,
      ageGroups,
      popularCategories,
      topEvents,
      locationDistribution
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/admin/events
// @desc    Create event (Admin only)
// @access  Private (Admin)
router.post('/events', [
  adminAuth,
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

// @route   PUT /api/admin/events/:id
// @desc    Update event (Admin only)
// @access  Private (Admin)
router.put('/events/:id', [
  adminAuth,
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().notEmpty().withMessage('Description cannot be empty'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('time').optional().notEmpty().withMessage('Time cannot be empty'),
  body('venue.name').optional().notEmpty().withMessage('Venue name cannot be empty'),
  body('venue.address').optional().notEmpty().withMessage('Venue address cannot be empty'),
  body('venue.city').optional().notEmpty().withMessage('Venue city cannot be empty'),
  body('price').optional().isNumeric().withMessage('Price must be a number'),
  body('totalSeats').optional().isInt({ min: 1 }).withMessage('Total seats must be at least 1'),
  body('category').optional().isIn(['conference', 'workshop', 'seminar', 'concert', 'sports', 'exhibition', 'other']).withMessage('Invalid category')
], async (req, res) => {
  try {
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
      const seatDifference = req.body.totalSeats - event.totalSeats;
      req.body.availableSeats = event.availableSeats + seatDifference;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'name email');

    res.json(updatedEvent);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/admin/events/:id
// @desc    Delete event (Admin only)
// @access  Private (Admin)
router.delete('/events/:id', adminAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if there are any tickets for this event
    const ticketCount = await Ticket.countDocuments({ event: req.params.id });
    if (ticketCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete event with existing tickets. Please cancel all tickets first.' 
      });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/tickets/:id/check-in
// @desc    Check in ticket (Admin only)
// @access  Private (Admin)
router.put('/tickets/:id/check-in', adminAuth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('event', 'title date');
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    if (ticket.status === 'used') {
      return res.status(400).json({ message: 'Ticket already checked in' });
    }

    if (ticket.status === 'cancelled') {
      return res.status(400).json({ message: 'Cannot check in cancelled ticket' });
    }

    ticket.status = 'used';
    ticket.checkInTime = new Date();
    await ticket.save();

    res.json({ message: 'Ticket checked in successfully', ticket });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
