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
    const responseJSON = books;
    respondJSON(request, response, 200, responseJSON);
}

module.exports = {
    getBooks
};