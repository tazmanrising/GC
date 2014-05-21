var sql = require('mssql');

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
            request.query('select [ID],[Dist],[Address],[ApartmentName] from tblGateCodes', function (err, recordset) {
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