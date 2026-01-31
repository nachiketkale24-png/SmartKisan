import { API_URL, API_TIMEOUT } from '../config';

/**
 * REST API Client - No WebSocket
 * Uses fetch with timeout for offline-first architecture
 */

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Send query to assistant API
 */
export async function queryAssistant(message, language = 'hi') {
  const response = await fetchWithTimeout(`${API_URL}/assistant/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, language }),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get current sensor data
 */
export async function getSensors() {
  const response = await fetchWithTimeout(`${API_URL}/sensors/current`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Check if backend is reachable
 */
export async function checkConnection() {
  try {
    const response = await fetchWithTimeout(`${API_URL}/status/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export default {
  queryAssistant,
  getSensors,
  checkConnection,
};
