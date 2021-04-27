const app = require('./app');

// 8080ポートで起動
var server = app.listen(8080, function() {
    console.log("Node.js is listening to PORT:" + server.address().port);
});