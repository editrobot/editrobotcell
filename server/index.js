var path = require("path");
const express = require('express')
const app = express()

var vis = require('./Router/vis');
var serverport = 3000;


app.use('/', express.static('../client/build'));

app.use('/vis',vis);

app.listen(serverport, () => console.log('Example app listening on port '+serverport+'!'))