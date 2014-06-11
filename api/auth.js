var http = require('http'); // to make service requests

var ADMINGROUP = "GATECODES"; // the admin group to query against ldap

// make requset to ldap service argument is callback to call
// after http service has been made
// expect ldap-api service to be running at http://srpdoc03/ldap-api
var ldapApi = function (callback) {

  // might need to use env variables instead of hard coded vars
  var options = {
    host: 'srpdoc03',
    path: '/ldap-api/api/users?group=' + ADMINGROUP,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  // make http request and call user callback
  // the response body is sent in chunks, so we need to
  // buffer all the chuncks before we can use it
  http.request(options, function (res) {
    var buff = "";
    res.on('data', function (chunk) {
      // buffer chunks here 
      buff += chunk;
    }).on('end', function () {
      callback(null, JSON.parse(buff));
    });
  }).end(); // make sure to call end to make request

};

// middleware determine if the current user is an admin user
exports.isAdmin = function (req, res, next) {

  // get username from headers
  // make sure that iisnode has the following setting web.config
  //  <iisnode promoteServerVars="LOGON_USER" />
  // req.headers["x-iisnode-logon_user"] should be a string like "domain\\username"
  var user = req.headers["x-iisnode-logon_user"].split('\\');

  // check if username is not null then make request to ldap-api service
  ldapApi(function (err, data) {
    var found = false;
    data.forEach(function (admin) {
      if (admin.NTID == user[1]) {
        found = true;
      }
    });
    if (found == true) {
      next();
    } else {
      res.json(401, { status: 401, message: "unauthorized" });
    }
  });

};

exports.setup = function (app) {

  // get info about the currently authenticated user
  // ex:
  // { domain: "SRPCORP", ntid: "ASBADAHD", admin: true }
  app.get('/api/user', function (req, res) {

    // grab user name from headers
    var user = req.headers["x-iisnode-logon_user"].split('\\');

    ldapApi(function (err, data) {

      var found = false;

      data.forEach(function (admin) {
        if (admin.NTID == user[1]) {
          found = true;
        }
      });

      res.json({
        domain: user[0],
        ntid: user[1],
        admin: found
      });

    });

  });
};
