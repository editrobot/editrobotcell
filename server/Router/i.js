'use strict';
var express = require('express');
var router = express.Router();
var path = require("path");

router.all('/', (req, res) => {
	console.log('http://localhost:3000/?wsp=3004');
	res.redirect('http://localhost:3000/?wsp=3004');
});


module.exports = router;