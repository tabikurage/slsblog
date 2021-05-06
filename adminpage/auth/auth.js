const auth = require('basic-auth');

module.exports = function (request, response, next) {
  const admins = {
    [process.env.BASIC_AUTH_USERNAME]: { password: process.env.BASIC_AUTH_PASSWORD },
  };
  const user = auth(request);
  
  if (!user || !admins[user.name] || admins[user.name].password !== user.pass) {
    response.set('WWW-Authenticate', 'Basic realm="example"');
    return response.status(401).send();
  }
  return next();
};