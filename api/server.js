const jsonServer = require('json-server');
const cors = require('cors');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// CORS options
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
};

server.use(cors(corsOptions));
server.use(middlewares);

// Custom route for handling pagination for courses
server.get('/api/courses', (req, res) => {
    const limit = parseInt(req.query._limit) || 10;
    const page = parseInt(req.query._page) || 1;

    const db = router.db;
    const courses = db.get('courses').value();

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

    const db = router.db;
    let users = db.get('users').value(); // Get the users array

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

// Handle other routes with default json-server behavior
server.use(router);

server.listen(3000, () => {
    console.log('JSON Server is running');
});

module.exports = server;
