var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
// var VerifyToken = require('./VerifyToken');
var SubCat = require('../Modules/SubCat');
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(cors());

router.get('/', function(req, res) {
	SubCat.find({}, function(err, user) {
		if (err)
			return res
				.status(500)
				.send('There was a problem finding the category.');
		if (!user) return res.status(404).send('No category found.');
		res.status(200).send(user);
	});
});

router.post('/', function(req, res) {
	SubCat.find({ parent: req.body.catId }, function(err, user) {
		if (err)
			return res
				.status(500)
				.send('There was a problem finding the category.');
		if (!user) return res.status(404).send('No category found.');
		res.status(200).send(user);
	});
});

module.exports = router;
