
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
var playerStatistic = {};
var playerMovement = {};

stoneage.on('connection', socket => {

   socket.on('join', roomName => {
      playerStatistic[socket.id] = {
         wood: 0,
         clay: 0,
         stone: 0,
         gold: 0,
         agronomyLevel: 0,
         workTools: 0,
         dwellings: {},
         civilizationCards: {},
         points: 0,
         population: 5,
         foodAmount: 12
      }
      socket.join(roomName);
   })

   socket.on('message', body => {
      stoneage.to(body.room).emit('message', body.message);
   })

   socket.on('movement', data => {
      var player = playerMovement[socket.id] = {};
   })

   socket.on('return', () => {

   })

   socket.on('feed', () => {
      let player = playerStatistic[socket.id];
      let neededFood = player.population - player.agronomyLevel;
      if(neededFood > 0) {
         player.foodAmount - neededFood;
      }
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
   res.json({
      message: err.message,
      error: err
   });
});

const appExports = {
   app,
   server
}

module.exports = appExports;