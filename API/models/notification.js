const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  rideId: {
    type: String, // Link to the specific ride
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
