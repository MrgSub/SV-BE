const express = require('express');
var { google } = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var cors = require('cors');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const DB = {
	host: 'ds161335.mlab.com',
	port: '61335',
	db: 'heroku_m85xw6d6',
	username: 'sv',
	password: 'VhYQWyucSPCK8Jg',
	collection: 'VS_ChatMessages'
};
const url =
	'mongodb://' +
	DB.username +
	':' +
	DB.password +
	'@' +
	DB.host +
	':' +
	DB.port +
	'/' +
	DB.db;

const app = express();
app.use(express.json());
const port = process.env.PORT || 4000;

const credentials = {
	installed: {
		client_id:
			'991785683014-pqljkg48rd7o130d68off9mnfmuhakf8.apps.googleusercontent.com',
		project_id: 'temporal-tensor-239501',
		auth_uri: 'https://accounts.google.com/o/oauth2/auth',
		token_uri: 'https://oauth2.googleapis.com/token',
		auth_provider_x509_cert_url:
			'https://www.googleapis.com/oauth2/v1/certs',
		client_secret: '8pP3GS8tY6ImmdzXXgx01TVt',
		redirect_uri: 'https://sl-sv.herokuapp.com/AuthUrl/getToken'
	}
};
const clientSecret = credentials.installed.client_secret;
const clientId = credentials.installed.client_id;
const redirectUrl = credentials.installed.redirect_uri;
const SCOPES = [
	'https://www.googleapis.com/auth/youtube.readonly',
	'https://www.googleapis.com/auth/youtube',
	'https://www.googleapis.com/auth/youtube.force-ssl'
];

app.use(cors());

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.get('/AuthUrl', (req, res) => {
	var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
	var authUrl = oauth2Client.generateAuthUrl({
		scope: SCOPES,
		access_type: 'offline'
	});
	res.send({ authUrl });
});

app.get('/AuthUrl/getToken', (req, res) => {
	var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
	var code = req.query.code;
	oauth2Client.getToken(code, function(err, token) {
		if (err) {
			res.send(err);
		}
		res.redirect('http://localhost:3000/verifyToken/' + token.access_token);
	});
});

app.get('/AuthUrl/verifyToken/:token', (req, res) => {
	var oauth2Client = new OAuth2(clientId, clientSecret);
	let token = req.params.token;
	oauth2Client
		.getTokenInfo(token)
		.then(resp => {
			res.send({ message: 'valid', data: resp });
		})
		.catch(err => {
			res.send({ message: 'error', data: err });
		});
});

app.get('/getStreams', (req, res) => {
	let yt = google.youtube('v3');
	yt.search
		.list({
			part: 'snippet',
			q: 'gaming',
			maxResults: 10,
			key: 'AIzaSyATlepSulVlbubMYHmwtiVSIRSgarkhiEU',
			order: 'viewCount',
			videoEmbeddable: true,
			type: 'video',
			eventType: 'live',
			videoCategoryId: 20
		})
		.then(resp => {
			res.send(resp);
		})
		.catch(err => {
			res.send(err);
		});
});

app.get('/videoInfo/:id', (req, res) => {
	let yt = google.youtube('v3');
	let id = req.params.id;
	yt.videos
		.list({
			id: id,
			key: 'AIzaSyATlepSulVlbubMYHmwtiVSIRSgarkhiEU',
			part: 'snippet,contentDetails,statistics,liveStreamingDetails'
		})
		.then(resp => {
			res.send(resp);
		})
		.catch(err => {
			res.send(err);
		});
});

app.get('/getMessages/:chat', (req, res) => {
	let yt = google.youtube('v3');
	let chat = req.params.chat;
	yt.liveChatMessages
		.list({
			liveChatId: chat,
			key: 'AIzaSyATlepSulVlbubMYHmwtiVSIRSgarkhiEU',
			part: 'snippet,authorDetails',
			profileImageSize: 50
		})
		.then(resp => {
			res.send(resp);
		})
		.catch(err => {
			res.send(err);
		});
});

app.post('/sendMessage/:chat', (req, res) => {
	let yt = google.youtube('v3');
	let message = req.body.message;
	let token = req.body.token;
	let chat = req.params.chat;
	yt.liveChatMessages
		.insert({
			oauth_token: token,
			part: 'snippet',
			requestBody: {
				snippet: {
					type: 'textMessageEvent',
					liveChatId: chat,
					textMessageDetails: {
						messageText: String(message)
					}
				}
			}
		})
		.then(resp => {
			res.send(resp);
		})
		.catch(err => {
			res.send(err);
		});
});

async function getStoredMessages(chat) {
	return await MongoClient.connect(url, function(err, client) {
		assert.equal(null, err);
		const db = client.db();
		const collection = db.collection(DB.collection);
		collection
			.find({
				requestBody: {
					snippet: {
						liveChatId: chat
					}
				}
			})
			.toArray(function(err, docs) {
				assert.equal(err, null);
				return { result: docs };
			});
	});
}

