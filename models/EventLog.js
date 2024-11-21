const mongoose = require('mongoose');

const EventLogSchema = new mongoose.Schema({
    event_type: {
        type: String,
        required: true,
        maxlength: 100,
        enum: ['USER_LOGIN', 'FILE_UPLOAD', 'DATA_EXPORT', 'ERROR_REPORT'], // Add valid event types
    },
    timestamp: { type: Date, default: Date.now },
    source_app_id: { type: String, required: true, maxlength: 100 },
    data_payload: {
        type: Object,
        required: true,
        validate: {
            validator: function (v) {
                return typeof v === 'object' && !Array.isArray(v); // Ensures data_payload is JSON
            },
            message: 'Data payload must be a valid JSON object.'
        },
    },
    previous_hash: { type: String, default: "" },
    current_hash: { type: String, default: "" }
});

// Indexing for faster querying
EventLogSchema.index({ event_type: 1 });
EventLogSchema.index({ timestamp: 1 });
EventLogSchema.index({ source_app_id: 1 });

const EventLog = mongoose.model('EventLog', EventLogSchema);

module.exports = EventLog;
