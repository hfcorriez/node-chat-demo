/**
 * Module dependencies.
 */

var express = require('express')
    , http = require('http')
    , io = require('socket.io')
    , app = express.createServer()
    , connect = require('express/node_modules/connect')
    , MemoryStore = connect.middleware.session.MemoryStore
    , sessionStore = new MemoryStore()
    , parseCookie = connect.utils.parseSignedCookie;

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ secret:"key", store:sessionStore}));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

app.get('/', function (req, res) {
    var data = {
        title:'sleeping',
        cookie:req.cookies.test,
        session:req.session.test
    };
    if (!req.session.hasOwnProperty('test')) req.session.test = 'hold sessions.';
    if (!req.cookies.hasOwnProperty('test')) req.cookies.test = 'hold cookies.';
    console.log('SessionID: ' + parseCookie(req.cookies['connect.sid'], 'key'));
    console.log(sessionStore);
    res.render('index', data);
});
app.get('/chat', function (req, res) {
    res.render('chat', {title:'聊天室'});
});

app.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});