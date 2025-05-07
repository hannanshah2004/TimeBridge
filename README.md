# TimeBridge - Meeting Scheduling Application

TimeBridge is a user-friendly scheduling application that helps you manage your meetings and availability with a beautiful calendar interface. It's built with modern web technologies and offers smart features to streamline your scheduling workflow.

## Features

- 📅 **Interactive Calendar**: View and manage your schedule with a responsive, intuitive calendar
- ⚡ **Smart Scheduling**: Set your availability and let others book time with you
- 🤖 **AI-Powered**: Generate meeting descriptions automatically with Google's Gemini AI
- 🌦️ **Weather Integration**: View weather conditions for meeting days
- 📍 **Location Suggestions**: Easily add meeting locations with Google Places autocomplete
- 📨 **Email Notifications**: Receive notifications for meeting confirmations via SendGrid
- ✅ **Meeting Management**: Approve, reschedule, or cancel meeting requests
- 🔗 **Shareable Links**: Copy your schedule link to share with others

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

### Prerequisites

- Node.js 16+ and npm
- Supabase account (free tier works fine)
- Optional API keys:
  - Google Places API for location autocomplete
  - Google Gemini AI for generating meeting descriptions
  - WeatherAPI for weather information
  - SendGrid for email notifications

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/timebridge.git
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

## Database Setup

TimeBridge uses Supabase as its backend database. To set up the required tables:

1. Create a Supabase project
2. Create a `Meetings` table with the following schema:
   - `id`: UUID (primary key)
   - `uuid`: UUID (user ID)
   - `title`: Text
   - `start`: Timestamp
   - `end`: Timestamp
   - `requesterName`: Text
   - `requesterEmail`: Text
   - `attendees`: Text[]
   - `description`: Text
   - `meetingLocation`: Text
   - `status`: Text (enum: 'pending', 'approved', 'canceled')
   - `color`: Text

## Usage

### Authentication

TimeBridge offers user authentication via Supabase Auth:
- Sign up with your email and password
- Sign in to access your dashboard
- "Remember me" functionality for convenience

### Dashboard

The dashboard provides an overview of your upcoming meetings and important information:
- Current weather conditions
- Upcoming meetings list
- Quick actions for your meetings

### Calendar View

The calendar view gives you a detailed look at your schedule:
- Month and week views
- Create new meetings
- Set your availability
- See busy times

### Meeting Management

Manage all your meetings efficiently:
- View meeting details
- Approve or decline meeting requests
- Cancel existing meetings
- Filter meetings by time period (today, this week, this month)

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

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [FullCalendar](https://fullcalendar.io/) for the calendar component
- [Font Awesome](https://fontawesome.com/) for the icons