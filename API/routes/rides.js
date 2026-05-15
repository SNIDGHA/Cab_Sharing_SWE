const express = require('express');
const router = express.Router();
const Ride = require('../models/ride');
const verifyToken = require('../middleware/auth');

// GET all rides
router.get('/', async (req, res) => {
  try {
    const rides = await Ride.find();
    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET rides posted by a specific user — /rides/by-user?email=
router.get('/by-user', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'email query param required' });
  try {
    const rides = await Ride.find({ postedBy: email.toLowerCase().trim() });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET one ride
router.get('/:id', getRide, (req, res) => {
  res.json(res.ride);
});

// POST — create a ride
router.post('/', async (req, res) => {
  const ride = new Ride({
    driver:                req.body.driver,
    postedBy:              req.body.postedBy || null,
    departureDetails:      req.body.departureDetails,
    destinationDetails:    req.body.destinationDetails,
    additionalInformation: req.body.additionalInformation,
    pricing: {
      totalFare: Number(req.body.pricing?.totalFare ?? req.body.pricing?.pricePerSeat ?? 0),
    },
    availableSeats:        req.body.availableSeats,
  });
  try {
    const newRide = await ride.save();
    res.status(201).json(newRide);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT — full edit (owner only, must be authenticated)
router.put('/:id', verifyToken, getRide, async (req, res) => {
  if (res.ride.postedBy && res.ride.postedBy !== req.user.email) {
    return res.status(403).json({ message: 'You can only edit your own rides.' });
  }
  const { departureDetails, destinationDetails, additionalInformation, pricing, availableSeats } = req.body;
  if (departureDetails)      res.ride.departureDetails      = departureDetails;
  if (destinationDetails)    res.ride.destinationDetails    = destinationDetails;
  if (additionalInformation) res.ride.additionalInformation = additionalInformation;
  if (pricing?.totalFare != null) res.ride.pricing = { totalFare: Number(pricing.totalFare) };
  if (availableSeats?.numberOfAvailableSeats != null) {
    res.ride.availableSeats = { numberOfAvailableSeats: Number(availableSeats.numberOfAvailableSeats) };
  }
  try {
    const updated = await res.ride.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH — partial update
router.patch('/:id', getRide, async (req, res) => {
  if (req.body.driver != null) res.ride.driver = req.body.driver;
  try {
    res.json(await res.ride.save());
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE — owner only (authenticated)
router.delete('/:id', verifyToken, getRide, async (req, res) => {
  if (res.ride.postedBy && res.ride.postedBy !== req.user.email) {
    return res.status(403).json({ message: 'You can only delete your own rides.' });
  }
  try {
    await res.ride.deleteOne();
    res.json({ message: 'Ride deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getRide(req, res, next) {
  let ride;
  try {
    ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Cannot find ride' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.ride = ride;
  next();
}

module.exports = router;
