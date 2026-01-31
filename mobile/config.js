// Backend Configuration for Mobile App
// Update BACKEND_IP to your computer's local IP address

// Find your IP:
// Windows: ipconfig (look for IPv4 Address)
// Mac/Linux: ifconfig or ip addr

const BACKEND_IP = '192.168.1.205'; // ← Change this to your IP
const BACKEND_PORT = '3002';

export const BASE_URL = `http://${BACKEND_IP}:${BACKEND_PORT}`;
export const API_URL = `${BASE_URL}/api`;
export const API_TIMEOUT = 5000; // 5 seconds timeout

export default {
  BACKEND_IP,
  BACKEND_PORT,
  BASE_URL,
  API_URL,
  API_TIMEOUT
};
