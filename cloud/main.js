
// Use Parse.Cloud.define to define as many cloud functions as you want.
// For example:
Parse.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});
Parse.Cloud.define("graph", function(request, response) {
  var start = new Date();
  var graph = 'https://graph.facebook.com/me/friends?fields=id,name,installed&limit=5000';
  var url = graph + '&access_token=' + request.params.token;
  Parse.Cloud.httpRequest({
    url: url,
    success: function(httpResponse) {
      var friends = JSON.parse(httpResponse.text);
      var Friend = Parse.Object.extend('Friend');
      var friendObjs = [];
      for( var i = 0; i < friends.data.length; i++ ) {
        if( friends.data[i].installed ) {
          var friend = new Friend();
          friend.set('fbid', friends.data[i].id);
          friend.set('name', friends.data[i].name);
          friendObjs.push(friend);
        }
      }
      var end = new Date();
      Parse.Object.saveAll(friendObjs,{
        success: function(list) {
          response.success(list.length + ' ' + (end-start));
        },
        error: function(error) {
          response.error('Save failed ' + error);
        },
      });
    },
    error: function(httpResponse) {
      response.error('Request failed with response ' + httpResponse.text);
    }
  });
});