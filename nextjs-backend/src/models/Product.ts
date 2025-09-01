import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: mongoose.Types.ObjectId;
  images: string[];
  brand?: string;
  alcoholContent?: number;
  volume: number;
  unit: 'ml' | 'l' | 'oz' | 'fl oz';
  stock: number;
  sku?: string;
  barcode?: string;
  isActive: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  salePercentage?: number;
  tags: string[];
  ratings: {
    average: number;
    count: number;
  };
  store: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  finalPrice: number;
  discountAmount: number;
  discountPercentage: number;
  isInStock: boolean;
  averageRating: number;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price must be positive']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price must be positive']
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please add a category']
  },
  images: [{
    type: String,
    required: [true, 'Please add at least one image']
  }],
  brand: {
    type: String,
    trim: true
  },
  alcoholContent: {
    type: Number,
    min: [0, 'Alcohol content must be positive'],
    max: [100, 'Alcohol content cannot exceed 100%']
  },
  volume: {
    type: Number,
    required: [true, 'Please add volume'],
    min: [0, 'Volume must be positive']
  },
  unit: {
    type: String,
    enum: ['ml', 'l', 'oz', 'fl oz'],
    default: 'ml'
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  salePercentage: {
    type: Number,
    min: [0, 'Sale percentage must be positive'],
    max: [100, 'Sale percentage cannot exceed 100%']
  },
  tags: [{
    type: String,
    trim: true
  }],
  ratings: {
    average: {
      type: Number,
      min: [0, 'Rating must be positive'],
      max: [5, 'Rating cannot exceed 5'],
      default: 0
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'Store',
    required: [true, 'Please add a store']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ store: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ sku: 1 });
productSchema.index({ barcode: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for final price
productSchema.virtual('finalPrice').get(function() {
  if (this.isOnSale && this.salePercentage) {
    return this.price * (1 - this.salePercentage / 100);
  }
  return this.price;
});

// Virtual for discount amount
productSchema.virtual('discountAmount').get(function() {
  if (this.isOnSale && this.salePercentage) {
    return this.price * (this.salePercentage / 100);
  }
  return 0;
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.isOnSale && this.salePercentage) {
    return this.salePercentage;
  }
  return 0;
});

// Virtual for isInStock
productSchema.virtual('isInStock').get(function() {
  return this.stock > 0;
});

// Virtual for average rating
productSchema.virtual('averageRating').get(function() {
  return this.ratings.average || 0;
});

// Pre-save middleware to update timestamps
productSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-save middleware to set original price if not set
productSchema.pre('save', function(next) {
  if (!this.originalPrice) {
    this.originalPrice = this.price;
  }
  next();
});

// Static methods
productSchema.statics.findByCategory = function(categoryId: string) {
  return this.find({
    category: categoryId,
    isActive: true
  });
};

productSchema.statics.search = function(searchTerm: string) {
  return this.find({
    $text: { $search: searchTerm },
    isActive: true
  });
};

productSchema.statics.findByStore = function(storeId: string) {
  return this.find({
    store: storeId,
    isActive: true
  });
};

productSchema.statics.findFeatured = function() {
  return this.find({
    isActive: true,
    isFeatured: true
  });
};

productSchema.statics.findOnSale = function() {
  return this.find({
    isActive: true,
    isOnSale: true
  });
};

productSchema.statics.findInStock = function() {
  return this.find({
    isActive: true,
    stock: { $gt: 0 }
  });
};

productSchema.statics.searchProducts = function(searchTerm: string) {
  return this.find({
    $text: { $search: searchTerm },
    isActive: true
  });
};

productSchema.statics.findByPriceRange = function(minPrice: number, maxPrice: number) {
  return this.find({
    price: { $gte: minPrice, $lte: maxPrice },
    isActive: true
  });
};

// Instance methods
productSchema.methods.updateStock = function(quantity: number) {
  this.stock = Math.max(0, this.stock - quantity);
  return this.save();
};

productSchema.methods.addStock = function(quantity: number) {
  this.stock += quantity;
  return this.save();
};

productSchema.methods.updateRating = function(newRating: number) {
  const currentTotal = this.ratings.average * this.ratings.count;
  this.ratings.count += 1;
  this.ratings.average = (currentTotal + newRating) / this.ratings.count;
  return this.save();
};

productSchema.methods.startSale = function(percentage: number) {
  this.isOnSale = true;
  this.salePercentage = percentage;
  return this.save();
};

productSchema.methods.endSale = function() {
  this.isOnSale = false;
  this.salePercentage = 0;
  return this.save();
};

// Export the model
const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);

export default Product;
