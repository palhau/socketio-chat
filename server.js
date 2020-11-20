const express = require('express');
const server = require('http').Server(express);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});

const PORT = 4000;
const NEW_CHAT_MESSAGE_EVENT = 'newChatMessage';

const users = [];
const queue = [];

io.on('connection', (socket) => {
  const { roomId } = socket.handshake.query;

  const queueManagement = (socket) => {
    if (queue.indexOf(socket) !== -1) {
      queue.remove(socket);
      socket.join(roomId);
    }
    // else if (queue.length >= 3) {
    //   socket.leave(roomId);
    // }
    else {
      queue.push(socket);
    }
  };
  socket.join(roomId);

  console.log('Queue', queue.length);

  if (queue.length < 2) {
    console.log('if');
    users.push(socket.id);
    queueManagement(socket);
  } else {
    console.log('else');
    queueManagement(socket);
    setTimeout(() => socket.disconnect(true));
    console.log('userLogged', socket.id + 'add in the queue');
  }

  console.log('Queue', queue.length);

  console.log('users arr', users.length);

  console.log('User ' + socket.id + ' connected');
  // console.log(users);

  socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
    io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
  });

  socket.on('disconnect', () => {
    console.log('User ' + socket.id + ' disconnected');
    // queueManagement(users[1]);
    socket.leave(roomId);
    queue[0].join(roomId);
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
