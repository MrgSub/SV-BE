var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	type: Number,
	verified: {
		type: Boolean,
		default: false
	}
});
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');
