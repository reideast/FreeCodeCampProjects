$(document).ready(function() {
	console.log("**** page refresh ****")
});

  // fetch Free Code Camp's Twitch channel data:
	$.getJSON('https://api.twitch.tv/kraken/streams/freecodecamp?callback=?', function(data) {
    console.log(data);
  });