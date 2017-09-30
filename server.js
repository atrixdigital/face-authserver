const express = require("express");
const bodyParser = require("body-parser");
const app = express();


var PORT = process.env.PORT || 4200;

const login = require('./routes/login');
const signup = require('./routes/signup');
const analyzer = require('./routes/analyzer');


app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

app.use('/api', login);
app.use('/api', signup);
app.use('/api', analyzer);

/*Server Setup*/
app.use(express.static(__dirname + '/public'));
app.listen(PORT);
console.log("working on "+ PORT);
