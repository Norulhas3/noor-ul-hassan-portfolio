const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Allows your frontend HTML to communicate with this backend
app.use(express.json()); // Parses incoming JSON data from the frontend

// API Route to handle contact form submissions
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    // Validate the data
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // In a real production app, you would save this to a database (like MongoDB) 
    // or send an email (using Nodemailer). For now, we will log it to the console.
    console.log('--- New Contact Message ---');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Message: ${message}`);
    console.log('---------------------------');

    // Send a success response back to the frontend
    res.status(200).json({ success: 'Message received loud and clear!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});