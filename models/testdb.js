var mongodb = require('mongodb'),
    events = require('events'),
    Db = mongodb.Db,
    EE = new events.EventEmitter(),
    Connection = mongodb.Connection,
    Server = mongodb.Server,
    access = new Server('localhost', 27017)
    client = null;

new Db('blog', access, { safe: true, auto_reconnect: true }).open(function (err, c) {
  if (!err) {
    client = c;
    console.log('database connected');
    EE.emit('connect');
  } else {
    console.log('database connection error', err);
    EE.emit('error');
  }
});

exports.get = function(fn) {
  if(client) {
    fn(client);
  } else {
    EE.on('connect', function() {
      fn(client);
    });
  }
};
