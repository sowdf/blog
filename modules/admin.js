var mongodb = require('./db');
function Admin(admin){
    this.name = admin.name;
    this.password = admin.password;
    this.email = admin.email;
}

module.exports = Admin;

Admin.prototype.save = function(callback){
    /* 存入 后台用户信息 */
    var admin = {
        name : this.name,
        password : this.password,
        email : this.email
    }
    /* 将信息存入数据库 */
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('admins',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err);
            }
            collection.insert(admin,{
                safe:true
            },function(err,admin){
                mongodb.close();
                if(err){
                    return callback(err);
                }

                console.log(arguments);
                callback(null,admin[0]);
            })
        })
    })
}
Admin.get = function(name,callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err);
        }
        db.collection('admins',function(err,collection){
            collection.findOne({
                name : name
            },function(err,user){
                mongodb.close();
                if(err){
                    return callback();
                }
                return callback(null,user);
            })
        })
    })
}