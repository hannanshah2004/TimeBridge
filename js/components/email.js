//Email Component for TimeBridge
const { Resend } = require('resend');

// Load the API Key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

async function sendMeetingConfirmationEmail(toEmail, meetingDetails) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: toEmail,
            subject: `Meeting Confirmed: ${meetingDetails.title}`,
            html: `
                <h1>Your Meeting is Confirmed!</h1>
                <p><strong>Title:</strong> ${meetingDetails.title}</p>
                <p><strong>Time:</strong> ${meetingDetails.time}</p>
                <p><strong>Location:</strong> ${meetingDetails.location}</p>
                <p>Thanks for using TimeBridge!</p>
            `
        });

        if (error) {
            console.error('Error sending email:', error);
            throw error;
        }

        console.log('Email sent successfully:', data);
    } catch (err) {
        console.error('Failed to send confirmation email:', err);
        throw err;
    }
}

// Export the function
module.exports = { sendMeetingConfirmationEmail };
