var path = require("path");
var mime = require('mime');
var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var Promise = require("bluebird");
var fs = require("fs");
var curry = require("curry");

Promise.promisifyAll(fs);

var filterDotFiles = true;
var basePath = process.cwd();
if (process.argv.length >= 3) {
  basePath = process.argv[2];
}

function isFileAllowedToBeListed(filename) {
  return filterDotFiles && !isHiddenFile(filename);
}

function isHiddenFile(file) {
  return file.substring(0,1) == ".";
}
function fileStats(filePath) {
  return fs.lstatAsync(filePath);
}

function fileData(file, dirPath, fullPath) {
  return fileStats(path.resolve(fullPath, file)).then(function (stats) {
    var result = {
      filename: file,
      path: path.join(dirPath, file),
      isDirectory: stats.isDirectory()
    };
    if (!stats.isDirectory()) {
      result.mimeType = mime.lookup(file);
    }
    return result;
  });
}

function fileDataMapper(dirPath, fullPath) {
  return function (file) { return fileData(file, dirPath, fullPath); };
}

function filesRequestHandler(req, res) {
  var dirPath = req.query.path;
  var fullPath = path.resolve(basePath, dirPath);
  console.log("listing " + fullPath);

  var fileList = fs.readdirAsync(fullPath);
  var filteredFiles = fileList.filter(isFileAllowedToBeListed);
  var fileWithData = filteredFiles.map(fileDataMapper(dirPath, fullPath));
  Promise.all(fileWithData)
    .then(function(files){ 
      res.status(200).json(files).end();
    })
    .error(function(error) { 
      console.error(error);
      res.status(400).end();
    });

}

function createServer() {
  var app = express();
  app.use(bodyParser.json());

  app.get('/files', filesRequestHandler);

  var server = http.Server(app);
  server.listen(4040, function() {
    console.log("restfs server listening on port %d", server.address().port);
  });
}

createServer();    