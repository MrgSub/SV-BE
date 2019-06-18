var mongoose = require('mongoose');
var MessageSchema = new mongoose.Schema({
	from: String,
	to: String,
	content: String,
	date: {
		type: String,
		default: Date.now()
	}
});
var ChatSchema = new mongoose.Schema({
	listing: String,
	parties: [String]
}).add({
	messages: [MessageSchema]
});
mongoose.model('Chat', ChatSchema);

module.exports = mongoose.model('Chat');
