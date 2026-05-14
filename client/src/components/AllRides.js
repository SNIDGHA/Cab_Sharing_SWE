import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { css } from '@emotion/react';
import { PacmanLoader } from 'react-spinners';

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const AllRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await axios.get('http://localhost:3001/rides'); // Replace with your API endpoint
        setRides(response.data);
        // Simulating a delay for demonstration purposes
        setTimeout(() => {
          setLoading(false);
        }, 2000); // Adjust the delay time as needed
      } catch (error) {
        console.error('Error fetching rides:', error);
        setError('Error fetching data. Please try again later.');
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  if (loading) {
    return (
      <div className="loading-container flex justify-center items-center h-screen">
        <PacmanLoader color={'#00BFFF'} css={override} size={40} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Available Rides</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rides.length ? (
            rides.map((ride) => (
              <div key={ride._id} className="bg-white rounded-lg shadow-lg p-6 flex flex-col justify-between">
                <div>
                  <p className="text-xl font-semibold text-indigo-600 mb-4">
                    {ride.departureDetails.departureLocation} 
                    <span className="mx-2 text-gray-500">&#8594;</span> 
                    {ride.destinationDetails.destinationLocation}
                  </p>
                  <p className="text-gray-700 text-sm mb-4">{ride.additionalInformation}</p>
                  <p className="text-gray-700 text-sm mb-2"><span className="text-gray-700 font-semibold">Price Per Seat:</span> {ride.pricing.pricePerSeat}</p>
                  <p className="text-gray-700 text-sm mb-2"><span className="text-gray-700 font-semibold">Available Seats:</span> {ride.availableSeats.numberOfAvailableSeats}</p>
                </div>
                <div className="mt-4">
                  <Link
                    to={`/rides/${ride._id}`}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded inline-block"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No rides available at the moment. Check back later!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AllRides;

