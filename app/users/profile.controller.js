/**
 * Created by shubham on 8/7/17.
 */

angular.module('ChitChatApp')
    .controller('ProfileCtrl', function($state, md5, auth, profile){
        var profileCtrl = this;
        profileCtrl.profile = profile;

        profileCtrl.updateProfile = function(){
            profileCtrl.profile.emailHash = md5.createHash(auth.email);
            profileCtrl.profile.$save();
            $state.go('channels');
        };

    });