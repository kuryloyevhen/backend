
const express = require('express');
const app = express();
const http = require('http');
const server = http.Server(app);
const socketIo = require('socket.io');
const io = socketIo(server);
const bodyParser = require('body-parser');
const redisAdapter = require('socket.io-redis');
io.adapter(redisAdapter({host: '127.0.0.1', port: 6379}));

const cors = require('./middlewares/cors');
const session = require('./middlewares/session');

const auth = require('./routers/auth');
const game = require('./routers/game');

const stoneage = io.of('/stoneage');
var playerStatistics = {};
var playerMovements = {};
var playerSteps;
var playerStats;

stoneage.on('connection', socket => {

   socket.on('join', roomName => {
      playerSteps = playerMovements[socket.id] = {
         food: 0,
         wood: 0,
         clay: 0,
         stone: 0,
         gold: 0,
         agronomy: 0,
         smithy: 0,
         reproduction: 0
      };
      playerStats = playerStatistics[socket.id] = {
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
         food: 12
      }
      socket.join(roomName);
      socket.emit('changes', playerStats);
      socket.emit('changePhase', 'movement');
   })

   socket.on('message', body => {
      stoneage.to(body.room).emit('message', body.message);
   })

   socket.on('movement', data => {
      if (playerStats.population >= data.amount) {
			 if (data.resource) {
            playerSteps[data.resource] += data.amount;
            playerStats.population -= data.amount;
      	}
      	if (data.staff) {
         	player[data.staff] += data.amount;
				playerStats.population -= data.amount;
         }
         socket.emit('changes', playerStats);
         stoneage.to(data.room).emit('movement', playerSteps);
		} else {
			socket.emit('movementError', 'Not enough people');
      }
      if (playerStats.population === 0) {
         socket.emit('changePhase', 'return');
      }
     
      
   })

   socket.on('changes', data => {
      for (let prop in data) {
         if (data.hasOwnProperty(prop) && data.propertyIsEnumerable(prop)){
            playerStats[prop] = data[prop];
         }
      }
   })

   socket.on('return', data => {
      playerStats.population += data.people;
      playerStats[data.resourceName] = data.resourceAmount;
      socket.emit('changes', playerStats);
      socket.emit('return', data);
      if (data === 'end') {
         socket.emit('changePhase', 'feed');
      }
   })

   socket.on('feed', () => {
      let neededFood = playerStats.population - playerStats.agronomyLevel;
      if(neededFood > 0) {
         playerStats.food -= neededFood;
      }
      socket.emit('changes', playerStats);
      socket.emit('changePhase', 'movement');
   })

   socket.on('disconnect', () => {
      console.log('disconnected');
   })

})


app.use( (req, res, next) => {
   res.io = io;
   next();
})
app.use(session.session);
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