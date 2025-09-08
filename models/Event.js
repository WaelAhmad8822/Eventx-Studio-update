// models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  venue: {
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  totalSeats: {
    type: Number,
    required: true,
    min: 1
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['conference', 'workshop', 'seminar', 'concert', 'sports', 'exhibition', 'other']
  },
  image: {
    type: String,
    default: ''
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'closed', 'cancelled'],
    default: 'upcoming'
  },
  tags: [{
    type: String
  }],
  requirements: [{
    type: String
  }],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Update available seats when total seats change
eventSchema.pre('save', function(next) {
  if (this.isModified('totalSeats') && !this.isModified('availableSeats')) {
    this.availableSeats = this.totalSeats;
  }
  next();
});

module.exports = mongoose.model('Event', eventSchema);
