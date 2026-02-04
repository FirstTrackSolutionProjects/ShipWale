// ShipWale\src\services\ticketServices\raiseTicketService.js

import axios from "axios";

/**
 * Submits a new support ticket to the backend.
 * This function requires an authenticated user (JWT in localStorage).
 * 
 * @param {object} data - { category, subCategory, description, orderId }
 * @returns {Promise<object>} - The API response object.
 */
export const raiseTicketService = async (data) => {
    const VITE_APP_API_URL = import.meta.env.VITE_APP_API_URL; // Get API URL from environment
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication token not found.");
        }

        const response = await axios.post(
            `${VITE_APP_API_URL}/support/ticket/raise`, // Use the variable here
            data,
            {
                headers: {
                    Authorization: `${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // API should return success: true
        if (response.data.success) {
            return response.data;
        } else {
            // Throw the specific error message from the backend
            throw new Error(response.data.message || "Ticket submission failed.");
        }
    } catch (error) {
        // Log the error for debugging
        console.error("Error in raiseTicketService:", error.response?.data || error.message);
        
        // Re-throw a standardized error message
        throw new Error(error.response?.data?.message || error.message || "Could not connect to the server to raise ticket.");
    }
};