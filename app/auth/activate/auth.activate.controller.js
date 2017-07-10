/**
 * Created by shubham on 10/7/17.
 */

/**
 * Created by shubham on 8/7/17.
 */

angular.module('ChitChatApp')
    .controller('ActivateCtrl', function (Auth,$state,cognitoService,$scope) {
        var activateCtrl = this;

        activateCtrl.userActivate = {
            email: '',
            pin: ''
        };

        activateCtrl.activate = function () {
            var userPool = cognitoService.getUserPool();

            var cognitoUser = cognitoService.getUser(userPool, activateCtrl.userActivate.email);
            var activationKey = activateCtrl.userActivate.pin;

            cognitoUser.confirmRegistration(activationKey, true, function (err, result) {
                if (err) {
                    console.log(err);

                    activateCtrl.errorMessage = err.message;
                    return;
                }
                $state.go('channels');
            });
        }
    });