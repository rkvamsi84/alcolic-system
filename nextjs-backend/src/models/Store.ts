import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IStore extends Document {
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  address: {
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
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  hours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  images: string[];
  logo?: string;
  isActive: boolean;
  isVerified: boolean;
  rating: {
    average: number;
    count: number;
  };
  deliveryRadius: number;
  deliveryFee: number;
  minimumOrder: number;
  categories: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  fullAddress: string;
  isOpen: boolean;
  averageRating: number;
}

const storeSchema = new Schema<IStore>({
  name: {
    type: String,
    required: [true, 'Please add a store name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
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
  contact: {
    phone: String,
    email: String,
    website: String
  },
  hours: {
    monday: { open: String, close: String, closed: { type: Boolean, default: false } },
    tuesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    wednesday: { open: String, close: String, closed: { type: Boolean, default: false } },
    thursday: { open: String, close: String, closed: { type: Boolean, default: false } },
    friday: { open: String, close: String, closed: { type: Boolean, default: false } },
    saturday: { open: String, close: String, closed: { type: Boolean, default: false } },
    sunday: { open: String, close: String, closed: { type: Boolean, default: false } }
  },
  images: [{
    type: String
  }],
  logo: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  deliveryRadius: {
    type: Number,
    default: 10 // in kilometers
  },
  deliveryFee: {
    type: Number,
    default: 0
  },
  minimumOrder: {
    type: Number,
    default: 0
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
storeSchema.index({ 'address.location': '2dsphere' });
storeSchema.index({ owner: 1 });
storeSchema.index({ isActive: 1, isVerified: 1 });
storeSchema.index({ categories: 1 });
storeSchema.index({ rating: -1 });
storeSchema.index({ createdAt: -1 });

// Virtual for full address
storeSchema.virtual('fullAddress').get(function() {
  const addr = this.address;
  if (!addr) return '';
  
  const parts = [addr.street, addr.city, addr.state, addr.zipCode, addr.country];
  return parts.filter(Boolean).join(', ');
});

// Virtual for isOpen
storeSchema.virtual('isOpen').get(function() {
  const now = new Date();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  
  const todayHours = this.hours[dayOfWeek as keyof typeof this.hours];
  if (!todayHours || todayHours.closed) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
});

// Virtual for average rating
storeSchema.virtual('averageRating').get(function() {
  return this.rating.average || 0;
});

// Pre-save middleware to update timestamps
storeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
storeSchema.statics.findNearby = function(coordinates: [number, number], maxDistance: number = 10) {
  return this.find({
    'address.location': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance * 1000 // Convert km to meters
      }
    },
    isActive: true,
    isVerified: true
  });
};

storeSchema.statics.findByCategory = function(categoryId: string) {
  return this.find({
    categories: categoryId,
    isActive: true,
    isVerified: true
  });
};

storeSchema.statics.findActiveStores = function() {
  return this.find({
    isActive: true,
    isVerified: true
  });
};

storeSchema.statics.findByOwner = function(ownerId: string) {
  return this.find({ owner: ownerId });
};

// Instance methods
storeSchema.methods.updateRating = function(newRating: number) {
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + newRating) / this.rating.count;
  return this.save();
};

storeSchema.methods.isWithinDeliveryRange = function(customerCoordinates: [number, number]): boolean {
  const storeCoords = this.address.location.coordinates;
  const distance = this.calculateDistance(storeCoords, customerCoordinates);
  return distance <= this.deliveryRadius;
};

storeSchema.methods.calculateDistance = function(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = this.deg2rad(coord2[0] - coord1[0]);
  const dLon = this.deg2rad(coord2[1] - coord1[1]);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.deg2rad(coord1[0])) * Math.cos(this.deg2rad(coord2[0])) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

storeSchema.methods.deg2rad = function(deg: number): number {
  return deg * (Math.PI/180);
};

// Export the model
const Store: Model<IStore> = mongoose.models.Store || mongoose.model<IStore>('Store', storeSchema);

export default Store;
