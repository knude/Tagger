import http from 'http';

import config from './utils/config';
import app from './app';

const server = http.createServer(app);

server.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});