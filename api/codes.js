var sql = require('mssql')
  , auth = require('./auth');

var config = {
    user: 'eso',
    password: 'rwesodoc1',
    server: 'SQLDEV3\\DS3', // You can use 'localhost\\instance' to connect to named instance
    database: 'GateCodes'
};

exports.setup = function (app) {
  app.get('/api/codes', function (req, res) {

    var connection = new sql.Connection(config, function (err) {
      var request = new sql.Request(connection); // or: var request = connection.request();
      request.query('SELECT ID as id , Dist as district, Address as address, ApartmentName as location, RAS as ras, Incode as incode, Forty as forty, CoordinatesEW as ewcoord, CoordinatesNS as nscoord, Comments as comment  FROM tblGateCodes', function (err, recordset) {
        // ... error checks
        if (err) {
          res.json(500, err);
        } else {
          res.json(200, recordset);
        }
      });
    });
  });
};
