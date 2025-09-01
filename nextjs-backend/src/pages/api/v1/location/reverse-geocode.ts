import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '../../../../middleware/cors';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await corsMiddleware(req, res);

    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed',
      });
    }

    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude values',
      });
    }

    // Mock reverse geocoding response
    // In a real implementation, you would use a service like Google Maps, Mapbox, or OpenStreetMap
    const mockAddress = {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States',
      formatted_address: '123 Main Street, New York, NY 10001, United States',
      coordinates: {
        lat: latitude,
        lng: longitude
      },
      place_id: `mock_place_${latitude}_${longitude}`,
      types: ['street_address']
    };

    return res.status(200).json({
      success: true,
      data: mockAddress,
      message: 'Address found successfully',
    });
  } catch (error) {
    console.error('Reverse geocoding API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export default handler;