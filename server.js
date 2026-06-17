require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer'); 
const nodemailer = require('nodemailer');
import { Analytics } from "@vercel/analytics/next"
const app = express();
// This line is CRITICAL for Render
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Startup Check
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.error("\n🚨 CRITICAL ERROR: Could not load credentials from .env file!");
    console.error("Make sure your .env file is in the same folder as server.js.\n");
}

// File Upload Config
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Email Config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
});

// Database & Security (with .trim() fix)
let projects = [];
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim();

// --- API Routes ---

// 1. Get Projects
// Add this near your other routes
app.get('/', (req, res) => {
    res.send('Backend server is running successfully!');
});

app.get('/api/projects', (req, res) => {
    res.json(projects);
});

// 2. Add Project
app.post('/api/projects', upload.single('image'), (req, res) => {
    const { email, password, title, description } = req.body;

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Incorrect email or password!" });
    }
    if (!title || !description || !req.file) {
        return res.status(400).json({ error: "Title, description, and image are required." });
    }

    projects.push({ 
        id: Date.now().toString(),
        title, 
        description, 
        imageUrl: `/uploads/${req.file.filename}` 
    });
    
    res.status(200).json({ success: "Project added successfully!" });
});

// 3. Delete Project
app.delete('/api/projects/:id', (req, res) => {
    const email = req.headers['admin-email'];
    const password = req.headers['admin-password']; 
    const projectId = req.params.id;

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Incorrect email or password!" });
    }

    projects = projects.filter(project => project.id !== projectId);
    res.status(200).json({ success: 'Project deleted!' });
});

// 4. Contact Form (Real Email)
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        const mailOptions = {
            from: email,
            to: process.env.GMAIL_USER, 
            subject: `Portfolio Message from ${name}`,
            text: `You have a new message from your portfolio website!\n\nName: ${name}\nEmail: ${email}\nMessage:\n${message}`,
            replyTo: email
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email successfully sent from ${name}`);
        res.status(200).json({ success: 'Message sent!' });
    } catch (error) {
        console.error("Email error:", error);
        res.status(500).json({ error: 'Failed to send email. Check credentials.' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});