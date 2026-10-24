/**
 * Haversine Formula — GPS Geofence Utility
 * Calculates the great-circle distance between two GPS coordinates (in meters).
 * Used to verify a student is within the allowed radius of the classroom.
 */

const EARTH_RADIUS_METERS = 6371000; // Earth's mean radius in meters

/**
 * Convert degrees to radians
 */
function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Calculate distance between two GPS points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_METERS * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Check if a student's GPS location is within the allowed classroom geofence
 * @param {number} studentLat - Student's current latitude
 * @param {number} studentLon - Student's current longitude
 * @param {number} classLat - Classroom/teacher latitude
 * @param {number} classLon - Classroom/teacher longitude
 * @param {number} allowedRadiusMeters - Maximum allowed distance (default: 50m)
 * @returns {{ isWithin: boolean, distanceMeters: number, allowedRadius: number }}
 */
function isWithinGeofence(studentLat, studentLon, classLat, classLon, allowedRadiusMeters = 50) {
  const distanceMeters = haversineDistance(studentLat, studentLon, classLat, classLon);
  const isWithin = distanceMeters <= allowedRadiusMeters;

  return {
    isWithin,
    distanceMeters,
    allowedRadius: allowedRadiusMeters
  };
}

module.exports = { haversineDistance, isWithinGeofence };
