// ShipWale\src\components\TicketChatbot.jsx

import { useEffect, useRef, useState } from "react";
// Removed useNavigate
import { toast } from 'react-toastify'; 
import { raiseTicketService } from "../services/ticketServices/raiseTicketService"; 

const BOT_DELAY = 500;

// The OPTIONS constant remains here
const OPTIONS = {
  "Pickup Issue": {
    options: [
      "Pickup not attempted",
      "Pickup delayed",
      "Pickup cancelled by courier",
      "Pickup reschedule request",
    ],
    replies: {
      "Pickup not attempted":
        "We’re checking why the pickup was not attempted and will update you shortly.",
      "Pickup delayed":
        "We apologize for the delay. We’re coordinating with the courier partner.",
      "Pickup cancelled by courier":
        "We’re reviewing the pickup cancellation and will assist you further.",
      "Pickup reschedule request":
        "Sure. We’ll help you reschedule the pickup at the earliest.",
    },
  },

  "Delivery Delay": {
    options: [
      "Delivery delayed beyond SLA",
      "Shipment pending at delivery center",
      "Delivery attempt unsuccessful",
      "Delivery reschedule request",
    ],
    replies: {
      "Delivery delayed beyond SLA":
        "We’re sorry for the delay. We’re checking the shipment status.",
      "Shipment pending at delivery center":
        "Your shipment is being reviewed at the delivery center.",
      "Delivery attempt unsuccessful":
        "We’ll coordinate with the courier to reattempt delivery.",
      "Delivery reschedule request":
        "We’ll assist you in rescheduling the delivery.",
    },
  },

  "COD / Payment Issue": {
    options: [
      "COD amount mismatch",
      "COD remittance pending",
      "COD not received for delivered order",
      "Payment issue with cancelled shipment",
    ],
    replies: {
      "COD amount mismatch":
        "We’ll verify the COD amount details for your shipment.",
      "COD remittance pending":
        "COD remittance is under review. We’ll update you shortly.",
      "COD not received for delivered order":
        "We’re checking the delivery and payment confirmation.",
      "Payment issue with cancelled shipment":
        "We’ll verify the payment status for the cancelled shipment.",
    },
  },

  "Wallet Recharge Issue": {
    options: [
      "Wallet recharge failed",
      "Recharge successful but balance not updated",
      "Incorrect wallet balance",
      "Wallet transaction statement required",
    ],
    replies: {
      "Wallet recharge failed":
        "We’re checking the wallet recharge status.",
      "Recharge successful but balance not updated":
        "We’ll verify the transaction and update your wallet balance.",
      "Incorrect wallet balance":
        "We’re reviewing your wallet transactions.",
      "Wallet transaction statement required":
        "We’ll help you with the wallet transaction details.",
    },
  },

  "Weight Dispute": {
    options: [
      "Incorrect charged weight",
      "Weight updated after pickup",
      "Weight dispute for delivered shipment",
      "Request weight verification",
    ],
    replies: {
      "Incorrect charged weight":
        "We’ll verify the charged weight for your shipment.",
      "Weight updated after pickup":
        "We’re checking the weight update details with the courier.",
      "Weight dispute for delivered shipment":
        "We’re reviewing the applied weight charges.",
      "Request weight verification":
        "We’ll initiate a weight verification request.",
    },
  },

  "Pricing / Tracking Issue": {
    options: [
      "Unexpected shipment charges",
      "Rate calculation incorrect",
      "Tracking not updated",
      "Tracking details incorrect",
    ],
    replies: {
      "Unexpected shipment charges":
        "We’ll review the charges applied to your shipment.",
      "Rate calculation incorrect":
        "We’re verifying the rate calculation.",
      "Tracking not updated":
        "We’re checking the latest tracking status.",
      "Tracking details incorrect":
        "We’ll review and correct the tracking details.",
    },
  },
};

