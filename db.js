var mongoose = require('mongoose');
const DB = {
	host: 'ds145356.mlab.com',
	port: '45356',
	db: 'heroku_g058m23w',
	username: 'root',
	password: 'bPp2W2DkDvjVMnB'
};
const url =
	'mongodb://' +
	DB.username +
	':' +
	DB.password +
	'@' +
	DB.host +
	':' +
	DB.port +
	'/' +
	DB.db;
mongoose.connect(url, { useNewUrlParser: true });
