var express = require('express');
var http = require('http');

var app = module.exports.app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 5000);
  app.set('postsPerPage', 3);
  app.set('prod', process.env.NODE_ENV === 'production');
  app.set('views', __dirname+'/views');
  app.set('view engine', 'jade');
  app.use(express.compress());
  app.use(express.favicon(__dirname+'/public'+'/favicon.ico'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware(__dirname+'/public'));
  app.use(express['static'](__dirname+'/public'));
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// HOME PAGE
app.get('/', function(req, res) {
  res.render('index', { title: 'Platformer' });
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Started on port ' + app.get('port'));
});
