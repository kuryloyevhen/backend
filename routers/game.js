
const express = require('express')
const router = express.Router()
const manager = require('../managers/game')

router.get('/', (req, res, next) => {
  manager.get()
    .then(result => res.json(result))
    .catch(err => next(err))
})

router.post('/', (req, res, next) => {
  manager.create(req.body.id, req.body.name)
    .then(result => res.json(result))
    .catch(err => next(err))
})

module.exports = router
