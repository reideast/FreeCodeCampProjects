var Router = module.exports = function() {
  this.routes = [];
};

Router.prototype.add = function(method, url, handler) {
  this.routes.push({
    method: method,
    url: url,
    handler: handler
  });
};

Router.prototype.resolve = function(request, response) {
  var path = require("url").parse(request.url).pathname;
  
  return this.routes.some(function(route) { // Array.some() runs through elements one at a time, and will stop after function returns true (short circuit, like || operator does)
    var match = route.url.exect(path);
    if (!match || route.method != request.method)
      return false;
      
    var urlParts = match.slice(1).map(decodeURIcomponent);
    route.handler.apply(null, [request, response].concat(urlParts));
    
    return true;
  })
};
