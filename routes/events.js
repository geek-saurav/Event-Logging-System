const express = require('express');
const EventLog = require('../models/EventLog');
const { hashEvent } = require('../utils/hash');
const router = express.Router();

// Log an event
router.post('/', async (req, res) => {
    try {
        const { event_type, source_app_id, data_payload } = req.body;

        // Validate required fields
        if (!event_type || !source_app_id || !data_payload) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Fetch the last event to link the hash
        const lastEvent = await EventLog.findOne().sort({ timestamp: -1 });

        const newEvent = new EventLog({
            event_type,
            source_app_id,
            data_payload,
            previous_hash: lastEvent ? lastEvent.current_hash : '',
        });

        // Hash the new event
        newEvent.current_hash = hashEvent(newEvent);

        // Save the event
        await newEvent.save();

        // Broadcast the new event to WebSocket clients
        if (req.app.wss) {
            req.app.wss.clients.forEach(client => {
                if (client.readyState === client.OPEN) {
                    client.send(JSON.stringify(newEvent));
                }
            });
        }

        res.status(201).json(newEvent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get events with filtering and pagination
router.get('/', async (req, res) => {
    const { event_type, start_time, end_time, page = 1, per_page = 10 } = req.query;

    const query = {};
    if (event_type) query.event_type = event_type;
    if (start_time || end_time) {
        query.timestamp = {};
        if (start_time) query.timestamp.$gte = new Date(start_time);
        if (end_time) query.timestamp.$lte = new Date(end_time);
    }

    const events = await EventLog.find(query)
        .skip((page - 1) * per_page)
        .limit(Number(per_page))
        .exec();

    res.status(200).json(events);
});

module.exports = router;
