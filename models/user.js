var crypto = require('crypto');
var mongodb = require('./db');

function User(user) {
    this.password = user.password;
    this.number = user.number;
    this.email = user.email;

    this.address = user.address;
    this.birthday = user.birthday;
    this.qq = user.qq;
    this.joined = user.joined;
    this.school = user.school
};

module.exports = User;

//存储用户信息
User.prototype.save = function(callback) {
    var md5 = crypto.createHash('md5'),
    email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
    head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=64";
    //要存入数据库的用户信息文档
    var user = {
        password: this.password,
        number : this.number,
        email: this.email,
        head: head,

        address: this.address,
        birthday: this.birthday,
        qq: this.qq,
        joined: this.joined,
        school: this.school
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //将用户数据插入 users 集合
            collection.insert(user, {
                safe: true
            }, function (err, user) {
                mongodb.close();
                if (err) {
                    return callback(err);//错误，返回 err 信息
                }
                callback(null, user[0]);//成功！err 为 null，并返回存储后的用户文档
            });
        });
    });
};

//读取用户信息
User.get = function(number, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //查找用户名（number键）值为 number 一个文档
            collection.findOne({
                number: number
            }, function (err, user) {
                mongodb.close();
                if (err) {
                    return callback(err);//失败！返回 err 信息
                }
                callback(null, user);//成功！返回查询的用户信息
            });
        });
    });
};
//返回所有users存档信息
User.getAll = function(callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //返回只包含 number、email、joined 属性的文档组成的存档数组
            collection.find({}, {
                "number": 1,
                "head": 1,
                "joined": 1,
                "school": 1
            }).sort({
                joined: -1
            }).toArray(function (err, users) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null, users);
            });
        });
    });
};

User.update = function (number, qq, address, birthday, email, school, password) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        var md5 = crypto.createHash('md5'),
            email_MD5 = md5.update(email.toLowerCase()).digest('hex'),
            head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=64";
        //读取 posts 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //更新文章内容
            collection.update({
                "number": number
            }, {
                $set: {
                    qq: qq,
                    address: address,
                    birthday: birthday,
                    email: email,
                    head: head,
                    school: school,
                    password: password
                }
            }, function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};