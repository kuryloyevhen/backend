
const Sequelize = require('sequelize')
const sequelize = new Sequelize('stoneage', 'admin', '12345', {
  host: '127.0.0.1',
  dialect: 'postgres'
})

sequelize.authenticate()
  .then(() => {
    console.log('Connection is OK')
  })
  .catch(err => {
    console.error('Connection isn\'t OK', err)
  })

module.exports = {
  Sequelize,
  sequelize
}
