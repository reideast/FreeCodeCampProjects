$(document).ready(function() {
  console.log("**** page refresh ****");
	
  var ajaxURL = 
			"https://en.wikipedia.org/w/api.php?" +
			"action=query" +
			"&titles=Main%20Page" + 
			"&prop=revisions" + 
			"&rvprop=content" +
			"&format=json"; // + 
			//"&callback=JSON_CALLBACK";
  var ajaxSuccess = function(json) {
    console.log(JSON.stringify(json));
  };
	//var api = 'http://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=10&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&gsrsearch=hello&callback=jsonCallback';
	$.ajax( {
    url: ajaxURL,
    data: {},
    dataType: 'jsonp',
		//jsonpCallback: 'jsonCallback',
		contentType: 'application/json',
    type: 'POST',
    headers: { 'Api-User-Agent': 'AndrewsWikiRequest/1.0 (andrew@andreweast.net)' },
    success: ajaxSuccess,
		error: function(err) {
			console.log(err.message);
		}
	});
	
});