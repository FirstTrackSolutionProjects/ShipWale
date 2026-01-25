// ShipWale\src\pages\Support.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserTickets } from '../services/ticketServices/userTicketService';
import { toast } from 'react-toastify'; 

// Helper function for styling ticket status
const getStatusClasses = (status) => {
    switch (status) {
        case 'OPEN':
            return 'bg-yellow-100 text-yellow-800';
        case 'IN_PROGRESS':
            return 'bg-blue-100 text-blue-800';
        case 'RESOLVED':
            return 'bg-green-100 text-green-800';
        case 'CLOSED':
            return 'bg-gray-200 text-gray-700';
        default:
            return 'bg-gray-500 text-white';
    }
};

export default function UserSupportPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // --- NEW HANDLER ---
    const handleRaiseNewTicket = () => {
        // Dispatch event to open the floating chat window
        window.dispatchEvent(new CustomEvent('OPEN_SUPPORT_CHAT'));
    };
    // --- END NEW HANDLER ---

    useEffect(() => {
        const loadTickets = async () => {
            try {
                const data = await fetchUserTickets();
                setTickets(data);
            } catch (error) {
                toast.error(error.message);
                // Redirect if unauthorized or other critical error
                if (error.message.includes("log in")) { 
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        loadTickets();
    }, [navigate]);

    const handleViewTicket = (ticketId) => {
        // Since we removed the top-level route, this navigation is now relative to /dashboard, which is correct.
        navigate(`/dashboard/support/${ticketId}`);
    };

    if (loading) {
        return <div className="p-8 text-center">Loading support tickets...</div>;
    }
    
    // Fallback if no tickets exist
    if (tickets.length === 0) {
        return (
            <div className="p-8 text-center bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Your Support Tickets</h2>
                <p className="text-gray-600">You have no active or historical tickets.</p>
                <button 
                    onClick={handleRaiseNewTicket} // <-- FIXED
                    className="mt-4 bg-[#075e54] text-white py-2 px-4 rounded hover:bg-green-700 transition"
                >
                    Raise a New Ticket
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Your Support Tickets</h1>
            <div className="space-y-4">
                {tickets.map((ticket) => (
                    <div 
                        key={ticket.ticket_id} 
                        className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer flex justify-between items-center"
                        onClick={() => handleViewTicket(ticket.ticket_id)}
                    >
                        <div>
                            <p className="text-sm font-medium text-gray-500">Ticket #{ticket.ticket_id}</p>
                            <h2 className="text-lg font-semibold text-gray-700">{ticket.category}</h2>
                            <p className="text-gray-500 truncate max-w-sm">{ticket.sub_category || ticket.description}</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClasses(ticket.status)} mb-2`}>
                                {ticket.status.replace('_', ' ')}
                            </span>
                            <p className="text-xs text-gray-400">
                                Opened: {new Date(ticket.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <button 
                onClick={handleRaiseNewTicket} // <-- FIXED
                className="mt-6 bg-[#075e54] text-white py-2 px-4 rounded hover:bg-green-700 transition"
            >
                Raise a New Ticket
            </button>
        </div>
    );
}
