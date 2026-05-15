import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import LoginButton from './auth/LoginButton';
import LogoutButton from './auth/LogoutButton';
import logo from '../assets/images/carpooly-logo.png';

const Navbar = () => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const userFirstName = isAuthenticated && user && user.name ? user.name.split(' ')[0] : '';
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    const fetchNotifications = useCallback(async () => {
        if (isAuthenticated && user?.email) {
            try {
                const res = await axios.get(`http://localhost:3001/notifications?email=${encodeURIComponent(user.email)}`);
                setNotifications(res.data);
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
            }
        }
    }, [isAuthenticated, user?.email]);

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const intervalId = setInterval(fetchNotifications, 30000);
        return () => clearInterval(intervalId);
    }, [fetchNotifications]);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id, rideId) => {
        try {
            await axios.patch(`http://localhost:3001/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setShowNotifications(false);
            if (rideId) {
                navigate(`/rides/${rideId}`);
            }
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        if (!isAuthenticated || !user?.email) return;
        try {
            await axios.patch(`http://localhost:3001/notifications/mark-all-read?email=${encodeURIComponent(user.email)}`);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    return (
        <nav className="bg-gray-800 p-4 sticky top-0 z-50">
            <div className="container mx-auto px-16 flex justify-between items-center">
                <div>
                    <Link to="/">
                        <img className="h-8" src={logo} alt="Logo" />
                    </Link>
                </div>
                <div className="space-x-4 flex items-center">
                    <Link to="/user-dashboard" className="text-white hover:text-gray-300">
                        User Dashboard
                    </Link>
                    {isAuthenticated && user && (
                        <Link to="/profile" className="text-white hover:text-gray-300">
                            Profile
                        </Link>
                    )}
                    {isAuthenticated && user && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative text-white hover:text-gray-300 focus:outline-none p-2 mt-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200">
                                    <div className="py-2 px-4 bg-gray-50 flex justify-between items-center border-b border-gray-200">
                                        <span className="text-sm font-semibold text-gray-700">Notifications</span>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllAsRead} className="text-xs text-indigo-600 hover:text-indigo-800">
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-center text-sm text-gray-500">No notifications yet.</div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div 
                                                    key={notif._id} 
                                                    onClick={() => markAsRead(notif._id, notif.rideId)}
                                                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-indigo-50/50' : ''}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {!notif.read && <div className="w-2 h-2 mt-1.5 rounded-full bg-indigo-600 flex-shrink-0"></div>}
                                                        <div>
                                                            <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                                                                {notif.message}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {new Date(notif.createdAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {isAuthenticated && user && (
                        <div className="flex items-center">
                            <div className="h-8 w-8 flex items-center justify-center bg-blue-500 text-white rounded-full text-sm mr-4">
                                {userFirstName[0] || 'U'}
                            </div>
                            <LogoutButton />
                        </div>
                    )}
                    {!isAuthenticated && !isLoading && <LoginButton />}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
