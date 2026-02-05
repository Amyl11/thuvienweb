// Auto-detect backend URL based on current host
const getBackendUrl = () => {
  // If accessing via localhost, use localhost for backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8080';
  }
  
  // If accessing via network IP, use same IP for backend
  return `http://${window.location.hostname}:8080`;
};

export const API_BASE_URL = getBackendUrl();
export const API_BACKEND_HOST = API_BASE_URL;
