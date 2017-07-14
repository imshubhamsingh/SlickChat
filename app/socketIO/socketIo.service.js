/**
 * Created by shubham on 12/7/17.
 */


angular.module('SlickChatApp')
    .factory('socket', function ($rootScope,$q,$timeout) {
        var socket = io.connect();
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });
                })
            },
            // emitPromise: function(command, data) {
            //
            //     var deferred = $q.defer();
            //     $timeout(function() {
            //         socket.emit(command, data, function( response ) {
            //
            //             if( typeof response === "object" ) {
            //
            //                 if( response.success === true ) {
            //
            //                     deferred.resolve(response.data);
            //
            //                 } else {
            //                     if( typeof response.message === "string" ) {
            //                         deferred.reject( response.message );
            //                     } else {
            //                         deferred.reject( "The request was not successful." )
            //                     }
            //                 }
            //             } else {
            //
            //                 deferred.reject( "The response to your request could not be parsed." );
            //             }
            //
            //         });
            //     }, 0);
            //
            //     return deferred.promise;
            // }
        };
    });