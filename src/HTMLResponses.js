const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);
const doc = fs.readFileSync(`${__dirname}/../client/doc.html`);

// Index of page
const getIndex = (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/html',
    'Content-Length': Buffer.byteLength(index, 'utf8'),
  });

  // Write content if not HEAD request
  if (request.method !== 'HEAD') {
    response.write(index);
  }

  response.end();
};

// CSS file
const getCSS = (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/css',
    'Content-Length': Buffer.byteLength(css, 'utf8'),
  });

  // Write content if not HEAD request
  if (request.method !== 'HEAD') {
    response.write(css);
  }

  response.end();
};

// Documentation file
const getDoc = (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/html',
    'Content-Length': Buffer.byteLength(doc, 'utf8'),
  });

  // Write content if not HEAD request
  if (request.method !== 'HEAD') {
    response.write(doc);
  }

  response.end();
};

// Export
module.exports = {
  getIndex,
  getCSS,
  getDoc,
};
