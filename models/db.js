var mongodb = require('mongodb'),
    settings = require('../settings'),
    Db = mongodb.Db,
    Connection = mongodb.Connection,
    Server = mongodb.Server;
module.exports = new Db(settings.db, new Server(settings.host, Connection.DEFAULT_PORT, {auto_reconnect: true})
  )