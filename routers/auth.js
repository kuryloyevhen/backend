
const express = require('express')
const router = express.Router()
const manager = require('../managers/auth')

router.post('/login', (req, res, next) =>
  manager.login(req.body.name, req.body.password)
    .then(result => {
      req.session.isAuthorized = 'true'
      res.json(result)
    })
    .catch(err => next(err))
)

router.post('/register', (req, res, next) => {
  manager.register(req.body.name, req.body.password, req.body.email)
    .then(result => res.json(result))
    .catch(err => next(err))
}
)

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy(err => {
      next(err)
    })
    res.end()
  } else res.json({})
})

module.exports = router
