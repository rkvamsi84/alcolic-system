// Image utility functions for handling image URLs
import { API_CONFIG } from '../config/api';

/**
 * Constructs a full image URL from a relative path
 * @param {string} imagePath - The relative image path (e.g., '/uploads/products/abc123')
 * @returns {string} - The full image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a data URL, return as is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }

  // Construct full URL using the API base URL
  const baseUrl = API_CONFIG.baseURL.replace('/api.php', '');
  return `${baseUrl}${imagePath}`;
};

/**
 * Gets the primary image URL for a product
 * @param {Object} product - The product object
 * @returns {string|null} - The primary image URL or null
 */
export const getProductImageUrl = (product) => {
  if (!product) return getPlaceholderImageUrl('product');

  // Try primary image first
  if (product.primaryImage) {
    return getImageUrl(product.primaryImage);
  }

  // Try images array
  if (product.images && product.images.length > 0) {
    const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
    return getImageUrl(primaryImage.url);
  }

  // Try image field (fallback)
  if (product.image) {
    return getImageUrl(product.image);
  }

  // Return placeholder if no image found
  return getPlaceholderImageUrl('product');
};

/**
 * Gets all image URLs for a product
 * @param {Object} product - The product object
 * @returns {Array} - Array of image URLs
 */
export const getProductImageUrls = (product) => {
  if (!product) return [];

  const urls = [];

  // Add primary image if exists
  if (product.primaryImage) {
    urls.push(getImageUrl(product.primaryImage));
  }

  // Add images from images array
  if (product.images && product.images.length > 0) {
    product.images.forEach(img => {
      const url = getImageUrl(img.url);
      if (url && !urls.includes(url)) {
        urls.push(url);
      }
    });
  }

  // Add image field if not already included
  if (product.image) {
    const url = getImageUrl(product.image);
    if (url && !urls.includes(url)) {
      urls.push(url);
    }
  }

  return urls;
};

/**
 * Gets banner image URL
 * @param {Object} banner - The banner object
 * @returns {string|null} - The banner image URL or null
 */
export const getBannerImageUrl = (banner) => {
  if (!banner) return getPlaceholderImageUrl('banner');

  if (banner.image) {
    return getImageUrl(banner.image);
  }

  return getPlaceholderImageUrl('banner');
};

/**
 * Gets category image URL
 * @param {Object} category - The category object
 * @returns {string|null} - The category image URL or null
 */
export const getCategoryImageUrl = (category) => {
  if (!category) return getPlaceholderImageUrl('category');

  if (category.image) {
    return getImageUrl(category.image);
  }

  return getPlaceholderImageUrl('category');
};

/**
 * Gets store logo URL
 * @param {Object} store - The store object
 * @returns {string|null} - The store logo URL or null
 */
export const getStoreLogoUrl = (store) => {
  if (!store) return getPlaceholderImageUrl('store');

  if (store.logo) {
    return getImageUrl(store.logo);
  }

  return getPlaceholderImageUrl('store');
};

/**
 * Gets store banner URL
 * @param {Object} store - The store object
 * @returns {string|null} - The store banner URL or null
 */
export const getStoreBannerUrl = (store) => {
  if (!store) return getPlaceholderImageUrl('banner');

  if (store.banner) {
    return getImageUrl(store.banner);
  }

  return getPlaceholderImageUrl('banner');
};

/**
 * Gets promotion image URL
 * @param {Object} promotion - The promotion object
 * @returns {string|null} - The promotion image URL or null
 */
export const getPromotionImageUrl = (promotion) => {
  if (!promotion) return getPlaceholderImageUrl('promotion');

  if (promotion.image) {
    return getImageUrl(promotion.image);
  }

  return getPlaceholderImageUrl('promotion');
};

/**
 * Gets a placeholder image URL based on type
 * @param {string} type - The type of placeholder ('product', 'banner', 'category', 'store')
 * @returns {string} - The placeholder image URL
 */
