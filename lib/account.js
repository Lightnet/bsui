/*
 Created By: Lightnet
 link: https://bitbucket.org/Lightnet/botnode
 license: cc by-sa

*/

var qs = require('querystring');
//var hash = require(__dirname+"/../../lib/md5");
var hash = require(__dirname+"/md5");
var fs      = require('fs');

function CurrentDate(){
   var date = new Date();
   var current_day = date.getFullYear()+":" +date.getMonth() +":" + date.getDay() +":" + date.getHours() +":" + date.getMinutes() +":" + date.getMinutes() +":" +date.getMilliseconds();
   console.log(current_day);
   return current_day;
}

exports.set = function (app,db){

app.get('/logout', function(req, res){
    res.setHeader("Content-Type", "text/html");
	
	//get sessionID from broswer
	db.collection('account').find({sessionid:req.sessionID}).toArray(function(err, results) {
		var bfound = false;
		for(i in results){
			//console.log(results[i]);
			if(results[i]['sessionid'] == req.sessionID){
				bfound = true;
				//console.log("USER FOUND!");
				db.collection('account').update({username:results[i]['username']}, {$set:{sessionid:"-1"}}, function(err, result) {
					if (!err) console.log('Updated!');
					//res.write(' <a href="/">Home</a> ');
					//res.write("User has Logout.");
                    var page_ = fs.readFileSync(__dirname + "/"+'../public/uiquery_logout.html').toString();
                    res.write(page_);
					//res.redirect('/');
					//res.redirect('/', 301);//set header then this. If you write it get an error.
					res.end();
				});
				break;
			}
		}
		if(!bfound){//if session not found just give basic error in case
			//res.write(' <a href="/">Home</a> ');
			//res.write("Logout error.");
            var page_ = fs.readFileSync(__dirname + "/"+'../public/uiquery_logout.html').toString();
            res.write(page_);
			res.end();
		}
	});	
});

//post login
app.post('/login', function(req, res){
	var body = '';
	res.setHeader("Content-Type", "text/html");
	req.addListener("data", function(chunk) {
		body += chunk;
		//console.log(chunk);
		if (body.length > 1e6) {
			// FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
			req.connection.destroy();
		}
	});

	req.addListener("end", function() {
		//parse req.content and do stuff with it
		var POST = qs.parse(body);
		//console.log(POST);
		
		db.collection('account').find({username:POST['username']}).toArray(function(err, results) {
			var bfound = false;
			for(i in results){
				//console.log(results[i]);
				if(results[i]['username'] == POST['username']){
					bfound = true;
					//console.log("USER FOUND!");
					db.collection('account').update({username:POST['username']}, {$set:{sessionid:req.sessionID}}, function(err, result) {
						if (!err) console.log('Updated!');
						//res.write(' <a href="/">Home</a> ');
						//res.write("User has Login.");
						res.redirect('/');
						//res.end();
					});
					break;
				}
			}
			if(!bfound){
				res.write(' <a href="/">Home</a> ');
				res.write("Login fail.");
				res.end();
			}
       });
	});
});

//register account on the website incase the web player is down or required
app.post('/register', function(req, res){
	var body = '';
	res.setHeader("Content-Type", "text/html");
	req.addListener("data", function(chunk) {
		body += chunk;
		//console.log(chunk);
		if (body.length > 1e6) {
			// FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
			req.connection.destroy();
		}
	});

	req.addListener("end", function() {
		//parse req.content and do stuff with it
		var POST = qs.parse(body);
		//console.log(POST);
		db.collection('account').find({username:POST['username']}).toArray(function(err, results) {
			var bfound = false;
			//console.log(result[0]['username']);
			//console.log("checking user match names");
			for(i in results){
				//console.log(results[i]);
				if(results[i]['username'] == POST['username']){
					bfound = true;
					console.log("USER FOUND!");
					break;
				}
			}
			
			if(!bfound){				
				db.collection('account').insert({userid:hash.md5(POST['username']+CurrentDate()+"mmo"),username:POST['username'],userpass:POST['userpass'],useremail:"",sessionid:"-1",gameid:"-1",logid:"-1",access:"1",date:CurrentDate(),ban:"0",act:"1",sup:""}, function(err, result) {
					if (err) throw err;
					if (result) console.log('User Added!');
					res.write(' <a href="/">Home</a> ');
					res.write("<br>User " + POST['username'] + "  Register");					
					res.end();					
				});	
			}else{
				res.write(' <a href="/">Home</a> ');
				res.write("<br>User " + POST['username'] + "  Exist");
				res.end();
			}
       });
	});
});

app.get('/register', function(req, res){
	res.setHeader("Content-Type", "text/html");
	res.write(' <a href="/">Home</a> ');
	res.write(' <br> REGISTER HERE! ');
	
	res.write('<br><form action="/register" method="post">');
	res.write("User:");
	res.write('<input type="text" name="username" value="guest"/>');
	res.write("Password:");
	res.write('<input type="text" name="userpass" value="guest" />');
	res.write('<input type="submit" value="Submit" />');
	res.write("</form>");
	res.end();
});


//post account 
// this for web player build
app.post('/account', function(req, res){
	var body = '';
	res.setHeader("Content-Type", "text/xml");
	req.addListener("data", function(chunk) {
		body += chunk;
		//console.log(chunk);
		if (body.length > 1e6) {
			// FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
			req.connection.destroy();
		}
	});

	req.addListener("end", function() {
		//parse req.content and do stuff with it
		var POST = qs.parse(body);
		//console.log(POST);
		//res.write("user:"+POST['user[name]']+"|"+POST['user[email]']);
		//POST['user'];
		if(POST['action'] == "register"){
			//console.log("===REGISTER===");
			
			db.collection('account').find({username:POST['username']}).toArray(function(err, results) {
				var bfound = false;
				//console.log(result[0]['username']);
				//console.log("checking user match names");
				res.write('<data>');
				for(i in results){
					//console.log(results[i]);
					if(results[i]['username'] == POST['username']){
						bfound = true;
						//console.log("USER FOUND!");
						res.write('<message>exist<message>');
						res.end();
						break;
					}
				}
				
				if(!bfound){				
					db.collection('account').insert({userid:hash.md5(POST['username']+CurrentDate()+"mmo"),username:POST['username'],userpass:POST['userpass'],useremail:"",sessionid:"-1",gameid:"-1",logid:"-1",access:"1",date:CurrentDate(),ban:"0",act:"1",sup:""}, function(err, result) {
						if (err) throw err;
						if (result) console.log('User Added!');
						res.write('<message>created<message>');
						res.write('</data>');
						res.end();
					});	
				}
			});
		}

		if(POST['action'] == "forgot"){
			
		}

		if(POST['action'] == "login"){
			//console.log("===LOGIN AREA===");
			db.collection('account').find({username:POST['username']}).toArray(function(err, results) {
				var bfound = false;
				res.write("<data>");
				for(i in results){
					//console.log(results[i]);
					if(results[i]['username'] == POST['username']){
						bfound = true;
						//console.log("USER FOUND!");
						var logtagid = CurrentDate();
						db.collection('account').update({username:POST['username']}, {$set:{logid:hash.md5(logtagid)}}, function(err, result) {
							if (!err) console.log('Updated!');
							res.write("<logid>" + hash.md5(logtagid) + "</logid>");
							res.write("<message>pass</message>");
							res.write("</data>");
							res.end();
						});
						break;
					}
				}
				if(!bfound){
					res.write("<message>fail</message>");
					res.write("</data>");
					res.end();
				}
		   });
		}//end of login action
   });
});


}