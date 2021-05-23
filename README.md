Serverless Blog
====
Create a blog without a server, using AWS Lambda, API Gateway and DynamoDB

## Install

1. Decide on a resource name. Include only lowercase letters (a-z) and hyphens (-) in the resource name. For example, use *resource-example*.

2. Open `/webpage/serverless.yml` and edit line 17-19 as follows:
   ```
   custom:
     resourceName: resource-example
     websiteName: Your blog name
   ```
   Similarly, open `/adminpage/serverless.yml` and edit line 19-21.

3. Execute the command as follows:

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