const bodyParser = require('body-parser');
const controller = require('./controllers/controller');
const auth = require('./auth/auth');

/* 1. expressモジュールをロードし、インスタンス化してappに代入。*/
var express = require("express");
var app = express();


/* 3. 以後、アプリケーション固有の処理 */

// Basic認証を実施
app.use(auth);

// bodyをパースできるようにする
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// トレイリングスラッシュを削除する
app.use((req, res, next) => {
    if (req.path.substr(-1) === '/' && req.path.length > 1) {
        const query = req.url.slice(req.path.length);
        res.redirect(301, req.path.slice(0, -1) + query);
    }
    else {
        next();
    }
});

// View EngineにEJSを指定。
app.set('view engine', 'ejs');

// Webページの表示
app.get("/", controller.index);
app.get("/post", controller.post);

// Post先の設定
app.post('/save/:revision', controller.save);

// CSS、JSの使用
app.use(express.static('public'));

// lambdaにするために必要
module.exports = app;
