var Server = require('socket.io'); // 支援 ArrayBuffer
// 未來要寫多個聊天室，就有進程問題，要怎麼把 IO 投到 http server
var io = new Server(); // 實例化 到內存 
// 不要提供客戶端任何檔案 static file 不能使用 server.path('/upload/1.jpg')
// www http 設定的 Server.attach(httpServer[, options])，上面將無法使用server.path
io.serveClient(false); // default: true: whether to serve the client files

exports.io = io; // 將 io 給http server

// Chatroom 1
// io.on('connection', function(socket){
//     socket.on('chat message', function(msg){
//         console.log(msg)
//         io.emit('chat message', msg);
//     });
// });

// <!-- FROM https://github.com/socketio/socket.io -->
// Chatroom
var numUsers = 0;
// 箭頭函數 
// io.on('', function(socket){}) 等同
// var add = function (a,b){ return a+b } 等同 var add = (a,b) => a+b
io.on('connection', (socket) => {
  var addedUser = false;

  // when the client emits 'new message', this listens and executes
  socket.on('new message', (data) => {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', (username) => {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', () => {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', () => {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});