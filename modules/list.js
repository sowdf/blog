var mongodb = require('../modules/db.js');
function List(name){
    name : name
}

module.exports = List;

List.get = function(callback){
    var name = this.name;
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collectiom){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.find({name:name},{safe:true},sort({time:-1}).toArray(function(err,list){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,list);
            }));
        })
    })
}