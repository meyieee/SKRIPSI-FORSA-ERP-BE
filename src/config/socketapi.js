const io = require("socket.io")();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Bergabung ke dalam room
  socket.on('join room', (room) => {
    if (!room) {
      console.log(`Room is invalid: ${room}`);
      socket.emit('join error', { message: 'Invalid room name' });
      return; // Hentikan eksekusi jika room tidak valid
     }
    
    // Pastikan socket belum bergabung
    if (!socket.rooms.has(room)) { 
        socket.join(room); 
        console.log(`User ${socket.id} joined room: ${room}`);
        socket.to(room).emit('user joined', `User ${socket.id} has joined the room ${room}`);
    } else {
        console.log(`User ${socket.id} is already in room: ${room}`);
    }
  });

  // Keluar dari room
  socket.on('leave room', (room) => {
    socket.leave(room); // Keluar dari room
    console.log(`User ${socket.id} left room: ${room}`);
    socket.to(room).emit('user left', `User ${socket.id} has left the room ${room}`);
  });

  // Mengirim pesan ke room tertentu
  socket.on('chat message', ({ room, msg }) => {
    console.log(`Message to room ${room}: ${msg}`);
    io.to(room).emit('chat message', { sender: socket.id, msg });
  });

  // Event disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  // Error handling
  socket.on('error', (err) => {
    console.error(`Socket error: ${err.message}`);
  });
});

const socketapi = {
  io: io
};

module.exports = socketapi;
