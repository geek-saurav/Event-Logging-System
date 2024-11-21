const crypto = require('crypto');

const hashEvent = (event) => {
    const hash = crypto.createHash('sha256');
    hash.update(`${event.previous_hash}${event.event_type}${event.timestamp}${event.source_app_id}${JSON.stringify(event.data_payload)}`);
    return hash.digest('hex');
};

module.exports = { hashEvent };
