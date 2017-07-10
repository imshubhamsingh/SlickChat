/**
 * Created by shubham on 8/7/17.
 */

angular.module('SlickChatApp')
    .factory('Auth', function(){
        var user = {
            email: null,
            password: null,
            name: null,
            pin: null
        };

        return{
            getUserEmail: function () {
                return user.email
            },
            setUserEmail: function (email) {
                user.email = email;
            },
            getUserPassword: function () {
                return user.password
            },
            setUserPassword: function (password) {
                user.password = password;
            },
            getUserName: function () {
                return user.name
            },
            setUserName: function (name) {
                user.name = name;
            },
            getUserPin: function () {
                return user.pin
            },
            setUserPin: function (pin) {
                user.pin = pin;
            }
        }
    });
