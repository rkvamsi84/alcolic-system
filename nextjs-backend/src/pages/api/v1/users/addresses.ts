import { NextApiRequest, NextApiResponse } from 'next';
import { protect } from '@/middleware/auth';
import connectDB from '@/config/database';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getAddresses(req, res);
  } else if (req.method === 'POST') {
    return addAddress(req, res);
  } else if (req.method === 'PUT') {
    return updateAddress(req, res);
  } else if (req.method === 'DELETE') {
    return deleteAddress(req, res);
  } else {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
}

async function getAddresses(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Protect route
    await new Promise((resolve, reject) => {
      protect(req, res, (err?: any) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    // Connect to database
    await connectDB();

    const userId = (req as any).user.id;
    const user = await User.findById(userId).select('addresses');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user.addresses || []
    });

  } catch (error: any) {
    console.error('Get addresses error:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

async function addAddress(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Protect route
    await new Promise((resolve, reject) => {
      protect(req, res, (err?: any) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    // Connect to database
    await connectDB();

    const userId = (req as any).user.id;
    const { type, address, city, state, zipCode, country, isDefault } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      user.addresses = user.addresses?.map(addr => ({ ...addr, isDefault: false })) || [];
    }

    const newAddress = {
      type,
      address,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || false
    };

    user.addresses = user.addresses || [];
    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({
      success: true,
      data: user.addresses
    });

  } catch (error: any) {
    console.error('Add address error:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

async function updateAddress(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Protect route
    await new Promise((resolve, reject) => {
      protect(req, res, (err?: any) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    // Connect to database
    await connectDB();

    const userId = (req as any).user.id;
    const { addressId } = req.query;
    const { type, address, city, state, zipCode, country, isDefault } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const addressIndex = user.addresses?.findIndex(addr => addr._id?.toString() === addressId);
    if (addressIndex === -1 || addressIndex === undefined) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      user.addresses = user.addresses?.map(addr => ({ ...addr, isDefault: false })) || [];
    }

    // Update the address
    if (user.addresses && user.addresses[addressIndex]) {
      user.addresses[addressIndex] = {
        ...user.addresses[addressIndex],
        type,
        address,
        city,
        state,
        zipCode,
        country,
        isDefault: isDefault || false
      };
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user.addresses
    });

  } catch (error: any) {
    console.error('Update address error:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}

async function deleteAddress(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Protect route
    await new Promise((resolve, reject) => {
      protect(req, res, (err?: any) => {
        if (err) reject(err);
        else resolve(true);
      });
    });

    // Connect to database
    await connectDB();

    const userId = (req as any).user.id;
    const { addressId } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.addresses = user.addresses?.filter(addr => addr._id?.toString() !== addressId) || [];
    await user.save();

    res.status(200).json({
      success: true,
      data: user.addresses
    });

  } catch (error: any) {
    console.error('Delete address error:', error);
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}