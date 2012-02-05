var http = require('http'),
  querystring = require('querystring');

module.exports = function(options, callback) {
  var post_data = querystring.stringify(options);

  var request = http.request({
    host: 'documentup.com',
    port: 80,
    path: '/compiled',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': post_data.length
    }
  }, function(response) {
    var body = '';
    response.setEncoding('utf8');
    response.on('data', function(chunk) {
      body += chunk;
    });
    response.on('end', function() {
      callback(body);
    });
  });
  
  request.on('error', function(error) {
    console.log('problem with request: ' + error.message);
  });
  
  // write data to request body
  request.write(post_data);
  request.end();

};

