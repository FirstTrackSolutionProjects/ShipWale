// ShipWale\src\services\requestRegistrationOTP.js

import axios from 'axios';
const API_URL = import.meta.env.VITE_APP_API_URL;

export const requestRegistrationOTPService = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register/otp`, { email });
        return response.data;
    } catch (error) {
        // Propagate user-friendly error from the backend
        throw error.response?.data?.error || 'Failed to request OTP.';
    }
};