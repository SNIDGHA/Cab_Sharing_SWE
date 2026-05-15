import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';

function CreateRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [ride, setRide] = useState(null);
  const [data, setData] = useState({
    yourName: '',
    yourEmail: '',
    messageToDriver: '',
    rideId: id,
  });
  const [success, setSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill name and email from logged-in user
  useEffect(() => {
    if (isAuthenticated && user) {
      setData((prev) => ({
        ...prev,
        yourName:  user.name  || '',
        yourEmail: user.email || '',
      }));
    }
  }, [isAuthenticated, user]);

  // Fetch ride to get postedBy
  useEffect(() => {
    axios.get(`http://localhost:3001/rides/${id}`)
      .then((res) => setRide(res.data))
      .catch(console.error);
  }, [id]);

  function handle(e) {
    setErrorMsg('');
    const newData = { ...data };
    newData[e.target.id] = e.target.value;
    setData(newData);
  }

  async function submit(e) {
    e.preventDefault();
    setErrorMsg('');
    try {
      await axios.post('http://localhost:3001/requests', {
        yourName:        data.yourName,
        yourEmail:       data.yourEmail,
        messageToDriver: data.messageToDriver,
        rideId:          id,
        postedBy:        ride?.postedBy || null,   // so backend can check self-request
      });
      setSuccess(true);
      setTimeout(() => navigate('/all-requests'), 2000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Submission failed. Please try again.');
      setSuccess(false);
    }
  }

  return (
    <div className="mx-auto max-w-md w-full my-8">
      <div className="bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">Submit Your Request</h2>

        {errorMsg && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{errorMsg}</span>
          </div>
        )}

        {success === true && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">Request submitted. Redirecting...</span>
          </div>
        )}

        {success !== true && (
          <form onSubmit={submit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="yourName">Your Name</label>
              <input
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="yourName"
                type="text"
                value={data.yourName}
                onChange={handle}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="yourEmail">Your Email</label>
              <input
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="yourEmail"
                type="email"
                value={data.yourEmail}
                onChange={handle}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="messageToDriver">Message to Driver</label>
              <input
                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="messageToDriver"
                type="text"
                value={data.messageToDriver}
                onChange={handle}
                placeholder="Optional message..."
              />
            </div>

            <div className="flex justify-center">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Submit
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateRequest;
