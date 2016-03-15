$(document).ready(function() {
  console.log("**** page refresh ****")
  $('#statusTabs a').click(function (evnt) {
    evnt.preventDefault();
    $(this).tab('show'); //this would also switch Bootstrap's tab area, but I haven't created a properly bound tab area
    // console.log("click binding function");
    // console.log(this);
    // console.log(evnt);
    filterChannels(this.dataset["showwhat"]);
  })
});

function filterChannels(showWhat) {
  var channelElements = $("#channels").children();
  //console.log(channelElements);
  //.channelContainer, .streaming, .offline
  if (showWhat === "all") {
    $(".channelContainer").slideDown(500);
  } else if (showWhat === "online") {
    $(".streaming").slideDown(500);
    $(".offline").slideUp(500);
  } else if (showWhat === "offline") {
    $(".streaming").slideUp(500);
    $(".offline").slideDown(500);
  }
  
  //show all elements first (and if showWhat == all)
  // channelElements.css("display", "block");
  // channelElements.slideDown(500);
  
  // // for (var i = 0; i < channelElements.length; i++) {
  // channelElements.each(function(i, item) {
  //   // console.log(channelElements[i]);
  //   // console.log(channelElements[i].classList);
  //   // if (!channelElements[i].classList.contains("streaming"))
  //   //   channelElements[i].style.display = "none";
  //   if (!item.classList.contains("streaming"))
  //     $(item).slideUp(500);
  // });
  
  // if (showWhat === "online") {
  //   channelElements.filter(function(item) {
  //     console.log(item);
  //     if (item.classList.indexOf("streaming") !== -1)
  //       return false; //does not have class .streaming
  //     else
  //       return true; //has class .streaming
  //   }); //.css("display", "none");
  // }
}

// fetch Free Code Camp's Twitch channel data:
// https://github.com/justintv/Twitch-API
// https://github.com/justintv/Twitch-API/blob/master/v3_resources/streams.md#get-streamschannel

var possibleChannels = ["ESL_SC2", "twitch", "OgamingSC2", "brunofin", "comster404", "test_channel", "test_channel2", "riotgames", "playhearthstone", "freecodecamp", "storbeck", "terakilobyte", "habathcx", "RobotCaleb", "thomasballinger", "noobs2ninjas", "beohoff"];
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
    // console.log(data);
    if ("error" in data)  {
      console.log("Channel API call returned error: " + currChannelName);
      var curr = {
        "isError": true,
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
        //"bio": data.bio,
        "game": data.game,
        "profile_banner": data.profile_banner,
        "status": data.status,
        "url": data.url,
        "views": data.views,
        "isStreaming": false,
        "isError": false
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
  // return "https://api.twitch.tv/kraken/users/" + username + "?api_version=3&callback=?";
  return "https://api.twitch.tv/kraken/channels/" + username + "?api_version=3&callback=?";
}
function getStreamsURL(streamsArr) {
  return "https://api.twitch.tv/kraken/streams?channel=" + streamsArr.join(",") + "&api_version=3&callback=?";
}
/*
{
  freecodecamp: {
    id: 30220059
    name: "esl_sc2"
    display_name: "ESL_SC2"
    game: "StarCraft II"
    status: "RERUN: HyuN vs. Oz - Grand Final - WCS America 2014 Season 1 - StarCraft 2"
    logo: "https://static-cdn.jtvnw.net/jtv_user_pictures/esl_sc2-profile_image-d6db9488cec97125-300x300.jpeg"
    profile_banner: "https://static-cdn.jtvnw.net/jtv_user_pictures/esl_sc2-profile_banner-f8295b33d1846e75-480.jpeg"
    url: "https://secure.twitch.tv/esl_sc2"
    views: 57458963

    isStreaming: true
    viewers: 622
    isError: false
  },
  ...
}
*/
function showChannelInfo() {
  var defaultRow = '<div class="row channelContainer">' +
                     '<div class="col-sm-2 iconContainer">' +
                       '<div class="imgCenter">' +
                         '<div class="iconGeneric"><i class="glyphicon glyphicon-user"></i></div>' +
                        //  '<div class="iconGeneric text-center"><i class="fa fa-user"></i></div>' +
                         '<img class="img-rounded" src="http://placehold.it/75x75" width="75" height="75">' +
                       '</div>' +
                     '</div>' +
                     '<div class="col-sm-10 titleContainer">' +
                       '<h3>' +
                         'Channel Name' +
                       '</h3>' +
                       '<h4>' +
                         'Status Text' +
                       '</h4>' +
                     '</div>' +
                   '</div>';
  $(".loadingIcon").fadeOut(1000);
  $("#channels").empty();
  var channelKeys = Object.keys(channels);
  channelKeys.sort(function(a, b) {
    if (channels[a] !== channels[b]) {
      if (channels[a].isStreaming)
        return -1;
      else if (channels[a].isError)
        return 1;
      else if (channels[b].isStreaming)
        return 1;
    } else {
      return 0;
    }
  });
  var rowCounter = 0; //used by $.fadeIn() to introduce a delay to animate in sequence
  channelKeys.forEach(function(name) {
    var currRow = $(defaultRow);
    currRow.attr("id", channels[name].name);
    currRow.hide().appendTo("#channels").delay(rowCounter++ * 100).fadeIn(500); //animate in sequence
    $("#" + channels[name].name + " h3").html(channels[name].display_name);
    
    if (channels[name].logo) {
      $("#" + channels[name].name + " .iconContainer img").attr("src", channels[name].logo);
      $("#" + channels[name].name + " .iconContainer img").css("display", "initial");
      $("#" + channels[name].name + " .iconGeneric").css("display", "none");
    } else {
    }
    if (channels[name].status) {
      $("#" + channels[name].name + " h4").html(channels[name].status);
    } else {
      $("#" + channels[name].name + " h4").html("");
    }
    if (channels[name].isStreaming) {
      $("#" + channels[name].name).addClass("streaming");
      $("#" + channels[name].name + " h3").html($("#" + channels[name].name + " h3").html() + " <small><em>Streaming - " + channels[name].game + "</em></small>");
    } else {
      $("#" + channels[name].name).addClass("offline");
      $("#" + channels[name].name + " h3").html($("#" + channels[name].name + " h3").html() + " <small><em>Offline</em></small>");
      // $("#" + channels[name].name + " h4").html("Offline");
    }
    if (channels[name].isError) {
      $("#" + channels[name].name).addClass("deleted");
      $("#" + channels[name].name + " .iconGeneric").css("color", "#ccc");
    }
  });
}