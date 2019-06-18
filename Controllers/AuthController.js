var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var VerifyToken = require('./VerifyToken');
var User = require('../Modules/User');
var router = express.Router();

// Verify Email
// Verify Phone
// Chat System
// Share To Social Media

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(cors());

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config');

router.post('/admin/login', function(req, res) {
	User.findOne({ username: req.body.username, type: 1 }, function(err, user) {
		if (err) return res.status(500).send('Server error');
		if (!user) return res.status(404).send('Wrong credentials');
		var passwordIsValid = bcrypt.compareSync(
			req.body.password,
			user.password
		);
		if (!passwordIsValid) return res.status(404).send('Wrong credentials');

		// var token1 = jwt.sign(
		// 	jwt.sign(
		// 		{ id: user._id, username: user.username, type: user.type },
		// 		config.secret
		// 	),
		// 	config.secret,
		// 	{
		// 		expiresIn: 86400 // expires in 24 hours
		// 	}
		// );

		var token = jwt.sign(
			{ id: user._id, username: user.username, type: user.type },
			config.secret,
			{
				expiresIn: 86400 // expires in 24 hours
			}
		);

		res.status(200).send({ auth: true, token: token });
	});
});

router.post('/login', function(req, res) {
	User.findOne({ username: req.body.username, type: 2 }, function(err, user) {
		if (err) return res.status(500).send('Server error');
		if (!user) return res.status(404).send('Wrong credentials');
		var passwordIsValid = bcrypt.compareSync(
			req.body.password,
			user.password
		);
		if (!passwordIsValid) return res.status(404).send('Wrong credentials');

		// var token1 = jwt.sign(
		// 	jwt.sign(
		// 		{ id: user._id, username: user.username, type: user.type },
		// 		config.secret
		// 	),
		// 	config.secret,
		// 	{
		// 		expiresIn: 86400 // expires in 24 hours
		// 	}
		// );

		var token = jwt.sign(
			{ id: user._id, username: user.username, type: user.type },
			config.secret,
			{
				expiresIn: 86400 // expires in 24 hours
			}
		);

		res.status(200).send({ auth: true, token: token });
	});
});

router.get('/logout', function(req, res) {
	res.status(200).send({ auth: false, token: null });
});

router.post('/register', function(req, res) {
	var hashedPassword = bcrypt.hashSync(req.body.password, 8);

	User.create(
		{
			username: req.body.username,
			password: hashedPassword,
			type: 2
		},
		function(err, user) {
			if (err) return res.status(500).send(err);

			var token = jwt.sign(
				{ id: user._id, username: user.username, type: user.type },
				config.secret,
				{
					expiresIn: 86400 // expires in 24 hours
				}
			);

			res.status(200).send({ auth: true, token: token });
		}
	);
});

router.get('/me', VerifyToken, function(req, res, next) {
	User.findById(req.userId, { password: 0 }, function(err, user) {
		if (err)
			return res
				.status(500)
				.send('There was a problem finding the user.');
		if (!user) return res.status(404).send('No user found.');
		res.status(200).send(user);
	});
});

module.exports = router;
