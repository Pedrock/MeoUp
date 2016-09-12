const playerScriptUrlRegex = /\/\/s\.ytimg.com\/(.+?\/)+(player.+?)\/.+?.js/i;
const scriptRegex = /function\((.)\){([\s\S]+)}/i;
const decodeFunctionNameRegex = /\.sig\|\|([a-zA-Z0-9$]+)\(/i;
const request = require('request');
const vm = require('vm');

function decode(res, playerScriptUrl, encodedStrings, callback)
{
  request(playerScriptUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var param = body.match(scriptRegex)[1];
      var script = body.match(scriptRegex)[2];
      script =
          "this.document = {}; \
		   this.document.currentScript = {src:'base.js'}; \
		   this.navigator = {userAgent: 'Internet Explorer'}; \
		   this.location = {protocol:'https'};"
          + "var " + param + "={};"
          + script;

      var myScript = vm.createScript(script);
      var myContext = vm.createContext(myContext);
      var decodeFunctionName = script.match(decodeFunctionNameRegex)[1];
      myScript.runInNewContext(myContext);

      var encodeds = JSON.parse(encodedStrings);
      var decodeds = {};

      for (var i in encodeds)
      {
        decodeds[i] = myContext[decodeFunctionName](encodeds[i]);
      }

      callback(null, decodeds);
    }
    else
    {
      callback(new Error('Signature Decoding Failed'));
    }
  });
}

module.exports = function (res, videoID, encodedStrings, callback) {
  var videoUrl = "https://www.youtube.com/watch?v=" + videoID;
  request(videoUrl, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var playerScriptUrl = "https:" + body.match(playerScriptUrlRegex)[0];
      return decode(res, playerScriptUrl, encodedStrings, callback);
    }
    else
    {
      callback(new Error('Signature Decoding Failed'));
    }
  });
};