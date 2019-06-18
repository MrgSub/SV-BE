var mongoose = require('mongoose');
var CategorySchema = new mongoose.Schema({
	title: String,
	description: String,
	slug: String,
	sort: { type: Number, default: 1 }
});
mongoose.model('Category', CategorySchema);

module.exports = mongoose.model('Category');
