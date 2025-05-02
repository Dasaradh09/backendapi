const axios = require('axios');

const SHIPENGINE_API_KEY = process.env.SHIPENGINE_API_KEY;

const getTrackingInfo = async (carrierCode, trackingNumber) => {
  try {
    const response = await axios.get('https://api.shipengine.com/v1/tracking', {
      headers: {
        'API-Key': SHIPENGINE_API_KEY
      },
      params: {
        carrier_code: carrierCode,
        tracking_number: trackingNumber
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching tracking info:', error.message);
    throw error;
  }
};

module.exports = { getTrackingInfo };
