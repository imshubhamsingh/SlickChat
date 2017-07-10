/**
 * Created by shubham on 10/7/17.
 */

/**
 * Created by shubham on 8/7/17.
 */

angular.module('SlickChatApp')
    .controller('ActivateCtrl', function (Auth,$state,cognitoService,$stateParams,$scope) {
        var activateCtrl = this;

        activateCtrl.userActivate = {
            email: $stateParams.email,
            pin: ''
        };

        activateCtrl.activate = function () {
            var userPool = cognitoService.getUserPool();
            console.log($stateParams);

            var cognitoUser = cognitoService.getUser(activateCtrl.userActivate.email);
            var activationKey = activateCtrl.userActivate.pin;

            cognitoUser.confirmRegistration(activationKey, true, function (err, result) {
                if (err) {
                    activateCtrl.errorMessage = err.message;
                    $scope.$apply();
                    return;
                }
                $state.go('channels',{email: $stateParams.email, password: $stateParams.password, activation: true});
            });
        }
    });
