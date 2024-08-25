const jsonServer = require('json-server');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const dbPath = path.join(__dirname, 'db.json');
const saveInterval = 60 * 60 * 1000; // 1 hour in milliseconds

// CORS options
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
};

server.use(cors(corsOptions));
server.use(middlewares);

let inMemoryDb = router.db; // Use in-memory data initially

// Custom route for handling pagination for courses
server.get('/api/courses', (req, res) => {
    const limit = parseInt(req.query._limit) || 10;
    const page = parseInt(req.query._page) || 1;

    const courses = inMemoryDb.get('courses').value();

    const totalItems = courses.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedCourses = courses.slice(startIndex, endIndex);

    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    res.json({
        data: paginatedCourses,
        prev: prevPage,
        next: nextPage,
        pages: totalPages,
        currentPage: page,
    });
});

// Custom route for handling pagination and filtering by role for users
server.get('/api/users', (req, res) => {
    const limit = parseInt(req.query._limit) || 10;
    const page = parseInt(req.query._page) || 1;
    const role = req.query.role; // Get the role from query parameter

    let users = inMemoryDb.get('users').value(); // Get the users array

    // If role is specified, filter the users by role (admin/user)
    if (role) {
        users = users.filter(user => user.role === role);
    }

    const totalItems = users.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = users.slice(startIndex, endIndex);

    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    res.json({
        data: paginatedUsers,
        prev: prevPage,
        next: nextPage,
        pages: totalPages,
        currentPage: page,
    });
});

// Function to save in-memory data to db.json
function saveToFile() {
    fs.writeFile(dbPath, JSON.stringify(inMemoryDb.getState(), null, 2), err => {
        if (err) {
            console.error('Error saving data to file:', err);
        }
    });
}

// Save data to file every hour
setInterval(saveToFile, saveInterval);

// Update in-memory data whenever changes occur
server.use((req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        req.on('end', () => {
            inMemoryDb = router.db;
        });
    }
    next();
});

// Handle other routes with default json-server behavior
server.use(router);

server.listen(3000, () => {
    console.log('JSON Server is running');
});

module.exports = server;
