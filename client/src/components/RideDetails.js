import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PacmanLoader } from 'react-spinners';

const RideDetails = () => {
  const { id } = useParams();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [applicantCount, setApplicantCount] = useState(0);
  const [applicants, setApplicants] = useState([]);
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useAuth();

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const response = await axios.get(`/rides/${id}`);
        setRide(response.data);

        // Fetch applicant count for dynamic pricing
        const countsRes = await axios.get('http://localhost:3001/requests/counts');
        setApplicantCount(countsRes.data[id] || 0);

        // Check if user already applied
        if (isAuthenticated && user?.email) {
          const checkRes = await axios.get(
            `http://localhost:3001/requests/check?email=${encodeURIComponent(user.email)}&rideId=${id}`
          );
          setAlreadyApplied(checkRes.data.alreadyApplied);
          
          // If the user is the owner, fetch the list of applicants
          if (response.data.postedBy && response.data.postedBy.toLowerCase() === user.email.toLowerCase()) {
             const applicantsRes = await axios.get(`http://localhost:3001/requests/by-ride/${id}`);
             setApplicants(applicantsRes.data);
          }
        }
      } catch (error) {
        console.error('Error fetching ride:', error);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchRide();
  }, [id, isAuthenticated, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <PacmanLoader color={'#6366f1'} size={40} />
      </div>
    );
  }

  if (!ride) {
    return <div className="text-center mt-16 text-gray-500">Ride not found.</div>;
  }

  const isOwnRide = isAuthenticated && user?.email &&
    ride.postedBy && ride.postedBy.toLowerCase() === user.email.toLowerCase();

  const handleRequestSeat = () => {
    if (!isAuthenticated) {
      toast.error('You need to be signed in to make a request.', {
        position: toast.POSITION.TOP_CENTER,
        autoClose: 4000,
      });
      setTimeout(() => login(), 4000);
      return;
    }
    navigate(`/rides/${id}/create-request`);
  };

  // Decide what to show for the action button
  const renderActionButton = () => {
    if (isOwnRide) {
      return (
        <div className="flex justify-center mt-8">
          <span
            style={{
              background: '#f1f5f9',
              color: '#64748b',
              padding: '10px 32px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '15px',
              border: '2px solid #e2e8f0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            🚗 This is your ride
          </span>
        </div>
      );
    }

    if (alreadyApplied) {
      return (
        <div className="flex justify-center mt-8">
          <span
            style={{
              background: '#f0fdf4',
              color: '#16a34a',
              padding: '10px 32px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '15px',
              border: '2px solid #bbf7d0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            ✅ Already Applied
          </span>
        </div>
      );
    }

    return (
      <div className="flex justify-center mt-8">
        <button
          onClick={handleRequestSeat}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-md focus:outline-none focus:shadow-outline"
          style={{ boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.1)' }}
        >
          Request a Seat
        </button>
      </div>
    );
  };

  return (
    <div className="custom-container mx-auto p-4">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Ride Details</h2>
      <div className="bg-white shadow-md rounded p-8 mb-4">

        {/* Ownership banner */}
        {isOwnRide && (
          <div
            style={{
              background: '#ede9fe',
              borderRadius: 10,
              padding: '10px 16px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#6366f1',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            🚗 You posted this ride
          </div>
        )}

        {alreadyApplied && !isOwnRide && (
          <div
            style={{
              background: '#f0fdf4',
              borderRadius: 10,
              padding: '10px 16px',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#16a34a',
              fontWeight: 600,
              fontSize: 14,
              border: '1px solid #bbf7d0',
            }}
          >
            ✅ You have already applied for this ride
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-4">
              <p className="text-gray-700 text-sm">Driver:</p>
              <p className="text-gray-900 font-bold text-xl">{ride.driver}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 text-sm">Departure Location:</p>
              <p className="text-gray-900 font-bold text-xl">{ride.departureDetails.departureLocation}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 text-sm">Departure Date and Time:</p>
              <p className="text-gray-900 font-bold text-xl">
                {new Date(ride.departureDetails.departureDateTime).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 text-sm">Destination Location:</p>
              <p className="text-gray-900 font-bold text-xl">{ride.destinationDetails.destinationLocation}</p>
            </div>
          </div>
          <div>
            <div className="mb-4">
              <p className="text-gray-700 text-sm">Estimated Arrival Time:</p>
              <p className="text-gray-900 font-bold text-xl">{ride.destinationDetails.estimatedArrivalTime}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 text-sm">Additional Information:</p>
              <p className="text-gray-900 font-bold text-xl">{ride.additionalInformation}</p>
            </div>
            <div className="mb-4">
              <p className="text-gray-700 text-sm">Price per Rider (Dynamic):</p>
              {(() => {
                const totalFare   = ride.pricing?.totalFare ?? ride.pricing?.pricePerSeat ?? 0;
                // Driver is always rider #1; total riders = 1 + applicantCount
                const totalRiders = 1 + applicantCount;

                if (isOwnRide) {
                  const ownerShare = Math.ceil(totalFare / totalRiders);
                  return (
                    <>
                      <p className="text-indigo-600 font-bold text-2xl">₹{ownerShare}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        Your share as driver · Total ₹{totalFare} ÷ {totalRiders} rider{totalRiders !== 1 ? 's' : ''}
                      </p>
                    </>
                  );
                }

                const share = alreadyApplied
                  ? Math.ceil(totalFare / totalRiders)                // current share
                  : Math.ceil(totalFare / (totalRiders + 1));          // preview if they join

                return (
                  <>
                    <p className="text-indigo-600 font-bold text-2xl">₹{share}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {alreadyApplied ? 'Your share' : 'If you join'} · Total ₹{totalFare} ÷ {totalRiders + (alreadyApplied ? 0 : 1)} rider{(totalRiders + (alreadyApplied ? 0 : 1)) !== 1 ? 's' : ''} (1 driver + {applicantCount + (alreadyApplied ? 0 : 1)} applicant{(applicantCount + (alreadyApplied ? 0 : 1)) !== 1 ? 's' : ''})
                    </p>
                  </>
                );
              })()}
            </div>
            <div className="mb-4">
              <p className="text-gray-700 text-sm">Available Seats:</p>
              <p className="text-gray-900 font-bold text-xl">{ride.availableSeats.numberOfAvailableSeats}</p>
            </div>
          </div>
        </div>

        {renderActionButton()}
      </div>

      {isOwnRide && (
        <div className="bg-white shadow-md rounded p-8 mb-4 mt-6 border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            👥 People who requested your ride
          </h3>
          {applicants.length === 0 ? (
            <p className="text-gray-500 italic">No one has requested a seat on this ride yet.</p>
          ) : (
            <div className="space-y-4">
              {applicants.map(app => (
                <div key={app._id} className="bg-gray-50 p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-indigo-700 text-lg">{app.yourName}</p>
                    <p className="text-sm text-gray-600 mb-2">✉️ {app.yourEmail}</p>
                    {app.messageToDriver && (
                      <p className="text-gray-700 bg-white p-2 rounded border border-gray-200 text-sm italic">
                        "{app.messageToDriver}"
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 self-start sm:self-end">
                    Requested on: {new Date(app.createdAt || Date.now()).toLocaleDateString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default RideDetails;
