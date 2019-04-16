
const session = require('express-session')
const redis = require('redis')
const redisClient = redis.createClient()
const RedisStore = require('connect-redis')(session)

const redisOptions = {
  host: '127.0.0.1',
  port: 6379,
  client: redisClient
}

redisClient.on('connect', () => {
  console.log('Redis client conected')
})

const sessionOptions = {
  store: new RedisStore(redisOptions),
  cookie: {
    httpOnly: false,
    secure: false
  },
  name: 'cookieID',
  secret: 'secret',
  saveUninitialized: true,
  resave: false
}

const sessionObject = {
  session: session(sessionOptions),
  redisClient
}

module.exports = sessionObject
