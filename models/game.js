
const orm = require('./sequelize-config');

const Room = orm.sequelize.define('room', {
   id: {
      type: orm.Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
   },
   name: {
      type: orm.Sequelize.STRING,
      allowNull: false,
      primaryKey: true
   }
}, {
   timestamps: false
});

const findAll = () => Room.findAll();

const create = (id, name) => {
   let newRoom = Room.build({
      id,
      name
   });
   return newRoom.save().then( () => Room.findAll() );
};

const roomModel = {
   findAll,
   create
}

module.exports = roomModel;