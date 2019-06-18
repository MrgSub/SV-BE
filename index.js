var app = require('./app');
var http = require('http').createServer(app);
var port = process.env.PORT || 4000;
var io = require('socket.io')(http);
var jwt = require('jsonwebtoken');
var config = require('./config');
var Chat = require('./Modules/Chat');

app.listen(port, function() {
	console.log('Express server listening on port ' + port);
});

// http.listen(Number(port) + 1, function() {
// 	console.log('Socket.IO server listening on port ' + (port + 1));
// });

// function parseCookies(header) {
// 	let cookies = [];
// 	let headersSplit = header.split(';');
// 	headersSplit.forEach(element => {
// 		let cookie = element.split('=');
// 		let key = cookie[0];
// 		let value = cookie[1];
// 		cookies.push({ [key]: value });
// 	});
// 	return cookies;
// }

function verifyToken(token) {
	return jwt.verify(token, config.secret, function(error, decoded) {
		if (error) {
			return error.message;
		}
		return decoded;
	});
}

io.on('connection', function(socket) {
	socket.on('verifyToken', (token, callback) => {
		let data = verifyToken(token);
		if (data && data.id) {
			callback({ data });
		} else {
			callback(false);
		}
	});
	// Chat.create({
	// 	listing: '001',
	// 	parties: ['aboud', 'john'],
	// 	messages: [
	// 		{
	// 			from: 'aboud',
	// 			to: 'john',
	// 			content: 'Hello John'
	// 		}
	// 	]
	// });
	// Chat.updateOne(
	// 	{ _id: '5cfc44ff21318ef9d8e2a951' },
	// 	{
	// 		$push: {
	// 			messages: [
	// 				{ from: 'aboud', to: 'john', content: 'New Message' }
	// 			]
	// 		}
	// 	},
	// 	{},
	// 	function(err, data) {
	// 		console.info(data);
	// 	}
	// );
	socket.on('getUserChats', (token, callback) => {
		let data = verifyToken(token);
		if (data && data.id) {
			return Chat.find({ parties: data.username })
				.sort({ 'messages.date': 1 })
				.exec(function(err, data) {
					if (err) {
						return callback({ error: err });
					}
					return callback(data);
				});
		} else {
			return callback(false);
		}
	});
});

// io.on('connection', function(socket) {
// 	let headers = socket.handshake.headers.cookie;
// 	let cookies = parseCookies(headers);
// 	let token = verifyToken(cookies[0].XAuth);
// 	if (token.id) {
//         console.info(token.username + ' has connected!');

// 	} else {
// 		console.info('guest has connected!');
// 	}
// });
