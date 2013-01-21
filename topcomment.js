var TopComment = TopComment || {};

TopComment =
{
  comment_cache : {},
  _xhr :          null,
  _commentDivID : "_tc_comment_div",

  init : function()
  {
    console.log("TopComment.init();");
    $("a.comments").each(TopComment.hookEachComment);
  },

  cancelXHR : function()
  {
    if (TopComment._xhr)
    {
      TopComment._xhr.abort();
      TopComment._xhr = null;
    }
  },

  hookEachComment : function(index, el)
  {
    $(el).hover(function()
    {
      TopComment.cancelXHR();

      json_url = $(this).attr('href') + '.json';
      console.log("URL: " + json_url);
      top_comment = false;

      TopComment.showCommentLoading(el);

      if (json_url in TopComment.comment_cache)
      {
        console.log("Found comment in cache!");
        top_comment = TopComment.comment_cache[json_url];
        TopComment.showTopComment(el, top_comment);
      }
      else
      {
        console.log("Fetching comments from JSON!");
        _xhr = $.getJSON(json_url, function(data)
        {
          console.log("Got comment data! Extracting top_comment");
          try {
            top_comment = data[1]['data']['children'][0]['data'];
            TopComment.showTopComment(el, top_comment);
          } catch(error) {
            console.log("Error extracting comment: " + error.message);
          }
          TopComment.comment_cache[json_url] = top_comment;
        });
      }
    },

    function () { // on hover out
      TopComment.cancelXHR();
      TopComment.hideTopComment(el);
    });
  },

  getMessageDIV : function(el)
  {
    var d = document.getElementById(TopComment._commentDivID);
    if (d) { return d; }
    else {
      var messageDIV = $('<div/>', { id: TopComment._commentDivID });
      var offset = $(el).offset();
      var height = $(el).outerHeight();

      messageDIV.css({
        'position' : 'absolute',
        'top' : offset.top + height + "px",
        'left' : offset.left,
        'width' : '60%',
        'background' : '#fff',
        'padding' : '10px',
        'border' : '1px solid #777'
      }).appendTo("body");
    }
    return document.getElementById(TopComment._commentDivID);
  },
  showCommentLoading : function (el)
  {
    console.log("showCommentLoading");
    $(TopComment.getMessageDIV(el)).html("Loading comment...");
  },
  showTopComment : function (el, top_comment)
  {
    // Text
    console.log("showTopComment: " + top_comment['body_html']);
    var body_html = $("<div/>").html(top_comment['body_html']).text(); // quick method to decode entities
    var tagline = $("<p/>").addClass('tagline');
      var author = $("<a/>").html(top_comment['author']).attr('href', 'http://reddit.com/user/' + top_comment['author']).addClass('author');
    tagline.append(author);
    $(TopComment.getMessageDIV(el)).html(body_html).prepend(tagline);

  },
  hideTopComment : function (el, top_comment)
  {
    $(TopComment.getMessageDIV(el)).remove();
  }
}

TopComment.init();