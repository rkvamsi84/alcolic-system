import { NextApiRequest, NextApiResponse } from 'next';
import { corsMiddleware } from '../../../../middleware/cors';

interface Zone {
  id: string;
  name: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  }[];
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: string;
  active: boolean;
  priority: number;
  restrictions?: string[];
  createdAt: string;
  updatedAt: string;
}

// Mock zones data (same as in zones/index.ts)
const mockZones: Zone[] = [
  {
    id: '1',
    name: 'Downtown Core',
    description: 'Central business district and downtown area',
    coordinates: [
      { lat: 40.7589, lng: -73.9851 },
      { lat: 40.7614, lng: -73.9776 },
      { lat: 40.7505, lng: -73.9934 },
      { lat: 40.7489, lng: -73.9857 },
    ],
    deliveryFee: 2.99,
    minimumOrder: 25.00,
    estimatedDeliveryTime: '30-45 minutes',
    active: true,
    priority: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Midtown',
    description: 'Midtown Manhattan area',
    coordinates: [
      { lat: 40.7614, lng: -73.9776 },
      { lat: 40.7736, lng: -73.9566 },
      { lat: 40.7589, lng: -73.9851 },
      { lat: 40.7505, lng: -73.9934 },
    ],
    deliveryFee: 3.99,
    minimumOrder: 30.00,
    estimatedDeliveryTime: '45-60 minutes',
    active: true,
    priority: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Upper East Side',
    description: 'Upper East Side residential area',
    coordinates: [
      { lat: 40.7736, lng: -73.9566 },
      { lat: 40.7831, lng: -73.9712 },
      { lat: 40.7794, lng: -73.9441 },
      { lat: 40.7689, lng: -73.9441 },
    ],
    deliveryFee: 4.99,
    minimumOrder: 35.00,
    estimatedDeliveryTime: '60-75 minutes',
    active: true,
    priority: 3,
    restrictions: ['No deliveries after 10 PM'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper function to check if a point is inside a polygon
function isPointInPolygon(point: { lat: number; lng: number }, polygon: { lat: number; lng: number }[]): boolean {
  const { lat, lng } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;

    if (((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

// Helper function to find zone by coordinates
function findZoneByCoordinates(lat: number, lng: number): Zone | null {
  const point = { lat, lng };
  
  for (const zone of mockZones) {
    if (zone.active && isPointInPolygon(point, zone.coordinates)) {
      return zone;
    }
  }
  
  return null;
}

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

    const zone = findZoneByCoordinates(latitude, longitude);
    
    if (zone) {
      return res.status(200).json({
        success: true,
        zone_data: [zone], // Return as array to match expected format
        message: `Zone found: ${zone.name}`,
      });
    } else {
      return res.status(200).json({
        success: true,
        zone_data: [],
        message: 'No delivery zone found for this location',
      });
    }
  } catch (error) {
    console.error('Zone lookup API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export default handler;