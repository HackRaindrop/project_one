const http = require('http');
const htmlResponses = require('./HTMLResponses.js');
const jsonResponses = require('./jsonResponses.js');

// Set port
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// Parse body of request
const parseBody = (request, response, handler) => {
  const body = [];

  // Handle errors
  request.on('error', (e) => {
    console.dir(e);
    response.statusCode = 400;
    response.end();
  });

  // Add chunk to body
  request.on('data', (chunk) => {
    body.push(chunk);
  });

  // Parse body of request
  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    try {
      request.body = JSON.parse(bodyString);
      handler(request, response);
    } catch (e) {
      // Return 400 for invalid JSON
      const errorMsg = { message: 'Bad Request: Invalid JSON' };
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.write(JSON.stringify(errorMsg));
      response.end();
    }
  });
};

// Handle POST requests
const handlePost = (request, response, parsedURL) => {
  if (parsedURL.pathname === '/addBook') {
    return parseBody(request, response, jsonResponses.addBook);
  }
  // Return 404 for unknown POST endpoints
  return jsonResponses.notFound(request, response);
};

// Handle GET requests
const handleGet = (request, response, parsedURL) => {
  switch (parsedURL.pathname) {
    case '/style.css':
      return htmlResponses.getCSS(request, response);
    case '/':
      return htmlResponses.getIndex(request, response);
    case '/getBooks':
      return jsonResponses.getBooks(request, response);
    case '/getAuthors':
      return jsonResponses.getAuthors(request, response);
    case '/getGenres':
      return jsonResponses.getGenres(request, response);
    case '/getLanguages':
      return jsonResponses.getLanguages(request, response);
    default:
      return jsonResponses.notFound(request, response);
  }
};

// Handle all requests
const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https:' : 'http';
  const parsedURL = new URL(request.url, `${protocol}://${request.headers.host}`);

  if (request.method === 'POST') {
    handlePost(request, response, parsedURL);
  } else {
    handleGet(request, response, parsedURL);
  }
};

// Create server
http.createServer(onRequest).listen(port);
