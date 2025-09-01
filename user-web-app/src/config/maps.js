// Google Maps Configuration
export const GOOGLE_MAPS_CONFIG = {
  API_KEY: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyB_ywiXbLJSW53r0RxEOOSg37nx117syEE',
  LIBRARIES: ['places', 'geometry'],
  VERSION: 'weekly', // Use the latest weekly version to avoid retired version warnings
  DEFAULT_CENTER: {
    lat: 37.7749, // San Francisco default
    lng: -122.4194
  },
  DEFAULT_ZOOM: 15,
  MAP_OPTIONS: {
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true,
    disableDefaultUi: false,
    gestureHandling: 'cooperative',
    clickableIcons: false,
    disableDoubleClickZoom: false,
    keyboardShortcuts: false,
    mapTypeId: 'roadmap',
    // restriction: {
    //   strictBounds: false
    // },
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'poi.business',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'transit',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }]
      }
    ]
  }
};

// Map marker icons - Using data URIs to avoid external requests
export const MAP_MARKERS = {
  STORE: {
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="12" fill="#f44336" stroke="white" stroke-width="2"/>
        <circle cx="15" cy="15" r="4" fill="white"/>
      </svg>
    `),
    scaledSize: { width: 30, height: 30 }
  },
  DELIVERY: {
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="12" fill="#2196f3" stroke="white" stroke-width="2"/>
        <circle cx="15" cy="15" r="4" fill="white"/>
      </svg>
    `),
    scaledSize: { width: 30, height: 30 }
  },
  CUSTOMER: {
    url: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
        <circle cx="15" cy="15" r="12" fill="#4caf50" stroke="white" stroke-width="2"/>
        <circle cx="15" cy="15" r="4" fill="white"/>
      </svg>
    `),
    scaledSize: { width: 30, height: 30 }
  }
};

// Route styling
export const ROUTE_STYLING = {
  strokeColor: '#2196F3',
  strokeOpacity: 0.8,
  strokeWeight: 4,
  geodesic: true
};