
const model = require('../models/game')

const get = () => model.findAll()

const create = (id, name) => model.create(id, name)

const gameManager = {
  get,
  create
}

module.exports = gameManager
