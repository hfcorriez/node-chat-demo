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

/**
 * Socket.io
 */
io = io.listen(3001);
var users = {};
io.sockets.on('connection', function (socket) {
    console.log('A socket connected!');
    var refresh_online = function () {
        var count = 0;
        for (i in users) if (users.hasOwnProperty(i)) count++;
        io.sockets.emit('online', count);
    };
    var please_register = function (info) {
        socket.emit('register', info ? info : '请注册');
    };
    if (!socket.username) {
        please_register();
    }

    socket.on('register', function (data) {
        if (users.hasOwnProperty(data)) {
            please_register('用户名重复');
        }
        socket.username = data;
        users[data] = true;
        socket.emit('register ok', data);
        io.sockets.emit('send', '(' + data + ' 进来了)');
        refresh_online();
    });

    socket.on('send', function (data) {
        io.sockets.emit('send', '[' + socket.username + '] ' + data);
    });

    socket.on('disconnect', function () {
        if (socket.hasOwnProperty('username')) {
            io.sockets.emit('send', '(' + socket.username + ' 离开了)');
            delete users[socket.username];
            refresh_online();
        }
    });
});