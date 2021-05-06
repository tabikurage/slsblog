const app = require('./app');

// 環境変数の設定
process.env.DB_NAME = "SLSBlogDB";
process.env.SITE_NAME = "SLSBlog";

// 8080ポートで起動
var server = app.listen(8080, function() {
    console.log("Node.js is listening to PORT:" + server.address().port);
});