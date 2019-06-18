var mongoose = require('mongoose');
var ListingSchema = new mongoose.Schema({
	op: String,
	title: String,
	description: String,
	location: String,
	gallery: Array,
	category: String,
	price: String,
	other: Array
});
mongoose.model('Listing', ListingSchema);

module.exports = mongoose.model('Listing');
