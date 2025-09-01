import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description?: string;
  image?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  isFeatured: boolean;
  parent?: mongoose.Types.ObjectId;
  children: mongoose.Types.ObjectId[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  productCount: number;
  hasChildren: boolean;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  image: {
    type: String
  },
  icon: {
    type: String
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ name: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1, isFeatured: 1 });
categorySchema.index({ sortOrder: 1 });

// Virtual for product count
categorySchema.virtual('productCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true
});

// Virtual for has children
categorySchema.virtual('hasChildren').get(function() {
  return this.children && this.children.length > 0;
});

// Pre-save middleware to update timestamps
categorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
categorySchema.statics.findRootCategories = function() {
  return this.find({ parent: null, isActive: true }).sort({ sortOrder: 1 });
};

categorySchema.statics.findFeaturedCategories = function() {
  return this.find({ isActive: true, isFeatured: true }).sort({ sortOrder: 1 });
};

categorySchema.statics.findActiveCategories = function() {
  return this.find({ isActive: true }).sort({ sortOrder: 1 });
};

categorySchema.statics.findByParent = function(parentId: string) {
  return this.find({ parent: parentId, isActive: true }).sort({ sortOrder: 1 });
};

// Instance methods
categorySchema.methods.addChild = function(childId: string) {
  if (!this.children.includes(childId)) {
    this.children.push(childId);
    return this.save();
  }
  return Promise.resolve(this);
};

categorySchema.methods.removeChild = function(childId: string) {
  this.children = this.children.filter((id: any) => id.toString() !== childId);
  return this.save();
};

// Export the model
const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);

export default Category;
