Serverless Blog
====
AWS Lambda, API Gateway, DynamoDBを利用したブログサービス

## Description
アクセス待ち受けにAPIGatewayとLambda、データベースにDynamoDBを用いることで、固定費用が掛かることなく、従量課金のみでブログを運用できることを目指したものです。

## Install

1. リソースの名前を決めます。リソース名には、英小文字(a-z)とハイフンのみ使用できます。例として、*resource-example*を使用します。

2. `/webpage/serverless.yml` を開き、17～19行目を以下のように変更します。
   ```
   custom:
     resourceName: resource-example
     websiteName: Your blog name
   ```
   同様に、`/adminpage/serverless.yml` を開き、19～21行目を変更します。

3. 以下のコマンドを実行します。
   ```
   cd database
   sh ./install.sh resource-example
   cd ../adminpage
   npm install
   sls deploy -v
   cd ../webpage
   npm install
   sls deploy -v
   ```

## License
MIT License

## Author
[tabikurage](https://github.com/tabikurage)