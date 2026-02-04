// ShipWale\src\services\ticketServices\adminTicketService.js

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

export const fetchAllTickets = async () => {
    // --- ADDED ENVIRONMENT VARIABLE LOOKUP ---
    const VITE_APP_API_URL = import.meta.env.VITE_APP_API_URL;
    // -----------------------------------------
    try {
        const response = await axios.get(
            // --- UPDATED URL ---
            `${VITE_APP_API_URL}/support/admin/tickets`,
            { headers: getAuthHeaders() }
        );
        return response.data.tickets;
    } catch (error) {
        console.error("Error fetching ALL tickets for admin:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to fetch admin tickets.");
    }
};

export const updateTicketStatus = async (ticketId, newStatus) => {
    // --- ADDED ENVIRONMENT VARIABLE LOOKUP ---
    const VITE_APP_API_URL = import.meta.env.VITE_APP_API_URL;
    // -----------------------------------------
    try {
        const response = await axios.patch(
            // --- UPDATED URL ---
            `${VITE_APP_API_URL}/support/admin/tickets/${ticketId}/status`,
            { status: newStatus },
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error(`Error updating status for ticket ${ticketId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to update ticket status.");
    }
};

// --- NEW CONVERSATION FUNCTIONS ---

export const adminFetchTicketMessages = async (ticketId) => {
    const VITE_APP_API_URL = import.meta.env.VITE_APP_API_URL;
    try {
        const response = await axios.get(
            `${VITE_APP_API_URL}/support/admin/tickets/${ticketId}/messages`,
            { headers: getAuthHeaders() }
        );
        return response.data.messages;
    } catch (error) {
        console.error(`Error fetching admin messages for ticket ${ticketId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || `Failed to fetch conversation history.`);
    }
};

export const adminSubmitReply = async (ticketId, message, newStatus) => {
    const VITE_APP_API_URL = import.meta.env.VITE_APP_API_URL;
    try {
        const response = await axios.post(
            `${VITE_APP_API_URL}/support/admin/tickets/${ticketId}/reply`,
            { message, newStatus },
            { headers: getAuthHeaders() }
        );
        return response.data;
    } catch (error) {
        console.error(`Error submitting admin reply for ticket ${ticketId}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.message || `Failed to send admin reply.`);
    }
};

// --- NEW ANALYTICS FUNCTION ---

export const fetchTicketAnalytics = async () => {
    const VITE_APP_API_URL = import.meta.env.VITE_APP_API_URL;
    try {
        const response = await axios.get(
            `${VITE_APP_API_URL}/support/admin/analytics`,
            { headers: getAuthHeaders() }
        );
        return response.data.data;
    } catch (error) {
        console.error("Error fetching ticket analytics:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to fetch analytics data.");
    }
};
