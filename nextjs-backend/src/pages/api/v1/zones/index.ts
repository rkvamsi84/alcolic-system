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

interface DeliveryInfo {
  available: boolean;
  zoneId?: string;
  zoneName?: string;
  deliveryFee: number;
  minimumOrder: number;
  estimatedTime: string;
  restrictions?: string[];
}

// Mock zones data
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
  {
    id: '4',
    name: 'Brooklyn Heights',
    description: 'Brooklyn Heights neighborhood',
    coordinates: [
      { lat: 40.6962, lng: -73.9969 },
      { lat: 40.6981, lng: -73.9924 },
      { lat: 40.6934, lng: -73.9924 },
      { lat: 40.6915, lng: -73.9969 },
    ],
    deliveryFee: 5.99,
    minimumOrder: 40.00,
    estimatedDeliveryTime: '75-90 minutes',
    active: false,
    priority: 4,
    restrictions: ['Weekend deliveries only'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper function to check if a point is inside a polygon
function isPointInPolygon(point: { lat: number; lng: number }, polygon: { lat: number; lng: number }[]): boolean {
  const x = point.lat;
  const y = point.lng;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;

    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
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

    if (req.method === 'GET') {
      const { action, lat, lng, address } = req.query;

      switch (action) {
        case 'validate-delivery':
          if (!lat || !lng) {
            return res.status(400).json({
              success: false,
              message: 'Latitude and longitude are required',
            });
          }

          const zone = findZoneByCoordinates(parseFloat(lat as string), parseFloat(lng as string));
          
          if (zone) {
            const deliveryInfo: DeliveryInfo = {
              available: true,
              zoneId: zone.id,
              zoneName: zone.name,
              deliveryFee: zone.deliveryFee,
              minimumOrder: zone.minimumOrder,
              estimatedTime: zone.estimatedDeliveryTime,
              restrictions: zone.restrictions,
            };
            
            return res.status(200).json({
              success: true,
              data: deliveryInfo,
            });
          } else {
            return res.status(200).json({
              success: true,
              data: {
                available: false,
                deliveryFee: 0,
                minimumOrder: 0,
                estimatedTime: 'Not available',
              },
            });
          }

        case 'delivery-info':
          if (!lat || !lng) {
            return res.status(400).json({
              success: false,
              message: 'Latitude and longitude are required',
            });
          }

          const deliveryZone = findZoneByCoordinates(parseFloat(lat as string), parseFloat(lng as string));
          
          return res.status(200).json({
            success: true,
            data: deliveryZone ? {
              zoneId: deliveryZone.id,
              zoneName: deliveryZone.name,
              deliveryFee: deliveryZone.deliveryFee,
              minimumOrder: deliveryZone.minimumOrder,
              estimatedTime: deliveryZone.estimatedDeliveryTime,
              restrictions: deliveryZone.restrictions || [],
            } : null,
          });

        case 'check-coverage':
          if (!lat || !lng) {
            return res.status(400).json({
              success: false,
              message: 'Latitude and longitude are required',
            });
          }

          const coverageZone = findZoneByCoordinates(parseFloat(lat as string), parseFloat(lng as string));
          
          return res.status(200).json({
            success: true,
            data: {
              covered: !!coverageZone,
              zone: coverageZone,
            },
          });

        case 'geocode':
          if (!address) {
            return res.status(400).json({
              success: false,
              message: 'Address is required',
            });
          }

          // Mock geocoding response
          return res.status(200).json({
            success: true,
            data: {
              lat: 40.7589,
              lng: -73.9851,
              address: address,
              formatted_address: `${address}, New York, NY, USA`,
            },
          });

        default:
          // Get all zones
          const activeZones = mockZones.filter(zone => zone.active);
          return res.status(200).json({
            success: true,
            data: activeZones,
            total: activeZones.length,
          });
      }
    }

    if (req.method === 'POST') {
      const { action, lat, lng, orderAmount, ...data } = req.body;

      if (action === 'validate-delivery') {
        if (!lat || !lng) {
          return res.status(400).json({
            success: false,
            message: 'Latitude and longitude are required',
          });
        }

        const zone = findZoneByCoordinates(parseFloat(lat), parseFloat(lng));
        
        if (zone) {
          const deliveryInfo: DeliveryInfo = {
            available: true,
            zoneId: zone.id,
            zoneName: zone.name,
            deliveryFee: zone.deliveryFee,
            minimumOrder: zone.minimumOrder,
            estimatedTime: zone.estimatedDeliveryTime,
            restrictions: zone.restrictions,
          };
          
          return res.status(200).json({
            success: true,
            data: deliveryInfo,
          });
        } else {
          return res.status(200).json({
            success: true,
            data: {
              available: false,
              deliveryFee: 0,
              minimumOrder: 0,
              estimatedTime: 'Not available',
            },
          });
        }
      }

      if (action === 'check-coverage') {
        if (!lat || !lng) {
          return res.status(400).json({
            success: false,
            message: 'Latitude and longitude are required',
          });
        }

        const coverageZone = findZoneByCoordinates(parseFloat(lat), parseFloat(lng));
        
        return res.status(200).json({
          success: true,
          data: {
            covered: !!coverageZone,
            zone: coverageZone,
          },
        });
      }

      if (action === 'create') {
        const {
          name,
          description,
          coordinates,
          deliveryFee,
          minimumOrder,
          estimatedDeliveryTime,
          active = true,
          priority = 999,
          restrictions
        } = data;

        if (!name || !coordinates || !deliveryFee || !minimumOrder || !estimatedDeliveryTime) {
          return res.status(400).json({
            success: false,
            message: 'Name, coordinates, deliveryFee, minimumOrder, and estimatedDeliveryTime are required',
          });
        }

        const newZone: Zone = {
          id: (mockZones.length + 1).toString(),
          name,
          description: description || '',
          coordinates,
          deliveryFee,
          minimumOrder,
          estimatedDeliveryTime,
          active,
          priority,
          restrictions,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        mockZones.push(newZone);

        return res.status(201).json({
          success: true,
          data: newZone,
          message: 'Zone created successfully',
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid action',
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
    });
  } catch (error) {
    console.error('Zones API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

export default handler;