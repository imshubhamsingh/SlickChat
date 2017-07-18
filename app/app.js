'use strict';

angular
  .module('SlickChatApp', [
      'angular-md5',
      'ui.router',
      'ngResource',
      'luegg.directives'
  ])
  .config(function ($stateProvider, $urlRouterProvider,$locationProvider) {
      $locationProvider.html5Mode({
          enabled: true,
          requireBase: false
      });
    $stateProvider
      .state('home', {
          url: '/',
          templateUrl: 'app/home/home.html',
          resolve: {
              requireNoAuth: function($state,cognitoService){
                  var userPool = cognitoService.getUserPool();
                  var currentUser = userPool.getCurrentUser();
                  if(currentUser !== null){
                      $state.go('channels');
                  }
              }
          }
      })
      .state('login', {
          url: '/login',
          controller: 'LoginCtrl as loginCtrl',
          templateUrl: 'app/auth/login/login.html',
          resolve: {
              requireNoAuth: function($state,cognitoService){
                  var userPool = cognitoService.getUserPool();
                  var currentUser = userPool.getCurrentUser();
                  if(currentUser !== null){
                      $state.go('channels.welcome');
                  }
              }
          }
      }).state('register', {
          url: '/register',
          controller: 'RegisterCtrl as registerCtrl',
          templateUrl: 'app/auth/register/register.html',
          resolve: {
               requireNoAuth: function($state,cognitoService){
                   var userPool = cognitoService.getUserPool();
                   var currentUser = userPool.getCurrentUser();
                   if(currentUser !== null){
                       $state.go('channels');
                   }
               }
          }
      }).state('activate', {
        url: '/activate',
        controller: 'ActivateCtrl as activateCtrl',
        templateUrl: 'app/auth/activate/activate.html',
        resolve: {
                requireNoAuth: function($state, cognitoService){
                    var userPool = cognitoService.getUserPool();
                    var currentUser = userPool.getCurrentUser();
                    if(currentUser !== null){
                        $state.go('channels');
                    }
                }
        },
        params: {
            email: null,
            password: null
        }
    }).state('channels', {
        url: '/channels',
        controller: 'ChannelsCtrl as channelsCtrl',
        templateUrl: 'app/channels/channelIndex.html',
        resolve: {
            requireAuth: function($state,cognitoService,$stateParams,$q){
                var params = $stateParams;
                var deferred = $q.defer();
                if(params.activation){
                    var cognitoUser = cognitoService.getUser(params.email);
                    var authenticationDetails = cognitoService.getAuthenticationDetails(params.email, params.password);

                    cognitoUser.authenticateUser(authenticationDetails, {
                        onSuccess: function (result) {
                            deferred.resolve(result);
                        },
                        onFailure: function (err) {
                            //console.log(err);
                        }
                    });
                    return deferred.promise;
                }else{
                    var userPool = cognitoService.getUserPool();
                    var currentUser = userPool.getCurrentUser();
                    if(currentUser === null){
                        $state.go('home');
                    }
                }
            },
            channels: function (socket,$q) {
                var channelsList = [];
                socket.emit('getChannelsList');
                function loadChannels(){
                    var deferred = $q.defer();
                    socket.on('ChannelsListReceived',function (data) {
                        channelsList = data.channelList;
                        deferred.resolve(data);
                    });
                    return deferred.promise;
                }
                 return loadChannels().then(function(data){
                    return data;
                });
            },
            userDetailsAndMessages: function ($state,cognitoService,$q,md5,socket) {

                var details = {
                    userDetails:{}
                };
                var deferred = $q.defer();

                function getUserDetails() {

                    var currentUser = cognitoService.getUserPool().getCurrentUser();
                    function getSession() {
                        var sessioninit = $q.defer();
                        currentUser.getSession(function(err, session) {
                            if (err) {
                               // console.log(err);
                            }
                           // console.log('session validity: ' + session.isValid());
                            sessioninit.resolve(session);
                        });
                        return sessioninit.promise
                    }
                    getSession().then(function () {
                        currentUser.getUserAttributes(function(err, result) {
                            if (err) {
                               // console.log(err);
                                //$state.go('home');
                            }
                            for (var i = 0; i < result.length; i++) {
                                if(result[i].getName() === "name"){
                                    details.userDetails.name = result[i].getValue();
                                    details.userDetails.displayName = details.userDetails.name.split(' ')[0];
                                }
                                if(result[i].getName() === "email"){
                                    details.userDetails.email = result[i].getValue();
                                    details.userDetails.getGravatar = '//www.gravatar.com/avatar/' + md5.createHash(details.userDetails.email) + '?d=retro';
                                }
                            }
                            deferred.resolve(result);
                            socket.emit('init', {
                                name: details.userDetails.displayName,
                                userImage:details.userDetails.getGravatar
                            });
                        });
                    });

                    return deferred.promise;
                }

                return getUserDetails().then(function () {
                    return details
                })
            },
            messages: function (socket, $state,$q) {
                function getUserMessages() {
                    var deferredMessage = $q.defer();
                    socket.on('initMessages', function (data) {
                        deferredMessage.resolve(data);
                    });
                    return deferredMessage.promise;
                }

                       return   getUserMessages().then(function (data) {
                           console.log(data);
                          return {
                              userList: data.userList,
                              userMessages: data.messages
                          };
                      })
           }
        },
        params: {
            email: null,
            password: null,
            activation: false,
            messageType: null,
            channelMessages: []
        }
    }).state('channels.welcome', {
        url: '',
        templateUrl: 'app/channels/home/welcome.html',
        controller: 'ChannelsCtrl as channelsCtrl',
        resolve:  {
            requireAuth: function($state,cognitoService,$stateParams){
                var params = $stateParams;
                if(params.activation){
                    var cognitoUser = cognitoService.getUser(params.email);
                    var authenticationDetails = cognitoService.getAuthenticationDetails(params.email, params.password);

                    cognitoUser.authenticateUser(authenticationDetails, {
                        onSuccess: function (result) {
                            params.activation = false;
                            $state.go('channels.welcome');
                        },
                        onFailure: function (err) {
                            $state.go('home');
                        }
                    });
                }
                var userPool = cognitoService.getUserPool();
                var currentUser = userPool.getCurrentUser();

                if(currentUser === null){
                    $state.go('home');
                }
            }
        }
    });
    $urlRouterProvider.otherwise('/');
  });

