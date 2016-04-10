var settings = require('../settings'),
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server,
    Db = require('mongodb').Db;
module.exports = new Db(settings.db,new Server(settings.host,settings.port),{safe:true});