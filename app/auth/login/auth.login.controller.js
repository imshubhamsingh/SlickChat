/**
 * Created by shubham on 10/7/17.
 */

angular.module('SlickChatApp')
    .controller('LoginCtrl', function (Auth,$state,cognitoService,$scope) {
        var loginCtrl = this;
        loginCtrl.userLogin = {
            email: '',
            password: ''
        };
        loginCtrl.login = function (){
            var cognitoUser = cognitoService.getUser(loginCtrl.userLogin.email);
            var authenticationDetails = cognitoService.getAuthenticationDetails(loginCtrl.userLogin.email, loginCtrl.userLogin.password);

            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: function (result) {
                    var accessToken = result.getAccessToken().getJwtToken();
                    loginCtrl.accessToken = accessToken;
                    $state.go('channels');
                },
                onFailure: function (err) {
                    loginCtrl.errorMessage = 'Your email address or password is incorrect.';
                    $scope.$apply();
                }
            });
        };


    });
