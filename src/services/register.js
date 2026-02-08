
import axios from 'axios';
const API_URL = import.meta.env.VITE_APP_API_URL

// Service for requesting registration OTP
export const requestRegistrationOTPService = async (email) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register/otp`, { email });
        return response.data;
    } catch (error) {
        // Propagate user-friendly error from the backend
        throw error.response?.data?.error || 'Failed to request OTP.';
    }
};

// Updated register service to accept and send OTP
const register = async (payload) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, payload);
        return response.data;
    } catch (error) {
        // Returning error message for toast display
        // Assuming backend sends { error: 'message' } for 4xx errors
        throw error.response?.data?.error || error.response?.data?.message || 'Registration failed.';
    }
};
  
export default register;
  