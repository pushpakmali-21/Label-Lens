import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Mic, MicOff, Volume2, VolumeX } from "lucide-react";

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm your LabelLens Assistant. How can I help you today?", isBot: true }
    ]);
    const [input, setInput] = useState("");

    // Voice Assistant States
    const [isListening, setIsListening] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const recognitionRef = useRef(null);

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = false;
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onresult = (event) => {
                    const transcript = event.results[0][0].transcript;
                    setInput(transcript);
                    handleSend(transcript);
                };

                recognitionRef.current.onerror = (event) => {
                    console.error('Speech recognition error', event.error);
                    setIsListening(false);
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };
            }
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const speak = (text) => {
        if (!voiceEnabled) return;
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.pitch = 1.1;
            utterance.rate = 1.0;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSend = (overrideInput = null) => {
        const textToSend = typeof overrideInput === 'string' ? overrideInput : input;
        if (!textToSend.trim()) return;
        setMessages((prev) => [...prev, { text: textToSend, isBot: false }]);
        setInput("");

        // Simulate bot response
        setTimeout(() => {
            const botResponse = "Thank you for asking! Based on our analysis, this product matches your health profile.";
            setMessages((prev) => [
                ...prev,
                { text: botResponse, isBot: true }
            ]);
            speak(botResponse);
        }, 1000);
    };

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 p-4 bg-brass text-brass-ink rounded-full shadow-glass hover:scale-105 transition-transform z-50 flex items-center justify-center"
                >
                    <MessageSquare size={24} />
                </button>
            )}

            {isOpen && (
                <div className="fixed bottom-6 right-6 w-80 h-96 bg-panel backdrop-blur-glass border border-panel-line rounded-2xl shadow-glass flex flex-col z-50 overflow-hidden text-text-1">
                    <div className="flex justify-between items-center p-4 bg-panel-darker border-b border-panel-line">
                        <h3 className="font-semibold flex items-center gap-2">
                            <MessageSquare size={18} /> LabelLens Assistant
                        </h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setVoiceEnabled(!voiceEnabled)}
                                className={`text-xs p-1.5 rounded-lg transition-colors ${voiceEnabled ? 'bg-citizen-primary/20 text-citizen-primary' : 'bg-status-fail/20 text-status-fail'}`}
                                title={voiceEnabled ? "Voice Output On" : "Voice Output Off"}
                            >
                                {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                            </button>
                            <button onClick={() => setIsOpen(false)} className="text-text-2 hover:text-text-1 transition-colors p-1.5 hover:bg-panel rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}>
                                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.isBot ? "bg-panel-raised border border-panel-line text-text-1" : "bg-brass text-brass-ink"}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 border-t border-panel-line bg-panel-raised flex gap-2 items-center">
                        <button
                            onClick={toggleListening}
                            className={`p-2 rounded-lg transition-all flex-shrink-0 ${isListening ? 'bg-status-fail text-white animate-pulse' : 'bg-panel border border-panel-line text-text-2 hover:text-text-1 hover:border-brass/50'}`}
                            title="Voice Input"
                        >
                            {isListening ? <Mic size={18} /> : <MicOff size={18} />}
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isListening ? "Listening..." : "Ask me anything..."}
                            className="flex-1 bg-panel text-text-1 placeholder:text-text-2 border border-panel-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brass/50 transition-colors min-w-0"
                        />
                        <button onClick={() => handleSend()} className="p-2 bg-brass text-brass-ink rounded-lg hover:scale-105 transition-transform flex-shrink-0">
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
