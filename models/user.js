
const orm = require('./sequelize-config');

const User = orm.sequelize.define('user', {
   id: {
      type: orm.Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id',
      allowNull: false
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
   timestamps: false
});

const findMatch = (name, password) => 
   User.findOne({
      where: {
         name,
         password
      }
   });

const create = (name, password, email) => {
   let newUser = User.build({
      id: 2,
      name,
      password,
      email
   });
   return newUser.save();
}
   


const userModel = {
   findMatch,
   create
}

module.exports = userModel;