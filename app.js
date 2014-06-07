
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');
var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});

var app = express();

// all environments
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.logger({stream: accessLog}));
//app.use(express.json());
//app.use(express.urlencoded());
app.use(express.bodyParser({ keepExtensions: true, uploadDir: './public/images' }));
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
    secret: settings.cookieSecret,
    key: settings.db,//cookie name
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
    store: new MongoStore({
        db: settings.db
    })
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (err, req, res, next) {
    var meta = '[' + new Date() + '] ' + req.url + '\n';
    errorLog.write(meta + err.stack + '\n');
    next();
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

routes(app);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});


//socket.io chatroom demo
var io = require('socket.io').listen(http.createServer(app));

//设置日志级别
io.set('log level', 1);

//WebSocket连接监听
io.on('connection', function (socket) {
    socket.emit('open');//通知客户端已连接

    // 打印握手信息
    // console.log(socket.handshake);

    // 构造客户端对象
    var client = {
        socket:socket,
        name:false,
        color:getColor()
    }

    // 对message事件的监听
    socket.on('message', function(msg){
        var obj = {time:getTime(),color:client.color};

        // 判断是不是第一次连接，以第一条消息作为用户名
        if(!client.name){
            client.name = msg;
            obj['text']=client.name;
            obj['author']='System';
            obj['type']='welcome';
            console.log(client.name + ' login');

            //返回欢迎语
            socket.emit('system',obj);
            //广播新用户已登陆
            socket.broadcast.emit('system',obj);
        }else{

            //如果不是第一次的连接，正常的聊天消息
            obj['text']=msg;
            obj['author']=client.name;
            obj['type']='message';
            console.log(client.name + ' say: ' + msg);

            // 返回消息（可以省略）
            socket.emit('message',obj);
            // 广播向其他用户发消息
            socket.broadcast.emit('message',obj);
        }
    });

    //监听出退事件
    socket.on('disconnect', function () {
        var obj = {
            time:getTime(),
            color:client.color,
            author:'System',
            text:client.name,
            type:'disconnect'
        };

        // 广播用户已退出
        socket.broadcast.emit('system',obj);
        console.log(client.name + 'Disconnect');
    });

});

var getTime=function(){
    var date = new Date();
    return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
}

var getColor=function(){
    var colors = ['aliceblue','antiquewhite','aqua','aquamarine','pink','red','green',
        'orange','blue','blueviolet','brown','burlywood','cadetblue'];
    return colors[Math.round(Math.random() * 10000 % colors.length)];
}