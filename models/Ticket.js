// models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seatNumber: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  qrCode: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'used', 'cancelled', 'refunded'],
    default: 'active'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  checkInTime: {
    type: Date
  },
  paymentId: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  }
}, {
  timestamps: true
});

// Ensure unique seat per event
ticketSchema.index({ event: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Ticket', ticketSchema);
