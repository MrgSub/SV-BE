var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
// var VerifyToken = require('./VerifyToken');
var Listing = require('../Modules/Listing');
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(cors());

router.get('/', function(req, res) {
	Listing.find({}, function(err, user) {
		if (err)
			return res
				.status(500)
				.send('There was a problem finding the listing.');
		if (!user) return res.status(404).send('No listing found.');
		res.status(200).send(user);
	});
});

module.exports = router;
