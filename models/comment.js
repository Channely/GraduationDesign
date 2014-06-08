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
                $push: {"comments": comment,"lucks":comment.luck}
            } , function (err) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
//                callback(null);
            });

            collection.findOne({
                "number": number,
                "time.day": day,
                "title": title
            }, function (err, doc) {
                if (err) {
                    mongodb.close();
                    return callback(err);
                }
                if (doc) {

                    function get_winner(){
                        var lucks = doc.lucks.sort();
                        lucks.unshift('head');
                        lucks.push('footer');
                        for(var i=1;i<lucks.length-1;i++){
                            if(lucks[i-1]!=lucks[i] && lucks[i]!=lucks[i+1]){
                                return lucks[i];
                            }
                        }
                        return 0;
                    }

                    var winner = doc.lucks.length==0?0:get_winner();

                    function get_winner_info(winner){
                        var comments = doc.comments;
                        for(var i=0;i<comments.length;i++){
                            if(comments[i].luck==winner){
                                return comments[i];
                            }
                        }
                    }

                    var winner_info = winner==0?{
                        "number" : "none",
                        "head" : "http://www.gravatar.com/avatar/e8514a337805f7b4c6b3285b3f0b23a0?s=48",
                        "email" : "none@none.none",
                        "website" : "/u/none",
                        "time" : "0000-00-00 00:00",
                        "content" : "none",
                        "luck" : "none"
                    }:get_winner_info(winner);

                    //每访问 1 次，pv 值增加 1
                    collection.update({
                        "number": number,
                        "time.day": day,
                        "title": title
                    }, {
                        $set: {"winner": winner_info}
                    }, function (err) {
                        mongodb.close();
                        if (err) {
                            return callback(err);
                        }
                    });
                    callback(null);//返回查询的一篇文章
                }
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