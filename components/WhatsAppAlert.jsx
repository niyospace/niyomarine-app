import React, { useState } from 'react';

// This is a simple React component that provides a button to trigger a WhatsApp alert.
// You'll need to integrate this component into your existing Next.js app.

export default function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendWhatsAppAlert = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('Sending alert...');

    // We're making a secure call to our Netlify Serverless Function.
    // The endpoint is '/.netlify/functions/send-whatsapp'.
    // Netlify handles the routing automatically.
    try {
      const response = await fetch('/.netlify/functions/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // The body contains the data our serverless function needs:
        // 'to' is the recipient's phone number.
        // 'text' is the message content.
        body: JSON.stringify({ to: phoneNumber, text: message }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus(`Success! Message ID: ${data.data.messages[0].id}`);
      } else {
        // If the serverless function returns an error, we display it here.
        setStatus(`Error: ${data.message}`);
        console.error('API Error Details:', data.details);
      }
    } catch (error) {
      // Catch network or other general errors.
      setStatus('Failed to connect to the server.');
      console.error('Fetch Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4 font-sans">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-teal-400">WhatsApp Alert</h1>
        <form onSubmit={sendWhatsAppAlert} className="space-y-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">
              Recipient Phone Number (with country code)
            </label>
            <input
              id="phoneNumber"
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 block w-full p-3 bg-gray-700 text-white rounded-md border-gray-600 focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., +919876543210"
              required
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-300">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              className="mt-1 block w-full p-3 bg-gray-700 text-white rounded-md border-gray-600 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Your alert message goes here..."
              required
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 rounded-md font-semibold text-lg transition-colors duration-200 ease-in-out ${
              isLoading
                ? 'bg-teal-700 cursor-not-allowed'
                : 'bg-teal-500 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-900'
            }`}
          >
            {isLoading ? 'Sending...' : 'Send WhatsApp Alert'}
          </button>
        </form>
        {status && (
          <div className="mt-4 p-4 text-center rounded-md bg-gray-700">
            <p className="text-sm">{status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
