var mongodb = require('mongodb'),
    Db = mongodb.Db,
    Connection = mongodb.Connection,
    Server = mongodb.Server,
    client = null;

    new Db('blog', new Server('localhost', Connection.DEFAULT_PORT, {auto_reconnect: true})
    ).open(function (err, c) {
      if (!err) {
        client = c;
        console.log('database connected');
      } else {
        console.log('database connection error', err);
      }
    });

exports.get = function() { return client; };
