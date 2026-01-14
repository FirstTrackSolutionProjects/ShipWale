import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const BOT_DELAY = 500;

export default function TicketRaise() {
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [step, setStep] = useState("WELCOME");

  // Auto scroll
//   useEffect(() => {
//     setTimeout(() => {
//       bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, 100);
//   }, [messages, currentOptions]);

  // Initial welcome
  useEffect(() => {
    setTimeout(() => {
      addBot("👋 Welcome to Shipwale Support!");
      setTimeout(() => {
        addBot("How can I help you today?");
        setCurrentOptions([
          "Pickup Issue",
          "Delivery Delay",
          "Payment Problem",
          "Other",
        ]);
        setStep("MAIN");
      }, BOT_DELAY);
    }, BOT_DELAY);
  }, []);

  const addBot = (text) =>
    setMessages((prev) => [...prev, { from: "bot", text }]);

  const addUser = (text) =>
    setMessages((prev) => [...prev, { from: "user", text }]);

  const handleOption = (option) => {
    addUser(option);
    setCurrentOptions([]);

    setTimeout(() => {
      if (step === "MAIN") {
        handleMainFlow(option);
      } else if (step === "SOLVED") {
        handleSolved(option);
      }
    }, BOT_DELAY);
  };

  const handleMainFlow = (option) => {
    if (option === "Payment Problem") {
      addBot("Please choose one option:");
      setCurrentOptions(["Payment Failed", "Refund Not Received"]);
    } else {
      addBot("Thanks for the information.");
      askSolved();
    }
  };

  const askSolved = () => {
    setTimeout(() => {
      addBot("Is your problem solved?");
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

  return (
    <div className="h-screen bg-[#efeae2] flex justify-center">
      <div className="w-full max-w-lg flex flex-col bg-[#efeae2] shadow-lg">

        {/* HEADER */}
        <div className="bg-[#075e54] text-white px-4 py-3 flex justify-between items-center">
          <div>
            <p className="font-semibold">Shipwale Support</p>
          
          </div>
          <button onClick={() => navigate("/")} className="text-xl">✕</button>
        </div>

        {/* CHAT BODY */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3 py-2 rounded-xl text-sm max-w-[75%]
                ${msg.from === "user"
                  ? "bg-[#dcf8c6] rounded-br-none"
                  : "bg-white rounded-bl-none"}`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* OPTIONS */}
          {currentOptions.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {currentOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleOption(opt)}
                  className="bg-white border rounded-full py-2 text-sm hover:bg-gray-100"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
