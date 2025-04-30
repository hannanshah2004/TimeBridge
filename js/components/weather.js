// Weather component for TimeBridge
import { weatherApi } from '../apiClient.js';

class WeatherComponent {
    constructor(container) {
        this.container = container;
        this.weatherData = null;
        this.isLoading = false;
        this.error = null;
        this.validationError = null; // For input validation errors
        this.lastQuery = null; // Store the last valid query
    }

    /**
     * Render the weather widget UI
     */
    render() {
        if (!this.container) {
            console.error('Weather component: No container element found');
            return;
        }

        // Start with the search form
        this.container.innerHTML = `
            <div class="bg-white rounded-lg shadow p-4" id="weather-widget-content">
                <div class="mb-4">
                    <h3 class="text-lg font-medium text-gray-900 mb-2">Weather</h3>
                    <form id="weather-search-form" class="flex items-center">
                        <input 
                            type="text" 
                            id="weather-zipcode" 
                            placeholder="Enter ZIP code" 
                            class="flex-grow rounded-l-md border ${this.validationError ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            pattern="[0-9]{5}(-[0-9]{4})?"
                        />
                        <button 
                            type="submit" 
                            class="rounded-r-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Get Weather
                        </button>
                    </form>
                    ${this.validationError ? 
                        `<p class="mt-1 text-xs text-red-500">${this.validationError}</p>` : 
                        `<p class="mt-1 text-xs text-gray-500">Enter a 5-digit ZIP code (US only)</p>`
                    }
                </div>
                
                <div id="weather-content">
                    ${this.renderWeatherContent()}
                </div>
            </div>
        `;

        // Setup event listeners
        this.setupEventListeners();
    }

    /**
     * Validate zip code format
     * @param {string} zipcode - The zipcode to validate
     * @returns {boolean} - Whether the zipcode is valid
     */
    validateZipCode(zipcode) {
        // US zip code format: 5 digits or 5+4 digits with a hyphen
        const zipRegex = /^\d{5}(-\d{4})?$/;
        return zipRegex.test(zipcode);
    }

    /**
     * Render the weather data section based on state
     */
    renderWeatherContent() {
        if (this.isLoading) {
            return this.getLoadingTemplate();
        }

        if (this.error) {
            return this.getErrorTemplate();
        }

        if (!this.weatherData) {
            return `<div class="text-sm text-gray-500 text-center py-4">Enter a ZIP code above to see the weather.</div>`;
        }

        return this.getWeatherTemplate();
    }

    /**
     * Update just the weather content section
     */
    updateWeatherContent() {
        const contentContainer = document.getElementById('weather-content');
        if (contentContainer) {
            contentContainer.innerHTML = this.renderWeatherContent();
        } else {
            console.error('Weather component: weather-content element not found when updating');
            this.render();
        }
    }

    /**
     * Fetch weather data for a specific location (must be a validated zip code)
     */
    async fetchWeather(query) {
        if (!this.validateZipCode(query)) {
            console.error('Weather component: fetchWeather called with invalid query:', query);
            this.validationError = 'Invalid ZIP code format.';
            this.render();
            return;
        }

        try {
            this.validationError = null;
            
            console.log('Weather component: Fetching weather for', query);
            this.isLoading = true;
            this.error = null;
            this.lastQuery = query;
            this.updateWeatherContent();

            this.weatherData = await weatherApi.getCurrentWeather(query);
            console.log('Weather component: Current weather data received', this.weatherData);
            
            try {
                const forecastData = await weatherApi.getForecast(query, 3);
                console.log('Weather component: Forecast data received', forecastData);
                if (forecastData && forecastData.forecast) {
                    this.weatherData.forecast = forecastData.forecast;
                }
            } catch (forecastError) {
                console.warn('Weather component: Error fetching forecast, continuing with current weather only', forecastError);
            }

        } catch (error) {
            console.error('Weather component: Error fetching weather data:', error);
            this.error = error.message || 'Failed to fetch weather data';
            
            if (error.response && error.response.data && error.response.data.error) {
                this.error = error.response.data.error.message || this.error;
            }
        } finally {
            this.isLoading = false;
            this.updateWeatherContent();
        }
    }

    /**
     * Template for loading state
     */
    getLoadingTemplate() {
        return `
            <div class="flex items-center justify-center py-4">
                <svg class="animate-spin h-5 w-5 text-indigo-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-sm text-gray-500">Loading weather data...</span>
            </div>
        `;
    }

