/**
 * Created by shubham on 8/7/17.
 */

angular.module('ChitChatApp')
    .controller('ChannelsCtrl', function($state, Auth, Users, profile, channels){
        var channelsCtrl = this;
        channelsCtrl.profile = profile;
        channelsCtrl.channels = channels;
        channelsCtrl.getDisplayName = Users.getDisplayName;
        channelsCtrl.getGravatar = Users.getGravatar;
        channelsCtrl.users = Users.all;

        Users.setOnline(profile.$id);

        channelsCtrl.logout = function(){
            Auth.$signOut().then(function(){
                $state.go('home');
            });
        };

        channelsCtrl.newChannel = {
            name: ''
        };
        channelsCtrl.createChannel = function(){
            channelsCtrl.channels.$add(channelsCtrl.newChannel).then(function(ref){
                $state.go('channels.messages', {channelId: ref.key});
            });
        };
        channelsCtrl.logout = function(){
            channelsCtrl.profile.online = null;
            channelsCtrl.profile.$save().then(function(){
                Auth.$signOut().then(function(){
                    $state.go('home');
                });
            });
        };

    });