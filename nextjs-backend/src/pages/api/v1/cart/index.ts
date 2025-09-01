import { NextApiRequest, NextApiResponse } from 'next';
import { protect } from '@/middleware/auth';
import connectDB from '@/config/database';
import User from '@/models/User';
import Product from '@/models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

    switch (req.method) {
      case 'GET':
        return await getCart(req, res, userId);
      case 'POST':
        return await addToCart(req, res, userId);
      case 'PUT':
        return await updateCartItem(req, res, userId);
      case 'DELETE':
        return await removeFromCart(req, res, userId);
      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error: any) {
    console.error('Cart API error:', error);
    
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

// Get user's cart
async function getCart(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const user = await User.findById(userId).populate({
    path: 'cart.product',
    select: 'name price images category stock isActive'
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Filter out inactive products and calculate totals
  const activeCartItems = user.cart.filter((item: any) => 
    item.product && item.product.isActive
  );

  const cartTotal = activeCartItems.reduce((total: number, item: any) => {
    return total + (item.product.price * item.quantity);
  }, 0);

  const totalItems = activeCartItems.reduce((total: number, item: any) => {
    return total + item.quantity;
  }, 0);

  res.status(200).json({
    success: true,
    data: {
      items: activeCartItems,
      summary: {
        totalItems,
        subtotal: cartTotal,
        total: cartTotal // Can add tax/shipping later
      }
    }
  });
}

// Add item to cart
async function addToCart(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
    });
  }

  // Check if product exists and is active
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Product not found or inactive'
    });
  }

  // Check stock availability
  if (product.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: 'Insufficient stock available'
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Check if item already exists in cart
  const existingItemIndex = user.cart.findIndex(
    (item: any) => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Update quantity if item exists
    const newQuantity = user.cart[existingItemIndex].quantity + quantity;
    
    if (product.stock < newQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock for requested quantity'
      });
    }
    
    user.cart[existingItemIndex].quantity = newQuantity;
  } else {
    // Add new item to cart
    user.cart.push({
      product: productId,
      quantity,
      addedAt: new Date()
    });
  }

  await user.save();

  // Populate and return updated cart
  await user.populate({
    path: 'cart.product',
    select: 'name price images category stock isActive'
  });

  res.status(200).json({
    success: true,
    message: 'Item added to cart successfully',
    data: user.cart
  });
}

// Update cart item quantity
async function updateCartItem(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { productId, quantity } = req.body;

  if (!productId || quantity === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Product ID and quantity are required'
    });
  }

  if (quantity < 0) {
    return res.status(400).json({
      success: false,
      message: 'Quantity cannot be negative'
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const itemIndex = user.cart.findIndex(
    (item: any) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in cart'
    });
  }

  if (quantity === 0) {
    // Remove item if quantity is 0
    user.cart.splice(itemIndex, 1);
  } else {
    // Check stock availability
    const product = await Product.findById(productId);
    if (!product || product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }
    
    user.cart[itemIndex].quantity = quantity;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Cart updated successfully',
    data: user.cart
  });
}

// Remove item from cart
async function removeFromCart(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  const itemIndex = user.cart.findIndex(
    (item: any) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Item not found in cart'
    });
  }

  user.cart.splice(itemIndex, 1);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Item removed from cart successfully',
    data: user.cart
  });
}