'use strict';
var express = require('express');
var router = express.Router();
var path = require("path");
var rio = require("rio");

function displayResponse(err, res) {
	var i;

	if (!err) {
		console.log(res)
	} else {
		console.log("Optimization failed");
	}
};

router.all('/', (req, res) => {
	
	rio.e({command: "pi * 2 * 2",host:"127.0.0.1",port:"6311"});
	rio.e({
		filename: path.join("..\\Rfile\\interface.r"),
		entrypoint: "getResult",
		data: {a:"abc"},
		callback: displayResponse,
		host:"127.0.0.1",
		port:"6311"
	});
	res.send({});
});


module.exports = router;