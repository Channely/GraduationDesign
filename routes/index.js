var crypto = require('crypto'),
    fs = require('fs'),
    User = require('../models/user.js'),
    Post = require('../models/post.js'),
    Comment = require('../models/comment.js');

module.exports = function(app) {
    app.get('/sign', checkNotLogin);
    app.get('/sign', function (req, res) {
        res.render('sign', {
            title: '登录/注册',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    app.post('/sign', checkNotLogin);
    app.post('/sign', function (req, res) {
        if(req.body.signin){
            //生成密码的 md5 值
            var md5 = crypto.createHash('md5'),
                password = md5.update(req.body.signin).digest('hex');
            //检查用户是否存在
            User.get(req.body.number, function (err, user) {
                if (!user) {
                    req.flash('error', '用户不存在!');
                    return res.redirect('/sign');//用户不存在则跳转到登录页
                }
                //检查密码是否一致
                if (user.password != password) {
                    req.flash('error', '密码错误!');
                    return res.redirect('/sign');//密码错误则跳转到登录页
                }
                //用户名密码都匹配后，将用户信息存入 session
                req.session.user = user;
                req.flash('success', '登陆成功!');
                res.redirect('/');//登陆成功后跳转到主页
            });

        }else{
            var password = req.body.signup,
                password_re = req.body['signup-repeat'];
            //检验用户两次输入的密码是否一致
            if (password_re != password) {
                req.flash('error', '两次输入的密码不一致!');
                return res.redirect('/sign');//返回注册页
            }
            //生成密码的 md5 值
            var md5 = crypto.createHash('md5'),
                password = md5.update(req.body.signup).digest('hex');
            var newUser = new User({
                password: password,
                number: req.body.number,
                email: 'qijie29896@gmail.com' //设置默认邮箱 以提供默认头像
            });
            //检查用户学号是否已经存在
            User.get(newUser.number, function (err, user) {
                if (user) {
                    req.flash('error', '号码已存在!');
                    return res.redirect('/sign');//返回注册页
                }
                //如果不存在则新增用户
                newUser.save(function (err, user) {
                    if (err) {
                        req.flash('error', err);
                        return res.redirect('/sign');//注册失败返回主册页
                    }
                    req.session.user = user;//用户信息存入 session
                    req.flash('success', '注册成功!');
                    res.redirect('/');//注册成功后返回主页
                });
            });
        };
    });

    app.get('/', function (req, res) {
        Post.getAll(null, function (err, posts) {
            if (err) {
                posts = [];
            }
            res.render('index', {
                title: '主页',
                user: req.session.user,
                posts: posts,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
    app.get('/post', checkLogin);
    app.get('/post', function (req, res) {
        res.render('post', {
            title: '发布',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    app.post('/post', checkLogin);
    app.post('/post', function (req, res) {
        var currentUser = req.session.user,
            post = new Post(currentUser.number, req.body.title, req.body.post);
        post.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/post');
            }
            req.flash('success', '发布成功!');
            res.redirect('/');//发表成功跳转到主页
        });
    });
    app.get('/logout', checkLogin);
    app.get('/logout', function (req, res) {
        req.session.user = null;
        req.flash('success', '成功登出!');
        res.redirect('/sign');//登出成功后跳转到主页
    });
    app.get('/upload', checkLogin);
    app.get('/upload', function (req, res) {
        res.render('upload', {
            title: '上传图片',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    app.post('/upload', checkLogin);
    app.post('/upload', function (req, res) {
        var image_info = ''
        for (var i in req.files) {
            if (req.files[i].size == 0){
                // 使用同步方式删除一个文件
                fs.unlinkSync(req.files[i].path);
                console.log('Successfully removed an empty file!');
            } else {
                var target_path = './public/images/' + req.files[i].name;
                image_info += '\n' + ' ['+ i + '] /images/' + req.files[i].name
                // 使用同步方式重命名一个文件
                fs.renameSync(req.files[i].path, target_path);
                console.log('Successfully renamed a file!');
            }
        }
        req.flash('success', '图片上传成功!' + image_info);
        res.redirect('back');
    });
    app.get('/u/:number', function (req, res) {
        //检查用户是否存在
        User.get(req.params.number, function (err, user) {
            if (!user) {
                req.flash('error', '用户不存在!');
                return res.redirect('/');//用户不存在则跳转到主页
            }
            //查询并返回该用户的所有文章
            Post.getAll(user.number, function (err, posts) {
                if (err) {
                    req.flash('error', err);
                    return res.redirect('/');
                }
                res.render('user', {
                    title: user.number,
                    posts: posts,
                    user : req.session.user,
                    success : req.flash('success').toString(),
                    error : req.flash('error').toString()
                });
            });
        });
    });
    app.get('/u/:number/:day/:title', function (req, res) {
        Post.getOne(req.params.number, req.params.day, req.params.title, function (err, post) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            res.render('article', {
                title: req.params.title,
                post: post,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
    app.post('/u/:number/:day/:title', function (req, res) {
        var date = new Date(),
            time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
                date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
        var comment = {
            number: req.body.number,
            email: req.body.email,
            website: req.body.website,
            time: time,
            content: req.body.content
        };
        var newComment = new Comment(req.params.number, req.params.day, req.params.title, comment);
        newComment.save(function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '留言成功!');
            res.redirect('back');
        });
    });
    app.get('/edit/:number/:day/:title', checkLogin);
    app.get('/edit/:number/:day/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.edit(currentUser.number, req.params.day, req.params.title, function (err, post) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            res.render('edit', {
                title: '编辑',
                post: post,
                user: req.session.user,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        });
    });
    app.post('/edit/:number/:day/:title', checkLogin);
    app.post('/edit/:number/:day/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.update(currentUser.number, req.params.day, req.params.title, req.body.post, function (err) {
            var url = '/u/' + req.params.number + '/' + req.params.day + '/' + req.params.title;
            if (err) {
                req.flash('error', err);
                return res.redirect(url);//出错！返回文章页
            }
            req.flash('success', '修改成功!');
            res.redirect(url);//成功！返回文章页
        });
    });
    app.get('/remove/:number/:day/:title', checkLogin);
    app.get('/remove/:number/:day/:title', function (req, res) {
        var currentUser = req.session.user;
//        if(!confirm('Sure ?')){
//            return res.redirect('back');
//        }
        Post.remove(currentUser.number, req.params.day, req.params.title, function (err) {
            if (err) {
                req.flash('error', err);
                return res.redirect('back');
            }
            req.flash('success', '删除成功!');
            res.redirect('/');
        });
    });


    function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', '未登录!');
            res.redirect('/sign');
        }
        next();
    }

    function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash('error', '已登录!');
            res.redirect('/');
        }
        next();
    }
};