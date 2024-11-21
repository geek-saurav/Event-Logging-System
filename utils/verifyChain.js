const EventLog = require('../models/EventLog');
const { hashEvent } = require('./hash');

const verifyChain = async () => {
    const events = await EventLog.find().sort({ timestamp: 1 }).exec();
    let previousHash = '';

    for (const event of events) {
        const computedHash = hashEvent(event);

        if (event.previous_hash !== previousHash || event.current_hash !== computedHash) {
            console.error(`Tampering detected in event ID: ${event._id}`);
            return false;
        }

        previousHash = event.current_hash;
    }

    console.log('No tampering detected. Chain is valid.');
    return true;
};

module.exports = { verifyChain };