export const getPlaceholderImageUrl = (type = 'product') => {
  // Data URLs for placeholder images (base64 encoded SVG)
  const placeholders = {
    product: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTE2LjU2OSA3MCAxMzAgODMuNDMxIDEzMCAxMDBDMTMwIDExNi41NjkgMTE2LjU2OSAxMzAgMTAwIDEzMEM4My40MzEgMTMwIDcwIDExNi41NjkgNzAgMTAwQzcwIDgzLjQzMSA4My40MzEgNzAgMTAwIDcwWiIgZmlsbD0iI0NDQ0NDQyIvPgo8dGV4dCB4PSIxMDAiIHk9IjE2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qcm9kdWN0PC90ZXh0Pgo8L3N2Zz4K',
    banner: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yMDAgODBDMjE2LjU2OSA4MCAyMzAgOTMuNDMxIDIzMCAxMTBDMjMwIDEyNi41NjkgMjE2LjU2OSAxNDAgMjAwIDE0MEMxODMuNDMxIDE0MCAxNzAgMTI2LjU2OSAxNzAgMTEwQzE3MCA5My40MzEgMTgzLjQzMSA4MCAyMDAgODBaIiBmaWxsPSIjQ0NDQ0NDIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTcwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkJhbm5lcjwvdGV4dD4KPC9zdmc+Cg==',
    category: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTE2LjU2OSA3MCAxMzAgODMuNDMxIDEzMCAxMDBDMTMwIDExNi41NjkgMTE2LjU2OSAxMzAgMTAwIDEzMEM4My40MzEgMTMwIDcwIDExNi41NjkgNzAgMTAwQzcwIDgzLjQzMSA4My40MzEgNzAgMTAwIDcwWiIgZmlsbD0iI0NDQ0NDQyIvPgo8dGV4dCB4PSIxMDAiIHk9IjE2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5DYXRlZ29yeTwvdGV4dD4KPC9zdmc+Cg==',
    store: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTE2LjU2OSA3MCAxMzAgODMuNDMxIDEzMCAxMDBDMTMwIDExNi41NjkgMTE2LjU2OSAxMzAgMTAwIDEzMEM4My40MzEgMTMwIDcwIDExNi41NjkgNzAgMTAwQzcwIDgzLjQzMSA4My40MzEgNzAgMTAwIDcwWiIgZmlsbD0iI0NDQ0NDQyIvPgo8dGV4dCB4PSIxMDAiIHk9IjE2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TdG9yZTwvdGV4dD4KPC9zdmc+Cg==',
    promotion: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTE2LjU2OSA3MCAxMzAgODMuNDMxIDEzMCAxMDBDMTMwIDExNi41NjkgMTE2LjU2OSAxMzAgMTAwIDEzMEM4My40MzEgMTMwIDcwIDExNi41NjkgNzAgMTAwQzcwIDgzLjQzMSA4My40MzEgNzAgMTAwIDcwWiIgZmlsbD0iI0NDQ0NDQyIvPgo8dGV4dCB4PSIxMDAiIHk9IjE2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Qcm9tb3Rpb248L3RleHQ+Cjwvc3ZnPgo=',
    user: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTE2LjU2OSA3MCAxMzAgODMuNDMxIDEzMCAxMDBDMTMwIDExNi41NjkgMTE2LjU2OSAxMzAgMTAwIDEzMEM4My40MzEgMTMwIDcwIDExNi41NjkgNzAgMTAwQzcwIDgzLjQzMSA4My40MzEgNzAgMTAwIDcwWiIgZmlsbD0iI0NDQ0NDQyIvPgo8dGV4dCB4PSIxMDAiIHk9IjE2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5OTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Vc2VyPC90ZXh0Pgo8L3N2Zz4K'
  };

  return placeholders[type] || placeholders.product;
};

/**
 * Handles image loading errors by providing a fallback
 * @param {Event} event - The error event
 * @param {string} fallbackType - The type of fallback image
 */
export const handleImageError = (event, fallbackType = 'product') => {
  const currentSrc = event.target.src;
  
  // Only log and set fallback if we're not already showing a placeholder
  if (!currentSrc.includes('data:image/svg+xml')) {
    console.warn('Image failed to load:', currentSrc);
    event.target.src = getPlaceholderImageUrl(fallbackType);
  }
  
  // Prevent infinite loop by removing the error handler
  event.target.onerror = null;
};

/**
 * Preloads an image
 * @param {string} src - The image URL to preload
 * @returns {Promise} - Promise that resolves when image is loaded
 */
export const preloadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
};

/**
 * Preloads multiple images
 * @param {Array} srcs - Array of image URLs to preload
 * @returns {Promise} - Promise that resolves when all images are loaded
 */
export const preloadImages = (srcs) => {
  return Promise.all(srcs.map(src => preloadImage(src)));
};
