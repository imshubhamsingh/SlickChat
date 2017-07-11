/**
 * Created by shubham on 8/7/17.
 */

angular.module('SlickChatApp')
    .factory('Messages', function($firebaseArray){
        var channelMessagesRef = firebase.database().ref('channelMessages');
        var userMessagesRef = firebase.database().ref('userMessages');

        return {
            forChannel: function(channelId){
                return $firebaseArray(channelMessagesRef.child(channelId));
            },
            forUsers: function(uid1, uid2){
                var path = uid1 < uid2 ? uid1+'/'+uid2 : uid2+'/'+uid1;

                return $firebaseArray(userMessagesRef.child(path));
            }
        };
    });
