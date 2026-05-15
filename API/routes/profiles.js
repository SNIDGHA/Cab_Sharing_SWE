const express = require('express');
const router = express.Router();
const Profile = require('../models/profile');

// Getting one profile by email
router.get('/', async (req, res) => {
  const { email } = req.query;
  try {
    const profile = await Profile.findOne({ email: email });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Creating a profile
router.post('/', async (req, res) => {
  const profile = new Profile({
    name: req.body.name,
    email: req.body.email,
    displayName: req.body.displayName,
    bio: req.body.bio,
  });
  try {
    const newProfile = await profile.save();
    res.status(201).json(newProfile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Updating a profile
router.patch('/:id', getProfile, async (req, res) => {
  if (req.body.name != null) {
    res.profile.name = req.body.name;
  }
  if (req.body.email != null) {
    res.profile.email = req.body.email;
  }
  if (req.body.displayName != null) {
    res.profile.displayName = req.body.displayName;
  }
  if (req.body.bio != null) {
    res.profile.bio = req.body.bio;
  }
  try {
    const updatedProfile = await res.profile.save();
    res.json(updatedProfile);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Deleting a profile
router.delete('/:id', getProfile, async (req, res) => {
  try {
    await res.profile.deleteOne();
    res.json({ message: 'Deleted Profile' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

async function getProfile(req, res, next) {
  let profile;
  try {
    profile = await Profile.findById(req.params.id);
    if (profile == null) {
      return res.status(404).json({ message: 'Cannot find profile' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.profile = profile;
  next();
}

module.exports = router;