// Accepts onClose prop instead of using useNavigate
export default function TicketChatbot({ onClose }) {
  // Removed const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [step, setStep] = useState("WELCOME");
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentSubCategory, setCurrentSubCategory] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false); 

  const addBot = (text) =>
    setMessages((prev) => [...prev, { from: "bot", text }]);

  const addUser = (text) =>
    setMessages((prev) => [...prev, { from: "user", text }]);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  useEffect(() => {
    setTimeout(() => {
      addBot("👋 Welcome to Shipwale Support!");
      setTimeout(() => {
        addBot("How can I help you?");
        setCurrentOptions([
          "Pickup Issue",
          "Delivery Delay",
          "COD / Payment Issue",
          "Wallet Recharge Issue",
          "Weight Dispute",
          "Pricing / Tracking Issue",
          "Other",
        ]);
        setStep("MAIN");
      }, BOT_DELAY);
    }, BOT_DELAY);
  }, []);


  const submitTicket = async (category, subCategory, description) => {
    setIsLoading(true);
    
    toast.info("Attempting to create ticket...");

    const data = {
        category,
        subCategory,
        description,
    };

    console.log("Submitting Payload:", data); 

    try {
        const response = await raiseTicketService(data);
        addBot(`📝 Ticket #${response.ticketId} created successfully. Our team will contact you.`);
        toast.success(`Ticket ${response.ticketId} Raised!`);
        // Use onClose instead of navigate
        setTimeout(() => onClose(), 2000); 
    } catch (error) {
        console.error("Ticket Submission Failed:", error); 
        addBot("❌ Failed to create ticket. Please provide a more detailed description below.");
        toast.error(error.message || "Ticket creation failed.");
        setIsLoading(false);
        setStep("DETAILS"); 
        setShowInput(true);
    }
  };

  const askSolved = () => {
    setTimeout(() => {
      addBot("Is your issue resolved?");
      setCurrentOptions(["Yes", "No"]);
      setStep("SOLVED");
    }, BOT_DELAY);
  };


  const handleOption = (option) => {
    if (isLoading) return; 
    addUser(option);
    setCurrentOptions([]);

    setTimeout(() => {
      if (step === "MAIN") {
        if (option === "Other") {
          setCurrentCategory(option);
          addBot("Please describe your issue below:");
          setStep("DETAILS"); 
          setShowInput(true);
        } else {
          setCurrentCategory(option);
          addBot("Please select one option:");
          setCurrentOptions(OPTIONS[option].options);
          setStep("SUB");
        }
      } else if (step === "SUB") {
        setCurrentSubCategory(option); 
        addBot(OPTIONS[currentCategory].replies[option]);
        askSolved(); 
      } else if (step === "SOLVED") {
        handleSolved(option);
      }
    }, BOT_DELAY);
  };

  const handleSolved = (answer) => {
    if (answer === "Yes") {
      addBot("🙏 Thank you for contacting Shipwale Support!");
      // Use onClose instead of navigate
      setTimeout(() => onClose(), 2000); 
    } else {
      addBot("Please provide a detailed description for our team to create the ticket:");
      setStep("DETAILS"); 
      setShowInput(true);
    }
  };

  const submitDetails = () => {
    if (!inputText.trim() || isLoading) return;
    
    addUser(inputText);
    setShowInput(false);
    
    const category = currentCategory === 'Other' ? 'Other' : currentCategory;
    const subCategory = currentCategory === 'Other' ? null : currentSubCategory;
    const description = inputText.trim();

    setInputText("");
    submitTicket(category, subCategory, description);
  };

  return (
    // Removed full screen styling wrappers, leaving only the inner chat logic
    <div className="w-full h-full flex flex-col bg-[#efeae2] overflow-hidden">
      
        {/* CHAT BODY */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`px-3 py-2 rounded-xl text-sm max-w-[75%]
                ${msg.from === "user" ? "bg-[#dcf8c6]" : "bg-white"}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {currentOptions.length > 0 && !isLoading && (
            <div className="grid grid-cols-2 gap-2">
              {currentOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleOption(opt)}
                  className="bg-white border rounded-full py-2 text-sm hover:bg-gray-100 transition"
                  disabled={isLoading}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {showInput && !isLoading && (
            <div className="flex gap-2 mt-2">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your issue here..."
                className="flex-1 px-3 py-2 rounded border"
                disabled={isLoading}
              />
              <button
                onClick={submitDetails}
                className="bg-[#075e54] text-white px-4 rounded disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          )}
          
          {/* Display loading message if submitting a ticket */}
          {isLoading && (
            <div className="flex justify-start">
                <div className="px-3 py-2 rounded-xl text-sm max-w-[75%] bg-white text-gray-600">
                    Submitting your ticket...
                </div>
            </div>
          )}


          <div ref={bottomRef} />
        </div>
    </div>
  );
}