
const orm = require('./sequelize-config')

const Room = orm.sequelize.define('rooms', {
  id: {
    type: orm.Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: orm.Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  }
}, {
  timestamps: false,
  freezeTableName: true
})

const findAll = () => Room.findAll()

const create = (id, name) => {
  let newRoom = Room.build({
    id,
    name
  })
  return newRoom.save()
}

const roomModel = {
  findAll,
  create
}

module.exports = roomModel
