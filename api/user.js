exports.setup = function (app) {
  app.get('/api/user', function (req, res) {
    res.json({
      user: req.headers["x-iisnode-logon_user"].split('\\')
    });
  });
};