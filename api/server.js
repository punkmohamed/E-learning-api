const jsonServer = require('json-server');
const cors = require('cors');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// CORS options
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
};

server.use(cors(corsOptions));
server.use(middlewares);

// Custom route for handling pagination
server.get('/api/courses', (req, res) => {
    const limit = parseInt(req.query._limit) || 10; // Get limit (default to 10)
    const page = parseInt(req.query._page) || 1; // Get current page (default to 1)

    const db = router.db; // Access the db.json file
    const courses = db.get('courses').value(); // Get the courses array

    // Calculate total count and pagination
    const totalItems = courses.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedCourses = courses.slice(startIndex, endIndex);

    // Build pagination metadata
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;

    res.json({
        data: paginatedCourses, // Paginated data
        prev: prevPage, // Previous page number
        next: nextPage, // Next page number
        pages: totalPages, // Total pages
        currentPage: page, // Current page number
    });
});

// Handle other routes with default json-server behavior
server.use(router);

server.listen(3000, () => {
    console.log('JSON Server is running');
});

module.exports = server;
