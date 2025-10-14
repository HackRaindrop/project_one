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

  // Check url parameters
  const url = new URL(request.url, `http://${request.headers.host}`);
  const author = url.searchParams.get('author');
  const genre = url.searchParams.get('genre');
  const language = url.searchParams.get('language');
  const yearFrom = url.searchParams.get('yearFrom');
  const yearTo = url.searchParams.get('yearTo');
  const search = url.searchParams.get('search');
  const limit = url.searchParams.get('limit');

  // Filter by author
  if (author) {
    result = result.filter((book) => book.author.toLowerCase().includes(author.toLowerCase()));
  }

  // Filter by genre
  if (genre) {
    result = result.filter((book) => book.genres
      && book.genres.some((g) => g.toLowerCase().includes(genre.toLowerCase())));
  }

  // Filter by language
  if (language) {
    result = result.filter((book) => book.language.toLowerCase().includes(language.toLowerCase()));
  }

  // Filter by year range
  if (yearFrom) {
    const numYearFrom = parseInt(yearFrom, 10);
    if (!Number.isNaN(numYearFrom)) {
      result = result.filter((book) => book.year >= numYearFrom);
    }
  }

  if (yearTo) {
    const numYearTo = parseInt(yearTo, 10);
    if (!Number.isNaN(numYearTo)) {
      result = result.filter((book) => book.year <= numYearTo);
    }
  }

  // Search across title and author
  if (search) {
    const searchTerm = search.toLowerCase();
    result = result.filter((book) => book.title.toLowerCase().includes(searchTerm)
      || book.author.toLowerCase().includes(searchTerm));
  }

  // Apply limit if specified
  if (limit) {
    const numLimit = parseInt(limit, 10);
    if (Number.isNaN(numLimit) || numLimit < 0) {
      const errorMsg = { message: 'Bad Request: limit must be a positive number' };
      return respondJSON(request, response, 400, errorMsg);
    }
    result = result.slice(0, numLimit);
  }

  return respondJSON(request, response, 200, result);
};

const getAuthors = (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const author = url.searchParams.get('author');
  const genre = url.searchParams.get('genre');
  const language = url.searchParams.get('language');
  const search = url.searchParams.get('search');
  const limit = url.searchParams.get('limit');

  let result = books;

  // Filter by specific author if provided
  if (author) {
    result = result.filter((book) => book.author.toLowerCase().includes(author.toLowerCase()));
  }

  // Filter by genre
  if (genre) {
    result = result.filter((book) => book.genres
      && book.genres.some((g) => g.toLowerCase().includes(genre.toLowerCase())));
  }

  // Filter by language
  if (language) {
    result = result.filter((book) => book.language.toLowerCase().includes(language.toLowerCase()));
  }

  // Search across title and author
  if (search) {
    const searchTerm = search.toLowerCase();
    result = result.filter((book) => book.title.toLowerCase().includes(searchTerm)
      || book.author.toLowerCase().includes(searchTerm));
  }

  // Group books by author
  const booksByAuthor = {};
  result.forEach((book) => {
    if (!booksByAuthor[book.author]) {
      booksByAuthor[book.author] = [];
    }
    booksByAuthor[book.author].push(book);
  });

  // Convert to array format with counts
  const authorData = Object.keys(booksByAuthor)
    .sort()
    .map((authorName) => ({
      author: authorName,
      count: booksByAuthor[authorName].length,
      books: booksByAuthor[authorName],
    }));

  // Apply limit if specified
  let finalResult = authorData;
  if (limit) {
    const numLimit = parseInt(limit, 10);
    if (Number.isNaN(numLimit) || numLimit < 0) {
      const errorMsg = { message: 'Bad Request: limit must be a positive number' };
      return respondJSON(request, response, 400, errorMsg);
    }
    finalResult = authorData.slice(0, numLimit);
  }

  return respondJSON(request, response, 200, finalResult);
};

