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
        const numLimit = parseInt(limit);
        result = books.slice(0, numLimit);
    }
    
    respondJSON(request, response, 200, result);
}

const getAuthors = (request, response) => {

    const authorNames = books.map(book => book.author);
    
    // Create set of unique authors and sort
    const uniqueAuthors = [...new Set(authorNames)].sort();
    
    respondJSON(request, response, 200, uniqueAuthors);
}

const getGenres = (request, response) => {

    let allGenres = [];
    books.forEach(book => {
        if (book.genres) {
            allGenres = allGenres.concat(book.genres);
        }
    });
    
    // Create set of unique genres and sort
    const uniqueGenres = [...new Set(allGenres)].sort();
    
    respondJSON(request, response, 200, uniqueGenres);
}

const getLanguages = (request, response) => {
    const languageNames = books.map(book => book.language);
    
    // Create set of unique languages and sort
    const uniqueLanguages = [...new Set(languageNames)].sort();
    
    respondJSON(request, response, 200, uniqueLanguages);
}

module.exports = {
    getBooks,
    getAuthors,
    getGenres,
    getLanguages,
};