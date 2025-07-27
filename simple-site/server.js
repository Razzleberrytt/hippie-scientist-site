const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 8080;
const base = path.resolve(__dirname);

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') {
    urlPath = '/index.html';
  }

  const filePath = path.join(base, urlPath);
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Serve 404 page
      fs.readFile(path.join(base, '404.html'), (err404, data404) => {
        if (err404) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(data404);
        }
      });
    } else {
      const ext = path.extname(filePath);
      const mime = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.csv': 'text/csv'
      }[ext] || 'application/octet-stream';

      res.writeHead(200, { 'Content-Type': mime });
      fs.createReadStream(filePath).pipe(res);
    }
  });
}).listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
