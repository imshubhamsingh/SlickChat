/**
 * Created by shubham on 9/7/17.
 */

angular.module('SlickChatApp')
    .service('cognitoService', function () {
        var aws  = this;
    this.getUserPool = function () {
        var poolData = {
            UserPoolId: 'us-east-2_CZJVWbjFC',
            ClientId: '7mak4fp7mkq8f4tkngppoq2igq'
        };
        var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);
        return userPool;
    };

    this.getUser = function (username) {
        var userData = {
            Username: username,
            Pool: aws.getUserPool()
        };
        var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

        return cognitoUser;
    };

    this.getAuthenticationDetails = function (username, password) {
        var authenticationData = {
            Username: username,
            Password: password
        };
        var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
        return authenticationDetails;
    };

    this.getUserAttributes = function () {
        var attributes = [];
        for (var i = 0; i < arguments.length; i++) {
            var attr = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(arguments[i]);
            attributes.push(attr);
        }
        return attributes;
    };

});