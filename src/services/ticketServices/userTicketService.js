// ShipWale\src\services\ticketServices\userTicketService.js

import axios from "axios";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        throw new Error("Authentication token not found. Please log in.");
    }
    return {
        Authorization: `${token}`,
        "Content-Type": "application/json",
    };
};

export const fetchUserTickets = async () => {
    // --- ADDED ENVIRONMENT VARIABLE LOOKUP ---
    const VITE_APP_API_URL = import.meta.env.VITE_APP_API_URL;
    // -----------------------------------------
    try {
        const response = await axios.get(
            // --- UPDATED URL ---
            `${VITE_APP_API_URL}/support/tickets`,
            { headers: getAuthHeaders() }
        );
        return response.data.tickets;
    } catch (error) {
        console.error("Error fetching user tickets:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to fetch tickets.");
    }
};

export const fetchTicketDetails = async (ticketId) => {
    // --- ADDED ENVIRONMENT VARIABLE LOOKUP ---
    const VITE_APP_API_URL = import.meta.env.VITE_APP_API_URL;
    // -----------------------------------------
    try {
        const response = await axios.get(
            // --- UPDATED URL ---
            `${VITE_APP_API_URL}/support/tickets/${ticketId}`,
            { headers: getAuthHeaders() }
        );
        return response.data.ticket;
    } catch (error) {
        console.error(`Error fetching ticket ${ticketId} details:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || `Failed to fetch ticket #${ticketId}.`);
    }
};

// --- NEW CONVERSATION FUNCTIONS ---

export const fetchTicketMessages = async (ticketId) => {
    const VITE_APP_API_URL = import.meta.env.VITE_APP_API_URL;
    try {
        const response = await axios.get(
            `${VITE_APP_API_URL}/support/tickets/${ticketId}/messages`,
            { headers: getAuthHeaders() }
        );
        return response.data.messages;
    } catch (error) {
        console.error(`Error fetching messages for ticket ${ticketId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || `Failed to fetch conversation history.`);
    }
};

export const submitUserReply = async (ticketId, message) => {
    const VITE_APP_API_URL = import.meta.env.VITE_APP_API_URL;
    try {
        const response = await axios.post(
            `${VITE_APP_API_URL}/support/tickets/${ticketId}/reply`,
            { message },
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error(`Error submitting user reply for ticket ${ticketId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || `Failed to send reply.`);
    }
};