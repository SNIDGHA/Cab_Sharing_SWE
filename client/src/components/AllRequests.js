import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PacmanLoader } from 'react-spinners';

function AllRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Simulating a delay for demonstration purposes
                const timeout = setTimeout(() => {
                    Axios.get("http://localhost:3001/requests")
                        .then(res => {
                            setRequests(res.data);
                            setLoading(false); // Set loading to false when data is fetched
                        })
                        .catch(err => {
                            console.error('Error:', err);
                            setLoading(false); // Set loading to false in case of an error
                        });
                }, 2000); // Simulated delay of 2 seconds
    
                return () => clearTimeout(timeout); // Clear the timeout in case of component unmount
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false); // Set loading to false in case of an error
            }
        };
    
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="loading-container flex justify-center items-center h-screen">
                <PacmanLoader color={'#00BFFF'} size={40} />
            </div>
        );
    }

    function deleteRequest(id) {
        if (!id) {
            console.error("ID is undefined or null");
            return;
        }

        Axios.delete(`http://localhost:3001/requests/${id}`)
            .then(res => {
                console.log('Request deleted:', res.data);
                setRequests(requests.filter(request => request._id !== id));
                toast.error('Request deleted successfully', {
                    position: toast.POSITION.TOP_CENTER,
                    autoClose: 3000, // 3 seconds
                    className: 'toast-error', // Custom class for red color
                });
            })
            .catch(err => {
                console.error('Error deleting request:', err);
                toast.error('Failed to delete the request', {
                    position: toast.POSITION.TOP_CENTER,
                    autoClose: 3000, // 3 seconds
                });
            });
    }

    return (
        <div className="p-4">
            <h2 className="text-3xl font-bold text-center mb-8 text-blue-600">All Requests</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {requests.map(request => (
                    <div key={request.id} className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold mb-2 text-gray-800">{request.yourName}</h2>
                        <p className="text-gray-500 text-sm mb-2">{request.yourEmail}</p>
                        <p className="text-gray-900 text-base mb-2">{request.messageToDriver}</p>
                        <p className="text-gray-500 text-sm mb-4">Ride ID: {request.rideId}</p>
                        <div className="flex justify-center">
                            <Link to={`/edit-request/${request._id}`} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
                                Edit
                            </Link>
                            <button
                                onClick={() => deleteRequest(request._id)}
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <ToastContainer />
        </div>
    );
}

export default AllRequests;

