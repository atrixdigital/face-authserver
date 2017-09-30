const express = require("express");
const bodyParser = require("body-parser");
const oxford = require('project-oxford'), client = new oxford.Client('0bd837cc949249bea74f91fd34a55d69','westcentralus');
const app = express();


var PORT = process.env.PORT || 4200;

const login = require('./routes/login');
const signup = require('./routes/signup');

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use('/api', login);
app.use('/api', signup);

/*Server Setup*/
app.use(express.static(__dirname + '/public'));
app.listen(PORT);
console.log("working on "+ PORT);
