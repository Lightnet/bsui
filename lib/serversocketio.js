var io;
var db;

/*
var ua = request.headers['user-agent'],
    $ = {};

if (/mobile/i.test(ua))
    $.Mobile = true;

if (/like Mac OS X/.test(ua)) {
    $.iOS = /CPU( iPhone)? OS ([0-9\._]+) like Mac OS X/.exec(ua)[2].replace(/_/g, '.');
    $.iPhone = /iPhone/.test(ua);
    $.iPad = /iPad/.test(ua);
}

if (/Android/.test(ua))
    $.Android = /Android ([0-9\.]+)[\);]/.exec(ua)[1];

if (/webOS\//.test(ua))
    $.webOS = /webOS\/([0-9\.]+)[\);]/.exec(ua)[1];

if (/(Intel|PPC) Mac OS X/.test(ua))
    $.Mac = /(Intel|PPC) Mac OS X ?([0-9\._]*)[\)\;]/.exec(ua)[2].replace(/_/g, '.') || true;

if (/Windows NT/.test(ua))
    $.Windows = /Windows NT ([0-9\._]+)[\);]/.exec(ua)[1];

*/

function CurrentDate(){
   var date = new Date();
   var current_day = date.getFullYear()+":" +date.getMonth() +":" + date.getDay() +":" + date.getHours() +":" + date.getMinutes() +":" + date.getMinutes() +":" +date.getMilliseconds();
   console.log(current_day);
   return current_day;
}

var SetIO = function(_io,_db){
io = _io;
db = _db;
	io.sockets.on('connection', function (socket) {
	  //console.log('connected client...');
	  
	   //console.log(socket.handshake.headers['user-agent']);
	   var ua = socket.handshake.headers['user-agent'],
		$ = {};
		
		if (/Windows NT/.test(ua)){
			//$.Windows = /Windows NT ([0-9\._]+)[\);]/.exec(ua)[1];
			console.log('found NT');
		}
	   if(socket.handshake.headers['user-agent'] == "node.js"){
	   
			console.log('found Nodejs');
			socket.emit('server', { request:'serverkey'});
	   }
	   
	   
	   socket.on('chat', function(data){//nothing here
			//ChatFilter(data['message'],io,socket);
			
			socket.emit('chat', { message:data['message']});
		});
	   
	  
	  //socket.emit('server', { msg: 'hello sub server' });
	  socket.on('my other event', function (data) {
		console.log(data);
	  });
	  
		socket.on('page', function (data) {
			if(data['menu'] == 'home'){
				console.log('home...');
			}
			if(data['menu'] == 'profile'){
				console.log('profile...');
			}
			if(data['menu'] == 'servers'){
				console.log('servers...');
				
				db.collection('servers').find().toArray(function(err, results) {
					var bfound = false;
					
					var __servertext = '';
					__servertext += '<table>';
					__servertext += '<tr><td>Server Name:</td><td>Info.:</td><td>Status:</td><td>Tags:</td></tr>';
					
						
						
					for(i in results){
						//console.log(results[i]);
						//if(results[i]['username'] == POST['username']){
							
						//}
						__servertext += '<tr><td>'+ results[i]['servername']+ '</td><td>'+ results[i]['info']+ '</td><td>'+ results[i]['status']+ '</td><td>'+ results[i]['info']+ '</td></tr>';
					}
					__servertext += '</table>';
					__servertext += '<button for="radio5" onClick="createserver();" >Create Server</label>';
					
					
					socket.emit('page', { text: __servertext, content:'servercontent'});
				});
				
			}
			if(data['menu'] == 'forum'){
				console.log('forum...');
			}
			if(data['menu'] == 'support'){
				console.log('support...');
			}
		});
	  
	  socket.on('light', function (data) {
		//console.log(data);
		//console.log('port 8080');
		console.log(data['set']);
		if(data['set'] == 'on'){
		
		}
		
		if(data['set'] == 'off'){
		
		}
		
	  });
	  
	  
	  socket.on('log', function (data) {
		//console.log(data);
		//console.log('port 8080');
	  });
	  
	  
	  socket.on('access', function (data) {
		//console.log(data);
		//console.log('port 8080');
	  });
	  
	  socket.on('server', function (data) {
		console.log('server data:');
		//console.log(data);
		//socket.emit('server', { msg: 'hello sub server' });
		if(data['action'] == "create"){
			db.collection('servers').insert({serverkey:"101010",serverhash:"",serverip:"127.0.0.1:7777",servername:"none",info:"none",tags:"none",status:"offline",date:CurrentDate(),ban:"0",act:"1",sup:""}, function(err, result) {
					if (err) throw err;
					if (result) console.log('Data Added!');
				});	
		}
		
		if(data['key'] != null){
			console.log('KEY SUB SERVER!');
			console.log(data['key']);
			db.collection('servers').find({serverkey:data['key']}).toArray(function(err, results) {
				var bfound = false;
				for(i in results){
					if(results[i]['serverkey'] == data['key']){
						console.log(results[i]['servername']);
						bfound = true;
					}
				}
				
				if(bfound){
					console.log('found key id!');
				}else{
					console.log('no key id found!');
				}
				
				
			});
		}
	  });
	  
	});
}

exports.SetIO = SetIO;