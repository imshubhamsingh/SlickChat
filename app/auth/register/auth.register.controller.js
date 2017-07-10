/**
 * Created by shubham on 10/7/17.
 */

angular.module('ChitChatApp')
    .controller('RegisterCtrl', function (Auth,$state,cognitoService,$scope) {
        var registerCtrl = this;
        registerCtrl.userRegister = {
            email: '',
            password: '',
            name: ''
        };


        registerCtrl.register = function (){
            var userPool = cognitoService.getUserPool();
            var attributeList = [];
            var nameParam = {
                Name: 'name',
                Value: registerCtrl.userRegister.name
            };
            var emailParam = {
                Name: 'email',
                Value: registerCtrl.userRegister.email
            };
            attributeList.push(nameParam);
            attributeList.push(emailParam);
            userPool.signUp(registerCtrl.userRegister.email, registerCtrl.userRegister.password, attributeList, null, function (err, result) {
                if (err) {
                    console.log(err);
                    registerCtrl.errorMessage = err.message;
                    $scope.$apply();
                    return;
                } else {
                    $state.go('activate');
                }
            });
        };
    });