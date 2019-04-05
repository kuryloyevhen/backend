
const model = require('../models/game');
const io = require('../server');

const get = () => model.findAll();

const create = (id, name) => model.create(id, name);



const gameManager = {
   get,
   create
};

module.exports = gameManager;