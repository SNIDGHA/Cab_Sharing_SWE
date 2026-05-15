import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RidesList = () => {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/rides`);
        setRides(response.data);
      } catch (error) {
        console.error('Error fetching rides:', error);
      }
    };
    fetchRides();
  }, []);

  return (
    <div>
      <h2>Featured Listings</h2>
      {rides.map((ride) => (
        <div className="card" key={ride._id}>
          <div className="card-body">
            <h5 className="card-title">{ride.title}</h5>
            <p className="card-text">{ride.description}</p>
            <a href={`/rides/${ride._id}`} className="btn btn-primary">
              View Details
            </a>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RidesList;

