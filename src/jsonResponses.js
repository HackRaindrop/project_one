const books = require('../data/books.json');

const respondJSON = (request, response, status, object) => {
  const content = JSON.stringify(object);

  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });

  // Write content if not HEAD or 204
  if (request.method !== 'HEAD' && status !== 204) {
    response.write(content);
  }

  response.end();
};

const getBooks = (request, response) => {
  let result = books;

  // Check if user wants to limit total book results
  const url = new URL(request.url, `http://${request.headers.host}`);
  const limit = url.searchParams.get('limit');

  // If limit is specified, only send that many books
  if (limit) {
    const numLimit = parseInt(limit, 10);
    // Return 400 if limit is invalid
    if (Number.isNaN(numLimit) || numLimit < 0) {
      const errorMsg = { message: 'Bad Request: limit must be a positive number' };
      return respondJSON(request, response, 400, errorMsg);
    }
    result = books.slice(0, numLimit);
  }

  return respondJSON(request, response, 200, result);
};

const getAuthors = (request, response) => {
  const authorNames = books.map((book) => book.author);

  // Create set of unique authors and sort
  const uniqueAuthors = [...new Set(authorNames)].sort();

  return respondJSON(request, response, 200, uniqueAuthors);
};

const getGenres = (request, response) => {
  let allGenres = [];
  books.forEach((book) => {
    if (book.genres) {
      allGenres = allGenres.concat(book.genres);
    }
  });

  // Create set of unique genres and sort
  const uniqueGenres = [...new Set(allGenres)].sort();

  return respondJSON(request, response, 200, uniqueGenres);
};

const getLanguages = (request, response) => {
  const languageNames = books.map((book) => book.language);

  // Create set of unique languages and sort
  const uniqueLanguages = [...new Set(languageNames)].sort();

  return respondJSON(request, response, 200, uniqueLanguages);
};

const notFound = (request, response) => {
  const errorMsg = { message: 'The page you are looking for was not found.' };
  return respondJSON(request, response, 404, errorMsg);
};

// Add book to books array
const addBook = (request, response) => {
  const responseJSON = {
    message: 'Title, author, and language are required.',
  };

  const { title, author, language } = request.body;

  // If either author or title is missing, send 400
  if (!title || !author || !language) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // Check if book already exists
  const existingBook = books.find((book) => book.title === title);
  if (existingBook) {
    // Update existing book (204)
    existingBook.author = author;
    existingBook.language = language;
    return respondJSON(request, response, 204, {});
  }
  // Create new book (201)
  books.push({
    title,
    author,
    year: new Date().getFullYear(),
    pages: 0,
    language,
    country: 'Unknown',
  });
  responseJSON.message = 'Created Successfully';
  return respondJSON(request, response, 201, responseJSON);
};

module.exports = {
  getBooks,
  getAuthors,
  getGenres,
  getLanguages,
  notFound,
  addBook,
};
