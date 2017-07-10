/**
 * Created by shubham on 8/7/17.
 */

angular.module('SlickChatApp')
    .controller('ChannelsCtrl', function($state, Auth, Users,cognitoService,$scope,md5){
        var channelsCtrl = this;

        var userPool = cognitoService.getUserPool();
        var currentUser = userPool.getCurrentUser();

        channelsCtrl.profile = "";
        channelsCtrl.channels = "";
        channelsCtrl.getDisplayName = "";
        channelsCtrl.getGravatar = "";
        channelsCtrl.users = "";
        channelsCtrl.displayName ="";
        channelsCtrl.userEmail = "";
        currentUser.getSession(function(err, session) {
                if (err) {
                    alert(err);
                    return;
                }
                console.log('session validity: ' + session.isValid());
            });
            currentUser.getUserAttributes(function(err, result) {
                if (err) {
                    alert(err);
                    return;
                }
                console.log(result);

                for (var i = 0; i < result.length; i++) {
                    if(result[i].getName() === "name"){
                        channelsCtrl.displayName = result[i].getValue();
                    }
                    if(result[i].getName() === "email"){
                        channelsCtrl.userEmail = result[i].getValue();
                        channelsCtrl.getGravatar = '//www.gravatar.com/avatar/' + md5.createHash(channelsCtrl.userEmail)
                        console.log(channelsCtrl.getGravatar)
                    }
                }
                $scope.$apply();
            });

        console.log(channelsCtrl.displayName);

        //Users.setOnline(profile.$id);

        channelsCtrl.newChannel = {
            name: ''
        };
        channelsCtrl.createChannel = function(){
            channelsCtrl.channels.$add(channelsCtrl.newChannel).then(function(ref){
                $state.go('channels.messages', {channelId: ref.key});
            });
        };
        channelsCtrl.logout = function(){
            // channelsCtrl.profile.online = null;
            // channelsCtrl.profile.$save().then(function(){
            //     Auth.$signOut().then(function(){
            //         $state.go('home');
            //     });
            // });
            cognitoService.getUser(channelsCtrl.userEmail).signOut();
            $state.go('home');
        };

    });