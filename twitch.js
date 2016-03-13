$(document).ready(function() {
	console.log("**** page refresh ****")
});

  // fetch Free Code Camp's Twitch channel data:
  // https://github.com/justintv/Twitch-API
  // https://github.com/justintv/Twitch-API/blob/master/v3_resources/streams.md#get-streamschannel
  
  var possibleStreams = ["riotgames", "playhearthstone", "freecodecamp", "storbeck", "terakilobyte", "habathcx","RobotCaleb","thomasballinger","noobs2ninjas","beohoff"];
  
  var apiURL = "https://api.twitch.tv/kraken/" +
               "streams?" +
               "channel=" + possibleStreams.join(",") + // freecodecamp,storbeck,terakilobyte" +
               "&api_version=3&callback=?";
  console.log(apiURL);
	$.getJSON(apiURL, function(data) {
    console.log(data);
  });