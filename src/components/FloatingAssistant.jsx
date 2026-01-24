// ShipWale\src\components\FloatingAssistant.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Assuming you have useAuth hook setup
import { MessageCircle, X } from 'lucide-react'; 
import TicketChatbot from './TicketChatbot'; // Import the new chatbot component

export default function FloatingAssistant() {
    // Check if the user is authenticated (essential requirement)
    const { isAuthenticated } = useAuth(); 
    const [isOpen, setIsOpen] = useState(false);

    // If not authenticated, do not render the button or the chat
    if (!isAuthenticated) {
        return null; 
    }

    const toggleOpen = () => setIsOpen(!isOpen);
    const handleClose = () => setIsOpen(false);

    return (
        // Fixed positioning for the floating element
        <div className="fixed bottom-6 right-6 z-[1000]"> 
            
            {/* Chat Modal Window */}
            {isOpen && (
                <div 
                    className="bg-white shadow-2xl rounded-lg overflow-hidden 
                                w-80 h-[450px] md:w-96 md:h-[600px] 
                                mb-4 border border-gray-200 flex flex-col"
                >
                    {/* Header */}
                    <div className="bg-[#075e54] text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
                        <p className="font-semibold text-sm">Shipwale Support</p>
                        <button onClick={handleClose} className="text-xl hover:text-red-300 transition">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Chatbot Content */}
                    <div className="flex-grow overflow-hidden">
                        <TicketChatbot onClose={handleClose} />
                    </div>
                </div>
            )}

            {/* Floating Button */}
            <button
                onClick={toggleOpen}
                className={`w-14 h-14 rounded-full shadow-lg text-white transition-all duration-300 flex items-center justify-center 
                            ${isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-[#075e54] hover:bg-green-700'}`}
                aria-label={isOpen ? "Close Support Chat" : "Open Support Chat"}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>
        </div>
    );
}