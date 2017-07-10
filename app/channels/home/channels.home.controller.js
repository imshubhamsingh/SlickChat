angular.module('SlickChatApp')
.controller('HomeController', function($http){
  var homeCtrl = this;
  // homeCtrl =
  $http.get('http://gnaman.pythonanywhere.com').then(function(response){
    console.log(response);
  },function (response) {
    console.log(response);
  });
});
