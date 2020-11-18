/* FTP START */
var ftpd = require('ftpd');
var fs = require('fs');
var path = require('path');
var keyFile;
var certFile;
var server;
var options = {
  host: process.env.IP || '127.0.0.1',
  port: process.env.PORT+123 || 3001,
  tls: null,
};

if (process.env.KEY_FILE && process.env.CERT_FILE) {
  console.log('Running as FTPS server');
  if (process.env.KEY_FILE.charAt(0) !== '/') {
    keyFile = path.join(__dirname, process.env.KEY_FILE);
  }
  if (process.env.CERT_FILE.charAt(0) !== '/') {
    certFile = path.join(__dirname, process.env.CERT_FILE);
  }
  options.tls = {
    key: fs.readFileSync(keyFile),
    cert: fs.readFileSync(certFile),
    ca: !process.env.CA_FILES ? null : process.env.CA_FILES
      .split(':')
      .map(function (f) {
        return fs.readFileSync(f);
      }),
  };
} else {
  console.log();
  console.log('*** To run as FTPS server,                 ***');
  console.log('***  set "KEY_FILE", "CERT_FILE"           ***');
  console.log('***  and (optionally) "CA_FILES" env vars. ***');
  console.log();
}

server = new ftpd.FtpServer(options.host, {
  getInitialCwd: function (connection, callback) {
    var userDir = '/root';
    fs.exists(userDir, function (exists) {
      if (exists) {
        callback(null, userDir);
      } else {
        fs.mkdir(userDir, function (err) {
          callback(err, userDir);
        });
      }
    });
  },
  getRoot: function (connection, callback) {

    //var rootPath = process.cwd() + '/' + connection.username;



    var userDir = '/root';


    console.log("PATHS");
    console.log(userDir);

    fs.exists(userDir, function (exists) {
      if (exists) {
        callback(null, userDir);
      } else {
        if (connection.username == "root") {

          fs.mkdir(userDir, function (err) {
            if (err) {
              callback(null, '/home/mikesb/'); // default to root
            } else {
              callback(err, userDir);
            }
          });
        }
      }
    });

  },
  pasvPortRangeStart: 1025,
  pasvPortRangeEnd: 1050,
  tlsOptions: options.tls,
  allowUnauthorizedTls: true,
  useWriteFile: true,
  useReadFile: true,
  uploadMaxSlurpSize: 7000, // N/A unless 'useWriteFile' is true.
  host: options.host,
  port: options.port
});

server.on('error', function (error) {
  console.log('FTP Server error:', error);
});

server.on('client:connected', function (connection) {
  var username = null;
  console.log('client connected: ' + connection.remoteAddress);
  connection.on('command:user', function (user, success, failure) {
    if (user) {
      username = user;
      success();
    } else {
      failure();
    }
  });

  connection.on('command:pass', function (pass, success, failure) {
    if (pass) {
      success(username);
    } else {
      failure();
    }
  });
});

server.debugging = 4;
server.listen(options.port);
console.log('Listening on port ' + options.port);

module.exports = server;
/* FTP END */