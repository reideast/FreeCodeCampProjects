$(document).ready(function() {
  console.log("**** page refresh ****")
});

// fetch Free Code Camp's Twitch channel data:
// https://github.com/justintv/Twitch-API
// https://github.com/justintv/Twitch-API/blob/master/v3_resources/streams.md#get-streamschannel

var possibleChannels = ["twitch", "brunofin", "comster404", "test_channel", "test_channel2", "riotgames", "playhearthstone", "freecodecamp", "storbeck", "terakilobyte", "habathcx", "RobotCaleb", "thomasballinger", "noobs2ninjas", "beohoff"];
var channels = {}; //to be filled by $.Promise.done()

//asynchnous function foundation:
//use .map on the array of strings, calling the function which returns a $.Promise object on EACH ONE
var channelInfo_Promise_array = possibleChannels.map(function (currChannelName) {
  return getOneChannelInfoAsync(currChannelName); //starts the async AJAX REST call, and returns a single $.Promise object 
});
// var streamsInfo_Promise = getAllStreamsInfoAsync(possibleChannels);
channelInfo_Promise_array.push(getAllStreamsInfoAsync(possibleChannels));
//all async calls have been started, and channelInfo_Promise_array now contains an array of $.Promise objects

// https://api.jquery.com/jquery.when/#jQuery-when-deferreds and http://stackoverflow.com/a/17595453/5271224
//use $.when to "group" all the $.Promise.done() expectations, and wait for ALL of them to be .done()
//use .apply() to apply ALL the functions to .when (a similar function to .call(), but for arrays of functions)
$.when.apply($, channelInfo_Promise_array).then(saveAggregateChannelInfo);

function saveAggregateChannelInfo() {
  // console.log("all functions done");
  for (var i = 0; i < arguments.length; i++) {
    // console.log(arguments[i]);
    if ("name" in arguments[i]) {
      channels[arguments[i].name] = arguments[i];
    } else if ("streams" in arguments[i]) {
      //this is a Streams object
      console.log("DEBUG: These are the active streams: ");
      console.log(arguments[i]);
      arguments[i].streams.forEach(function(currStream) {
        channels[currStream.channel.name].isStreaming = true;
        channels[currStream.channel.name].game = currStream.game;
        channels[currStream.channel.name].viewers = currStream.viewers;
        channels[currStream.channel.name].status = currStream.channel.status;
        channels[currStream.channel.name].url = currStream.channel.url;
        channels[currStream.channel.name].profile_banner = currStream.channel.profile_banner;
        // console.log(channels[currStream.channel.name]);
      });
    } else {
      console.log("Error: unknown object was received from API call:");
      console.log(arguments[i]);
    }
  };
  console.log("DEBUG: This is the completed 'channels' object: ");
  console.log(channels);
  
  showChannelInfo();
}

function getOneChannelInfoAsync(currChannelName) {
  var deferred = $.Deferred();
  // console.log("before getJSON call: " + currChannelName);
  $.getJSON(getUserURL(currChannelName), function(data) {
    // console.log("inside getJSON call: " + currChannelName);
    if ("error" in data)  {
      console.log("Channel not found: " + currChannelName);
      var curr = {
        "id": currChannelName,
        "display_name": currChannelName,
        "name": currChannelName,
        "error": data.error,
        "message": data.message,
        "isStreaming": false
      };
      deferred.resolve(curr);
    } else {
      var curr = {
        "id": data._id,
        "display_name": data.display_name,
        "name": data.name,
        "logo": data.logo,
        "bio": data.bio,
        "isStreaming": false
      };
      deferred.resolve(curr); 
    }
  });
  return deferred.promise();
}

function getAllStreamsInfoAsync(streamsArray) {
  var deferred = $.Deferred();
  $.getJSON(getStreamsURL(streamsArray), function(data) {
    deferred.resolve(data);
  });
  return deferred.promise();
}

function getUserURL(username) {
  return "https://api.twitch.tv/kraken/users/" + username + "?api_version=3&callback=?";
}
function getStreamsURL(streamsArr) {
  return "https://api.twitch.tv/kraken/streams?channel=" + streamsArr.join(",") + "&api_version=3&callback=?";
}
/*
{
  freecodecamp: {
    id: 79776140,
    name: "freecodecamp",
    display_name: "FreeCodeCamp",
    logo: "https://static-cdn.jtvnw.net/jtv_user_pictures/freecodecamp-profile_image-d9514f2df0962329-300x300.png",
    bio: "...",
    
    isStreaming: true,
    game: "Creative",
    profile_banner: "https://static-cdn.jtvnw.net/jtv_user_pictures/freecodecamp-profile_banner-6f5e3445ff474aec-480.png",
    status: "@fraziern struggles with React and CSS #programming",
    url: "https://secure.twitch.tv/freecodecamp",
    viewers: 21
  },
  ...
}
*/
function showChannelInfo() {
  console.log("now ready to show info");
}