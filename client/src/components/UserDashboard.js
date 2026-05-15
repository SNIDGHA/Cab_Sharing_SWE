import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { PacmanLoader } from 'react-spinners';
import './UserDashboard.css';

const EMPTY_FORM = {
  departureLocation: '',
  departureDateTime: '',
  destinationLocation: '',
  estimatedArrivalTime: '',
  totalFare: '',
  numberOfAvailableSeats: '',
  additionalInformation: '',
};

const UserDashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  const [requestCount, setRequestCount] = useState(0);
  const [rideCount, setRideCount]       = useState(0);
  const [myRides, setMyRides]           = useState([]);
  const [loading, setLoading]           = useState(true);

  // Modal state — editingRide=null means "create", otherwise "edit"
  const [showModal, setShowModal]   = useState(false);
  const [editingRide, setEditingRide] = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Delete confirmation
  const [deletingId, setDeletingId]   = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fetchMyRides = useCallback(async () => {
    if (!user?.email) return [];
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}`}/rides/by-user?email=${encodeURIComponent(user.email)}`
    );
    return res.data;
  }, [user?.email]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [reqRes, rideRes, myRidesData] = await Promise.all([
          user?.email ? axios.get(`/requests/by-user?email=${encodeURIComponent(user.email)}`) : Promise.resolve({ data: [] }),
          axios.get('/rides'),
          fetchMyRides(),
        ]);
        setRequestCount(reqRes.data.length);
        setRideCount(rideRes.data.length);
        setMyRides(myRidesData);
      } catch (err) {
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [fetchMyRides]);

  const handleChange = (e) => {
    setFormError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openCreate = () => {
    setEditingRide(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  };

  const openEdit = (ride) => {
    setEditingRide(ride);
    setForm({
      departureLocation:      ride.departureDetails.departureLocation,
      departureDateTime:      new Date(ride.departureDetails.departureDateTime).toISOString().slice(0, 16),
      destinationLocation:    ride.destinationDetails.destinationLocation,
      estimatedArrivalTime:   ride.destinationDetails.estimatedArrivalTime,
      totalFare:              ride.pricing.totalFare,
      numberOfAvailableSeats: ride.availableSeats.numberOfAvailableSeats,
      additionalInformation:  ride.additionalInformation,
    });
    setFormError('');
    setFormSuccess('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    const payload = {
      driver:      isAuthenticated && user ? user.name : 'Anonymous',
      postedBy:    isAuthenticated && user ? user.email : null,
      departureDetails: {
        departureLocation: form.departureLocation,
        departureDateTime: new Date(form.departureDateTime),
      },
      destinationDetails: {
        destinationLocation:  form.destinationLocation,
        estimatedArrivalTime: form.estimatedArrivalTime,
      },
      pricing:        { totalFare: Number(form.totalFare) },
      availableSeats: { numberOfAvailableSeats: parseInt(form.numberOfAvailableSeats, 10) },
      additionalInformation: form.additionalInformation,
    };

    try {
      if (editingRide) {
        await axios.put(`${process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}`}/rides/${editingRide._id}`, payload, { withCredentials: true });
        setFormSuccess('✅ Ride updated!');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/rides`, payload);
        setFormSuccess('🎉 Ride posted!');
        setRideCount((c) => c + 1);
      }
      const updated = await fetchMyRides();
      setMyRides(updated);
      setForm(EMPTY_FORM);
      setTimeout(() => { setShowModal(false); setFormSuccess(''); setEditingRide(null); }, 1600);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (rideId) => {
    setDeletingId(rideId);
    setDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}`}/rides/${deletingId}`, { withCredentials: true });
      const updated = await fetchMyRides();
      setMyRides(updated);
      setRideCount((c) => c - 1);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeletingId(null);
      setDeleteConfirm(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="dash-loading">
        <PacmanLoader color="#6366f1" size={40} />
      </div>
    );
  }

  const userName  = isAuthenticated && user ? user.name  : 'Guest';
  const userEmail = isAuthenticated && user ? user.email : '—';
  const initials  = userName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="dash-bg">
      {/* Header */}
      <div className="dash-header">
        <div className="dash-avatar">{initials}</div>
        <div>
          <h1 className="dash-welcome">Welcome back, {userName.split(' ')[0]} 👋</h1>
          <p className="dash-email">{userEmail}</p>
        </div>
        <button id="btn-post-ride" className="dash-post-btn" onClick={openCreate}>
          + Post a Ride
        </button>
      </div>

      {/* Stat cards */}
      <div className="dash-grid">
        <div className="dash-card">
          <div className="dash-card-icon" style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>👤</div>
          <h2 className="dash-card-title">My Profile</h2>
          <p className="dash-card-label">Name</p>
          <p className="dash-card-value">{userName}</p>
          <p className="dash-card-label" style={{ marginTop: 8 }}>Email</p>
          <p className="dash-card-value">{userEmail}</p>
          <a href="/profile" className="dash-card-link" id="link-profile">View Profile →</a>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon" style={{ background: 'linear-gradient(135deg,#0ea5e9,#0284c7)' }}>📋</div>
          <h2 className="dash-card-title">My Requests</h2>
          <p className="dash-stat-number">{requestCount}</p>
          <p className="dash-card-sub">Active ride requests</p>
          <a href="/all-requests" className="dash-card-link" id="link-requests">View Requests →</a>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon" style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}>🚗</div>
          <h2 className="dash-card-title">Available Rides</h2>
          <p className="dash-stat-number">{rideCount}</p>
          <p className="dash-card-sub">Rides available now</p>
          <a href="/rides" className="dash-card-link" id="link-rides">Browse Rides →</a>
        </div>

        <div className="dash-card dash-card-cta" onClick={openCreate}>
          <div className="dash-card-icon" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>➕</div>
          <h2 className="dash-card-title">Post a Ride</h2>
          <p className="dash-card-sub">Share your journey and split costs with fellow travellers.</p>
          <span className="dash-card-link">Create Now →</span>
        </div>
      </div>

      {/* My Posted Rides */}
      {isAuthenticated && (
        <div className="my-rides-section">
          <h2 className="my-rides-heading">🚗 My Posted Rides</h2>
          {myRides.length === 0 ? (
            <p className="my-rides-empty">You haven't posted any rides yet. Click "+ Post a Ride" to get started!</p>
          ) : (
            <div className="my-rides-grid">
              {myRides.map((ride) => (
                <div key={ride._id} className="my-ride-card">
                  <div className="my-ride-route">
                    <span>{ride.departureDetails.departureLocation}</span>
                    <span className="my-ride-arrow">→</span>
                    <span>{ride.destinationDetails.destinationLocation}</span>
                  </div>
                  <div className="my-ride-meta">
                    <span>📅 {new Date(ride.departureDetails.departureDateTime).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <span>💺 {ride.availableSeats.numberOfAvailableSeats} seats</span>
                    <span>💰 Total ₹{ride.pricing.totalFare}</span>
                  </div>
                  <div className="my-ride-footer">
                    <span className="my-ride-owner-badge">Your Ride</span>
                    <div className="my-ride-actions">
                      <button className="my-ride-edit-btn" onClick={() => openEdit(ride)} title="Edit ride">✏️ Edit</button>
                      <button className="my-ride-delete-btn" onClick={() => handleDelete(ride._id)} title="Delete ride">🗑️ Delete</button>
                      <a href={`/rides/${ride._id}`} className="my-ride-view-link">View →</a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ——— CREATE / EDIT MODAL ——— */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setEditingRide(null); } }}>
          <div className="modal-card">
            <div className="modal-header">
              <h2 className="modal-title">{editingRide ? '✏️ Edit Ride' : '🚗 Post a Ride'}</h2>
              <button className="modal-close" onClick={() => { setShowModal(false); setEditingRide(null); }}>✕</button>
            </div>

            {formError   && <div className="modal-error">{formError}</div>}
            {formSuccess && <div className="modal-success">{formSuccess}</div>}

            <form id="form-post-ride" className="modal-form" onSubmit={handleSubmit}>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Departure Location</label>
                  <input name="departureLocation" placeholder="e.g. New Delhi" value={form.departureLocation} onChange={handleChange} required />
                </div>
                <div className="modal-field">
                  <label>Departure Date & Time</label>
                  <input type="datetime-local" name="departureDateTime" value={form.departureDateTime} onChange={handleChange} required />
                </div>
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Destination</label>
                  <input name="destinationLocation" placeholder="e.g. Mumbai" value={form.destinationLocation} onChange={handleChange} required />
                </div>
                <div className="modal-field">
                  <label>Est. Arrival Time</label>
                  <input type="time" name="estimatedArrivalTime" value={form.estimatedArrivalTime} onChange={handleChange} required />
                </div>
              </div>
              <div className="modal-row">
                <div className="modal-field">
                  <label>Total Fare (₹)</label>
                  <input type="number" min="0" name="totalFare" placeholder="e.g. 1200 (split among riders)" value={form.totalFare} onChange={handleChange} required />
                </div>
                <div className="modal-field">
                  <label>Available Seats</label>
                  <input type="number" min="1" max="10" name="numberOfAvailableSeats" placeholder="e.g. 3" value={form.numberOfAvailableSeats} onChange={handleChange} required />
                </div>
              </div>
              <div className="modal-field">
                <label>Additional Information</label>
                <textarea
                  name="additionalInformation"
                  placeholder="e.g. AC car, no smoking, luggage ok..."
                  rows={3}
                  value={form.additionalInformation}
                  onChange={handleChange}
                  required
                />
              </div>
              <button id="btn-submit-ride" type="submit" className="modal-submit" disabled={submitting}>
                {submitting ? <span className="btn-spinner" /> : (editingRide ? 'Save Changes' : 'Post Ride')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => { setDeleteConfirm(false); setDeletingId(null); }}>
          <div className="modal-card" style={{ maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title" style={{ marginBottom: 12 }}>🗑️ Delete Ride?</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
              This action cannot be undone. All requests for this ride will remain in the system.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => { setDeleteConfirm(false); setDeletingId(null); }}
                style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
