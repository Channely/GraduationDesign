var mongodb = require('./db');

function Comment(number, day, title, comment) {
    this.number = number;
    this.day = day;
    this.title = title;
    this.comment = comment;
}

module.exports = Comment;

//存储一条留言信息
Comment.prototype.save = function(callback) {
    var number = this.number,
        day = this.day,
        title = this.title,
        comment = this.comment;
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //通过用户名、时间及标题查找文档，并把一条留言对象添加到该文档的 comments 数组里
            collection.update({
                "number": number,
                "time.day": day,
                "title": title
            }, {
                $push: {"comments": comment}
            } , function (err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};
//删除一篇评论
Comment.remove = function(number, day, title, mynumber,time, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //查询要删除的文档
            collection.findOne({
                "number": number,
                "time.day": day,
                "title": title
            }, function (err, doc) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                function remove_comment(all_comments, mynumber, time){
                    for( var i= 0; i < all_comments.length; i++ ){
                        if(all_comments[i].number == mynumber && all_comments[i].time == time){
                            all_comments.splice(i,1);
                            return all_comments;
                        }
                    }
                }
                var comments = remove_comment(doc.comments, mynumber, time)
                //更新文章内容
                collection.update({
                    "number": number,
                    "time.day": day,
                    "title": title
                }, {
                    $set: {comments: comments}
                }, function (err) {
                    mongodb.close();
                    if (err) {
                        return callback(err);
                    }
                    callback(null);
                });
            });
        });
    });
};