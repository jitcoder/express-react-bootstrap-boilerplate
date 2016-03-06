var express = require('express');
var app = express();
var router = express.Router();

app.use((req,res,next) => {
  console.log(req.method + ' -> ' + req.path);
  next();
});
app.use(express.static('dist'));
app.get('/', function(req, res) {
    res.sendfile('./dist/index.html');
});

app.listen(8181);