    /**
     * Template for error state
     */
    getErrorTemplate() {
        return `
            <div class="text-center py-4">
                <div class="flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm font-medium text-red-600">${this.error}</span>
                </div>
                <button id="retry-weather" class="text-xs text-indigo-600 hover:text-indigo-500">
                    Try again
                </button>
            </div>
        `;
    }

    /**
     * Template for weather data display
     */
    getWeatherTemplate() {
        if (!this.weatherData || !this.weatherData.current) {
            return `<div class="text-sm text-red-500 text-center py-4">Weather data is invalid or incomplete</div>`;
        }

        const { location, current, forecast } = this.weatherData;
        
        const weatherHTML = `
            <div class="mb-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-medium text-gray-900">${location.name}</h4>
                        <p class="text-sm text-gray-500">
                            ${location.region}, ${location.country}
                        </p>
                        <div class="flex items-center mt-2">
                            <span class="text-2xl font-bold text-gray-900">${current.temp_f}°F</span>
                        </div>
                    </div>
                    <div class="flex flex-col items-center">
                        <img src="${current.condition.icon}" alt="${current.condition.text}" class="w-16 h-16">
                        <span class="text-sm text-gray-700">${current.condition.text}</span>
                    </div>
                </div>
                
                <div class="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        Feels like: ${current.feelslike_f}°F
                    </div>
                    <div class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                        Wind: ${current.wind_kph} km/h
                    </div>
                    <div class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                        Humidity: ${current.humidity}%
                    </div>
                    <div class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        UV: ${current.uv}
                    </div>
                </div>
            </div>
        `;

        let forecastHTML = '';
        if (forecast && forecast.forecastday && forecast.forecastday.length > 0) {
            forecastHTML = `
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <h5 class="text-sm font-medium text-gray-900 mb-2">3-Day Forecast</h5>
                    <div class="grid grid-cols-3 gap-2">
                        ${forecast.forecastday.map(day => `
                            <div class="text-center p-2 rounded-lg bg-gray-50">
                                <p class="text-xs font-medium">${this.formatDate(day.date)}</p>
                                <img src="${day.day.condition.icon}" alt="${day.day.condition.text}" class="w-10 h-10 mx-auto my-1">
                                <p class="text-xs">${day.day.avgtemp_f}°F</p>
                                <p class="text-xs text-gray-500">${day.day.condition.text}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        return weatherHTML + forecastHTML + `
            <div class="mt-3 text-xs text-gray-500 text-right">
                Last updated: ${current.last_updated}
            </div>
        `;
    }

    /**
     * Format date for forecast display
     */
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const form = document.getElementById('weather-search-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const zipcode = document.getElementById('weather-zipcode').value.trim();
                if (zipcode) {
                    if (this.validateZipCode(zipcode)) {
                        this.fetchWeather(zipcode);
                    } else {
                        this.validationError = 'Please enter a valid 5-digit zip code';
                        this.render();
                    }
                } else {
                    this.weatherData = null;
                    this.error = null;
                    this.validationError = null;
                    this.lastQuery = null;
                    this.updateWeatherContent();
                }
            });
        } else {
            console.error('Weather component: weather-search-form not found');
        }

        const zipcodeInput = document.getElementById('weather-zipcode');
        if (zipcodeInput) {
            zipcodeInput.addEventListener('input', () => {
                if (this.validationError) {
                    this.validationError = null;
                    const errorElem = zipcodeInput.parentElement.nextElementSibling;
                    if (errorElem && errorElem.classList.contains('text-red-500')) {
                        errorElem.textContent = 'Enter a 5-digit ZIP code (US only)';
                        errorElem.classList.remove('text-red-500');
                        errorElem.classList.add('text-gray-500');
                        
                        zipcodeInput.classList.remove('border-red-300');
                        zipcodeInput.classList.add('border-gray-300');
                    }
                }
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target.id === 'retry-weather') {
                const currentZip = document.getElementById('weather-zipcode')?.value.trim();
                const queryToRetry = currentZip || this.lastQuery;
                
                if (queryToRetry && this.validateZipCode(queryToRetry)) {
                     this.fetchWeather(queryToRetry);
                } else if (queryToRetry) {
                    this.validationError = 'Please enter a valid 5-digit zip code to retry.';
                    this.render();
                } else {
                    console.log('Weather component: Retry clicked, but no valid zip code available to retry.');
                }
            }
        });
    }

    /**
     * Initialize the component
     */
    init() {
        console.log('Weather component: Initializing');
        this.render();
    }
    
    /**
     * Clean up resources when component is destroyed
     */
    destroy() {
    }
}

export default WeatherComponent; 