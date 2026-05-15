import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { PacmanLoader } from 'react-spinners';
import { useAuth } from '../AuthContext';

const AllRides = () => {
  const { user, isAuthenticated } = useAuth();
  const [rides, setRides]             = useState([]);
  const [countsMap, setCountsMap]     = useState({});   // rideId → applicantCount
  const [appliedIds, setAppliedIds]   = useState(new Set());
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [ridesRes, countsRes] = await Promise.all([
          axios.get('http://localhost:3001/rides'),
          axios.get('http://localhost:3001/requests/counts'),
        ]);
        setRides(ridesRes.data);
        setCountsMap(countsRes.data);

        // Fetch which rides this user has applied for
        if (isAuthenticated && user?.email) {
          const appliedRes = await axios.get(
            `http://localhost:3001/requests/by-user?email=${encodeURIComponent(user.email)}`
          );
          setAppliedIds(new Set(appliedRes.data.map((r) => r.rideId)));
        }
      } catch (err) {
        console.error('Error fetching rides:', err);
        setError('Error fetching data. Please try again later.');
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchAll();
  }, [isAuthenticated, user]);

  // Dynamic price logic:
  //   - owner of ride       → shows "Total Fare ₹X"
  //   - already applied     → shows "Your share ₹X" = totalFare / currentCount
  //   - not applied yet     → shows "Your share if you join ₹X" = totalFare / (currentCount + 1)
  const getDynamicPrice = (ride) => {
    const totalFare  = ride.pricing?.totalFare ?? ride.pricing?.pricePerSeat ?? 0;
    const count      = countsMap[ride._id] || 0;
    const isOwner    = isAuthenticated && user?.email &&
                       ride.postedBy?.toLowerCase() === user.email.toLowerCase();
    const hasApplied = appliedIds.has(ride._id);

    // Poster counts as rider #1, so totalRiders = 1 + applicantCount
    const totalRiders = 1 + count;      // current riders sharing the fare

    if (isOwner) {
      // Owner sees their own current share (drops as more people join)
      const ownerShare = Math.ceil(totalFare / totalRiders);
      return { label: 'Your share (as driver)', amount: ownerShare, tag: null };
    }
    if (hasApplied) {
      // Already in — show current share
      const share = Math.ceil(totalFare / totalRiders);
      return { label: 'Your share', amount: share, tag: 'applied' };
    }
    // Not applied — show what they'd pay if they join (adds 1 more rider)
    const preview = Math.ceil(totalFare / (totalRiders + 1));
    return { label: 'Your share if you join', amount: preview, tag: null };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PacmanLoader color={'#6366f1'} size={40} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Available Rides</h2>
      <p className="text-center text-gray-500 text-sm mb-8">
        Fares are split dynamically — the more riders, the cheaper it gets for everyone!
      </p>

      {error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : rides.length === 0 ? (
        <p className="text-gray-600 text-center">No rides available at the moment. Check back later!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rides.map((ride) => {
            const isOwner    = isAuthenticated && user?.email &&
                               ride.postedBy?.toLowerCase() === user.email.toLowerCase();
            const hasApplied = appliedIds.has(ride._id);
            const price      = getDynamicPrice(ride);

            return (
              <div
                key={ride._id}
                className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between relative overflow-hidden"
                style={{ border: isOwner ? '2px solid #6366f1' : '1.5px solid #e2e8f0' }}
              >
                {/* Tags */}
                {hasApplied && !isOwner && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    background: '#dcfce7', color: '#16a34a',
                    fontSize: 11, fontWeight: 700, padding: '3px 10px',
                    borderRadius: 20, border: '1px solid #bbf7d0',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    ✅ Already Applied
                  </div>
                )}
                {isOwner && (
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    background: '#ede9fe', color: '#6366f1',
                    fontSize: 11, fontWeight: 700, padding: '3px 10px',
                    borderRadius: 20, border: '1px solid #c7d2fe',
                  }}>
                    🚗 Your Ride
                  </div>
                )}

                <div>
                  {/* Route */}
                  <p className="text-xl font-semibold text-indigo-600 mb-3 pr-24">
                    {ride.departureDetails.departureLocation}
                    <span className="mx-2 text-gray-400">→</span>
                    {ride.destinationDetails.destinationLocation}
                  </p>

                  {/* Info */}
                  <p className="text-gray-500 text-sm mb-3">{ride.additionalInformation}</p>

                  <div className="space-y-1 mb-3">
                    <p className="text-gray-700 text-sm">
                      <span className="font-semibold">Departure:</span>{' '}
                      {new Date(ride.departureDetails.departureDateTime).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    <p className="text-gray-700 text-sm">
                      <span className="font-semibold">Seats:</span> {ride.availableSeats.numberOfAvailableSeats}
                    </p>
                    <p className="text-gray-700 text-sm">
                      <span className="font-semibold">Riders so far:</span> {1 + (countsMap[ride._id] || 0)} (driver + {countsMap[ride._id] || 0} applicant{(countsMap[ride._id] || 0) !== 1 ? 's' : ''})
                    </p>
                  </div>

                  {/* Dynamic Price */}
                  <div style={{
                    background: hasApplied && !isOwner ? '#f0fdf4' : '#f5f3ff',
                    borderRadius: 10, padding: '10px 14px', marginBottom: 4,
                    border: `1px solid ${hasApplied && !isOwner ? '#bbf7d0' : '#e0d9ff'}`,
                  }}>
                    <p style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>{price.label}</p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: hasApplied && !isOwner ? '#16a34a' : '#6366f1' }}>
                      ₹{price.amount}
                    </p>
                    {(
                      <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>
                        Total ₹{ride.pricing?.totalFare ?? ride.pricing?.pricePerSeat ?? 0} ÷ {1 + (countsMap[ride._id] || 0) + (hasApplied || isOwner ? 0 : 1)} riders (1 driver{(countsMap[ride._id] || 0) > 0 ? ` + ${countsMap[ride._id]} applicant${countsMap[ride._id] !== 1 ? 's' : ''}` : ''}{!hasApplied && !isOwner ? ' + you' : ''})
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    to={`/rides/${ride._id}`}
                    className="block text-center py-2 px-4 rounded-lg font-bold text-white"
                    style={{ background: isOwner ? '#6366f1' : '#4f46e5' }}
                  >
                    {isOwner ? 'Manage Ride' : hasApplied ? 'View Details' : 'Request a Seat'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllRides;
