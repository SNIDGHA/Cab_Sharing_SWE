import Axios from 'axios';
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function PostForm() {
    const { id } = useParams();
    const url = "http://localhost:3001/requests";
    const [data, setData] = useState({
        yourName: "",
        yourEmail: "",
        messageToDriver: "",
        rideId: id
    });
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();

    function submit(e) {
        e.preventDefault();
        Axios.post(url, {
            yourName: data.yourName,
            yourEmail: data.yourEmail,
            messageToDriver: data.messageToDriver,
            rideId: id
        })
            .then(res => {
                console.log(res.data);
                setSuccess(true);
                setTimeout(() => {
                    navigate('/all-requests'); // Redirect to all requests page after 2 seconds
                }, 2000);
            })
            .catch(err => {
                console.error('Error:', err);
                setSuccess(false);
            });
    }

    function handle(e) {
        const newData = { ...data };
        newData[e.target.id] = e.target.value;
        setData(newData);
        console.log(newData);
    }

    return (
        <div className="mx-auto max-w-md w-full my-8">
            <div className="bg-white p-8 rounded shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">Submit Your Request</h2>
                {success === false && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error!</strong>
                        <br/>
                        <span className="block sm:inline">Submission failed.</span>
                    </div>
                )}
                {success === true && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Success!</strong>
                        <br/>
                        <span className="block sm:inline">Request successfully made. Redirecting to requests page...</span>
                    </div>
                )}
                {success !== false && (
                    <div className="mb-4">
                        <p className="text-gray-700 mb-4 text-center">Please fill out the form below to submit your request.</p>
                    </div>
                )}
                <form onSubmit={(e) => submit(e)}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="yourName">
                            Your Name
                        </label>
                        <input
                            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="yourName"
                            type="text"
                            value={data.yourName}
                            onChange={(e) => handle(e)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="yourEmail">
                            Your Email
                        </label>
                        <input
                            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="yourEmail"
                            type="text"
                            value={data.yourEmail}
                            onChange={(e) => handle(e)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="messageToDriver">
                            Message to Driver
                        </label>
                        <input
                            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="messageToDriver"
                            type="text"
                            value={data.messageToDriver}
                            onChange={(e) => handle(e)}
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
            </div>
        </div>
    );
}

export default PostForm;

