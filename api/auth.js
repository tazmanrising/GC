var http = require('http'); // to make service requests

var ADMINGROUP = "GATECODES"; // the admin group to query against ldap

// make requset to ldap service 
// PARAMETERS:
// callback - is callback to call after http service request has been
// completed
// NOTE:
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
      // call user callback and pass response body as json
      callback(null, JSON.parse(buff));
    }).on('error', function (err) {
      callback(err);
    });

  }).end(); // make sure to call end to make request

};

// get the current user
// PARAMETERS:
// req - is the request object from express
// callback - callback to call after user has been composed
// NOTE: 
// make sure that iisnode has the following setting web.config
//  <iisnode promoteServerVars="LOGON_USER" />
// and that only windows auth is enabled (disable anonymous auth)
var getUser = function (req, callback) {

  // req.headers["x-iisnode-logon_user"] should be a string like "domain\\username"
  var user = req.headers["x-iisnode-logon_user"].split('\\');

  ldapApi(function (err, admins) {
    if (err) {
      callback(err);
    } else {
      var found = false;
      admins.forEach(function (admin) {
        if (admin.NTID == user[1]) {
          found = true;
        }
      });
      // send data from request to callback
      callback(null, {
        domain: user[0],
        ntid: user[1],
        admin: found
      });
    }
  });

};

// middleware determine if the current user is an admin user
exports.isAdmin = function (req, res, next) {

  // get user from request headers
  getUser(req, function (err, user) {
    if (err) {
      res.json(500, err);
    } else {
      if (user.admin == true) {
        next();
      } else {
        res.json(401, "unauthorized");
      }
    }
  });

};

// function for registering api end points
exports.setup = function (app) {

  // get info about the currently authenticated user
  // ex:
  // { domain: "SRPCORP", ntid: "ASBADAHD", admin: true }
  app.get('/api/user', function (req, res) {

    // get user from request headers
    getUser(req, function (err, user) {
      if (err) {
        res.json(500, err);
      } else {
        res.json(200, user);
      }
    });
  });

};
