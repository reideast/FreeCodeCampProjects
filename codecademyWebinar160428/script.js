var main = function() {
  $("form").submit(function(event) {
    var $input = $(event.target).find("input");
    var comment = $input.val(); // text box's contents
    
    if (comment !== "") {
      var $html = $("<li>").text(comment); // TODO: $html ??
      $html.prependTo("#comments");
      $input.val("");
    }
    
    // return false;
    event.preventDefault();
  });
}

$(document).ready(main);