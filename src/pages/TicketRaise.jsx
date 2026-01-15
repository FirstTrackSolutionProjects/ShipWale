import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const BOT_DELAY = 500;

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

export default function TicketRaise() {
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [step, setStep] = useState("WELCOME");
  const [currentCategory, setCurrentCategory] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [inputText, setInputText] = useState("");

  const addBot = (text) =>
    setMessages((prev) => [...prev, { from: "bot", text }]);

  const addUser = (text) =>
    setMessages((prev) => [...prev, { from: "user", text }]);

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

  const handleOption = (option) => {
    addUser(option);
    setCurrentOptions([]);

    setTimeout(() => {
      if (step === "MAIN") {
        if (option === "Other") {
          addBot("Please describe your issue below:");
          setShowInput(true);
        } else {
          setCurrentCategory(option);
          addBot("Please select one option:");
          setCurrentOptions(OPTIONS[option].options);
          setStep("SUB");
        }
      } else if (step === "SUB") {
        addBot(OPTIONS[currentCategory].replies[option]);
        askSolved();
      } else if (step === "SOLVED") {
        handleSolved(option);
      }
    }, BOT_DELAY);
  };

  const askSolved = () => {
    setTimeout(() => {
      addBot("Is your issue resolved?");
      setCurrentOptions(["Yes", "No"]);
      setStep("SOLVED");
    }, BOT_DELAY);
  };

  const handleSolved = (answer) => {
    if (answer === "Yes") {
      addBot("🙏 Thank you for contacting Shipwale Support!");
    } else {
      addBot("📝 Ticket created successfully. Our team will contact you.");
      setTimeout(() => navigate("/"), 2000);
    }
  };

  const submitOtherIssue = () => {
    if (!inputText.trim()) return;
    addUser(inputText);
    setShowInput(false);
    setInputText("");
    addBot("📝 Ticket created successfully. Our team will contact you.");
    setTimeout(() => navigate("/"), 2000);
  };

  return (
    <div className="h-screen bg-[#efeae2] flex justify-center">
      <div className="w-full max-w-lg flex flex-col bg-[#efeae2] shadow-lg">

        {/* HEADER */}
        <div className="bg-[#075e54] text-white px-4 py-3 flex justify-between items-center">
          <p className="font-semibold">Shipwale Support</p>
          <button onClick={() => navigate("/")} className="text-xl">✕</button>
        </div>

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

          {currentOptions.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {currentOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleOption(opt)}
                  className="bg-white border rounded-full py-2 text-sm"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {showInput && (
            <div className="flex gap-2 mt-2">
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your issue here..."
                className="flex-1 px-3 py-2 rounded border"
              />
              <button
                onClick={submitOtherIssue}
                className="bg-[#075e54] text-white px-4 rounded"
              >
                Send
              </button>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
