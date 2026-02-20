/**
 * Location Utilities
 * Helper functions for geolocation handling
 */

// Default location (Makkah) used when geolocation fails
const DEFAULT_LOCATION = {
  city: 'Makkah',
  country: 'Saudi Arabia',
  latitude: 21.4225,
  longitude: 39.8262
};

/**
 * Get user's current location using browser geolocation API
 * Falls back to default location if permission denied or unavailable
 * @returns {Promise<{latitude: number, longitude: number, city?: string, country?: string}>}
 */
export async function getUserLocation() {
  try {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.log('Geolocation not supported, using default location');
      return DEFAULT_LOCATION;
    }

    // Try to get cached location first for faster load
    const cached = await getCachedLocation();
    if (cached) {
      return cached;
    }

    // Request current position
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        resolve,
        reject,
        {
          enableHighAccuracy: false, // Lower accuracy is fine, faster response
          timeout: 5000,             // 5 second timeout
          maximumAge: 3600000        // Cache for 1 hour
        }
      );
    });

    const location = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    };

    // Cache the location for future use
    await cacheLocation(location);

    return location;

  } catch (error) {
    console.log('Geolocation error, using default:', error.message);
    return DEFAULT_LOCATION;
  }
}

/**
 * Cache location in chrome.storage.local
 * @param {Object} location - Location object with latitude/longitude
 */
async function cacheLocation(location) {
  try {
    await chrome.storage.local.set({
      cachedLocation: {
        ...location,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.warn('Failed to cache location:', error);
  }
}

/**
 * Get cached location if still valid (within 24 hours)
 * @returns {Promise<Object|null>}
 */
async function getCachedLocation() {
  try {
    const result = await chrome.storage.local.get('cachedLocation');
    const cached = result.cachedLocation;

    if (!cached) return null;

    // Check if cache is still valid (24 hours)
    const maxAge = 24 * 60 * 60 * 1000;
    if (Date.now() - cached.timestamp > maxAge) {
      return null;
    }

    return {
      latitude: cached.latitude,
      longitude: cached.longitude
    };

  } catch (error) {
    return null;
  }
}

/**
 * Get location using city name (for prayer API)
 * @param {Object} coords - Coordinates with latitude and longitude
 * @returns {Promise<{city: string, country: string}>}
 */
export async function getCityFromCoords(coords) {
  // For the Aladhan API, we can use coordinates directly
  // This function is here if we need reverse geocoding in the future
  return {
    latitude: coords.latitude,
    longitude: coords.longitude
  };
}
