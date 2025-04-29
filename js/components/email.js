//Email Component for TimeBridge
const { Resend } = require('resend');

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Function to send meeting confirmation email
async function sendMeetingConfirmationEmail({ to, subject, html }) {
  try {
    const response = await resend.emails.send({
      from: 'varunmantha@yahoo.com', // your verified sender email (for testing Resend account)
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = { sendMeetingConfirmationEmail };
