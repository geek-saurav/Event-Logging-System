const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const eventsRouter = require('./routes/events');
const WebSocket = require('ws');
const { verifyChain } = require('./utils/verifyChain');

dotenv.config();

const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Set up WebSocket server
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });
app.wss = wss; // Attach WebSocket server to the Express app

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Server is running smoothly' });
});

// API route for events
app.use('/events', eventsRouter);

// Verify event log chain at regular intervals (e.g., every minute)
setInterval(async () => {
    try {
        const isChainValid = await verifyChain();
        if (isChainValid) {
            console.log('Event log chain is valid.');
        } else {
            console.log('Event log chain is invalid. Tampering detected!');
        }
    } catch (error) {
        console.error('Error verifying event log chain:', error);
    }
}, 60000); // Check every minute

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
