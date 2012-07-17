var io = require('socket.io').listen(3001);

/**
 * Socket.io
 */
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