# TimeBridge - Meeting Scheduling Application

TimeBridge is a user-friendly scheduling application that helps you manage your meetings and availability with a beautiful calendar interface. It's built with modern web technologies and offers smart features to streamline your scheduling workflow.

## Project Structure

```
timebridge/
├── server.js               # Express backend server
├── index.html              # Authentication page
├── dashboard.html          # Main dashboard interface
├── booking.html            # Meeting booking page for invitees
├── css/
│   └── styles.css          # Custom CSS styles
├── js/
│   ├── app.js              # Main application script
│   ├── auth.js             # Authentication utilities
│   ├── supabaseClient.js   # Supabase database client
│   ├── apiClient.js        # API client for external services
│   └── components/         # Reusable UI components
│       ├── calendar.js     # Calendar component
│       ├── meetings.js     # Meetings list component
│       └── weather.js      # Weather widget component
└── tests/                  # Jest tests
    └── weather.test.js     # Tests for weather component
```

## Getting Started


### Installation

1. Clone the repository
   ```
   git clone https://github.com/hannanshah2004/TimeBridge.git
   cd timebridge
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your API keys:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   WEATHER_API_KEY=your_weather_api_key
   GOOGLE_API_KEY=your_google_places_api_key
   GOOGLE_AI_API_KEY=your_gemini_api_key
   EMAIL_API_KEY=your_sendgrid_api_key
   ```

4. Start the development server
   ```
   npm run dev
   ```

5. Open your browser to `http://localhost:3000`


## Testing

TimeBridge uses Jest for testing components. To run the tests:

```
npm test
```

We have configured Jest with Babel to support ES modules in our testing environment.

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Calendar**: FullCalendar
- **Weather**: WeatherAPI
- **AI**: Google Gemini
- **Location**: Google Places API
- **Email**: SendGrid
- **Testing**: Jest

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
