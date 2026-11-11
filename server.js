const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Memoria del servidor (aquí se guardan los mensajes mientras la app esté encendida)
let chatHistory = [];
const ADMIN_NAME = "Robustcart";

io.on('connection', (socket) => {
  // Enviar el historial al usuario que se acaba de conectar
  socket.emit('history', chatHistory);

  // Avisar a todos que alguien entró (opcional)
  socket.on('userJoined', (username) => {
    socket.username = username;
    if (username !== ADMIN_NAME) {
      socket.emit('message', {
        user: 'Sistema',
        text: `Bienvenido ${username}. Estás en modo lectura.`,
        time: new Date().toLocaleTimeString()
      });
    }
  });

  // Recibir un mensaje (solo si el usuario es el Admin)
  socket.on('chatMessage', (data) => {
    if (data.user === ADMIN_NAME) {
      const newMessage = {
        user: data.user,
        text: data.text,
        time: new Date().toLocaleTimeString()
      };
      
      chatHistory.push(newMessage);
      // Limitar el historial a los últimos 50 mensajes para no saturar
      if (chatHistory.length > 50) chatHistory.shift();

      // Enviar el mensaje a TODOS los conectados
      io.emit('message', newMessage);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});