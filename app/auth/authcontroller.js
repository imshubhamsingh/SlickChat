angular.module('SlickChatApp')
.controller('AuthController', function(Auth, $state, cognitoService, $scope){
  var authcontroller = this;


  //register controller stuff
  authcontroller.userRegister = {
    email: '',
    password: '',
    name: ''
  };

  authcontroller.register = function (){
      var userPool = cognitoService.getUserPool();
      var attributeList = [];
      var nameParam = {
          Name: 'name',
          Value: authcontroller.userRegister.name
      };
      var emailParam = {
          Name: 'email',
          Value: authcontroller.userRegister.email
      };
      attributeList.push(nameParam);
      attributeList.push(emailParam);
      userPool.signUp(authcontroller.userRegister.email, authcontroller.userRegister.password, attributeList, null, function (err, result) {
          if (err) {
              console.log(err);
              authcontroller.errorMessage = err.message;
              $scope.$apply();
              return;
          } else {
              $state.go('activate',{email:authcontroller.userRegister.email, password:authcontroller.userRegister.password});
          }
      });
  };


  //login controller stuff
  authcontroller.userLogin = {
      email: '',
      password: ''
  };
  authcontroller.login = function (){
      var cognitoUser = cognitoService.getUser(authcontroller.userLogin.email);
      var authenticationDetails = cognitoService.getAuthenticationDetails(authcontroller.userLogin.email, authcontroller.userLogin.password);

      cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: function (result) {
              var accessToken = result.getAccessToken().getJwtToken();
              authcontroller.accessToken = accessToken;
              $state.go('channels.welcome');
          },
          onFailure: function (err) {
              authcontroller.errorMessage = 'Your email address or password is incorrect.';
              $scope.$apply();
          }
      });
  };


});
