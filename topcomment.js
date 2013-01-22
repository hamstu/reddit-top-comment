var TopComment = TopComment || {};

TopComment =
{
  comment_cache : {},
  _xhr :          null,
  _commentDivID : "_tc_comment_div",

  init : function()
  {
    $("a.title").each(TopComment.hookEachComment);
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
    $(el).hover(function()
    {
      TopComment.cancelXHR();

      json_url = $(this).parent().siblings('ul.flat-list').children('li.first').children('a.comments').attr('href') + '.json?limit=1&depth=1';
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
      $(el).bind('mousemove', function(e){
        messageDIV.css({
          'position' : 'absolute',
          'top' : e.pageY,
          'left' : e.pageX + 25,
          'max-width' : '400px',
          'padding' : '10px',
          'outline' : '1px dashed #888888',
          'background' : '#F0F3FC',
          'box-shadow' : '0 8px 10px rgba(0,0,0,.2)'
        }).appendTo("body");
      });
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
    $(TopComment.getMessageDIV(el)).remove();
  }
}

TopComment.init();
