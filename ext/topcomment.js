var TopComment = TopComment || {};

TopComment =
{
  comment_cache : {},
  hover_delay   : 300,

  _xhr :          null,
  _hover_intent : null,
  _commentDivID : "_tc_comment_div",


  init : function()
  {
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
    if ($(el).text().split(" ").length < 2) {
      return; // no comments (yeah, it's hackish)
    }
    $(el).hover(function() // on hover
    {
      TopComment._hover_intent = setTimeout(function() {
        TopComment.cancelXHR();

        json_url = $(el).attr('href') + '.json?limit=1&depth=1';
        top_comment = false;

        TopComment.showCommentLoading(el);

        if (json_url in TopComment.comment_cache)
        {
          top_comment = TopComment.comment_cache[json_url];
          TopComment.showTopComment(el, top_comment);
        }
        else
        {
          _xhr = $.getJSON(json_url, function(data)
          {
            try {
              top_comment = data[1]['data']['children'][0]['data'];
              TopComment.showTopComment(el, top_comment);
            } catch(error) {
              console.error("Error extracting comment: " + error.message);
            }
            TopComment.comment_cache[json_url] = top_comment;
          });
        }
      }, TopComment.hover_delay);
    },

    function () { // on hover out
      try{clearTimeout(TopComment._hover_intent);} catch(e){};
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
        'max-width' : '500px',
        'background' : '#fff',
        'padding' : '10px',
        'border' : '1px solid #777'
      }).appendTo("body");
    }
    return document.getElementById(TopComment._commentDivID);
  },
  showCommentLoading : function (el)
  {
    $(TopComment.getMessageDIV(el)).html("<span class='md'>Loading top comment...</span>");
  },
  showTopComment : function (el, top_comment)
  {
    // Text
    var body_html = $("<div/>").html(top_comment['body_html']).text(); // quick method to decode entities
    var tagline = $("<p/>").addClass('tagline');
      var author = $("<a/>").html(top_comment['author']).attr('href', 'http://reddit.com/user/' + top_comment['author']).addClass('author');
    tagline.append(author);
    $(TopComment.getMessageDIV(el)).html(body_html).prepend(tagline);

  },
  hideTopComment : function (el, top_comment)
  {
    $("#" + TopComment._commentDivID).remove();
  }
}

TopComment.init();