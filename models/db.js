var mongodb = require('mongodb'),
    settings = require('../settings'),
    Db = mongodb.Db,
    Connection = mongodb.Connection,
    Server = mongodb.Server,
    db = new Db(settings.db, new Server(settings.host, Connection.DEFAULT_PORT, {auto_reconnect: true})
  );

module.exports = db.open(function(){});
/*  // callback: (err, db)
  function openDatabase(callback) {
    db.open(function(err, db) {
      if (err)
        return callback(err);

      console.log('Database connected');
      return callback(null, db);
    });
  }

  exports.openDatabase = openDatabase;*/