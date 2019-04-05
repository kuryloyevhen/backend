
const app = require('./app').app;
const server = require('./app').server;
const model = require('./models/sequelize-config');
const host = '127.0.0.1';
const port = process.env.PORT || 3000;


model.sequelize.sync()
   .then( () => {
      server.listen(port, host);
      server.on('error', onError);
      server.on('listening', onListening)
   })


function onError(err) {
   console.error('Error:', err);
}

function onListening() {
   console.log(`listening on port ${port}`);
}

