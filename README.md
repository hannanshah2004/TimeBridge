# TimeBridge - Meeting Scheduling Application

TimeBridge is a user-friendly scheduling application built with HTML, CSS, JavaScript, and Tailwind CSS. It allows users to create and manage meeting requests with a beautiful calendar interface.

![TimeBridge Screenshot](https://via.placeholder.com/800x400?text=TimeBridge+Screenshot)

## Features

- 📅 **Interactive Calendar**: View and manage your schedule with an interactive calendar
- 📨 **Email Notifications**: Receive email notifications for meeting confirmations (simulated)
- ✅ **Meeting Management**: Approve, reschedule, or cancel meeting requests
- 🔗 **Shareable Link**: Copy your schedule link to share with others
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🌐 **No Server Required**: Frontend-only implementation for easy deployment

## Project Structure

```
timebridge/
├── index.html              # Main dashboard page
├── booking.html            # Meeting booking page for invitees
├── css/
│   └── styles.css          # Custom CSS styles
├── js/
│   └── app.js              # Main JavaScript functionality
├── database-integration.md # Guide for database integration
└── README.md               # Project documentation
```

## Getting Started

1. Clone the repository or download the files
2. Open `index.html` in your browser to view the dashboard
3. Open `booking.html` to see the booking page that others would use

No build process or server is required for basic functionality as this is a frontend-only implementation.

## Customization

### Colors and Styling

The application uses Tailwind CSS for styling. You can customize the colors and appearance by modifying the Tailwind classes in the HTML files or by adding custom styles in `css/styles.css`.

### Database Integration

For a real application, you'll want to integrate with a database to store meeting data. See `database-integration.md` for detailed instructions on how to connect TimeBridge with different types of databases:

- JSON file storage (simple)
- SQLite (lightweight)
- MySQL/PostgreSQL (production)

## How It Works

### Dashboard

The dashboard displays upcoming meetings and provides a calendar view of your schedule. You can:

- View pending and approved meetings
- Approve or decline meeting requests
- Reschedule meetings
- Share your booking link

### Booking Page

The booking page allows others to request meetings with you. They can:

- View your availability on the calendar
- Select an available time slot
- Fill out a form with meeting details
- Submit a meeting request

### Meeting Lifecycle

1. A visitor requests a meeting through your booking page
2. You receive a notification of the pending meeting
3. You can approve, reschedule, or cancel the request
4. The requester receives a notification of your decision

## Contributing

Contributions are welcome! Feel free to submit a pull request or open an issue for bugs or feature requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [FullCalendar](https://fullcalendar.io/) for the calendar component
- [Font Awesome](https://fontawesome.com/) for the icons 