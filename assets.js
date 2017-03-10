var express = require('express');
var fs = require('fs');

var router = express.Router();
var content = fs.readFileSync('.hyperdev-assets', 'utf8');

// Example url
// https://cdn.gomix.com/us-east-1%3A1a0f89c8-26bf-4073-baed-2b409695e959%2Ffoobar.png

// For some reason the .hyperdev-assets file is not parseable by JSON.parse :|
router.get('/:name', function (request, response) {
  var name = '%2F' + request.params.name + '"';
  var index = content.indexOf(name);
  if (index < 0) {
    return response.sendStatus(404);
  }
  var startIndex = index - 1;
  while (startIndex >= 0) {
    if (content[startIndex] === '"') {
      break;
    }
    startIndex -= 1;
  }
  if (startIndex === 0) {
    return response.sendStatus(503);
  }
  startIndex += 1;
  var endIndex = index + name.length - 1;
  var url = content.substring(startIndex, endIndex);
  return response.redirect(url);
});

module.exports = router;
