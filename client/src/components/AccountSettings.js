import React from 'react';
import { useAuth } from '../AuthContext';

const AccountSettings = () => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <div className="container mx-auto pt-10">
                <h1 className="text-4xl font-bold text-center mb-8">Account Settings</h1>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Update Profile Information</h2>
                    <div className="mb-4">
                        <label className="text-lg text-gray-800 block mb-2" htmlFor="displayName">Display Name</label>
                        <input
                            className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="displayName"
                            type="text"
                            value={isAuthenticated && user ? user.name : ''}
                            readOnly
                        />
                    </div>
                    <div className="mb-4">
                        <label className="text-lg text-gray-800 block mb-2" htmlFor="bio">Bio</label>
                        <textarea
                            className="border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="bio"
                            rows="4"
                            readOnly
                        ></textarea>
                    </div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline block mx-auto"
                        disabled
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountSettings;
