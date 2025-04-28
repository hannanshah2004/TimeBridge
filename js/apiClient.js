// apiClient.js - Handles all external API integrations

/**
 * Base class for API clients
 */
class BaseApiClient {
    constructor() {
        // The base URL for all backend API requests
        this.baseUrl = '/api'; 
    }

    /**
     * Makes a GET request to a backend endpoint.
     * @param {string} endpoint - The API endpoint path (e.g., 'weather/current').
     * @param {object} params - Query parameters for the request.
     * @returns {Promise<object>} - The JSON response from the server.
     */
    async get(endpoint, params = {}) {
        const url = new URL(`${this.baseUrl}/${endpoint}`, window.location.origin);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `API request failed: ${response.status}` }));
                throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error in GET request to ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Makes a POST request to a backend endpoint.
     * @param {string} endpoint - The API endpoint path.
     * @param {object} data - The data to send in the request body.
     * @returns {Promise<object>} - The JSON response from the server.
     */
    async post(endpoint, data = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `API request failed: ${response.status}` }));
                throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error in POST request to ${endpoint}:`, error);
            throw error;
        }
    }
    
    /**
     * Makes a PUT request to a backend endpoint.
     * @param {string} endpoint - The API endpoint path (e.g., 'meetings/123').
     * @param {object} data - The data to send in the request body.
     * @returns {Promise<object>} - The JSON response from the server.
     */
    async put(endpoint, data = {}) {
        try {
            const response = await fetch(`${this.baseUrl}/${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `API request failed: ${response.status}` }));
                throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error in PUT request to ${endpoint}:`, error);
            throw error;
        }
    }
}

/**
 * Weather API client 
 */
class WeatherApiClient extends BaseApiClient {
    constructor() {
        super();
    }

    /**
     * Get current weather data based on user's location (IP address detected by backend)
     * or for a specific location query.
     * 
     * @param {string} [location] - Optional location query (ZIP code, city name, etc.)
     * @returns {Promise<object>} - Weather data
     */
    async getCurrentWeather(location) {
        const params = location ? { q: location } : {};
        return this.get('weather/current', params);
    }

    /**
     * Get forecast data.
     * 
     * @param {string} [location] - Optional location query (ZIP code, city name, etc.)
     * @param {number} [days=1] - Number of days for forecast (1-14).
     * @returns {Promise<object>} - Forecast data
     */
    async getForecast(location, days = 1) {
        const params = { days };
        if (location) {
            params.q = location;
        }
        return this.get('weather/forecast', params);
    }
}

/**
 * Meetings API client
 */
class MeetingsApiClient extends BaseApiClient {
    constructor() {
        super();
    }

    /**
     * Fetches all meetings.
     */
    async getAllMeetings() {
        return this.get('meetings');
    }

    /**
     * Creates a new meeting.
     * @param {object} meetingData - Data for the new meeting.
     */
    async createMeeting(meetingData) {
        return this.post('meetings', meetingData);
    }

    /**
     * Updates an existing meeting.
     * @param {number} id - The ID of the meeting to update.
     * @param {object} updates - The fields to update.
     */
    async updateMeeting(id, updates) {
        return this.put(`meetings/${id}`, updates);
    }
}

// Export instances of the API clients
export const weatherApi = new WeatherApiClient();
export const meetingsApi = new MeetingsApiClient();

// Create an object to house all API clients for easy importing if preferred
const apiClient = {
    weather: weatherApi,
    meetings: meetingsApi
    // Add other clients here as needed
};

export default apiClient;
