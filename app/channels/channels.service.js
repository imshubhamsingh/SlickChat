/**
 * Created by shubham on 8/7/17.
 */

angular.module('angularfireSlackApp')
    .factory('Channels', function($firebaseArray){
        var ref = firebase.database().ref('channels');
        var channels = $firebaseArray(ref);

        return channels;
    });