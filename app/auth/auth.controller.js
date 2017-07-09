/**
 * Created by shubham on 8/7/17.
 */

angular.module('ChitChatApp')
    .controller('AuthCtrl', function (Auth,$state,cognitoService,$scope) {
        var authCtrl = this;
        authCtrl.userLogin = {
            email: '',
            password: ''
        };
        authCtrl.userRegister = {
            email: '',
            password: '',
            name: ''
        };

        authCtrl.userActivate = {
            email: '',
            pin: ''
        };

        authCtrl.login = function (){
            // Auth.$signInWithEmailAndPassword(authCtrl.user.email, authCtrl.user.password).then(function (auth){
            //     $state.go('home');
            // }, function (error){
            //     authCtrl.error = error;
            // });
            Auth.setUserEmail(authCtrl.userLogin.email);
            Auth.getUserPassword(authCtrl.userLogin.password);
            var userPool = cognitoService.getUserPool();

            var cognitoUser = cognitoService.getUser(userPool, authCtrl.userLogin.email);
            var authenticationDetails = cognitoService.getAuthenticationDetails(authCtrl.userLogin.email, authCtrl.userLogin.password);

            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: function (result) {
                    var accessToken = result.getAccessToken().getJwtToken();
                    authCtrl.accessToken = accessToken;

                    var currentUser = userPool.getCurrentUser();
                    console.log(currentUser);

                    $state.go('channels');
                },
                onFailure: function (err) {
                    authCtrl.errorMessage = 'Your email address or password is incorrect.';
                    $scope.$apply();

                }
            });
        };

        authCtrl.register = function (){
            // Auth.$createUserWithEmailAndPassword(authCtrl.user.email, authCtrl.user.password).then(function (user){
            //     $state.go('home');
            //     authCtrl.login();
            // }, function (error){
            //     authCtrl.error = error;
            // });
            Auth.setUserEmail(authCtrl.userRegister.email);
            Auth.getUserPassword(authCtrl.userRegister.password);
            Auth.getUserName(authCtrl.userRegister.name);
            var userPool = cognitoService.getUserPool();
            var attributeList = [];
            var nameParam = {
                Name: 'name',
                Value: authCtrl.userRegister.name
            };

            var emailParam = {
                Name: 'email',
                Value: authCtrl.userRegister.email
            };
            attributeList.push(nameParam);
            attributeList.push(emailParam);


            userPool.signUp(authCtrl.userRegister.email, authCtrl.userRegister.password, attributeList, null, function (err, result) {
                if (err) {
                    console.log(err);
                    authCtrl.errorMessage = err.message;
                    $scope.$apply();
                    return;
                } else {
                    console.log(result);
                    $state.go('activate');
                    $scope.$apply();
                }
            });

            return false;
        };

        authCtrl.activate = function () {
            var userPool = cognitoService.getUserPool();

            var cognitoUser = cognitoService.getUser(userPool, authCtrl.userActivate.email);
            var activationKey = authCtrl.userActivate.pin;

            cognitoUser.confirmRegistration(activationKey, true, function (err, result) {
                if (err) {
                    console.log(err);

                    authCtrl.errorMessage = err.message;
                    return;
                }
                $state.go('channels');
            });
        }
    });