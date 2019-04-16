
const express = require('express')
const app = express()
const http = require('http')
const server = http.Server(app)
const socketIo = require('socket.io')
const io = socketIo(server)
const bodyParser = require('body-parser')
const redisAdapter = require('socket.io-redis')
const cors = require('./middlewares/cors')
const session = require('./middlewares/session').session
const redisClient = require('./middlewares/session').redisClient
const auth = require('./routers/auth')
const game = require('./routers/game')
io.adapter(redisAdapter({ host: '127.0.0.1', port: 6379 }))

const stoneage = io.of('/stoneage')
var playerStatistics = { }
var playerMovements = { }
var players = []
var players2 = []
var playerIndex = 0

stoneage.on('connection', socket => {
  socket.on('join', roomName => {
    players.push(socket.id);
    playerMovements[socket.id] = {
      food: 0,
      wood: 0,
      clay: 0,
      stone: 0,
      gold: 0,
      agronomy: 0,
      smithy: 0,
      reproduction: 0,
      id: socket.id
    }
    playerStatistics[socket.id] = {
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
      food: 12,
      id: socket.id
    }
    socket.join(roomName)
    socket.emit('setID', socket.id);
    socket.emit('changes', playerStatistics[socket.id])
    socket.emit('changePhase', 'movement')
    redisClient.lrange('msgs', 0, -1, (err, reply) => {
      stoneage.to(roomName).emit('message', reply)
    })
    stoneage.to(roomName).emit('changePlayer', players[playerIndex]);
  })

  socket.on('message', body => {
    redisClient.rpush('msgs', body.message)
    redisClient.lrange('msgs', 0, -1, (err, reply) => {
      stoneage.to(body.room).emit('message', reply)
    })
  })

  socket.on('movement', data => {
    console.log(playerIndex);
    playerIndex++;
    if (playerStatistics[socket.id].population >= data.amount) {
      if (data.resource) {
        playerMovements[socket.id][data.resource] += data.amount
        playerStatistics[socket.id].population -= data.amount
      }
      if (data.staff) {
        playerMovements[socket.id][data.staff] += data.amount
        playerStatistics[socket.id].population -= data.amount
      }
      socket.emit('changes', playerStatistics[socket.id])
      redisClient.set('playerSteps', JSON.stringify(playerMovements[socket.id]));
      redisClient.get('playerSteps', (err, reply) => {
        stoneage.to(data.room).emit('movement', JSON.parse(reply));
      })
      if (playerStatistics[socket.id].population === 0) {         // something is wrong with conditions
         let elem = players.slice(playerIndex, playerIndex + 1);
         players2.push(elem[0]);
         stoneage.to(data.room).emit('changePlayer', players[playerIndex]);
       }
       if (players.length === 0) {
          players = players2;
          players2 = [];
       }
      if (playerIndex < players.length) {
         stoneage.to(data.room).emit('changePlayer', players[playerIndex]);
      } else {
         stoneage.to(data.room).emit('changePlayer', players[0]);
         playerIndex = 0;
      }
    } else {
      socket.emit('movementError', 'Not enough people')
    }
  })

  socket.on('changes', data => {
    for (let prop in data) {
      if (data.hasOwnProperty(prop) && data.propertyIsEnumerable(prop)) {
         playerStatistics[socket.id][prop] = data[prop]
      }
    }
  })

  socket.on('return', data => {
    playerStatistics[socket.id].population += data.people
    playerMovements[socket.id][data.resourceName] = 0
    playerStatistics[socket.id][data.resourceName] = data.resourceAmount
    socket.emit('changes', playerStatistics[socket.id])
    stoneage.emit('return', data)
    if (data === 'end') {
      socket.emit('changePhase', 'feed')
    }
  })

  socket.on('feed', () => {
    let neededFood = playerStatistics[socket.id].population - playerStatistics[socket.id].agronomyLevel
    if (neededFood > 0) {
      playerStatistics[socket.id].food -= neededFood
    }
    socket.emit('changes', playerStatistics[socket.id])
    socket.emit('changePhase', 'movement')
  })

  socket.on('disconnect', () => {})
})

app.use((req, res, next) => {
  res.io = io
  next()
})
app.use(session)
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors)

app.use('/', auth)
app.use('/games', game)

app.use((err, req, res) => {
  res.status(err.status || 500)
  res.json({
    message: err.message,
    error: err
  })
})

const appExports = {
  app,
  server
}

module.exports = appExports