const getGenres = (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const genre = url.searchParams.get('genre');
  const author = url.searchParams.get('author');
  const language = url.searchParams.get('language');
  const search = url.searchParams.get('search');
  const limit = url.searchParams.get('limit');

  let result = books;

  // Filter by author
  if (author) {
    result = result.filter((book) => book.author.toLowerCase().includes(author.toLowerCase()));
  }

  // Filter by language
  if (language) {
    result = result.filter((book) => book.language.toLowerCase().includes(language.toLowerCase()));
  }

  // Search across title and author
  if (search) {
    const searchTerm = search.toLowerCase();
    result = result.filter((book) => book.title.toLowerCase().includes(searchTerm)
      || book.author.toLowerCase().includes(searchTerm));
  }

  // Group books by genre
  const booksByGenre = {};
  result.forEach((book) => {
    if (book.genres) {
      book.genres.forEach((bookGenre) => {
        // Filter by specific genre if provided
        if (!genre || bookGenre.toLowerCase().includes(genre.toLowerCase())) {
          if (!booksByGenre[bookGenre]) {
            booksByGenre[bookGenre] = [];
          }
          // Avoid duplicate books in same genre
          if (!booksByGenre[bookGenre].some((b) => b.title === book.title)) {
            booksByGenre[bookGenre].push(book);
          }
        }
      });
    }
  });

  // Convert to array format with counts
  const genreData = Object.keys(booksByGenre)
    .sort()
    .map((genreName) => ({
      genre: genreName,
      count: booksByGenre[genreName].length,
      books: booksByGenre[genreName],
    }));

  // Apply limit if specified
  let finalResult = genreData;
  if (limit) {
    const numLimit = parseInt(limit, 10);
    if (Number.isNaN(numLimit) || numLimit < 0) {
      const errorMsg = { message: 'Bad Request: limit must be a positive number' };
      return respondJSON(request, response, 400, errorMsg);
    }
    finalResult = genreData.slice(0, numLimit);
  }

  return respondJSON(request, response, 200, finalResult);
};

const getLanguages = (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const language = url.searchParams.get('language');
  const author = url.searchParams.get('author');
  const genre = url.searchParams.get('genre');
  const search = url.searchParams.get('search');
  const limit = url.searchParams.get('limit');

  let result = books;

  // Filter by specific language if provided
  if (language) {
    result = result.filter((book) => book.language.toLowerCase().includes(language.toLowerCase()));
  }

  // Filter by author
  if (author) {
    result = result.filter((book) => book.author.toLowerCase().includes(author.toLowerCase()));
  }

  // Filter by genre
  if (genre) {
    result = result.filter((book) => book.genres
      && book.genres.some((g) => g.toLowerCase().includes(genre.toLowerCase())));
  }

  // Search across title and author
  if (search) {
    const searchTerm = search.toLowerCase();
    result = result.filter((book) => book.title.toLowerCase().includes(searchTerm)
      || book.author.toLowerCase().includes(searchTerm));
  }

  // Group books by language
  const booksByLanguage = {};
  result.forEach((book) => {
    if (!booksByLanguage[book.language]) {
      booksByLanguage[book.language] = [];
    }
    booksByLanguage[book.language].push(book);
  });

  // Convert to array format with counts
  const languageData = Object.keys(booksByLanguage)
    .sort()
    .map((lang) => ({
      language: lang,
      count: booksByLanguage[lang].length,
      books: booksByLanguage[lang],
    }));

  // Apply limit if specified
  let finalResult = languageData;
  if (limit) {
    const numLimit = parseInt(limit, 10);
    if (Number.isNaN(numLimit) || numLimit < 0) {
      const errorMsg = { message: 'Bad Request: limit must be a positive number' };
      return respondJSON(request, response, 400, errorMsg);
    }
    finalResult = languageData.slice(0, numLimit);
  }

  return respondJSON(request, response, 200, finalResult);
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

// Add review to a book
const reviewBook = (request, response) => {
  const responseJSON = {
    message: 'Title and rating (1-5) are required.',
  };

  const { title, rating, review } = request.body;

  // Validate required fields
  if (!title || !rating) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  // Validate rating is between 1-5
  const numRating = parseInt(rating, 10);
  if (Number.isNaN(numRating) || numRating < 1 || numRating > 5) {
    responseJSON.message = 'Rating must be a number between 1 and 5.';
    responseJSON.id = 'invalidRating';
    return respondJSON(request, response, 400, responseJSON);
  }

  // Find the book
  const book = books.find((b) => b.title === title);
  if (!book) {
    responseJSON.message = 'Book not found.';
    responseJSON.id = 'bookNotFound';
    return respondJSON(request, response, 400, responseJSON);
  }

  // Initialize reviews array if it doesn't exist
  if (!book.reviews) {
    book.reviews = [];
  }

  // Check if review already exists
  const existingReviewIndex = book.reviews.findIndex(() => true);
  const reviewData = {
    rating: numRating,
    review: review || '',
  };

  if (existingReviewIndex >= 0) {
    // Update existing review (204)
    book.reviews[existingReviewIndex] = reviewData;
    return respondJSON(request, response, 204, {});
  }
  // Add new review (201)
  book.reviews.push(reviewData);
  responseJSON.message = 'Review added successfully';
  return respondJSON(request, response, 201, responseJSON);
};

module.exports = {
  getBooks,
  getAuthors,
  getGenres,
  getLanguages,
  notFound,
  addBook,
  reviewBook,
};
