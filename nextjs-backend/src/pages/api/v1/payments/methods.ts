import { NextApiRequest, NextApiResponse } from 'next';
import { protect } from '@/middleware/auth';
import connectDB from '@/config/database';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return getPaymentMethods(req, res);
  } else if (req.method === 'POST') {
    return addPaymentMethod(req, res);
  } else if (req.method === 'DELETE') {
    return deletePaymentMethod(req, res);
  } else {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
}

async function getPaymentMethods(req: NextApiRequest, res: NextApiResponse) {
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
    const user = await User.findById(userId).select('paymentMethods');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return default payment methods if user has none
    const defaultMethods = [
      {
        id: 'cash',
        type: 'cash',
        name: 'Cash on Delivery',
        isDefault: true
      },
      {
        id: 'card',
        type: 'card',
        name: 'Credit/Debit Card',
        isDefault: false
      },
      {
        id: 'upi',
        type: 'upi',
        name: 'UPI Payment',
        isDefault: false
      }
    ];

    res.status(200).json({
      success: true,
      data: (user as any).paymentMethods || defaultMethods
    });

  } catch (error: any) {
    console.error('Get payment methods error:', error);
    
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

async function addPaymentMethod(req: NextApiRequest, res: NextApiResponse) {
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
    const { type, name, details, isDefault } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize paymentMethods if it doesn't exist
    if (!(user as any).paymentMethods) {
      (user as any).paymentMethods = [];
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      (user as any).paymentMethods = (user as any).paymentMethods.map((method: any) => ({
        ...method,
        isDefault: false
      }));
    }

    const newPaymentMethod = {
      type,
      name,
      details,
      isDefault: isDefault || false
    };

    (user as any).paymentMethods.push(newPaymentMethod);
    await user.save();

    res.status(201).json({
      success: true,
      data: (user as any).paymentMethods
    });

  } catch (error: any) {
    console.error('Add payment method error:', error);
    
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

async function deletePaymentMethod(req: NextApiRequest, res: NextApiResponse) {
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
    const { methodId } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if ((user as any).paymentMethods) {
      (user as any).paymentMethods = (user as any).paymentMethods.filter(
        (method: any) => method._id?.toString() !== methodId
      );
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: (user as any).paymentMethods || []
    });

  } catch (error: any) {
    console.error('Delete payment method error:', error);
    
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