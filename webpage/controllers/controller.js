// controller.js
// controllerという名称であるが、現状Logic、Modelの範囲まで含む
// プログラムが肥大化してきた際は、分割を検討する
'use strict';
const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient({ region: 'ap-northeast-1' });
const async = require("async");
const moment = require("moment");

// アプリケーション固有設定
const DBName = 'SLSBlogDB';
const siteName = "SLSBlog";

module.exports.index = (req, res, next) => {
    console.log(req.query);

    let variable = {
        siteTitle: siteName,
        page: [{
            title: "",
            updateDate: "",
            createDate: "",
            revision: ""
        }],
        onAlert: ""
    };

    async.waterfall(
        [
            function(callback) { //記事一覧の取得
                let params = {
                    TableName: DBName,
                    IndexName: 'updateIndex',
                    KeyConditionExpression: '#typ = :hkey',
                    ExpressionAttributeNames: {
                        "#typ": "type",
                    },
                    ExpressionAttributeValues: {
                        ':hkey': "rev",
                    },
                    ScanIndexForward: false
                };
                docClient.query(params, callback);
            }
        ],
        function(err, results) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(results);
                let itemList = results.Items;
                
                itemList.forEach(elm => {
                    elm.updateDate = moment(elm.updateDate).utcOffset("+09:00").format("YYYY-MM-DD HH:mm");
                    elm.createDate = moment(elm.createDate).utcOffset("+09:00").format("YYYY-MM-DD HH:mm");
                });
                variable.page = itemList;
            }

            if (req.query.onAlert != null) {
                variable.onAlert = req.query.onAlert;
            }
            res.render("index", variable);
        }
    );
};


module.exports.post = (req, res, next) => {
    console.log(req.params);
    console.log(req.query);
    console.log(req.url);
    console.log(req.path);

    let revision = 0;
    let pagename = "";

    if (req.query.pagename != null) {
        async.waterfall(
            [
                function(callback) {
                    let params = {
                        TableName: DBName,
                        KeyConditionExpression: '#typ = :hkey and #pgname = :rkey',
                        ExpressionAttributeNames: {
                            "#typ": "type",
                            "#pgname": "pagename"
                        },
                        ExpressionAttributeValues: {
                            ':hkey': "rev",
                            ':rkey': req.query.pagename
                        }
                    };
                    docClient.query(params, callback);
                },
                function(data1, callback) {

                    console.log(data1);
                    if (data1.Count > 0) {
                        revision = parseInt(data1.Items[0].revision, 10);
                        pagename = data1.Items[0].pagename;

                        let params = {
                            TableName: DBName,
                            KeyConditionExpression: '#typ = :hkey and #pgname = :rkey',
                            ExpressionAttributeNames: {
                                "#typ": "type",
                                "#pgname": "pagename"
                            },
                            ExpressionAttributeValues: {
                                ':hkey': "post",
                                ':rkey': req.query.pagename + ':' + revision
                            }
                        };
                        docClient.query(params, callback);
                    }
                    else {
                        callback("No pagename");
                    }
                }
            ],
            function(err, data2) {
                if (err != null) {
                    console.log(err);
                }
                else {
                    console.log(data2);
                }
                if (data2.Count > 0) {
                    let variable = {
                        siteTitle: siteName + "管理ページ",
                        page: {
                            url: pagename,
                            item: data2.Items[0]
                        },
                        revision: revision + 1
                    };
                    res.render("post", variable);
                }
                else {
                    let variable = {
                        siteTitle: siteName + "管理ページ",
                        revision: 1,
                        page: {}
                    };
                    res.render("post", variable);
                }
            }
        );
    }
    else {
        let variable = {
            siteTitle: siteName + "管理ページ",
            revision: 1,
            page: {}
        };

        res.render("post", variable);
    }


};

// 記事が投稿されたとき
module.exports.save = (req, res, next) => {
    console.log(req.body);
    console.log(req.body.title);
    console.log(req.params);
    console.log(req.query);

    let updateDate = moment().toISOString();
    let queryString = "";

    async.waterfall([
        function(callback) {
            let item = {
                type: 'post',
                pagename: req.body.URL + ':' + req.params.revision,
                title: req.body.title,
                text: req.body.text,
                date: updateDate
            };

            let params = {
                TableName: DBName,
                Item: item,
                Expected: {
                    "pagename": { Exists: false }
                },
            };

            docClient.put(params, callback);
            // 成功なら次の関数へ、エラーならラストへ

        },
        function(data1, callback) {
            console.log(data1);

            // 既存アイテムが無いとき
            if (req.params.revision == 1) {
                let item = {
                    type: 'rev',
                    pagename: req.body.URL,
                    title: req.body.title,
                    revision: req.params.revision,
                    createDate: updateDate,
                    updateDate: updateDate
                };

                let params = {
                    TableName: DBName,
                    Item: item,
                };

                docClient.put(params, callback);
            }
            // 既存アイテムがあるとき
            else {
                let params = {
                    TableName: DBName,
                    Key: {
                        "type": 'rev',
                        "pagename": req.body.URL
                    },
                    ExpressionAttributeNames: {
                        "#x": "title",
                        "#y": "updateDate",
                        "#z": "revision"
                    },
                    ExpressionAttributeValues: {
                        ':x': req.body.title,
                        ':y': updateDate,
                        ':z': req.params.revision
                    },
                    UpdateExpression: "SET #x = :x, #y = :y, #z = :z",
                    ReturnValues: "UPDATED_NEW"
                };

                docClient.update(params, callback);
            }

            // 成功なら次の関数へ、エラーならラストへ
        }
    ], function(err, data2) {
        if (err) {

            if (err.code == "ConditionalCheckFailedException") {
                console.log("重複エラー");
                queryString = "?onAlert=1";
            }
            else {
                console.log(err);
                queryString = "?onAlert=2";
            }
        }
        else {
            queryString = "?onAlert=0";
        }
        console.log('all done.');
        console.log(queryString);
        res.redirect(303, '/' + queryString);
    });

};

