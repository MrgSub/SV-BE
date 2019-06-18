var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var VerifyToken = require('./VerifyToken');
var Category = require('../Modules/Category');
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(cors());

router.get('/', function(req, res) {
	Category.find({}, function(err, user) {
		if (err)
			return res
				.status(500)
				.send('There was a problem finding the category.');
		if (!user) return res.status(404).send('No category found.');
		res.status(200).send(user);
	});
});

router.post('/', function(req, res) {
	Category.findById(req.body.catId, {}, function(err, user) {
		if (err)
			return res
				.status(500)
				.send('There was a problem finding the category.');
		if (!user) return res.status(404).send('No category found.');
		res.status(200).send(user);
	});
});

router.post('/create', VerifyToken, function(req, res) {
	let data = req.body.data;
	Category.create(
		{
			title: data.title,
			description: data.description,
			slug: data.slug,
			sort: data.sort
		},
		function(err, cat) {
			if (err)
				return res
					.status(500)
					.send('There was a problem creating the category.');
			if (!cat) return res.status(404).send('No category created.');
			res.status(200).send({ message: 'Success!' });
		}
	);
});

router.post('/update', VerifyToken, function(req, res) {
	let data = req.body.data;
	Category.update(
		{ _id: data._id },
		{
			title: data.title,
			description: data.description,
			slug: data.slug,
			sort: data.sort
		},
		function(err, cat) {
			if (err)
				return res
					.status(500)
					.send('There was a problem creating the category.');
			if (!cat) return res.status(404).send('No category created.');
			res.status(200).send({ message: 'Success!' });
		}
	);
});

module.exports = router;
