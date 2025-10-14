const http = require('http');
const htmlResponses = require('./HTMLResponses.js');
const jsonResponses = require('./jsonResponses.js');

// Set port
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// Parse body of request
const parseBody = (request, response, handler) => {
  const body = [];

  // Handle errors
  request.on('error', () => {
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
    const contentType = request.headers['content-type'];

    try {
      if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
        // Parse URL-encoded data
        const params = new URLSearchParams(bodyString);
        request.body = {};
        params.forEach((value, key) => {
          request.body[key] = value;
        });
      } else {
        // Parse JSON data (default)
        request.body = JSON.parse(bodyString);
      }
      handler(request, response);
    } catch (e) {
      // Return 400 for invalid data format
      const errorMsg = {
        message: contentType && contentType.includes('application/x-www-form-urlencoded')
          ? 'Bad Request: Invalid form data'
          : 'Bad Request: Invalid JSON',
      };
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
  if (parsedURL.pathname === '/reviewBook') {
    return parseBody(request, response, jsonResponses.reviewBook);
  }
  // Return 404 for unknown POST endpoints
  return jsonResponses.notFound(request, response);
};

// Handle GET and HEAD requests
const handleGet = (request, response, parsedURL) => {
  switch (parsedURL.pathname) {
    case '/style.css':
      return htmlResponses.getCSS(request, response);
    case '/':
      return htmlResponses.getIndex(request, response);
    case '/doc.html':
      return htmlResponses.getDoc(request, response);
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
    return handlePost(request, response, parsedURL);
  }
  if (request.method === 'GET' || request.method === 'HEAD') {
    return handleGet(request, response, parsedURL);
  }
  // Return 404 for unsupported methods
  return jsonResponses.notFound(request, response);
};

// Create server
http.createServer(onRequest).listen(port);