async function storeMessage(message, token, chat) {
	return await MongoClient.connect(url, function(err, client) {
		assert.equal(null, err);
		const db = client.db();
		const collection = db.collection(DB.collection);
		collection
			.insertOne({
				oauth_token: token,
				part: 'snippet',
				requestBody: {
					snippet: {
						type: 'textMessageEvent',
						liveChatId: chat,
						textMessageDetails: {
							messageText: String(message)
						}
					}
				}
			})
			.then(resp => {
				return resp;
			})
			.catch(err => {
				return err;
			});
		// collection.find().toArray(function(err, docs) {
		// 	assert.equal(err, null);
		// 	res.send({ result: docs });
		// });
	});
}

app.get('/getStoredMessages/:chat', (req, res) => {
	let chat = req.params.chat;
	getStoredMessages(chat)
		.then(resp => {
			res.send(resp);
		})
		.catch(err => {
			res.send(err);
		});
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// // If modifying these scopes, delete your previously saved credentials
// // at ~/.credentials/youtube-nodejs-quickstart.json
// var TOKEN_DIR = './credentials/';
// var TOKEN_PATH = TOKEN_DIR + 'tokens.json';

// // Load client secrets from a local file.
// // fs.readFile('secret.json', function processClientSecrets(err, content) {
// // 	if (err) {
// // 		console.log('Error loading client secret file: ' + err);
// // 		return;
// // 	}
// // 	// Authorize a client with the loaded credentials, then call the YouTube API.
// // 	authorize(JSON.parse(content), getChannel);
// // });

// /**
//  * Create an OAuth2 client with the given credentials, and then execute the
//  * given callback function.
//  *
//  * @param {Object} credentials The authorization client credentials.
//  * @param {function} callback The callback to call with the authorized client.
//  */
// function authorize(credentials, callback) {
// 	var clientSecret = credentials.installed.client_secret;
// 	var clientId = credentials.installed.client_id;
// 	var redirectUrl = credentials.installed.redirect_uris[0];
// 	var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

// 	// Check if we have previously stored a token.
// 	fs.readFile(TOKEN_PATH, function(err, token) {
// 		if (err) {
// 			getNewToken(oauth2Client, callback);
// 		} else {
// 			oauth2Client.credentials = JSON.parse(token);
// 			callback(oauth2Client);
// 		}
// 	});
// }

// /**
//  * Get and store new token after prompting for user authorization, and then
//  * execute the given callback with the authorized OAuth2 client.
//  *
//  * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
//  * @param {getEventsCallback} callback The callback to call with the authorized
//  *     client.
//  */
// function getNewToken(oauth2Client, callback) {
// 	var authUrl = oauth2Client.generateAuthUrl({
// 		access_type: 'offline',
// 		scope: SCOPES
// 	});
// 	console.log('Authorize this app by visiting this url: ', authUrl);
// 	var rl = readline.createInterface({
// 		input: process.stdin,
// 		output: process.stdout
// 	});
// 	rl.question('Enter the code from that page here: ', function(code) {
// 		rl.close();
// 		oauth2Client.getToken(code, function(err, token) {
// 			if (err) {
// 				console.log('Error while trying to retrieve access token', err);
// 				return;
// 			}
// 			oauth2Client.credentials = token;
// 			storeToken(token);
// 			callback(oauth2Client);
// 		});
// 	});
// }

// /**
//  * Store token to disk be used in later program executions.
//  *
//  * @param {Object} token The token to store to disk.
//  */
// function storeToken(token) {
// 	try {
// 		fs.mkdirSync(TOKEN_DIR);
// 	} catch (err) {
// 		if (err.code != 'EEXIST') {
// 			throw err;
// 		}
// 	}
// 	fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
// 		if (err) throw err;
// 		console.log('Token stored to ' + TOKEN_PATH);
// 	});
// 	console.log('Token stored to ' + TOKEN_PATH);
// }

// /**
//  * Lists the names and IDs of up to 10 files.
//  *
//  * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
//  */
// function getChannel(auth) {
// 	var service = google.youtube('v3');
// 	service.channels.list(
// 		{
// 			auth: auth,
// 			part: 'snippet,contentDetails,statistics',
// 			forUsername: 'GoogleDevelopers'
// 		},
// 		function(err, response) {
// 			if (err) {
// 				console.log('The API returned an error: ' + err);
// 				return;
// 			}
// 			var channels = response.data.items;
// 			if (channels.length == 0) {
// 				console.log('No channel found.');
// 			} else {
// 				console.log(
// 					"This channel's ID is %s. Its title is '%s', and " +
// 						'it has %s views.',
// 					channels[0].id,
// 					channels[0].snippet.title,
// 					channels[0].statistics.viewCount
// 				);
// 			}
// 		}
// 	);
// }
