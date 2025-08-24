// This file must be saved in 'netlify/functions/send-whatsapp.js'
// This is the backend function that will securely handle the WhatsApp API call.

// You must set your WhatsApp API token as a Netlify Environment Variable.
// Key: WHATSAPP_API_TOKEN
// Value: [Your WhatsApp Business Platform API Key]
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;

// This is your WhatsApp Business Account's Phone Number ID.
// Set it as a Netlify Environment Variable.
// Key: WHATSAPP_PHONE_NUMBER_ID
// Value: [Your Phone Number ID]
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  const { to, text } = JSON.parse(event.body);

  if (!to || !text) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing "to" or "text" in the request body' }),
    };
  }

  // The WhatsApp Cloud API endpoint.
  const apiUrl = `https://graph.facebook.com/v15.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'text',
    text: {
      body: text,
    },
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API Error:', data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ message: 'Failed to send WhatsApp message', details: data }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'WhatsApp message sent successfully', data: data }),
    };
  } catch (error) {
    console.error('Serverless Function Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
