/*
 * Created By:Lightnet
 * 
 * src link:https://bitbucket.org/Lightnet/node_crafty
 *
 * Information: The server code is written in javacript.
 * This is for game server and site hosting.
 * Support by epxress and socket.io to able to host and check web pages.
*/
var parseCookie = require('connect').utils.parseCookie;
var socket=require("socket.io");
sys = require("util"),
fs = require('fs'),
express = require('express');
var app = require('express').createServer();
var mongo = require('mongoskin');

var bmainserveron = false;

var configfile = fs.readFileSync(__dirname+'/config.json'),
      Config;

try {
    Config = JSON.parse(configfile);//str into object data
    //console.dir(Config);
  }
catch (err) {
    console.log('There has been an error parsing your config JSON.')
    console.log(err);
}

var store = new express.session.MemoryStore;
app.use(express.cookieParser());
app.use(express.session({ secret: "keyboard cat",key: 'express.sid',store:store }));

var db = mongo.db('mongodb://'+Config.database.user+':'+Config.database.pass+'@'+Config.database.host+':'+Config.database.port+'/'+Config.database.name+'');

// disable layout
app.set("view options", {layout: false});
//app.register('.html', require('jade'));

app.configure('production', function(){
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(app.router);
	app.use(express.static(__dirname + '/public',{ maxAge: 604800 }));
	app.use(express.static(__dirname + '/image',{ maxAge: 604800 }));
	app.use("/css", express.static(__dirname + '/public'));
	//app.use("/public", express.static(__dirname + '/public'));
	app.use(express.errorHandler());
});

//main index
app.get('/', function(req, res){
    res.setHeader("Content-Type", "text/html");
	//console.log("SESSION ID:"+req.sessionID);
	db.collection('account').find({sessionid:req.sessionID}).toArray(function(err, results) {
		var bfoundmember = false;
			for(i in results){
				//console.log(results[i]);
				if(results[i]['sessionid'] == req.sessionID){
					bfoundmember = true;
					//console.log("USER FOUND sessionID!");
					break;
				}
			}
		if(!bfoundmember){
            //var page_ = fs.readFileSync(__dirname + "/"+'./public/loginscreen.html').toString();
            //var page_ = fs.readFileSync(__dirname + "/"+'./public/login.html').toString();
			var page_ = fs.readFileSync(__dirname + "/"+'./public/index.html').toString();
            res.write(page_);
			res.end();
		}else{

			var page_ = fs.readFileSync(__dirname + "/"+'./public/index.html').toString();
            res.write(page_);
			/*
			var _servertxtstat = "";
			if(bmainserveron){
				_servertxtstat = "online";
			}else{
				_servertxtstat = "offline";
			}
			
			res.write('[Main Server Status:'+_servertxtstat+']');
            */
			res.end();
		}		
	});
	//res.end();
});

app.get('/css/:file', function(req, res) {
    //res.setHeader('Cache-Control', 'max-age= 86400');
	var filename =__dirname + "/"+ './public/' + req.params.file;
	//console.log("file loading:>" + filename);
	fs.readFile(filename, function(err, data) {
		if(err) {
			res.send("Oops! Couldn't find that file.");
		} else {
			res.write(data);
			res.end();
		}
	});
});

app.get('/css/images/:file', function(req, res) {
    //res.setHeader('Cache-Control', 'max-age= 86400');
	var filename =__dirname + "/"+ './public/images/' + req.params.file;
	//console.log("file loading:>" + filename);
	fs.readFile(filename, function(err, data) {
		if(err) {
			res.send("Oops! Couldn't find that file.");
		} else {
			res.write(data);
			res.end();
		}
	});
});

//js
app.get('/js/:file', function(req, res) {
    res.setHeader('Cache-Control', 'max-age= 86400');
	var filename =__dirname + "/"+ './public/' + req.params.file;
	//console.log("file loading:>" + filename);
	fs.readFile(filename, function(err, data) {
		if(err) {
			res.send("Oops! Couldn't find that file.");
		} else {
			res.write(data);
			res.end();
		}
	});
});

//js
app.get('/public/:file', function(req, res) {
    //res.setHeader('Cache-Control', 'max-age= 86400');
	var filename =__dirname + "/"+ './public/' + req.params.file;
	//console.log("file loading:>" + filename);
	fs.readFile(filename, function(err, data) {
		if(err) {
			res.send("Oops! Couldn't find that file.");
		} else {
			res.write(data);
			res.end();
		}
	});
});

//js
app.get('/public/images/:file', function(req, res) {
    res.setHeader('Cache-Control', 'max-age= 86400');
	var filename =__dirname + "/"+ './public/images/' + req.params.file;
	//console.log("file loading:>" + filename);
	fs.readFile(filename, function(err, data) {
		if(err) {
			res.send("Oops! Couldn't find that file.");
		} else {
			res.write(data);
			res.end();
		}
	});
});

//image
app.get('/image/:file', function(req, res) {
	res.setHeader('Cache-Control', 'max-age= 86400');

    var filename =__dirname + "/"+ './image/' + req.params.file;
	//console.log("file loading:>" + filename);
	fs.readFile(filename, function(err, data) {
		if(err) {
			res.send("Oops! Couldn't find that file.");
		} else {
			res.write(data);
			res.end();
		}
	});
});

app.get('/favicon.ico', function(req, res) {
	console.log("icon " );
	res.setHeader('Cache-Control', 'max-age=86400');
	var filename =__dirname + "/"+ './image/favicon.ico';
	fs.readFile(filename, function(err, data) {
		if(err) {
			res.send("Oops! Couldn't find that file.");
		} else {
			res.write(data);
			res.end();
		}
	});
});

var io = socket.listen(app);
//io = new io.Socket();
io.configure(function () {
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
  /*
  io.set('authorization', function(data, callback) {
        if (data.headers.cookie) {
            var cookie = parseCookie(data.headers.cookie);
            sessionStore.get(cookie['connect.sid'], function(err, session) {
                if (err || !session) {
                    callback('Error', false);
                } else {
                    data.session = session;
                    callback(null, true);
                }
            });
        } else {
            callback('No cookie', false);
        }
    });
	*/
});


//SESSION AND COOKIE FOR SOCKET.IO
io.set('authorization', function (data, accept) {
    // check if there's a cookie header
    if (data.headers.cookie) {
        // if there is, parse the cookie
        data.cookie = parseCookie(data.headers.cookie);
        // note that you will need to use the same key to grad the
        // session id, as you specified in the Express setup.
        data.sessionID = data.cookie['express.sid'];
        console.log("data.sessionID:"+data.sessionID);
    } else {
       // if there isn't, turn down the connection with a message
       // and leave the function.
       return accept('No cookie transmitted.', false);
    }
    // accept the incoming connection
    accept(null, true);
});
//disable debug logs
io.set('log level', 1);


//var io_client = require( 'socket.io-client' );
//var csocket = io_client.connect('http://localhost:8080');

//var accountdata = require('./lib/account');
//accountdata.set(app,db);

var serversocketio = require('./lib/serversocketio');
serversocketio.SetIO(io,db);

var port=process.env.PORT || Config.port;
app.listen(port,'0.0.0.0');
//console.log('Sub Server Started! ' + new Date());
console.log('Sub Server Started! ' +  port);



