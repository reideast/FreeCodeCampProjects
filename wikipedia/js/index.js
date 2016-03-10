// $(document).ready(function() {
//   console.log("**** page refresh ****");
// });
var genericResult = $('<div class="result row"><div class="well col-sm-10 col-sm-offset-1 col-md-8 col-md-offset-2"><h3 class="text-center">Result Title</h3><div class="resultImgBox pull-right text-center"><img src="http://placehold.it/100x100" width="100" height="100"></div><p class="text-justify"></p></div></div>');

//$("#executeSearch").on("click", function() {
function searchForIt() {
  var ajaxSuccess = function(json) {
    // console.log(JSON.stringify(json));
    $("#results").empty();
    var pages = json.query.pages;
    Object.keys(pages).forEach(function(key) {
      // console.log("********" + key + "*********");
      //console.log(JSON.stringify(pages[key]));
      // console.log(currResult);
      // console.log(currResult.children());
      var currResult = genericResult.clone();
      currResult.attr("id", "wikiResult_" + pages[key].pageid);
      $("#results").append(currResult);
      $("#" + "wikiResult_" + pages[key].pageid + " h3").html(pages[key].title);
      $("#" + "wikiResult_" + pages[key].pageid + " p").html(pages[key].extract);
      
      // console.log(pages[key].pageid);
      // console.log(pages[key].title);
      // console.log(pages[key].extract);
      if (pages[key].hasOwnProperty("thumbnail")) {
        $("#" + "wikiResult_" + pages[key].pageid + " img").attr("src", pages[key].thumbnail.source);
        $("#" + "wikiResult_" + pages[key].pageid + " img").attr("width", pages[key].thumbnail.width);
        $("#" + "wikiResult_" + pages[key].pageid + " img").attr("height", pages[key].thumbnail.height);
        if (pages[key].hasOwnProperty("pageimage")) {
          $("#" + "wikiResult_" + pages[key].pageid + " img").attr("alt", (pages[key].pageimage).replace(/\.[^.]+$/, ""));
          // console.log("alt=" + (pages[key].pageimage).replace(/\.[^.]+$/, ""));
        }
        // console.log(pages[key].thumbnail.source);
        // console.log(pages[key].thumbnail.width);
        // console.log(pages[key].thumbnail.height);
      }
      else {
        $("#" + "wikiResult_" + pages[key].pageid + " .resultImgBox").css("display", "none");
      }
      
    });
  };
  
  /*
  Description of my API findings:
  /w/api.php?
  action=query
  &format=json
  
  prop=extracts
  &exintro //return only intro section
  &explaintext //return 
  &exsentences=1 //how many English sentences of the extract to reutrn
  &exlimit=20 //max extracts to return
  
  prop=pageimages
  piprop=thumbnail|name //thumbnail url and dimensions, name = image title
  pithumbsize=50 //max thumbnail dimensions
  pilimit=max //number of pageimages
  */
    
  var ajaxURL = "https://en.wikipedia.org/w/api.php" + 
                "?action=query" +
                "&format=json" +
                "&prop=extracts%7Cpageimages" +
                "&generator=search" +
                "&callback=jsonCallback" +
                "&utf8=1" +
                "&exsentences=2" +
                "&exlimit=20" +
                "&exintro=1" +
                "&explaintext=1" +
                "&piprop=thumbnail%7Cname" +
                "&pithumbsize=100" +
                "&pilimit=50" +
                "&gsrsearch=";
  // var searchString = "Al-Farabi";
  var searchString = $("#query").val();
  console.log("search box=" + $("#query").val());
  $.ajax( {
    url: ajaxURL + searchString,
    data: {},
    dataType: 'jsonp',
    jsonpCallback: 'jsonCallback',
    contentType: 'application/json',
    type: 'POST',
    headers: { 'Api-User-Agent': 'AndrewsWikiRequest/1.0 (andrew@andreweast.net)' },
    success: ajaxSuccess,
    error: function(err) {
      console.log(err.message);
    }
  });
  return false; //tell the form not to reload the page!
}
