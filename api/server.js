const jsonServer = require('json-server');
const cors = require('cors');

const server = jsonServer.create();

// Uncomment to allow write operations
// const fs = require('fs');
// const path = require('path');
// const filePath = path.join('db.json');
// const data = fs.readFileSync(filePath, "utf-8");
// const db = JSON.parse(data);
// const router = jsonServer.router(db);

// Comment out to allow write operations
const router = jsonServer.router('db.json');

const middlewares = jsonServer.defaults();

const corsOptions = {
    origin: '*', // Allow all origins. Change this to your specific domain if needed.
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
    exposedHeaders: ['Content-Length', 'X-Total-Count', 'X-Custom-Header'], // Expose custom headers if needed
};

server.use(cors(corsOptions)); // Apply CORS middleware with options
server.options('*', cors(corsOptions)); // Handle preflight requests


server.use(middlewares);

// Add this before server.use(router)
server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/blog/:resource/:id/show': '/:resource/:id',
}));

server.use(router);

server.listen(3000, () => {
    console.log('JSON Server is running');
});

// Export the Server API
module.exports = server;
