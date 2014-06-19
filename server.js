var express = require('express')

  , http = require('http')
  , path = require('path')
  , passport = require('passport');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(passport.initialize());
  app.use(express.methodOverride());
  app.use('/gate-codes', app.router);  
  app.use('/gate-codes', express.static(path.join(__dirname, './app'))); 
});

//app.get('/', function (req, res) { res.sendfile('./app/index.html'); });

require('./api/codes').setup(app);
require('./api/auth').setup(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
