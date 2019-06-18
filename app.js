var express = require('express');
var app = express();
var db = require('./db');

var SubCatController = require('./Controllers/SubCatController');
app.use('/api/subcat', SubCatController);

var CatController = require('./Controllers/CatController');
app.use('/api/cat', CatController);

var ListController = require('./Controllers/ListController');
app.use('/api/list', ListController);

var AuthController = require('./Controllers/AuthController');
app.use('/', AuthController);

module.exports = app;
