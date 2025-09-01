import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Comprehensive error suppression for network errors - MUST BE FIRST
(function suppressNetworkErrors() {
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  const originalConsoleLog = console.log;
  const originalConsoleInfo = console.info;
  
  // Override console.error to suppress network errors
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('ERR_NAME_NOT_RESOLVED') || 
        message.includes('Failed to load resource') ||
        message.includes('net::ERR_NAME_NOT_RESOLVED') ||
        message.includes('timeout') ||
        message.includes('exceeded') ||
        message.includes('Network Error') ||
        message.includes('fetchProductByUPC') ||
        message.includes('api.goupc.com') ||
        message.includes('goupc.com') ||
        message.includes('/v1/item/')) {
      return; // Suppress network errors
    }
    originalConsoleError.apply(console, args);
  };
  
  // Override console.warn to suppress network warnings
  console.warn = function(...args) {
    const message = args.join(' ');
    if (message.includes('ERR_NAME_NOT_RESOLVED') || 
        message.includes('Failed to load resource') ||
        message.includes('net::ERR_NAME_NOT_RESOLVED') ||
        message.includes('Network Error') ||
        message.includes('api.goupc.com') ||
        message.includes('goupc.com') ||
        message.includes('/v1/item/')) {
      return; // Suppress network warnings
    }
    originalConsoleWarn.apply(console, args);
  };
  
  // Override console.log to suppress network error messages
  console.log = function(...args) {
    const message = args.join(' ');
    if (message.includes('ERR_NAME_NOT_RESOLVED') || 
        message.includes('Failed to load resource') ||
        message.includes('net::ERR_NAME_NOT_RESOLVED') ||
        message.includes('Network Error') ||
        message.includes('api.goupc.com') ||
        message.includes('goupc.com') ||
        message.includes('/v1/item/')) {
      return; // Suppress network-related logs
    }
    originalConsoleLog.apply(console, args);
  };
  
  // Override console.info to suppress network error messages
  console.info = function(...args) {
    const message = args.join(' ');
    if (message.includes('ERR_NAME_NOT_RESOLVED') || 
        message.includes('Failed to load resource') ||
        message.includes('net::ERR_NAME_NOT_RESOLVED') ||
        message.includes('Network Error') ||
        message.includes('api.goupc.com') ||
        message.includes('goupc.com') ||
        message.includes('/v1/item/')) {
      return; // Suppress network-related logs
    }
    originalConsoleInfo.apply(console, args);
  };
  
  // Also suppress unhandled promise rejections for network errors
  window.addEventListener('unhandledrejection', function(event) {
    const message = event.reason?.message || event.reason || '';
    if (message.includes('ERR_NAME_NOT_RESOLVED') || 
        message.includes('Failed to load resource') ||
        message.includes('net::ERR_NAME_NOT_RESOLVED') ||
        message.includes('Network Error') ||
        message.includes('timeout')) {
      event.preventDefault(); // Prevent the default error logging
      return;
    }
  });
  
  // Override XMLHttpRequest to suppress network errors
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    this._suppressNetworkErrors = url.includes('api.goupc.com') || 
                                 url.includes('goupc.com') ||
                                 url.includes('ERR_NAME_NOT_RESOLVED') ||
                                 url.includes('/v1/item/');
    return originalXHROpen.call(this, method, url, ...args);
  };
  
  XMLHttpRequest.prototype.send = function(...args) {
    if (this._suppressNetworkErrors) {
      // Override the error event to suppress logging
      this.addEventListener('error', function(e) {
        e.preventDefault();
        e.stopPropagation();
      }, true);
    }
    return originalXHRSend.call(this, ...args);
  };
  
  // Override fetch to suppress network errors
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    const shouldSuppress = typeof url === 'string' && (
      url.includes('api.goupc.com') || 
      url.includes('goupc.com') ||
      url.includes('ERR_NAME_NOT_RESOLVED') ||
      url.includes('/v1/item/')
    );
    
    if (shouldSuppress) {
      // Return a promise that suppresses network errors
      return originalFetch(url, options).catch(error => {
        // Suppress the error from being logged
        const suppressedError = new Error('Network error suppressed');
        suppressedError.originalError = error;
        suppressedError.isSuppressed = true;
        throw suppressedError;
      });
    }
    
    return originalFetch(url, options);
  };
  
  // Global error handler to catch network errors
  window.addEventListener('error', function(event) {
    const message = event.message || '';
    const filename = event.filename || '';
    
    if (message.includes('ERR_NAME_NOT_RESOLVED') || 
        message.includes('Failed to load resource') ||
        message.includes('net::ERR_NAME_NOT_RESOLVED') ||
        message.includes('Network Error') ||
        filename.includes('api.goupc.com') ||
        filename.includes('goupc.com') ||
        filename.includes('/v1/item/')) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);
})();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
