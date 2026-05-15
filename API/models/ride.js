const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  driver: {
    type: String,
    required: true
  },
  postedBy: {
    type: String,       // email of the user who posted this ride
    default: null
  },
  departureDetails: {
    departureLocation: { type: String, required: true },
    departureDateTime: { type: Date,   required: true }
  },
  destinationDetails: {
    destinationLocation:  { type: String, required: true },
    estimatedArrivalTime: { type: String, required: true }
  },
  additionalInformation: { type: String, required: true },
  pricing: {
    totalFare: { type: Number, required: true }   // total cost for the whole ride
  },
  availableSeats: {
    numberOfAvailableSeats: { type: Number, required: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);