/**
 * Created by shubham on 8/7/17.
 */

angular.module('angularfireSlackApp')
    .factory('Auth', function($firebaseAuth){
        var auth = $firebaseAuth();
      return auth;
    });
