class ApperClientSingleton {
  constructor() {
    this._client = null;
    this._isInitializing = false;
  }

  async getInstance() {
    if (this._client) {
      return this._client;
    }

    if (this._isInitializing) {
      // Wait for initialization to complete
      while (this._isInitializing && !this._client) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return this._client;
    }

    this._isInitializing = true;

    try {
      // Check if window and SDK are available
      if (typeof window === 'undefined' || !window.ApperSDK) {
        console.warn('ApperSDK not available - returning null');
        return null;
      }

      const { ApperClient } = window.ApperSDK;
      
      if (!ApperClient) {
        console.warn('ApperClient not found in SDK - returning null');
        return null;
      }

      // Initialize with environment variables
      this._client = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      console.log('ApperClient initialized successfully');
      return this._client;

    } catch (error) {
      console.error('Failed to initialize ApperClient:', error);
      return null;
    } finally {
      this._isInitializing = false;
    }
  }

  reset() {
    this._client = null;
    this._isInitializing = false;
  }
}

// Create singleton instance
let _singletonInstance = null;

const getSingleton = () => {
  if (!_singletonInstance) {
    _singletonInstance = new ApperClientSingleton();
  }
  return _singletonInstance;
};

// Main export
export const getApperClient = () => getSingleton().getInstance();

// Alternative exports
export const apperClientSingleton = {
  getInstance: () => getSingleton().getInstance(),
  reset: () => getSingleton().reset(),
};

export default getSingleton;