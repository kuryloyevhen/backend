
const model = require('../models/user')

const login = (name, password) =>
  model.findMatch(name, password)

const register = (name, password, email) =>
  model.create(name, password, email)

const userManager = {
  login,
  register
}

module.exports = userManager
