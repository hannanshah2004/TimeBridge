class BaseApiClient {
    constructor() {
        this.baseUrl = '/api'; 
    }

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

class WeatherApiClient extends BaseApiClient {
    constructor() {
        super();
    }

    async getCurrentWeather(location) {
        const params = location ? { q: location } : {};
        return this.get('weather/current', params);
    }

    async getForecast(location, days = 1) {
        const params = { days };
        if (location) {
            params.q = location;
        }
        return this.get('weather/forecast', params);
    }
}


export const weatherApi = new WeatherApiClient();

const apiClient = {
    weather: weatherApi,
};

export default apiClient;
