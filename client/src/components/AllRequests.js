import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PacmanLoader } from 'react-spinners';
import { useAuth } from '../AuthContext';

function AllRequests() {
    const { user, isAuthenticated } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading]   = useState(true);

    // Confirm-delete state
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    useEffect(() => {
        if (isAuthenticated && user?.email) {
            Axios.get(`${process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}`}/requests/by-user?email=${encodeURIComponent(user.email)}`)
                .then(res => {
                    setRequests(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error:', err);
                    setLoading(false);
                });
        } else if (!isAuthenticated) {
            setLoading(false);
        }
    }, [isAuthenticated, user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <PacmanLoader color={'#6366f1'} size={40} />
            </div>
        );
    }

    const confirmDelete = () => {
        const id = pendingDeleteId;
        if (!id) return;
        setPendingDeleteId(null);

        Axios.delete(`${process.env.REACT_APP_API_URL || `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}`}/requests/${id}`)
            .then(() => {
                setRequests(prev => prev.filter(r => r._id !== id));
                toast.success('Request deleted.', {
                    position: toast.POSITION.TOP_CENTER,
                    autoClose: 2500,
                });
            })
            .catch(err => {
                console.error('Error deleting request:', err);
                toast.error('Failed to delete the request.', {
                    position: toast.POSITION.TOP_CENTER,
                    autoClose: 3000,
                });
            });
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-indigo-600">All Requests</h2>

            {/* Empty state */}
            {requests.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '60px 24px',
                    background: '#fff',
                    borderRadius: 16,
                    boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                    maxWidth: 420,
                    margin: '0 auto',
                }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
                        No Requests Made
                    </h3>
                    <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
                        You haven't submitted any ride requests yet. Browse available rides to get started!
                    </p>
                    <Link
                        to="/rides"
                        style={{
                            display: 'inline-block',
                            background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
                            color: '#fff',
                            padding: '10px 24px',
                            borderRadius: 10,
                            fontWeight: 600,
                            fontSize: 14,
                            textDecoration: 'none',
                        }}
                    >
                        Browse Rides →
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {requests.map(request => (
                        <div key={request._id} className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between"
                            style={{ border: '1.5px solid #e2e8f0' }}>
                            <div>
                                <h2 className="text-xl font-bold mb-1 text-gray-800">{request.yourName}</h2>
                                <p className="text-gray-500 text-sm mb-1">{request.yourEmail}</p>
                                {request.messageToDriver && (
                                    <p className="text-gray-700 text-sm mb-2 italic">"{request.messageToDriver}"</p>
                                )}
                                <p className="text-gray-400 text-xs mb-4">Ride ID: {request.rideId}</p>
                            </div>
                            <div className="flex justify-center gap-3 mt-2">
                                <Link
                                    to={`/edit-request/${request._id}`}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => setPendingDeleteId(request._id)}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ——— Delete Confirmation Modal ——— */}
            {pendingDeleteId && (
                <div
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(15,23,42,0.55)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000, padding: 24,
                        animation: 'fadeIn .2s ease',
                    }}
                    onClick={() => setPendingDeleteId(null)}
                >
                    <div
                        style={{
                            background: '#fff', borderRadius: 18, padding: 32,
                            maxWidth: 360, width: '100%',
                            boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
                            animation: 'slideUp .25s ease',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 12 }}>🗑️</div>
                        <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', textAlign: 'center', marginBottom: 8 }}>
                            Delete Request?
                        </h3>
                        <p style={{ fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 28 }}>
                            Are you sure you want to delete this request? This cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={() => setPendingDeleteId(null)}
                                style={{
                                    flex: 1, padding: '11px', borderRadius: 10,
                                    border: '1.5px solid #e2e8f0', background: '#f8fafc',
                                    cursor: 'pointer', fontWeight: 600, fontSize: 14,
                                    fontFamily: 'inherit',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    flex: 1, padding: '11px', borderRadius: 10,
                                    border: 'none', background: '#ef4444',
                                    color: '#fff', cursor: 'pointer',
                                    fontWeight: 600, fontSize: 14,
                                    fontFamily: 'inherit',
                                }}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />

            <style>{`
                @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
            `}</style>
        </div>
    );
}

export default AllRequests;
