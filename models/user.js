
const orm = require('./sequelize-config')

const User = orm.sequelize.define('users', {
  id: {
    type: orm.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: orm.Sequelize.STRING
  },
  password: {
    type: orm.Sequelize.STRING
  },
  email: {
    type: orm.Sequelize.STRING
  }
}, {
  timestamps: false,
  freezeTableName: true
})

const findMatch = (name, password) =>
  User.findOne({
    where: {
      name,
      password
    }
  })

const create = (name, password, email) => {
  let newUser = User.build({
    name,
    password,
    email
  })
  return newUser.save()
}

const userModel = {
  findMatch,
  create
}

module.exports = userModel
