'use strict';
var express = require('express');
var router = express.Router();
var path = require("path");
var rio = require("rio");

router.all('/', (req, res) => {
	rio.e({
		filename: path.join(".\\Rfile\\interface.r"),
		entrypoint: "getResult",
		data: {a:"abc"},
		callback: (err, result) => {
			if (!err) {
				res.send(result);
			} else {
				res.send("Optimization failed");
			}
		},
		host:"127.0.0.1",
		port:"6311"
	});
});


module.exports = router;