var mongoose = require('mongoose');
var SubCategorySchema = new mongoose.Schema({
	title: String,
	description: String,
	slug: String,
	parent: String
});
mongoose.model('SubCategory', SubCategorySchema);

module.exports = mongoose.model('SubCategory');
