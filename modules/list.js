var mongodb = require('../modules/db.js');
function List(name){
    name : name
}

module.exports = List;

List.get = function(name,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            var query = {};
            if(name){
                query.name = name;
            }
            collection.find(query).sort({time:-1}).toArray(function(err,list){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,list);
            });
        })
    })
}
List.edit = function(name,day,title,callback){
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //根据用户名，发表日期及文章名进行查询
            collection.findOne({
                'name':name,
                'time.day':day,
                'title':title
            },function(err,doc){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,doc);//返回一片查询到的文章
            })
        })
    });
}
List.update = function(name,day,title,post,callback){
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        //读取posts集合
        db.collection('posts',function(err,collection){
            if(err){
                return callback(err);
            }
            collection.update({
                'name':name,
                'time.day':day,
                'title':title
            },{
                $set:{post:post}
            },function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            })
        })
    })
}
List.remove = function(name,day,title,callback){
    //打开数据库
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('posts',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            //根据用户名，日期和标题查找并删除一篇文章
            collection.remove({
                'name':name,
                'time.day':day,
                'title':title
            },{w:1},function(err){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null);
            })
        })
    })
}
