
const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const socketIo = require('socket.io');
const io = socketIo(server);
const bodyParser = require('body-parser');

const cors = require('./middlewares/cors');
const session = require('./middlewares/session');

const auth = require('./routers/auth');
const game = require('./routers/game');

const stoneage = io.of('/stoneage');

stoneage.on('connection', socket => {
   console.log('connected to socket');
   socket.on('message', msg => {
      stoneage.emit('message', msg);
      console.log(`message \"${msg}\" was sent`);
   })
   socket.on('join', roomName => {
      socket.join(roomName);
      console.log(`joined to ${roomName} room`);
   })
   socket.on('disconnect', () => {
      console.log('disconnected');
   })
})


app.use( (req, res, next) => {
   res.io = io;
   next();
})
app.use(session);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors);


app.use('/', auth);
app.use('/games', game);


app.use( (err, req, res, next) => {
   res.status(err.status || 500);
   res.render('error', {
      message: err.message,
      error: {}
   });
});

const appExports = {
   app,
   server
}

module.exports = appExports;