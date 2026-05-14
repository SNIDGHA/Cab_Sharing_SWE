import React, { useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import axios from 'axios';

const CreateProfile = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const createProfile = async () => {
      try {
        await axios.post('/profiles', {
          name: user.name,
          email: user.email,
          displayName: user.name,
          bio: '',
        });
      } catch (error) {
        console.error('Error creating profile:', error);
      }
    };

    if (isAuthenticated && user) {
      createProfile();
    }
  }, [isAuthenticated, user]);

  return null;
};

export default CreateProfile;
