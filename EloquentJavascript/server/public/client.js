
// a simplified wrapper around XMLHttpRequest
function request(options, callback) {
  var req = new XMLHttpRequest();
  req.open(options.method || "GET", options.pathname, true);
  req.addEventListener("load", function() {
    if (req.status < 400)
      callback(null, req.responseText);
    else
      callback(new Error("Request failed: " + req.statusText));
  });
  req.addEventListener("error", function() {
    callback(new Error("Network error"));
  });
  req.send(options.body || null);
}

var lastServerTime = 0;

// make an initial request for "/talks" from server
request({pathname: "talks"}, function(error, response) {
  if (error) {
    reportError(error);
  } else {
    response = JSON.parse(response);
    displayTalks(response.talks);
    lastServerTime = response.serverTime;
    waitForChanges();
  }
});

function reportError(error) {
  if (error)
    alert(error.toString());
}

var talkDiv = document.querySelector("#talks");
var shownTalk = Object.create(null);

function displayTalks(talks) {
  talks.forEach(function(talk) {
    var shown = shownTalks[talk.title];
    if (talk.deleted) {
      if (shown) {
        talkDiv.removeChild(shown);
        delete shownTalks[talk.title];
      }
    } else {
      var node = drawTalk(talk);
      if (shown)
        talkDiv.replaceChild(node, shown);
      else
        talkDiv.appendChild(node);
      shownTalk[talk.title] = node;
    }
  });
}

function instantiateTemplate(name, values) {
  function instantiateText(text) {
    return text.replace(/\{\{(\w+)\}\}/g, function(_, name) { // replace {{item}} with values[item]
      return values[name];
    });
  }
  function instantiate(node) {
    if (node.nodeType == document.ELEMENT_NODE) {
      var copy = node.cloneNode();
      for (var i = 0; i < node.childNodes.length; ++i) {
        copy.appendChild(instantiate(node.childNodes[i]));
      }
      return copy;
    } else if (node.nodeType == document.TEXT_NODE) {
      return document.createTextNode(instantiateText(node.nodeValue));
    } else {
      return node;
    }
  }
  
  var template = document.querySelector("#template ." + name);
  return instantiate(template);
}

function drawTalk(talk) {
  var node = instantiateTemplate("talk", talk);
  var comments = node.querySelector(".comments");
  talk.comments.forEach(function(comment) {
    comments.appendChild(instantiateTemplate("comment", comment));
  });
  
  node.querySelector("button.del").addEventListener("click", deleteTalk.bind(null, talk.title));
  
  var form = node.querySelector("form");
  form.addEventListener("submit", function(event) {
    event.preventDefault();
    addComment(talk.title, form.elements.comment.value);
    form.reset();
  });
  return node;
}

function talkURL(title) {
  return "talks/" + encodeURIComponent(title);
}

function deleteTalk(title) {
  request({pathname: talkURL(title), method: "DELETE"}, reportError);
}

function addComment(title, comment) {
  var comment = {author: nameField.value, message: comment};
  request({
    pathname: talkURL(title) + "/comments",
    body: JSON.stringify(comment),
    method: "POST"
  }, reportError);
}


