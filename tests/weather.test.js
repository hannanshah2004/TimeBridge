// tests/weather.test.js
import WeatherComponent from '../js/components/weather.js';
import { weatherApi } from '../js/apiClient.js';

jest.mock('../js/apiClient.js', () => ({
  weatherApi: {
    getCurrentWeather: jest.fn(),
    getForecast: jest.fn()
  }
}));

describe('WeatherComponent.fetchWeather()', () => {
  let weatherComponent;

  beforeEach(() => {
    const container = document.createElement('div');
    weatherComponent = new WeatherComponent(container);
    weatherComponent.render = jest.fn();
    weatherComponent.updateWeatherContent = jest.fn();
  });

  it('calls weatherApi methods and updates state correctly', async () => {
    const zip = '10001';

    const mockCurrent = {
      location: { name: 'New York', region: 'NY', country: 'USA' },
      current: { temp_c: 22, temp_f: 71.6, condition: { icon: '', text: 'Sunny' }, feelslike_c: 21, wind_kph: 15, humidity: 60, uv: 3, last_updated: '2025-05-05' }
    };

    const mockForecast = {
      forecast: {
        forecastday: [
          { date: '2025-05-06', day: { condition: { icon: '', text: 'Cloudy' }, avgtemp_c: 20 } },
          { date: '2025-05-07', day: { condition: { icon: '', text: 'Rain' }, avgtemp_c: 18 } },
          { date: '2025-05-08', day: { condition: { icon: '', text: 'Sunny' }, avgtemp_c: 23 } }
        ]
      }
    };

    weatherApi.getCurrentWeather.mockResolvedValue(mockCurrent);
    weatherApi.getForecast.mockResolvedValue(mockForecast);

    await weatherComponent.fetchWeather(zip);

    expect(weatherApi.getCurrentWeather).toHaveBeenCalledWith(zip);
    expect(weatherApi.getForecast).toHaveBeenCalledWith(zip, 3);
    expect(weatherComponent.weatherData).toHaveProperty('forecast');
    expect(weatherComponent.error).toBeNull();
    expect(weatherComponent.validationError).toBeNull();
    expect(weatherComponent.lastQuery).toBe(zip);
    expect(weatherComponent.isLoading).toBe(false);
  });
});
