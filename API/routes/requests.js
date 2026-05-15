const express = require('express');
const router = express.Router();
const RequestForASeat = require('../models/request');
const Notification = require('../models/notification');
const Ride = require('../models/ride');

// Count of all requests (dashboard stat)
router.get('/count', async (req, res) => {
  try {
    res.json({ count: await RequestForASeat.countDocuments() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Map of rideId → applicantCount for ALL rides (used for dynamic pricing)
// GET /requests/counts
router.get('/counts', async (req, res) => {
  try {
    const agg = await RequestForASeat.aggregate([
      { $group: { _id: '$rideId', count: { $sum: 1 } } }
    ]);
    const map = {};
    agg.forEach(({ _id, count }) => { map[_id] = count; });
    res.json(map);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Check if a specific user has applied for a specific ride
// GET /requests/check?email=...&rideId=...
router.get('/check', async (req, res) => {
  const { email, rideId } = req.query;
  if (!email || !rideId) return res.status(400).json({ message: 'email and rideId required' });
  try {
    const existing = await RequestForASeat.findOne({
      yourEmail: email.toLowerCase().trim(),
      rideId,
    });
    res.json({ alreadyApplied: !!existing });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all requests by a user (returns array of rideIds applied to)
// GET /requests/by-user?email=...
router.get('/by-user', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'email required' });
  try {
    const reqs = await RequestForASeat.find({ yourEmail: email.toLowerCase().trim() });
    res.json(reqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all requests for a specific ride
// GET /requests/by-ride/:rideId
router.get('/by-ride/:rideId', async (req, res) => {
  try {
    const reqs = await RequestForASeat.find({ rideId: req.params.rideId });
    res.json(reqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all requests
router.get('/', async (req, res) => {
  try {
    res.json(await RequestForASeat.find());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one request
router.get('/:id', getRequest, (req, res) => {
  res.json(res.request);
});

// Create a request — blocks duplicates and self-requests
router.post('/', async (req, res) => {
  const { yourName, yourEmail, messageToDriver, rideId, postedBy } = req.body;
  if (!yourEmail || !rideId) return res.status(400).json({ message: 'Email and rideId are required.' });

  const normalizedEmail = yourEmail.toLowerCase().trim();

  if (postedBy && normalizedEmail === postedBy.toLowerCase().trim()) {
    return res.status(403).json({ message: 'You cannot request a seat on your own ride.' });
  }

  const existing = await RequestForASeat.findOne({ yourEmail: normalizedEmail, rideId });
  if (existing) return res.status(409).json({ message: 'You have already applied for this ride.' });

  try {
    const newRequest = await new RequestForASeat({ yourName, yourEmail: normalizedEmail, messageToDriver, rideId }).save();
    
    // Create notifications asynchronously (don't block the response)
    (async () => {
      try {
        const ride = await Ride.findById(rideId);
        if (!ride) return;

        const destination = ride.destinationDetails.destinationLocation;

        // 1. Notify the ride owner
        if (ride.postedBy) {
          await new Notification({
            userEmail: ride.postedBy,
            message: `${yourName} requested a seat on your ride to ${destination}.`,
            rideId: rideId
          }).save();
        }

        // 2. Notify existing applicants (excluding the new one)
        const existingApplicants = await RequestForASeat.find({
          rideId: rideId,
          yourEmail: { $ne: normalizedEmail } // Exclude the person who just joined
        });

        const notifications = existingApplicants.map(applicant => ({
          userEmail: applicant.yourEmail,
          message: `The fare for your ride to ${destination} has dropped! Someone new joined.`,
          rideId: rideId
        }));

        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
        }
      } catch (notifErr) {
        console.error('Failed to create notifications:', notifErr);
      }
    })();

    res.status(201).json(newRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Patch update
router.patch('/:id', getRequest, async (req, res) => {
  if (req.body.yourName != null) res.request.yourName = req.body.yourName;
  try { res.json(await res.request.save()); } catch (err) { res.status(400).json({ message: err.message }); }
});

// Put update
router.put('/:id', getRequest, async (req, res) => {
  if (req.body.yourName != null)        res.request.yourName = req.body.yourName;
  if (req.body.yourEmail != null)       res.request.yourEmail = req.body.yourEmail;
  if (req.body.messageToDriver != null) res.request.messageToDriver = req.body.messageToDriver;
  if (req.body.rideId != null)          res.request.rideId = req.body.rideId;
  try { res.json(await res.request.save()); } catch (err) { res.status(400).json({ message: err.message }); }
});

// Delete
router.delete('/:id', getRequest, async (req, res) => {
  try {
    await res.request.deleteOne();
    res.json({ message: 'Deleted Request' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getRequest(req, res, next) {
  let request;
  try {
    request = await RequestForASeat.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Cannot find request' });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.request = request;
  next();
}

module.exports = router;
