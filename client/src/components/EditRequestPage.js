import React, { useEffect, useState } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import Axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



const EditRequestPage = () => {
    const { rideId } = useParams();
    const [request, setRequest] = useState({});
    const [formData, setFormData] = useState({
        yourName: '',
        yourEmail: '',
        messageToDriver: ''
        // Add more fields as needed
    });

    const navigate = useNavigate();

    useEffect(() => {
        Axios.get(`${process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}`}/requests/${rideId}`)
            .then(res => {
                setRequest(res.data);
                setFormData({
                    yourName: res.data.yourName,
                    yourEmail: res.data.yourEmail,
                    messageToDriver: res.data.messageToDriver
                    // Set other form fields accordingly
                });
            })
            .catch(err => {
                console.error('Error:', err);
            });
    }, [rideId]);

    const handleChange = e => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = e => {
        e.preventDefault();
        const config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };
        Axios.put(`${process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}`}/requests/${rideId}`, formData, config)
            .then(res => {
                console.log('Request updated:', res.data);
                navigate('/all-requests'); // Redirect to "/all-requests" after successful submission
                toast.success('Changes saved successfully', {
                    position: toast.POSITION.TOP_CENTER,
                    autoClose: 3000, // 3 seconds
                });
            })
            .catch(err => {
                console.error('Error:', err);
            });
    };

    return (
        <div className="min-h-screen py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
                    <div className="max-w-md mx-auto">
                        <div className="flex items-center space-x-5">
                            <div className="h-14 w-14 bg-indigo-500 rounded-full flex flex-shrink-0 justify-center items-center text-white text-2xl font-mono">
                                E
                            </div>
                            <div className="block pl-2 font-semibold text-xl self-start text-gray-700">
                                <h2 className="leading-relaxed">Edit Request - {rideId}</h2>
                            </div>
                        </div>
                        <form onSubmit={handleSubmit} className="mt-10">
                            <div className="relative">
                                <label htmlFor="yourName" className="leading-7 text-sm text-gray-600">Your Name</label>
                                <input
                                    type="text"
                                    id="yourName"
                                    name="yourName"
                                    value={formData.yourName}
                                    onChange={handleChange}
                                    className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                                />
                                <span className="text-xs text-gray-500">Previous Value: {request.yourName}</span>
                            </div>
                            <div className="relative mt-4">
                                <label htmlFor="yourEmail" className="leading-7 text-sm text-gray-600">Your Email</label>
                                <input
                                    type="email"
                                    id="yourEmail"
                                    name="yourEmail"
                                    value={formData.yourEmail}
                                    onChange={handleChange}
                                    className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                                />
                                <span className="text-xs text-gray-500">Previous Value: {request.yourEmail}</span>
                            </div>
                            <div className="relative mt-4">
                                <label htmlFor="messageToDriver" className="leading-7 text-sm text-gray-600">Message to Driver</label>
                                <textarea
                                    id="messageToDriver"
                                    name="messageToDriver"
                                    value={formData.messageToDriver}
                                    onChange={handleChange}
                                    className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-indigo-500 focus:bg-transparent focus:ring-2 focus:ring-indigo-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
                                ></textarea>
                                <span className="text-xs text-gray-500">Previous Value: {request.messageToDriver}</span>
                            </div>
                            {/* Add more form fields as needed */}
                            <button
                                type="submit"
                                className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg mt-5"
                            >
                                Save Changes
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditRequestPage;

