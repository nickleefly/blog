var mongodb = require('mongodb');
var ee = new (require('events').EventEmitter);
var settings = require('../settings');
var Connection = mongodb.Connection;
var access = new mongodb.Server(settings.host, Connection.DEFAULT_PORT);
var client = null;

new mongodb.Db(settings.db, access, { safe: true, auto_reconnect: true }).open(function (err, c) {
  if (!err) {
    client = c;
    console.log('database connected');
    ee.emit('connect');
  } else {
    console.log('database connection error', err);
    ee.emit('error');
  }
});

exports.get = function(fn) {
  if(client) {
    fn(client);
  } else {
    ee.on('connect', function() {
      fn(client);
    });
  }
};