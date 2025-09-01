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

    const { address } = req.query;

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required',
      });
    }

    // Mock geocoding response
    // In a real implementation, you would use a service like Google Maps, Mapbox, or OpenStreetMap
    const addressStr = address as string;
    
    // Generate mock coordinates based on address hash for consistency
    const hash = addressStr.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const lat = 40.7589 + (hash % 1000) / 10000; // NYC area with variation
    const lng = -73.9851 + (hash % 1000) / 10000;

    const mockGeocodingResult = {
      lat,
      lng,
      address: addressStr,
      formatted_address: `${addressStr}, New York, NY, USA`,
      place_id: `mock_place_${Math.abs(hash)}`,
      types: ['street_address'],
      components: {
        street_number: '123',
        route: 'Main Street',
        locality: 'New York',
        administrative_area_level_1: 'NY',
        country: 'United States',
        postal_code: '10001'
      },
      geometry: {
        location: {
          lat,
          lng
        },
        location_type: 'ROOFTOP',
        viewport: {
          northeast: {
            lat: lat + 0.01,
            lng: lng + 0.01
          },
          southwest: {
            lat: lat - 0.01,
            lng: lng - 0.01
          }
        }
      }
    };

    return res.status(200).json({
      success: true,
      data: mockGeocodingResult,
      message: 'Coordinates found successfully',
    });
  } catch (error) {
    console.error('Geocoding API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export default handler;