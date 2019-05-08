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
		res.redirect(
			'http://sv-fe.herokuapp.com/verifyToken/' + token.access_token
		);
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
			key: 'AIzaSyDfTwSjJw5NxH-vI_Sqj8apAY5PWkoLrN8',
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
			key: 'AIzaSyDfTwSjJw5NxH-vI_Sqj8apAY5PWkoLrN8',
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
			key: 'AIzaSyDfTwSjJw5NxH-vI_Sqj8apAY5PWkoLrN8',
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
			MongoClient.connect(url, function(err, client) {
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
						res.send(resp);
					})
					.catch(err => {
						res.send(err);
					});
			});
		})
		.catch(err => {
			res.send(err);
		});
});

app.get('/getStoredMessages/:chat', (req, res) => {
	let chat = req.params.chat;
	MongoClient.connect(url, function(err, client) {
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
				res.send({ result: docs });
			});
	});
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
