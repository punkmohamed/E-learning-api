const jsonServer = require('json-server');
const cors = require('cors');

const server = jsonServer.create();
const middlewares = jsonServer.defaults();
const router = jsonServer.router('db.json');

// CORS options
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Total-Count'],
};

server.use(cors(corsOptions));
server.options('*', cors(corsOptions));
server.use(middlewares);

// Custom middleware to handle pagination response
server.use((req, res, next) => {
    res.on('finish', () => {
        const totalItems = res.getHeader('X-Total-Count'); // Get total count
        const limit = parseInt(req.query._limit) || 10; // Get limit (default to 10)
        const page = parseInt(req.query._page) || 1; // Get current page (default to 1)

        // Calculate the pagination data
        const totalPages = Math.ceil(totalItems / limit);
        const nextPage = page < totalPages ? page + 1 : null;
        const prevPage = page > 1 ? page - 1 : null;

        // Add custom pagination info to the response
        res.locals.data = {
            data: res.locals.data,
            prev: prevPage,
            next: nextPage,
            pages: totalPages,
            currentPage: page,
        };
    });
    next();
});

server.use(jsonServer.rewriter({
    '/api/*': '/$1',
    '/blog/:resource/:id/show': '/:resource/:id',
}));

server.use(router);

server.listen(3000, () => {
    console.log('JSON Server is running');
});

module.exports = server;
