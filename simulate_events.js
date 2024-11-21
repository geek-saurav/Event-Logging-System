const axios = require('axios');

const simulateEvents = async () => {
    const eventTypes = ['USER_LOGIN', 'FILE_UPLOAD', 'DATA_EXPORT', 'ERROR_REPORT'];
    const sourceApps = ['App_A', 'App_B', 'App_C', 'App_D'];

    for (let i = 0; i < 50; i++) {
        const event = {
            event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
            source_app_id: sourceApps[Math.floor(Math.random() * sourceApps.length)],
            data_payload: { randomData: Math.random().toString(36).substr(2, 8) },
        };

        try {
            await axios.post('http://localhost:3000/events', event);
            console.log('Event logged:', event);
        } catch (error) {
            console.error('Error logging event:', error.message);
        }
    }
};

simulateEvents();
