import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Supported languages configuration
export const SUPPORTED_LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    direction: 'ltr',
    rtl: false
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    direction: 'ltr',
    rtl: false
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    direction: 'ltr',
    rtl: false
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    direction: 'ltr',
    rtl: false
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    direction: 'rtl',
    rtl: true
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    direction: 'ltr',
    rtl: false
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳',
    direction: 'ltr',
    rtl: false
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    direction: 'ltr',
    rtl: false
  }
};

// Translation keys
const TRANSLATIONS = {
  en: {
    // Navigation
    home: 'Home',
    search: 'Search',
    cart: 'Cart',
    profile: 'Profile',
    orders: 'Orders',
    favorites: 'Favorites',
    notifications: 'Notifications',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    signup: 'Sign Up',
    forgotPassword: 'Forgot Password',
    
    // Product related
    addToCart: 'Add to Cart',
    removeFromCart: 'Remove from Cart',
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    outOfStock: 'Out of Stock',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    price: 'Price',
    originalPrice: 'Original Price',
    discount: 'Discount',
    freeShipping: 'Free Shipping',
    shipping: 'Shipping',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'Tax',
    
    // Order related
    orderHistory: 'Order History',
    activeOrders: 'Active Orders',
    orderNumber: 'Order Number',
    orderDate: 'Order Date',
    orderStatus: 'Order Status',
    orderTotal: 'Order Total',
    orderDetails: 'Order Details',
    trackOrder: 'Track Order',
    cancelOrder: 'Cancel Order',
    delivered: 'Delivered',
    processing: 'Processing',
    shipped: 'Shipped',
    cancelled: 'Cancelled',
    
    // Payment related
    payment: 'Payment',
    paymentMethod: 'Payment Method',
    paymentHistory: 'Payment History',
    cardPayment: 'Card Payment',
    paypal: 'PayPal',
    upi: 'UPI',
    cashOnDelivery: 'Cash on Delivery',
    payNow: 'Pay Now',
    paymentSuccessful: 'Payment Successful',
    paymentFailed: 'Payment Failed',
    
    // Profile related
    editProfile: 'Edit Profile',
    personalInfo: 'Personal Information',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    
    // Address related
    addresses: 'Addresses',
    addAddress: 'Add Address',
    editAddress: 'Edit Address',
    deleteAddress: 'Delete Address',
    defaultAddress: 'Default Address',
    streetAddress: 'Street Address',
    city: 'City',
    state: 'State',
    zipCode: 'ZIP Code',
    country: 'Country',
    
    // Notifications
    markAsRead: 'Mark as Read',
    markAllAsRead: 'Mark All as Read',
    noNotifications: 'No notifications',
    orderUpdates: 'Order Updates',
    systemAlerts: 'System Alerts',
    
    // Search and Filter
    searchProducts: 'Search Products',
    filter: 'Filter',
    sortBy: 'Sort By',
    priceRange: 'Price Range',
    categories: 'Categories',
    brands: 'Brands',
    rating: 'Rating',
    clearFilters: 'Clear Filters',
    applyFilters: 'Apply Filters',
    
    // Common actions
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    remove: 'Remove',
    update: 'Update',
    submit: 'Submit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    
    // Messages
    itemAddedToCart: 'Item added to cart',
    itemRemovedFromCart: 'Item removed from cart',
    itemAddedToFavorites: 'Item added to favorites',
    itemRemovedFromFavorites: 'Item removed from favorites',
    orderPlacedSuccessfully: 'Order placed successfully',
    paymentProcessed: 'Payment processed successfully',
    profileUpdated: 'Profile updated successfully',
    passwordChanged: 'Password changed successfully',
    addressAdded: 'Address added successfully',
    addressUpdated: 'Address updated successfully',
    addressDeleted: 'Address deleted successfully',
    
    // Errors
    somethingWentWrong: 'Something went wrong',
    networkError: 'Network error. Please check your connection',
    unauthorized: 'You are not authorized to perform this action',
    notFound: 'The requested resource was not found',
    validationError: 'Please check your input and try again',
    
    // Language specific
    language: 'Language',
    selectLanguage: 'Select Language',
    languageChanged: 'Language changed successfully',
    
    // Delivery and Location
    deliveryZones: 'Delivery Zones',
    locationServices: 'Location Services',
    currentLocation: 'Current Location',
    getLocation: 'Get Location',
    deliveryAvailable: 'Delivery Available',
    deliveryNotAvailable: 'Delivery Not Available',
    deliveryFee: 'Delivery Fee',
    deliveryTime: 'Delivery Time',
    minimumOrder: 'Minimum Order',
    
    // Reviews and Ratings
    reviews: 'Reviews',
    ratings: 'Ratings',
    writeReview: 'Write Review',
    reviewTitle: 'Review Title',
    reviewComment: 'Review Comment',
    reviewSubmitted: 'Review submitted successfully',
    helpful: 'Helpful',
    notHelpful: 'Not Helpful',
    
    // Promotions
    promotionCodes: 'Promotion Codes',
    applyCode: 'Apply Code',
    codeApplied: 'Code applied successfully',
    codeRemoved: 'Code removed',
    invalidCode: 'Invalid promotion code',
    
    // Advanced Features
    advancedFiltering: 'Advanced Filtering',
    filterPresets: 'Filter Presets',
    bestSellers: 'Best Sellers',
    newReleases: 'New Releases',
    clearance: 'Clearance',
    under50: 'Under $50',
    premium: 'Premium',
    ecoFriendly: 'Eco-Friendly',
    saveFilters: 'Save Filters',
    filterHistory: 'Filter History'
  },
  
  es: {
    // Navigation
    home: 'Inicio',
    search: 'Buscar',
    cart: 'Carrito',
    profile: 'Perfil',
    orders: 'Pedidos',
    favorites: 'Favoritos',
    notifications: 'Notificaciones',
    settings: 'Configuración',
    logout: 'Cerrar Sesión',
    login: 'Iniciar Sesión',
    signup: 'Registrarse',
    forgotPassword: 'Olvidé mi Contraseña',
    
    // Product related
    addToCart: 'Agregar al Carrito',
    removeFromCart: 'Quitar del Carrito',
    addToFavorites: 'Agregar a Favoritos',
    removeFromFavorites: 'Quitar de Favoritos',
    outOfStock: 'Sin Stock',
    inStock: 'En Stock',
    lowStock: 'Stock Bajo',
    price: 'Precio',
    originalPrice: 'Precio Original',
    discount: 'Descuento',
    freeShipping: 'Envío Gratis',
    shipping: 'Envío',
    total: 'Total',
    subtotal: 'Subtotal',
    tax: 'Impuesto',
    
    // Common actions
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Agregar',
    remove: 'Quitar',
    update: 'Actualizar',
    submit: 'Enviar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    warning: 'Advertencia',
    info: 'Información',
    
    // Messages
    itemAddedToCart: 'Artículo agregado al carrito',
    itemRemovedFromCart: 'Artículo removido del carrito',
    itemAddedToFavorites: 'Artículo agregado a favoritos',
    itemRemovedFromFavorites: 'Artículo removido de favoritos',
    orderPlacedSuccessfully: 'Pedido realizado exitosamente',
    paymentProcessed: 'Pago procesado exitosamente',
    profileUpdated: 'Perfil actualizado exitosamente',
    
    // Language specific
    language: 'Idioma',
    selectLanguage: 'Seleccionar Idioma',
    languageChanged: 'Idioma cambiado exitosamente'
  },
  
  fr: {
    // Navigation
    home: 'Accueil',
    search: 'Rechercher',
    cart: 'Panier',
    profile: 'Profil',
    orders: 'Commandes',
    favorites: 'Favoris',
    notifications: 'Notifications',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    login: 'Connexion',
    signup: 'S\'inscrire',
    forgotPassword: 'Mot de passe oublié',
    
    // Product related
    addToCart: 'Ajouter au Panier',
    removeFromCart: 'Retirer du Panier',
    addToFavorites: 'Ajouter aux Favoris',
    removeFromFavorites: 'Retirer des Favoris',
    outOfStock: 'Rupture de Stock',
    inStock: 'En Stock',
    lowStock: 'Stock Faible',
    price: 'Prix',
    originalPrice: 'Prix Original',
    discount: 'Remise',
    freeShipping: 'Livraison Gratuite',
    shipping: 'Livraison',
    total: 'Total',
    subtotal: 'Sous-total',
    tax: 'Taxe',
    
    // Common actions
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    remove: 'Retirer',
    update: 'Mettre à jour',
    submit: 'Soumettre',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    warning: 'Avertissement',
    info: 'Information',
    
    // Messages
    itemAddedToCart: 'Article ajouté au panier',
    itemRemovedFromCart: 'Article retiré du panier',
    itemAddedToFavorites: 'Article ajouté aux favoris',
    itemRemovedFromFavorites: 'Article retiré des favoris',
    orderPlacedSuccessfully: 'Commande passée avec succès',
    paymentProcessed: 'Paiement traité avec succès',
    profileUpdated: 'Profil mis à jour avec succès',
    
    // Language specific
    language: 'Langue',
    selectLanguage: 'Sélectionner la Langue',
    languageChanged: 'Langue changée avec succès'
  },
  
  ar: {
    // Navigation
    home: 'الرئيسية',
    search: 'البحث',
    cart: 'السلة',
    profile: 'الملف الشخصي',
    orders: 'الطلبات',
    favorites: 'المفضلة',
    notifications: 'الإشعارات',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    forgotPassword: 'نسيت كلمة المرور',
    
    // Product related
    addToCart: 'إضافة إلى السلة',
    removeFromCart: 'إزالة من السلة',
    addToFavorites: 'إضافة إلى المفضلة',
    removeFromFavorites: 'إزالة من المفضلة',
    outOfStock: 'نفذت الكمية',
    inStock: 'متوفر',
    lowStock: 'كمية محدودة',
    price: 'السعر',
    originalPrice: 'السعر الأصلي',
    discount: 'الخصم',
    freeShipping: 'شحن مجاني',
    shipping: 'الشحن',
    total: 'المجموع',
    subtotal: 'المجموع الفرعي',
    tax: 'الضريبة',
    
    // Common actions
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    remove: 'إزالة',
    update: 'تحديث',
    submit: 'إرسال',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    warning: 'تحذير',
    info: 'معلومات',
    
    // Messages
    itemAddedToCart: 'تمت إضافة العنصر إلى السلة',
    itemRemovedFromCart: 'تمت إزالة العنصر من السلة',
    itemAddedToFavorites: 'تمت إضافة العنصر إلى المفضلة',
    itemRemovedFromFavorites: 'تمت إزالة العنصر من المفضلة',
    orderPlacedSuccessfully: 'تم تقديم الطلب بنجاح',
    paymentProcessed: 'تمت معالجة الدفع بنجاح',
    profileUpdated: 'تم تحديث الملف الشخصي بنجاح',
    
    // Language specific
    language: 'اللغة',
    selectLanguage: 'اختر اللغة',
    languageChanged: 'تم تغيير اللغة بنجاح'
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isRTL, setIsRTL] = useState(false);

  // Initialize language from localStorage or browser preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred_language');
    const browserLanguage = navigator.language.split('-')[0];
    
    if (savedLanguage && SUPPORTED_LANGUAGES[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    } else if (SUPPORTED_LANGUAGES[browserLanguage]) {
      setCurrentLanguage(browserLanguage);
    }
  }, []);

  // Update RTL setting when language changes
  useEffect(() => {
    const languageConfig = SUPPORTED_LANGUAGES[currentLanguage];
    setIsRTL(languageConfig?.rtl || false);
    
    // Update document direction
    document.documentElement.dir = languageConfig?.direction || 'ltr';
    document.documentElement.lang = currentLanguage;
    
    // Update document title with language
    const currentTitle = document.title;
    if (!currentTitle.includes(' - ')) {
      document.title = `${currentTitle} - ${languageConfig?.name}`;
    }
  }, [currentLanguage]);

  // Change language
  const changeLanguage = (languageCode) => {
    if (SUPPORTED_LANGUAGES[languageCode]) {
      setCurrentLanguage(languageCode);
      localStorage.setItem('preferred_language', languageCode);
      toast.success(t('languageChanged'));
    }
  };

  // Translation function
  const t = (key, params = {}) => {
    const translations = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
    let translation = translations[key] || TRANSLATIONS.en[key] || key;
    
    // Replace parameters in translation
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });
    
    return translation;
  };

  // Get current language configuration
  const getCurrentLanguageConfig = () => {
    return SUPPORTED_LANGUAGES[currentLanguage] || SUPPORTED_LANGUAGES.en;
  };

  // Get all supported languages
  const getSupportedLanguages = () => {
    return Object.values(SUPPORTED_LANGUAGES);
  };

  // Check if current language is RTL
  const isCurrentLanguageRTL = () => {
    return isRTL;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    getCurrentLanguageConfig,
    getSupportedLanguages,
    isCurrentLanguageRTL,
    isRTL,
    SUPPORTED_LANGUAGES
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};