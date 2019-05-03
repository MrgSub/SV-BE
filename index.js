var fs = require('fs');
var readline = require('readline');
var { google } = require('googleapis');
var OAuth2 = google.auth.OAuth2;

const express = require('express');
var cors = require('cors');
const app = express();
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

app.use(cors());

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/AuthUrl', (req, res) => {
	var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
	var authUrl = oauth2Client.generateAuthUrl({
		scope: SCOPES
	});
	res.send({ authUrl });
});

async function getToken(oauth2Client, code) {
	let resp = await oauth2Client.getToken(code);
	return resp;
}

app.get('/AuthUrl/getToken', (req, res) => {
	var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
	getToken(oauth2Client, req.query.code).then(resp => {
		res.send(resp);
	});
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR = './credentials/';
var TOKEN_PATH = TOKEN_DIR + 'tokens.json';

// Load client secrets from a local file.
// fs.readFile('secret.json', function processClientSecrets(err, content) {
// 	if (err) {
// 		console.log('Error loading client secret file: ' + err);
// 		return;
// 	}
// 	// Authorize a client with the loaded credentials, then call the YouTube API.
// 	authorize(JSON.parse(content), getChannel);
// });

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
	var clientSecret = credentials.installed.client_secret;
	var clientId = credentials.installed.client_id;
	var redirectUrl = credentials.installed.redirect_uris[0];
	var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

	// Check if we have previously stored a token.
	fs.readFile(TOKEN_PATH, function(err, token) {
		if (err) {
			getNewToken(oauth2Client, callback);
		} else {
			oauth2Client.credentials = JSON.parse(token);
			callback(oauth2Client);
		}
	});
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
	var authUrl = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES
	});
	console.log('Authorize this app by visiting this url: ', authUrl);
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.question('Enter the code from that page here: ', function(code) {
		rl.close();
		oauth2Client.getToken(code, function(err, token) {
			if (err) {
				console.log('Error while trying to retrieve access token', err);
				return;
			}
			oauth2Client.credentials = token;
			storeToken(token);
			callback(oauth2Client);
		});
	});
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
	try {
		fs.mkdirSync(TOKEN_DIR);
	} catch (err) {
		if (err.code != 'EEXIST') {
			throw err;
		}
	}
	fs.writeFile(TOKEN_PATH, JSON.stringify(token), err => {
		if (err) throw err;
		console.log('Token stored to ' + TOKEN_PATH);
	});
	console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getChannel(auth) {
	var service = google.youtube('v3');
	service.channels.list(
		{
			auth: auth,
			part: 'snippet,contentDetails,statistics',
			forUsername: 'GoogleDevelopers'
		},
		function(err, response) {
			if (err) {
				console.log('The API returned an error: ' + err);
				return;
			}
			var channels = response.data.items;
			if (channels.length == 0) {
				console.log('No channel found.');
			} else {
				console.log(
					"This channel's ID is %s. Its title is '%s', and " +
						'it has %s views.',
					channels[0].id,
					channels[0].snippet.title,
					channels[0].statistics.viewCount
				);
			}
		}
	);
}
