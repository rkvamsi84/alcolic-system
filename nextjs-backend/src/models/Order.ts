import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  store: mongoose.Types.ObjectId;
  orderNumber: string;
  items: Array<{
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'paypal' | 'stripe';
  shippingAddress: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    location: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  billingAddress: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  deliveryInstructions?: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  itemCount: number;
  isDelivered: boolean;
  isCancelled: boolean;
  deliveryTime: number;
}

const orderSchema = new Schema<IOrder>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    default: 0
  },
  shipping: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'paypal', 'stripe'],
    required: true
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
        default: [0, 0]
      }
    }
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  deliveryInstructions: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  trackingNumber: String,
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
orderSchema.index({ user: 1 });
orderSchema.index({ store: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shippingAddress.location': '2dsphere' });

// Virtual for item count
orderSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for isDelivered
orderSchema.virtual('isDelivered').get(function() {
  return this.status === 'delivered';
});

// Virtual for isCancelled
orderSchema.virtual('isCancelled').get(function() {
  return this.status === 'cancelled';
});

// Virtual for delivery time
orderSchema.virtual('deliveryTime').get(function() {
  if (this.actualDelivery && this.createdAt) {
    return this.actualDelivery.getTime() - this.createdAt.getTime();
  }
  return 0;
});

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.orderNumber = `ORD-${year}${month}${day}-${random}`;
  }
  next();
});

// Pre-save middleware to update timestamps
orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
orderSchema.statics.findByUser = function(userId: string) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

orderSchema.statics.getUserOrders = function(userId: string) {
  return this.find({ user: userId })
    .populate('user', 'name email phone')
    .populate('store', 'name address')
    .populate('items.product', 'name price images')
    .sort({ createdAt: -1 });
};

orderSchema.statics.findByStore = function(storeId: string) {
  return this.find({ store: storeId }).sort({ createdAt: -1 });
};

orderSchema.statics.findByStatus = function(status: string) {
  return this.find({ status }).sort({ createdAt: -1 });
};

orderSchema.statics.findByPaymentStatus = function(paymentStatus: string) {
  return this.find({ paymentStatus }).sort({ createdAt: -1 });
};

orderSchema.statics.findPendingOrders = function() {
  return this.find({ status: 'pending' }).sort({ createdAt: -1 });
};

orderSchema.statics.findRecentOrders = function(days: number = 7) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return this.find({ createdAt: { $gte: date } }).sort({ createdAt: -1 });
};

orderSchema.statics.findByOrderNumber = function(orderNumber: string) {
  return this.findOne({ orderNumber });
};

// Instance methods
orderSchema.methods.updateStatus = function(newStatus: string) {
  this.status = newStatus;
  if (newStatus === 'delivered') {
    this.actualDelivery = new Date();
  }
  return this.save();
};

orderSchema.methods.updatePaymentStatus = function(newPaymentStatus: string) {
  this.paymentStatus = newPaymentStatus;
  return this.save();
};

orderSchema.methods.cancelOrder = function() {
  this.status = 'cancelled';
  return this.save();
};

orderSchema.methods.addTrackingNumber = function(trackingNumber: string) {
  this.trackingNumber = trackingNumber;
  return this.save();
};

orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((total: number, item: any) => total + item.total, 0);
  this.total = this.subtotal + this.tax + this.shipping - this.discount;
  return this.save();
};

// Export the model
const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);

export default Order;
