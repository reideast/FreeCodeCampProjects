$(document).ready(function() {
  console.log("**** page refresh ****")
});

// fetch Free Code Camp's Twitch channel data:
// https://github.com/justintv/Twitch-API
// https://github.com/justintv/Twitch-API/blob/master/v3_resources/streams.md#get-streamschannel

var possibleStreams = ["brunofin", "comster404", "test_channel", "test_channel2", "riotgames", "playhearthstone", "freecodecamp", "storbeck", "terakilobyte", "habathcx", "RobotCaleb", "thomasballinger", "noobs2ninjas", "beohoff"];

function getChannelInfo(channelList) {
  var channels = {};
  channelList.forEach(function(currChannelName) {
    $.getJSON(getUserURL(currChannelName), function(data) {
      console.log(data);
      if ("error" in data)  {
        console.log("error found for " + currChannelName);
        var curr = {
          "display_name": currChannelName,
          "error": data.error,
          "message": data.message
        };
        channels[currChannelName] = curr;
      } else {
        var curr = {
          "id": data.id,
          "display_name": data.display_name,
          "logo": data.logo,
          "bio": data.bio
        };
        channels[currChannelName] = curr; 
      }
    });
  });
  $.getJSON(getStreamsURL(channelList), function(data) {
    console.log(data);
  });
  console.log("inside function" + channels);
  return channels;
}

function getUserURL(username) {
  return "https://api.twitch.tv/kraken/users/" + username + "?api_version=3&callback=?";
}
function getStreamsURL(streamsArr) {
  return "https://api.twitch.tv/kraken/streams?channel=" + streamsArr.join(",") + "&api_version=3&callback=?";
}

//var channels = getChannelInfo(possibleStreams);
// console.log("outside function " + channels);

//asynchnous function foundation:
// var channelInfo_Promise = getOneChannelInfoAsync("brunofin");
// var channelInfo_Promise_array = [getOneChannelInfoAsync("brunofin"), getOneChannelInfoAsync("test_channel")];
//use .map on the array of strings, calling the function which returns a $.Promise object on EACH ONE
var channelInfo_Promise_array = possibleStreams.map(function (currChannelName) {
  return getOneChannelInfoAsync(currChannelName); //starts the async AJAX REST call, and returns a single $.Promise object 
});
//all async calls have been started, and channelInfo_Promise_array now contains an array of $.Promise objects

// https://api.jquery.com/jquery.when/#jQuery-when-deferreds and http://stackoverflow.com/a/17595453/5271224
//use $.when to "group" all the $.Promise.done() expectations, and wait for ALL of them to be .done()
//use .apply() to apply ALL the functions to .when (a similar function to .call(), but for arrays of functions)
$.when.apply($, channelInfo_Promise_array).then(function() {
  console.log("all functions done");
  for (var i = 0; i < arguments.length; i++) {
    console.log(arguments[i]);
  };
});

// channelInfo_Promise.done(useChannelInfo);
// channelInfo_Promise.fail(apiFailed);

function useChannelInfo(channelObject) {
  console.log(channelObject);
}

function getOneChannelInfoAsync(currChannelName) {
  var deferred = $.Deferred();
  console.log("before getJSON call: " + currChannelName);
  $.getJSON(getUserURL(currChannelName), function(data) {
    console.log("inside getJSON call: " + currChannelName);
    if ("error" in data)  {
      console.log("error found for " + currChannelName);
      var curr = {
        "id": currChannelName,
        "display_name": currChannelName,
        "error": data.error,
        "message": data.message
      };
      deferred.resolve(curr);
    } else {
      var curr = {
        "id": data._id,
        "display_name": data.display_name,
        "logo": data.logo,
        "bio": data.bio
      };
      deferred.resolve(curr); 
    }
  });
  return deferred.promise();
}
